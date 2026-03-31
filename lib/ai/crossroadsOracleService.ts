/**
 * Crossroads Oracle™ — Dasha + transits + theme → Gemini reading, KV-cached per Antardasha.
 */

import type { BirthProfile } from "@prisma/client";
import type { VedicChartCalculations } from "openastrology-library";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { kvGet, kvSet } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import {
  getCurrentAntardasha,
  getCurrentDasha,
  monthsRemaining,
  yearsRemaining,
} from "@/lib/astro/dashaService";
import { getOrCreateTodayTransits, getOrCreateVedicChart } from "@/lib/astro/chartService";
import { buildOraclePrompt } from "@/lib/ai/prompts/oraclePrompts";
import {
  extractOracleLooseFields,
  parseModelJsonObject,
} from "@/lib/ai/parseModelJsonObject";
import type { OracleContext, OracleReading, OracleTheme } from "@/types/oracle";

let _gemini: GoogleGenAI | null = null;
function gemini(): GoogleGenAI {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_NOT_CONFIGURED");
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return _gemini;
}

const ORACLE_RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    cosmicContext: { type: "string" },
    psychologicalPattern: { type: "string" },
    whyNow: { type: "string" },
    concreteSteps: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ["cosmicContext", "psychologicalPattern", "whyNow", "concreteSteps"],
} as const;

function capSign(s: string | undefined): string {
  if (!s) return "unknown";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function buildOracleTransitSnapshot(
  transit: VedicChartCalculations
): OracleContext["transits"] {
  const moonSign = capSign(transit.planets?.moon?.sign);
  const sunSign = capSign(transit.planets?.sun?.sign);
  const retrogradePlanets: string[] = [];
  const keys = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "rahu", "ketu"] as const;
  for (const k of keys) {
    const p = transit.planets?.[k];
    if (p?.isRetrograde) retrogradePlanets.push(capSign(k));
  }
  const jp = transit.planets?.jupiter;
  const sp = transit.planets?.saturn;
  const bits: string[] = [];
  if (jp?.sign) {
    bits.push(`Jupiter in ${capSign(jp.sign)}${jp.isRetrograde ? " (R)" : ""}`);
  }
  if (sp?.sign) {
    bits.push(`Saturn in ${capSign(sp.sign)}${sp.isRetrograde ? " (R)" : ""}`);
  }
  const notableTransit =
    bits.length > 0
      ? `${bits.join("; ")} — slow-moving backdrop for commitments and pacing.`
      : `Moon in ${moonSign} and Sun in ${sunSign} anchor mood and vitality this season.`;

  return { moonSign, sunSign, retrogradePlanets, notableTransit };
}

function assertBirthProfileReady(p: BirthProfile | null): asserts p is BirthProfile {
  if (!p) throw new Error("BIRTH_PROFILE_INCOMPLETE");
  if (!p.birthCity?.trim() || !p.birthCountry?.trim()) throw new Error("BIRTH_PROFILE_INCOMPLETE");
}

function formatLocalBirthTime(profile: BirthProfile): string {
  if (!profile.birthTimeKnown || profile.birthHour == null || profile.birthMinute == null) {
    return "12:00";
  }
  return `${String(profile.birthHour).padStart(2, "0")}:${String(profile.birthMinute).padStart(2, "0")}`;
}

function antardashaPlanetOnly(planetName: string): string {
  const parts = planetName.split("/");
  return parts.length >= 2 ? parts[1]!.trim() : planetName.trim();
}

function capPlanetName(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** TTL: time until Antardasha ends, capped at ORACLE_READING_MAX_SECONDS, minimum 60s. */
export function oracleReadingTtlSeconds(antardashaEnd: Date): number {
  const maxS = KV_TTL.ORACLE_READING_MAX_SECONDS;
  const ms = antardashaEnd.getTime() - Date.now();
  const s = Math.floor(ms / 1000);
  return Math.min(maxS, Math.max(60, s));
}

function cacheLabelFromAntardasha(planetName: string): string {
  return planetName.replace(/\//g, "-").replace(/\s+/g, "_");
}

function validateThreeSteps(raw: unknown): readonly [string, string, string] | null {
  if (!Array.isArray(raw) || raw.length < 3) return null;
  const a = typeof raw[0] === "string" ? raw[0].trim() : "";
  const b = typeof raw[1] === "string" ? raw[1].trim() : "";
  const c = typeof raw[2] === "string" ? raw[2].trim() : "";
  if (!a || !b || !c) return null;
  return [a, b, c];
}

function parseOraclePayload(rawText: string): {
  cosmicContext: string;
  psychologicalPattern: string;
  whyNow: string;
  concreteSteps: readonly [string, string, string];
} | null {
  const parsed = parseModelJsonObject(rawText);
  let obj: Record<string, unknown> | null = null;
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    obj = parsed as Record<string, unknown>;
  }
  if (!obj) {
    const loose = extractOracleLooseFields(rawText);
    if (!loose) return null;
    const t = validateThreeSteps(loose.concreteSteps);
    if (!t) return null;
    return {
      cosmicContext: loose.cosmicContext.trim(),
      psychologicalPattern: loose.psychologicalPattern.trim(),
      whyNow: loose.whyNow.trim(),
      concreteSteps: t,
    };
  }
  const cosmicContext = typeof obj.cosmicContext === "string" ? obj.cosmicContext.trim() : "";
  const psychologicalPattern =
    typeof obj.psychologicalPattern === "string" ? obj.psychologicalPattern.trim() : "";
  const whyNow = typeof obj.whyNow === "string" ? obj.whyNow.trim() : "";
  const steps = validateThreeSteps(obj.concreteSteps);
  if (!cosmicContext || !psychologicalPattern || !whyNow || !steps) return null;
  return { cosmicContext, psychologicalPattern, whyNow, concreteSteps: steps };
}

async function generateOracleOnce(prompt: string): Promise<string> {
  let result: { text?: string };
  try {
    result = await gemini().models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: ORACLE_RESPONSE_JSON_SCHEMA,
        temperature: 0.85,
        maxOutputTokens: 4096,
      },
    });
  } catch (schemaErr) {
    console.warn(
      "[crossroadsOracle] generateContent with responseJsonSchema failed, retrying without schema:",
      schemaErr
    );
    result = await gemini().models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.85,
        maxOutputTokens: 4096,
      },
    });
  }
  const text = result.text;
  if (!text?.trim()) throw new Error("ORACLE_EMPTY_RESPONSE");
  return text;
}

export async function getCrossroadsOracleReading(
  userId: string,
  theme: OracleTheme,
  force?: boolean
): Promise<OracleReading> {
  const profile = await db.birthProfile.findUnique({ where: { userId } });
  assertBirthProfileReady(profile);

  const [maha, antar] = await Promise.all([
    getCurrentDasha(userId),
    getCurrentAntardasha(userId),
  ]);
  if (!maha || !antar) {
    throw new Error("DASHA_NOT_READY");
  }

  await getOrCreateVedicChart(userId, profile);
  const transit = await getOrCreateTodayTransits(userId, profile);

  const mahaPlanet = capPlanetName(maha.planetName);
  const antarLabel = antar.planetName;
  const antarPlanet = capPlanetName(antardashaPlanetOnly(antarLabel));

  const ctx: OracleContext = {
    userId,
    birthProfile: {
      dateOfBirth: profile.birthDate.toISOString().slice(0, 10),
      timeOfBirth: formatLocalBirthTime(profile),
      placeOfBirth: `${profile.birthCity.trim()}, ${profile.birthCountry.trim()}`,
      gender: profile.gender?.trim() || "unspecified",
    },
    mahadasha: {
      planet: mahaPlanet,
      startDate: maha.startDate.toISOString(),
      endDate: maha.endDate.toISOString(),
      yearsRemaining: yearsRemaining(maha.endDate),
    },
    antardasha: {
      label: antarLabel,
      planet: antarPlanet,
      startDate: antar.startDate.toISOString(),
      endDate: antar.endDate.toISOString(),
      monthsRemaining: monthsRemaining(antar.endDate),
    },
    transits: buildOracleTransitSnapshot(transit),
    theme,
  };

  const cacheKey = kvKeys.oracleReading(userId, theme, cacheLabelFromAntardasha(antarLabel));

  if (!force) {
    const cached = await kvGet<OracleReading>(cacheKey);
    if (cached && Array.isArray(cached.concreteSteps) && cached.concreteSteps.length === 3) {
      return {
        ...cached,
        concreteSteps: cached.concreteSteps as readonly [string, string, string],
        cacheKey,
      };
    }
  }

  const prompt = buildOraclePrompt(ctx);
  const ttl = oracleReadingTtlSeconds(antar.endDate);

  let payload: ReturnType<typeof parseOraclePayload> = null;
  for (let attempt = 0; attempt < 2 && !payload; attempt++) {
    const raw = await generateOracleOnce(prompt);
    payload = parseOraclePayload(raw);
  }
  if (!payload) {
    throw new Error("ORACLE_PARSE_FAILED");
  }

  const dashaLabel = `${mahaPlanet} Mahadasha · ${antarPlanet} Antardasha`;
  const reading: OracleReading = {
    theme,
    cosmicContext: payload.cosmicContext,
    psychologicalPattern: payload.psychologicalPattern,
    whyNow: payload.whyNow,
    concreteSteps: payload.concreteSteps,
    dashaLabel,
    generatedAt: new Date().toISOString(),
    cacheKey,
  };

  await kvSet(cacheKey, reading, ttl);
  return reading;
}

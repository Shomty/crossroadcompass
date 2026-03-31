/**
 * Gemini interpretation for Today's Moon — KV-cached per user per local calendar day.
 */

import type { BirthProfile } from "@prisma/client";
import type { VedicChartCalculations } from "openastrology-library";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { kvGet, kvSet } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import {
  buildDailyMoonJudgment,
  formatLocalCalendarDateYmd,
  type LunarPhaseEnergy,
} from "@/lib/astro/dailyMoonJudgment";
import {
  buildTodayMoonFacts,
  todayMoonFactsToPromptJson,
} from "@/lib/astro/todayMoonFacts";
import { getChartCurrentDasha } from "@/lib/astro/chartService";
import { getOrCreateAshtakavarga } from "@/lib/astro/muhurta/ashtakavargaCalculator";
import { extractMuhurtaChartInput } from "@/lib/astro/muhurta/chartInput";
import { buildTodayMoonPrompt } from "@/lib/content/promptBuilder";
import {
  extractTodayMoonLooseFields,
  parseModelJsonObject,
} from "@/lib/ai/parseModelJsonObject";
import type { SignNumber } from "@/types";

/** Constrains Gemini JSON so string fields cannot break parsing with raw quotes. */
const TODAY_MOON_RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string", description: "Short title for the day Moon theme" },
    body: { type: "string", description: "Main interpretation" },
    daytimeFocus: { type: "string", description: "One lean-in line" },
    caution: { type: "string", description: "One pacing line or empty" },
    toneTags: {
      type: "array",
      items: { type: "string" },
      description: "2-4 mood labels",
    },
  },
  required: ["headline", "body", "daytimeFocus", "caution", "toneTags"],
} as const;

let _gemini: GoogleGenAI | null = null;
function gemini(): GoogleGenAI {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return _gemini;
}

const SIGN_TO_NUMBER: Record<string, SignNumber> = {
  aries: 1,
  taurus: 2,
  gemini: 3,
  cancer: 4,
  leo: 5,
  virgo: 6,
  libra: 7,
  scorpio: 8,
  sagittarius: 9,
  capricorn: 10,
  aquarius: 11,
  pisces: 12,
};

function transitMoonSignNumber(
  transit: VedicChartCalculations
): SignNumber | null {
  const m = transit.planets?.moon;
  if (!m) return null;
  const fromSign = SIGN_TO_NUMBER[(m.sign ?? "").toLowerCase()];
  if (fromSign) return fromSign;
  if (typeof m.longitude === "number" && Number.isFinite(m.longitude)) {
    const x = ((m.longitude % 360) + 360) % 360;
    const n = Math.floor(x / 30) + 1;
    if (n >= 1 && n <= 12) return n as SignNumber;
  }
  return null;
}

export interface TodayMoonInterpretationResult {
  headline: string;
  body: string;
  daytimeFocus: string;
  caution: string;
  toneTags: string[];
  source: "ai" | "deterministic";
  generatedAt: string;
  phaseEnergy: LunarPhaseEnergy;
  houseFromChandra: number;
}

interface TodayMoonKvPayload {
  headline: string;
  body: string;
  daytimeFocus: string;
  caution: string;
  toneTags: string[];
  generatedAt: string;
  phaseEnergy: LunarPhaseEnergy;
  houseFromChandra: number;
}

function deterministicResult(
  natal: VedicChartCalculations,
  transit: VedicChartCalculations
): TodayMoonInterpretationResult | null {
  const j = buildDailyMoonJudgment(natal, transit);
  if (!j) return null;
  return {
    headline: j.headline,
    body: j.body,
    daytimeFocus: "",
    caution: "",
    toneTags: [],
    source: "deterministic",
    generatedAt: new Date().toISOString(),
    phaseEnergy: j.phaseEnergy,
    houseFromChandra: j.houseFromMoon,
  };
}

function buildFallbackUserPrompt(
  userName: string,
  factsJson: string,
  todayLabel: string,
  timeZone: string
): string {
  return `You are a Vedic astrologer (Parāśara / Gochara). Interpret TODAY'S MOON for the native using ONLY the structured facts below. Explain how the lunar tone may show up during their day (mood, relationships, work rhythm, rest). Tie in tithi, nakṣatra-from-facts, house-from-Chandra, and Mahādaśā/Antardaśā when relevant. Mention Samudāya Aṣṭakavarga rekhas in the transit Moon sign only if provided (not null).

Tone: warm, practical, non-alarmist. No medical or legal claims. No "free tier" language.

Native display name: ${userName}
Local date: ${todayLabel}
Timezone: ${timeZone}

FACTS (JSON):
${factsJson}

Return ONLY valid JSON (no markdown fences). Do not use double quotation marks inside any string value; use single quotes for emphasis if needed.
{
  "headline": "short title, 6-12 words, poetic but clear",
  "body": "2-4 sentences; main interpretation for the day",
  "daytimeFocus": "one sentence on what to lean into today",
  "caution": "one gentle sentence on what to soften or pace (or empty string if nothing notable)",
  "toneTags": ["2-4 short labels e.g. Reflective, Social, Nesting"]
}`;
}

export async function getCachedTodayMoonInterpretation(
  userId: string,
  timeZone: string
): Promise<TodayMoonKvPayload | null> {
  const ymd = formatLocalCalendarDateYmd(timeZone);
  return kvGet<TodayMoonKvPayload>(kvKeys.todayMoonReading(userId, ymd));
}

/**
 * KV hit → AI payload. On miss, calls Gemini once; on failure or missing API key, deterministic copy.
 */
export async function getOrGenerateTodayMoonInterpretation(
  userId: string,
  profile: BirthProfile,
  natal: VedicChartCalculations,
  transit: VedicChartCalculations,
  userName: string
): Promise<TodayMoonInterpretationResult | null> {
  const localYmd = formatLocalCalendarDateYmd(profile.timezone);
  const cacheKey = kvKeys.todayMoonReading(userId, localYmd);

  const cached = await kvGet<TodayMoonKvPayload>(cacheKey);
  if (cached) {
    return { ...cached, source: "ai" };
  }

  const det = deterministicResult(natal, transit);
  if (!det) return null;

  const { mahaDasha, antarDasha } = getChartCurrentDasha(natal);
  const dashaMaha = mahaDasha?.planet != null ? String(mahaDasha.planet) : null;
  const dashaAntar = antarDasha?.planet != null ? String(antarDasha.planet) : null;

  let samudayaRekhas: number | null = null;
  try {
    const input = extractMuhurtaChartInput(natal);
    if (input) {
      const av = await getOrCreateAshtakavarga(userId, input.planets, input.lagnaSignNumber);
      const sn = transitMoonSignNumber(transit);
      if (sn != null) samudayaRekhas = av.rekhasBySign[sn] ?? null;
    }
  } catch {
    /* optional */
  }

  const facts = buildTodayMoonFacts(natal, transit, profile.timezone, localYmd, {
    dashaMahadasha: dashaMaha,
    dashaAntardasha: dashaAntar,
    samudayaRekhasInTransitMoonRasi: samudayaRekhas,
  });
  if (!facts) return det;

  const factsJson = todayMoonFactsToPromptJson(facts);
  const todayLabel = new Intl.DateTimeFormat("en-GB", {
    timeZone: profile.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  if (!env.GEMINI_API_KEY) {
    return det;
  }

  try {
    const userPrompt = await buildTodayMoonPrompt(
      {
        userName,
        today: todayLabel,
        localYmd,
        timezone: profile.timezone,
        factsJson,
      },
      () => buildFallbackUserPrompt(userName, factsJson, todayLabel, profile.timezone)
    );

    let result: { text?: string };
    try {
      result = await gemini().models.generateContent({
        model: env.GEMINI_MODEL,
        contents: userPrompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: TODAY_MOON_RESPONSE_JSON_SCHEMA,
          temperature: 0.75,
          maxOutputTokens: 2048,
        },
      });
    } catch (schemaErr) {
      console.warn(
        "[todayMoonInterpretation] generateContent with responseJsonSchema failed, retrying without schema:",
        schemaErr
      );
      result = await gemini().models.generateContent({
        model: env.GEMINI_MODEL,
        contents: userPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.75,
          maxOutputTokens: 2048,
        },
      });
    }

    const raw = result.text;
    if (!raw) throw new Error("empty response");

    let parsedUnknown: unknown = parseModelJsonObject(raw);
    if (
      parsedUnknown === null ||
      typeof parsedUnknown !== "object" ||
      Array.isArray(parsedUnknown)
    ) {
      const loose = extractTodayMoonLooseFields(raw);
      if (loose) parsedUnknown = loose;
    } else {
      const o = parsedUnknown as { headline?: unknown; body?: unknown };
      const h = typeof o.headline === "string" ? o.headline.trim() : "";
      const b = typeof o.body === "string" ? o.body.trim() : "";
      if (!h || !b) {
        const loose = extractTodayMoonLooseFields(raw);
        if (loose) parsedUnknown = loose;
      }
    }
    if (
      !parsedUnknown ||
      typeof parsedUnknown !== "object" ||
      parsedUnknown === null ||
      Array.isArray(parsedUnknown)
    ) {
      console.warn(
        "[todayMoonInterpretation] unparseable model output (sample):",
        raw.length > 500 ? `${raw.slice(0, 500)}…` : raw
      );
      throw new Error("could not parse model JSON");
    }
    const parsed = parsedUnknown as {
      headline?: string;
      body?: string;
      daytimeFocus?: string;
      caution?: string;
      toneTags?: unknown;
    };

    const headline = typeof parsed.headline === "string" ? parsed.headline.trim() : "";
    const body = typeof parsed.body === "string" ? parsed.body.trim() : "";
    if (!headline || !body) throw new Error("invalid AI shape");

    const daytimeFocus =
      typeof parsed.daytimeFocus === "string" ? parsed.daytimeFocus.trim() : "";
    const caution = typeof parsed.caution === "string" ? parsed.caution.trim() : "";
    const toneTags = Array.isArray(parsed.toneTags)
      ? parsed.toneTags.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      : [];

    const payload: TodayMoonKvPayload = {
      headline,
      body,
      daytimeFocus,
      caution,
      toneTags,
      generatedAt: new Date().toISOString(),
      phaseEnergy: facts.lunarPhaseEnergy,
      houseFromChandra: facts.houseFromChandra,
    };

    await kvSet(cacheKey, payload, KV_TTL.TRANSIT_SECONDS);
    return { ...payload, source: "ai" };
  } catch (err) {
    console.error("[todayMoonInterpretation]", err);
    return det;
  }
}

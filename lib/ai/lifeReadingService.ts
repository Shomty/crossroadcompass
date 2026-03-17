/**
 * lib/ai/lifeReadingService.ts
 * VIP life readings: Career, Love, Health.
 * Prompts are in lib/ai/prompts/lifeReadingPrompts.ts — edit there to tune output.
 *
 * Caching: Insight table with type CAREER | LOVE | HEALTH.
 * periodDate is fixed to EPOCH (2000-01-01) — one reading per user per type, no expiry.
 * Use force=true (via the API) to regenerate.
 */

import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { getOrCreateHDChart, getOrCreateVedicChart } from "@/lib/astro/chartService";
import {
  buildCareerPrompt,
  buildLovePrompt,
  buildHealthPrompt,
  type LifeReadingCtx,
} from "@/lib/ai/prompts/lifeReadingPrompts";
import { InsightType, type BirthProfile } from "@prisma/client";
import type { VedicChart } from "@/lib/astro/types";
import type { VedicPlanet } from "@/lib/astro/types";

// ─── Gemini singleton ─────────────────────────────────────────────────────────

let _gemini: GoogleGenAI | null = null;
function gemini() {
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY ?? "" });
  return _gemini;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type LifeReadingType = "career" | "love" | "health";

export interface LifeReading {
  headline: string;
  overview: string;
  keyThemes: string[];
  guidance: string;
  generatedAt: string;
}

// Fixed period date — acts as a "no expiry" key per user per type
const EPOCH = new Date("2000-01-01T00:00:00.000Z");

// Map our string type to Prisma InsightType enum values
const TYPE_MAP: Record<LifeReadingType, InsightType> = {
  career: InsightType.CAREER,
  love:   InsightType.LOVE,
  health: InsightType.HEALTH,
};

// ─── Cache helpers ────────────────────────────────────────────────────────────

export async function getLifeReading(
  userId: string,
  type: LifeReadingType
): Promise<LifeReading | null> {
  const row = await db.insight.findUnique({
    where: {
      userId_type_periodDate: {
        userId,
        type: TYPE_MAP[type],
        periodDate: EPOCH,
      },
    },
  });
  if (!row) return null;
  try {
    return JSON.parse(row.content as string) as LifeReading;
  } catch {
    return null;
  }
}

// ─── Context builder ──────────────────────────────────────────────────────────

function formatPlanets(planets: VedicPlanet[] | undefined): string {
  if (!planets?.length) return "not available";
  return planets
    .map((p) => `${p.name}(${p.sign ?? "?"}/${p.house ?? "?"}H)${p.isRetrograde ? "R" : ""}`)
    .join(" · ");
}

async function buildCtx(
  userId: string,
  profile: BirthProfile
): Promise<LifeReadingCtx> {
  const now = new Date();

  // HD chart (always available — local calculation)
  const hd = await getOrCreateHDChart(userId, profile);

  // Vedic chart (API, 3-layer cached)
  let vedicChart: VedicChart | null = null;
  try {
    const raw = await getOrCreateVedicChart(userId, profile);
    vedicChart = raw as unknown as VedicChart;
  } catch {
    // proceed without Vedic data — prompts will note "not available"
  }

  const d1 = vedicChart?.rawResponse?.chartD1;
  const d9 = vedicChart?.rawResponse?.chartD9;
  const d10 = vedicChart?.rawResponse?.chartD10;

  // Active dasha
  const [maha, antar] = await Promise.all([
    db.dasha.findFirst({
      where: { userId, level: "MAHADASHA", startDate: { lte: now }, endDate: { gte: now } },
    }),
    db.dasha.findFirst({
      where: { userId, level: "ANTARDASHA", startDate: { lte: now }, endDate: { gte: now } },
    }),
  ]);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const dasha = maha
    ? `${capitalize(maha.planetName)} Mahadasha${antar ? ` / ${capitalize(antar.planetName.split("/")[1] ?? antar.planetName)} Antardasha` : ""}`
    : "not available";

  return {
    name:        profile.birthName.split(" ")[0],
    hdType:      hd.type,
    hdAuthority: hd.authority,
    hdProfile:   hd.profile,
    hdCenters:   hd.definedCenters.join(", ") || "none",
    d1Planets:   formatPlanets(d1?.planets),
    d9Summary:   formatPlanets(d9?.planets),
    d10Summary:  formatPlanets(d10?.planets),
    dasha,
  };
}

// ─── Generation ───────────────────────────────────────────────────────────────

export async function generateLifeReading(
  userId: string,
  type: LifeReadingType,
  profile: BirthProfile
): Promise<LifeReading> {
  const ctx = await buildCtx(userId, profile);

  const prompt =
    type === "career" ? buildCareerPrompt(ctx) :
    type === "love"   ? buildLovePrompt(ctx) :
                        buildHealthPrompt(ctx);

  const result = await gemini().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { temperature: 0.75, maxOutputTokens: 8192 },
  });

  const raw = result.text;
  if (!raw) throw new Error("Gemini returned empty response");

  // Strip optional markdown fences
  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const parsed = JSON.parse(clean) as Omit<LifeReading, "generatedAt">;

  // Validate expected keys
  if (!parsed.headline || !parsed.overview || !Array.isArray(parsed.keyThemes) || !parsed.guidance) {
    throw new Error("Gemini response missing required fields");
  }

  const reading: LifeReading = { ...parsed, generatedAt: new Date().toISOString() };

  await db.insight.upsert({
    where: {
      userId_type_periodDate: { userId, type: TYPE_MAP[type], periodDate: EPOCH },
    },
    create: {
      userId,
      type: TYPE_MAP[type],
      periodDate: EPOCH,
      content: JSON.stringify(reading),
      reviewedByConsultant: false,
    },
    update: {
      content: JSON.stringify(reading),
      generatedAt: new Date(),
    },
  });

  return reading;
}

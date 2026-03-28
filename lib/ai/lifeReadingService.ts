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
import { getOrCreateHDChart, getOrCreateVedicChart, getOrCreateDivisionalCharts } from "@/lib/astro/chartService";
import { buildLifeReadingPrompt } from "@/lib/content/promptBuilder";
import type { LifeReadingCtx } from "@/lib/ai/prompts/lifeReadingPrompts";
import { InsightType, type BirthProfile } from "@prisma/client";
import type { VedicChartCalculations } from "openastrology-library";

// ─── Gemini singleton ─────────────────────────────────────────────────────────

let _gemini: GoogleGenAI | null = null;
function gemini() {
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY ?? "" });
  return _gemini;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type LifeReadingType = "career" | "love" | "health" | "jyotish";

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
  career:  InsightType.CAREER,
  love:    InsightType.LOVE,
  health:  InsightType.HEALTH,
  jyotish: InsightType.JYOTISH,
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

function formatVedicPlanets(planets: VedicChartCalculations['planets'] | undefined): string {
  if (!planets) return 'not available'
  return Object.entries(planets)
    .map(([name, p]) => `${name}(${p.sign ?? '?'}/${p.house ?? '?'}H)${p.isRetrograde ? 'R' : ''}`)
    .join(' · ')
}

async function buildCtx(
  userId: string,
  profile: BirthProfile
): Promise<LifeReadingCtx> {
  const now = new Date();

  // HD chart (always available — local calculation)
  const hd = await getOrCreateHDChart(userId, profile);

  // Vedic chart (3-layer cached, local calculation)
  let chart: VedicChartCalculations | null = null;
  try {
    chart = await getOrCreateVedicChart(userId, profile);
  } catch {
    // proceed without Vedic data — prompts will note "not available"
  }

  // Divisional charts for D9 (Navamsa) and D10 (Dasamsa)
  let d9Planets: VedicChartCalculations['planets'] | undefined
  let d10Planets: VedicChartCalculations['planets'] | undefined
  if (chart) {
    try {
      const divisional = await getOrCreateDivisionalCharts(userId, profile)
      if (divisional['D9']) d9Planets = (divisional['D9'] as VedicChartCalculations).planets
      if (divisional['D10']) d10Planets = (divisional['D10'] as VedicChartCalculations).planets
    } catch {
      // proceed without divisional charts
    }
  }

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
    d1Planets:   formatVedicPlanets(chart?.planets),
    d9Summary:   formatVedicPlanets(d9Planets),
    d10Summary:  formatVedicPlanets(d10Planets),
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

  const { prompt, systemInstruction } = await buildLifeReadingPrompt(type, ctx);

  // Jyotish readings use a high thinking budget
  const isJyotish = type === "jyotish";

  const result = await gemini().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      ...(systemInstruction && { systemInstruction }),
      ...(isJyotish && { thinkingConfig: { thinkingBudget: 8192 } }),
      temperature: 0.75,
      maxOutputTokens: 8192,
    },
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

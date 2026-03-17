/**
 * lib/ai/hdAttributeService.ts
 * Generates a brief personalised Human Design attribute insight using Gemini.
 * Results are cached in BirthProfile.hdInsights (JSON string) so Gemini is
 * only called once per attribute per user — subsequent requests return the
 * cached value instantly.
 */

import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { db } from "@/lib/db";

let _gemini: GoogleGenAI | null = null;
function gemini() {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return _gemini;
}

export type HDAttributeKey = "type" | "strategy" | "authority" | "profile";

export interface HDAttributeInsight {
  headline: string;
  body: string;
  practicalTip: string;
}

type HDInsightsCache = Partial<Record<HDAttributeKey, HDAttributeInsight>>;

interface HDAttributeInsightParams {
  userId: string;
  attribute: HDAttributeKey;
  value: string;
  fullChart?: {
    type?: string | null;
    strategy?: string | null;
    authority?: string | null;
    profile?: string | null;
  };
  userName?: string | null;
}

// ── DB cache helpers ──────────────────────────────────────────────────────────

async function readCache(userId: string): Promise<HDInsightsCache> {
  const row = await db.birthProfile.findUnique({
    where: { userId },
    select: { hdInsights: true },
  });
  if (!row?.hdInsights) return {};
  try {
    return JSON.parse(row.hdInsights) as HDInsightsCache;
  } catch {
    return {};
  }
}

async function writeCache(userId: string, cache: HDInsightsCache): Promise<void> {
  await db.birthProfile.update({
    where: { userId },
    data: { hdInsights: JSON.stringify(cache) },
  });
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateHDAttributeInsight(
  params: HDAttributeInsightParams
): Promise<HDAttributeInsight> {
  const { userId, attribute, value, fullChart, userName } = params;

  // 1. Return from cache if available
  const cache = await readCache(userId);
  if (cache[attribute]) return cache[attribute]!;

  // 2. Generate via Gemini
  const name = userName ?? "the user";
  const chartContext = fullChart
    ? `type=${fullChart.type ?? "unknown"}, strategy=${fullChart.strategy ?? "unknown"}, authority=${fullChart.authority ?? "unknown"}, profile=${fullChart.profile ?? "unknown"}`
    : "";

  const prompt = `You are a Human Design guide. ${name}'s ${attribute} is "${value}"${chartContext ? ` (full chart: ${chartContext})` : ""}.
Write a brief personalised explanation (2-3 sentences) of what this means in practice for this person.
Rules: warm and practical tone, no "you will" predictions, grounded in how this actually shows up day-to-day.
Return ONLY valid JSON: {"headline":"one short phrase","body":"2-3 sentences","practicalTip":"one concrete action sentence"}`;

  const result = await gemini().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { temperature: 0.75, maxOutputTokens: 2048 },
  });

  const raw = result.text;
  if (!raw) throw new Error("Gemini returned empty response");

  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const insight = JSON.parse(clean) as HDAttributeInsight;

  // 3. Persist to cache
  const updated = { ...cache, [attribute]: insight };
  await writeCache(userId, updated);

  return insight;
}

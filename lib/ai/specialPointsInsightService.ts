// STATUS: done | Task SP.16
/**
 * lib/ai/specialPointsInsightService.ts
 * Generates AI explanations for each Vedic special point in the native's chart.
 * One batch Gemini call returns all 12 paragraphs (4 lagnas + 8 charakarakas).
 *
 * Caching strategy (matches lifeReadingService pattern):
 *   Layer 1: KV hot cache — instant, avoids DB round-trip
 *   Layer 2: DB Insight table — durable store, survives KV eviction
 *   Layer 3: Gemini — generate on true miss, write to both KV and DB
 */

import { GoogleGenAI } from "@google/genai";
import { InsightType } from "@prisma/client";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { kvGet, kvSet } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import type { SpecialPointsResult, SpecialPointsInsights } from "@/types";

const EPOCH = new Date("2000-01-01T00:00:00.000Z");

// ─── Gemini singleton ────────────────────────────────────────────────────────

let _gemini: GoogleGenAI | null = null;
function gemini() {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return _gemini;
}

// ─── Sign name lookup ────────────────────────────────────────────────────────

const SIGN_NAMES: Record<number, string> = {
  1: "Aries", 2: "Taurus", 3: "Gemini", 4: "Cancer",
  5: "Leo", 6: "Virgo", 7: "Libra", 8: "Scorpio",
  9: "Sagittarius", 10: "Capricorn", 11: "Aquarius", 12: "Pisces",
};

// ─── Prompt builder ──────────────────────────────────────────────────────────

function buildPrompt(points: SpecialPointsResult, userName: string): string {
  const { arudhaLagna, ghatiLagna, horaLagna, bhavaLagna, charakarakas } = points;

  const alSign = SIGN_NAMES[arudhaLagna.arudhaSignNumber] ?? "unknown";
  const glSign = SIGN_NAMES[ghatiLagna.ghatiLagnaSignNumber] ?? "unknown";
  const glDeg  = Math.floor(ghatiLagna.ghatiLagnaDegree);
  const hlSign = SIGN_NAMES[horaLagna.horaLagnaSignNumber] ?? "unknown";
  const hlDeg  = Math.floor(horaLagna.horaLagnaDegree);
  const blSign = SIGN_NAMES[bhavaLagna.bhavaLagnaSignNumber] ?? "unknown";
  const blDeg  = Math.floor(bhavaLagna.bhavaLagnaDegree);

  const karakaLines = charakarakas.karakas
    .map(k => `- ${k.rank} (${k.rank === "Atmakaraka" ? "AK — Soul's core lesson" :
      k.rank === "Amatyakaraka" ? "AmK — career, counsel" :
      k.rank === "Bhratrukaraka" ? "BK — siblings" :
      k.rank === "Matrukaraka" ? "MK — mother" :
      k.rank === "Pitrukaraka" ? "PiK — father" :
      k.rank === "Putrakaraka" ? "PK — children, creativity" :
      k.rank === "Gnatikaraka" ? "GK — kinsmen, obstacles" :
      "DK — spouse, partnerships"}): ${k.planet}`)
    .join("\n");

  const deficitNote = charakarakas.deficit
    ? `\nNote: ${charakarakas.deficit.missingRank} is represented by the Sthira Karaka ${charakarakas.deficit.sthiraKaraka} due to a shared-rank tie.`
    : "";

  return `You are a Jyotish (Vedic astrology, Parasara system) consultant. Write a warm, practical paragraph for each of the following points in ${userName}'s natal chart.

Rules:
- Use "tends to", "may", "often finds" — never "you will"
- Define each astrological term on first use in parentheses
- End each paragraph with one practical implication or action
- Maximum 3 sentences per paragraph
- Warm, grounded, specific — no mystical or alarmist framing

SPECIAL LAGNAS:
- AL (Arudha Lagna — worldly image and how others perceive you): ${alSign}
- GL (Ghati Lagna — power, authority, and ambition): ${glSign} at ${glDeg}°
- HL (Hora Lagna — wealth and finances): ${hlSign} at ${hlDeg}°
- BL (Bhava Lagna — physical circumstances and environment): ${blSign} at ${blDeg}°

CHARAKARAKAS (soul-role assignments by highest degree in sign):
${karakaLines}${deficitNote}

Return ONLY valid JSON (no markdown fences):
{
  "lagnas": {
    "AL": "paragraph about Arudha Lagna...",
    "GL": "paragraph about Ghati Lagna...",
    "HL": "paragraph about Hora Lagna...",
    "BL": "paragraph about Bhava Lagna..."
  },
  "charakarakas": {
    "Atmakaraka": "paragraph...",
    "Amatyakaraka": "paragraph...",
    "Bhratrukaraka": "paragraph...",
    "Matrukaraka": "paragraph...",
    "Pitrukaraka": "paragraph...",
    "Putrakaraka": "paragraph...",
    "Gnatikaraka": "paragraph...",
    "Darakaraka": "paragraph..."
  }
}`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getOrCreateSpecialPointsInsights(
  userId: string,
  specialPoints: SpecialPointsResult,
  userName: string
): Promise<SpecialPointsInsights> {
  const cacheKey = kvKeys.specialPointsInsights(userId);

  // Layer 1: KV hot cache
  const kvCached = await kvGet<SpecialPointsInsights>(cacheKey);
  if (kvCached) return kvCached;

  // Layer 2: DB durable store
  const row = await db.insight.findUnique({
    where: {
      userId_type_periodDate: {
        userId,
        type: InsightType.SPECIAL_POINTS,
        periodDate: EPOCH,
      },
    },
  });
  if (row) {
    const parsed = JSON.parse(row.content) as SpecialPointsInsights;
    await kvSet(cacheKey, parsed, KV_TTL.SPECIAL_POINTS_INSIGHTS); // backfill KV
    return parsed;
  }

  // Layer 3: Generate via Gemini
  const prompt = buildPrompt(specialPoints, userName);

  const result = await gemini().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.72,
      maxOutputTokens: 4096,
    },
  });

  const raw = result.text;
  if (!raw) throw new Error("Gemini returned empty special points insights");

  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const parsed = JSON.parse(clean) as Omit<SpecialPointsInsights, "generatedAt">;
  const insights: SpecialPointsInsights = { ...parsed, generatedAt: new Date().toISOString() };

  // Write to both DB (durable) and KV (hot cache)
  await db.insight.upsert({
    where: {
      userId_type_periodDate: {
        userId,
        type: InsightType.SPECIAL_POINTS,
        periodDate: EPOCH,
      },
    },
    create: {
      userId,
      type: InsightType.SPECIAL_POINTS,
      periodDate: EPOCH,
      content: JSON.stringify(insights),
    },
    update: {
      content: JSON.stringify(insights),
      generatedAt: new Date(),
    },
  });
  await kvSet(cacheKey, insights, KV_TTL.SPECIAL_POINTS_INSIGHTS);
  return insights;
}

// STATUS: done | Premium Features - Muhurta Finder
/**
 * lib/ai/muhurtaInsightService.ts
 * AI-powered timing recommendations using Gemini.
 * Generates reasoning for timing windows and personalized guidance.
 */

import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import {
  calculateMuhurta,
  type MuhurtaData,
  type IntentionCategory,
  type TimingWindow,
} from "@/lib/astro/muhurtaService";
import type { BirthProfile } from "@prisma/client";

// ─── Gemini Singleton ─────────────────────────────────────────────────────

let _gemini: GoogleGenAI | null = null;
function gemini() {
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY ?? "" });
  return _gemini;
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface MuhurtaInsight {
  weekOverview: string;
  topWindows: {
    date: string;
    dayOfWeek: string;
    timeRange: string;
    quality: string;
    narrative: string;
  }[];
  hdGuidance: string;
  intentionSpecificAdvice: string;
  generalTiming: string;
}

export interface GlimpseMuhurtaInsight {
  weekHighlight: string;
  bestDays: string[];
}

// ─── Prompt Building ──────────────────────────────────────────────────────

function buildMuhurtaPrompt(data: MuhurtaData, userName: string): string {
  const windowsList = data.windows
    .slice(0, 5)
    .map(w => `- ${w.dayOfWeek} ${w.date} at ${w.startTime}: ${w.planetaryHour} hour (${w.quality}), ${w.nakshatra}, ${w.tithi}`)
    .join("\n");

  return `You are an electional astrology advisor helping ${userName} find the best timing for their ${data.intention} intentions this week.

TIMING DATA:
Week: ${data.weekStart} to ${data.weekEnd}
Intention: ${data.intention}
Moon Sign: ${data.moonSign || "Unknown"}
Current Nakshatra: ${data.currentNakshatra || "Unknown"}

HD PROFILE:
Type: ${data.hdType}
Authority: ${data.hdAuthority}
Strategy: ${data.hdStrategy}

TOP WINDOWS THIS WEEK:
${windowsList}

INSTRUCTIONS:
1. Provide a brief overview of the week's energy for this intention
2. For each of the top 3 windows, write a 2-3 sentence narrative explaining WHY this is good timing
3. Integrate their HD Authority guidance into timing recommendations
4. Give practical advice specific to their intention category
5. Use warm, practical language—no mystical hyperbole

Return ONLY valid JSON:
{
  "weekOverview": "2-3 sentences about the week's overall energy for this intention",
  "topWindows": [
    {
      "date": "YYYY-MM-DD",
      "dayOfWeek": "Day name",
      "timeRange": "HH:00 - HH:00",
      "quality": "excellent | good",
      "narrative": "2-3 sentences explaining why this window is favorable"
    }
  ],
  "hdGuidance": "2-3 sentences about how their specific Authority should approach timing decisions",
  "intentionSpecificAdvice": "2-3 sentences of practical advice for their intention category",
  "generalTiming": "A brief note about what to avoid or watch for this week"
}`;
}

function buildGlimpsePrompt(data: MuhurtaData): string {
  const bestDays = [...new Set(data.windows.slice(0, 3).map(w => w.dayOfWeek))];
  
  return `Based on this week's planetary alignments for ${data.intention} intentions, write a brief 1-2 sentence highlight of the week's timing energy.

Best days appear to be: ${bestDays.join(", ")}
HD Type: ${data.hdType}

Return ONLY valid JSON:
{
  "weekHighlight": "1-2 sentences about the week's timing potential",
  "bestDays": ["Day1", "Day2", "Day3"]
}`;
}

// ─── Generation Functions ─────────────────────────────────────────────────

export async function generateMuhurtaInsight(
  userId: string,
  birthProfile: BirthProfile,
  intention: IntentionCategory = "general"
): Promise<MuhurtaInsight> {
  const data = await calculateMuhurta(userId, birthProfile, intention);
  const userName = birthProfile.birthName.split(" ")[0];
  
  const prompt = buildMuhurtaPrompt(data, userName);
  
  const result = await gemini().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });
  
  const raw = result.text;
  if (!raw) throw new Error("Gemini returned empty response");
  
  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(clean) as MuhurtaInsight;
}

export async function generateGlimpseMuhurtaInsight(
  userId: string,
  birthProfile: BirthProfile,
  intention: IntentionCategory = "general"
): Promise<GlimpseMuhurtaInsight> {
  const data = await calculateMuhurta(userId, birthProfile, intention);
  
  const prompt = buildGlimpsePrompt(data);
  
  const result = await gemini().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });
  
  const raw = result.text;
  if (!raw) throw new Error("Gemini returned empty response");
  
  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(clean) as GlimpseMuhurtaInsight;
}

/**
 * Get muhurta data with optional AI insight. Caches weekly insight in DB.
 */
export async function getMuhurtaWithInsight(
  userId: string,
  birthProfile: BirthProfile,
  intention: IntentionCategory = "general",
  includeAI = true,
  weeks: 1 | 2 = 1
): Promise<{
  data: MuhurtaData;
  insight: MuhurtaInsight | null;
}> {
  const data = await calculateMuhurta(userId, birthProfile, intention, weeks);

  let insight: MuhurtaInsight | null = null;
  if (includeAI) {
    const weekStart = new Date(data.weekStart);
    const isGeneral = intention === "general";

    if (isGeneral) {
      // Only read/write cache for the default general intention.
      // Specific intentions are always generated fresh to avoid cache key collisions.
      const cached = await db.insight.findFirst({
        where: { userId, type: "MUHURTA_WEEKLY", periodDate: weekStart },
        orderBy: { generatedAt: "desc" },
      });
      if (cached) {
        try {
          insight = JSON.parse(cached.content as string) as MuhurtaInsight;
          return { data, insight };
        } catch { /* fall through to regenerate */ }
      }
    }

    try {
      insight = await generateMuhurtaInsight(userId, birthProfile, intention);
      if (isGeneral) {
        await db.insight.upsert({
          where: { userId_type_periodDate: { userId, type: "MUHURTA_WEEKLY", periodDate: weekStart } },
          create: { userId, type: "MUHURTA_WEEKLY", periodDate: weekStart, content: JSON.stringify(insight), reviewedByConsultant: false },
          update: { content: JSON.stringify(insight), generatedAt: new Date() },
        });
      }
    } catch (e) {
      console.error("Failed to generate muhurta insight:", e);
    }
  }

  return { data, insight };
}

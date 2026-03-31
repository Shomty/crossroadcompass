/**
 * lib/ai/dailyInsightService.ts
 * Generates a personalised daily insight using Gemini.
 * Incorporates: HD chart identity + active Mahadasha/Antardasha (from Prisma `dasha`)
 * + sidereal transit summary from `getOrCreateTodayTransits` (OA.13) + today's date.
 * No external Vedic HTTP API.
 */

import { GoogleGenAI } from "@google/genai";
import type { BirthProfile } from "@prisma/client";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { buildDailyInsightPrompt } from "@/lib/content/promptBuilder";
import { getOrCreateTodayTransits } from "@/lib/astro/chartService";
import { formatVedicTransitSummary } from "@/lib/astro/vedicTransitPrompt";
import type { HDChartData } from "@/types";

let _gemini: GoogleGenAI | null = null;
function gemini() {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return _gemini;
}

interface DashaContext {
  mahadasha: string; // e.g. "saturn"
  antardasha: string | null; // e.g. "mars"
  mahadashaEnds: string; // ISO date
}

export interface DailyInsight {
  summary: string;
  insight: string;
  action: string;
  energyTheme: string;
  generatedAt: string;
}

export async function generateDailyInsight(
  userId: string,
  chart: HDChartData,
  userName: string | null,
  birthProfile?: BirthProfile | null
): Promise<DailyInsight> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const profile =
    birthProfile ??
    (await db.birthProfile.findUnique({ where: { userId } }));

  let vedicTransitSummary: string | undefined;
  if (profile) {
    try {
      const transit = await getOrCreateTodayTransits(userId, profile);
      vedicTransitSummary = formatVedicTransitSummary(transit);
    } catch (err) {
      console.warn("[dailyInsight] Vedic transit prompt skipped:", err);
    }
  }

  // Get active Dasha context
  const now = new Date();
  const [activeMaha, activeAntar] = await Promise.all([
    db.dasha.findFirst({
      where: { userId, level: "MAHADASHA", startDate: { lte: now }, endDate: { gte: now } },
    }),
    db.dasha.findFirst({
      where: { userId, level: "ANTARDASHA", startDate: { lte: now }, endDate: { gte: now } },
    }),
  ]);

  const dashaCtx: DashaContext | null = activeMaha
    ? {
        mahadasha: activeMaha.planetName,
        antardasha: activeAntar ? activeAntar.planetName.split("/")[1] ?? null : null,
        mahadashaEnds: activeMaha.endDate.toISOString(),
      }
    : null;

  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const prompt = await buildDailyInsightPrompt(chart.type, {
    hdType:       chart.type,
    strategy:     chart.strategy,
    authority:    chart.authority,
    profile:      chart.profile,
    currentDasha: dashaCtx
      ? `${dashaCtx.mahadasha}${dashaCtx.antardasha ? ` / ${dashaCtx.antardasha}` : ""} mahadasha`
      : undefined,
    todayDate:    dateStr,
    userName:     userName ?? undefined,
    vedicTransitSummary,
  });

  const result = await gemini().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json", temperature: 0.8, maxOutputTokens: 4096 },
  });
  const raw = result.text;
  if (!raw) throw new Error("Gemini returned empty response");

  // Strip any markdown fences if present
  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const parsed = JSON.parse(clean) as Omit<DailyInsight, "generatedAt">;
  const insight: DailyInsight = { ...parsed, generatedAt: new Date().toISOString() };

  // Store — upsert so re-generation on same day overwrites
  await db.insight.upsert({
    where: { userId_type_periodDate: { userId, type: "DAILY", periodDate: today } },
    create: {
      userId,
      type: "DAILY",
      periodDate: today,
      content: JSON.stringify(insight),
      reviewedByConsultant: true,
    },
    update: {
      content: JSON.stringify(insight),
      generatedAt: new Date(),
    },
  });

  return insight;
}

export async function getTodaysDailyInsight(userId: string): Promise<DailyInsight | null> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const row = await db.insight.findFirst({
    where: { userId, type: "DAILY", periodDate: { gte: today, lt: tomorrow } },
    orderBy: { generatedAt: "desc" },
  });

  if (!row) return null;
  return JSON.parse(row.content as string) as DailyInsight;
}

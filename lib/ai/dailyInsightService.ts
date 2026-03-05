/**
 * lib/ai/dailyInsightService.ts
 * Generates a personalised daily insight using Gemini.
 * Incorporates: HD chart identity + active Mahadasha/Antardasha + today's date context.
 * Stored as an Insight row with type "DAILY" and periodDate = today.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import type { HDChartData } from "@/types";

let _gemini: GoogleGenerativeAI | null = null;
function gemini() {
  if (!_gemini) _gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return _gemini;
}

interface DashaContext {
  mahadasha: string; // e.g. "saturn"
  antardasha: string | null; // e.g. "mars"
  mahadashaEnds: string; // ISO date
}

function buildDailyPrompt(
  chart: HDChartData,
  dasha: DashaContext | null,
  today: Date,
  userName: string | null
): string {
  const name = userName ?? "the user";
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const dashaLine = dasha
    ? `Active Dasha: ${dasha.mahadasha}${dasha.antardasha ? ` / ${dasha.antardasha}` : ""} mahadasha`
    : "";

  return `Write a short personalised daily insight for ${name}.
Today: ${dateStr}
HD Type: ${chart.type} | Strategy: ${chart.strategy} | Authority: ${chart.authority} | Profile: ${chart.profile}
${dashaLine}

Rules: warm and practical tone, no "you will" predictions, 2-3 sentences for insight, one short action.

Return ONLY valid JSON:
{"summary":"one sentence headline","insight":"2-3 sentences personalised to this HD type and dasha","action":"one concrete action for today","energyTheme":"2-4 word theme"}`;
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
  userName: string | null
): Promise<DailyInsight> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

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

  const prompt = buildDailyPrompt(chart, dashaCtx, today, userName);

  const model = gemini().getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.8,
      maxOutputTokens: 1500,
    },
  });

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
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
      reviewedByConsultant: false,
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

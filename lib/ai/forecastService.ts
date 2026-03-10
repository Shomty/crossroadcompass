/**
 * lib/ai/forecastService.ts
 * Generates weekly and monthly forecasts using Gemini.
 * Combines HD chart identity + active Dasha + period date context.
 * Stored as Insight rows: type WEEKLY (Monday of week) or MONTHLY (1st of month).
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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ForecastSection {
  title: string;
  body: string;
}

export interface WeeklyForecast {
  headline: string;
  theme: string;           // 2–4 word energy theme
  overview: string;        // 2–3 sentence week overview
  sections: ForecastSection[]; // 3 sections: Energy, Relationships, Work/Purpose
  practice: string;        // one practical suggestion for the week
  generatedAt: string;
}

export interface MonthlyForecast {
  headline: string;
  theme: string;
  overview: string;
  sections: ForecastSection[]; // 4 sections: Energy Arc, Key Dates, Relationships, Growth Edge
  intention: string;       // one intention to hold for the month
  generatedAt: string;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Returns the Monday of the current week (UTC). */
export function getWeekStart(from = new Date()): Date {
  const d = new Date(from);
  const day = d.getUTCDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Returns the 1st of the current month (UTC). */
export function getMonthStart(from = new Date()): Date {
  const d = new Date(from);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ─── Prompt builders ─────────────────────────────────────────────────────────

function buildWeeklyPrompt(
  chart: HDChartData,
  mahadasha: string | null,
  antardasha: string | null,
  weekStart: Date,
  userName: string | null
): string {
  const name = userName ?? "the user";
  const weekOf = weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const dashaLine = mahadasha
    ? `Active Dasha: ${mahadasha} Mahadasha${antardasha ? ` / ${antardasha} Antardasha` : ""}`
    : "";

  return `Write a personalised weekly forecast for ${name}.
Week of: ${weekOf}
HD Type: ${chart.type} | Strategy: ${chart.strategy} | Authority: ${chart.authority} | Profile: ${chart.profile}
${dashaLine}
Defined centers: ${chart.definedCenters.join(", ") || "none"}

Rules: practical and grounded, no "you will" predictions, use "may", "tends to", "notice". Warm tone.

Return ONLY valid JSON matching this exact shape:
{
  "headline": "one punchy sentence headline for this week",
  "theme": "2-4 word energy theme (e.g. Clarity & Focus)",
  "overview": "2-3 sentences overview of the week's energy for this person's HD type and active dasha",
  "sections": [
    { "title": "Energy & Body", "body": "2-3 sentences specific to their HD type and dasha" },
    { "title": "Relationships & Aura", "body": "2-3 sentences about social/relational energy this week" },
    { "title": "Work & Purpose", "body": "2-3 sentences about work, decisions, and purpose this week" }
  ],
  "practice": "one concrete weekly practice or focus (1-2 sentences)"
}`;
}

function buildMonthlyPrompt(
  chart: HDChartData,
  mahadasha: string | null,
  antardasha: string | null,
  monthStart: Date,
  userName: string | null
): string {
  const name = userName ?? "the user";
  const monthName = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const dashaLine = mahadasha
    ? `Active Dasha: ${mahadasha} Mahadasha${antardasha ? ` / ${antardasha} Antardasha` : ""} (planetary themes influence the month)`
    : "";

  return `Write a personalised monthly forecast for ${name}.
Month: ${monthName}
HD Type: ${chart.type} | Strategy: ${chart.strategy} | Authority: ${chart.authority} | Profile: ${chart.profile}
${dashaLine}
Defined centers: ${chart.definedCenters.join(", ") || "none"}

Rules: forward-looking but not predictive, use "may", "tends to", "invites". Warm and practical tone.

Return ONLY valid JSON matching this exact shape:
{
  "headline": "one sentence headline for this month",
  "theme": "2-4 word monthly theme",
  "overview": "3-4 sentences about the month's overall energy arc for this person",
  "sections": [
    { "title": "Energy Arc", "body": "how their energy may ebb and flow through the month (2-3 sentences)" },
    { "title": "Key Focus Areas", "body": "2-3 areas to pay attention to this month, specific to their type and dasha" },
    { "title": "Relationships", "body": "relational themes this month for their aura type (2-3 sentences)" },
    { "title": "Growth Edge", "body": "where growth and challenge may show up (2-3 sentences)" }
  ],
  "intention": "one intention or question to hold for the entire month"
}`;
}

// ─── Weekly forecast ─────────────────────────────────────────────────────────

export async function generateWeeklyForecast(
  userId: string,
  chart: HDChartData,
  userName: string | null
): Promise<WeeklyForecast> {
  const weekStart = getWeekStart();
  const now = new Date();

  const [activeMaha, activeAntar] = await Promise.all([
    db.dasha.findFirst({ where: { userId, level: "MAHADASHA", startDate: { lte: now }, endDate: { gte: now } } }),
    db.dasha.findFirst({ where: { userId, level: "ANTARDASHA", startDate: { lte: now }, endDate: { gte: now } } }),
  ]);

  const mahaName = activeMaha ? capitalize(activeMaha.planetName) : null;
  const antarName = activeAntar ? capitalize(activeAntar.planetName.split("/")[1] ?? "") : null;

  const prompt = buildWeeklyPrompt(chart, mahaName, antarName, weekStart, userName);

  const model = gemini().getGenerativeModel({
    model: "gemini-2.5-flash-preview-04-17",
    generationConfig: { responseMimeType: "application/json", temperature: 0.75, maxOutputTokens: 2000 },
  });

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  if (!raw) throw new Error("Gemini returned empty response");

  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const parsed = JSON.parse(clean) as Omit<WeeklyForecast, "generatedAt">;
  const forecast: WeeklyForecast = { ...parsed, generatedAt: new Date().toISOString() };

  await db.insight.upsert({
    where: { userId_type_periodDate: { userId, type: "WEEKLY", periodDate: weekStart } },
    create: { userId, type: "WEEKLY", periodDate: weekStart, content: JSON.stringify(forecast), reviewedByConsultant: false },
    update: { content: JSON.stringify(forecast), generatedAt: new Date() },
  });

  return forecast;
}

export async function getThisWeeksForecast(userId: string): Promise<WeeklyForecast | null> {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  const row = await db.insight.findFirst({
    where: { userId, type: "WEEKLY", periodDate: { gte: weekStart, lt: weekEnd } },
    orderBy: { generatedAt: "desc" },
  });
  if (!row) return null;
  try { return JSON.parse(row.content as string) as WeeklyForecast; } catch { return null; }
}

// ─── Monthly forecast ─────────────────────────────────────────────────────────

export async function generateMonthlyForecast(
  userId: string,
  chart: HDChartData,
  userName: string | null
): Promise<MonthlyForecast> {
  const monthStart = getMonthStart();
  const now = new Date();

  const [activeMaha, activeAntar] = await Promise.all([
    db.dasha.findFirst({ where: { userId, level: "MAHADASHA", startDate: { lte: now }, endDate: { gte: now } } }),
    db.dasha.findFirst({ where: { userId, level: "ANTARDASHA", startDate: { lte: now }, endDate: { gte: now } } }),
  ]);

  const mahaName = activeMaha ? capitalize(activeMaha.planetName) : null;
  const antarName = activeAntar ? capitalize(activeAntar.planetName.split("/")[1] ?? "") : null;

  const prompt = buildMonthlyPrompt(chart, mahaName, antarName, monthStart, userName);

  const model = gemini().getGenerativeModel({
    model: "gemini-2.5-flash-preview-04-17",
    generationConfig: { responseMimeType: "application/json", temperature: 0.75, maxOutputTokens: 2500 },
  });

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  if (!raw) throw new Error("Gemini returned empty response");

  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const parsed = JSON.parse(clean) as Omit<MonthlyForecast, "generatedAt">;
  const forecast: MonthlyForecast = { ...parsed, generatedAt: new Date().toISOString() };

  await db.insight.upsert({
    where: { userId_type_periodDate: { userId, type: "MONTHLY", periodDate: monthStart } },
    create: { userId, type: "MONTHLY", periodDate: monthStart, content: JSON.stringify(forecast), reviewedByConsultant: false },
    update: { content: JSON.stringify(forecast), generatedAt: new Date() },
  });

  return forecast;
}

export async function getThisMonthsForecast(userId: string): Promise<MonthlyForecast | null> {
  const monthStart = getMonthStart();
  const monthEnd = new Date(monthStart); monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);
  const row = await db.insight.findFirst({
    where: { userId, type: "MONTHLY", periodDate: { gte: monthStart, lt: monthEnd } },
    orderBy: { generatedAt: "desc" },
  });
  if (!row) return null;
  try { return JSON.parse(row.content as string) as MonthlyForecast; } catch { return null; }
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

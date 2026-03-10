/**
 * lib/ai/hdReportService.ts
 * Generates a personalised Human Design report using Google Gemini.
 * Takes HDChartData + optional intake answers → returns a structured 7-section report
 * which is stored as an Insight row in the database.
 *
 * Content rules (PRD §6):
 *  - Plain English; define every astrological term on first use
 *  - No prediction language: "You will…" → "You may notice…" / "This tends to…"
 *  - Warm, specific, practical tone — not mystical, not generic
 *  - Every section ends with a practical implication or question
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import type { HDChartData } from "@/types";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface HDReportSection {
  title: string;
  content: string;
}

export interface HDReport {
  summary: string; // 2–3 sentence headline
  sections: HDReportSection[];
  generatedAt: string; // ISO timestamp
}

// ─── Gemini client (lazy — only created when needed) ──────────────────────

let _gemini: GoogleGenerativeAI | null = null;
function gemini() {
  if (!_gemini) _gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return _gemini;
}

// ─── Prompt builder ─────────────────────────────────────────────────────────

function buildPrompt(
  chart: HDChartData,
  intake: {
    lifeSituation?: string | null;
    primaryFocus?: string | null;
    wantsClarity?: string | null;
    birthName?: string | null;
  }
): string {
  const name = intake.birthName ?? "the user";

  const channelList = chart.activeChannels
    .map((c) => `${c.gates[0]}–${c.gates[1]} (${c.centers.join(" → ")})`)
    .join(", ");

  const intakeSection = [
    intake.lifeSituation ? `Life situation: "${intake.lifeSituation}"` : null,
    intake.primaryFocus ? `Primary focus: "${intake.primaryFocus}"` : null,
    intake.wantsClarity ? `Desired breakthrough: "${intake.wantsClarity}"` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are a compassionate and practical Human Design guide creating a personalised report for ${name}.

HUMAN DESIGN CHART DATA:
- Type: ${chart.type}
- Strategy: ${chart.strategy}
- Inner Authority: ${chart.authority}
- Profile: ${chart.profile}
- Definition: ${chart.definition}
- Signature: ${chart.signature}
- Not-Self Theme: ${chart.notSelfTheme}
- Incarnation Cross: ${chart.incarnationCross.type} — Gates ${chart.incarnationCross.gates.personalitySun}/${chart.incarnationCross.gates.personalityEarth}/${chart.incarnationCross.gates.designSun}/${chart.incarnationCross.gates.designEarth}
- Defined Centers: ${chart.definedCenters.join(", ") || "None"}
- Undefined Centers: ${chart.undefinedCenters.join(", ") || "None"}
- Active Channels: ${channelList || "None"}
- Active Gates: ${chart.activeGates.slice(0, 20).join(", ")}${chart.activeGates.length > 20 ? "…" : ""}

${intakeSection ? `PERSONAL CONTEXT FROM ${name.toUpperCase()}:\n${intakeSection}` : ""}

Write a warm, specific, practical Human Design report with these exact 7 sections. For each section:
- Define any technical terms in plain English on first use (in parentheses)
- Never say "You will…" — use "You may notice…", "This tends to…", "Many ${chart.type}s find…"
- End each section with one practical implication or reflection question
- Be specific to THIS chart, not generic HD descriptions

Return a JSON object with this exact shape:
{
  "summary": "2–3 sentence headline personalised to this chart and context",
  "sections": [
    { "title": "Your Human Design Type: ${chart.type}", "content": "..." },
    { "title": "Strategy & Inner Authority", "content": "..." },
    { "title": "Your Profile: ${chart.profile}", "content": "..." },
    { "title": "Energy Centers — What Drives You", "content": "..." },
    { "title": "Key Channels & Themes", "content": "..." },
    { "title": "Shadow Work & Growth Edge", "content": "..." },
    { "title": "Practical Guidance for Right Now", "content": "..." }
  ]
}

The "Practical Guidance" section should weave in the personal context provided above if available. Content must be compassionate but direct — no vague spirituality.`;
}

// ─── Main service function ───────────────────────────────────────────────────

export async function generateHDReport(
  userId: string,
  chart: HDChartData,
  intake: {
    lifeSituation?: string | null;
    primaryFocus?: string | null;
    wantsClarity?: string | null;
    birthName?: string | null;
  }
): Promise<HDReport> {
  const prompt = buildPrompt(chart, intake);

  const model = gemini().getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 4000,
    },
  });

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  if (!raw) throw new Error("Gemini returned empty response");

  const report: HDReport = JSON.parse(raw);
  report.generatedAt = new Date().toISOString();

  // Store as Insight row — type INITIAL, reviewed flag for future consultant review
  // periodDate = today (for INITIAL reports, this is the generation date)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await db.insight.upsert({
    where: { userId_type_periodDate: { userId, type: "INITIAL", periodDate: today } },
    create: {
      userId,
      type: "INITIAL",
      periodDate: today,
      content: JSON.stringify(report),
      reviewedByConsultant: false,
    },
    update: {
      content: JSON.stringify(report),
      generatedAt: new Date(),
      reviewedByConsultant: false,
    },
  });

  return report;
}

// ─── Retrieve latest report from DB ─────────────────────────────────────────

export async function getLatestHDReport(userId: string): Promise<HDReport | null> {
  const insight = await db.insight.findFirst({
    where: { userId, type: "INITIAL" },
    orderBy: { generatedAt: "desc" },
  });

  if (!insight) return null;

  return JSON.parse(insight.content as string) as HDReport;
}

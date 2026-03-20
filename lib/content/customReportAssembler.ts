// STATUS: done | Admin Custom Report Builder
/**
 * lib/content/customReportAssembler.ts
 * Assembles a custom report from KV-cached chart data and AI-generated sections.
 */

import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { kvGet } from "@/lib/kv/helpers";
import { kvKeys } from "@/lib/kv/keys";
import { buildCustomSectionPrompt } from "@/lib/content/customReportPrompts";
import type {
  ReportVariable,
  CustomReportConfig,
  ReportSection,
  CustomReportOutput,
  HDChartData,
} from "@/types";
import { interpolateReportTemplate } from "@/lib/reports/interpolateReportTemplate";

/** @deprecated Use interpolateReportTemplate from @/lib/reports/interpolateReportTemplate */
export const interpolatePrompt = interpolateReportTemplate;

// ─── Gemini lazy singleton ────────────────────────────────────────────────────

let _gemini: GoogleGenAI | null = null;
function gemini() {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
  if (!_gemini) _gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return _gemini;
}

// ─── Variable metadata ────────────────────────────────────────────────────────

export const REPORT_VARIABLE_META: Record<
  ReportVariable,
  { label: string; description: string; dataSource: "hd" | "vedic" | "dasha" | "transit" | "ai" | "manual" }
> = {
  hd_type_strategy:     { label: "HD Type & Strategy",        description: "Human Design type, strategy, signature, and not-self theme",               dataSource: "hd" },
  hd_authority:         { label: "HD Authority",              description: "Decision-making authority and how to apply it",                            dataSource: "hd" },
  hd_profile:           { label: "HD Profile",                description: "Profile lines and their life-role archetype",                              dataSource: "hd" },
  hd_defined_centers:   { label: "HD Defined Centers",        description: "Which energy centers are consistently defined (fixed)",                    dataSource: "hd" },
  hd_incarnation_cross: { label: "HD Incarnation Cross",      description: "Life purpose cross type and gate numbers",                                 dataSource: "hd" },
  vedic_natal_overview: { label: "Vedic Natal Overview",      description: "Key placements from the Vedic natal chart (lagna, planets, nakshatras)",  dataSource: "vedic" },
  current_dasha:        { label: "Current Dasha Period",      description: "Active Mahadasha and Antardasha planetary periods",                        dataSource: "dasha" },
  dasha_guidance:       { label: "Dasha Guidance",            description: "AI narrative: how the current dasha tends to influence this person",       dataSource: "ai" },
  active_transits:      { label: "Active Transits",           description: "Today's planetary transits and their house positions",                     dataSource: "transit" },
  sade_sati_status:     { label: "Sade Sati Status",          description: "Whether Saturn is in 12th, 1st, or 2nd from natal moon",                  dataSource: "vedic" },
  career_purpose_theme: { label: "Career & Purpose Theme",    description: "AI narrative: work and purpose patterns from HD cross and Vedic chart",   dataSource: "ai" },
  relationship_theme:   { label: "Relationship Theme",        description: "AI narrative: how HD wiring shapes relationship dynamics",                 dataSource: "ai" },
  shadow_growth_theme:  { label: "Shadow & Growth Theme",     description: "AI narrative: not-self patterns and the growth edge through them",         dataSource: "ai" },
  monthly_focus:        { label: "Monthly Focus",             description: "AI narrative: energetic theme and opportunity for this calendar month",    dataSource: "ai" },
  custom_note:          { label: "Consultant's Note",         description: "A personalised note written by the consultant for this report",            dataSource: "manual" },
};

// ─── AI variables ─────────────────────────────────────────────────────────────

const AI_VARIABLES = new Set<ReportVariable>([
  "dasha_guidance",
  "career_purpose_theme",
  "relationship_theme",
  "shadow_growth_theme",
  "monthly_focus",
]);

// ─── Assembler ────────────────────────────────────────────────────────────────

export async function assembleCustomReport(
  config: CustomReportConfig
): Promise<CustomReportOutput> {
  const { userId, variables, customNote } = config;

  // Fetch user email
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  // Load chart data once (shared across all sections)
  const today = new Date();
  const todayDateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

  const [hdData, vedicData, dashasData, transitData] = await Promise.all([
    kvGet<HDChartData>(kvKeys.hdChart(userId)),
    kvGet<Record<string, unknown>>(kvKeys.vedicChart(userId)),
    kvGet<unknown>(kvKeys.dashas(userId)),
    kvGet<unknown>(kvKeys.transit(userId, todayDateStr)),
  ]);

  const chartData = { hd: hdData, vedic: vedicData, dashas: dashasData };

  // Build each section with error isolation
  const sections: ReportSection[] = await Promise.all(
    variables.map(async (variable): Promise<ReportSection> => {
      const meta = REPORT_VARIABLE_META[variable];
      try {
        const content = await buildSectionContent(variable, {
          hdData,
          vedicData,
          dashasData,
          transitData,
          chartData,
          customNote,
        });
        return { variable, label: meta.label, content };
      } catch (err) {
        console.error(`[customReportAssembler] Failed to generate section "${variable}":`, err);
        return {
          variable,
          label: meta.label,
          content: "Could not generate this section. Please try again.",
        };
      }
    })
  );

  return {
    config,
    sections,
    generatedAt: new Date(),
    userEmail: user?.email ?? "",
  };
}

// ─── Per-variable content builders ───────────────────────────────────────────

async function buildSectionContent(
  variable: ReportVariable,
  ctx: {
    hdData: HDChartData | null;
    vedicData: Record<string, unknown> | null;
    dashasData: unknown;
    transitData: unknown;
    chartData: { hd: HDChartData | null; vedic: Record<string, unknown> | null; dashas: unknown };
    customNote?: string;
  }
): Promise<string> {
  const { hdData, vedicData, dashasData, transitData, chartData, customNote } = ctx;

  if (AI_VARIABLES.has(variable)) {
    const prompt = buildCustomSectionPrompt(variable, chartData);
    const result = await gemini().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { temperature: 0.75, maxOutputTokens: 1000 },
    });
    const text = result.text?.trim();
    if (!text) throw new Error("Gemini returned empty response");
    return text;
  }

  switch (variable) {
    case "hd_type_strategy":
      if (!hdData) return "HD chart data not yet available.";
      return `Type: ${hdData.type}\nStrategy: ${hdData.strategy}\nSignature: ${hdData.signature}\nNot-Self Theme: ${hdData.notSelfTheme}`;

    case "hd_authority":
      if (!hdData) return "HD chart data not yet available.";
      return `Authority: ${hdData.authority}`;

    case "hd_profile":
      if (!hdData) return "HD chart data not yet available.";
      return `Profile: ${hdData.profile}`;

    case "hd_defined_centers":
      if (!hdData) return "HD chart data not yet available.";
      return `Defined: ${hdData.definedCenters.join(", ") || "None"}\nUndefined: ${hdData.undefinedCenters.join(", ") || "None"}`;

    case "hd_incarnation_cross":
      if (!hdData) return "HD chart data not yet available.";
      return `Cross: ${hdData.incarnationCross.type}\nGates: Personality Sun ${hdData.incarnationCross.gates.personalitySun}, Personality Earth ${hdData.incarnationCross.gates.personalityEarth}, Design Sun ${hdData.incarnationCross.gates.designSun}, Design Earth ${hdData.incarnationCross.gates.designEarth}`;

    case "vedic_natal_overview":
      if (!vedicData) return "Vedic chart data not yet available.";
      return JSON.stringify(vedicData, null, 2).slice(0, 1500);

    case "current_dasha":
      if (!dashasData) return "Dasha data not yet available.";
      return JSON.stringify(dashasData, null, 2).slice(0, 800);

    case "active_transits":
      if (!transitData) return "Transit data not yet available for today.";
      return JSON.stringify(transitData, null, 2).slice(0, 1500);

    case "sade_sati_status":
      if (!vedicData) return "Vedic chart data not yet available.";
      // eslint-disable-next-line no-case-declarations
      const sadeSati = (vedicData as Record<string, unknown>).sadeSati;
      if (sadeSati === undefined) return "Sade Sati status not available in cached Vedic data.";
      return typeof sadeSati === "object"
        ? JSON.stringify(sadeSati, null, 2)
        : String(sadeSati);

    case "custom_note":
      return customNote ?? "";

    default:
      return `Data for "${variable}" not yet available.`;
  }
}

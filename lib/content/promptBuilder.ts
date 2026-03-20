// STATUS: done | Task Admin-5
/**
 * lib/content/promptBuilder.ts
 * Builds prompts for AI content generation.
 * Reads from DB PromptTemplate if available; falls back to hardcoded strings.
 */

import { getPrompt } from "@/lib/admin/promptService";
import {
  buildCareerPrompt,
  buildLovePrompt,
  buildHealthPrompt,
  buildJyotishPrompt,
  JYOTISH_SYSTEM_INSTRUCTION,
  type LifeReadingCtx,
} from "@/lib/ai/prompts/lifeReadingPrompts";

export interface DailyContext {
  hdType: string;
  strategy: string;
  authority: string;
  profile: string;
  currentDasha?: string;
  todayDate?: string;
  userName?: string;
}

/**
 * Maps each promptKey to the variable names it accepts (for admin preview panel).
 */
export const PROMPT_VARIABLE_MAP: Record<string, string[]> = {
  "daily.generator": ["hdType", "strategy", "authority", "profile", "currentDasha", "todayDate", "userName"],
  "daily.manifesting_generator": ["hdType", "strategy", "authority", "profile", "currentDasha", "todayDate", "userName"],
  "daily.projector": ["hdType", "strategy", "authority", "profile", "currentDasha", "todayDate", "userName"],
  "daily.manifestor": ["hdType", "strategy", "authority", "profile", "currentDasha", "todayDate", "userName"],
  "daily.reflector": ["hdType", "strategy", "authority", "profile", "currentDasha", "todayDate", "userName"],
  "weekly.base": ["hdType", "strategy", "authority", "currentDasha", "weekStart"],
  "monthly.base": ["hdType", "strategy", "authority", "currentDasha", "monthName"],
  "hd_report.base": ["hdType", "strategy", "authority", "profile", "definition", "channels", "intakeLifeSituation", "intakePrimaryFocus"],
  "life.career":  ["name", "hdType", "hdAuthority", "hdProfile", "hdCenters", "d1Planets", "d10Summary", "dasha"],
  "life.love":    ["name", "hdType", "hdAuthority", "hdProfile", "hdCenters", "d1Planets", "d9Summary", "dasha"],
  "life.health":  ["name", "hdType", "hdAuthority", "hdProfile", "hdCenters", "dasha"],
  "life.jyotish": ["name", "hdType", "hdAuthority", "hdProfile", "d1Planets", "d9Summary", "d10Summary", "dasha"],
  "transit.base": ["userName", "today", "ascendant", "moonSign", "dashaLord", "natalPlanets", "transitPlanets"],
};

/**
 * Interpolate {{variable}} placeholders in a template string.
 */
function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

function hdTypeToKey(hdType: string): string {
  return hdType.toLowerCase().replace(/\s+/g, "_");
}

/**
 * Build daily insight prompt. DB record takes priority; falls back to hardcoded.
 */
export async function buildDailyInsightPrompt(
  hdType: string,
  ctx: DailyContext
): Promise<string> {
  const promptKey = `daily.${hdTypeToKey(hdType)}`;
  const template = await getPrompt(promptKey);

  if (template?.userPromptTemplate) {
    return interpolate(template.userPromptTemplate, {
      hdType: ctx.hdType,
      strategy: ctx.strategy,
      authority: ctx.authority,
      profile: ctx.profile,
      currentDasha: ctx.currentDasha ?? "",
      todayDate: ctx.todayDate ?? new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      userName: ctx.userName ?? "the user",
    });
  }

  // Fallback to hardcoded
  console.warn(`[promptBuilder] No DB prompt for key "${promptKey}", using hardcoded fallback`);
  const name = ctx.userName ?? "the user";
  const dateStr = ctx.todayDate ?? new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const dashaLine = ctx.currentDasha ? `Active Dasha: ${ctx.currentDasha}` : "";

  return `Write a short personalised daily insight for ${name}.
Today: ${dateStr}
HD Type: ${ctx.hdType} | Strategy: ${ctx.strategy} | Authority: ${ctx.authority} | Profile: ${ctx.profile}
${dashaLine}

Rules: warm and practical tone, no "you will" predictions, 2-3 sentences for insight, one short action.

Return ONLY valid JSON:
{"summary":"one sentence headline","insight":"2-3 sentences personalised to this HD type and dasha","action":"one concrete action for today","energyTheme":"2-4 word theme"}`;
}

/**
 * Build weekly forecast prompt.
 */
export async function buildWeeklyPrompt(vars: Record<string, string>): Promise<string> {
  const template = await getPrompt("weekly.base");

  if (template?.userPromptTemplate) {
    return interpolate(template.userPromptTemplate, vars);
  }

  console.warn('[promptBuilder] No DB prompt for key "weekly.base", using hardcoded fallback');
  return vars._hardcoded ?? "";
}

/**
 * Build monthly report prompt.
 */
export async function buildMonthlyPrompt(vars: Record<string, string>): Promise<string> {
  const template = await getPrompt("monthly.base");

  if (template?.userPromptTemplate) {
    return interpolate(template.userPromptTemplate, vars);
  }

  console.warn('[promptBuilder] No DB prompt for key "monthly.base", using hardcoded fallback');
  return vars._hardcoded ?? "";
}

/**
 * Build HD report prompt.
 */
export async function buildHDReportPrompt(vars: Record<string, string>): Promise<string> {
  const template = await getPrompt("hd_report.base");

  if (template?.userPromptTemplate) {
    return interpolate(template.userPromptTemplate, vars);
  }

  console.warn('[promptBuilder] No DB prompt for key "hd_report.base", using hardcoded fallback');
  return vars._hardcoded ?? "";
}

/**
 * Build life reading prompt (career | love | health | jyotish).
 * Returns { prompt, systemInstruction } — systemInstruction is non-null for jyotish
 * both from DB (systemPrompt field) and hardcoded fallback.
 */
export async function buildLifeReadingPrompt(
  type: "career" | "love" | "health" | "jyotish",
  ctx: LifeReadingCtx
): Promise<{ prompt: string; systemInstruction: string | null }> {
  const promptKey = `life.${type}`;
  const template = await getPrompt(promptKey);

  if (template?.userPromptTemplate) {
    const vars: Record<string, string> = {
      name:        ctx.name,
      hdType:      ctx.hdType,
      hdAuthority: ctx.hdAuthority,
      hdProfile:   ctx.hdProfile,
      hdCenters:   ctx.hdCenters,
      d1Planets:   ctx.d1Planets,
      d9Summary:   ctx.d9Summary,
      d10Summary:  ctx.d10Summary,
      dasha:       ctx.dasha,
    };
    return {
      prompt: interpolate(template.userPromptTemplate, vars),
      systemInstruction: template.systemPrompt || null,
    };
  }

  console.warn(`[promptBuilder] No DB prompt for key "${promptKey}", using hardcoded fallback`);

  if (type === "career")  return { prompt: buildCareerPrompt(ctx),  systemInstruction: null };
  if (type === "love")    return { prompt: buildLovePrompt(ctx),    systemInstruction: null };
  if (type === "health")  return { prompt: buildHealthPrompt(ctx),  systemInstruction: null };
  // jyotish
  return { prompt: buildJyotishPrompt(ctx), systemInstruction: JYOTISH_SYSTEM_INSTRUCTION };
}

/**
 * Build transit reading prompt.
 * Falls back to the provided fallbackFn() when no DB record exists.
 */
export async function buildTransitReadingPrompt(
  vars: Record<string, string>,
  fallbackFn: () => string
): Promise<string> {
  const template = await getPrompt("transit.base");

  if (template?.userPromptTemplate) {
    return interpolate(template.userPromptTemplate, vars);
  }

  console.warn('[promptBuilder] No DB prompt for "transit.base", using hardcoded fallback');
  return fallbackFn();
}

// Re-export LifeReadingCtx so callers can import from promptBuilder
export type { LifeReadingCtx };

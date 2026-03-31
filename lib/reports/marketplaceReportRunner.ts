import type { BirthProfile } from "@prisma/client";
import { loadReportTemplateSources } from "@/lib/admin/loadReportTemplateSources";
import {
  resolveMergedPromptVariablesFromSources,
} from "@/lib/content/reportVariableResolver";
import { env } from "@/lib/env";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import { interpolateReportTemplate } from "./interpolateReportTemplate";
import { buildMarketplaceUserContextPayload } from "./marketplaceUserContext";
import {
  generateReportWithGemini,
  GeminiGenerationError,
} from "@/lib/gemini/client";
import { db } from "@/lib/db";
import type { BuildReportTemplateVarsInput } from "@/lib/reports/reportTemplateVars";

export type MarketplaceGenResult =
  | {
      ok: true;
      text: string;
      wordCount: number;
      model: string;
      durationMs: number;
    }
  | { ok: false; error: string };

export type MarketplacePromptParts = {
  vars: Record<string, string>;
  systemPrompt: string;
  userContext: string;
};

function clampText(s: string, max: number, label: string): string {
  if (s.length <= max) return s;
  const tail = `\n\n[… truncated ${label}: ${s.length} → ${max} chars …]`;
  return s.slice(0, Math.max(0, max - tail.length)) + tail;
}

async function ensureHdOnInput(
  userId: string,
  birthProfile: BirthProfile,
  input: BuildReportTemplateVarsInput
): Promise<BuildReportTemplateVarsInput> {
  if (input.hdData) return input;
  const hd = await getOrCreateHDChart(userId, birthProfile);
  return { ...input, hdData: hd };
}

/**
 * Loads chart sources once, merges template vars, interpolates system prompt, builds user JSON payload.
 * Used by marketplace generation and admin test-generation (same AP.5 + legacy vars as production).
 */
export async function loadMarketplaceReportPromptParts(
  userId: string,
  geminiPrompt: string,
  birthProfile: BirthProfile
): Promise<
  | { ok: false; error: string }
  | ({ ok: true } & MarketplacePromptParts)
> {
  let input = await loadReportTemplateSources(userId, { birthProfile });
  input = await ensureHdOnInput(userId, birthProfile, input);

  const vars = resolveMergedPromptVariablesFromSources(birthProfile, input);
  if (Object.keys(vars).length === 0) {
    return {
      ok: false,
      error: "No birth profile or variables could not be resolved",
    };
  }

  const systemPrompt = interpolateReportTemplate(geminiPrompt, vars);
  const userContext = buildMarketplaceUserContextPayload(input);

  return { ok: true, vars, systemPrompt, userContext };
}

const DEFAULT_MAX_OUTPUT = 8192;
const DEFAULT_MAX_USER_CHARS = 120_000;
const DEFAULT_MAX_SYSTEM_CHARS = 120_000;

/**
 * Interpolates prompt with merged legacy + AP.5 variables, then calls Gemini with chart JSON user payload.
 */
export async function runMarketplaceReportGeneration(
  userId: string,
  geminiPrompt: string,
  opts?: { birthProfile: BirthProfile }
): Promise<MarketplaceGenResult> {
  const birthProfile =
    opts?.birthProfile ??
    (await db.birthProfile.findUnique({ where: { userId } }));

  if (!birthProfile) {
    return {
      ok: false,
      error: "No birth profile or variables could not be resolved",
    };
  }

  const parts = await loadMarketplaceReportPromptParts(
    userId,
    geminiPrompt,
    birthProfile
  );
  if (!parts.ok) {
    return { ok: false, error: parts.error };
  }

  const maxOut =
    env.GEMINI_REPORT_MAX_OUTPUT_TOKENS ?? DEFAULT_MAX_OUTPUT;
  const maxUser =
    env.GEMINI_REPORT_MAX_INPUT_CHARS ?? DEFAULT_MAX_USER_CHARS;
  const maxSys =
    env.GEMINI_REPORT_MAX_SYSTEM_CHARS ?? DEFAULT_MAX_SYSTEM_CHARS;

  const systemPrompt = clampText(
    parts.systemPrompt,
    maxSys,
    "system instruction"
  );
  const userContext = clampText(parts.userContext, maxUser, "user chart JSON");

  try {
    const result = await generateReportWithGemini(systemPrompt, userContext, {
      maxOutputTokens: maxOut,
    });
    return {
      ok: true,
      text: result.text,
      wordCount: result.wordCount,
      model: result.model,
      durationMs: result.durationMs,
    };
  } catch (e) {
    const msg =
      e instanceof GeminiGenerationError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Gemini error";
    return { ok: false, error: msg };
  }
}

/** Tokens in template with value missing or literally "unknown". */
export function listMissingTemplateKeys(
  template: string,
  vars: Record<string, string>
): string[] {
  const re = /\{\{([\w]+)\}\}/g;
  const missing = new Set<string>();
  let m: RegExpExecArray | null;
  const t = template;
  while ((m = re.exec(t)) !== null) {
    const k = m[1];
    const v = vars[k];
    if (v === undefined || v === "" || v === "unknown") {
      missing.add(k);
    }
  }
  return [...missing];
}

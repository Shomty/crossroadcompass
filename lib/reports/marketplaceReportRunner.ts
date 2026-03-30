import { resolveMergedPromptVariables } from "@/lib/content/reportVariableResolver";
import { buildUserReportContext } from "./contextBuilder";
import { interpolateReportTemplate } from "./interpolateReportTemplate";
import {
  generateReportWithGemini,
  GeminiGenerationError,
} from "@/lib/gemini/client";

export type MarketplaceGenResult =
  | {
      ok: true;
      text: string;
      wordCount: number;
      model: string;
      durationMs: number;
    }
  | { ok: false; error: string };

/**
 * Interpolates prompt with merged legacy + AP.5 variables, then calls Gemini with user context.
 */
export async function runMarketplaceReportGeneration(
  userId: string,
  geminiPrompt: string,
  userEmail: string
): Promise<MarketplaceGenResult> {
  const vars = await resolveMergedPromptVariables(userId);
  if (Object.keys(vars).length === 0) {
    return { ok: false, error: "No birth profile or variables could not be resolved" };
  }

  const systemPrompt = interpolateReportTemplate(geminiPrompt, vars);
  const userContext = await buildUserReportContext(userId);

  try {
    const result = await generateReportWithGemini(systemPrompt, userContext);
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

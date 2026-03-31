// STATUS: done | Marketplace report — single JSON user payload (no duplicate KV/DB reads)
import type { BuildReportTemplateVarsInput } from "@/lib/reports/reportTemplateVars";

/** Internal cap before runner applies GEMINI_REPORT_MAX_INPUT_CHARS. */
const PAYLOAD_JSON_MAX = 400_000;

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}… [truncated ${s.length - max} chars]`;
}

function safeJson(value: unknown, max: number): string {
  try {
    return truncate(JSON.stringify(value, null, 2), max);
  } catch {
    return "{}";
  }
}

/**
 * User message for Gemini: short instructions + one structured chart blob.
 * Built only from `BuildReportTemplateVarsInput` (same object used for {{vars}}).
 */
export function buildMarketplaceUserContextPayload(
  input: BuildReportTemplateVarsInput
): string {
  const payload = {
    userEmail: input.userEmail,
    birth: input.birthProfile,
    humanDesign: input.hdData,
    vedic: input.vedicData,
    dashas: input.dashasData,
    transit: input.transitData,
    specialPoints: input.specialPoints,
    extendedSpecialPoints: input.extendedSpecialPoints,
  };

  const json = safeJson(payload, PAYLOAD_JSON_MAX);

  const instructions =
    "You are generating a personalized report. Follow the system instructions for role, structure, and tone. " +
    "Use the JSON chart context below as the factual basis (birth details, Human Design, Vedic data, dashas, transits). " +
    'Do not invent placements. Write in warm, practical, non-predictive language — avoid "you will"; prefer ' +
    '"you may notice", "this period tends to", "your chart suggests". ' +
    "Format the report with clear markdown headings. Be specific to this person's data — never generic.";

  return `${instructions}\n\n=== CHART_CONTEXT_JSON ===\n${json}`;
}

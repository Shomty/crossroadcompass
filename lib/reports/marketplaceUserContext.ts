// STATUS: done | Marketplace report — single JSON user payload (no duplicate KV/DB reads)
import type { BuildReportTemplateVarsInput } from "@/lib/reports/reportTemplateVars";
import {
  computeNatalSynthesisSeeds,
  westernToSynthesisInput,
  vedicToSynthesisInput,
} from "@/lib/astro/natalSynthesisEngine";

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
 *
 * Includes natal synthesis seeds when both Western and Vedic data are available.
 * Seeds encode the Western vs Vedic divergence per personal planet as structured
 * objects that guide the 3-layer report architecture.
 */
export function buildMarketplaceUserContextPayload(
  input: BuildReportTemplateVarsInput
): string {
  // Build natal synthesis seeds when possible
  let synthesisSeedsByPlanet: unknown = null
  if (input.westernNatalData && input.vedicData) {
    try {
      const wInput = westernToSynthesisInput(input.westernNatalData)
      const vInput = vedicToSynthesisInput(input.vedicData)
      synthesisSeedsByPlanet = computeNatalSynthesisSeeds({ western: wInput, vedic: vInput })
    } catch {
      synthesisSeedsByPlanet = null
    }
  }

  const payload = {
    userEmail: input.userEmail,
    birth: input.birthProfile,
    humanDesign: input.hdData,
    vedic: input.vedicData,
    westernNatal: input.westernNatalData
      ? {
          ascendant: input.westernNatalData.ascendant,
          planets: Object.fromEntries(
            Object.entries(input.westernNatalData.planets).map(([k, v]) => [
              k,
              { sign: v.sign, degree: v.degree, dignity: v.dignity, isRetrograde: v.isRetrograde },
            ])
          ),
        }
      : null,
    synthesisSeedsByPlanet,
    dashas: input.dashasData,
    transit: input.transitData,
    specialPoints: input.specialPoints,
    extendedSpecialPoints: input.extendedSpecialPoints,
  };

  const json = safeJson(payload, PAYLOAD_JSON_MAX);

  const instructions =
    "You are generating a personalized report. Follow the system instructions for role, structure, and tone. " +
    "Use the JSON chart context below as the factual basis (birth details, Human Design, Vedic data, dashas, transits). " +
    "The 'synthesisSeedsByPlanet' field contains pre-computed divergence analysis for each personal planet: " +
    "each seed shows the Western (tropical) placement as the conscious symptom/desire and the Vedic (sidereal) " +
    "placement as the hidden capacity/medicine. Use these seeds to build the AHA synthesis layer. " +
    'Do not invent placements. Write in warm, practical, non-predictive language — avoid "you will"; prefer ' +
    '"you may notice", "this period tends to", "your chart suggests". ' +
    "Format the report with clear markdown headings. Be specific to this person's data — never generic.";

  return `${instructions}\n\n=== CHART_CONTEXT_JSON ===\n${json}`;
}

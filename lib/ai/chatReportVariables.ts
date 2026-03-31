import type { BirthProfile } from "@prisma/client";
import { loadReportTemplateSources } from "@/lib/admin/loadReportTemplateSources";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import {
  buildReportTemplateVars,
  type BuildReportTemplateVarsInput,
} from "@/lib/reports/reportTemplateVars";
import {
  REPORT_TEMPLATE_VARIABLE_KEYS,
  type ReportTemplateVariableKey,
} from "@/lib/reports/reportTemplateVariableKeys";
import type { SubscriptionTier } from "@/types";

const CHAT_USER_CONTEXT_INSTRUCTION = `The USER_CONTEXT block below is factual data for the signed-in user (identity, birth data, dasha periods, and chart variables). Treat it as source of truth; do not contradict it.`;

const FREE_MAX_VALUE_CHARS = 2_000;
const PREMIUM_MAX_VALUE_CHARS = 12_000;

function isHeavyJsonKey(key: ReportTemplateVariableKey): boolean {
  return key.includes("_json") || key === "vedic_json";
}

function shouldIncludeKeyForTier(
  key: ReportTemplateVariableKey,
  tier: SubscriptionTier
): boolean {
  if (tier !== "FREE") return true;
  return !isHeavyJsonKey(key);
}

function truncateValue(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}… [truncated ${s.length - max} chars]`;
}

function capitalizePlanet(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function vimshottariLine(vars: Record<ReportTemplateVariableKey, string>): string {
  const m = capitalizePlanet(vars.current_mahadasha);
  const a = capitalizePlanet(vars.current_antardasha);
  if (m && a) return `Current Vimshottari: ${m} Mahadasha, ${a} Antardasha`;
  if (m) return `Current Vimshottari: ${m} Mahadasha`;
  return "Current Vimshottari: (not available)";
}

function identityLines(vars: Record<ReportTemplateVariableKey, string>): string[] {
  const lines: string[] = ["Identity:"];
  const add = (label: string, key: ReportTemplateVariableKey) => {
    const v = vars[key]?.trim();
    if (v) lines.push(`  ${label}: ${v}`);
  };
  add("Email", "user_email");
  add("Name", "user_name");
  add("Birth name", "birth_name");
  add("Birth date", "birth_date");
  add("Birth time", "birth_time");
  add("Birth place", "birth_location");
  add("Timezone", "timezone");
  add("Gender", "gender");
  return lines;
}

export async function loadChatReportTemplateInput(
  userId: string,
  birthProfile: BirthProfile
): Promise<BuildReportTemplateVarsInput> {
  let input = await loadReportTemplateSources(userId, { birthProfile });
  if (!input.hdData) {
    const hd = await getOrCreateHDChart(userId, birthProfile);
    input = { ...input, hdData: hd };
  }
  return input;
}

export function formatReportVarsForChat(
  vars: Record<ReportTemplateVariableKey, string>,
  options: { tier: SubscriptionTier; maxChars: number }
): string {
  const { tier, maxChars } = options;
  const perFieldMax =
    tier === "FREE" ? FREE_MAX_VALUE_CHARS : PREMIUM_MAX_VALUE_CHARS;

  const header = [
    "USER_CONTEXT",
    "",
    ...identityLines(vars),
    "",
    vimshottariLine(vars),
    "",
    `current_dasha (summary): ${vars.current_dasha || "(empty)"}`,
    "",
    "Variables:",
  ].join("\n");

  const keys = [...REPORT_TEMPLATE_VARIABLE_KEYS].filter((k) =>
    shouldIncludeKeyForTier(k, tier)
  );
  keys.sort((a, b) => a.localeCompare(b));

  const bodyParts: string[] = [];
  for (const key of keys) {
    const raw = vars[key] ?? "";
    if (!raw.trim()) continue;
    const val = truncateValue(raw, perFieldMax);
    bodyParts.push(`${key}: ${val}`);
  }

  let out = `${header}\n${bodyParts.join("\n")}`;
  if (out.length > maxChars) {
    out = `${out.slice(0, maxChars)}\n\n[USER_CONTEXT truncated at ${maxChars} chars]`;
  }
  return out;
}

export function appendChatUserContextToSystemPrompt(
  baseSystemPrompt: string,
  userContextBlock: string
): string {
  const block = userContextBlock.trim();
  if (!block) return baseSystemPrompt;
  return `${baseSystemPrompt.trim()}\n\n${CHAT_USER_CONTEXT_INSTRUCTION}\n\n${block}`;
}

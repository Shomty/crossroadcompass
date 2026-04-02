import type { ReportTemplateVariableKey } from "./reportTemplateVariableKeys";
import { REPORT_TEMPLATE_VARIABLE_KEYS } from "./reportTemplateVariableKeys";

export const VARIABLE_PALETTE_GROUP_ORDER = [
  "Profile & birth",
  "Human Design",
  "Western chart",
  "Vedic chart",
  "Dashas & transits",
  "Special lagnas (AL, GL, BL, HL)",
  "Charakārakas (AK, AmK, …)",
  "Extended special points",
  "Dhūma chain (upagrahas)",
  "Kālavelas (Gulika, Māndi, …)",
  "JSON bundles",
  "Other",
] as const;

export type VariablePaletteGroup = (typeof VARIABLE_PALETTE_GROUP_ORDER)[number];

const LABEL_OVERRIDES: Partial<Record<ReportTemplateVariableKey, string>> = {
  // Western chart
  western_asc_sign:          "Ascendant — sign",
  western_asc_degree:        "Ascendant — degree",
  western_asc_dms:           "Ascendant — degree DMS",
  western_true_node_sign:    "True Node (North Node) — sign",
  western_true_node_degree:  "True Node (North Node) — degree",
  western_true_node_house:   "True Node (North Node) — house",
  western_true_node_retro:   "True Node (North Node) — retrograde",
  western_true_node_dignity: "True Node (North Node) — dignity",
  western_true_node_dms:     "True Node (North Node) — degree DMS",
  western_aspects_json:      "Western aspects (JSON)",
  western_aspects_summary:   "Western aspects — major aspects summary",
  western_patterns_json:     "Western chart patterns (JSON)",
  western_chart_patterns:    "Chart patterns — summary",
  western_planets_json:      "Western planets (JSON)",
  western_houses_json:       "Western houses (JSON)",
  // Vedic special points
  sp_AL_sign: "Arudha Lagna (AL) — sign",
  sp_GL_sign: "Ghati Lagna (GL) — sign",
  sp_BL_sign: "Bhava Lagna (BL) — sign",
  sp_HL_sign: "Hora Lagna (HL) — sign",
  sp_AK_planet: "Atmakaraka (AK) — planet",
  sp_AmK_planet: "Amatyakaraka (AmK) — planet",
  sp_PiK_planet: "Pitṛkāraka (PiK) — planet",
  sp_PuK_planet: "Putrakāraka (PuK) — planet",
  sp_BB_sign: "Bhrigu Bindu (BB) — sign",
  sp_PP_sign: "Prāṇapada (PP) — sign",
  sp_foundation_json: "Special points — foundation (JSON)",
  sp_extended_json: "Special points — extended (JSON)",
  sp_charakarakas_json: "Charakārakas (JSON)",
  sp_dhooma_chain_json: "Dhūma chain (JSON)",
  sp_kaal_velas_json: "Kālavelas (JSON)",
};

function humanizeKey(key: string): string {
  return key
    .replace(/^sp_/, "sp: ")
    .replace(/^vedic_/, "vedic: ")
    .replace(/^western_/, "western: ")
    .replace(/^hd_/, "HD: ")
    .replace(/^dasha_/, "dasha: ")
    .replace(/_/g, " ");
}

function inferGroup(key: ReportTemplateVariableKey): VariablePaletteGroup {
  if (
    key.startsWith("user_") ||
    key.startsWith("birth_") ||
    key === "timezone" ||
    key === "gender" ||
    key.startsWith("observation_") ||
    key.startsWith("intake_")
  ) {
    return "Profile & birth";
  }
  if (key.startsWith("hd_")) return "Human Design";
  if (key.startsWith("western_")) return "Western chart";
  if (
    key.startsWith("vedic_") ||
    key === "lagna" ||
    key === "sun_sign" ||
    key === "moon_sign" ||
    key === "sade_sati"
  ) {
    return "Vedic chart";
  }
  if (
    key.startsWith("dasha_") ||
    key.startsWith("current_") ||
    key === "dashas_json" ||
    key.startsWith("transit_") ||
    key === "today_date" ||
    key === "today_iso"
  ) {
    return "Dashas & transits";
  }
  if (
    key.startsWith("sp_AL_") ||
    key.startsWith("sp_GL_") ||
    key.startsWith("sp_BL_") ||
    key.startsWith("sp_HL_") ||
    key.startsWith("sp_natal_") ||
    key.startsWith("sp_arudha_") ||
    key.startsWith("sp_ghati_") ||
    key.startsWith("sp_bhava_") ||
    key.startsWith("sp_hora_")
  ) {
    return "Special lagnas (AL, GL, BL, HL)";
  }
  if (
    key.startsWith("sp_AK_") ||
    key.startsWith("sp_AmK_") ||
    key.startsWith("sp_BK_") ||
    key.startsWith("sp_MK_") ||
    key.startsWith("sp_PiK_") ||
    key.startsWith("sp_PuK_") ||
    key.startsWith("sp_GK_") ||
    key.startsWith("sp_DK_") ||
    key.startsWith("sp_atmakaraka_") ||
    key.startsWith("sp_amatyakaraka_") ||
    key.startsWith("sp_bhratrukaraka_") ||
    key.startsWith("sp_matrukaraka_") ||
    key.startsWith("sp_pitrukaraka_") ||
    key.startsWith("sp_putrakaraka_") ||
    key.startsWith("sp_gnatikaraka_") ||
    key.startsWith("sp_darakaraka_")
  ) {
    return "Charakārakas (AK, AmK, …)";
  }
  if (
    key.startsWith("sp_varnada_") ||
    key.startsWith("sp_pranapada_") ||
    key.startsWith("sp_PP_") ||
    key.startsWith("sp_upapada_") ||
    key.startsWith("sp_sree_") ||
    key.startsWith("sp_bhrigu_") ||
    key.startsWith("sp_BB_") ||
    key.startsWith("sp_beeja_") ||
    key.startsWith("sp_kshetra_") ||
    key.startsWith("sp_trisphuta_")
  ) {
    return "Extended special points";
  }
  if (
    key.startsWith("sp_dhooma_") ||
    key.startsWith("sp_vyatipata_") ||
    key.startsWith("sp_parivesha_") ||
    key.startsWith("sp_indrachapa_") ||
    key.startsWith("sp_upaketu_")
  ) {
    return "Dhūma chain (upagrahas)";
  }
  if (
    key.startsWith("sp_gulika_") ||
    key.startsWith("sp_maandi_") ||
    key.startsWith("sp_kaala_") ||
    key.startsWith("sp_mrityu_") ||
    key.startsWith("sp_ardhaprahara_") ||
    key.startsWith("sp_yamaghantaka_")
  ) {
    return "Kālavelas (Gulika, Māndi, …)";
  }
  if (key.endsWith("_json")) return "JSON bundles";
  if (key.startsWith("sp_")) return "Extended special points";
  return "Other";
}

export function getVariablePaletteMeta(key: ReportTemplateVariableKey): {
  group: VariablePaletteGroup;
  label: string;
  searchText: string;
} {
  const group = inferGroup(key);
  const label = LABEL_OVERRIDES[key] ?? humanizeKey(key);
  const searchText = `${key} ${label}`.toLowerCase();
  return { group, label, searchText };
}

export function groupKeysForPalette(
  keys: readonly ReportTemplateVariableKey[],
  search: string
): { group: VariablePaletteGroup; keys: ReportTemplateVariableKey[] }[] {
  const q = search.trim().toLowerCase();
  const filtered = q
    ? keys.filter((k) => getVariablePaletteMeta(k).searchText.includes(q))
    : [...keys];

  const byGroup = new Map<VariablePaletteGroup, ReportTemplateVariableKey[]>();
  for (const g of VARIABLE_PALETTE_GROUP_ORDER) {
    byGroup.set(g, []);
  }
  for (const k of filtered) {
    const g = getVariablePaletteMeta(k).group;
    byGroup.get(g)!.push(k);
  }

  return VARIABLE_PALETTE_GROUP_ORDER.map((group) => ({
    group,
    keys: byGroup.get(group) ?? [],
  })).filter((row) => row.keys.length > 0);
}

export { REPORT_TEMPLATE_VARIABLE_KEYS };

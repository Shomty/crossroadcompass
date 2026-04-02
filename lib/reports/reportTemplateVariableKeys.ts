// STATUS: done | Report template placeholders
import { SPECIAL_POINT_SCALAR_KEYS } from "./specialPointScalarKeys";

/**
 * Every {{placeholder}} supported by `buildReportTemplateVars` (admin UIs import this only).
 */
const BASE_REPORT_TEMPLATE_VARIABLE_KEYS = [
  "user_email",
  "user_name",
  "birth_name",
  "birth_date",
  "birth_time",
  "birth_city",
  "birth_country",
  "birth_location",
  "birth_latitude",
  "birth_longitude",
  "timezone",
  "gender",
  "observation_city",
  "observation_latitude",
  "observation_longitude",
  "intake_life_situation",
  "intake_primary_focus",
  "intake_wants_clarity",
  "hd_type",
  "hd_strategy",
  "hd_authority",
  "hd_profile",
  "hd_definition",
  "hd_signature",
  "hd_not_self_theme",
  "hd_incarnation_cross_type",
  "hd_incarnation_cross_gates",
  "hd_incarnation_cross_json",
  "hd_defined_centers",
  "hd_undefined_centers",
  "hd_active_gates",
  "hd_active_channels_json",
  "hd_variables_json",
  "hd_personality_activations_json",
  "hd_design_activations_json",
  "hd_design_date",
  "lagna",
  "sun_sign",
  "moon_sign",
  "vedic_json",
  "vedic_planets_json",
  "vedic_houses_json",
  "sade_sati",
  "current_mahadasha",
  "current_antardasha",
  "current_dasha",
  "dashas_json",
  "transit_json",
  "transit_date",
  "today_date",
  "today_iso",

  // Vedic special points (foundation + extended; JSON mirrors KV cache)
  "sp_foundation_json",
  "sp_extended_json",
  "sp_arudha_sign",
  "sp_ghati_sign",
  "sp_bhava_sign",
  "sp_hora_sign",
  "sp_charakarakas_json",
  "sp_varnada_sign",
  "sp_pranapada_sign",
  "sp_upapada_sign",
  "sp_sree_sign",
  "sp_bhrigu_sign",
  "sp_bhrigu_longitude",
  "sp_beeja_sign",
  "sp_kshetra_sign",
  "sp_trisphuta_sign",
  "sp_trisphuta_longitude",
  "sp_dhooma_chain_json",
  "sp_kaal_velas_json",

  // Granular Vedic planet vars (sign, degree, retrograde per planet)
  "vedic_sun_sign", "vedic_sun_degree", "vedic_sun_retro",
  "vedic_moon_sign", "vedic_moon_degree", "vedic_moon_retro",
  "vedic_mars_sign", "vedic_mars_degree", "vedic_mars_retro",
  "vedic_mercury_sign", "vedic_mercury_degree", "vedic_mercury_retro",
  "vedic_jupiter_sign", "vedic_jupiter_degree", "vedic_jupiter_retro",
  "vedic_venus_sign", "vedic_venus_degree", "vedic_venus_retro",
  "vedic_saturn_sign", "vedic_saturn_degree", "vedic_saturn_retro",
  "vedic_rahu_sign", "vedic_rahu_degree",
  "vedic_ketu_sign", "vedic_ketu_degree",
  "vedic_lagna_degree",

  // House cusp signs (1-12)
  "vedic_house_1_sign", "vedic_house_2_sign", "vedic_house_3_sign",
  "vedic_house_4_sign", "vedic_house_5_sign", "vedic_house_6_sign",
  "vedic_house_7_sign", "vedic_house_8_sign", "vedic_house_9_sign",
  "vedic_house_10_sign", "vedic_house_11_sign", "vedic_house_12_sign",

  // Dasha period dates
  "dasha_mahadasha_start", "dasha_mahadasha_end",
  "dasha_antardasha_start", "dasha_antardasha_end",

  // Western (tropical) natal — planet scalars (sign, degree, house, retrograde, dignity, DMS)
  "western_sun_sign",     "western_sun_degree",     "western_sun_house",     "western_sun_retro",     "western_sun_dignity",     "western_sun_dms",
  "western_moon_sign",    "western_moon_degree",    "western_moon_house",    "western_moon_retro",    "western_moon_dignity",    "western_moon_dms",
  "western_mercury_sign", "western_mercury_degree", "western_mercury_house", "western_mercury_retro", "western_mercury_dignity", "western_mercury_dms",
  "western_venus_sign",   "western_venus_degree",   "western_venus_house",   "western_venus_retro",   "western_venus_dignity",   "western_venus_dms",
  "western_mars_sign",    "western_mars_degree",    "western_mars_house",    "western_mars_retro",    "western_mars_dignity",    "western_mars_dms",
  "western_jupiter_sign", "western_jupiter_degree", "western_jupiter_house", "western_jupiter_retro", "western_jupiter_dignity", "western_jupiter_dms",
  "western_saturn_sign",  "western_saturn_degree",  "western_saturn_house",  "western_saturn_retro",  "western_saturn_dignity",  "western_saturn_dms",
  "western_uranus_sign",  "western_uranus_degree",  "western_uranus_house",  "western_uranus_retro",  "western_uranus_dignity",  "western_uranus_dms",
  "western_neptune_sign", "western_neptune_degree", "western_neptune_house", "western_neptune_retro", "western_neptune_dignity", "western_neptune_dms",
  "western_pluto_sign",   "western_pluto_degree",   "western_pluto_house",   "western_pluto_retro",   "western_pluto_dignity",   "western_pluto_dms",
  "western_chiron_sign",  "western_chiron_degree",  "western_chiron_house",  "western_chiron_retro",  "western_chiron_dignity",  "western_chiron_dms",
  "western_true_node_sign", "western_true_node_degree", "western_true_node_house", "western_true_node_retro", "western_true_node_dignity", "western_true_node_dms",

  // Western — house scalars (sign on cusp, cusp degree, lord, planets in house)
  "western_house_1_sign",  "western_house_1_degree",  "western_house_1_lord",  "western_house_1_planets",
  "western_house_2_sign",  "western_house_2_degree",  "western_house_2_lord",  "western_house_2_planets",
  "western_house_3_sign",  "western_house_3_degree",  "western_house_3_lord",  "western_house_3_planets",
  "western_house_4_sign",  "western_house_4_degree",  "western_house_4_lord",  "western_house_4_planets",
  "western_house_5_sign",  "western_house_5_degree",  "western_house_5_lord",  "western_house_5_planets",
  "western_house_6_sign",  "western_house_6_degree",  "western_house_6_lord",  "western_house_6_planets",
  "western_house_7_sign",  "western_house_7_degree",  "western_house_7_lord",  "western_house_7_planets",
  "western_house_8_sign",  "western_house_8_degree",  "western_house_8_lord",  "western_house_8_planets",
  "western_house_9_sign",  "western_house_9_degree",  "western_house_9_lord",  "western_house_9_planets",
  "western_house_10_sign", "western_house_10_degree", "western_house_10_lord", "western_house_10_planets",
  "western_house_11_sign", "western_house_11_degree", "western_house_11_lord", "western_house_11_planets",
  "western_house_12_sign", "western_house_12_degree", "western_house_12_lord", "western_house_12_planets",

  // Western — ascendant detail
  "western_asc_sign", "western_asc_degree", "western_asc_dms",

  // Western — aspects & chart patterns
  "western_aspects_json", "western_aspects_summary",
  "western_patterns_json", "western_chart_patterns",

  // Western — JSON bundles
  "western_planets_json", "western_houses_json",

  // Natal synthesis seeds JSON — structured divergence map for Gemini
  "synthesis_seeds_json",
] as const;

export const REPORT_TEMPLATE_VARIABLE_KEYS = [
  ...BASE_REPORT_TEMPLATE_VARIABLE_KEYS,
  ...SPECIAL_POINT_SCALAR_KEYS,
] as const;

export type ReportTemplateVariableKey =
  (typeof REPORT_TEMPLATE_VARIABLE_KEYS)[number];

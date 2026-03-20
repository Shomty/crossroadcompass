// STATUS: done | Report template placeholders
import type { HDChartData } from "@/types";
import {
  REPORT_TEMPLATE_VARIABLE_KEYS,
  type ReportTemplateVariableKey,
} from "./reportTemplateVariableKeys";

const JSON_MAX = 12_000;

function truncate(s: string, max = JSON_MAX): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}… [truncated ${s.length - max} chars]`;
}

function safeJson(value: unknown, max = JSON_MAX): string {
  try {
    return truncate(JSON.stringify(value, null, 2), max);
  } catch {
    return "";
  }
}

function safeString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === "string" ? value : String(value);
}

function formatBirthTime(profile: {
  birthTimeKnown: boolean;
  birthHour: number | null;
  birthMinute: number | null;
}): string {
  if (!profile.birthTimeKnown) return "Unknown";
  const hh = String(profile.birthHour ?? 12).padStart(2, "0");
  const mm = String(profile.birthMinute ?? 0).padStart(2, "0");
  return `${hh}:${mm}`;
}

function deriveCurrentMahadasha(dashas: unknown): string {
  const now = new Date();
  if (
    dashas &&
    typeof dashas === "object" &&
    "currentMahadasha" in (dashas as Record<string, unknown>)
  ) {
    const v = (dashas as Record<string, unknown>).currentMahadasha;
    if (typeof v === "string" && v.trim()) return v;
  }
  if (Array.isArray(dashas)) {
    const found = dashas.find((d) => {
      if (!d || typeof d !== "object") return false;
      const rec = d as Record<string, unknown>;
      if (rec.level !== "MAHADASHA") return false;
      const start = rec.startDate ? new Date(String(rec.startDate)) : null;
      const end = rec.endDate ? new Date(String(rec.endDate)) : null;
      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
        return false;
      return start <= now && now <= end;
    });
    if (found && typeof found === "object") {
      const planetName = (found as Record<string, unknown>).planetName;
      if (typeof planetName === "string" && planetName.trim()) return planetName;
    }
  }
  return "";
}

export type BuildReportTemplateVarsInput = {
  hdData: HDChartData | null;
  vedicData: Record<string, unknown> | null;
  dashasData: unknown;
  transitData: unknown;
  birthProfile: {
    birthName: string;
    birthDate: Date;
    birthTimeKnown: boolean;
    birthHour: number | null;
    birthMinute: number | null;
    birthCity: string;
    birthCountry: string;
    latitude: number;
    longitude: number;
    timezone: string;
    gender?: string | null;
    observationCity?: string | null;
    observationLatitude?: number | null;
    observationLongitude?: number | null;
    intakeLifeSituation?: string | null;
    intakePrimaryFocus?: string | null;
    intakeWantsClarity?: string | null;
  } | null;
  userEmail: string;
  /** Active Mahadasha planet name (from DB or caller) */
  currentMahadasha: string;
  /** Active Antardasha planet name (from DB or caller) */
  currentAntardasha: string;
};

export { REPORT_TEMPLATE_VARIABLE_KEYS, type ReportTemplateVariableKey };

export function buildReportTemplateVars(
  input: BuildReportTemplateVarsInput
): Record<ReportTemplateVariableKey, string> {
  const {
    hdData,
    vedicData,
    dashasData,
    transitData,
    birthProfile,
    userEmail,
    currentMahadasha,
    currentAntardasha,
  } = input;

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const todayDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const userName = userEmail?.split("@")[0] ?? "Seeker";

  const kvMaha = deriveCurrentMahadasha(dashasData);
  const maha = currentMahadasha || kvMaha;
  const antar = currentAntardasha;

  const vars = {} as Record<ReportTemplateVariableKey, string>;

  vars.user_email = userEmail ?? "";
  vars.user_name = userName;
  vars.today_date = todayDate;
  vars.today_iso = todayIso;
  vars.transit_date = todayIso;

  if (birthProfile) {
    vars.birth_name = birthProfile.birthName;
    vars.birth_date = birthProfile.birthDate.toISOString().split("T")[0];
    vars.birth_time = formatBirthTime(birthProfile);
    vars.birth_city = birthProfile.birthCity;
    vars.birth_country = birthProfile.birthCountry;
    vars.birth_location = [birthProfile.birthCity, birthProfile.birthCountry]
      .filter(Boolean)
      .join(", ");
    vars.birth_latitude = String(birthProfile.latitude);
    vars.birth_longitude = String(birthProfile.longitude);
    vars.timezone = birthProfile.timezone;
    vars.gender = birthProfile.gender ?? "";
    vars.observation_city = birthProfile.observationCity ?? "";
    vars.observation_latitude =
      birthProfile.observationLatitude != null
        ? String(birthProfile.observationLatitude)
        : "";
    vars.observation_longitude =
      birthProfile.observationLongitude != null
        ? String(birthProfile.observationLongitude)
        : "";
    vars.intake_life_situation = birthProfile.intakeLifeSituation ?? "";
    vars.intake_primary_focus = birthProfile.intakePrimaryFocus ?? "";
    vars.intake_wants_clarity = birthProfile.intakeWantsClarity ?? "";
  } else {
    vars.birth_name = "";
    vars.birth_date = "";
    vars.birth_time = "";
    vars.birth_city = "";
    vars.birth_country = "";
    vars.birth_location = "";
    vars.birth_latitude = "";
    vars.birth_longitude = "";
    vars.timezone = "";
    vars.gender = "";
    vars.observation_city = "";
    vars.observation_latitude = "";
    vars.observation_longitude = "";
    vars.intake_life_situation = "";
    vars.intake_primary_focus = "";
    vars.intake_wants_clarity = "";
  }

  if (hdData) {
    vars.hd_type = hdData.type;
    vars.hd_strategy = hdData.strategy;
    vars.hd_authority = hdData.authority;
    vars.hd_profile = hdData.profile;
    vars.hd_definition = hdData.definition;
    vars.hd_signature = hdData.signature;
    vars.hd_not_self_theme = hdData.notSelfTheme;
    vars.hd_incarnation_cross_type = hdData.incarnationCross?.type ?? "";
    const g = hdData.incarnationCross?.gates;
    vars.hd_incarnation_cross_gates = g
      ? `Gates ${g.personalitySun}, ${g.personalityEarth}, ${g.designSun}, ${g.designEarth}`
      : "";
    vars.hd_incarnation_cross_json = safeJson(hdData.incarnationCross, 2000);
    vars.hd_defined_centers = hdData.definedCenters.join(", ");
    vars.hd_undefined_centers = hdData.undefinedCenters.join(", ");
    vars.hd_active_gates = hdData.activeGates.join(", ");
    vars.hd_active_channels_json = safeJson(hdData.activeChannels, 4000);
    vars.hd_variables_json = safeJson(hdData.variables, 2000);
    vars.hd_personality_activations_json = safeJson(hdData.personality, 6000);
    vars.hd_design_activations_json = safeJson(hdData.design, 6000);
    vars.hd_design_date = hdData.designDate ?? "";
  } else {
    vars.hd_type = "";
    vars.hd_strategy = "";
    vars.hd_authority = "";
    vars.hd_profile = "";
    vars.hd_definition = "";
    vars.hd_signature = "";
    vars.hd_not_self_theme = "";
    vars.hd_incarnation_cross_type = "";
    vars.hd_incarnation_cross_gates = "";
    vars.hd_incarnation_cross_json = "";
    vars.hd_defined_centers = "";
    vars.hd_undefined_centers = "";
    vars.hd_active_gates = "";
    vars.hd_active_channels_json = "";
    vars.hd_variables_json = "";
    vars.hd_personality_activations_json = "";
    vars.hd_design_activations_json = "";
    vars.hd_design_date = "";
  }

  if (vedicData) {
    vars.lagna = safeString(vedicData.lagna ?? (vedicData as { Lagna?: unknown }).Lagna);
    vars.sun_sign = safeString(vedicData.sunSign ?? vedicData.sun_sign);
    vars.moon_sign = safeString(vedicData.moonSign ?? vedicData.moon_sign);
    vars.vedic_json = safeJson(vedicData);
    vars.vedic_planets_json = safeJson(
      vedicData.planets ?? (vedicData as { planetaryPositions?: unknown }).planetaryPositions,
      8000
    );
    vars.vedic_houses_json = safeJson(vedicData.houses ?? (vedicData as { houseCusps?: unknown }).houseCusps, 8000);
    const rawSade = vedicData.sadeSati ?? vedicData.sade_sati;
    vars.sade_sati =
      rawSade === undefined || rawSade === null
        ? ""
        : typeof rawSade === "object"
          ? safeJson(rawSade, 2000)
          : safeString(rawSade);
  } else {
    vars.lagna = "";
    vars.sun_sign = "";
    vars.moon_sign = "";
    vars.vedic_json = "";
    vars.vedic_planets_json = "";
    vars.vedic_houses_json = "";
    vars.sade_sati = "";
  }

  vars.current_mahadasha = maha;
  vars.current_antardasha = antar;
  vars.current_dasha = maha;
  vars.dashas_json = dashasData ? safeJson(dashasData) : "";

  vars.transit_json = transitData ? safeJson(transitData) : "";

  for (const k of REPORT_TEMPLATE_VARIABLE_KEYS) {
    if (vars[k] === undefined) vars[k] = "";
  }

  return vars;
}

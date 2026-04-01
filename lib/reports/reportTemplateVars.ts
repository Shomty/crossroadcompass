// STATUS: done | Report template placeholders
import type {
  HDChartData,
  SpecialPointsResult,
  ExtendedSpecialPointsResult,
  SignNumber,
} from "@/types";
import type { WesternChartCalculations } from "openastrology-library";
import { applySpecialPointTemplateScalars } from "./applySpecialPointTemplateScalars";
import {
  REPORT_TEMPLATE_VARIABLE_KEYS,
  type ReportTemplateVariableKey,
} from "./reportTemplateVariableKeys";
import {
  computeNatalSynthesisSeeds,
  westernToSynthesisInput,
  vedicToSynthesisInput,
} from "@/lib/astro/natalSynthesisEngine";

const ZODIAC_SIGN: Record<SignNumber, string> = {
  1: "Aries",
  2: "Taurus",
  3: "Gemini",
  4: "Cancer",
  5: "Leo",
  6: "Virgo",
  7: "Libra",
  8: "Scorpio",
  9: "Sagittarius",
  10: "Capricorn",
  11: "Aquarius",
  12: "Pisces",
};

function signLabel(n: number): string {
  return ZODIAC_SIGN[n as SignNumber] ?? "";
}

function formatLon(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "";
  return String(Math.round(n * 1000) / 1000);
}

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

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
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

const VEDIC_PLANETS = [
  "sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu",
] as const;
type VedicPlanet = (typeof VEDIC_PLANETS)[number];

function extractGranularVedicVars(
  vedicData: Record<string, unknown>,
  vars: Record<ReportTemplateVariableKey, string>
): void {
  const planets = vedicData.planets;
  const planetsIsDict =
    planets != null && typeof planets === "object" && !Array.isArray(planets);
  const planetsArr: unknown[] | null = Array.isArray(vedicData.planetaryPositions)
    ? (vedicData.planetaryPositions as unknown[])
    : Array.isArray(vedicData.planets)
      ? (vedicData.planets as unknown[])
      : null;

  function getPlanet(planet: VedicPlanet): Record<string, unknown> | null {
    if (planetsIsDict) {
      const p = (planets as Record<string, unknown>)[planet];
      return p != null && typeof p === "object" ? (p as Record<string, unknown>) : null;
    }
    if (planetsArr) {
      const found = planetsArr.find((item) => {
        if (!item || typeof item !== "object") return false;
        const name = (item as Record<string, unknown>).name;
        return typeof name === "string" && name.toLowerCase() === planet;
      });
      return found ? (found as Record<string, unknown>) : null;
    }
    return null;
  }

  for (const planet of VEDIC_PLANETS) {
    const p = getPlanet(planet);
    const signKey = `vedic_${planet}_sign` as ReportTemplateVariableKey;
    const degKey = `vedic_${planet}_degree` as ReportTemplateVariableKey;
    vars[signKey] = p?.sign ? capitalize(safeString(p.sign)) : "";
    const rawDeg = p?.degree ?? p?.degreeInSign;
    vars[degKey] =
      rawDeg !== undefined && rawDeg !== null
        ? String(Math.round(Number(rawDeg) * 100) / 100)
        : "";
    if (planet !== "rahu" && planet !== "ketu") {
      const retroKey = `vedic_${planet}_retro` as ReportTemplateVariableKey;
      vars[retroKey] = p && (p.isRetrograde || p.retrograde) ? "R" : "";
    }
  }

  const asc = vedicData.ascendant as Record<string, unknown> | undefined;
  vars.vedic_lagna_degree =
    asc?.degree !== undefined && asc.degree !== null
      ? String(Math.round(Number(asc.degree) * 100) / 100)
      : "";

  const houses = vedicData.houses;
  const housesIsObj =
    houses != null && typeof houses === "object" && !Array.isArray(houses);
  for (let h = 1; h <= 12; h++) {
    const k = `vedic_house_${h}_sign` as ReportTemplateVariableKey;
    if (housesIsObj) {
      const raw = houses as Record<string | number, unknown>;
      const hi = (raw[h] ?? raw[String(h)]) as Record<string, unknown> | undefined;
      vars[k] = hi?.sign ? capitalize(safeString(hi.sign)) : "";
    } else {
      vars[k] = "";
    }
  }
}

function extractDashaDateVars(
  dashasData: unknown,
  maha: string,
  antar: string,
  vars: Record<ReportTemplateVariableKey, string>
): void {
  vars.dasha_mahadasha_start = "";
  vars.dasha_mahadasha_end = "";
  vars.dasha_antardasha_start = "";
  vars.dasha_antardasha_end = "";
  if (!Array.isArray(dashasData) || !maha) return;

  const now = new Date();

  const mahaRec = (dashasData as unknown[]).find((d) => {
    if (!d || typeof d !== "object") return false;
    const rec = d as Record<string, unknown>;
    return (
      rec.level === "MAHADASHA" &&
      typeof rec.planetName === "string" &&
      rec.planetName.toLowerCase() === maha.toLowerCase()
    );
  }) as Record<string, unknown> | undefined;

  if (mahaRec) {
    vars.dasha_mahadasha_start = mahaRec.startDate
      ? String(mahaRec.startDate).slice(0, 10)
      : "";
    vars.dasha_mahadasha_end = mahaRec.endDate
      ? String(mahaRec.endDate).slice(0, 10)
      : "";
  }

  if (!antar) return;

  const antarRec = (dashasData as unknown[]).find((d) => {
    if (!d || typeof d !== "object") return false;
    const rec = d as Record<string, unknown>;
    if (
      rec.level !== "ANTARDASHA" ||
      typeof rec.planetName !== "string" ||
      rec.planetName.toLowerCase() !== antar.toLowerCase()
    )
      return false;
    const start = rec.startDate ? new Date(String(rec.startDate)) : null;
    const end = rec.endDate ? new Date(String(rec.endDate)) : null;
    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      return false;
    return start <= now && now <= end;
  }) as Record<string, unknown> | undefined;

  if (antarRec) {
    vars.dasha_antardasha_start = antarRec.startDate
      ? String(antarRec.startDate).slice(0, 10)
      : "";
    vars.dasha_antardasha_end = antarRec.endDate
      ? String(antarRec.endDate).slice(0, 10)
      : "";
  }
}

export type BuildReportTemplateVarsInput = {
  hdData: HDChartData | null;
  vedicData: Record<string, unknown> | null;
  /** Western (tropical) natal chart — used for synthesis layer comparison */
  westernNatalData?: WesternChartCalculations | null;
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
  /** From KV + chartService; null if chart / inputs unavailable */
  specialPoints?: SpecialPointsResult | null;
  extendedSpecialPoints?: ExtendedSpecialPointsResult | null;
};

export { REPORT_TEMPLATE_VARIABLE_KEYS, type ReportTemplateVariableKey };

export function buildReportTemplateVars(
  input: BuildReportTemplateVarsInput
): Record<ReportTemplateVariableKey, string> {
  const {
    hdData,
    vedicData,
    westernNatalData,
    dashasData,
    transitData,
    birthProfile,
    userEmail,
    currentMahadasha,
    currentAntardasha,
    specialPoints,
    extendedSpecialPoints,
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
    extractGranularVedicVars(vedicData, vars);
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
  const mahaL = capitalize(maha);
  const antarL = capitalize(antar);
  vars.current_dasha =
    mahaL && antarL
      ? `${mahaL} Mahadasha / ${antarL} Antardasha`
      : mahaL
        ? `${mahaL} Mahadasha`
        : "";
  vars.dashas_json = dashasData ? safeJson(dashasData) : "";
  extractDashaDateVars(dashasData, maha, antar, vars);

  vars.transit_json = transitData ? safeJson(transitData) : "";

  if (specialPoints) {
    vars.sp_foundation_json = safeJson(specialPoints, 12_000);
    vars.sp_arudha_sign = signLabel(specialPoints.arudhaLagna.arudhaSignNumber);
    vars.sp_ghati_sign = signLabel(specialPoints.ghatiLagna.ghatiLagnaSignNumber);
    vars.sp_bhava_sign = signLabel(specialPoints.bhavaLagna.bhavaLagnaSignNumber);
    vars.sp_hora_sign = signLabel(specialPoints.horaLagna.horaLagnaSignNumber);
    vars.sp_charakarakas_json = safeJson(specialPoints.charakarakas, 4000);
  } else {
    vars.sp_foundation_json = "";
    vars.sp_arudha_sign = "";
    vars.sp_ghati_sign = "";
    vars.sp_bhava_sign = "";
    vars.sp_hora_sign = "";
    vars.sp_charakarakas_json = "";
  }

  if (extendedSpecialPoints) {
    vars.sp_extended_json = safeJson(extendedSpecialPoints, 16_000);
    const e = extendedSpecialPoints;
    vars.sp_varnada_sign = signLabel(e.varnadaLagna.varnadaLagnaSignNumber);
    vars.sp_pranapada_sign = signLabel(e.pranapada.pranapadalagnaSignNumber);
    vars.sp_upapada_sign = signLabel(e.upapadaLagna.upapadaSignNumber);
    vars.sp_sree_sign = signLabel(e.sreeLagna.sreeLagnaSignNumber);
    vars.sp_bhrigu_sign = signLabel(e.bhriguBindu.bhriguBinduSign);
    vars.sp_bhrigu_longitude = formatLon(e.bhriguBindu.bhriguBinduLongitude);
    vars.sp_beeja_sign = signLabel(e.beejaSphuata.beejaSphutaSign);
    vars.sp_kshetra_sign = signLabel(e.kshetraSphuata.kshetraSphutaSign);
    if (e.trisphuta) {
      vars.sp_trisphuta_sign = signLabel(e.trisphuta.triSphutaSign);
      vars.sp_trisphuta_longitude = formatLon(e.trisphuta.triSphutaLongitude);
    } else {
      vars.sp_trisphuta_sign = "";
      vars.sp_trisphuta_longitude = "";
    }
    vars.sp_dhooma_chain_json = safeJson(e.dhoomaChain, 4000);
    vars.sp_kaal_velas_json = e.kaalVelas ? safeJson(e.kaalVelas, 8000) : "";
  } else {
    vars.sp_extended_json = "";
    vars.sp_varnada_sign = "";
    vars.sp_pranapada_sign = "";
    vars.sp_upapada_sign = "";
    vars.sp_sree_sign = "";
    vars.sp_bhrigu_sign = "";
    vars.sp_bhrigu_longitude = "";
    vars.sp_beeja_sign = "";
    vars.sp_kshetra_sign = "";
    vars.sp_trisphuta_sign = "";
    vars.sp_trisphuta_longitude = "";
    vars.sp_dhooma_chain_json = "";
    vars.sp_kaal_velas_json = "";
  }

  applySpecialPointTemplateScalars(
    vars as unknown as Record<string, string>,
    specialPoints ?? undefined,
    extendedSpecialPoints ?? undefined,
    signLabel,
    formatLon
  );

  // ── Western natal planet variables ──────────────────────────────────────────
  if (westernNatalData) {
    const wp = westernNatalData.planets
    vars.western_sun_sign     = wp['sun']?.sign     ?? ""
    vars.western_moon_sign    = wp['moon']?.sign    ?? ""
    vars.western_asc_sign     = westernNatalData.ascendant?.sign ?? ""
    vars.western_venus_sign   = wp['venus']?.sign   ?? ""
    vars.western_mars_sign    = wp['mars']?.sign    ?? ""
    vars.western_mercury_sign = wp['mercury']?.sign ?? ""
  } else {
    vars.western_sun_sign     = ""
    vars.western_moon_sign    = ""
    vars.western_asc_sign     = ""
    vars.western_venus_sign   = ""
    vars.western_mars_sign    = ""
    vars.western_mercury_sign = ""
  }

  // ── Synthesis seeds (Western vs Vedic divergence map) ───────────────────────
  if (westernNatalData && vedicData) {
    try {
      const wInput = westernToSynthesisInput(westernNatalData)
      const vInput = vedicToSynthesisInput(vedicData)
      const seeds  = computeNatalSynthesisSeeds({ western: wInput, vedic: vInput })
      vars.synthesis_seeds_json = JSON.stringify(seeds)
    } catch {
      vars.synthesis_seeds_json = ""
    }
  } else {
    vars.synthesis_seeds_json = ""
  }

  for (const k of REPORT_TEMPLATE_VARIABLE_KEYS) {
    if (vars[k] === undefined) vars[k] = "";
  }

  return vars;
}

/**
 * lib/astro/types.ts
 * Shared TypeScript types for all chart data across the astro service layer.
 * These mirror the field names stored in BirthProfile (see prisma/schema.prisma).
 * See copilot-instructions section 19.
 */

// ─── Human Design ─────────────────────────────────────────────────────────
// Types mirror the actual openhumandesign-library output exactly.
// Do not diverge from these — chartService stores them as-is in DB.

export type HDType =
  | "Generator"
  | "Manifesting Generator"
  | "Projector"
  | "Manifestor"
  | "Reflector";

/** Matches Authority type from openhumandesign-library/dist/types.d.ts */
export type HDAuthority =
  | "Emotional"
  | "Sacral"
  | "Splenic"
  | "Ego Manifested"
  | "Ego Projected"
  | "Self-Projected"
  | "Mental"
  | "Lunar";

export type HDDefinition =
  | "Single"
  | "Split"
  | "Triple Split"
  | "Quadruple Split"
  | "None";

export type HDCenterName =
  | "Head"
  | "Ajna"
  | "Throat"
  | "G"
  | "Heart"
  | "Sacral"
  | "SolarPlexus"
  | "Spleen"
  | "Root";

export type HDCrossType = "Right Angle" | "Left Angle" | "Juxtaposition";

export interface HDIncarnationCross {
  type: HDCrossType;
  gates: {
    personalitySun: number;
    personalityEarth: number;
    designSun: number;
    designEarth: number;
  };
}

export interface HDChannel {
  gates: [number, number];
  centers: [HDCenterName, HDCenterName];
}

export interface HDGateActivation {
  gate: number;
  line: number;
  color: number;
  tone: number;
  base: number;
  longitude: number;
}

export interface HDPlanetaryActivation {
  planet: string;
  activation: HDGateActivation;
  isExalted: boolean;
  isInDetriment: boolean;
}

export interface HDVariable {
  arrow: "Left" | "Right";
  color: number;
  tone: number;
  colorName: string;
}

export interface HDVariables {
  digestion: HDVariable;
  environment: HDVariable;
  perspective: HDVariable;
  motivation: HDVariable;
}

export interface HDChart {
  type: HDType;
  strategy: string;
  signature: string;
  notSelfTheme: string;
  authority: HDAuthority;
  profile: string; // e.g. "1/3"
  definition: HDDefinition;
  incarnationCross: HDIncarnationCross;
  definedCenters: HDCenterName[];
  undefinedCenters: HDCenterName[];
  activeChannels: HDChannel[];
  activeGates: number[];
  variables: HDVariables;
  personality: HDPlanetaryActivation[];
  design: HDPlanetaryActivation[];
  designDate: string; // ISO string — Date serialised for DB storage
}

// ─── Vedic Astrology ──────────────────────────────────────────────────────
// Calculated locally via openastrology-library (VedicAstrologyCalculator).
// No external API call — Swiss Ephemeris runs in-process.

// ─── Vedic chart request ──────────────────────────────────────────────────

/**
 * Parameters passed to VedicAstrologyCalculator.calculateChart().
 * latitude/longitude are used directly — no API geocoding needed.
 */
export interface VedicBirthChartRequest {
  dateOfBirth: string;        // "YYYY-MM-DD"
  timeOfBirth: string;        // "HH:MM"
  latitude: number;
  longitude: number;
  timezone: string;           // IANA timezone e.g. "Europe/Belgrade"
  gender: "male" | "female" | "other";
  name: string;
}

// ─── Vedic calculation result types (mapped from openastrology-library) ───

export interface VedicPlanet {
  name: string;               // "sun" | "moon" | "mercury" | etc.
  longitude: number;
  latitude: number;
  speed: number;
  house: number;              // 1-12
  sign: string;               // "aries" | "taurus" | etc.
  nakshatra: string;          // e.g. "uttara_bhadrapada"
  pada: number;               // 1-4
  degree: number;             // 0-30
  degreeDMSFormatted: string; // e.g. "04:19:15"
  isRetrograde: boolean;
  dignity: string;            // "Exalted" | "Debilitated" | "Own" | "Neutral" | etc.
  nakshatraPada: number;
  aspects: Array<{ house: number; aspect: number; planets: string[] }>;
}

export interface VedicHouse {
  number: number;         // 1-12
  sign: string;
  cusp: number;
  lord: string;           // planet name
  planets: string[];
  planetsInHouse: string[];
  strength: number;
  significance: string[];
}

export interface VedicAscendant {
  sign: string;
  degree: number;
  degreeDMSFormatted: string;
  nakshatra: string;
  nakshatraPada: number;
}

export interface VedicDashaPeriod {
  planet: string;
  startDate: string; // ISO date string
  endDate: string;
  subPeriods: VedicDashaPeriod[];
}

export interface VedicDashas {
  vimshottari: {
    type: "vimshottari";
    dashaPeriods: VedicDashaPeriod[];
  };
}

export interface VedicYoga {
  name: string;
  type: "Raja" | "Dhana" | "Arishtabhanga" | "Neechabhanga" | "Other";
  description: string;
  planets: string[];
  houses: number[];
  strength: "Weak" | "Moderate" | "Strong";
}

export interface VedicAshtakavarga {
  bhinna: Record<string, Record<string, number[]>>;
  sarva: Record<string, number[]>;
}

/** One divisional chart (D1 = rasi, D9 = navamsa, etc.) */
export interface VedicDivisionalChart {
  planets: VedicPlanet[];
  houses: VedicHouse[];
  yogas: VedicYoga[];
  ashtakavarga?: VedicAshtakavarga; // populated on D1 only
  dashas: VedicDashas;              // only meaningful on D1
  ascendant: VedicAscendant;
  ayanamsa: number;
}

/**
 * Calculated birth chart stored in BirthProfile.chartDataVedic.
 * Produced locally by openastrology-library — not from an external API.
 * Divisional charts D1 (rasi) through D60.
 * Dashas are embedded in chartD1.dashas — no separate call needed.
 */
export interface VedicBirthChartResponse {
  birthInfo: {
    name: string;
    dateOfBirth: string;
    timeOfBirth: string;
    latitude: number;
    longitude: number;
    timezone: string;
    gender: string;
  };
  chartD1: VedicDivisionalChart;
  chartD2?: VedicDivisionalChart;
  chartD3?: VedicDivisionalChart;
  chartD4?: VedicDivisionalChart;
  chartD5?: VedicDivisionalChart;
  chartD6?: VedicDivisionalChart;
  chartD7?: VedicDivisionalChart;
  chartD8?: VedicDivisionalChart;
  chartD9?: VedicDivisionalChart;
  chartD10?: VedicDivisionalChart;
  chartD12?: VedicDivisionalChart;
  chartD16?: VedicDivisionalChart;
  chartD20?: VedicDivisionalChart;
  chartD24?: VedicDivisionalChart;
  chartD27?: VedicDivisionalChart;
  chartD30?: VedicDivisionalChart;
  chartD40?: VedicDivisionalChart;
  chartD45?: VedicDivisionalChart;
  chartD60?: VedicDivisionalChart;
  ayanamsa: string;
  houseSystem: string;
}

/**
 * VedicChart is what we store in KV and DB.
 * rawResponse is the full API payload for auditability.
 */
export interface VedicChart {
  rawResponse: VedicBirthChartResponse;
  // Convenience accessors — populated after rawResponse is received
  ascendant?: VedicAscendant;
  moonSign?: string;
  sunSign?: string;
  currentDasha?: VedicDashaPeriod;
  planets?: VedicPlanet[];
}

// ─── Transit ──────────────────────────────────────────────────────────────

/** TODO: confirm if transits require a separate endpoint */
export interface TransitData {
  rawResponse: unknown;
  date: string; // YYYY-MM-DD
}

// ─── Dasha ────────────────────────────────────────────────────────────────

/**
 * Dashas are embedded in VedicBirthChartResponse.chartD1.dashas
 * The DB Dasha model is populated by extracting from the birth chart response.
 */
export interface DashaPeriod {
  planetName: string;
  level: "mahadasha" | "antardasha";
  startDate: string;
  endDate: string;
}

// ─── Birth input ──────────────────────────────────────────────────────────

/**
 * BirthInput — all values must be in UTC before passing to the HD calculator.
 * The openhumandesign-library BirthInfo has no timezone field; callers are
 * responsible for converting local birth time → UTC upstream.
 */
export interface BirthInput {
  year: number;
  month: number;  // 1-12
  day: number;
  hour: number;   // 0-23 UTC; use 12 if birth time unknown (OB-04)
  minute: number; // 0-59 UTC
  second: number;
  latitude: number;
  longitude: number;
}

// STATUS: done | Task 1.1
// Shared types — used across the entire application.
// These are TypeScript types, not Prisma models.
// Prisma-generated types live in @prisma/client.

// ─── Subscription ─────────────────────────────────────────────────────────

export type SubscriptionTier = "FREE" | "CORE" | "VIP";

export type SubscriptionStatus = "active" | "cancelled" | "past_due";

// ─── Insights ─────────────────────────────────────────────────────────────

export type InsightType = "DAILY" | "WEEKLY" | "MONTHLY" | "HD_TIP";

// ─── Consultations ────────────────────────────────────────────────────────

export type ConsultationType = "SINGLE_90" | "VIP_QUARTERLY";

export type ConsultationStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

// ─── Human Design ─────────────────────────────────────────────────────────
// These mirror the openhumandesign-library types exactly.
// Source of truth: node_modules/openhumandesign-library/dist/types.d.ts

export type HDType =
  | "Generator"
  | "Manifesting Generator"
  | "Projector"
  | "Manifestor"
  | "Reflector";

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

export type HDProfile =
  | "1/3" | "1/4"
  | "2/4" | "2/5"
  | "3/5" | "3/6"
  | "4/6" | "4/1"
  | "5/1" | "5/2"
  | "6/2" | "6/3";

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

/** Matches BirthInfo from openhumandesign-library — all values in UTC */
export interface BirthInfo {
  year: number;
  month: number;    // 1-12
  day: number;
  hour: number;     // 0-23 UTC
  minute: number;   // 0-59 UTC
  second: number;
  latitude: number;
  longitude: number;
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

export interface HDChannel {
  gates: [number, number];
  centers: [HDCenterName, HDCenterName];
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

export interface HDIncarnationCross {
  type: HDCrossType;
  gates: {
    personalitySun: number;
    personalityEarth: number;
    designSun: number;
    designEarth: number;
  };
}

/** Full Human Design chart as returned by openhumandesign-library */
export interface HDChartData {
  type: HDType;
  strategy: string;
  signature: string;
  notSelfTheme: string;
  authority: HDAuthority;
  profile: HDProfile;
  definition: HDDefinition;
  incarnationCross: HDIncarnationCross;
  definedCenters: HDCenterName[];
  undefinedCenters: HDCenterName[];
  activeChannels: HDChannel[];
  activeGates: number[];
  variables: HDVariables;
  personality: HDPlanetaryActivation[];
  design: HDPlanetaryActivation[];
  designDate: string; // ISO string — Date serialised for storage
}

// ─── Vedic Astrology ──────────────────────────────────────────────────────

/**
 * TODO: tighten this type once the Vedic API response schema is confirmed.
 * DECISION NEEDED: Vedic API endpoint paths and response shapes — Task 3.5
 */
export type VedicChartData = Record<string, unknown>;

// ─── Report ───────────────────────────────────────────────────────────────

export interface ReportData {
  user: { email: string };
  hdChart: HDChartData;
  vedicChart: VedicChartData | null; // null until Vedic API endpoint confirmed
  birthProfile: {
    birthDate: Date;
    birthTime: string | null;
    birthLocation: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  generatedAt: Date;
}

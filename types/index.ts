// STATUS: done | Task 1.1
// STATUS: done | Task R.2
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
// STATUS: done | Task SP.1

export type SignNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type PlanetName =
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter'
  | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu'

export type Charakaraka =
  | 'Atmakaraka'       // AK  - soul's core lesson
  | 'Amatyakaraka'     // AmK - career / minister
  | 'Bhratrukaraka'    // BK  - siblings
  | 'Matrukaraka'      // MK  - mother
  | 'Pitrukaraka'      // PiK - father
  | 'Putrakaraka'      // PK  - children / creativity
  | 'Gnatikaraka'      // GK  - kinsmen / obstacles
  | 'Darakaraka'       // DK  - spouse / partnerships

export interface PlanetPosition {
  planet: PlanetName
  signNumber: SignNumber      // 1-12
  degreeInSign: number        // 0-29 whole degrees within the sign
  arcMinutes: number          // 0-59 minutes of arc (for precise CK tiebreaking)
  arcSeconds: number          // 0-59 seconds of arc (for precise CK tiebreaking)
}

export interface ArudhaLagnaResult {
  arudhaSignNumber: SignNumber
  lagnaSignNumber: SignNumber
  lagnaLord: PlanetName
  lordSignNumber: SignNumber
  stepsFromLagnaToLord: number
  exceptionApplied: 'none' | 'use_10th' | 'use_4th'
}

export interface GhatiLagnaResult {
  ghatiLagnaSignNumber: SignNumber
  ghatiLagnaDegree: number
  fullGhatikasSinceSunrise: number
  vighatikasFraction: number         // 0-59.99
  sunLongitudeAtSunrise: number
}

export interface BhavaLagnaResult {
  bhavaLagnaSignNumber: SignNumber
  bhavaLagnaDegree: number
  totalGhatikasSinceSunrise: number
  sunLongitudeAtSunrise: number
}

export interface HoraLagnaResult {
  horaLagnaSignNumber: SignNumber
  horaLagnaDegree: number
  totalGhatikasSinceSunrise: number
  sunLongitudeAtSunrise: number
}

export interface CharakarakaResult {
  rank: Charakaraka
  planet: PlanetName
  rankingDegree: number          // whole degrees (after Rahu inversion)
  rankingArcMinutes: number      // arc-minutes component (after Rahu inversion)
  rankingArcSeconds: number      // arc-seconds component (after Rahu inversion)
  rawDegreeInSign: number
  sharedRank: boolean            // true if another planet holds the identical longitude
}

export interface SthiraKarakaDeficit {
  missingRank: Charakaraka       // the Karaka position left vacant
  sthiraKaraka: PlanetName       // the constant significator to use instead
  reason: string                 // human-readable explanation
}

export interface CharakarakaSetResult {
  karakas: CharakarakaResult[]   // length 7 or 8 depending on deficit
  deficit: SthiraKarakaDeficit | null  // present only when a shared-rank tie occurred
}

export interface SpecialPointsResult {
  arudhaLagna:  ArudhaLagnaResult
  ghatiLagna:   GhatiLagnaResult
  bhavaLagna:   BhavaLagnaResult
  horaLagna:    HoraLagnaResult
  charakarakas: CharakarakaSetResult
}

export interface SpecialPointsInsights {
  lagnas: {
    AL: string
    GL: string
    HL: string
    BL: string
  }
  charakarakas: {
    Atmakaraka:    string
    Amatyakaraka:  string
    Bhratrukaraka: string
    Matrukaraka:   string
    Pitrukaraka:   string
    Putrakaraka:   string
    Gnatikaraka:   string
    Darakaraka:    string
  }
  generatedAt: string
}

/** Vedic natal chart data. Field names confirmed 2026-03-25 from Jyotish REST API. */
export interface VedicChartData {
  lagnaSignNumber: SignNumber
  planets: PlanetPosition[]
  sunriseData: {
    sunAbsoluteLongitude: number
    minutesSinceSunrise: number
  }
  [key: string]: unknown   // open for other Vedic API fields
}

// ─── Custom Report Builder ────────────────────────────────────────────────

export type ReportVariable =
  | 'hd_type_strategy' | 'hd_authority' | 'hd_profile'
  | 'hd_defined_centers' | 'hd_incarnation_cross'
  | 'vedic_natal_overview' | 'current_dasha' | 'dasha_guidance'
  | 'active_transits' | 'sade_sati_status'
  | 'career_purpose_theme' | 'relationship_theme'
  | 'shadow_growth_theme' | 'monthly_focus' | 'custom_note'

export interface CustomReportConfig {
  userId: string
  title: string
  variables: ReportVariable[]
  customNote?: string
  deliveryMode: 'preview' | 'email' | 'pdf'
}

export interface ReportSection {
  variable: ReportVariable
  label: string
  content: string
}

export interface CustomReportOutput {
  config: CustomReportConfig
  sections: ReportSection[]
  generatedAt: Date
  userEmail: string
}

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

// ─── Reports Marketplace ────────────────────────────────────────────────

export type ReportCategory =
  | "LIFE_PURPOSE"
  | "CAREER"
  | "RELATIONSHIPS"
  | "SHADOW_WORK"
  | "TIMING"
  | "HEALTH"
  | "FINANCE"
  | "CUSTOM";

export type ReportPurchaseStatus =
  | "PENDING"
  | "PAID"
  | "GENERATING"
  | "COMPLETE"
  | "FAILED";

export interface ReportProductSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  category: ReportCategory;
  priceUsd: number; // in cents
  isActive: boolean;
  sortOrder: number;
  coverImageUrl: string | null;
  estimatedWordCount: number;
}

export interface UserReportCard {
  purchaseId: string;
  product: ReportProductSummary;
  status: ReportPurchaseStatus;
  purchasedAt: string;
  generatedAt: string | null;
  wordCount: number | null;
}

export interface ReportContentResponse {
  purchaseId: string;
  productTitle: string;
  content: string; // full markdown text
  generatedAt: string;
  wordCount: number;
}

// For admin panel: full product with prompt
export interface ReportProductFull extends ReportProductSummary {
  geminiPrompt: string;
  createdBy: string;
  createdAt: string;
}

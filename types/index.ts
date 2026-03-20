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

/**
 * TODO: tighten this type once the Vedic API response schema is confirmed.
 * DECISION NEEDED: Vedic API endpoint paths and response shapes — Task 3.5
 */
export type VedicChartData = Record<string, unknown>;

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

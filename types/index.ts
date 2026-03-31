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
  /** From openastrology-library when mapped from Path 3 */
  isCombust?: boolean
  isRetrograde?: boolean
  /** Optional whole-sign house from D1 lagna (denormalized) */
  houseNumber?: number
}

/** Parashara yoga engine input — whole-sign, derived from stored Vedic chart */
export interface YogaChartInput {
  lagnaSignNumber: SignNumber
  planets: PlanetPosition[]
}

/** App-facing strength (lowercase) — distinct from openastrology-library Yoga.strength */
export type YogaStrength = 'strong' | 'moderate' | 'weak'

export type YogaCategory =
  | 'raj'
  | 'dhana'
  | 'daridra'
  | 'nabhasha'
  | 'pancha_mahapurusha'
  | 'lunar'
  | 'solar'
  | 'auspicious'
  | 'neechabhanga'
  | 'vipareeta_raj'
  | 'arishta'
  | 'other'

export interface YogaResult {
  name: string
  category: YogaCategory
  strength: YogaStrength
  bphsReference: string
  planetsInvolved: PlanetName[]
  housesInvolved: number[]
  plainDescription: string
  isActive: boolean
  shortTitle: string
  icon: string
  dashaActivated: boolean
}

export interface YogaDetectionResult {
  yogas: YogaResult[]
  activeCount: number
  strongCount: number
  dominantCategory: YogaCategory
  detectedAt: string
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
  /** BPHS: true = Sun @ sunrise base; false = Udaya Lagna base (night birth). */
  isDayBirth: boolean
  /** Base ecliptic longitude used for accumulation (sunrise or udaya lagna). */
  baseLongitudeUsed: number
  /** @deprecated Use !isDayBirth */
  isNightBirth?: boolean
}

export interface BhavaLagnaResult {
  bhavaLagnaSignNumber: SignNumber
  bhavaLagnaDegree: number
  totalGhatikasSinceSunrise: number
  sunLongitudeAtSunrise: number
  isDayBirth: boolean
  baseLongitudeUsed: number
  isNightBirth?: boolean
}

export interface HoraLagnaResult {
  horaLagnaSignNumber: SignNumber
  horaLagnaDegree: number
  totalGhatikasSinceSunrise: number
  sunLongitudeAtSunrise: number
  isDayBirth: boolean
  baseLongitudeUsed: number
  isNightBirth?: boolean
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

/** D1 Ascendant — sign always; degree when chart D1 ascendant is available. */
export interface NatalLagnaInfo {
  signNumber: SignNumber
  degreeInSign?: number
  arcMinutes?: number
  arcSeconds?: number
}

/** Whole-sign house from Lagna + rāśi + equal-division nakṣatra/pada (see vedicPointPlacement). */
export interface VedicPointPlacement {
  houseFromLagna: number
  rasiSignNumber: SignNumber
  rasiName: string
  nakshatra: string
  pada: number
}

/** Server-filled display metadata; absent on older KV until recomputed. */
export interface FoundationSpecialPointsPlacements {
  natalLagna?: VedicPointPlacement
  arudhaLagna: VedicPointPlacement
  ghatiLagna: VedicPointPlacement
  bhavaLagna: VedicPointPlacement
  horaLagna: VedicPointPlacement
  /** One entry per karaka row; a planet missing from the input array is omitted. */
  charakarakas: Partial<Record<Charakaraka, VedicPointPlacement>>
}

export interface ExtendedSpecialPointsPlacements {
  varnadaLagna: VedicPointPlacement
  pranapada: VedicPointPlacement
  upapadaLagna: VedicPointPlacement
  sreeLagna: VedicPointPlacement
  bhriguBindu: VedicPointPlacement
  beejaSphuta: VedicPointPlacement
  kshetraSphuta: VedicPointPlacement
  trisphuta: VedicPointPlacement | null
  dhoomaChain: {
    dhooma: VedicPointPlacement
    vyatipata: VedicPointPlacement
    parivesha: VedicPointPlacement
    indraChapa: VedicPointPlacement
    upaketu: VedicPointPlacement
  }
  kaalVelas: {
    gulika: VedicPointPlacement
    maandi: VedicPointPlacement
    kaala: VedicPointPlacement
    mrityu: VedicPointPlacement
    ardhaprahara: VedicPointPlacement
    yamaghantaka: VedicPointPlacement
  } | null
}

export interface SpecialPointsResult {
  /** Natal Lagna (D1); may be absent on older KV cache — use arudhaLagna.lagnaSignNumber as fallback */
  natalLagna?: NatalLagnaInfo
  arudhaLagna:  ArudhaLagnaResult
  ghatiLagna:   GhatiLagnaResult
  bhavaLagna:   BhavaLagnaResult
  horaLagna:    HoraLagnaResult
  charakarakas: CharakarakaSetResult
  placements?: FoundationSpecialPointsPlacements
}

// ─── Extended Special Points (SP-EXT) ────────────────────────────────────

export interface VarnadaLagnaResult {
  varnadaLagnaSignNumber: SignNumber
  lagnaIsOdd: boolean
  horaLagnaIsOdd: boolean
  countFromAries: number
  countFromHoraLagna: number
}

export type PranapadaStartingRule = 'from_sun' | 'from_9th_from_sun' | 'from_5th_from_sun'

export type SunSignModality = 'movable' | 'fixed' | 'dual'

/** BPHS Prāṇapada — Sun modality sets starting longitude; offset always additive (Special Points V2). */
export interface PranapadalagnaResult {
  pranapadalagnaSignNumber: SignNumber
  pranapadalagnaDegree: number
  sunSignNature: SunSignModality
  /** Normalised 0–360° — base longitude before time offset (Sun or Sun+120/+240). */
  startingLongitude: number
  vighatisSinceSunrise: number
  baseOffsetDegrees: number
  /** True when Prāṇapada falls in 2/4/5/9/10/11 from Lagna. */
  isFortunate: boolean
  houseFromLagna: number
  sunLongitudeAtSunrise: number
  /** @deprecated V1 — use sunSignNature / startingLongitude */
  sunSignAtSunrise?: SignNumber
  startingRule?: PranapadaStartingRule
  startingSignNumber?: SignNumber
  offsetDegrees?: number
}

export interface UpapadaLagnaResult {
  upapadaSignNumber: SignNumber
  twelfthHouseLord: PlanetName
  lordSignNumber: SignNumber
  stepsFromTwelfthToLord: number
  exceptionApplied: 'none' | 'use_10th_from_12th' | 'use_4th_from_12th'
}

export interface SreeLagnaResult {
  sreeLagnaSignNumber: SignNumber
  ninthLordFromLagnaKalas: number
  ninthLordFromMoonKalas: number
  totalKalas: number
  remainder: number
}

/** Bhrigu Bindu — short-arc midpoint between Moon and Rahu on the ecliptic (V2-06); Rahu uses chart longitude (no CK inversion). */
export interface BhriguBinduResult {
  bhriguBinduLongitude: number
  bhriguBinduSign: SignNumber
  bhriguBinduDegree: number
  moonLongitudeUsed: number
  rahuLongitudeUsed: number
}

export interface BeejaSphutaResult {
  beejaSphutaLongitude: number
  beejaSphutaSign: SignNumber
  beejaSphutaDegree: number
}

export interface KsheetraSphutaResult {
  kshetraSphutaLongitude: number
  kshetraSphutaSign: SignNumber
  kshetraSphutaDegree: number
}

export interface TriSphutaResult {
  triSphutaLongitude: number
  triSphutaSign: SignNumber
  triSphutaDegree: number
  gulikaLongitudeUsed: number
}

export interface DhoomaChainResult {
  dhooma: number
  vyatipata: number
  parivesha: number
  indraChapa: number
  upaketu: number
  dhoomaSign: SignNumber
  vyatipataSign: SignNumber
  pariveshaSign: SignNumber
  indraChapSign: SignNumber
  upaKetuSign: SignNumber
}

export type KaalVelaPlanet =
  | 'Gulika' | 'Maandi' | 'Kaala' | 'Mrityu' | 'Ardhaprahara' | 'Yamaghantaka'

export interface KaalVelaResult {
  planet: KaalVelaPlanet
  portionNumber: number
  startMinutesFromSunrise: number
  endMinutesFromSunrise: number
  /** Canonical longitude — V2: rising from Lagna at portion rules (Gulika=start, Maandi=Saturn mid, others=start). */
  referenceLongitude: number
  /** Same as referenceLongitude (legacy name for cached payloads). */
  midpointLongitude: number
  signNumber: SignNumber
  /** Gulika: Saturn portion start (min from sunrise). Maandi: Saturn portion midpoint. */
  portionAnchorMin?: number
}

export interface KaalVelaSetResult {
  gulika: KaalVelaResult
  maandi: KaalVelaResult
  kaala: KaalVelaResult
  mrityu: KaalVelaResult
  ardhaprahara: KaalVelaResult
  yamaghantaka: KaalVelaResult
}

export interface ExtendedSpecialPointsResult {
  varnadaLagna: VarnadaLagnaResult
  pranapada: PranapadalagnaResult
  upapadaLagna: UpapadaLagnaResult
  sreeLagna: SreeLagnaResult
  bhriguBindu: BhriguBinduResult
  beejaSphuata: BeejaSphutaResult
  kshetraSphuata: KsheetraSphutaResult
  trisphuta: TriSphutaResult | null
  dhoomaChain: DhoomaChainResult
  kaalVelas: KaalVelaSetResult | null
  placements?: ExtendedSpecialPointsPlacements
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

/** Re-export — canonical natal chart shape from local Swiss Ephemeris calculation. */
export type { VedicChartCalculations } from 'openastrology-library'

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
  /** Natal D1 from openastrology-library; null if not yet computed. */
  vedicChart: import('openastrology-library').VedicChartCalculations | null;
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

// ─── Personalized Muhurta (Vedic electional — transit × natal) ─────────────

export type MuhurtaIntentCategory =
  | "career"
  | "relationship"
  | "finance"
  | "health"
  | "travel"
  | "spiritual"
  | "all";

export type MuhurtaWindowColor = "green" | "amber" | "neutral" | "red";

export type AvasthaState = "awakened" | "active" | "sleeping";

export type HouseDomain =
  | "identity"
  | "wealth"
  | "communication"
  | "home"
  | "creativity"
  | "service"
  | "partnership"
  | "transformation"
  | "dharma"
  | "career"
  | "windfall"
  | "spiritual";

export interface MuhurtaWindowScoreBreakdown {
  functionalNature: "benefic" | "malefic" | "neutral";
  avasthaState: AvasthaState;
  ashtakavargaRekhas: number;
  virtualConjunctionDamage: boolean;
  dashaModifier: number;
  totalScore: number;
}

export interface PersonalizedMuhurtaWindow {
  id: string;
  startTime: string;
  endTime: string;
  planet: PlanetName;
  transitSignNumber: SignNumber;
  houseFromLagna: number;
  houseDomain: HouseDomain;
  color: MuhurtaWindowColor;
  scoreBreakdown: MuhurtaWindowScoreBreakdown;
  intentCategories: MuhurtaIntentCategory[];
  warningLabel: string | null;
}

export interface PersonalizedMuhurtaRequest {
  userId: string;
  startDate: Date;
  endDate: Date;
  intentFilter: MuhurtaIntentCategory;
}

export interface PersonalizedMuhurtaResponse {
  windows: PersonalizedMuhurtaWindow[];
  dashaContext: {
    mahadashaLord: PlanetName;
    antardashaLord: PlanetName;
    mahadashaEndDate: string;
    modifierApplied: number;
  } | null;
  generatedAt: string;
  cacheHit: boolean;
}

export interface SamudayaAshtakavarga {
  rekhasBySign: Record<SignNumber, number>;
}

export interface MuhurtaDashaContext {
  mahadashaLord: PlanetName;
  antardashaLord: PlanetName;
  mahadashaEndDate: Date;
  antardashaEndDate: Date;
}

/** Puruṣārtha (electional) heatmap tier — `volatile` = Gaṇḍānta or critical instability flag. */
export type PurusharthaHeatTier = "high" | "medium" | "low" | "volatile";

/** Sarvashtakavarga bindus on the sign transit Moon occupies (personal scan). */
export type PurusharthaSavBand = "drained" | "struggling" | "strong";

/** 50-point-base weighted engine components (detail panel). */
export interface PurusharthaWeightedScoreBreakdown {
  base: number;
  taraDelta: number;
  savDelta: number;
  tithiVaraDelta: number;
  drishtiDelta: number;
  gandantaDelta: number;
  total: number;
}

export interface PurusharthaMuhurtaSlotSummary {
  startIso: string;
  /** Weighted Puruṣārtha score (0–100), base 50 + Vedic adjustments. */
  score: number;
  heatTier: PurusharthaHeatTier;
  /** Pañcaka śuddhi reference (0–100), not mixed into weighted `score`. */
  electionScore: number;
  personalization: "full" | "unavailable";
  savMoonSignPoints: number | null;
  savBand: PurusharthaSavBand | null;
  /** Score ≥ 70 and not Gaṇḍānta — bright green in heatmap. */
  greenEligible: boolean;
  taraFault: boolean;
  /** Tara 7 (Naidhana) — strongest personal stress. */
  taraNaidhana: boolean;
  taraNumber: number | null;
  mantraRequired: boolean;
  mantraWarning: string | null;
  remedyHint: string | null;
  sadeSatiHeavy: boolean;
  tithiLabel: string;
  nakshatraLabel: string;
  yogaLabel: string;
  karanaLabel: string;
  vaaraLabel: string;
  lagnaSignNumber: SignNumber;
  lagnaLord: PlanetName;
  lagnaLordHouse: number | null;
  lagnaLordStrong: boolean;
  gandanta: boolean;
  gandantaReason: string | null;
  panchakaDeductions: string[];
}

export interface PurusharthaMuhurtaScanResponse {
  slots: PurusharthaMuhurtaSlotSummary[];
  intervalMinutes: number;
  windowHours: number;
  timeZone: string;
  latitude: number;
  longitude: number;
}

export interface PurusharthaMuhurtaDetailResponse {
  instantIso: string;
  score: number;
  heatTier: PurusharthaHeatTier;
  electionScore: number;
  personalization: "full" | "unavailable";
  savMoonSignPoints: number | null;
  savBand: PurusharthaSavBand | null;
  greenEligible: boolean;
  taraFault: boolean;
  taraNaidhana: boolean;
  taraNumber: number | null;
  mantraRequired: boolean;
  mantraWarning: string | null;
  remedyHint: string | null;
  sadeSatiHeavy: boolean;
  weightedBreakdown: PurusharthaWeightedScoreBreakdown;
  chart: import("openastrology-library").VedicChartCalculations;
  limbs: {
    tithi: { label: string; index1to30: number; indexInPaksha: number };
    nakshatra: { label: string; index0to26: number };
    yoga: string;
    karana: string;
    vaara: string;
  };
  lagnaSignNumber: SignNumber;
  lagnaLord: PlanetName;
  lagnaLordHouse: number | null;
  lagnaLordStrong: boolean;
  gandanta: boolean;
  gandantaReason: string | null;
  panchakaScore: number;
  panchakaDeductions: string[];
}

// ─── Chat types ───────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string  // ISO string
}

/** Client-side chat UI state (messages only). */
export interface ChatSession {
  messages: ChatMessage[]
}

/** One persisted conversation thread in Redis (Cosmic Chat). */
export interface ChatThreadSummary {
  id: string
  title: string
  updatedAt: string
}

export interface ChatRequest {
  message: string
  history: Array<{ role: ChatRole; content: string }>
  /** When omitted, server uses the user’s active thread. */
  sessionId?: string
}

export interface ChatResponse {
  response: string
  remaining: number | null   // null = unlimited (premium)
  resetAt: string | null     // ISO string, null if unlimited
  tier: SubscriptionTier
  warning?: boolean          // true when premium user approaches soft daily ceiling
  /** Active thread id (UUID, persisted in DB). */
  sessionId?: string
}

export interface ChatRateLimitResponse {
  error: 'RATE_LIMITED'
  remaining: 0
  resetAt: string
  upgradeMessage: string
}

export interface ChatErrorResponse {
  error: string
  detail?: string
}

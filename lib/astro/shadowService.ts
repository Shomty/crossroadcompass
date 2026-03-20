// STATUS: done | Premium Features - Shadow Work Portal
/**
 * lib/astro/shadowService.ts
 * 12th house analysis + Ketu patterns + undefined HD centers for shadow work.
 */

import type { BirthProfile } from "@prisma/client";
import type { VedicChart, VedicPlanet, VedicDivisionalChart } from "@/lib/astro/types";
import type { HDChartData, HDCenterName } from "@/types";
import { getOrCreateVedicChart, getOrCreateHDChart } from "@/lib/astro/chartService";

// ─── Types ────────────────────────────────────────────────────────────────

export interface ShadowPattern {
  source: "vedic" | "hd";
  name: string;
  description: string;
  theme: string;
}

export interface TwelfthHouseAnalysis {
  sign: string;
  lord: string;
  lordPlacement: {
    house: number;
    sign: string;
    dignity: string;
  };
  planetsIn12th: {
    name: string;
    dignity: string;
    interpretation: string;
  }[];
  ketuPlacement: {
    house: number;
    sign: string;
    nakshatra: string;
  } | null;
  ketuAspects: string[];
}

export interface UndefinedCenterAnalysis {
  center: HDCenterName;
  theme: string;
  shadowPattern: string;
  growthOpportunity: string;
}

export interface ShadowData {
  twelfthHouse: TwelfthHouseAnalysis;
  undefinedCenters: UndefinedCenterAnalysis[];
  shadowPatterns: ShadowPattern[];
  hdType: string;
  hdAuthority: string;
  notSelfTheme: string;
}

// ─── Sign Lords ───────────────────────────────────────────────────────────

const SIGN_LORDS: Record<string, string> = {
  aries: "Mars",
  taurus: "Venus",
  gemini: "Mercury",
  cancer: "Moon",
  leo: "Sun",
  virgo: "Mercury",
  libra: "Venus",
  scorpio: "Mars",
  sagittarius: "Jupiter",
  capricorn: "Saturn",
  aquarius: "Saturn",
  pisces: "Jupiter",
};

// ─── Planet Shadow Interpretations ────────────────────────────────────────

const PLANET_12TH_MEANINGS: Record<string, string> = {
  sun: "Hidden self-worth issues; fear of not being seen or recognized. Your creative essence may feel suppressed or unacknowledged.",
  moon: "Emotional patterns from the past; ancestral wounds. Deep sensitivity that you may hide from others.",
  mars: "Suppressed anger or assertiveness; fear of conflict. Energy that gets internalized rather than expressed.",
  mercury: "Communication blocks; overthinking in solitude. Ideas and thoughts you keep to yourself.",
  jupiter: "Hidden wisdom; spiritual seeking. Beliefs you hold privately that differ from what you show the world.",
  venus: "Secret desires; hidden pleasures. Relationship patterns that operate beneath your awareness.",
  saturn: "Deep fears of inadequacy; karmic debts. Responsibilities you avoid facing.",
  rahu: "Obsessive patterns; insatiable desires that operate unconsciously. Worldly attachments you hide.",
  ketu: "Past life patterns; spiritual detachment. What you're releasing in this lifetime.",
};

// ─── Undefined Center Meanings ────────────────────────────────────────────

const UNDEFINED_CENTER_SHADOWS: Record<HDCenterName, { theme: string; shadow: string; growth: string }> = {
  Head: {
    theme: "Mental pressure and inspiration",
    shadow: "Taking on others' mental pressure; feeling compelled to answer questions that aren't yours",
    growth: "Discern which inspirations are truly calling you vs. borrowed mental noise",
  },
  Ajna: {
    theme: "Certainty and conceptualization",
    shadow: "Trying to appear certain when you're not; pretending to know answers you don't have",
    growth: "Embrace your gift of seeing multiple perspectives without needing to land on one",
  },
  Throat: {
    theme: "Expression and manifestation",
    shadow: "Speaking to get attention; talking before the timing is right; forcing expression",
    growth: "Wait for invitations to speak; your words carry power when timed correctly",
  },
  G: {
    theme: "Identity and direction",
    shadow: "Trying on identities that aren't yours; getting lost in others' direction",
    growth: "Your identity is fluid—you reflect back what others need to see about themselves",
  },
  Heart: {
    theme: "Willpower and self-worth",
    shadow: "Over-promising to prove your worth; pushing through exhaustion to seem valuable",
    growth: "You don't need to prove anything—your worth isn't measured by willpower or achievement",
  },
  Sacral: {
    theme: "Life force and availability",
    shadow: "Not knowing when enough is enough; borrowing others' energy and burning out",
    growth: "Learn to recognize your natural energy limits and honor rest without guilt",
  },
  SolarPlexus: {
    theme: "Emotions and clarity",
    shadow: "Absorbing and amplifying others' emotions; avoiding confrontation to keep the peace",
    growth: "You're an emotional empath—learn to distinguish your feelings from others'",
  },
  Spleen: {
    theme: "Intuition and survival",
    shadow: "Holding onto things/people/situations past their expiration; ignoring intuitive warnings",
    growth: "Trust your spontaneous knowing—you receive wisdom in the moment, not in advance",
  },
  Root: {
    theme: "Pressure and adrenaline",
    shadow: "Taking on stress that isn't yours; feeling constantly rushed or under pressure",
    growth: "Recognize when pressure is external conditioning vs. genuine urgency",
  },
};

// ─── Ketu Nakshatra Themes ────────────────────────────────────────────────

const KETU_NAKSHATRA_THEMES: Record<string, string> = {
  ashwini: "Past mastery in healing; releasing the need to fix everything quickly",
  bharani: "Past lives dealing with death/transformation; releasing attachment to control life cycles",
  krittika: "Past authority and purification; releasing harsh self-criticism",
  rohini: "Past material abundance; releasing attachment to comfort and beauty",
  mrigashira: "Past seeking and searching; releasing the endless quest for answers",
  ardra: "Past destruction and transformation; releasing destructive patterns",
  punarvasu: "Past returns and renewals; releasing the cycle of always starting over",
  pushya: "Past nurturing roles; releasing over-responsibility for others",
  ashlesha: "Past psychic abilities; releasing manipulation patterns",
  magha: "Past royal or ancestral power; releasing lineage burdens",
  purva_phalguni: "Past creative/romantic expression; releasing pleasure-seeking patterns",
  uttara_phalguni: "Past service and contracts; releasing obligation-based relationships",
  hasta: "Past craftsmanship; releasing perfectionism",
  chitra: "Past artistic mastery; releasing vanity and image concerns",
  swati: "Past independence; releasing isolation patterns",
  vishakha: "Past ambition; releasing obsessive goal pursuit",
  anuradha: "Past devotion; releasing unhealthy attachments",
  jyeshtha: "Past seniority/leadership; releasing competitive patterns",
  moola: "Past investigation/research; releasing destructive curiosity",
  purva_ashadha: "Past invincibility; releasing over-confidence",
  uttara_ashadha: "Past achievement; releasing definition by accomplishments",
  shravana: "Past listening/learning; releasing information hoarding",
  dhanishta: "Past wealth/music; releasing material definition of success",
  shatabhisha: "Past healing/secrets; releasing need for privacy",
  purva_bhadrapada: "Past transformation; releasing extreme patterns",
  uttara_bhadrapada: "Past wisdom; releasing detachment patterns",
  revati: "Past compassion; releasing savior complex",
};

// ─── Analysis Functions ───────────────────────────────────────────────────

function analyzeTwelfthHouse(d1: VedicDivisionalChart): TwelfthHouseAnalysis {
  const twelfthHouse = d1.houses.find(h => h.number === 12);
  const twelfthSign = twelfthHouse?.sign?.toLowerCase() || "unknown";
  const twelfthLord = SIGN_LORDS[twelfthSign] || "Unknown";
  
  const lordPlanet = d1.planets.find(
    p => p.name.toLowerCase() === twelfthLord.toLowerCase()
  );
  
  const planetsIn12th = d1.planets
    .filter(p => p.house === 12)
    .map(p => ({
      name: capitalize(p.name),
      dignity: p.dignity || "neutral",
      interpretation: PLANET_12TH_MEANINGS[p.name.toLowerCase()] || "Influences the subconscious realm",
    }));
  
  const ketu = d1.planets.find(p => p.name.toLowerCase() === "ketu");
  const ketuPlacement = ketu ? {
    house: ketu.house,
    sign: capitalize(ketu.sign),
    nakshatra: ketu.nakshatra?.replace(/_/g, " ") || "unknown",
  } : null;
  
  const ketuAspects = ketu?.aspects
    ?.map(a => `Aspects house ${a.house}`)
    .slice(0, 3) || [];

  return {
    sign: capitalize(twelfthSign),
    lord: twelfthLord,
    lordPlacement: {
      house: lordPlanet?.house || 0,
      sign: capitalize(lordPlanet?.sign || "unknown"),
      dignity: lordPlanet?.dignity || "neutral",
    },
    planetsIn12th,
    ketuPlacement,
    ketuAspects,
  };
}

function analyzeUndefinedCenters(hdChart: HDChartData): UndefinedCenterAnalysis[] {
  return hdChart.undefinedCenters.map(center => {
    const centerData = UNDEFINED_CENTER_SHADOWS[center];
    return {
      center,
      theme: centerData.theme,
      shadowPattern: centerData.shadow,
      growthOpportunity: centerData.growth,
    };
  });
}

function identifyShadowPatterns(
  twelfthHouse: TwelfthHouseAnalysis,
  undefinedCenters: UndefinedCenterAnalysis[],
  hdChart: HDChartData
): ShadowPattern[] {
  const patterns: ShadowPattern[] = [];
  
  for (const planet of twelfthHouse.planetsIn12th) {
    patterns.push({
      source: "vedic",
      name: `${planet.name} in 12th House`,
      description: planet.interpretation,
      theme: "Subconscious Pattern",
    });
  }
  
  if (twelfthHouse.ketuPlacement) {
    const nakshatra = twelfthHouse.ketuPlacement.nakshatra.toLowerCase().replace(/\s/g, "_");
    const ketuTheme = KETU_NAKSHATRA_THEMES[nakshatra] || "Past life patterns being released";
    patterns.push({
      source: "vedic",
      name: `Ketu in ${twelfthHouse.ketuPlacement.sign} (House ${twelfthHouse.ketuPlacement.house})`,
      description: ketuTheme,
      theme: "Karmic Release",
    });
  }
  
  const topUndefined = undefinedCenters.slice(0, 3);
  for (const center of topUndefined) {
    patterns.push({
      source: "hd",
      name: `Undefined ${center.center} Center`,
      description: center.shadowPattern,
      theme: "Conditioning Vulnerability",
    });
  }
  
  patterns.push({
    source: "hd",
    name: `Not-Self Theme: ${hdChart.notSelfTheme}`,
    description: `When out of alignment, you experience ${hdChart.notSelfTheme.toLowerCase()}. This is your signal to return to your Strategy and Authority.`,
    theme: "Alignment Indicator",
  });
  
  return patterns;
}

// ─── Utility ──────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Main Export ──────────────────────────────────────────────────────────

/**
 * Analyze shadow patterns from both Vedic and HD charts.
 * Returns structured data for AI synthesis.
 */
export async function analyzeShadow(
  userId: string,
  birthProfile: BirthProfile
): Promise<ShadowData> {
  const [vedicChartRaw, hdChart] = await Promise.all([
    getOrCreateVedicChart(userId, birthProfile).catch(() => null),
    getOrCreateHDChart(userId, birthProfile),
  ]);
  
  const vedicChart = vedicChartRaw as unknown as VedicChart | null;
  const d1 = vedicChart?.rawResponse?.chartD1;
  
  const defaultTwelfthHouse: TwelfthHouseAnalysis = {
    sign: "Unknown",
    lord: "Unknown",
    lordPlacement: { house: 0, sign: "Unknown", dignity: "unknown" },
    planetsIn12th: [],
    ketuPlacement: null,
    ketuAspects: [],
  };
  
  const twelfthHouse = d1 ? analyzeTwelfthHouse(d1) : defaultTwelfthHouse;
  const undefinedCenters = analyzeUndefinedCenters(hdChart);
  const shadowPatterns = identifyShadowPatterns(twelfthHouse, undefinedCenters, hdChart);

  return {
    twelfthHouse,
    undefinedCenters,
    shadowPatterns,
    hdType: hdChart.type,
    hdAuthority: hdChart.authority,
    notSelfTheme: hdChart.notSelfTheme,
  };
}

/**
 * Get basic shadow data for FREE tier (no AI, just raw patterns).
 */
export async function getBasicShadowData(
  userId: string,
  birthProfile: BirthProfile
): Promise<{
  notSelfTheme: string;
  undefinedCentersCount: number;
  ketuHouse: number | null;
}> {
  const [vedicChartRaw, hdChart] = await Promise.all([
    getOrCreateVedicChart(userId, birthProfile).catch(() => null),
    getOrCreateHDChart(userId, birthProfile),
  ]);
  
  const vedicChart = vedicChartRaw as unknown as VedicChart | null;
  const d1 = vedicChart?.rawResponse?.chartD1;
  
  const ketu = d1?.planets?.find(p => p.name.toLowerCase() === "ketu");

  return {
    notSelfTheme: hdChart.notSelfTheme,
    undefinedCentersCount: hdChart.undefinedCenters.length,
    ketuHouse: ketu?.house || null,
  };
}

// STATUS: done | Premium Features - Purpose Decoder
/**
 * lib/astro/purposeService.ts
 * 10th house chain analysis + D10 divisional chart for career/purpose insights.
 * Integrates with HD Profile, Incarnation Cross, and Variables.
 */

import type { BirthProfile } from "@prisma/client";
import type { VedicChart, VedicPlanet, VedicHouse, VedicDivisionalChart } from "@/lib/astro/types";
import type { HDChartData, HDCenterName } from "@/types";
import { getOrCreateVedicChart, getOrCreateHDChart } from "@/lib/astro/chartService";

// ─── Types ────────────────────────────────────────────────────────────────

export interface CareerArchetype {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  planets: string[];
  hdTypes: string[];
}

export interface TenthHouseAnalysis {
  tenthHouseLord: string;
  tenthHouseSign: string;
  tenthHouseLordPlacement: {
    house: number;
    sign: string;
    dignity: string;
  };
  dispositorChain: string[];
  planetsInTenth: string[];
  aspects: string[];
}

export interface D10Analysis {
  ascendantSign: string;
  tenthLord: string;
  tenthLordPlacement: {
    house: number;
    sign: string;
  };
  strongestPlanet: string | null;
  yogas: string[];
}

export interface PurposeData {
  tenthHouse: TenthHouseAnalysis;
  d10: D10Analysis | null;
  hdProfile: string;
  hdType: string;
  hdAuthority: string;
  incarnationCross: {
    type: string;
    name: string;
    gates: number[];
  };
  definedCenters: HDCenterName[];
  undefinedCenters: HDCenterName[];
  variables: {
    digestion: string;
    environment: string;
    perspective: string;
    motivation: string;
  };
  matchedArchetypes: CareerArchetype[];
}

// ─── Career Archetypes ────────────────────────────────────────────────────

export const CAREER_ARCHETYPES: CareerArchetype[] = [
  {
    id: "visionary-leader",
    name: "The Visionary Leader",
    description: "Natural executive and strategic thinker who inspires others toward a shared vision.",
    keywords: ["leadership", "strategy", "vision", "authority", "management"],
    planets: ["Sun", "Jupiter"],
    hdTypes: ["Manifestor", "Projector"],
  },
  {
    id: "creative-innovator",
    name: "The Creative Innovator",
    description: "Originality flows through you—disrupting conventions and birthing new possibilities.",
    keywords: ["creativity", "innovation", "art", "design", "invention"],
    planets: ["Venus", "Rahu", "Mercury"],
    hdTypes: ["Manifesting Generator", "Generator"],
  },
  {
    id: "healer-guide",
    name: "The Healer & Guide",
    description: "Deep capacity to hold space for transformation and support others' wellbeing.",
    keywords: ["healing", "therapy", "counseling", "wellness", "medicine"],
    planets: ["Moon", "Neptune", "Ketu"],
    hdTypes: ["Projector", "Reflector"],
  },
  {
    id: "communicator-teacher",
    name: "The Communicator & Teacher",
    description: "Gift for translating complex ideas and inspiring learning in others.",
    keywords: ["teaching", "writing", "speaking", "media", "education"],
    planets: ["Mercury", "Jupiter"],
    hdTypes: ["Projector", "Manifesting Generator"],
  },
  {
    id: "builder-organizer",
    name: "The Builder & Organizer",
    description: "Creates lasting structures and systems that stand the test of time.",
    keywords: ["engineering", "architecture", "systems", "operations", "manufacturing"],
    planets: ["Saturn", "Mars"],
    hdTypes: ["Generator", "Manifesting Generator"],
  },
  {
    id: "entrepreneur-pioneer",
    name: "The Entrepreneur & Pioneer",
    description: "Thrives in uncharted territory, turning ideas into tangible ventures.",
    keywords: ["startup", "business", "risk-taking", "independence", "venture"],
    planets: ["Mars", "Rahu", "Sun"],
    hdTypes: ["Manifestor", "Manifesting Generator"],
  },
  {
    id: "researcher-analyst",
    name: "The Researcher & Analyst",
    description: "Deep dive investigator who uncovers hidden patterns and insights.",
    keywords: ["research", "analysis", "science", "data", "investigation"],
    planets: ["Mercury", "Saturn", "Ketu"],
    hdTypes: ["Projector", "Generator"],
  },
  {
    id: "diplomat-connector",
    name: "The Diplomat & Connector",
    description: "Natural mediator who builds bridges between people and ideas.",
    keywords: ["diplomacy", "negotiation", "HR", "partnerships", "networking"],
    planets: ["Venus", "Jupiter", "Moon"],
    hdTypes: ["Projector", "Reflector"],
  },
  {
    id: "protector-defender",
    name: "The Protector & Defender",
    description: "Driven to safeguard others through law, security, or advocacy.",
    keywords: ["law", "military", "security", "advocacy", "justice"],
    planets: ["Mars", "Saturn", "Sun"],
    hdTypes: ["Manifestor", "Generator"],
  },
  {
    id: "nurturer-caretaker",
    name: "The Nurturer & Caretaker",
    description: "Deep calling to care for others—children, elders, communities.",
    keywords: ["childcare", "eldercare", "social work", "hospitality", "service"],
    planets: ["Moon", "Venus", "Jupiter"],
    hdTypes: ["Generator", "Projector"],
  },
  {
    id: "performer-entertainer",
    name: "The Performer & Entertainer",
    description: "Magnetic presence that captivates audiences and spreads joy.",
    keywords: ["performance", "entertainment", "music", "acting", "sports"],
    planets: ["Sun", "Venus", "Rahu"],
    hdTypes: ["Manifesting Generator", "Manifestor"],
  },
  {
    id: "technologist-engineer",
    name: "The Technologist & Engineer",
    description: "Fascinated by how things work, building the systems of tomorrow.",
    keywords: ["technology", "software", "engineering", "IT", "automation"],
    planets: ["Mercury", "Saturn", "Rahu"],
    hdTypes: ["Generator", "Manifesting Generator"],
  },
  {
    id: "financial-strategist",
    name: "The Financial Strategist",
    description: "Understands the flow of resources and creates material abundance.",
    keywords: ["finance", "investment", "banking", "economics", "trading"],
    planets: ["Jupiter", "Venus", "Mercury"],
    hdTypes: ["Projector", "Manifesting Generator"],
  },
  {
    id: "spiritual-guide",
    name: "The Spiritual Guide",
    description: "Walks between worlds, helping others find meaning and transcendence.",
    keywords: ["spirituality", "coaching", "ministry", "philosophy", "astrology"],
    planets: ["Ketu", "Jupiter", "Neptune"],
    hdTypes: ["Projector", "Reflector"],
  },
  {
    id: "environmental-steward",
    name: "The Environmental Steward",
    description: "Called to protect and harmonize with the natural world.",
    keywords: ["environment", "sustainability", "agriculture", "conservation", "ecology"],
    planets: ["Moon", "Venus", "Saturn"],
    hdTypes: ["Generator", "Reflector"],
  },
  {
    id: "craftsperson-artisan",
    name: "The Craftsperson & Artisan",
    description: "Mastery through hands-on skill, creating beauty and utility.",
    keywords: ["crafts", "trades", "culinary", "fashion", "woodworking"],
    planets: ["Venus", "Mars", "Mercury"],
    hdTypes: ["Generator", "Manifesting Generator"],
  },
];

// ─── Sign to Lord Mapping ─────────────────────────────────────────────────

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

// ─── Incarnation Cross Names ──────────────────────────────────────────────

function getIncarnationCrossName(gates: { personalitySun: number; personalityEarth: number; designSun: number; designEarth: number }): string {
  const crossGates = [gates.personalitySun, gates.designSun];
  const crossMap: Record<string, string> = {
    "1,2": "The Sphinx",
    "3,50": "Laws",
    "4,49": "Explanation",
    "5,35": "Consciousness",
    "6,36": "Eden",
    "7,13": "The Sphinx",
    "8,14": "Contagion",
    "9,16": "Planning",
    "10,15": "The Vessel of Love",
    "11,12": "Education",
    "17,18": "Service",
    "19,33": "The Four Ways",
    "20,34": "The Sleeping Phoenix",
    "21,48": "Tension",
    "22,47": "Rulership",
    "23,43": "Assimilation",
    "24,44": "Incarnation",
    "25,46": "The Vessel of Love",
    "26,45": "The Trickster",
    "27,28": "The Unexpected",
    "29,30": "Contagion",
    "31,41": "The Unexpected",
    "32,42": "Maya",
    "37,40": "Planning",
    "38,39": "Tension",
    "51,57": "Penetration",
    "52,58": "Service",
    "53,54": "Penetration",
    "55,59": "Spirit",
    "56,60": "Laws",
    "61,62": "Maya",
    "63,64": "Consciousness",
  };
  
  const key = crossGates.sort((a, b) => a - b).join(",");
  return crossMap[key] || `Cross of ${gates.personalitySun}/${gates.designSun}`;
}

// ─── Analysis Functions ───────────────────────────────────────────────────

function analyzeTenthHouse(d1: VedicDivisionalChart): TenthHouseAnalysis {
  const tenthHouse = d1.houses.find(h => h.number === 10);
  const tenthSign = tenthHouse?.sign?.toLowerCase() || "unknown";
  const tenthLord = SIGN_LORDS[tenthSign] || "Unknown";
  
  const lordPlanet = d1.planets.find(
    p => p.name.toLowerCase() === tenthLord.toLowerCase()
  );
  
  const planetsInTenth = d1.planets
    .filter(p => p.house === 10)
    .map(p => capitalize(p.name));
  
  const dispositorChain = buildDispositorChain(d1.planets, tenthLord);
  
  const aspects = d1.planets
    .filter(p => p.aspects?.some(a => a.house === 10))
    .map(p => `${capitalize(p.name)} aspects 10th`);

  return {
    tenthHouseLord: tenthLord,
    tenthHouseSign: capitalize(tenthSign),
    tenthHouseLordPlacement: {
      house: lordPlanet?.house || 0,
      sign: capitalize(lordPlanet?.sign || "unknown"),
      dignity: lordPlanet?.dignity || "neutral",
    },
    dispositorChain,
    planetsInTenth,
    aspects,
  };
}

function buildDispositorChain(planets: VedicPlanet[], startPlanet: string, maxDepth = 4): string[] {
  const chain: string[] = [startPlanet];
  let current = startPlanet;
  
  for (let i = 0; i < maxDepth; i++) {
    const planet = planets.find(p => p.name.toLowerCase() === current.toLowerCase());
    if (!planet) break;
    
    const dispositor = SIGN_LORDS[planet.sign.toLowerCase()];
    if (!dispositor || chain.includes(dispositor)) break;
    
    chain.push(dispositor);
    current = dispositor;
  }
  
  return chain;
}

function analyzeD10(d10: VedicDivisionalChart | undefined): D10Analysis | null {
  if (!d10) return null;
  
  const ascSign = d10.ascendant?.sign?.toLowerCase() || "unknown";
  const tenthHouse = d10.houses.find(h => h.number === 10);
  const tenthSign = tenthHouse?.sign?.toLowerCase() || "unknown";
  const tenthLord = SIGN_LORDS[tenthSign] || "Unknown";
  
  const lordPlanet = d10.planets.find(
    p => p.name.toLowerCase() === tenthLord.toLowerCase()
  );
  
  const strongestPlanet = d10.planets.reduce<VedicPlanet | null>((strongest, planet) => {
    if (!strongest) return planet;
    const dignityScore = (p: VedicPlanet) => {
      const d = p.dignity?.toLowerCase() || "";
      if (d === "exalted") return 4;
      if (d === "own") return 3;
      if (d === "moolatrikona") return 3;
      if (d === "friendly") return 2;
      if (d === "neutral") return 1;
      if (d === "debilitated") return 0;
      return 1;
    };
    return dignityScore(planet) > dignityScore(strongest) ? planet : strongest;
  }, null);

  return {
    ascendantSign: capitalize(ascSign),
    tenthLord,
    tenthLordPlacement: {
      house: lordPlanet?.house || 0,
      sign: capitalize(lordPlanet?.sign || "unknown"),
    },
    strongestPlanet: strongestPlanet ? capitalize(strongestPlanet.name) : null,
    yogas: [],
  };
}

function matchArchetypes(
  tenthHouse: TenthHouseAnalysis,
  d10: D10Analysis | null,
  hdType: string
): CareerArchetype[] {
  const scores: { archetype: CareerArchetype; score: number }[] = [];
  
  for (const archetype of CAREER_ARCHETYPES) {
    let score = 0;
    
    if (archetype.hdTypes.includes(hdType)) {
      score += 3;
    }
    
    if (archetype.planets.includes(tenthHouse.tenthHouseLord)) {
      score += 2;
    }
    
    for (const planet of tenthHouse.planetsInTenth) {
      if (archetype.planets.includes(planet)) {
        score += 1;
      }
    }
    
    if (d10?.strongestPlanet && archetype.planets.includes(d10.strongestPlanet)) {
      score += 1;
    }
    
    if (score > 0) {
      scores.push({ archetype, score });
    }
  }
  
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.archetype);
}

// ─── Utility ──────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Main Export ──────────────────────────────────────────────────────────

/**
 * Analyze purpose/career data from both Vedic and HD charts.
 * Returns structured data for AI synthesis.
 */
export async function analyzePurpose(
  userId: string,
  birthProfile: BirthProfile
): Promise<PurposeData> {
  const [vedicChartRaw, hdChart] = await Promise.all([
    getOrCreateVedicChart(userId, birthProfile).catch(() => null),
    getOrCreateHDChart(userId, birthProfile),
  ]);
  
  const vedicChart = vedicChartRaw as unknown as VedicChart | null;
  const d1 = vedicChart?.rawResponse?.chartD1;
  const d10 = vedicChart?.rawResponse?.chartD10;
  
  const defaultTenthHouse: TenthHouseAnalysis = {
    tenthHouseLord: "Unknown",
    tenthHouseSign: "Unknown",
    tenthHouseLordPlacement: { house: 0, sign: "Unknown", dignity: "unknown" },
    dispositorChain: [],
    planetsInTenth: [],
    aspects: [],
  };
  
  const tenthHouse = d1 ? analyzeTenthHouse(d1) : defaultTenthHouse;
  const d10Analysis = analyzeD10(d10);
  const matchedArchetypes = matchArchetypes(tenthHouse, d10Analysis, hdChart.type);
  
  const crossGates = hdChart.incarnationCross.gates;
  const crossName = getIncarnationCrossName(crossGates);

  return {
    tenthHouse,
    d10: d10Analysis,
    hdProfile: hdChart.profile,
    hdType: hdChart.type,
    hdAuthority: hdChart.authority,
    incarnationCross: {
      type: hdChart.incarnationCross.type,
      name: crossName,
      gates: [
        crossGates.personalitySun,
        crossGates.personalityEarth,
        crossGates.designSun,
        crossGates.designEarth,
      ],
    },
    definedCenters: hdChart.definedCenters,
    undefinedCenters: hdChart.undefinedCenters,
    variables: {
      digestion: `${hdChart.variables.digestion.arrow} ${hdChart.variables.digestion.colorName}`,
      environment: `${hdChart.variables.environment.arrow} ${hdChart.variables.environment.colorName}`,
      perspective: `${hdChart.variables.perspective.arrow} ${hdChart.variables.perspective.colorName}`,
      motivation: `${hdChart.variables.motivation.arrow} ${hdChart.variables.motivation.colorName}`,
    },
    matchedArchetypes,
  };
}

/**
 * Get basic purpose data for FREE tier (no AI, just chart data).
 */
export async function getBasicPurposeData(
  userId: string,
  birthProfile: BirthProfile
): Promise<{
  hdProfile: string;
  hdType: string;
  incarnationCrossName: string;
  tenthHouseLord: string;
}> {
  const [vedicChartRaw, hdChart] = await Promise.all([
    getOrCreateVedicChart(userId, birthProfile).catch(() => null),
    getOrCreateHDChart(userId, birthProfile),
  ]);
  
  const vedicChart = vedicChartRaw as unknown as VedicChart | null;
  const d1 = vedicChart?.rawResponse?.chartD1;
  
  let tenthHouseLord = "Unknown";
  if (d1) {
    const tenthHouse = d1.houses.find(h => h.number === 10);
    const tenthSign = tenthHouse?.sign?.toLowerCase() || "";
    tenthHouseLord = SIGN_LORDS[tenthSign] || "Unknown";
  }
  
  const crossGates = hdChart.incarnationCross.gates;
  const crossName = getIncarnationCrossName(crossGates);

  return {
    hdProfile: hdChart.profile,
    hdType: hdChart.type,
    incarnationCrossName: crossName,
    tenthHouseLord,
  };
}

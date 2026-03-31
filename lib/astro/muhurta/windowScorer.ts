import type {
  PlanetName,
  SignNumber,
  MuhurtaWindowColor,
  MuhurtaWindowScoreBreakdown,
  AvasthaState,
  HouseDomain,
  MuhurtaIntentCategory,
} from "@/types";
import { getFunctionalNature } from "@/lib/astro/muhurta/functionalNature";
import type { VirtualConjunctionResult } from "@/lib/astro/muhurta/virtualConjunction";

const HOUSE_DOMAIN_MAP: Record<number, HouseDomain> = {
  1:  "identity",
  2:  "wealth",
  3:  "communication",
  4:  "home",
  5:  "creativity",
  6:  "service",
  7:  "partnership",
  8:  "transformation",
  9:  "dharma",
  10: "career",
  11: "windfall",
  12: "spiritual",
};

const INTENT_DOMAIN_MAP: Record<MuhurtaIntentCategory, HouseDomain[]> = {
  all: [],
  career:       ["career", "communication", "dharma"],
  relationship: ["partnership", "identity", "home"],
  finance:      ["wealth", "windfall", "career"],
  health:       ["service", "home", "identity"],
  travel:       ["dharma", "communication"],
  spiritual:    ["spiritual", "transformation", "dharma"],
};

export function colorFromScore(score: number): MuhurtaWindowColor {
  if (score >= 4) return "green";
  if (score >= 2) return "amber";
  if (score >= 0) return "neutral";
  return "red";
}

export function getHouseFromLagna(
  transitSignNumber: SignNumber,
  lagnaSignNumber: SignNumber
): number {
  return ((transitSignNumber - lagnaSignNumber + 12) % 12) + 1;
}

export function getHouseDomain(houseNumber: number): HouseDomain {
  return HOUSE_DOMAIN_MAP[houseNumber] ?? "identity";
}

export function intentCategoriesForHouseDomain(
  houseDomain: HouseDomain
): MuhurtaIntentCategory[] {
  const out: MuhurtaIntentCategory[] = [];
  for (const [intent, domains] of Object.entries(INTENT_DOMAIN_MAP) as [
    MuhurtaIntentCategory,
    HouseDomain[],
  ][]) {
    if (intent === "all") continue;
    if (domains.includes(houseDomain)) out.push(intent);
  }
  return out;
}

export interface ScoreInputs {
  planet: PlanetName;
  transitSignNumber: SignNumber;
  ashtakavargaRekhas: number;
  avasthaState: AvasthaState;
  virtualConjunction: VirtualConjunctionResult;
  dashaModifier: number;
  lagnaSignNumber: SignNumber;
}

export function scoreMuhurtaWindow(inputs: ScoreInputs): MuhurtaWindowScoreBreakdown {
  let score = 0;
  const functionalNature = getFunctionalNature(inputs.planet, inputs.lagnaSignNumber);

  if (functionalNature === "benefic") score += 2;

  if (inputs.ashtakavargaRekhas >= 30) score += 2;
  else if (inputs.ashtakavargaRekhas >= 25) score += 1;
  else score -= 2;

  if (inputs.avasthaState === "awakened") score += 2;
  else if (inputs.avasthaState === "active") score += 1;
  else score -= 2;

  if (inputs.virtualConjunction.isDamaged) score -= 2;

  score += inputs.dashaModifier;

  return {
    functionalNature,
    avasthaState: inputs.avasthaState,
    ashtakavargaRekhas: inputs.ashtakavargaRekhas,
    virtualConjunctionDamage: inputs.virtualConjunction.isDamaged,
    dashaModifier: inputs.dashaModifier,
    totalScore: Math.round(score * 10) / 10,
  };
}

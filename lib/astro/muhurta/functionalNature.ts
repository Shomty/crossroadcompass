import type { PlanetName, SignNumber } from "@/types";

type FunctionalClass = "benefic" | "malefic" | "neutral";

const FUNCTIONAL_NATURE_TABLE: Record<
  SignNumber,
  { benefics: PlanetName[]; malefics: PlanetName[] }
> = {
  1:  { benefics: ["Sun", "Mars", "Jupiter"],          malefics: ["Mercury", "Venus", "Saturn", "Rahu", "Ketu"] },
  2:  { benefics: ["Mercury", "Saturn"],               malefics: ["Jupiter", "Sun", "Moon", "Mars", "Rahu", "Ketu"] },
  3:  { benefics: ["Venus", "Saturn"],                 malefics: ["Mars", "Jupiter", "Sun", "Rahu", "Ketu"] },
  4:  { benefics: ["Moon", "Mars", "Jupiter"],         malefics: ["Mercury", "Venus", "Saturn", "Rahu", "Ketu"] },
  5:  { benefics: ["Sun", "Mars", "Jupiter"],          malefics: ["Mercury", "Venus", "Saturn", "Rahu", "Ketu"] },
  6:  { benefics: ["Mercury", "Venus"],                malefics: ["Mars", "Moon", "Jupiter", "Sun", "Rahu", "Ketu"] },
  7:  { benefics: ["Mercury", "Saturn", "Venus"],      malefics: ["Mars", "Jupiter", "Sun", "Moon", "Rahu", "Ketu"] },
  8:  { benefics: ["Moon", "Jupiter"],                 malefics: ["Mercury", "Venus", "Saturn", "Rahu", "Ketu"] },
  9:  { benefics: ["Sun", "Mars", "Jupiter"],          malefics: ["Mercury", "Venus", "Saturn", "Rahu", "Ketu"] },
  10: { benefics: ["Mercury", "Venus", "Saturn"],      malefics: ["Mars", "Moon", "Jupiter", "Sun", "Rahu", "Ketu"] },
  11: { benefics: ["Venus", "Saturn"],                 malefics: ["Mars", "Moon", "Jupiter", "Sun", "Rahu", "Ketu"] },
  12: { benefics: ["Moon", "Mars", "Jupiter"],         malefics: ["Mercury", "Venus", "Saturn", "Rahu", "Ketu"] },
};

export function getFunctionalNature(
  planet: PlanetName,
  lagnaSignNumber: SignNumber
): FunctionalClass {
  const table = FUNCTIONAL_NATURE_TABLE[lagnaSignNumber];
  if (table.benefics.includes(planet)) return "benefic";
  if (table.malefics.includes(planet)) return "malefic";
  return "neutral";
}

export function getFunctionalMalefics(lagnaSignNumber: SignNumber): PlanetName[] {
  return FUNCTIONAL_NATURE_TABLE[lagnaSignNumber].malefics;
}

import type { PlanetName, PlanetPosition, SignNumber } from "@/types";
import { planetAbsoluteLongitude } from "@/lib/astro/specialPoints";
import { getFunctionalMalefics } from "@/lib/astro/muhurta/functionalNature";

const VIRTUAL_CONJUNCTION_ORB_DEGREES = 5;

export function angularSeparation(longA: number, longB: number): number {
  const diff = Math.abs(((longA - longB + 540) % 360) - 180);
  return diff;
}

export interface VirtualConjunctionResult {
  isDamaged: boolean;
  nearestMaleficPlanet: PlanetName | null;
  separationDegrees: number | null;
  warningLabel: string | null;
}

export function checkVirtualConjunction(
  transitPlanet: PlanetName,
  transitLongitude: number,
  natalPlanets: PlanetPosition[],
  lagnaSignNumber: SignNumber
): VirtualConjunctionResult {
  const functionalMalefics = getFunctionalMalefics(lagnaSignNumber);

  let closestSeparation = Infinity;
  let closestMalefic: PlanetName | null = null;

  for (const natalPlanet of natalPlanets) {
    if (!functionalMalefics.includes(natalPlanet.planet)) continue;
    if (natalPlanet.planet === transitPlanet) continue;

    const natalLongitude = planetAbsoluteLongitude(natalPlanet);
    const sep = angularSeparation(transitLongitude, natalLongitude);

    if (sep < closestSeparation) {
      closestSeparation = sep;
      closestMalefic = natalPlanet.planet;
    }
  }

  if (closestSeparation <= VIRTUAL_CONJUNCTION_ORB_DEGREES && closestMalefic) {
    return {
      isDamaged: true,
      nearestMaleficPlanet: closestMalefic,
      separationDegrees: Math.round(closestSeparation * 100) / 100,
      warningLabel: `Damaged: within ${closestSeparation.toFixed(1)}° of natal ${closestMalefic}`,
    };
  }

  return {
    isDamaged: false,
    nearestMaleficPlanet: null,
    separationDegrees: closestSeparation === Infinity ? null : closestSeparation,
    warningLabel: null,
  };
}

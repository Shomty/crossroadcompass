// STATUS: done | Task YG.6–YG.8
/**
 * Parashara whole-sign graha drishtis (full special aspects + 7th).
 */

import type { PlanetName, PlanetPosition, SignNumber } from '@/types'
import { advanceSigns } from '@/lib/astro/specialPoints'

export interface GrahaDrishti {
  fromPlanet: PlanetName
  fromSign: SignNumber
  /** Signs that receive this planet’s full aspect */
  aspectSigns: SignNumber[]
}

function aspectHousesFor(planet: PlanetName): readonly number[] {
  switch (planet) {
    case 'Sun':
    case 'Moon':
    case 'Mercury':
    case 'Venus':
      return [7]
    case 'Mars':
      return [4, 7, 8]
    case 'Jupiter':
      return [5, 7, 9]
    case 'Saturn':
      return [3, 10]
    case 'Rahu':
    case 'Ketu':
      return [5, 7, 9]
    default:
      return [7]
  }
}

export function aspectTargetSigns(fromSign: SignNumber, planet: PlanetName): SignNumber[] {
  const steps = aspectHousesFor(planet)
  const out: SignNumber[] = []
  for (const s of steps) {
    out.push(advanceSigns(fromSign, s))
  }
  return out
}

export function calculateAllGrahaDrishtis(planets: PlanetPosition[]): GrahaDrishti[] {
  return planets.map((p) => ({
    fromPlanet: p.planet,
    fromSign: p.signNumber,
    aspectSigns: aspectTargetSigns(p.signNumber, p.planet),
  }))
}

/** True if `aspector` fully aspects `targetSign` by Parashara sign-based drishti */
export function planetAspectsSign(aspector: PlanetPosition, targetSign: SignNumber): boolean {
  return aspectTargetSigns(aspector.signNumber, aspector.planet).includes(targetSign)
}

/** Mutual full aspect between two occupied signs */
export function mutualAspect(a: PlanetPosition, b: PlanetPosition): boolean {
  return planetAspectsSign(a, b.signNumber) && planetAspectsSign(b, a.signNumber)
}

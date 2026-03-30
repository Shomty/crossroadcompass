// STATUS: done | Task YG.7
/** Gaj Kesari, Amal, Lakshmi, Parvat, Kahal — BPHS Ch.40 */

import type { GrahaDrishti } from '@/lib/astro/yoga/grahaDrishti'
import type { PlanetPosition, SignNumber, YogaResult } from '@/types'
import { advanceSigns, countSignsBetween, getPrimaryLord } from '@/lib/astro/specialPoints'
import { KENDRA_HOUSES, KONA_HOUSES, NATURAL_BENEFICS } from '@/lib/astro/yoga/constants'
import { signToHouse } from '@/lib/astro/yoga/signToHouse'

function isOwnSign(planet: import('@/types').PlanetName, sign: SignNumber): boolean {
  const ownSigns: Partial<Record<import('@/types').PlanetName, SignNumber[]>> = {
    Sun: [5],
    Moon: [4],
    Mars: [1, 8],
    Mercury: [3, 6],
    Jupiter: [9, 12],
    Venus: [2, 7],
    Saturn: [10, 11],
  }
  return ownSigns[planet]?.includes(sign) ?? false
}

function isExaltationSign(planet: import('@/types').PlanetName, sign: SignNumber): boolean {
  const exaltSigns: Partial<Record<import('@/types').PlanetName, SignNumber>> = {
    Sun: 1,
    Moon: 2,
    Mars: 10,
    Mercury: 6,
    Jupiter: 4,
    Venus: 12,
    Saturn: 7,
    Rahu: 3,
    Ketu: 9,
  }
  return exaltSigns[planet] === sign
}

export function detectAuspiciousYogas(
  planets: PlanetPosition[],
  lagnaSign: SignNumber,
  _allDrishtis: GrahaDrishti[]
): YogaResult[] {
  const yogas: YogaResult[] = []
  const houseOf = (p: import('@/types').PlanetName) => {
    const pos = planets.find((x) => x.planet === p)
    return pos ? signToHouse(pos.signNumber, lagnaSign) : null
  }

  const push = (y: Omit<YogaResult, 'dashaActivated'>) =>
    yogas.push({ ...y, dashaActivated: false })

  const moon = planets.find((p) => p.planet === 'Moon')
  const jupiter = planets.find((p) => p.planet === 'Jupiter')

  if (moon && jupiter) {
    const jupHouseFromMoon = countSignsBetween(moon.signNumber, jupiter.signNumber)
    const isKendraFromMoon = [1, 4, 7, 10].includes(jupHouseFromMoon)
    const isDebil = jupiter.signNumber === 10
    const isCombust = jupiter.isCombust === true
    if (isKendraFromMoon && !isDebil && !isCombust) {
      push({
        name: 'Gaj Kesari Yoga',
        shortTitle: 'Gaj Kesari — Elephant-Lion',
        category: 'auspicious',
        strength: 'strong',
        bphsReference: 'BPHS Ch.40 v.1',
        planetsInvolved: ['Jupiter', 'Moon'],
        housesInvolved: [
          signToHouse(moon.signNumber, lagnaSign),
          signToHouse(jupiter.signNumber, lagnaSign),
        ],
        icon: '🦁',
        plainDescription:
          "Jupiter in an angular house from the Moon, neither debilitated nor combust. Gaj Kesari is one of Parashara's most celebrated Yogas — wisdom, fame, and generosity that outlasts the native.",
        isActive: true,
      })
    }
  }

  const planetsIn10thLagna = planets.filter((p) => houseOf(p.planet) === 10)
  const planetsIn10thMoon = moon
    ? planets.filter((p) => countSignsBetween(moon.signNumber, p.signNumber) === 10)
    : []

  const checkAmal = (tenthPlanets: PlanetPosition[], from: 'Lagna' | 'Moon') => {
    if (tenthPlanets.length === 0) return
    const allBenefics = tenthPlanets.every((p) => NATURAL_BENEFICS.includes(p.planet))
    if (allBenefics) {
      push({
        name: `Amal Yoga (from ${from})`,
        shortTitle: 'Amal — Pure Tenth',
        category: 'auspicious',
        strength: 'moderate',
        bphsReference: 'BPHS Ch.40 v.3',
        planetsInvolved: tenthPlanets.map((p) => p.planet),
        housesInvolved: [10],
        icon: '🌿',
        plainDescription: `Only benefics occupy the 10th house from ${from}. Amal Yoga grants a spotless reputation and lasting fame. Career achievements are built through virtue and sincerity rather than ambition alone.`,
        isActive: true,
      })
    }
  }

  checkAmal(planetsIn10thLagna, 'Lagna')
  const sameRefs =
    planetsIn10thMoon.length === planetsIn10thLagna.length &&
    planetsIn10thMoon.every((p, i) => p.planet === planetsIn10thLagna[i]?.planet)
  if (!sameRefs) checkAmal(planetsIn10thMoon, 'Moon')

  const ninthHouseSign = advanceSigns(lagnaSign, 9)
  const ninthLord = getPrimaryLord(ninthHouseSign)
  const ninthLordPos = planets.find((p) => p.planet === ninthLord)
  const lagnaLord = getPrimaryLord(lagnaSign)
  const lagnaLordPos = planets.find((p) => p.planet === lagnaLord)

  if (ninthLordPos && lagnaLordPos) {
    const ninthLordHouse = signToHouse(ninthLordPos.signNumber, lagnaSign)
    const ninthLordInKendra = KENDRA_HOUSES.includes(ninthLordHouse as 1 | 4 | 7 | 10)
    const ninthLordOwnOrExalt =
      isOwnSign(ninthLord, ninthLordPos.signNumber) ||
      isExaltationSign(ninthLord, ninthLordPos.signNumber)
    const lagnaLordHouse = signToHouse(lagnaLordPos.signNumber, lagnaSign)
    const lagnaLordStrong =
      KENDRA_HOUSES.includes(lagnaLordHouse as 1 | 4 | 7 | 10) ||
      KONA_HOUSES.includes(lagnaLordHouse as 1 | 5 | 9) ||
      isOwnSign(lagnaLord, lagnaLordPos.signNumber) ||
      isExaltationSign(lagnaLord, lagnaLordPos.signNumber)

    if (ninthLordInKendra && ninthLordOwnOrExalt && lagnaLordStrong) {
      push({
        name: 'Lakshmi Yoga',
        shortTitle: 'Lakshmi — Goddess of Wealth',
        category: 'auspicious',
        strength: 'strong',
        bphsReference: 'BPHS Ch.40 v.5',
        planetsInvolved: [ninthLord, lagnaLord],
        housesInvolved: [ninthLordHouse, lagnaLordHouse],
        icon: '💰',
        plainDescription: `The 9th lord (${ninthLord}) is in a Kendra in strength, and the Lagna lord (${lagnaLord}) is also strong. Lakshmi Yoga confers material prosperity, royal favor, and a fortunate life aligned with dharma.`,
        isActive: ninthLordPos.isCombust !== true,
      })
    }
  }

  const beneficsInKendra = planets.filter(
    (p) =>
      NATURAL_BENEFICS.includes(p.planet) &&
      KENDRA_HOUSES.includes(houseOf(p.planet) as 1 | 4 | 7 | 10)
  )
  const planetsIn7th = planets.filter((p) => houseOf(p.planet) === 7)
  const planetsIn8th = planets.filter((p) => houseOf(p.planet) === 8)
  const seventhClear = planetsIn7th.every((p) => NATURAL_BENEFICS.includes(p.planet))
  const eighthClear = planetsIn8th.every((p) => NATURAL_BENEFICS.includes(p.planet))

  if (beneficsInKendra.length >= 2 && seventhClear && eighthClear) {
    push({
      name: 'Parvat Yoga',
      shortTitle: 'Parvat — The Mountain',
      category: 'auspicious',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.40 v.7',
      planetsInvolved: beneficsInKendra.map((p) => p.planet),
      housesInvolved: [...new Set(beneficsInKendra.map((p) => houseOf(p.planet)!))],
      icon: '⛰️',
      plainDescription:
        'Benefics in angular houses with clear 7th and 8th. Parvat Yoga produces enduring prosperity and a peaceful life — stable, elevated, with solid financial and social standing.',
      isActive: true,
    })
  }

  const fourthHouseSign = advanceSigns(lagnaSign, 4)
  const fourthLord = getPrimaryLord(fourthHouseSign)
  const fourthLordPos = planets.find((p) => p.planet === fourthLord)

  if (fourthLordPos && jupiter) {
    const sep = countSignsBetween(fourthLordPos.signNumber, jupiter.signNumber)
    const isMutualKendra = [1, 4, 7, 10].includes(sep)
    if (isMutualKendra) {
      const h4 = houseOf(fourthLord)!
      const hj = houseOf('Jupiter')!
      push({
        name: 'Kahal Yoga',
        shortTitle: 'Kahal — The Drum',
        category: 'auspicious',
        strength: 'moderate',
        bphsReference: 'BPHS Ch.40 v.9',
        planetsInvolved: [fourthLord, 'Jupiter'],
        housesInvolved: [h4, hj],
        icon: '🥁',
        plainDescription: `The 4th lord (${fourthLord}) and Jupiter are in Kendra from each other. Kahal Yoga grants determination, authority, and command; often linked to property and vehicles.`,
        isActive: jupiter.isCombust !== true,
      })
    }
  }

  return yogas
}

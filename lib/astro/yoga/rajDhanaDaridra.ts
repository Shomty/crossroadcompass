// STATUS: done | Task YG.6–YG.8
/** Raj Yoga (Kendra–Kona), Dhana and Daridra — simplified BPHS-style rules */

import type { PlanetName, PlanetPosition, SignNumber, YogaResult } from '@/types'
import { advanceSigns, getPrimaryLord } from '@/lib/astro/specialPoints'
import { KENDRA_HOUSES, KONA_HOUSES, TRIKA_HOUSES } from '@/lib/astro/yoga/constants'
import { mutualAspect } from '@/lib/astro/yoga/grahaDrishti'
import { signToHouse } from '@/lib/astro/yoga/signToHouse'

const DEBIL_SIGN: Partial<Record<PlanetName, SignNumber>> = {
  Sun: 7,
  Moon: 8,
  Mars: 4,
  Mercury: 12,
  Jupiter: 10,
  Venus: 6,
  Saturn: 1,
}

export function detectRajYogas(
  planets: PlanetPosition[],
  lagnaSign: SignNumber,
  _drishtis: import('@/lib/astro/yoga/grahaDrishti').GrahaDrishti[]
): YogaResult[] {
  const yogas: YogaResult[] = []
  const seen = new Set<string>()

  for (const kH of KENDRA_HOUSES) {
    for (const oH of KONA_HOUSES) {
      if (kH === oH) continue
      const signK = advanceSigns(lagnaSign, kH as SignNumber)
      const signO = advanceSigns(lagnaSign, oH as SignNumber)
      const lk = getPrimaryLord(signK)
      const lo = getPrimaryLord(signO)
      if (lk === lo) continue
      const pk = planets.find((p) => p.planet === lk)
      const po = planets.find((p) => p.planet === lo)
      if (!pk || !po) continue

      const conj = pk.signNumber === po.signNumber
      const parivartana = pk.signNumber === signO && po.signNumber === signK
      const asp = mutualAspect(pk, po)

      if (conj || parivartana || asp) {
        const key = [lk, lo].sort().join('|')
        if (seen.has(key)) continue
        seen.add(key)
        let how = 'mutual aspect'
        if (conj) how = 'conjunction'
        if (parivartana) how = 'parivartana (exchange)'
        yogas.push({
          name: `Raj Yoga (${lk}–${lo})`,
          shortTitle: `Raj — ${lk} & ${lo}`,
          category: 'raj',
          strength: parivartana ? 'strong' : conj ? 'strong' : 'moderate',
          bphsReference: 'BPHS Ch.34',
          planetsInvolved: [lk, lo],
          housesInvolved: [kH, oH],
          icon: '👑',
          plainDescription: `Lord of the ${kH}th house (${lk}) and lord of the ${oH}th house (${lo}) connect by ${how}. A classical Raj Yoga limb — authority and recognition may unfold when dasha and other factors support.`,
          isActive: true,
          dashaActivated: false,
        })
      }
    }
  }
  return yogas
}

export function detectDhanaYogas(planets: PlanetPosition[], lagnaSign: SignNumber): YogaResult[] {
  const yogas: YogaResult[] = []
  const sign2 = advanceSigns(lagnaSign, 2)
  const sign11 = advanceSigns(lagnaSign, 11)
  const l2 = getPrimaryLord(sign2)
  const l11 = getPrimaryLord(sign11)
  const p2 = planets.find((p) => p.planet === l2)
  const p11 = planets.find((p) => p.planet === l11)
  const jup = planets.find((p) => p.planet === 'Jupiter')

  const push = (y: Omit<YogaResult, 'dashaActivated'>) =>
    yogas.push({ ...y, dashaActivated: false })

  if (p2 && signToHouse(p2.signNumber, lagnaSign) === 11) {
    push({
      name: 'Dhana Yoga (2nd lord in 11th)',
      shortTitle: 'Dhana — Gains Lord',
      category: 'dhana',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.41',
      planetsInvolved: [l2],
      housesInvolved: [2, 11],
      icon: '💎',
      plainDescription:
        'The 2nd lord occupies the 11th house — a classical wealth linkage between savings and gains, supportive for income growth over time.',
      isActive: true,
    })
  }

  if (p11 && signToHouse(p11.signNumber, lagnaSign) === 2) {
    push({
      name: 'Dhana Yoga (11th lord in 2nd)',
      shortTitle: 'Dhana — Wealth Link',
      category: 'dhana',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.41',
      planetsInvolved: [l11],
      housesInvolved: [11, 2],
      icon: '💎',
      plainDescription:
        'The 11th lord occupies the 2nd house — gains flow into accumulated resources; favorable for financial stability through networks and effort.',
      isActive: true,
    })
  }

  if (jup) {
    const hj = signToHouse(jup.signNumber, lagnaSign)
    if (hj === 2 || hj === 11) {
      push({
        name: 'Dhana Yoga (Jupiter in 2/11)',
        shortTitle: 'Dhana — Jupiter Gains',
        category: 'dhana',
        strength: 'moderate',
        bphsReference: 'BPHS Ch.41',
        planetsInvolved: ['Jupiter'],
        housesInvolved: [hj],
        icon: '💎',
        plainDescription:
          'Jupiter occupies the 2nd or 11th house — expansion of wealth, values, or supportive alliances; classical dhana support when Jupiter is strong.',
        isActive: jup.isCombust !== true && jup.signNumber !== 10,
      })
    }
  }

  return yogas
}

export function detectDaridraYogas(planets: PlanetPosition[], lagnaSign: SignNumber): YogaResult[] {
  const yogas: YogaResult[] = []
  const sign2 = advanceSigns(lagnaSign, 2)
  const sign11 = advanceSigns(lagnaSign, 11)
  const l2 = getPrimaryLord(sign2)
  const l11 = getPrimaryLord(sign11)
  const p2 = planets.find((p) => p.planet === l2)
  const p11 = planets.find((p) => p.planet === l11)

  const push = (y: Omit<YogaResult, 'dashaActivated'>) =>
    yogas.push({ ...y, dashaActivated: false })

  if (p2) {
    const h = signToHouse(p2.signNumber, lagnaSign)
    if (TRIKA_HOUSES.includes(h as 6 | 8 | 12)) {
      push({
        name: 'Daridra Yoga (2nd lord in dusthana)',
        shortTitle: 'Daridra — 2nd Lord Weak',
        category: 'daridra',
        strength: 'moderate',
        bphsReference: 'BPHS Ch.42',
        planetsInvolved: [l2],
        housesInvolved: [2, h],
        icon: '📉',
        plainDescription:
          'The 2nd lord occupies a dusthana (6th, 8th, or 12th) — strain on savings, speech, or family resources; mitigated by dignity, cancellation, and strong dasha support.',
        isActive: true,
      })
    }
  }

  if (p11) {
    const ds = DEBIL_SIGN[l11]
    if (ds !== undefined && p11.signNumber === ds) {
      push({
        name: 'Daridra Yoga (11th lord debilitated)',
        shortTitle: 'Daridra — Gains Lord Weak',
        category: 'daridra',
        strength: 'moderate',
        bphsReference: 'BPHS Ch.42',
        planetsInvolved: [l11],
        housesInvolved: [11],
        icon: '📉',
        plainDescription:
          'The 11th lord is debilitated — gains and alliances may require more effort or mature over time; classical adversity to income flow unless cancelled.',
        isActive: true,
      })
    }
  }

  return yogas
}

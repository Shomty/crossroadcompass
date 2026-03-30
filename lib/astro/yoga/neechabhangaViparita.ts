// STATUS: done | Task YG.6
/** Neechabhanga Raj Yoga (Ch.43) and Viparita Raj / Harsha–Sarala–Vimala (Ch.35) */

import type { PlanetName, PlanetPosition, SignNumber, YogaResult } from '@/types'
import { advanceSigns, getPrimaryLord } from '@/lib/astro/specialPoints'
import { KENDRA_HOUSES, KONA_HOUSES, TRIKA_HOUSES } from '@/lib/astro/yoga/constants'
import { signToHouse } from '@/lib/astro/yoga/signToHouse'
import { getSignName } from '@/lib/astro/yoga/signNames'

const PLANET_DEBIL_SIGN: Partial<Record<PlanetName, SignNumber>> = {
  Sun: 7,
  Moon: 8,
  Mars: 4,
  Mercury: 12,
  Jupiter: 10,
  Venus: 6,
  Saturn: 1,
}

/** Graha exalted in the same sign where another is debilitated (for cancellation limb) */
const EXALTED_IN_SIGN_FOR_NEecha: Partial<Record<SignNumber, PlanetName>> = {
  7: 'Saturn',
  4: 'Jupiter',
  12: 'Venus',
  10: 'Mars',
  6: 'Mercury',
  1: 'Sun',
}

export function detectNeechabhangaRajYoga(
  planets: PlanetPosition[],
  lagnaSign: SignNumber
): YogaResult[] {
  const yogas: YogaResult[] = []
  const moonPos = planets.find((p) => p.planet === 'Moon')

  for (const planetName of Object.keys(PLANET_DEBIL_SIGN) as PlanetName[]) {
    const debilSign = PLANET_DEBIL_SIGN[planetName]
    if (debilSign === undefined) continue
    const planetPos = planets.find((p) => p.planet === planetName)
    if (!planetPos || planetPos.signNumber !== debilSign) continue

    const debilSignLord = getPrimaryLord(debilSign)
    const lordPos = planets.find((p) => p.planet === debilSignLord)
    const lordInKendra =
      lordPos !== undefined &&
      KENDRA_HOUSES.includes(signToHouse(lordPos.signNumber, lagnaSign) as 1 | 4 | 7 | 10)

    const exaltedPlanetName = EXALTED_IN_SIGN_FOR_NEecha[debilSign]
    const exaltedPlanetPos = exaltedPlanetName
      ? planets.find((p) => p.planet === exaltedPlanetName)
      : undefined

    const exaltedInKendraFromLagna =
      exaltedPlanetPos !== undefined &&
      KENDRA_HOUSES.includes(signToHouse(exaltedPlanetPos.signNumber, lagnaSign) as 1 | 4 | 7 | 10)
    const exaltedInKendraFromMoon =
      exaltedPlanetPos !== undefined &&
      moonPos !== undefined &&
      KENDRA_HOUSES.includes(
        signToHouse(exaltedPlanetPos.signNumber, moonPos.signNumber) as 1 | 4 | 7 | 10
      )

    const cancelled =
      lordInKendra || exaltedInKendraFromLagna || exaltedInKendraFromMoon

    if (cancelled) {
      const involved: PlanetName[] = [planetName]
      if (lordPos) involved.push(debilSignLord)
      if (exaltedPlanetName && exaltedPlanetPos) involved.push(exaltedPlanetName)

      yogas.push({
        name: `Neechabhanga Raj Yoga (${planetName})`,
        shortTitle: `Neechabhanga — ${planetName} Redeemed`,
        category: 'neechabhanga',
        strength:
          lordInKendra && (exaltedInKendraFromLagna || exaltedInKendraFromMoon)
            ? 'strong'
            : 'moderate',
        bphsReference: 'BPHS Ch.43 v.5-8',
        planetsInvolved: involved,
        housesInvolved: [signToHouse(debilSign, lagnaSign)],
        icon: '♻️',
        plainDescription: `${planetName} is debilitated in ${getSignName(debilSign)}, but debilitation is cancelled by classical conditions. In its Dasha, ${planetName} may produce strong results that overcompensate — struggle becoming a source of strength.${
          planetName === 'Moon' && debilSign === 8
            ? ' (Moon in Scorpio: no graha is exalted in Scorpio; cancellation often relies on Mars or other limbs.)'
            : ''
        }`,
        isActive: true,
        dashaActivated: false,
      })
    }
  }

  return yogas
}

function lagnaKendraKonaLordSigns(lagnaSign: SignNumber): SignNumber[] {
  const hs = [...KENDRA_HOUSES, ...KONA_HOUSES.filter((h) => h !== 1)]
  const uniq = new Set<SignNumber>()
  for (const h of hs) {
    uniq.add(advanceSigns(lagnaSign, h))
  }
  return [...uniq]
}

function dusthanaLordTouchesKendraKonaLord(
  dustLordPos: PlanetPosition,
  lagnaSign: SignNumber,
  planets: PlanetPosition[]
): boolean {
  const lordSigns = lagnaKendraKonaLordSigns(lagnaSign)
  for (const s of lordSigns) {
    const L = getPrimaryLord(s)
    const lp = planets.find((p) => p.planet === L)
    if (lp && lp.signNumber === dustLordPos.signNumber) return true
  }
  return false
}

export function detectViparitaRajYoga(
  planets: PlanetPosition[],
  lagnaSign: SignNumber
): YogaResult[] {
  const yogas: YogaResult[] = []
  const dusthanaHouses = [6, 8, 12] as const

  const viparitaNames: Record<number, string> = {
    6: 'Harsha Yoga',
    8: 'Sarala Yoga',
    12: 'Vimala Yoga',
  }
  const viparitaDescs: Record<number, string> = {
    6: "The 6th lord in another Dusthana. Harsha Yoga brings health, happiness, and victory over enemies. Obstacles tend to defeat themselves. The 6th house's adversarial energy turns inward on itself.",
    8: 'The 8th lord in another Dusthana. Sarala Yoga brings fearlessness, longevity, and protection from sudden reversal. Transformation becomes a superpower rather than a vulnerability.',
    12: 'The 12th lord in another Dusthana. Vimala Yoga brings virtuous character, financial prudence, and spiritual depth. The isolating energy of the 12th is channeled productively.',
  }
  const bphsVerse: Record<number, string> = {
    6: 'BPHS Ch.35 v.1',
    8: 'BPHS Ch.35 v.2',
    12: 'BPHS Ch.35 v.3',
  }

  for (const sourceHouse of dusthanaHouses) {
    const houseSign = advanceSigns(lagnaSign, sourceHouse)
    const houseLord = getPrimaryLord(houseSign)
    const lordPos = planets.find((p) => p.planet === houseLord)
    if (!lordPos) continue

    const lordCurrentHouse = signToHouse(lordPos.signNumber, lagnaSign)
    if (
      TRIKA_HOUSES.includes(lordCurrentHouse as 6 | 8 | 12) &&
      lordCurrentHouse !== sourceHouse
    ) {
      if (dusthanaLordTouchesKendraKonaLord(lordPos, lagnaSign, planets)) {
        continue
      }
      yogas.push({
        name: viparitaNames[sourceHouse] ?? `Viparita Raj Yoga (${sourceHouse}th)`,
        shortTitle: `${viparitaNames[sourceHouse]} — Reversal Power`,
        category: 'vipareeta_raj',
        strength: 'moderate',
        bphsReference: bphsVerse[sourceHouse],
        planetsInvolved: [houseLord],
        housesInvolved: [sourceHouse, lordCurrentHouse],
        icon: '🔃',
        plainDescription: viparitaDescs[sourceHouse],
        isActive: true,
        dashaActivated: false,
      })
    }
  }

  return yogas
}

/** Parivartana between Lagna lord and 5th lord — Maha-style Raj Yoga limb */
export function detectMahaRajYogaParivartana(
  planets: PlanetPosition[],
  lagnaSign: SignNumber
): YogaResult[] {
  const sign1 = advanceSigns(lagnaSign, 1)
  const sign5 = advanceSigns(lagnaSign, 5)
  const l1 = getPrimaryLord(sign1)
  const l5 = getPrimaryLord(sign5)
  const p1 = planets.find((p) => p.planet === l1)
  const p5 = planets.find((p) => p.planet === l5)
  if (!p1 || !p5) return []
  if (p1.signNumber === sign5 && p5.signNumber === sign1) {
    return [
      {
        name: 'Maha Raj Yoga (Lagna–Putra parivartana)',
        shortTitle: 'Maha Raj — Lord Exchange',
        category: 'raj',
        strength: 'strong',
        bphsReference: 'BPHS Ch.34 v.14',
        planetsInvolved: [l1, l5],
        housesInvolved: [1, 5],
        icon: '👑',
        plainDescription:
          'Exchange (parivartana) between the Lagna lord and the 5th lord. A celebrated combination for authority, creativity, and recognition when other factors support.',
        isActive: true,
        dashaActivated: false,
      },
    ]
  }
  return []
}

/** One planet rules both a Kendra and a Trikona from Lagna (yogakaraka) */
export function detectYogaKaraka(
  planets: PlanetPosition[],
  lagnaSign: SignNumber
): YogaResult[] {
  const rulers = new Map<PlanetName, Set<number>>()
  for (let h = 1; h <= 12; h++) {
    const sign = advanceSigns(lagnaSign, h as SignNumber)
    const lord = getPrimaryLord(sign)
    if (!rulers.has(lord)) rulers.set(lord, new Set())
    rulers.get(lord)!.add(h)
  }

  const kendraSet = new Set(KENDRA_HOUSES)
  const konaSet = new Set(KONA_HOUSES)
  const out: YogaResult[] = []

  for (const [lord, houses] of rulers) {
    const hasK = [...houses].some((h) => kendraSet.has(h as 1 | 4 | 7 | 10))
    const hasT = [...houses].some((h) => konaSet.has(h as 1 | 5 | 9))
    if (hasK && hasT) {
      const pos = planets.find((p) => p.planet === lord)
      out.push({
        name: `Yoga Karaka (${lord})`,
        shortTitle: `Yoga Karaka — ${lord}`,
        category: 'raj',
        strength: 'strong',
        bphsReference: 'BPHS Ch.34 v.12',
        planetsInvolved: [lord],
        housesInvolved: [...houses].sort((a, b) => a - b),
        icon: '⚜️',
        plainDescription: `${lord} rules both an angular (Kendra) and a trinal (Kona) house from Lagna — a yogakaraka for this ascendant, especially supportive for material and dharmic outcomes in ${lord}'s periods.`,
        isActive: pos ? pos.isCombust !== true : true,
        dashaActivated: false,
      })
    }
  }
  return out
}

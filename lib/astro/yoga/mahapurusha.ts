// STATUS: done | Task YG.3
/** Pancha Mahapurusha — Mars, Mercury, Jupiter, Venus, Saturn in own/exaltation + Kendra */

import type { PlanetName, PlanetPosition, SignNumber, YogaResult } from '@/types'
import { KENDRA_HOUSES } from '@/lib/astro/yoga/constants'
import { signToHouse } from '@/lib/astro/yoga/signToHouse'

interface MahapurushaConfig {
  planet: PlanetName
  yogaName: string
  shortTitle: string
  ownSigns: SignNumber[]
  exaltSign: SignNumber
  icon: string
  desc: string
  bphs: string
}

const MAHAPURUSHA_CONFIGS: MahapurushaConfig[] = [
  {
    planet: 'Mars',
    yogaName: 'Ruchaka Yoga',
    shortTitle: 'Ruchaka — Mars Power',
    ownSigns: [1, 8],
    exaltSign: 10,
    icon: '🔴',
    desc: 'Mars in its own sign or exaltation in an angular house. Exceptional courage, physical vitality, leadership, and competitive drive. Natural commanders, athletes, surgeons, or military figures. Magnetic personal authority.',
    bphs: 'BPHS Ch.37 v.2',
  },
  {
    planet: 'Mercury',
    yogaName: 'Bhadra Yoga',
    shortTitle: 'Bhadra — Mercury Power',
    ownSigns: [3, 6],
    exaltSign: 6,
    icon: '💚',
    desc: 'Mercury in its own sign or exaltation in an angular house. Exceptional intellect, analytical skill, communication, and commercial acumen. Natural writers, traders, analysts, and advisors. Sharp and articulate.',
    bphs: 'BPHS Ch.37 v.3',
  },
  {
    planet: 'Jupiter',
    yogaName: 'Hamsa Yoga',
    shortTitle: 'Hamsa — Jupiter Grace',
    ownSigns: [9, 12],
    exaltSign: 4,
    icon: '🌟',
    desc: 'Jupiter in its own sign or exaltation in an angular house. Profound wisdom, spiritual grace, generosity, and natural authority. Associated with teachers, judges, priests, and those who guide others. Moral and expansive.',
    bphs: 'BPHS Ch.37 v.4',
  },
  {
    planet: 'Venus',
    yogaName: 'Malavya Yoga',
    shortTitle: 'Malavya — Venus Grace',
    ownSigns: [2, 7],
    exaltSign: 12,
    icon: '💎',
    desc: 'Venus in its own sign or exaltation in an angular house. Exceptional beauty, artistic talent, sensory refinement, and social grace. Natural creators, performers, diplomats, and aesthetes. Magnetic and cultured.',
    bphs: 'BPHS Ch.37 v.5',
  },
  {
    planet: 'Saturn',
    yogaName: 'Sasa Yoga',
    shortTitle: 'Sasa — Saturn Discipline',
    ownSigns: [10, 11],
    exaltSign: 7,
    icon: '⚫',
    desc: 'Saturn in its own sign or exaltation in an angular house. Exceptional discipline, endurance, administrative skill, and longevity of achievement. Rises slowly but commands lasting authority. Natural builders of institutions.',
    bphs: 'BPHS Ch.37 v.6',
  },
]

export function detectMahapurushaYogas(planets: PlanetPosition[], lagnaSign: SignNumber): YogaResult[] {
  const yogas: YogaResult[] = []
  for (const config of MAHAPURUSHA_CONFIGS) {
    const pos = planets.find((p) => p.planet === config.planet)
    if (!pos) continue
    const inOwnSign = config.ownSigns.includes(pos.signNumber)
    const inExaltSign = pos.signNumber === config.exaltSign
    const houseNum = signToHouse(pos.signNumber, lagnaSign)
    const inKendra = KENDRA_HOUSES.includes(houseNum as 1 | 4 | 7 | 10)
    if ((inOwnSign || inExaltSign) && inKendra) {
      const isBroken = pos.isCombust === true
      const sign = inExaltSign ? 'exaltation' : 'own sign'
      yogas.push({
        name: config.yogaName,
        shortTitle: config.shortTitle,
        category: 'pancha_mahapurusha',
        strength: inExaltSign ? 'strong' : 'moderate',
        bphsReference: config.bphs,
        planetsInvolved: [config.planet],
        housesInvolved: [houseNum],
        icon: config.icon,
        plainDescription: `${config.planet} in ${sign} in the ${houseNum}th house (Kendra). ${config.desc}`,
        isActive: !isBroken,
        dashaActivated: false,
      })
    }
  }
  return yogas
}

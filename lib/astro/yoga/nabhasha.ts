// STATUS: done | Task YG.2
/**
 * Nabhasha yogas — BPHS Ch.35–36; seven classical grahas only (no Rahu/Ketu).
 */

import type { PlanetPosition, SignNumber, YogaResult } from '@/types'
import {
  KENDRA_HOUSES,
  NABHASHA_PLANETS,
  NATURAL_BENEFICS,
  NATURAL_MALEFICS,
} from '@/lib/astro/yoga/constants'
import { signToHouse } from '@/lib/astro/yoga/signToHouse'

const MOVABLE_SIGNS = new Set<SignNumber>([1, 4, 7, 10])
const FIXED_SIGNS = new Set<SignNumber>([2, 5, 8, 11])
const DUAL_SIGNS = new Set<SignNumber>([3, 6, 9, 12])

export function detectNabhashaYogas(planets: PlanetPosition[], lagnaSign: SignNumber): YogaResult[] {
  const yogas: YogaResult[] = []
  const classical = planets.filter((p) => NABHASHA_PLANETS.includes(p.planet))
  if (classical.length < 7) return yogas

  const signs = classical.map((p) => p.signNumber)
  const houses = classical.map((p) => signToHouse(p.signNumber, lagnaSign))
  const houseSet = new Set(houses)

  const allMovable = signs.every((s) => MOVABLE_SIGNS.has(s))
  const allFixed = signs.every((s) => FIXED_SIGNS.has(s))
  const allDual = signs.every((s) => DUAL_SIGNS.has(s))

  const push = (y: Omit<YogaResult, 'dashaActivated'>) =>
    yogas.push({ ...y, dashaActivated: false })

  if (allMovable) {
    push({
      name: 'Rajju Yoga',
      shortTitle: 'Rajju — The Rope',
      category: 'nabhasha',
      strength: 'strong',
      bphsReference: 'BPHS Ch.35 v.3',
      planetsInvolved: [...NABHASHA_PLANETS],
      housesInvolved: [...new Set(houses)],
      icon: '🌀',
      plainDescription:
        'All planets occupy movable signs. Life is defined by movement, travel, change of residence, and a restless drive to initiate. Struggle to stay still produces great momentum but also difficulty with completion.',
      isActive: true,
    })
  }

  if (allFixed) {
    push({
      name: 'Musala Yoga',
      shortTitle: 'Musala — The Pestle',
      category: 'nabhasha',
      strength: 'strong',
      bphsReference: 'BPHS Ch.35 v.4',
      planetsInvolved: [...NABHASHA_PLANETS],
      housesInvolved: [...new Set(houses)],
      icon: '🏛️',
      plainDescription:
        'All planets occupy fixed signs. The nature is stable, determined, and resistant to change. Strong will and persistence. Can become rigid when flexibility is required. Wealth tends to accumulate and hold.',
      isActive: true,
    })
  }

  if (allDual) {
    push({
      name: 'Nala Yoga',
      shortTitle: 'Nala — The Reed',
      category: 'nabhasha',
      strength: 'strong',
      bphsReference: 'BPHS Ch.35 v.5',
      planetsInvolved: [...NABHASHA_PLANETS],
      housesInvolved: [...new Set(houses)],
      icon: '⚖️',
      plainDescription:
        'All planets occupy dual signs. A versatile, communicative nature with skill in multiple fields. Adaptable and intellectually agile. Tendency toward duality in career and relationships — doing two things at once.',
      isActive: true,
    })
  }

  const planetsInKendra = classical.filter((p) =>
    KENDRA_HOUSES.includes(signToHouse(p.signNumber, lagnaSign) as 1 | 4 | 7 | 10)
  )
  const beneficsInKendra = planetsInKendra.filter((p) => NATURAL_BENEFICS.includes(p.planet))
  const maleficsInKendra = planetsInKendra.filter((p) => NATURAL_MALEFICS.includes(p.planet))

  const beneficKendraHouses = [...new Set(beneficsInKendra.map((p) => signToHouse(p.signNumber, lagnaSign)))]
  if (beneficKendraHouses.length >= 3 && maleficsInKendra.length === 0) {
    push({
      name: 'Maal Yoga',
      shortTitle: 'Maal — The Garland',
      category: 'nabhasha',
      strength: 'strong',
      bphsReference: 'BPHS Ch.35 v.6',
      planetsInvolved: beneficsInKendra.map((p) => p.planet),
      housesInvolved: beneficKendraHouses,
      icon: '🌸',
      plainDescription:
        'Benefic planets dominate the angular houses with no malefic obstruction. Life flows with grace and support. Relationships, finances, and reputation tend to develop without major resistance. Natural magnetism.',
      isActive: true,
    })
  }

  const maleficKendraHouses = [...new Set(maleficsInKendra.map((p) => signToHouse(p.signNumber, lagnaSign)))]
  if (maleficKendraHouses.length >= 3 && beneficsInKendra.length === 0) {
    push({
      name: 'Sarpa Yoga',
      shortTitle: 'Sarpa — The Serpent',
      category: 'nabhasha',
      strength: 'strong',
      bphsReference: 'BPHS Ch.35 v.7',
      planetsInvolved: maleficsInKendra.map((p) => p.planet),
      housesInvolved: maleficKendraHouses,
      icon: '🐍',
      plainDescription:
        'Malefic planets dominate the angular houses. Obstacles and adversity shape the personality through challenge rather than support. The benefit: exceptional resilience. Life teaches through friction.',
      isActive: true,
    })
  }

  const adjacentKendraPairs: [number, number][] = [
    [1, 4],
    [4, 7],
    [7, 10],
    [10, 1],
  ]
  for (const [a, b] of adjacentKendraPairs) {
    if (houses.every((h) => h === a || h === b)) {
      push({
        name: 'Gada Yoga',
        shortTitle: 'Gada — The Mace',
        category: 'nabhasha',
        strength: 'moderate',
        bphsReference: 'BPHS Ch.35 v.9',
        planetsInvolved: classical.map((p) => p.planet),
        housesInvolved: [a, b],
        icon: '⚔️',
        plainDescription: `All planetary energy concentrates in two adjacent angular houses (${a}th and ${b}th). Life is powerfully focused in these two domains — a striking force in that area but relative dormancy elsewhere.`,
        isActive: true,
      })
      break
    }
  }

  if (houses.every((h) => h === 1 || h === 7)) {
    push({
      name: 'Sakat Yoga',
      shortTitle: 'Sakat — The Cart',
      category: 'nabhasha',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.35 v.10',
      planetsInvolved: classical.map((p) => p.planet),
      housesInvolved: [1, 7],
      icon: '🔄',
      plainDescription:
        'All planets in the 1st and 7th axis — self and other, self-assertion and partnership. Life revolves entirely around identity through relationship. Can indicate a life where partnerships define everything.',
      isActive: true,
    })
  }

  if (houses.every((h) => h === 4 || h === 10)) {
    push({
      name: 'Vihag Yoga',
      shortTitle: 'Vihag — The Bird',
      category: 'nabhasha',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.35 v.11',
      planetsInvolved: classical.map((p) => p.planet),
      housesInvolved: [4, 10],
      icon: '🦅',
      plainDescription:
        'All planets in the 4th and 10th axis — home/roots and career/public life. Life is defined by the tension between private foundation and public achievement. Strong career ambition rooted in emotional needs.',
      isActive: true,
    })
  }

  if (houses.every((h) => [1, 5, 9].includes(h))) {
    push({
      name: 'Shringatak Yoga',
      shortTitle: 'Shringatak — The Triangle',
      category: 'nabhasha',
      strength: 'strong',
      bphsReference: 'BPHS Ch.35 v.12',
      planetsInvolved: classical.map((p) => p.planet),
      housesInvolved: [1, 5, 9],
      icon: '🔺',
      plainDescription:
        'All planets in the dharmic trinal houses (1st, 5th, 9th). A profoundly dharmic chart — life oriented around purpose, creativity, and higher learning. Often associated with teachers, advisors, and those with strong spiritual purpose.',
      isActive: true,
    })
  }

  if (houses.every((h) => [2, 6, 10].includes(h))) {
    push({
      name: 'Hal Yoga',
      shortTitle: 'Hal — The Plough',
      category: 'nabhasha',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.35 v.13',
      planetsInvolved: classical.map((p) => p.planet),
      housesInvolved: [2, 6, 10],
      icon: '🌾',
      plainDescription:
        'All planets in the 2nd, 6th, and 10th — the Artha (material) triangle. Life is fundamentally organized around resource acquisition, work, and career. Strong practical orientation. Wealth through persistent labor.',
      isActive: true,
    })
  }

  if ([1, 4, 7, 10].every((h) => houseSet.has(h))) {
    push({
      name: 'Kamal Yoga',
      shortTitle: 'Kamal — The Lotus',
      category: 'nabhasha',
      strength: 'strong',
      bphsReference: 'BPHS Ch.35 v.14',
      planetsInvolved: classical
        .filter((p) => [1, 4, 7, 10].includes(signToHouse(p.signNumber, lagnaSign)))
        .map((p) => p.planet),
      housesInvolved: [1, 4, 7, 10],
      icon: '🪷',
      plainDescription:
        'Planets in all four angular houses — the rarest and most powerful Nabhasha pattern. Like a lotus rooted in all four directions. Associated with profound authority, fame, and a life that touches every major domain of experience.',
      isActive: true,
    })
  }

  if (
    [3, 6, 9, 12].every((h) => houseSet.has(h)) &&
    houses.every((h) => [3, 6, 9, 12].includes(h))
  ) {
    push({
      name: 'Vapi Yoga (Apoklima)',
      shortTitle: 'Vapi — The Well',
      category: 'nabhasha',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.35 v.15',
      planetsInvolved: classical.map((p) => p.planet),
      housesInvolved: [3, 6, 9, 12],
      icon: '🌊',
      plainDescription:
        'All planets in the Apoklima houses (3rd, 6th, 9th, 12th). Resources tend to accumulate quietly and be held. Like a well — deep reserves beneath the surface, not immediately visible. Late development of potential.',
      isActive: true,
    })
  }
  if (
    [2, 5, 8, 11].every((h) => houseSet.has(h)) &&
    houses.every((h) => [2, 5, 8, 11].includes(h))
  ) {
    push({
      name: 'Vapi Yoga (Panaphar)',
      shortTitle: 'Vapi — The Well',
      category: 'nabhasha',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.35 v.15',
      planetsInvolved: classical.map((p) => p.planet),
      housesInvolved: [2, 5, 8, 11],
      icon: '🌊',
      plainDescription:
        'All planets in the Panaphar houses (2nd, 5th, 8th, 11th). Steady accumulation of resources and gains. Supportive chart for sustained material growth. The Panaphar emphasis suggests effort that consistently converts to result.',
      isActive: true,
    })
  }

  const uniqueSignCount = new Set(classical.map((p) => p.signNumber)).size
  const sankhyaMap: Record<
    number,
    { name: string; shortTitle: string; desc: string; icon: string; verse: number }
  > = {
    7: {
      name: 'Veena Yoga (Vallaki)',
      shortTitle: 'Veena — The Lute',
      icon: '🎸',
      verse: 2,
      desc: 'All 7 planets in 7 different signs. Maximum dispersal of planetary energy — a multifaceted personality with interests and capabilities across every life domain. Musical, artistic tendencies. Can struggle with focus.',
    },
    6: {
      name: 'Daam Yoga (Daamini)',
      shortTitle: 'Daam — The Cord',
      icon: '🔗',
      verse: 3,
      desc: '7 planets spread across 6 signs. Near-maximum dispersal. Broad interests with slight concentration in one sign. Generous nature, many connections, variable focus. Strong social network.',
    },
    5: {
      name: 'Paash Yoga',
      shortTitle: 'Paash — The Noose',
      icon: '🔒',
      verse: 4,
      desc: '7 planets in 5 signs. Moderate concentration. Capable across many areas but with clear emphasis. Relationships and obligations tend to bind the native to specific paths.',
    },
    4: {
      name: 'Kedara Yoga',
      shortTitle: 'Kedara — The Field',
      icon: '🌱',
      verse: 5,
      desc: '7 planets in 4 signs. Significant concentration. Life energy focused in specific areas like a cultivated field. What is planted here grows abundantly. Agricultural or developmental themes.',
    },
    3: {
      name: 'Sool Yoga',
      shortTitle: 'Sool — The Trident',
      icon: '🔱',
      verse: 6,
      desc: '7 planets in 3 signs. High concentration — three main life arenas dominate completely. Extremely focused, sometimes one-dimensional. Power in the dominant houses, relative neglect of others.',
    },
    2: {
      name: 'Yuga Yoga',
      shortTitle: 'Yuga — The Pair',
      icon: '☯️',
      verse: 7,
      desc: '7 planets in 2 signs. Near-total concentration. Life defined by a single axis — the two houses holding all planets become everything. Intense, singular focus. Can be one of the most powerful or most constrained charts.',
    },
    1: {
      name: 'Gola Yoga',
      shortTitle: 'Gola — The Ball',
      icon: '🔴',
      verse: 8,
      desc: '7 planets in 1 sign. All planetary energy in a single sign. The rarest Sankhya Yoga — extraordinary concentration of purpose in one house. Can indicate obsession, genius, or profound limitation depending on that house and its lord.',
    },
  }

  const sk = sankhyaMap[uniqueSignCount]
  if (sk) {
    push({
      name: sk.name,
      shortTitle: sk.shortTitle,
      category: 'nabhasha',
      strength: uniqueSignCount <= 2 ? 'strong' : uniqueSignCount <= 4 ? 'moderate' : 'weak',
      bphsReference: `BPHS Ch.36 v.${sk.verse}`,
      planetsInvolved: classical.map((p) => p.planet),
      housesInvolved: [...new Set(houses)],
      icon: sk.icon,
      plainDescription: sk.desc,
      isActive: true,
    })
  }

  const continuousPatterns4: Array<{ start: number; name: string; title: string; icon: string; desc: string; v: number }> = [
    { start: 1, name: 'Yupa Yoga', title: 'Yupa — The Post', icon: '🪵', v: 17,
      desc: 'All planets in houses 1-4. Life force concentrates in the self, resources, communication, and home. Strong private life and personal foundations. Career and relationships are less emphasized.' },
    { start: 4, name: 'Shar Yoga', title: 'Shar — The Arrow', icon: '🏹', v: 18,
      desc: 'All planets in houses 4-7. Concentration in home, creativity, health, and relationships. Life orbits around domestic and relational themes. Public life (10th) and finance (2nd) are less prominent.' },
    { start: 7, name: 'Shakti Yoga', title: 'Shakti — The Power', icon: '⚡', v: 19,
      desc: 'All planets in houses 7-10. Maximum emphasis on partnerships, transformation, higher purpose, and career. A life built through others and public achievement. Private life may feel underdeveloped.' },
    { start: 10, name: 'Danda Yoga', title: 'Danda — The Staff', icon: '🦯', v: 20,
      desc: 'All planets in houses 10-1. Career, gains, loss/renunciation, and self converge. Life is dominated by public duty and its personal consequences. Strong association with authority and discipline.' },
  ]

  for (const pat of continuousPatterns4) {
    const targetHouses = [pat.start, pat.start + 1, pat.start + 2, pat.start + 3].map(
      (h) => (((h - 1) % 12) + 1) as number
    )
    if (houses.every((h) => targetHouses.includes(h)) && targetHouses.every((h) => houseSet.has(h))) {
      push({
        name: pat.name,
        shortTitle: pat.title,
        category: 'nabhasha',
        strength: 'moderate',
        bphsReference: `BPHS Ch.35 v.${pat.v}`,
        planetsInvolved: classical.map((p) => p.planet),
        housesInvolved: targetHouses,
        icon: pat.icon,
        plainDescription: pat.desc,
        isActive: true,
      })
    }
  }

  const continuousPatterns7: Array<{ start: number; name: string; title: string; icon: string; desc: string; v: number }> = [
    { start: 1, name: 'Nauka Yoga', title: 'Nauka — The Boat', icon: '⛵', v: 21,
      desc: 'All planets span houses 1-7. Life is a journey from self to partnership — the full arc of personal development is contained in these seven houses. Strong individual identity developing toward relationship mastery.' },
    { start: 4, name: 'Koot Yoga', title: 'Koot — The Fort', icon: '🏰', v: 22,
      desc: 'All planets span houses 4-10. Rooted in home and unfolding toward career peak. Life moves from private security toward public authority. The domestic life is the foundation from which ambition launches.' },
    { start: 7, name: 'Chatr Yoga', title: 'Chatr — The Umbrella', icon: '☂️', v: 23,
      desc: 'All planets span houses 7-1. Life unfolds through partnership, transformation, wisdom, and self-expression. Relationships catalyze the journey. Deep themes of regeneration and arriving at authentic selfhood.' },
    { start: 10, name: 'Chap Yoga', title: 'Chap — The Bow', icon: '🏹', v: 24,
      desc: 'All planets span houses 10-4. Career and public life anchor everything, resolving in home and private foundation. Achievement is the launching point; the arc returns to roots.' },
  ]

  for (const pat of continuousPatterns7) {
    const targetHouses = Array.from({ length: 7 }, (_, i) => ((pat.start - 1 + i) % 12) + 1)
    if (houses.every((h) => targetHouses.includes(h))) {
      push({
        name: pat.name,
        shortTitle: pat.title,
        category: 'nabhasha',
        strength: 'moderate',
        bphsReference: `BPHS Ch.35 v.${pat.v}`,
        planetsInvolved: classical.map((p) => p.planet),
        housesInvolved: targetHouses,
        icon: pat.icon,
        plainDescription: pat.desc,
        isActive: true,
      })
    }
  }

  return yogas
}

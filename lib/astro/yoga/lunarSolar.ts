// STATUS: done | Task YG.4–YG.5
/** Lunar yogas (Ch.38) and solar yogas (Ch.39) */

import type { PlanetName, PlanetPosition, SignNumber, YogaResult, YogaStrength } from '@/types'
import { advanceSigns } from '@/lib/astro/specialPoints'
import { KENDRA_HOUSES } from '@/lib/astro/yoga/constants'
import { signToHouse } from '@/lib/astro/yoga/signToHouse'

export function detectLunarYogas(planets: PlanetPosition[], lagnaSign: SignNumber): YogaResult[] {
  const yogas: YogaResult[] = []
  const moon = planets.find((p) => p.planet === 'Moon')
  if (!moon) return yogas

  const moonSign = moon.signNumber
  const secondFromMoon = advanceSigns(moonSign, 2)
  const twelfthFromMoon = advanceSigns(moonSign, 12)

  const planetsIn2nd = planets.filter(
    (p) => p.planet !== 'Sun' && p.signNumber === secondFromMoon
  )
  const planetsIn12th = planets.filter(
    (p) => p.planet !== 'Sun' && p.signNumber === twelfthFromMoon
  )

  const has2nd = planetsIn2nd.length > 0
  const has12th = planetsIn12th.length > 0

  const push = (y: Omit<YogaResult, 'dashaActivated'>) =>
    yogas.push({ ...y, dashaActivated: false })

  if (has2nd && !has12th) {
    push({
      name: 'Sunapha Yoga',
      shortTitle: 'Sunapha — Moon Ahead',
      category: 'lunar',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.38 v.2',
      planetsInvolved: ['Moon', ...planetsIn2nd.map((p) => p.planet)],
      housesInvolved: [
        signToHouse(moonSign, lagnaSign),
        signToHouse(secondFromMoon, lagnaSign),
      ],
      icon: '🌙',
      plainDescription:
        'Planets support the Moon from the front (2nd from Moon). The mind is supported by substance and resources. Natural ability to earn and sustain. Confident in personal expression. The Moon moves toward support.',
      isActive: true,
    })
  }

  if (has12th && !has2nd) {
    push({
      name: 'Anapha Yoga',
      shortTitle: 'Anapha — Moon Behind',
      category: 'lunar',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.38 v.3',
      planetsInvolved: ['Moon', ...planetsIn12th.map((p) => p.planet)],
      housesInvolved: [
        signToHouse(moonSign, lagnaSign),
        signToHouse(twelfthFromMoon, lagnaSign),
      ],
      icon: '🌛',
      plainDescription:
        'Planets support the Moon from behind (12th from Moon). Strong foundations and past support underpin the mind. Natural dignity and self-respect. Less concerned with accumulation than with meaning. Often gifted in renunciation.',
      isActive: true,
    })
  }

  if (has2nd && has12th) {
    push({
      name: 'Duradhara Yoga',
      shortTitle: 'Duradhara — Moon Flanked',
      category: 'lunar',
      strength: 'strong',
      bphsReference: 'BPHS Ch.38 v.4',
      planetsInvolved: [
        'Moon',
        ...planetsIn2nd.map((p) => p.planet),
        ...planetsIn12th.map((p) => p.planet),
      ],
      housesInvolved: [
        signToHouse(moonSign, lagnaSign),
        signToHouse(secondFromMoon, lagnaSign),
        signToHouse(twelfthFromMoon, lagnaSign),
      ],
      icon: '🌕',
      plainDescription:
        'Planets on both sides of the Moon (2nd and 12th from Moon). The mind is fully flanked by support. Well-resourced, emotionally stable, and able to both earn and enjoy. One of the stronger lunar Yoga configurations.',
      isActive: true,
    })
  }

  if (!has2nd && !has12th) {
    const planetsInKendra = planets.filter(
      (p) =>
        p.planet !== 'Moon' &&
        KENDRA_HOUSES.includes(signToHouse(p.signNumber, lagnaSign) as 1 | 4 | 7 | 10)
    )
    if (planetsInKendra.length === 0) {
      push({
        name: 'Kemadruma Yoga',
        shortTitle: 'Kemadruma — Isolated Moon',
        category: 'lunar',
        strength: 'strong',
        bphsReference: 'BPHS Ch.38 v.5',
        planetsInvolved: ['Moon'],
        housesInvolved: [signToHouse(moonSign, lagnaSign)],
        icon: '🌑',
        plainDescription:
          'The Moon is isolated — no planets in adjacent signs from the Moon AND no other planets in angular houses from Lagna. The mind may lack external support structures. Parashara lists cancellations (Moon in Kendra, benefic association, etc.) — this flag is structural only; strength of the Moon and classical relief modify results.',
        isActive: true,
      })
    }
  }

  const sixthFromMoon = advanceSigns(moonSign, 6)
  const seventhFromMoon = advanceSigns(moonSign, 7)
  const eighthFromMoon = advanceSigns(moonSign, 8)
  const beneficPlanets: PlanetName[] = ['Jupiter', 'Venus', 'Mercury']

  const adhiPositions = beneficPlanets
    .map((bp) => planets.find((p) => p.planet === bp))
    .filter((pos): pos is PlanetPosition => {
      if (!pos) return false
      return [sixthFromMoon, seventhFromMoon, eighthFromMoon].includes(pos.signNumber)
    })

  if (adhiPositions.length >= 2) {
    const strength: YogaStrength = adhiPositions.length === 3 ? 'strong' : 'moderate'
    push({
      name: 'Adhi Yoga',
      shortTitle: 'Adhi — Benefic Support',
      category: 'lunar',
      strength,
      bphsReference: 'BPHS Ch.38 v.9',
      planetsInvolved: adhiPositions.map((p) => p.planet),
      housesInvolved: [
        signToHouse(sixthFromMoon, lagnaSign),
        signToHouse(seventhFromMoon, lagnaSign),
        signToHouse(eighthFromMoon, lagnaSign),
      ],
      icon: '✨',
      plainDescription: `Benefic planets (${adhiPositions.map((p) => p.planet).join(', ')}) occupy the 6th–8th houses from the Moon. Adhi Yoga grants eminence, administrative capability, and a life of relative ease — especially when all three benefics are present.`,
      isActive: true,
    })
  }

  return yogas
}

export function detectSolarYogas(planets: PlanetPosition[], lagnaSign: SignNumber): YogaResult[] {
  const yogas: YogaResult[] = []
  const sun = planets.find((p) => p.planet === 'Sun')
  if (!sun) return yogas

  const sunSign = sun.signNumber
  const secondFromSun = advanceSigns(sunSign, 2)
  const twelfthFromSun = advanceSigns(sunSign, 12)

  const planetsIn2nd = planets.filter((p) => p.planet !== 'Moon' && p.signNumber === secondFromSun)
  const planetsIn12th = planets.filter((p) => p.planet !== 'Moon' && p.signNumber === twelfthFromSun)

  const has2nd = planetsIn2nd.length > 0
  const has12th = planetsIn12th.length > 0

  const push = (y: Omit<YogaResult, 'dashaActivated'>) =>
    yogas.push({ ...y, dashaActivated: false })

  if (has2nd && !has12th) {
    push({
      name: 'Vesi Yoga',
      shortTitle: 'Vesi — Solar Forward',
      category: 'solar',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.39 v.2',
      planetsInvolved: ['Sun', ...planetsIn2nd.map((p) => p.planet)],
      housesInvolved: [signToHouse(sunSign, lagnaSign), signToHouse(secondFromSun, lagnaSign)],
      icon: '☀️',
      plainDescription:
        'Planets support the Sun from the front (2nd from Sun). The solar principle — ego, vitality, purpose — is supported by resources and articulation. Strong voice and visible confidence. Tends toward success in public endeavors.',
      isActive: true,
    })
  }

  if (has12th && !has2nd) {
    push({
      name: 'Vosi Yoga',
      shortTitle: 'Vosi — Solar Behind',
      category: 'solar',
      strength: 'moderate',
      bphsReference: 'BPHS Ch.39 v.3',
      planetsInvolved: ['Sun', ...planetsIn12th.map((p) => p.planet)],
      housesInvolved: [signToHouse(sunSign, lagnaSign), signToHouse(twelfthFromSun, lagnaSign)],
      icon: '🌤️',
      plainDescription:
        'Planets support the Sun from behind (12th from Sun). The solar identity rests on deep foundations. Strong in spiritual, reclusive, or behind-the-scenes domains. Often indicates a person who works effectively out of the spotlight.',
      isActive: true,
    })
  }

  if (has2nd && has12th) {
    push({
      name: 'Ubhayachari Yoga',
      shortTitle: 'Ubhayachari — Solar Flanked',
      category: 'solar',
      strength: 'strong',
      bphsReference: 'BPHS Ch.39 v.4',
      planetsInvolved: [
        'Sun',
        ...planetsIn2nd.map((p) => p.planet),
        ...planetsIn12th.map((p) => p.planet),
      ],
      housesInvolved: [
        signToHouse(sunSign, lagnaSign),
        signToHouse(secondFromSun, lagnaSign),
        signToHouse(twelfthFromSun, lagnaSign),
      ],
      icon: '🌞',
      plainDescription:
        'Planets on both sides of the Sun (2nd and 12th from Sun). The solar principle is fully supported — past foundations and present resources both align. Strong royal or executive bearing. Associated with leadership, wealth, and recognition.',
      isActive: true,
    })
  }

  return yogas
}

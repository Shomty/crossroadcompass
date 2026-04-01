/**
 * lib/astro/natalSynthesisEngine.ts
 * Pure computation — no I/O, no API calls.
 *
 * Compares Western (tropical) vs Vedic (sidereal) natal planet positions
 * to detect divergence points and generate structured NatalSynthesisSeeds.
 *
 * Design:
 *   Western = symptom / conscious desire / how the ego reaches
 *   Vedic   = medicine / actual capacity / where the real power lives
 *
 * When the two systems agree → reinforcement
 * When they diverge        → the AHA moment lives in the gap
 */

import type { ZodiacSign } from 'openastrology-library'

// ─── Element + Modality ───────────────────────────────────────────────────────

type Element  = 'fire' | 'earth' | 'air' | 'water'
type Modality = 'cardinal' | 'fixed' | 'mutable'

const SIGN_ELEMENT: Record<ZodiacSign, Element> = {
  aries:       'fire',
  leo:         'fire',
  sagittarius: 'fire',
  taurus:      'earth',
  virgo:       'earth',
  capricorn:   'earth',
  gemini:      'air',
  libra:       'air',
  aquarius:    'air',
  cancer:      'water',
  scorpio:     'water',
  pisces:      'water',
}

const SIGN_MODALITY: Record<ZodiacSign, Modality> = {
  aries:       'cardinal',
  cancer:      'cardinal',
  libra:       'cardinal',
  capricorn:   'cardinal',
  taurus:      'fixed',
  leo:         'fixed',
  scorpio:     'fixed',
  aquarius:    'fixed',
  gemini:      'mutable',
  virgo:       'mutable',
  sagittarius: 'mutable',
  pisces:      'mutable',
}

// ─── Western Dignity ──────────────────────────────────────────────────────────

type WesternDignity = 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine'

/**
 * Western dignity tables (traditional seven plus modern outer planets).
 * Source: classical Western astrology — Ptolemy + Dorotheus.
 */
const WESTERN_DOMICILE: Partial<Record<string, ZodiacSign[]>> = {
  sun:     ['leo'],
  moon:    ['cancer'],
  mercury: ['gemini', 'virgo'],
  venus:   ['taurus', 'libra'],
  mars:    ['aries', 'scorpio'],
  jupiter: ['sagittarius', 'pisces'],
  saturn:  ['capricorn', 'aquarius'],
}
const WESTERN_EXALTATION: Partial<Record<string, ZodiacSign>> = {
  sun:     'aries',
  moon:    'taurus',
  mercury: 'virgo',
  venus:   'pisces',
  mars:    'capricorn',
  jupiter: 'cancer',
  saturn:  'libra',
}
const WESTERN_DETRIMENT: Partial<Record<string, ZodiacSign[]>> = {
  sun:     ['aquarius'],
  moon:    ['capricorn'],
  mercury: ['sagittarius', 'pisces'],
  venus:   ['aries', 'scorpio'],
  mars:    ['taurus', 'libra'],
  jupiter: ['gemini', 'virgo'],
  saturn:  ['cancer', 'leo'],
}
const WESTERN_FALL: Partial<Record<string, ZodiacSign>> = {
  sun:     'libra',
  moon:    'scorpio',
  mercury: 'pisces',
  venus:   'virgo',
  mars:    'cancer',
  jupiter: 'capricorn',
  saturn:  'aries',
}

function westernDignity(planet: string, sign: ZodiacSign): WesternDignity {
  const p = planet.toLowerCase()
  if (WESTERN_DOMICILE[p]?.includes(sign))  return 'domicile'
  if (WESTERN_EXALTATION[p] === sign)        return 'exaltation'
  if (WESTERN_DETRIMENT[p]?.includes(sign))  return 'detriment'
  if (WESTERN_FALL[p] === sign)              return 'fall'
  return 'peregrine'
}

// ─── Vedic Dignity ────────────────────────────────────────────────────────────

type VedicDignity = 'uccha' | 'swa' | 'moolatrikona' | 'neecha' | 'neutral'

/**
 * Vedic dignity tables (Parashara).
 * uccha = exalted, swa = own sign, moolatrikona = exalted mooltrikona, neecha = debilitated.
 */
const VEDIC_UCCHA: Partial<Record<string, ZodiacSign>> = {
  sun:     'aries',
  moon:    'taurus',
  mars:    'capricorn',
  mercury: 'virgo',
  jupiter: 'cancer',
  venus:   'pisces',
  saturn:  'libra',
  rahu:    'taurus',
  ketu:    'scorpio',
}
const VEDIC_SWA: Partial<Record<string, ZodiacSign[]>> = {
  sun:     ['leo'],
  moon:    ['cancer'],
  mars:    ['aries', 'scorpio'],
  mercury: ['gemini', 'virgo'],
  jupiter: ['sagittarius', 'pisces'],
  venus:   ['taurus', 'libra'],
  saturn:  ['capricorn', 'aquarius'],
}
const VEDIC_MOOLATRIKONA: Partial<Record<string, ZodiacSign>> = {
  sun:     'leo',
  moon:    'taurus',
  mars:    'aries',
  mercury: 'virgo',
  jupiter: 'sagittarius',
  venus:   'libra',
  saturn:  'aquarius',
}
const VEDIC_NEECHA: Partial<Record<string, ZodiacSign>> = {
  sun:     'libra',
  moon:    'scorpio',
  mars:    'cancer',
  mercury: 'pisces',
  jupiter: 'capricorn',
  venus:   'virgo',
  saturn:  'aries',
  rahu:    'scorpio',
  ketu:    'taurus',
}

function vedicDignity(planet: string, sign: ZodiacSign): VedicDignity {
  const p = planet.toLowerCase()
  if (VEDIC_UCCHA[p] === sign)         return 'uccha'
  if (VEDIC_SWA[p]?.includes(sign))    return 'swa'
  if (VEDIC_MOOLATRIKONA[p] === sign)  return 'moolatrikona'
  if (VEDIC_NEECHA[p] === sign)        return 'neecha'
  return 'neutral'
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConflictType =
  | 'same-sign'       // Both systems agree — rare; reinforces the theme
  | 'element-conflict' // Different elements (e.g. fire vs water) — deepest divergence
  | 'modality-shift'  // Same element, different modality (e.g. cardinal vs mutable fire)
  | 'dignity-flip'    // One system shows strength, other shows weakness
  | 'minor'           // Different signs, same element + modality — subtle shift

export interface NatalSynthesisSeed {
  planet: string
  /** Western (tropical) placement */
  westernSign: ZodiacSign
  westernElement: Element
  westernModality: Modality
  westernDignity: WesternDignity
  /** One-line "symptom/desire" — how this energy surfaces consciously */
  westernExpression: string
  /** Vedic (sidereal) placement */
  vedicSign: ZodiacSign
  vedicElement: Element
  vedicModality: Modality
  vedicDignity: VedicDignity
  /** One-line "medicine/capacity" — where the real power lives */
  vedicCapacity: string
  conflictType: ConflictType
  /** Ready-made AHA paragraph seed for Gemini to expand */
  ahaFormula: string
}

export interface NatalSynthesisSeeds {
  seeds: NatalSynthesisSeed[]
  divergenceCount: number
  dignityFlips: NatalSynthesisSeed[]
  elementConflicts: NatalSynthesisSeed[]
  reinforced: NatalSynthesisSeed[]
}

// ─── Expression / Capacity Labels ────────────────────────────────────────────

/**
 * Short labels describing how a planet's energy manifests in a given element.
 * Used as the "symptom/desire" (Western) and "medicine/capacity" (Vedic) one-liners.
 */
const PLANET_ELEMENT_EXPRESSION: Record<string, Record<Element, string>> = {
  sun: {
    fire:  'the impulse to lead boldly and be seen as powerful',
    earth: 'the need to build a lasting legacy through practical achievement',
    air:   'the drive to express identity through ideas, communication, and social status',
    water: 'the pull toward emotional authenticity and soul-level self-expression',
  },
  moon: {
    fire:  'immediate emotional reactions — feelings that ignite fast and need expression',
    earth: 'seeking security through stability, routine, and material comfort',
    air:   'processing emotions through analysis and detachment',
    water: 'deep empathy, strong intuition, and emotional absorption from surroundings',
  },
  mercury: {
    fire:  'quick, direct thinking — the mind that acts first and reflects later',
    earth: 'methodical analysis and practical, evidence-based reasoning',
    air:   'natural fluency in language and abstract ideas, networking through intellect',
    water: 'intuitive understanding that works through feeling rather than logic',
  },
  venus: {
    fire:  'impulsive, passionate attraction — wanting things (and people) quickly, directly',
    earth: 'building love and value through loyalty, sensory pleasure, and slow trust',
    air:   'connection through wit, fairness, and intellectual chemistry',
    water: 'deep, spiritual empathy — the need for emotional merger and transcendence in love',
  },
  mars: {
    fire:  'bold, immediate action — warrior energy that charges forward without hesitation',
    earth: 'disciplined, persistent effort — builds power through endurance and strategy',
    air:   'decisive through debate and negotiation — wins by outthinking, not outfighting',
    water: 'driven by emotion — acts from intuition, protects what is emotionally sacred',
  },
  ascendant: {
    fire:  'presenting as confident, direct, and energetic — the natural initiator',
    earth: 'presenting as reliable, composed, and grounded — the trustworthy presence',
    air:   'presenting as social, curious, and adaptable — the communicator',
    water: 'presenting as sensitive, perceptive, and intuitive — the empathic listener',
  },
}

function expressionLabel(planet: string, element: Element, dignity: string): string {
  const base = PLANET_ELEMENT_EXPRESSION[planet.toLowerCase()]?.[element]
    ?? `expressing through ${element} energy`
  const dignityNote = dignity === 'exaltation' || dignity === 'uccha'
    ? ' (heightened, amplified)'
    : dignity === 'detriment' || dignity === 'fall' || dignity === 'neecha'
    ? ' (frustrated, seeking release)'
    : ''
  return base + dignityNote
}

// ─── Conflict Classification ──────────────────────────────────────────────────

function classifyConflict(
  westernSign: ZodiacSign,
  vedicSign: ZodiacSign,
  wDig: WesternDignity,
  vDig: VedicDignity,
): ConflictType {
  if (westernSign === vedicSign) return 'same-sign'

  const wEl = SIGN_ELEMENT[westernSign]
  const vEl = SIGN_ELEMENT[vedicSign]
  const wMod = SIGN_MODALITY[westernSign]
  const vMod = SIGN_MODALITY[vedicSign]

  const wStrong = wDig === 'domicile' || wDig === 'exaltation'
  const wWeak   = wDig === 'detriment' || wDig === 'fall'
  const vStrong = vDig === 'uccha' || vDig === 'swa' || vDig === 'moolatrikona'
  const vWeak   = vDig === 'neecha'

  if ((wStrong && vWeak) || (wWeak && vStrong)) return 'dignity-flip'
  if (wEl !== vEl) return 'element-conflict'
  if (wMod !== vMod) return 'modality-shift'
  return 'minor'
}

// ─── AHA Formula ─────────────────────────────────────────────────────────────

function buildAhaFormula(seed: Omit<NatalSynthesisSeed, 'ahaFormula'>): string {
  const planet = seed.planet.charAt(0).toUpperCase() + seed.planet.slice(1)

  if (seed.conflictType === 'same-sign') {
    return `Your ${planet} is the same in both Western and Vedic systems — ${seed.westernSign}. ` +
      `Both systems amplify the same theme: ${seed.westernExpression}. ` +
      `This is your most consistent, reliable energy. Trust it fully.`
  }

  const westernLabel = seed.westernExpression
  const vedicLabel   = seed.vedicCapacity

  if (seed.conflictType === 'dignity-flip') {
    const westernStrong = seed.westernDignity === 'domicile' || seed.westernDignity === 'exaltation'
    if (westernStrong) {
      return `Your ${planet} in ${seed.westernSign} (Western) reads as strong and confident — ${westernLabel}. ` +
        `Yet your Vedic ${planet} in ${seed.vedicSign} operates under pressure — ${vedicLabel}. ` +
        `The AHA: what feels natural on the outside is masking a deeper tension within. ` +
        `Your formula: slow down the conscious impulse long enough to ask what the inner struggle actually needs.`
    } else {
      return `Your ${planet} in ${seed.westernSign} (Western) meets resistance — ${westernLabel}. ` +
        `But your Vedic ${planet} in ${seed.vedicSign} is where its real power lives — ${vedicLabel}. ` +
        `The AHA: when you stop fighting the Western friction, your Vedic capacity emerges as the actual solution. ` +
        `Your formula: use the Western signal as the alarm, then respond with Vedic capacity.`
    }
  }

  if (seed.conflictType === 'element-conflict') {
    return `Your conscious ${planet} energy moves through ${seed.westernElement} — ${westernLabel}. ` +
      `But your real ${planet} capacity lives in ${seed.vedicElement} — ${vedicLabel}. ` +
      `The AHA: whenever you try to solve ${planet} themes using ${seed.westernElement} instinct alone, ` +
      `you hit a wall. Your formula: let the ${seed.westernElement} instinct open the door, ` +
      `then engage your ${seed.vedicElement} capacity to complete the work.`
  }

  // modality-shift / minor
  return `Your ${planet} in ${seed.westernSign} (Western) and ${seed.vedicSign} (Vedic) share the same ` +
    `${seed.westernElement} element but express differently — ${westernLabel} versus ${vedicLabel}. ` +
    `The subtle tension is in the approach: your instinct is ${seed.westernModality} action, ` +
    `but your deeper capacity is ${seed.vedicModality}. ` +
    `Your formula: honour the ${seed.westernModality} impulse as initiation, then let the ${seed.vedicModality} ` +
    `dimension carry it to completion.`
}

// ─── Input Types ──────────────────────────────────────────────────────────────

export interface SimplePlanetPosition {
  sign: ZodiacSign
}

export interface SynthesisInput {
  /** Western (tropical) sign positions — keys must be lowercase planet names */
  western: {
    sun?: SimplePlanetPosition
    moon?: SimplePlanetPosition
    mercury?: SimplePlanetPosition
    venus?: SimplePlanetPosition
    mars?: SimplePlanetPosition
    ascendant?: { sign: ZodiacSign }
  }
  /** Vedic (sidereal) sign positions — keys must be lowercase planet names */
  vedic: {
    sun?: SimplePlanetPosition
    moon?: SimplePlanetPosition
    mercury?: SimplePlanetPosition
    venus?: SimplePlanetPosition
    mars?: SimplePlanetPosition
    ascendant?: { sign: ZodiacSign }
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

const PERSONAL_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'ascendant'] as const

/**
 * Compute natal synthesis seeds — the core of the 3-layer report engine.
 *
 * For each personal planet (Sun, Moon, Mercury, Venus, Mars, Ascendant):
 *   1. Identify Western sign (tropical) and Vedic sign (sidereal)
 *   2. Compute dignity in each system
 *   3. Classify the divergence
 *   4. Generate the AHA formula seed
 *
 * The resulting seeds are passed to Gemini as structured context.
 * Gemini expands each seed into full paragraphs using the 3-layer structure.
 */
export function computeNatalSynthesisSeeds(input: SynthesisInput): NatalSynthesisSeeds {
  const seeds: NatalSynthesisSeed[] = []

  for (const planet of PERSONAL_PLANETS) {
    const wPos = input.western[planet]
    const vPos = input.vedic[planet]

    if (!wPos?.sign || !vPos?.sign) continue

    const wSign  = wPos.sign
    const vSign  = vPos.sign
    const wEl    = SIGN_ELEMENT[wSign]
    const vEl    = SIGN_ELEMENT[vSign]
    const wMod   = SIGN_MODALITY[wSign]
    const vMod   = SIGN_MODALITY[vSign]
    const wDig   = westernDignity(planet, wSign)
    const vDig   = vedicDignity(planet, vSign)

    const westernExpression = expressionLabel(planet, wEl, wDig)
    const vedicCapacity     = expressionLabel(planet, vEl, vDig)
    const conflictType      = classifyConflict(wSign, vSign, wDig, vDig)

    const seedBase: Omit<NatalSynthesisSeed, 'ahaFormula'> = {
      planet,
      westernSign:       wSign,
      westernElement:    wEl,
      westernModality:   wMod,
      westernDignity:    wDig,
      westernExpression,
      vedicSign:         vSign,
      vedicElement:      vEl,
      vedicModality:     vMod,
      vedicDignity:      vDig,
      vedicCapacity,
      conflictType,
    }

    seeds.push({ ...seedBase, ahaFormula: buildAhaFormula(seedBase) })
  }

  const dignityFlips     = seeds.filter(s => s.conflictType === 'dignity-flip')
  const elementConflicts = seeds.filter(s => s.conflictType === 'element-conflict')
  const reinforced       = seeds.filter(s => s.conflictType === 'same-sign')

  return {
    seeds,
    divergenceCount: seeds.filter(s => s.conflictType !== 'same-sign').length,
    dignityFlips,
    elementConflicts,
    reinforced,
  }
}

/**
 * Extract Western-sign-format position from `WesternChartCalculations`
 * into the flat `SynthesisInput['western']` shape.
 */
export function westernToSynthesisInput(
  chart: {
    planets: { [k: string]: { sign: ZodiacSign } }
    ascendant: { sign: ZodiacSign }
  }
): SynthesisInput['western'] {
  return {
    sun:       chart.planets['sun']     ? { sign: chart.planets['sun'].sign }     : undefined,
    moon:      chart.planets['moon']    ? { sign: chart.planets['moon'].sign }    : undefined,
    mercury:   chart.planets['mercury'] ? { sign: chart.planets['mercury'].sign } : undefined,
    venus:     chart.planets['venus']   ? { sign: chart.planets['venus'].sign }   : undefined,
    mars:      chart.planets['mars']    ? { sign: chart.planets['mars'].sign }    : undefined,
    ascendant: { sign: chart.ascendant.sign },
  }
}

/**
 * Extract Vedic-sign-format position from `VedicChartCalculations.planets`
 * into the flat `SynthesisInput['vedic']` shape.
 */
export function vedicToSynthesisInput(
  vedicData: Record<string, unknown>
): SynthesisInput['vedic'] {
  const planets = (vedicData?.planets ?? {}) as Record<string, { sign?: ZodiacSign }>
  const asc     = (vedicData?.ascendant ?? {}) as { sign?: ZodiacSign }

  function getSign(key: string): ZodiacSign | undefined {
    const p = planets[key]
    return p?.sign
  }

  return {
    sun:       getSign('sun')     ? { sign: getSign('sun')! }     : undefined,
    moon:      getSign('moon')    ? { sign: getSign('moon')! }    : undefined,
    mercury:   getSign('mercury') ? { sign: getSign('mercury')! } : undefined,
    venus:     getSign('venus')   ? { sign: getSign('venus')! }   : undefined,
    mars:      getSign('mars')    ? { sign: getSign('mars')! }    : undefined,
    ascendant: asc.sign ? { sign: asc.sign } : undefined,
  }
}

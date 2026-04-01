/**
 * lib/astro/traitScoringEngine.ts
 * engine3.md §3–6: Signal Extraction → Scoring → Alignment → Contradiction Detection.
 *
 * Pure computation — no I/O, no API calls.
 *
 * Takes:
 *   vedicChart: VedicChartCalculations   (from openastrology-library)
 *   westernChart: WesternChartCalculations (from openastrology-library)
 *
 * Returns TraitAnalysis with 9 trait scores, alignment levels,
 * contradiction flags, and a unified 5–7 bullet summary.
 */

import type { VedicChartCalculations, WesternChartCalculations } from 'openastrology-library'
import type { TraitCategory, TraitScore, TraitAnalysis } from '@/types'
import { TRAIT_LABELS } from '@/types'

// ─── Element / Modality helpers ───────────────────────────────────────────────

type Element = 'fire' | 'earth' | 'air' | 'water'
type Modality = 'cardinal' | 'fixed' | 'mutable'

const SIGN_ELEMENT: Record<string, Element> = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
}

const SIGN_MODALITY: Record<string, Modality> = {
  aries: 'cardinal', cancer: 'cardinal', libra: 'cardinal', capricorn: 'cardinal',
  taurus: 'fixed', leo: 'fixed', scorpio: 'fixed', aquarius: 'fixed',
  gemini: 'mutable', virgo: 'mutable', sagittarius: 'mutable', pisces: 'mutable',
}

const el = (sign: string): Element => SIGN_ELEMENT[sign.toLowerCase()] ?? 'earth'
const mod = (sign: string): Modality => SIGN_MODALITY[sign.toLowerCase()] ?? 'fixed'

// ─── Dignity helpers ──────────────────────────────────────────────────────────

function vDignityStrength(dignity: string): number {
  switch ((dignity ?? '').toLowerCase()) {
    case 'uccha':        return 1.0   // exalted
    case 'swa':          return 0.85  // own sign
    case 'moolatrikona': return 0.80  // moolatrikona
    case 'neecha':       return 0.10  // debilitated
    default:             return 0.50
  }
}

function wDignityStrength(dignity: string): number {
  const d = (dignity ?? '').toLowerCase()
  if (d === 'exalted' || d === 'ruler' || d === 'domicile') return 0.90
  if (d === 'detriment' || d === 'fall' || d === 'debilitated') return 0.15
  return 0.50
}

// ─── Aspect helpers ───────────────────────────────────────────────────────────

function hasAspect(
  aspects: WesternChartCalculations['aspects'],
  p1: string, p2: string,
  types: string[]
): boolean {
  return aspects.some(a =>
    types.includes((a as any).type ?? (a as any).angleName ?? '') &&
    ((a.planet1 === p1 && a.planet2 === p2) || (a.planet1 === p2 && a.planet2 === p1))
  )
}

const HARMONIOUS = ['trine', 'sextile']
const TENSE      = ['square', 'opposition']
const ANY_ASPECT = ['conjunction', 'trine', 'sextile', 'square', 'opposition']

function clamp(v: number): number { return Math.max(0, Math.min(1, v)) }

// ─── Alignment computation (engine3.md §5) ───────────────────────────────────

function computeAlignment(vs: number, ws: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (vs > 0.65 && ws > 0.65) return 'HIGH'
  if (Math.abs(vs - ws) < 0.25) return 'MEDIUM'
  return 'LOW'
}

function isContradiction(vs: number, ws: number): boolean {
  return (vs > 0.7 && ws < 0.4) || (ws > 0.7 && vs < 0.4)
}

// ─── Trait Scorers ────────────────────────────────────────────────────────────

function scoreIdentity(
  v: VedicChartCalculations,
  w: WesternChartCalculations
): Pick<TraitScore, 'vedic_score' | 'western_score' | 'vedic_sources' | 'western_sources'> {
  const vSources: string[] = []
  const wSources: string[] = []

  // ── Vedic ──
  const sun = v.planets.sun
  const dig = vDignityStrength(sun.dignity ?? '')
  let vedic = 0.45

  if (dig >= 0.8) {
    vedic += 0.3; vSources.push(`Sun ${sun.dignity} in ${sun.sign}`)
  } else if (dig <= 0.15) {
    vedic -= 0.15; vSources.push(`Sun debilitated in ${sun.sign}`)
  } else {
    vSources.push(`Sun in ${sun.sign} (house ${sun.house})`)
  }

  const ascEl = el(v.ascendant.sign)
  if (ascEl === 'fire') { vedic += 0.15; vSources.push(`Fire ascendant — bold self-presentation`) }
  else if (ascEl === 'air') { vedic += 0.05; vSources.push(`Air ascendant — expressive identity`) }
  else { vSources.push(`${v.ascendant.sign} ascendant`) }

  if ([1, 4, 7, 10].includes(sun.house)) {
    vedic += 0.1; vSources.push(`Sun in angular house ${sun.house} — prominent identity`)
  }

  // ── Western ──
  const wSun = w.planets.sun
  let western = 0.45

  const sunEl = el(wSun.sign)
  if (sunEl === 'fire') {
    western += 0.15; wSources.push(`Sun in ${wSun.sign} — strong identity drive`)
  } else if (sunEl === 'water') {
    wSources.push(`Sun in ${wSun.sign} — fluid, deeply felt identity`)
  } else {
    wSources.push(`Sun in ${wSun.sign}`)
  }

  const wDig = wDignityStrength(wSun.dignity)
  if (wDig >= 0.8) { western += 0.2; wSources.push(`Sun ${wSun.dignity} — powerful self-expression`) }
  else if (wDig <= 0.2) { western -= 0.15; wSources.push(`Sun in detriment/fall — identity under pressure`) }

  if (wSun.house === 1) { western += 0.12; wSources.push(`Sun in 1st house — identity strongly projected`) }

  if (hasAspect(w.aspects, 'sun', 'ascendant', ['conjunction'])) {
    western += 0.1; wSources.push(`Sun conjunct Ascendant — identity and persona merge`)
  }

  return { vedic_score: clamp(vedic), western_score: clamp(western), vedic_sources: vSources, western_sources: wSources }
}

function scoreEmotionalProfile(
  v: VedicChartCalculations,
  w: WesternChartCalculations
): Pick<TraitScore, 'vedic_score' | 'western_score' | 'vedic_sources' | 'western_sources'> {
  const vSources: string[] = []
  const wSources: string[] = []

  // ── Vedic ──
  const moon = v.planets.moon
  const dig = vDignityStrength(moon.dignity ?? '')
  let vedic = 0.45

  if (dig >= 0.8) {
    vedic += 0.25; vSources.push(`Moon ${moon.dignity} in ${moon.sign} — emotionally strong`)
  } else if (dig <= 0.15) {
    vedic += 0.15; vSources.push(`Moon debilitated in ${moon.sign} — heightened emotional intensity`)
  } else {
    vSources.push(`Moon in ${moon.sign} (house ${moon.house})`)
  }

  const moonEl = el(moon.sign)
  if (moonEl === 'water') { vedic += 0.15; vSources.push(`Moon in water sign — deep emotional nature`) }
  else if (moonEl === 'fire') { vedic += 0.08; vSources.push(`Moon in fire sign — reactive emotions`) }

  if ([4, 7, 1].includes(moon.house)) {
    vedic += 0.08; vSources.push(`Moon in house ${moon.house} — emotions prominently expressed`)
  }

  // ── Western ──
  const wMoon = w.planets.moon
  let western = 0.45

  const wMoonEl = el(wMoon.sign)
  if (wMoonEl === 'water') { western += 0.2; wSources.push(`Moon in ${wMoon.sign} — intense emotional world`) }
  else if (wMoonEl === 'fire') { western += 0.1; wSources.push(`Moon in ${wMoon.sign} — reactive, expressive emotions`) }
  else if (wMoonEl === 'air') { wSources.push(`Moon in ${wMoon.sign} — processes emotions intellectually`) }
  else { wSources.push(`Moon in ${wMoon.sign} — seeks emotional stability`) }

  if (hasAspect(w.aspects, 'moon', 'saturn', TENSE)) {
    western += 0.1; wSources.push(`Moon–Saturn tense aspect — emotional weight and suppression`)
  } else if (hasAspect(w.aspects, 'moon', 'saturn', HARMONIOUS)) {
    western += 0.05; wSources.push(`Moon–Saturn harmonious aspect — emotional steadiness`)
  }

  if (hasAspect(w.aspects, 'moon', 'neptune', ANY_ASPECT)) {
    western += 0.1; wSources.push(`Moon–Neptune — heightened sensitivity and empathy`)
  }

  if (wMoon.house === 4) { western += 0.08; wSources.push(`Moon in 4th house — deep emotional rootedness`) }

  return { vedic_score: clamp(vedic), western_score: clamp(western), vedic_sources: vSources, western_sources: wSources }
}

function scoreDiscipline(
  v: VedicChartCalculations,
  w: WesternChartCalculations
): Pick<TraitScore, 'vedic_score' | 'western_score' | 'vedic_sources' | 'western_sources'> {
  const vSources: string[] = []
  const wSources: string[] = []

  // ── Vedic ──
  const sat = v.planets.saturn
  const dig = vDignityStrength(sat.dignity ?? '')
  let vedic = 0.40

  if (dig >= 0.8) {
    vedic += 0.3; vSources.push(`Saturn ${sat.dignity} in ${sat.sign} — powerful discipline`)
  } else if (dig <= 0.15) {
    vedic -= 0.1; vSources.push(`Saturn debilitated — discipline requires active cultivation`)
  } else {
    vSources.push(`Saturn in ${sat.sign} (house ${sat.house})`)
  }

  if ([1, 10].includes(sat.house)) {
    vedic += 0.15; vSources.push(`Saturn in house ${sat.house} — structure defines life`)
  } else if ([4, 7].includes(sat.house)) {
    vedic += 0.08; vSources.push(`Saturn in angular house ${sat.house}`)
  }

  const ascSign = v.ascendant.sign.toLowerCase()
  if (ascSign === 'capricorn' || ascSign === 'aquarius') {
    vedic += 0.08; vSources.push(`Saturn-ruled ascendant — discipline is core nature`)
  }

  const hasRajayoga = v.yogas?.some(y => y.type === 'Raja') ?? false
  if (hasRajayoga) { vedic += 0.05; vSources.push(`Raja yoga present — achievement through effort`) }

  // ── Western ──
  const wSat = w.planets.saturn
  let western = 0.40

  if (hasAspect(w.aspects, 'saturn', 'sun', HARMONIOUS)) {
    western += 0.2; wSources.push(`Saturn–Sun trine/sextile — discipline naturally expressed`)
  } else if (hasAspect(w.aspects, 'saturn', 'sun', TENSE)) {
    western += 0.12; wSources.push(`Saturn–Sun square/opposition — discipline through struggle`)
  }

  if (hasAspect(w.aspects, 'saturn', 'moon', HARMONIOUS)) {
    western += 0.1; wSources.push(`Saturn–Moon harmonious — emotional self-mastery`)
  }

  const wAscSign = w.ascendant.sign.toLowerCase()
  if (wAscSign === 'capricorn') { western += 0.12; wSources.push(`Capricorn ascendant — discipline as identity`) }
  else if (wAscSign === 'virgo') { western += 0.08; wSources.push(`Virgo ascendant — methodical nature`) }

  if (['capricorn', 'virgo'].includes(w.planets.sun.sign.toLowerCase())) {
    western += 0.08; wSources.push(`Sun in ${w.planets.sun.sign} — structured approach to life`)
  }

  if (wSat.house === 1 || wSat.house === 10) {
    western += 0.12; wSources.push(`Saturn in house ${wSat.house} — structure shapes personality`)
  }

  return { vedic_score: clamp(vedic), western_score: clamp(western), vedic_sources: vSources, western_sources: wSources }
}

function scoreSocialOrientation(
  v: VedicChartCalculations,
  w: WesternChartCalculations
): Pick<TraitScore, 'vedic_score' | 'western_score' | 'vedic_sources' | 'western_sources'> {
  const vSources: string[] = []
  const wSources: string[] = []

  // ── Vedic ──
  const rahu = v.planets.rahu
  let vedic = 0.40

  if ([1, 4, 7, 10].includes(rahu.house)) {
    vedic += 0.15; vSources.push(`Rahu in angular house ${rahu.house} — strong worldly drive`)
  }

  const venus = v.planets.venus
  const venusDig = vDignityStrength(venus.dignity ?? '')
  if (venusDig >= 0.8) { vedic += 0.12; vSources.push(`Venus ${venus.dignity} — social magnetism`) }
  if (venus.house === 7 || venus.house === 11) { vedic += 0.08; vSources.push(`Venus in social house`) }

  const ascEl2 = el(v.ascendant.sign)
  if (ascEl2 === 'fire' || ascEl2 === 'air') {
    vedic += 0.1; vSources.push(`${v.ascendant.sign} ascendant — socially oriented presentation`)
  } else if (ascEl2 === 'water') {
    vSources.push(`${v.ascendant.sign} ascendant — selective in social engagement`)
  }

  if ([7, 11].includes(v.planets.jupiter.house)) {
    vedic += 0.08; vSources.push(`Jupiter in social house — expansive connections`)
  }

  // ── Western ──
  let western = 0.40
  const wASCEl = el(w.ascendant.sign)
  if (wASCEl === 'air') { western += 0.18; wSources.push(`Air ascendant — naturally social, communicative`) }
  else if (wASCEl === 'fire') { western += 0.1; wSources.push(`Fire ascendant — charismatic presence`) }
  else if (wASCEl === 'water') { wSources.push(`Water ascendant — socially selective`) }

  const wSunEl = el(w.planets.sun.sign)
  if (wSunEl === 'air') { western += 0.12; wSources.push(`Sun in air sign — social identity`) }
  else if (wSunEl === 'fire') { western += 0.08; wSources.push(`Sun in fire sign — expressive, charismatic`) }

  const wVenus = w.planets.venus
  if (el(wVenus.sign) === 'air' || el(wVenus.sign) === 'fire') {
    western += 0.08; wSources.push(`Venus in ${wVenus.sign} — social ease`)
  }

  if (wVenus.house === 1 || wVenus.house === 7) {
    western += 0.1; wSources.push(`Venus in house ${wVenus.house} — relationship-centered`)
  }

  return { vedic_score: clamp(vedic), western_score: clamp(western), vedic_sources: vSources, western_sources: wSources }
}

function scoreRiskAmbition(
  v: VedicChartCalculations,
  w: WesternChartCalculations
): Pick<TraitScore, 'vedic_score' | 'western_score' | 'vedic_sources' | 'western_sources'> {
  const vSources: string[] = []
  const wSources: string[] = []

  // ── Vedic ──
  const mars = v.planets.mars
  const marsDig = vDignityStrength(mars.dignity ?? '')
  let vedic = 0.40

  if (marsDig >= 0.8) {
    vedic += 0.28; vSources.push(`Mars ${mars.dignity} in ${mars.sign} — powerful drive and initiative`)
  } else if (marsDig <= 0.15) {
    vedic -= 0.1; vSources.push(`Mars debilitated — drive expressed indirectly`)
  } else {
    vSources.push(`Mars in ${mars.sign} (house ${mars.house})`)
  }

  if ([1, 10].includes(mars.house)) { vedic += 0.12; vSources.push(`Mars in house ${mars.house} — ambition at the forefront`) }
  if ([1, 4, 7, 10].includes(v.planets.rahu.house)) { vedic += 0.08; vSources.push(`Rahu in angular house — worldly ambition strong`) }

  const sunEl3 = el(v.planets.sun.sign)
  if (sunEl3 === 'fire') { vedic += 0.08; vSources.push(`Fire Sun — courageous self-assertion`) }

  // ── Western ──
  const wMars = w.planets.mars
  let western = 0.40

  const wMarsDig = wDignityStrength(wMars.dignity)
  if (wMarsDig >= 0.8) {
    western += 0.25; wSources.push(`Mars ${wMars.dignity} — raw ambition and courage`)
  } else if (wMarsDig <= 0.2) {
    western -= 0.08; wSources.push(`Mars in detriment/fall — drive needs redirection`)
  }

  if (hasAspect(w.aspects, 'sun', 'mars', HARMONIOUS)) {
    western += 0.15; wSources.push(`Sun–Mars trine/sextile — courage flows naturally`)
  } else if (hasAspect(w.aspects, 'sun', 'mars', ['conjunction'])) {
    western += 0.12; wSources.push(`Sun–Mars conjunction — driven, assertive energy`)
  }

  if (wMars.house === 1 || wMars.house === 10) {
    western += 0.12; wSources.push(`Mars in house ${wMars.house} — ambition shapes identity`)
  }

  const wSunEl2 = el(w.planets.sun.sign)
  if (wSunEl2 === 'fire') { western += 0.08; wSources.push(`Fire Sun — naturally bold and initiative-taking`) }

  return { vedic_score: clamp(vedic), western_score: clamp(western), vedic_sources: vSources, western_sources: wSources }
}

function scoreCommunication(
  v: VedicChartCalculations,
  w: WesternChartCalculations
): Pick<TraitScore, 'vedic_score' | 'western_score' | 'vedic_sources' | 'western_sources'> {
  const vSources: string[] = []
  const wSources: string[] = []

  // ── Vedic ──
  const merc = v.planets.mercury
  const mercDig = vDignityStrength(merc.dignity ?? '')
  let vedic = 0.40

  if (mercDig >= 0.8) {
    vedic += 0.28; vSources.push(`Mercury ${merc.dignity} — clear, powerful communication`)
  } else if (mercDig <= 0.15) {
    vedic -= 0.1; vSources.push(`Mercury debilitated — communication is a growth area`)
  } else {
    vSources.push(`Mercury in ${merc.sign} (house ${merc.house})`)
  }

  if (merc.house === 3) { vedic += 0.12; vSources.push(`Mercury in 3rd house — communication as life theme`) }
  if (merc.house === 1) { vedic += 0.1; vSources.push(`Mercury in 1st house — mind and words define presence`) }

  const ascSign2 = v.ascendant.sign.toLowerCase()
  if (ascSign2 === 'gemini' || ascSign2 === 'virgo') {
    vedic += 0.08; vSources.push(`Mercury-ruled ascendant — intellect shapes life`)
  }

  // ── Western ──
  const wMerc = w.planets.mercury
  let western = 0.40

  const wMercEl = el(wMerc.sign)
  if (wMercEl === 'air') { western += 0.2; wSources.push(`Mercury in air sign — natural fluency and quick mind`) }
  else if (wMercEl === 'earth') { western += 0.1; wSources.push(`Mercury in earth sign — precise, methodical communication`) }
  else if (wMercEl === 'fire') { western += 0.08; wSources.push(`Mercury in fire sign — direct, enthusiastic expression`) }
  else { wSources.push(`Mercury in water sign — intuitive, non-linear communication`) }

  const wASCSign = w.ascendant.sign.toLowerCase()
  if (wASCSign === 'gemini') { western += 0.12; wSources.push(`Gemini ascendant — communication as persona`) }
  else if (wASCSign === 'virgo') { western += 0.1; wSources.push(`Virgo ascendant — precise communication`) }

  if (hasAspect(w.aspects, 'mercury', 'sun', HARMONIOUS)) {
    western += 0.1; wSources.push(`Mercury–Sun harmonious — mind and identity in sync`)
  }

  if (wMerc.house === 3 || wMerc.house === 1) {
    western += 0.1; wSources.push(`Mercury in house ${wMerc.house} — communication style is central`)
  }

  return { vedic_score: clamp(vedic), western_score: clamp(western), vedic_sources: vSources, western_sources: wSources }
}

function scoreRelationshipPatterns(
  v: VedicChartCalculations,
  w: WesternChartCalculations
): Pick<TraitScore, 'vedic_score' | 'western_score' | 'vedic_sources' | 'western_sources'> {
  const vSources: string[] = []
  const wSources: string[] = []

  // ── Vedic ──
  const ven = v.planets.venus
  const venDig = vDignityStrength(ven.dignity ?? '')
  let vedic = 0.40

  if (venDig >= 0.8) {
    vedic += 0.28; vSources.push(`Venus ${ven.dignity} — deeply attuned to relationships`)
  } else if (venDig <= 0.15) {
    vedic -= 0.05; vSources.push(`Venus debilitated — relationships as growth territory`)
  } else {
    vSources.push(`Venus in ${ven.sign} (house ${ven.house})`)
  }

  if (ven.house === 7) { vedic += 0.15; vSources.push(`Venus in 7th house — partnership defines life`) }
  else if (ven.house === 5) { vedic += 0.08; vSources.push(`Venus in 5th house — romantic and creative love`) }

  const moon7 = v.planets.moon
  if (moon7.house === 7 || moon7.house === 5) {
    vedic += 0.08; vSources.push(`Moon in house ${moon7.house} — emotional fulfilment through relationships`)
  }

  // ── Western ──
  const wVen = w.planets.venus
  let western = 0.40

  const wVenSign = wVen.sign.toLowerCase()
  if (wVenSign === 'libra' || wVenSign === 'taurus') {
    western += 0.2; wSources.push(`Venus in ${wVen.sign} (domicile) — relationship harmony is natural`)
  } else if (wVenSign === 'pisces') {
    western += 0.2; wSources.push(`Venus exalted in Pisces — deep, spiritual capacity for love`)
  } else if (wVenSign === 'aries') {
    western += 0.08; wSources.push(`Venus in Aries — direct, passionate relational style`)
  } else {
    wSources.push(`Venus in ${wVen.sign}`)
  }

  if (hasAspect(w.aspects, 'venus', 'moon', HARMONIOUS)) {
    western += 0.12; wSources.push(`Venus–Moon harmonious — emotional warmth in relationships`)
  } else if (hasAspect(w.aspects, 'venus', 'moon', TENSE)) {
    western += 0.08; wSources.push(`Venus–Moon tense — complex emotional/love needs`)
  }

  if (hasAspect(w.aspects, 'venus', 'saturn', HARMONIOUS)) {
    western += 0.1; wSources.push(`Venus–Saturn harmonious — committed, loyal approach to love`)
  }

  if (wVen.house === 7 || wVen.house === 5) {
    western += 0.1; wSources.push(`Venus in house ${wVen.house} — relationship-centred life area`)
  }

  return { vedic_score: clamp(vedic), western_score: clamp(western), vedic_sources: vSources, western_sources: wSources }
}

function scoreEnergyBurnout(
  v: VedicChartCalculations,
  w: WesternChartCalculations
): Pick<TraitScore, 'vedic_score' | 'western_score' | 'vedic_sources' | 'western_sources'> {
  const vSources: string[] = []
  const wSources: string[] = []

  // ── Vedic ──
  const mars8 = v.planets.mars
  const marsDig8 = vDignityStrength(mars8.dignity ?? '')
  let vedic = 0.40

  if (marsDig8 >= 0.8) {
    vedic += 0.25; vSources.push(`Mars ${mars8.dignity} — sustained high vitality`)
  } else if (marsDig8 <= 0.15) {
    vedic -= 0.1; vSources.push(`Mars debilitated — energy fluctuates, burnout risk`)
  } else {
    vSources.push(`Mars in ${mars8.sign} — moderate energy baseline`)
  }

  const sun8 = v.planets.sun
  if (el(sun8.sign) === 'fire') { vedic += 0.1; vSources.push(`Fire Sun — naturally high energy output`) }

  const sat8 = v.planets.saturn
  if (sat8.house === 6 || sat8.house === 12) {
    vedic -= 0.1; vSources.push(`Saturn in house ${sat8.house} — chronic depletion risk`)
  }

  const moonMod8 = mod(v.planets.moon.sign)
  if (moonMod8 === 'fixed') { vedic += 0.08; vSources.push(`Fixed Moon — sustained emotional resilience`) }
  else if (moonMod8 === 'mutable') { vedic -= 0.05; vSources.push(`Mutable Moon — variable energy cycles`) }

  // ── Western ──
  const wSun8 = w.planets.sun
  let western = 0.40

  const wSunMod8 = mod(wSun8.sign)
  if (wSunMod8 === 'fixed') { western += 0.15; wSources.push(`Fixed Sun sign — steady, enduring energy`) }
  else if (wSunMod8 === 'cardinal') { western += 0.1; wSources.push(`Cardinal Sun — bursts of high energy, renewal cycles`) }
  else { wSources.push(`Mutable Sun — adaptable energy, cycles of high and low`) }

  if (el(wSun8.sign) === 'fire') { western += 0.12; wSources.push(`Fire Sun — high metabolic energy`) }

  if (hasAspect(w.aspects, 'sun', 'saturn', TENSE)) {
    western -= 0.08; wSources.push(`Sun–Saturn tense — energy blocked or burdened`)
  } else if (hasAspect(w.aspects, 'sun', 'saturn', HARMONIOUS)) {
    western += 0.08; wSources.push(`Sun–Saturn harmonious — sustainable, regulated energy`)
  }

  if (hasAspect(w.aspects, 'mars', 'saturn', TENSE)) {
    western -= 0.1; wSources.push(`Mars–Saturn tense — frustration depletes energy`)
  }

  if (hasAspect(w.aspects, 'sun', 'jupiter', HARMONIOUS)) {
    western += 0.1; wSources.push(`Sun–Jupiter harmonious — optimism sustains vitality`)
  }

  return { vedic_score: clamp(vedic), western_score: clamp(western), vedic_sources: vSources, western_sources: wSources }
}

function scoreLifeDirection(
  v: VedicChartCalculations,
  w: WesternChartCalculations
): Pick<TraitScore, 'vedic_score' | 'western_score' | 'vedic_sources' | 'western_sources'> {
  const vSources: string[] = []
  const wSources: string[] = []

  // ── Vedic ──
  const jup = v.planets.jupiter
  const jupDig = vDignityStrength(jup.dignity ?? '')
  let vedic = 0.40

  if (jupDig >= 0.8) {
    vedic += 0.25; vSources.push(`Jupiter ${jup.dignity} — strong sense of dharma and wisdom`)
  } else {
    vSources.push(`Jupiter in ${jup.sign} (house ${jup.house})`)
  }

  if ([9, 10].includes(jup.house)) { vedic += 0.15; vSources.push(`Jupiter in house ${jup.house} — purpose-driven life`) }

  const sun9 = v.planets.sun
  if ([1, 9, 10].includes(sun9.house)) { vedic += 0.1; vSources.push(`Sun in house ${sun9.house} — clear life mission`) }

  const hasDhanaYoga = v.yogas?.some(y => y.type === 'Raja' && y.strength !== 'Weak') ?? false
  if (hasDhanaYoga) { vedic += 0.08; vSources.push(`Strong yoga present — karmic direction clarified`) }

  // ── Western ──
  const wJup = w.planets.jupiter
  let western = 0.40

  const wJupDig = wDignityStrength(wJup.dignity)
  if (wJupDig >= 0.8) {
    western += 0.2; wSources.push(`Jupiter ${wJup.dignity} — expansive life vision`)
  } else {
    wSources.push(`Jupiter in ${wJup.sign} — growth orientation`)
  }

  if ([9, 10].includes(wJup.house)) {
    western += 0.15; wSources.push(`Jupiter in house ${wJup.house} — purposeful expansion`)
  }

  if (hasAspect(w.aspects, 'sun', 'jupiter', HARMONIOUS)) {
    western += 0.15; wSources.push(`Sun–Jupiter harmonious — purpose and confidence aligned`)
  } else if (hasAspect(w.aspects, 'sun', 'jupiter', ['conjunction'])) {
    western += 0.12; wSources.push(`Sun–Jupiter conjunction — optimism and vision strong`)
  }

  if (hasAspect(w.aspects, 'saturn', 'sun', HARMONIOUS)) {
    western += 0.08; wSources.push(`Saturn–Sun harmonious — disciplined pursuit of purpose`)
  }

  const wSunMod9 = mod(w.planets.sun.sign)
  if (wSunMod9 === 'fixed') { western += 0.08; wSources.push(`Fixed Sun — unwavering commitment to direction`) }
  else if (wSunMod9 === 'cardinal') { western += 0.05; wSources.push(`Cardinal Sun — initiates new life directions`) }

  return { vedic_score: clamp(vedic), western_score: clamp(western), vedic_sources: vSources, western_sources: wSources }
}

// ─── Unified Summary Builder ──────────────────────────────────────────────────

const TRAIT_SUMMARIES: Record<TraitCategory, (vs: number, ws: number) => string> = {
  identity: (vs, ws) =>
    vs > 0.7 && ws > 0.7
      ? 'Strong, consistent sense of self — both systems confirm a powerful identity that projects naturally.'
      : vs > ws
      ? 'Deep inner identity (Vedic) stronger than the outer projection — quiet authority beneath the surface.'
      : 'Your external presence (Western) is more prominent than your internal sense of self — charisma that you\'re still learning to trust.',
  emotional_profile: (vs, ws) =>
    vs > 0.65 && ws > 0.65
      ? 'Rich emotional depth — a deeply feeling nature confirmed by both astrological systems.'
      : vs > ws
      ? 'Karmic emotional intensity (Vedic) runs deeper than your conscious experience of it.'
      : 'Emotionally expressive on the surface (Western), with a more composed inner world than others realise.',
  discipline: (vs, ws) =>
    vs > 0.65 && ws > 0.65
      ? 'Strong disciplined nature — long-term structures and self-mastery are central to your path.'
      : vs > ws
      ? 'Karmic capacity for discipline (Vedic) exceeds conscious awareness — untapped structural power.'
      : 'You apply discipline in visible ways (Western), though your inner drive for structure is still developing.',
  social_orientation: (vs, ws) =>
    vs > 0.65 && ws > 0.65
      ? 'Naturally oriented toward social connection — relationships and networks fuel your growth.'
      : vs > ws
      ? 'Your karmic purpose involves social engagement more than you currently express.'
      : 'Outwardly social (Western), while needing more private time than others expect.',
  risk_ambition: (vs, ws) =>
    vs > 0.65 && ws > 0.65
      ? 'High ambition and risk tolerance — built to initiate and push boundaries.'
      : vs > ws
      ? 'Karmic warrior energy (Vedic) waiting to be consciously activated — greater drive than you show.'
      : 'Visible ambition (Western) with a more measured inner approach — strategic risk-taking.',
  communication: (vs, ws) =>
    vs > 0.65 && ws > 0.65
      ? 'Natural communicator — language, ideas, and expression are core to your identity.'
      : vs > ws
      ? 'Deep intellectual capacity (Vedic) that finds clearer expression as you trust your voice.'
      : 'Fluent external communicator (Western) — the depth of your inner perception exceeds what you say.',
  relationship_patterns: (vs, ws) =>
    vs > 0.65 && ws > 0.65
      ? 'Relationships are a central karmic theme — love and partnership are where growth is greatest.'
      : vs > ws
      ? 'Relational karma runs deep (Vedic) — your soul\'s work is significantly tied to partnership.'
      : 'Relationship-oriented on the surface (Western), with a deeper self-sufficiency beneath.',
  energy_burnout: (vs, ws) =>
    vs > 0.65 && ws > 0.65
      ? 'High, sustainable vitality — able to sustain long periods of intense output.'
      : vs > ws
      ? 'Karmic vitality (Vedic) is strong — physical resilience that needs conscious access.'
      : 'High energy output (Western), with hidden recovery needs that benefit from attention.',
  life_direction: (vs, ws) =>
    vs > 0.65 && ws > 0.65
      ? 'Strong sense of life purpose — both systems confirm a clear karmic direction.'
      : vs > ws
      ? 'Your dharmic path (Vedic) is clearer than your conscious awareness of it — trust what you\'re called to do.'
      : 'Clear conscious goals (Western), with a deeper calling (Vedic) that sometimes surprises you.',
}

// ─── Main Export ──────────────────────────────────────────────────────────────

const SCORERS: Array<[TraitCategory, (v: VedicChartCalculations, w: WesternChartCalculations) => Pick<TraitScore, 'vedic_score' | 'western_score' | 'vedic_sources' | 'western_sources'>]> = [
  ['identity',              scoreIdentity],
  ['emotional_profile',     scoreEmotionalProfile],
  ['discipline',            scoreDiscipline],
  ['social_orientation',    scoreSocialOrientation],
  ['risk_ambition',         scoreRiskAmbition],
  ['communication',         scoreCommunication],
  ['relationship_patterns', scoreRelationshipPatterns],
  ['energy_burnout',        scoreEnergyBurnout],
  ['life_direction',        scoreLifeDirection],
]

export function computeTraitScores(
  vedicChart: VedicChartCalculations,
  westernChart: WesternChartCalculations
): TraitAnalysis {
  const scores: TraitScore[] = SCORERS.map(([trait, scoreFn]) => {
    const { vedic_score, western_score, vedic_sources, western_sources } = scoreFn(vedicChart, westernChart)
    const alignment = computeAlignment(vedic_score, western_score)
    const contradiction = isContradiction(vedic_score, western_score)
    return {
      trait,
      label: TRAIT_LABELS[trait],
      vedic_score,
      western_score,
      alignment,
      contradiction,
      vedic_sources,
      western_sources,
    }
  })

  const topStrengths = scores
    .filter(s => s.alignment === 'HIGH' && s.vedic_score > 0.65 && s.western_score > 0.65)
    .sort((a, b) => (b.vedic_score + b.western_score) - (a.vedic_score + a.western_score))

  const contradictions = scores.filter(s => s.contradiction)

  // 5–7 summary bullets — prioritise high-alignment strengths, include top contradiction if any
  const summaryScores = [
    ...topStrengths.slice(0, 5),
    ...contradictions.slice(0, 2),
  ].slice(0, 7)

  // Add at least 5 bullets from any scores if not enough high-alignment
  const fallback = summaryScores.length < 5
    ? scores.sort((a, b) => (b.vedic_score + b.western_score) - (a.vedic_score + a.western_score)).slice(0, 5)
    : summaryScores

  const unifiedSummary = fallback.map(s =>
    TRAIT_SUMMARIES[s.trait](s.vedic_score, s.western_score)
  )

  return { scores, topStrengths, contradictions, unifiedSummary }
}

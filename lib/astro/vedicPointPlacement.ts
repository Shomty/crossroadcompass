// STATUS: done | Special points — whole-sign house, rāśi, nakṣatra/pada for UI
/**
 * Whole-sign house from D1 Lagna; rāśi from longitude; nakṣatra/pada via
 * openastrology-library equal-division helpers (pure math, no ephemeris).
 * Sign-only lagnas use 0° of that sign for nakṣatra (see plan).
 */

import { NakshatraUtils, type Nakshatra } from 'openastrology-library'
import type {
  Charakaraka,
  DhoomaChainResult,
  ExtendedSpecialPointsPlacements,
  ExtendedSpecialPointsResult,
  FoundationSpecialPointsPlacements,
  KaalVelaSetResult,
  NatalLagnaInfo,
  SignNumber,
  SpecialPointsResult,
  VedicPointPlacement,
} from '@/types'
import type { SpecialPointsInputs } from '@/lib/astro/vedicChartMapper'
import {
  countSignsBetween,
  longitudeToSignAndDegree,
  planetAbsoluteLongitude,
} from '@/lib/astro/specialPoints'

const RASI_ENGLISH: Record<SignNumber, string> = {
  1: 'Aries',
  2: 'Taurus',
  3: 'Gemini',
  4: 'Cancer',
  5: 'Leo',
  6: 'Virgo',
  7: 'Libra',
  8: 'Scorpio',
  9: 'Sagittarius',
  10: 'Capricorn',
  11: 'Aquarius',
  12: 'Pisces',
}

function wrapLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360
}

/** e.g. purva_phalguni → Purva Phalguni */
export function formatNakshatraLabel(n: Nakshatra): string {
  return n
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export { formatPlacementLine } from '@/lib/astro/vedicPointPlacementFormat'

export function placementFromLongitude(
  lagnaSignNumber: SignNumber,
  longitude: number
): VedicPointPlacement {
  const λ = wrapLongitude(longitude)
  const { sign } = longitudeToSignAndDegree(λ)
  const nak = NakshatraUtils.getNakshatraFromLongitude(λ)
  const pada = NakshatraUtils.getNakshatraPada(λ)
  return {
    houseFromLagna: countSignsBetween(lagnaSignNumber, sign),
    rasiSignNumber: sign,
    rasiName: RASI_ENGLISH[sign],
    nakshatra: formatNakshatraLabel(nak),
    pada,
  }
}

function signCuspLongitude(sign: SignNumber): number {
  return wrapLongitude((sign - 1) * 30)
}

function longitudeFromSignAndDegree(sign: SignNumber, degreeInSign: number): number {
  return wrapLongitude((sign - 1) * 30 + degreeInSign)
}

export function placementForNatalLagna(
  lagnaSignNumber: SignNumber,
  natal: NatalLagnaInfo
): VedicPointPlacement {
  if (natal.degreeInSign === undefined) {
    return placementFromLongitude(lagnaSignNumber, signCuspLongitude(natal.signNumber))
  }
  const λ = planetAbsoluteLongitude({
    planet: 'Sun',
    signNumber: natal.signNumber,
    degreeInSign: natal.degreeInSign,
    arcMinutes: natal.arcMinutes ?? 0,
    arcSeconds: natal.arcSeconds ?? 0,
  })
  return placementFromLongitude(lagnaSignNumber, λ)
}

export function attachFoundationPlacements(
  result: SpecialPointsResult,
  inputs: SpecialPointsInputs
): SpecialPointsResult {
  const L = inputs.lagnaSignNumber
  const { arudhaLagna, ghatiLagna, bhavaLagna, horaLagna, charakarakas: ckSet } = result
  const natal = result.natalLagna

  const ckPlacements: Partial<Record<Charakaraka, VedicPointPlacement>> = {}
  for (const k of ckSet.karakas) {
    const pos = inputs.planets.find(p => p.planet === k.planet)
    if (!pos) continue
    const λ = planetAbsoluteLongitude(pos)
    ckPlacements[k.rank] = placementFromLongitude(L, λ)
  }

  const placements: FoundationSpecialPointsPlacements = {
    arudhaLagna: placementFromLongitude(L, signCuspLongitude(arudhaLagna.arudhaSignNumber)),
    ghatiLagna: placementFromLongitude(
      L,
      longitudeFromSignAndDegree(ghatiLagna.ghatiLagnaSignNumber, ghatiLagna.ghatiLagnaDegree)
    ),
    bhavaLagna: placementFromLongitude(
      L,
      longitudeFromSignAndDegree(bhavaLagna.bhavaLagnaSignNumber, bhavaLagna.bhavaLagnaDegree)
    ),
    horaLagna: placementFromLongitude(
      L,
      longitudeFromSignAndDegree(horaLagna.horaLagnaSignNumber, horaLagna.horaLagnaDegree)
    ),
    charakarakas: ckPlacements,
  }

  if (natal) {
    const np = placementForNatalLagna(L, natal)
    if (np) placements.natalLagna = np
  }

  return { ...result, placements }
}

function kaalPlacements(
  lagnaSignNumber: SignNumber,
  set: KaalVelaSetResult
): ExtendedSpecialPointsPlacements['kaalVelas'] {
  const lon = (v: { referenceLongitude: number }) =>
    placementFromLongitude(lagnaSignNumber, v.referenceLongitude)
  return {
    gulika: lon(set.gulika),
    maandi: lon(set.maandi),
    kaala: lon(set.kaala),
    mrityu: lon(set.mrityu),
    ardhaprahara: lon(set.ardhaprahara),
    yamaghantaka: lon(set.yamaghantaka),
  }
}

export function attachExtendedPlacements(
  extended: ExtendedSpecialPointsResult,
  inputs: SpecialPointsInputs
): ExtendedSpecialPointsResult {
  const L = inputs.lagnaSignNumber
  const {
    varnadaLagna,
    pranapada,
    upapadaLagna,
    sreeLagna,
    bhriguBindu,
    beejaSphuata,
    kshetraSphuata,
    trisphuta,
    dhoomaChain,
    kaalVelas,
  } = extended

  const ppλ = longitudeFromSignAndDegree(
    pranapada.pranapadalagnaSignNumber,
    pranapada.pranapadalagnaDegree
  )

  const placements: ExtendedSpecialPointsPlacements = {
    varnadaLagna: placementFromLongitude(L, signCuspLongitude(varnadaLagna.varnadaLagnaSignNumber)),
    pranapada: placementFromLongitude(L, ppλ),
    upapadaLagna: placementFromLongitude(L, signCuspLongitude(upapadaLagna.upapadaSignNumber)),
    sreeLagna: placementFromLongitude(L, signCuspLongitude(sreeLagna.sreeLagnaSignNumber)),
    bhriguBindu: placementFromLongitude(L, bhriguBindu.bhriguBinduLongitude),
    beejaSphuta: placementFromLongitude(L, beejaSphuata.beejaSphutaLongitude),
    kshetraSphuta: placementFromLongitude(L, kshetraSphuata.kshetraSphutaLongitude),
    trisphuta: trisphuta ? placementFromLongitude(L, trisphuta.triSphutaLongitude) : null,
    dhoomaChain: dhoomaPlacements(L, dhoomaChain),
    kaalVelas: kaalVelas ? kaalPlacements(L, kaalVelas) : null,
  }

  return { ...extended, placements }
}

function dhoomaPlacements(
  L: SignNumber,
  d: DhoomaChainResult
): ExtendedSpecialPointsPlacements['dhoomaChain'] {
  return {
    dhooma: placementFromLongitude(L, d.dhooma),
    vyatipata: placementFromLongitude(L, d.vyatipata),
    parivesha: placementFromLongitude(L, d.parivesha),
    indraChapa: placementFromLongitude(L, d.indraChapa),
    upaketu: placementFromLongitude(L, d.upaketu),
  }
}

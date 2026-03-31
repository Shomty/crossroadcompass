/**
 * Puruṣārtha weighted scoring: base 50 + Tara, SAV, Tithi–Vāra harmony, graha dṛṣṭi on Moon.
 * Traffic light: ≥70 green, 45–69 yellow, &lt;45 red (Gaṇḍānta keeps volatile styling).
 */

import type {
  PurusharthaHeatTier,
  PurusharthaSavBand,
  PurusharthaWeightedScoreBreakdown,
  SignNumber,
} from "@/types";
import type { PanchangaLimbs } from "@/lib/astro/muhurta/panchanga";
import {
  taraNumberFromNakshatras,
  transitSignFromLongitude,
  type PurusharthaPersonalContextLoaded,
} from "@/lib/astro/muhurta/purusharthaPersonalFilters";
import { getHouseFromLagna } from "@/lib/astro/muhurta/windowScorer";

export interface PurusharthaWeightedResult {
  score: number;
  heatTier: PurusharthaHeatTier;
  breakdown: PurusharthaWeightedScoreBreakdown;
  /** Pañcaka śuddhi reference (0–100), not part of weighted total. */
  panchakaReferenceScore: number;
  personalization: "full" | "unavailable";
  savMoonSignPoints: number | null;
  savBand: PurusharthaSavBand | null;
  greenEligible: boolean;
  taraNumber: number | null;
  /** Tara 3 / 5 / 7 (obstacle-class). */
  taraFault: boolean;
  /** Tara 7 Naidhana — strongest stress; drives “hard red” remedy path. */
  taraNaidhana: boolean;
  mantraRequired: boolean;
  mantraWarning: string | null;
  remedyHint: string | null;
  sadeSatiHeavy: boolean;
}

const MANTRA_DUSTHANA =
  "Warning: Energy is hidden/obstructed. Remedies required.";

/** Siddha: Friday + Nanda (1,6,11); Wednesday + Bhadra (2,7,12). */
export function tithiVaraScoreDelta(
  vaaraIndex0Sun0to6: number,
  indexInPaksha1to15: number
): { delta: number; siddha: boolean; dagdha: boolean } {
  const ip = indexInPaksha1to15;
  let delta = 0;
  let siddha = false;
  let dagdha = false;

  if (vaaraIndex0Sun0to6 === 5 && [1, 6, 11].includes(ip)) {
    delta += 10;
    siddha = true;
  }
  if (vaaraIndex0Sun0to6 === 3 && [2, 7, 12].includes(ip)) {
    delta += 10;
    siddha = true;
  }

  if (isDagdhaYoga(vaaraIndex0Sun0to6, ip)) {
    delta -= 15;
    dagdha = true;
  }

  return { delta, siddha, dagdha };
}

/** Extensible Dagdha table; includes the classic Sunday + Dwādaśī (12) pair. */
function isDagdhaYoga(vaaraIndex0Sun0to6: number, indexInPaksha1to15: number): boolean {
  const rows: Array<{ v: number; t: number }> = [
    { v: 0, t: 12 },
    { v: 1, t: 11 },
    { v: 2, t: 5 },
    { v: 3, t: 3 },
    { v: 4, t: 9 },
    { v: 5, t: 10 },
    { v: 6, t: 4 },
  ];
  return rows.some((r) => r.v === vaaraIndex0Sun0to6 && r.t === indexInPaksha1to15);
}

export function taraScoreDelta(taraNumber: number): number {
  switch (taraNumber) {
    case 1:
      return -5;
    case 2:
    case 4:
    case 6:
    case 8:
    case 9:
      return 15;
    case 3:
      return -20;
    case 5:
      return -15;
    case 7:
      return -30;
    default:
      return 0;
  }
}

/** SAV on sign containing transit Moon: &gt;30 → +20; 25–30 → +5; &lt;20 → −20; else 0. */
export function savScoreDelta(savPoints: number): number {
  if (savPoints > 30) return 20;
  if (savPoints >= 25) return 5;
  if (savPoints < 20) return -20;
  return 0;
}

function sign0(s: SignNumber): number {
  return s - 1;
}

function wrapSign0(x: number): SignNumber {
  return ((((x % 12) + 12) % 12) + 1) as SignNumber;
}

/** Parāśara whole-sign dṛṣṭi: Jupiter → 5th, 7th, 9th from Jupiter. */
export function signsAspectedByJupiter(jupiterSign: SignNumber): SignNumber[] {
  const j = sign0(jupiterSign);
  return [wrapSign0(j + 4), wrapSign0(j + 6), wrapSign0(j + 8)];
}

/** Venus → 7th from Venus. */
export function signsAspectedByVenus(venusSign: SignNumber): SignNumber[] {
  const v = sign0(venusSign);
  return [wrapSign0(v + 6)];
}

/** Mars → 4th, 7th, 8th from Mars. */
export function signsAspectedByMars(marsSign: SignNumber): SignNumber[] {
  const m = sign0(marsSign);
  return [wrapSign0(m + 3), wrapSign0(m + 6), wrapSign0(m + 7)];
}

/** Saturn → 3rd, 7th, 10th from Saturn. */
export function signsAspectedBySaturn(saturnSign: SignNumber): SignNumber[] {
  const s = sign0(saturnSign);
  return [wrapSign0(s + 2), wrapSign0(s + 6), wrapSign0(s + 9)];
}

/**
 * +10 if Jupiter or Venus aspects transit Moon’s sign; −10 if Mars or Saturn does.
 * If both apply, net 0 from this component.
 */
export function drishtiScoreDelta(
  moonLongitude: number,
  jupiterLongitude: number,
  venusLongitude: number,
  marsLongitude: number,
  saturnLongitude: number
): number {
  const moonSign = transitSignFromLongitude(moonLongitude);
  const jS = transitSignFromLongitude(jupiterLongitude);
  const vS = transitSignFromLongitude(venusLongitude);
  const mS = transitSignFromLongitude(marsLongitude);
  const sS = transitSignFromLongitude(saturnLongitude);

  const benefic =
    signsAspectedByJupiter(jS).includes(moonSign) ||
    signsAspectedByVenus(vS).includes(moonSign);
  const malefic =
    signsAspectedByMars(mS).includes(moonSign) ||
    signsAspectedBySaturn(sS).includes(moonSign);

  let d = 0;
  if (benefic) d += 10;
  if (malefic) d -= 10;
  return d;
}

export function savBandFromPoints(sav: number | null): PurusharthaSavBand | null {
  if (sav === null) return null;
  if (sav < 20) return "drained";
  if (sav <= 30) return "struggling";
  return "strong";
}

function dusthanaRemedyHint(house: number): string | null {
  if (house === 8) {
    return "Consider the Mahāmr̥tyuñjaya mantra for stability during hidden or sudden pressure.";
  }
  if (house === 6 || house === 12) {
    return "Gentle daily practice, mantra, or guided remedy work supports this window.";
  }
  return null;
}

export function computeWeightedPurusharthaScore(input: {
  limbs: PanchangaLimbs;
  transitMoonLongitude: number;
  jupiterLongitude: number;
  venusLongitude: number;
  marsLongitude: number;
  saturnLongitude: number;
  gandanta: boolean;
  panchakaScore: number;
  context: PurusharthaPersonalContextLoaded | null;
}): PurusharthaWeightedResult {
  const base = 50;
  const { limbs, context } = input;

  let taraDelta = 0;
  let taraNum: number | null = null;
  let taraFault = false;
  let taraNaidhana = false;

  if (context) {
    taraNum = taraNumberFromNakshatras(
      context.janmaNakshatraIndex0to26,
      limbs.nakshatra.index0to26
    );
    taraDelta = taraScoreDelta(taraNum);
    taraFault = taraNum === 3 || taraNum === 5 || taraNum === 7;
    taraNaidhana = taraNum === 7;
  }

  const moonSign = transitSignFromLongitude(input.transitMoonLongitude);
  let savPoints: number | null = null;
  let savDelta = 0;
  if (context) {
    savPoints = context.rekhasBySign[moonSign] ?? 0;
    savDelta = savScoreDelta(savPoints);
  }

  const tv = tithiVaraScoreDelta(limbs.vaara.index0to6, limbs.tithi.indexInPaksha1to15);

  const drishtiDelta = drishtiScoreDelta(
    input.transitMoonLongitude,
    input.jupiterLongitude,
    input.venusLongitude,
    input.marsLongitude,
    input.saturnLongitude
  );

  const gandantaDelta = input.gandanta ? -25 : 0;

  let total =
    base +
    taraDelta +
    savDelta +
    tv.delta +
    drishtiDelta +
    gandantaDelta;
  total = Math.max(0, Math.min(100, Math.round(total)));

  let heatTier: PurusharthaHeatTier;
  if (input.gandanta) {
    heatTier = "volatile";
  } else if (total >= 70) {
    heatTier = "high";
  } else if (total >= 45) {
    heatTier = "medium";
  } else {
    heatTier = "low";
  }

  const greenEligible = !input.gandanta && total >= 70;

  let mantraRequired = false;
  let mantraWarning: string | null = null;
  let remedyHint: string | null = null;
  if (context) {
    const house = getHouseFromLagna(moonSign, context.natalLagnaSign);
    if (house === 6 || house === 8 || house === 12) {
      mantraRequired = true;
      mantraWarning = MANTRA_DUSTHANA;
      remedyHint = dusthanaRemedyHint(house);
    }
  }

  const savBand = savBandFromPoints(savPoints);

  return {
    score: total,
    heatTier,
    breakdown: {
      base,
      taraDelta,
      savDelta,
      tithiVaraDelta: tv.delta,
      drishtiDelta,
      gandantaDelta,
      total,
    },
    panchakaReferenceScore: input.panchakaScore,
    personalization: context ? "full" : "unavailable",
    savMoonSignPoints: savPoints,
    savBand,
    greenEligible,
    taraNumber: taraNum,
    taraFault,
    taraNaidhana,
    mantraRequired,
    mantraWarning,
    remedyHint,
    sadeSatiHeavy: false,
  };
}

/**
 * Shared natal context + Tara / transit helpers for Puruṣārtha personalization.
 */

import type { SignNumber } from "@/types";
import { wrapLongitude } from "@/lib/astro/muhurta/panchanga";

export interface PurusharthaPersonalContextLoaded {
  janmaNakshatraIndex0to26: number;
  natalLagnaSign: SignNumber;
  natalMoonSign: SignNumber;
  rekhasBySign: Record<SignNumber, number>;
}

const BAD_TARA = new Set([3, 5, 7]);

/** Steps from janma nakṣatra (0) to transit (0); Tara 1–9 = (steps % 9) + 1. */
export function taraNumberFromNakshatras(
  janmaIndex0to26: number,
  transitIndex0to26: number
): number {
  const steps = (transitIndex0to26 - janmaIndex0to26 + 27) % 27;
  return (steps % 9) + 1;
}

export function isBadTara(taraNumber: number): boolean {
  return BAD_TARA.has(taraNumber);
}

export function transitSignFromLongitude(longitudeSidereal: number): SignNumber {
  const lon = wrapLongitude(longitudeSidereal);
  const idx = Math.floor(lon / 30) % 12;
  return (idx + 1) as SignNumber;
}

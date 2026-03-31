/**
 * Candragrahaṇa-style junction (Gaṇḍānta): Moon in last 3°20′ of water signs
 * or first 3°20′ of fire signs — flagged as highly volatile for general Muhūrta.
 */

import type { SignNumber } from "@/types";
import { longitudeToSignAndDegreeInSign } from "@/lib/astro/muhurta/panchanga";

const GANDANTA_ARC = 3 + 20 / 60; // 3°20′

const WATER_SIGNS = new Set<SignNumber>([4, 8, 12]);
const FIRE_SIGNS = new Set<SignNumber>([1, 5, 9]);

export interface GandantaCheck {
  active: boolean;
  reason: string | null;
}

/**
 * Returns true when Moon occupies a water–fire rāśi junction zone (BPHS-style red flag).
 */
export function isMoonGandanta(moonLongitudeSidereal: number): GandantaCheck {
  const { sign, degreeInSign } = longitudeToSignAndDegreeInSign(moonLongitudeSidereal);

  if (WATER_SIGNS.has(sign) && degreeInSign >= 30 - GANDANTA_ARC) {
    return {
      active: true,
      reason: "Moon in the last 3°20′ of a water sign (Gaṇḍānta zone)",
    };
  }

  if (FIRE_SIGNS.has(sign) && degreeInSign < GANDANTA_ARC) {
    return {
      active: true,
      reason: "Moon in the first 3°20′ of a fire sign (Gaṇḍānta zone)",
    };
  }

  return { active: false, reason: null };
}

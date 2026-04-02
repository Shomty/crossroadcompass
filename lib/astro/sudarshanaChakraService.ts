/**
 * Sudarshana Chakra Calculator
 *
 * Creates three rotated views of the natal D1 chart:
 *   Lagna Chakra  (inner)  — houses rotated from Ascendant (house 1)
 *   Chandra Chakra (middle) — houses rotated from Moon's natal house
 *   Surya Chakra  (outer)  — houses rotated from Sun's natal house
 *
 * Algorithm ported from CosmicGateway/backend/src/utils/sudarshanaChakra.js
 * Adapted to openastrology-library's keyed PlanetaryPositions structure.
 */

import type { VedicChartCalculations, Planet, ZodiacSign } from "openastrology-library";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SudarshanPlanet {
  name: Planet;
  sign: ZodiacSign;
  degreeDMSFormatted: string;
  originalHouse: number;
  isRetrograde: boolean;
}

export interface SudarshanHouse {
  /** Position in the rotated view (1-12) */
  rotatedHouse: number;
  /** Original house number in the natal chart */
  originalHouse: number;
  sign: ZodiacSign;
  planets: SudarshanPlanet[];
}

export interface SudarshanLayer {
  name: "lagna" | "chandra" | "surya";
  label: string;
  referenceHouse: number;
  referenceSign: ZodiacSign;
  houses: SudarshanHouse[];
}

export interface SudarshanChakraResult {
  lagnaChakra: SudarshanLayer;
  chandraChakra: SudarshanLayer;
  suryaChakra: SudarshanLayer;
  meta: {
    lagnaSign: ZodiacSign;
    moonSign: ZodiacSign;
    sunSign: ZodiacSign;
    moonHouse: number;
    sunHouse: number;
  };
}

// ---------------------------------------------------------------------------
// Zodiac helpers
// ---------------------------------------------------------------------------

const ZODIAC_ORDER: ZodiacSign[] = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

/**
 * Advance a zodiac sign by `n` houses (0-indexed offset), wrapping at 12.
 */
function advanceSign(startSign: ZodiacSign, offset: number): ZodiacSign {
  const idx = ZODIAC_ORDER.indexOf(startSign);
  return ZODIAC_ORDER[((idx + offset) % 12 + 12) % 12];
}

// ---------------------------------------------------------------------------
// Core rotation
// ---------------------------------------------------------------------------

/**
 * Rotate houses so `referenceHouse` becomes house 1.
 * Formula: ((original - reference) % 12 + 12) % 12 + 1
 */
function rotateHouseNumber(originalHouse: number, referenceHouse: number): number {
  return ((originalHouse - referenceHouse) % 12 + 12) % 12 + 1;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function computeSudarshanChakra(
  chart: VedicChartCalculations
): SudarshanChakraResult {
  const { planets, ascendant, houses } = chart;

  const lagnaSign = ascendant.sign;
  const moonHouse = planets.moon.house as number;
  const sunHouse = planets.sun.house as number;
  const moonSign = planets.moon.sign;
  const sunSign = planets.sun.sign;

  const ALL_PLANETS: Planet[] = [
    "sun", "moon", "mars", "mercury", "jupiter",
    "venus", "saturn", "rahu", "ketu",
  ];

  function buildLayer(
    name: SudarshanLayer["name"],
    label: string,
    referenceHouse: number,
    referenceSign: ZodiacSign
  ): SudarshanLayer {
    // Build empty rotated houses
    const rotatedHouses: SudarshanHouse[] = Array.from({ length: 12 }, (_, i) => {
      const rotated = i + 1;
      // The original house that maps to this rotated position
      const original = ((rotated - 1 + referenceHouse - 1) % 12) + 1;
      // Derive sign: reference sign is house 1 in this view, advance from there
      const sign = advanceSign(referenceSign, i);
      return {
        rotatedHouse: rotated,
        originalHouse: original,
        sign,
        planets: [],
      };
    });

    // Place each planet in its rotated position
    for (const planetName of ALL_PLANETS) {
      const pos = planets[planetName];
      if (!pos) continue;

      const originalHouse = pos.house as number;
      const rotated = rotateHouseNumber(originalHouse, referenceHouse);
      const houseEntry = rotatedHouses[rotated - 1];

      houseEntry.planets.push({
        name: planetName,
        sign: pos.sign,
        degreeDMSFormatted: pos.degreeDMSFormatted,
        originalHouse,
        isRetrograde: pos.isRetrograde,
      });
    }

    return { name, label, referenceHouse, referenceSign, houses: rotatedHouses };
  }

  return {
    lagnaChakra: buildLayer("lagna", "Lagna Chakra", 1, lagnaSign),
    chandraChakra: buildLayer("chandra", "Chandra Chakra", moonHouse, moonSign),
    suryaChakra: buildLayer("surya", "Surya Chakra", sunHouse, sunSign),
    meta: { lagnaSign, moonSign, sunSign, moonHouse, sunHouse },
  };
}

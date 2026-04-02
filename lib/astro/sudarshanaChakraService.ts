/**
 * Sudarshana Chakra Calculator
 *
 * Creates three rotated views of the natal D1 chart:
 *   Lagna Chakra  (inner)  — houses rotated from Ascendant (house 1)
 *   Chandra Chakra (middle) — houses rotated from Moon's natal house
 *   Surya Chakra  (outer)  — houses rotated from Sun's natal house
 *
 * Also exports extractPlanetPositions() for the planet positions table.
 *
 * Algorithm ported from CosmicGateway/backend/src/utils/sudarshanaChakra.js
 * Adapted to openastrology-library's keyed PlanetaryPositions structure.
 */

import type { VedicChartCalculations, Planet, ZodiacSign, Nakshatra } from "openastrology-library";

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


// ---------------------------------------------------------------------------
// Lookup tables
// ---------------------------------------------------------------------------

export const RASI_NAMES: Record<ZodiacSign, string> = {
  aries: "Mesha", taurus: "Vrishabha", gemini: "Mithuna", cancer: "Karka",
  leo: "Simha", virgo: "Kanya", libra: "Tula", scorpio: "Vrischika",
  sagittarius: "Dhanu", capricorn: "Makara", aquarius: "Kumbha", pisces: "Meena",
};

export const RASI_LORDS: Record<ZodiacSign, string> = {
  aries: "Mars", taurus: "Venus", gemini: "Mercury", cancer: "Moon",
  leo: "Sun", virgo: "Mercury", libra: "Venus", scorpio: "Mars",
  sagittarius: "Jupiter", capricorn: "Saturn", aquarius: "Saturn", pisces: "Jupiter",
};

export const NAKSHATRA_LORDS: Record<Nakshatra, string> = {
  ashwini: "Ketu", bharani: "Venus", krittika: "Sun", rohini: "Moon",
  mrigashira: "Mars", ardra: "Rahu", punarvasu: "Jupiter", pushya: "Saturn",
  ashlesha: "Mercury", magha: "Ketu", purva_phalguni: "Venus", uttara_phalguni: "Sun",
  hasta: "Moon", chitra: "Mars", swati: "Rahu", vishakha: "Jupiter",
  anuradha: "Saturn", jyeshtha: "Mercury", moola: "Ketu", purva_ashadha: "Venus",
  uttara_ashadha: "Sun", shravana: "Moon", dhanishta: "Mars", shatabhisha: "Rahu",
  purva_bhadrapada: "Jupiter", uttara_bhadrapada: "Saturn", revati: "Mercury",
};

const NAKSHATRA_DISPLAY: Record<Nakshatra, string> = {
  ashwini: "Ashwini", bharani: "Bharani", krittika: "Krittika", rohini: "Rohini",
  mrigashira: "Mrigashira", ardra: "Ardra", punarvasu: "Punarvasu", pushya: "Pushya",
  ashlesha: "Ashlesha", magha: "Magha", purva_phalguni: "Purva Phalguni",
  uttara_phalguni: "Uttara Phalguni", hasta: "Hasta", chitra: "Chitra",
  swati: "Swati", vishakha: "Vishakha", anuradha: "Anuradha", jyeshtha: "Jyeshtha",
  moola: "Moola", purva_ashadha: "Purva Ashadha", uttara_ashadha: "Uttara Ashadha",
  shravana: "Shravana", dhanishta: "Dhanishta", shatabhisha: "Shatabhisha",
  purva_bhadrapada: "Purva Bhadrapada", uttara_bhadrapada: "Uttara Bhadrapada",
  revati: "Revati",
};

function fmtLongitude(lon: number): string {
  const deg = Math.floor(lon);
  const min = Math.round((lon - deg) * 60);
  return `${deg}\u00b0 ${String(min).padStart(2, "0")}'`;
}

// ---------------------------------------------------------------------------
// Planet Positions extraction
// ---------------------------------------------------------------------------

export interface PlanetPositionRow {
  key: string;
  label: string;
  absoluteLongitude: string;
  signDegree: string;
  rasi: string;
  rasiLord: string;
  nakshatra: string;
  nakshatraLord: string;
}

const PLANET_ORDER: Planet[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "rahu", "ketu",
];

const PLANET_LABEL: Record<Planet, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury",
  jupiter: "Jupiter", venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu",
};

export function extractPlanetPositions(chart: VedicChartCalculations): PlanetPositionRow[] {
  const rows: PlanetPositionRow[] = [];
  for (const planetKey of PLANET_ORDER) {
    const pos = chart.planets[planetKey];
    if (!pos) continue;
    rows.push({
      key: planetKey,
      label: PLANET_LABEL[planetKey],
      absoluteLongitude: fmtLongitude(pos.longitude),
      signDegree: pos.degreeDMSFormatted,
      rasi: RASI_NAMES[pos.sign],
      rasiLord: RASI_LORDS[pos.sign],
      nakshatra: NAKSHATRA_DISPLAY[pos.nakshatra] ?? pos.nakshatra,
      nakshatraLord: NAKSHATRA_LORDS[pos.nakshatra] ?? "\u2014",
    });
  }
  const asc = chart.ascendant;
  rows.push({
    key: "ascendant",
    label: "Ascendant",
    absoluteLongitude: fmtLongitude(asc.longitude),
    signDegree: asc.degreeDMSFormatted,
    rasi: RASI_NAMES[asc.sign],
    rasiLord: RASI_LORDS[asc.sign],
    nakshatra: NAKSHATRA_DISPLAY[asc.nakshatra] ?? asc.nakshatra,
    nakshatraLord: NAKSHATRA_LORDS[asc.nakshatra] ?? "\u2014",
  });
  return rows;
}

// ---------------------------------------------------------------------------
// House Positions extraction
// ---------------------------------------------------------------------------

export interface HousePositionRow {
  key: string;
  label: string;
  fromLagna: number;
  fromMoon: number;
  fromSun: number;
}

export function extractHousePositions(result: SudarshanChakraResult): HousePositionRow[] {
  function findHouse(layer: SudarshanLayer, targetKey: string): number {
    if (targetKey === "ascendant") return rotateHouseNumber(1, layer.referenceHouse);
    for (const h of layer.houses) {
      if (h.planets.some((p) => p.name === targetKey)) return h.rotatedHouse;
    }
    return 0;
  }
  const keys = ["sun","moon","mercury","venus","mars","jupiter","saturn","ascendant","rahu","ketu"];
  const labels: Record<string, string> = {
    sun: "Sun (Su)", moon: "Moon (Mo)", mercury: "Mercury (Me)",
    venus: "Venus (Ve)", mars: "Mars (Ma)", jupiter: "Jupiter (Ju)",
    saturn: "Saturn (Sa)", rahu: "Rahu (Ra)", ketu: "Ketu (Ke)",
    ascendant: "Ascendant (Asc)",
  };
  return keys.map((key) => ({
    key,
    label: labels[key],
    fromLagna: findHouse(result.lagnaChakra, key),
    fromMoon: findHouse(result.chandraChakra, key),
    fromSun: findHouse(result.suryaChakra, key),
  }));
}

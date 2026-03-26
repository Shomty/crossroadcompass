/**
 * Golden reference from Jagannatha Hora export: instructions/Milos - Hora.pdf
 * Birth: 1985-03-18 16:09:13 +1 East, Zemun 20°23′E 44°50′N
 * Cross-check with shomty@hotmail.com profile only if DB birth data matches.
 */

import type { VedicPlanet } from "@/lib/astro/types";
import type { PlanetName, PlanetPosition, SignNumber } from "@/types";

const ZODIAC = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

/** Minimal VedicPlanet for extractSpecialPointsInputs path 2 (mapVedicPlanet). */
export function absoluteLongitudeToVedicPlanet(name: string, lonAbs: number): VedicPlanet {
  const norm = ((lonAbs % 360) + 360) % 360;
  const idx = Math.floor(norm / 30);
  const inSign = norm % 30;
  const deg = Math.floor(inSign);
  const min = Math.floor((inSign - deg) * 60);
  const sec = Math.round((((inSign - deg) * 60 - min) * 60));
  return {
    name: name.toLowerCase(),
    longitude: lonAbs,
    latitude: 0,
    speed: 0,
    house: 1,
    sign: ZODIAC[idx]!,
    nakshatra: "aswini",
    pada: 1,
    degree: inSign,
    degreeDMSFormatted: `${deg}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`,
    isRetrograde: false,
    dignity: "Neutral",
    nakshatraPada: 1,
    aspects: [],
  };
}

/** UTC birth time (local 16:09:13, offset +1 → 15:09:13 UTC) */
export const MILOS_BIRTH_UTC = {
  year: 1985,
  month: 3,
  day: 18,
  hourUTC: 15,
  minuteUTC: 9,
} as const;

export const MILOS_LAT_DEG = 44 + 50 / 60;
export const MILOS_LON_DEG = 20 + 23 / 60;

/** Convert sign (1–12) + degree within sign (decimal) to absolute longitude 0–360 */
export function signDegreeToAbsoluteLongitude(sign: number, degreeInSign: number): number {
  return ((sign - 1) * 30 + degreeInSign + 360) % 360;
}

/** Parse JH-style string degree in sign: whole degrees + minutes + seconds (decimal ok) */
export function dmsInSignToDecimal(deg: number, min: number, sec: number): number {
  return deg + min / 60 + sec / 3600;
}

/**
 * Jagannatha Hora PDF reference longitudes (sidereal), degrees 0–360.
 * Derived from lines 9–27 of Milos - Hora.pdf
 */
export const MILOS_JH_ABSOLUTE_LONGITUDE = {
  /** Hora Lagna 13 Cap 13′18.43″ */
  horaLagna: signDegreeToAbsoluteLongitude(10, dmsInSignToDecimal(13, 13, 18.43)),
  /** Ghati Lagna 27 Ari 12′24.10″ */
  ghatiLagna: signDegreeToAbsoluteLongitude(1, dmsInSignToDecimal(27, 12, 24.1)),
  /** Bhava Lagna 8 Leo 33′36.54″ */
  bhavaLagna: signDegreeToAbsoluteLongitude(5, dmsInSignToDecimal(8, 33, 36.54)),
  /** Sun 4 Pis 19′33.24″ */
  sun: signDegreeToAbsoluteLongitude(12, dmsInSignToDecimal(4, 19, 33.24)),
  /** Moon 2 Aqu 24′56.13″ */
  moon: signDegreeToAbsoluteLongitude(11, dmsInSignToDecimal(2, 24, 56.13)),
  /** Rahu 27° Ar 26′36.19″ */
  rahu: signDegreeToAbsoluteLongitude(1, dmsInSignToDecimal(27, 26, 36.19)),
  mars: signDegreeToAbsoluteLongitude(1, dmsInSignToDecimal(8, 50, 36.98)),
  mercury: signDegreeToAbsoluteLongitude(12, dmsInSignToDecimal(22, 30, 53.19)),
  jupiter: signDegreeToAbsoluteLongitude(10, dmsInSignToDecimal(14, 53, 15.53)),
  venus: signDegreeToAbsoluteLongitude(12, dmsInSignToDecimal(28, 9, 47.22)),
  saturn: signDegreeToAbsoluteLongitude(8, dmsInSignToDecimal(4, 22, 28.2)),
} as const;

export const MILOS_NOTES = {
  source: "instructions/Milos - Hora.pdf (Jagannatha Hora export)",
  emailNote: "PDF is labeled Milos; confirm shomty@hotmail.com uses identical birth data before parity claims.",
} as const;

/** Build PlanetPosition[] from PDF absolute longitudes (same convention as mapVedicPlanet: integer degree in sign + arc min/sec). */
export function milosPdfPlanetPositions(): PlanetPosition[] {
  const absLonToPosition = (planet: PlanetName, lonAbs: number): PlanetPosition => {
    const norm = ((lonAbs % 360) + 360) % 360;
    const signNumber = (Math.floor(norm / 30) + 1) as SignNumber;
    const inSign = norm % 30;
    const degreeInSign = Math.floor(inSign);
    const remMin = (inSign - degreeInSign) * 60;
    const arcMinutes = Math.floor(remMin);
    const arcSeconds = Math.round((remMin - arcMinutes) * 60);
    return { planet, signNumber, degreeInSign, arcMinutes, arcSeconds };
  };

  const p = MILOS_JH_ABSOLUTE_LONGITUDE;
  return [
    absLonToPosition("Sun", p.sun),
    absLonToPosition("Moon", p.moon),
    absLonToPosition("Mars", p.mars),
    absLonToPosition("Mercury", p.mercury),
    absLonToPosition("Jupiter", p.jupiter),
    absLonToPosition("Venus", p.venus),
    absLonToPosition("Saturn", p.saturn),
    absLonToPosition("Rahu", p.rahu),
  ];
}

/** Lagna 16 Leo 26′28.41″ from PDF line 10 */
const MILOS_LAGNA_LON = signDegreeToAbsoluteLongitude(5, dmsInSignToDecimal(16, 26, 28.41));

/**
 * Minimal `vedicChartRaw` for `extractSpecialPointsInputs` path 2 (rawResponse.chartD1).
 * Does not satisfy full VedicBirthChartResponse typing; cast at call site.
 */
export function milosMockVedicChartRaw(): unknown {
  const p = MILOS_JH_ABSOLUTE_LONGITUDE;
  const planets: VedicPlanet[] = [
    absoluteLongitudeToVedicPlanet("sun", p.sun),
    absoluteLongitudeToVedicPlanet("moon", p.moon),
    absoluteLongitudeToVedicPlanet("mars", p.mars),
    absoluteLongitudeToVedicPlanet("mercury", p.mercury),
    absoluteLongitudeToVedicPlanet("jupiter", p.jupiter),
    absoluteLongitudeToVedicPlanet("venus", p.venus),
    absoluteLongitudeToVedicPlanet("saturn", p.saturn),
    absoluteLongitudeToVedicPlanet("rahu", p.rahu),
    absoluteLongitudeToVedicPlanet("ketu", signDegreeToAbsoluteLongitude(7, dmsInSignToDecimal(27, 26, 36.19))),
  ];
  const asc = absoluteLongitudeToVedicPlanet("asc", MILOS_LAGNA_LON);
  return {
    rawResponse: {
      chartD1: {
        ascendant: {
          sign: asc.sign,
          degree: asc.degree,
          degreeDMSFormatted: asc.degreeDMSFormatted,
          nakshatra: "purva_phalguni",
          nakshatraPada: 1,
        },
        planets,
        houses: [],
        yogas: [],
        dashas: {
          vimshottari: { type: "vimshottari" as const, dashaPeriods: [] },
        },
        ayanamsa: 0,
      },
    },
  };
}

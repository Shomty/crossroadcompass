/**
 * Panchāṅga limbs from sidereal Sun/Moon longitudes (Lahiri via upstream chart).
 * Tithi / Nakṣatra formulas align with BPHS-style elongation rules.
 */

import type { SignNumber } from "@/types";

const DEG_PER_NAKSHATRA = 360 / 27;
const DEG_PER_TITHI = 12;
const DEG_PER_YOGA = 13 + 1 / 3;
const DEG_PER_KARANA = 6;

const TITHI_NAMES = [
  "Pratipadā",
  "Dvitīyā",
  "Tṛtīyā",
  "Caturthī",
  "Pañcamī",
  "Ṣaṣṭhī",
  "Saptamī",
  "Aṣṭamī",
  "Navamī",
  "Daśamī",
  "Ekādaśī",
  "Dvādaśī",
  "Trayodaśī",
  "Caturdaśī",
  "Amāvāsya/Paurṇimā",
] as const;

const NAKSHATRA_NAMES = [
  "Aśvinī",
  "Bharanī",
  "Kṛttikā",
  "Rohiṇī",
  "Mṛgaśīrṣa",
  "Ārdrā",
  "Punarvasu",
  "Puṣya",
  "Āśleṣā",
  "Maghā",
  "Pūrva Phālgunī",
  "Uttara Phālgunī",
  "Hastā",
  "Citrā",
  "Svātī",
  "Viśākhā",
  "Anurādhā",
  "Jyeṣṭhā",
  "Mūla",
  "Pūrva Aṣāḍhā",
  "Uttara Aṣāḍhā",
  "Śravaṇa",
  "Dhaniṣṭhā",
  "Śatabhiṣā",
  "Pūrva Bhādrapadā",
  "Uttara Bhādrapadā",
  "Revatī",
] as const;

/** 27 yogas from Sun + Moon sum (simplified siddhānta limb). */
const YOGA_NAMES = [
  "Viṣkambha",
  "Prīti",
  "Āyuṣmān",
  "Saubhāgya",
  "Śobhana",
  "Atigaṇḍa",
  "Sukarma",
  "Dhṛti",
  "Śūla",
  "Gaṇḍa",
  "Vṛddhi",
  "Dhruva",
  "Vyāghāta",
  "Harṣaṇa",
  "Vajra",
  "Siddhi",
  "Vyatīpāta",
  "Varīyān",
  "Parigha",
  "Śiva",
  "Siddha",
  "Sādhya",
  "Śubha",
  "Śukla",
  "Brahma",
  "Indra",
  "Vaidhṛti",
] as const;

/** Eleven karanas; sequence position from elongation / 6° (limb for scoring / display). */
const KARANA_NAMES = [
  "Bava",
  "Bālava",
  "Kaulava",
  "Taitila",
  "Gara",
  "Vaṇij",
  "Viṣṭi (Bhadra)",
  "Śakuni",
  "Catuṣpada",
  "Nāga",
  "Kiṃstughna",
] as const;

const VAARA_NAMES = [
  "Ravivāra",
  "Somavāara",
  "Maṅgalavāara",
  "Budhavāara",
  "Guruvāara",
  "Śukravāara",
  "Śanivāara",
] as const;

export function wrapLongitude(deg: number): number {
  let x = deg % 360;
  if (x < 0) x += 360;
  return x;
}

export interface TithiResult {
  index1to30: number;
  paksha: "śukla" | "kṛṣṇa";
  indexInPaksha1to15: number;
  sanskritName: string;
  elongationDeg: number;
}

/**
 * Tithi from lunar elongation: (Moon − Sun) / 12°, 1–30.
 */
export function getTithi(sunLongitudeSidereal: number, moonLongitudeSidereal: number): TithiResult {
  let diff = moonLongitudeSidereal - sunLongitudeSidereal;
  if (diff < 0) diff += 360;

  const idx0 = Math.floor(diff / DEG_PER_TITHI);
  const index1to30 = Math.min(30, Math.max(1, idx0 + 1));
  const paksha: "śukla" | "kṛṣṇa" = diff < 180 ? "śukla" : "kṛṣṇa";
  const indexInPaksha1to15 =
    paksha === "śukla" ? Math.min(15, idx0 + 1) : Math.min(15, Math.max(1, idx0 - 14));

  const nameIdx = (indexInPaksha1to15 - 1) % 15;
  const sanskritName = TITHI_NAMES[nameIdx] ?? TITHI_NAMES[0];

  return {
    index1to30,
    paksha,
    indexInPaksha1to15,
    sanskritName,
    elongationDeg: diff,
  };
}

export interface NakshatraResult {
  index0to26: number;
  sanskritName: string;
  pada1to4: number;
}

/**
 * Nakṣatra: Moon longitude / 13°20′; pada from quarter of nakṣatra arc.
 */
export function getNakshatra(moonLongitudeSidereal: number): NakshatraResult {
  const lon = wrapLongitude(moonLongitudeSidereal);
  const idx = Math.floor(lon / DEG_PER_NAKSHATRA) % 27;
  const posInNak = lon - idx * DEG_PER_NAKSHATRA;
  const pada1to4 = Math.min(4, Math.floor(posInNak / (DEG_PER_NAKSHATRA / 4)) + 1);
  return {
    index0to26: idx,
    sanskritName: NAKSHATRA_NAMES[idx] ?? NAKSHATRA_NAMES[0],
    pada1to4,
  };
}

export interface YogaResult {
  index1to27: number;
  sanskritName: string;
}

/** Yoga limb: (Sun + Moon) mod 360, each span 13°20′. */
export function getYoga(sunLongitudeSidereal: number, moonLongitudeSidereal: number): YogaResult {
  const sum = wrapLongitude(sunLongitudeSidereal + moonLongitudeSidereal);
  const idx0 = Math.floor(sum / DEG_PER_YOGA) % 27;
  return {
    index1to27: idx0 + 1,
    sanskritName: YOGA_NAMES[idx0] ?? YOGA_NAMES[0],
  };
}

export interface KaranaResult {
  segmentIndex0to59: number;
  name: string;
  /** True when this segment maps to Viṣṭi/Bhadra in the 11-karaṇa cycle (simplified). */
  isVishti: boolean;
}

/**
 * Karaṇa limb: each 6° of elongation; names cycle through 11 types (display / scoring aid).
 */
export function getKarana(sunLongitudeSidereal: number, moonLongitudeSidereal: number): KaranaResult {
  let diff = moonLongitudeSidereal - sunLongitudeSidereal;
  if (diff < 0) diff += 360;
  const segmentIndex0to59 = Math.min(59, Math.floor(diff / DEG_PER_KARANA));
  const nameIdx = segmentIndex0to59 % 11;
  const name = KARANA_NAMES[nameIdx] ?? KARANA_NAMES[0];
  return {
    segmentIndex0to59,
    name,
    isVishti: nameIdx === 6,
  };
}

/** Weekday from local calendar date (caller supplies correct local Y-M-D). */
export function getVaaraFromWeekdayIndex0Sun0to6(weekdayIndex0Sun: number): {
  index0to6: number;
  sanskritName: string;
} {
  const w = ((weekdayIndex0Sun % 7) + 7) % 7;
  return { index0to6: w, sanskritName: VAARA_NAMES[w] ?? VAARA_NAMES[0] };
}

export interface PanchangaLimbs {
  tithi: TithiResult;
  nakshatra: NakshatraResult;
  yoga: YogaResult;
  karana: KaranaResult;
  vaara: { index0to6: number; sanskritName: string };
}

export function computePanchanga(
  sunLongitudeSidereal: number,
  moonLongitudeSidereal: number,
  weekdayIndex0Sun: number
): PanchangaLimbs {
  return {
    tithi: getTithi(sunLongitudeSidereal, moonLongitudeSidereal),
    nakshatra: getNakshatra(moonLongitudeSidereal),
    yoga: getYoga(sunLongitudeSidereal, moonLongitudeSidereal),
    karana: getKarana(sunLongitudeSidereal, moonLongitudeSidereal),
    vaara: getVaaraFromWeekdayIndex0Sun0to6(weekdayIndex0Sun),
  };
}

/** Sign 1–12 and degree within sign (0 ≤ deg < 30) from sidereal longitude. */
export function longitudeToSignAndDegreeInSign(lon: number): { sign: SignNumber; degreeInSign: number } {
  const L = wrapLongitude(lon);
  const sign = (Math.floor(L / 30) + 1) as SignNumber;
  const degreeInSign = L % 30;
  return { sign, degreeInSign };
}

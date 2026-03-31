/**
 * lib/astro/dailyMoonJudgment.ts
 * Deterministic “today’s Moon” copy from natal Chandra Rasi vs transit Moon + lunar phase.
 */

import type { VedicChartCalculations } from "openastrology-library";
import type { SignNumber } from "@/types";
import { countSignsBetween } from "@/lib/astro/specialPoints";

const SIGN_TO_NUMBER: Record<string, SignNumber> = {
  aries: 1,
  taurus: 2,
  gemini: 3,
  cancer: 4,
  leo: 5,
  virgo: 6,
  libra: 7,
  scorpio: 8,
  sagittarius: 9,
  capricorn: 10,
  aquarius: 11,
  pisces: 12,
};

const NAKSHATRA_ORDER = [
  "ashwini",
  "bharani",
  "krittika",
  "rohini",
  "mrigashira",
  "ardra",
  "punarvasu",
  "pushya",
  "ashlesha",
  "magha",
  "purva_phalguni",
  "uttara_phalguni",
  "hasta",
  "chitra",
  "swati",
  "vishakha",
  "anuradha",
  "jyeshtha",
  "moola",
  "purva_ashadha",
  "uttara_ashadha",
  "shravana",
  "dhanishta",
  "shatabhisha",
  "purva_bhadrapada",
  "uttara_bhadrapada",
  "revati",
] as const;

export type LunarPhaseEnergy = "new" | "waxing" | "full" | "waning";

export interface DailyMoonJudgment {
  headline: string;
  body: string;
  houseFromMoon: number;
  phaseEnergy: LunarPhaseEnergy;
  transitNakshatra: string;
}

function normalizeNakshatraKey(raw: string | undefined): string {
  return (raw ?? "").toLowerCase().replace(/\s+/g, "_").trim();
}

function nakshatraIndex(name: string | undefined): number {
  const k = normalizeNakshatraKey(name);
  const i = NAKSHATRA_ORDER.indexOf(k as (typeof NAKSHATRA_ORDER)[number]);
  return i;
}

/** True if same nakshatra or adjacent on the 27-fold wheel (wraps). */
function nakshatraTouchesNatal(natal: string | undefined, transit: string | undefined): "same" | "adjacent" | null {
  const a = nakshatraIndex(natal);
  const b = nakshatraIndex(transit);
  if (a < 0 || b < 0) return null;
  if (a === b) return "same";
  const diff = Math.min((b - a + 27) % 27, (a - b + 27) % 27);
  if (diff === 1) return "adjacent";
  return null;
}

function signNumberFromPlanet(
  p: { sign?: string; longitude?: number } | undefined
): SignNumber | null {
  if (!p) return null;
  const fromSign = SIGN_TO_NUMBER[(p.sign ?? "").toLowerCase()];
  if (fromSign) return fromSign;
  if (typeof p.longitude === "number" && Number.isFinite(p.longitude)) {
    const x = ((p.longitude % 360) + 360) % 360;
    const n = Math.floor(x / 30) + 1;
    if (n >= 1 && n <= 12) return n as SignNumber;
  }
  return null;
}

function phaseAngleDeg(moonLon: number, sunLon: number): number {
  return (moonLon - sunLon + 360) % 360;
}

export function lunarPhaseEnergyFromAngle(angleDeg: number): LunarPhaseEnergy {
  if (angleDeg < 22.5 || angleDeg >= 337.5) return "new";
  if (angleDeg >= 157.5 && angleDeg <= 202.5) return "full";
  if (angleDeg > 22.5 && angleDeg < 157.5) return "waxing";
  return "waning";
}

function ordinalHouse(n: number): string {
  const suf =
    n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  return `${n}${suf}`;
}

const HOUSE_FROM_MOON: Record<number, string> = {
  1:
    "The Moon crosses your own emotional terrain—mood and self-image colour the day more than usual. Honour what you feel without dramatising it.",
  2:
    "Resources, voice, and close kin are in focus. Simple comforts and honest conversation steady the mind.",
  3:
    "Curiosity, short journeys, and sibling-style connections perk up. Say what you mean; listen for the reply.",
  4:
    "Home, rest, and inner safety matter. A slower pace or nesting time supports clarity.",
  5:
    "Creative spark, play, and what you genuinely enjoy ask for airtime. Light-hearted expression lifts the tone.",
  6:
    "Rhythms, habits, and small corrections to routine help. Tend the body and clear clutter—mental or physical.",
  7:
    "One-to-one rapport and fair exchange are highlighted. Meet others halfway; clarity beats assumption.",
  8:
    "Depth, shared stakes, and what lies beneath the surface feel nearer. Let change be gradual and consensual.",
  9:
    "Perspective, learning, and a wider view open up. A walk, book, or mentor-tone insight can reframe the mood.",
  10:
    "Visibility and responsibility nudge you outward. Show up steadily rather than forcing a spotlight.",
  11:
    "Friends, hopes, and modest wins gather. Community and future-minded plans get a friendly tailwind.",
  12:
    "Withdrawal, sleep, and subconscious processing are natural. Protect energy; not everything needs a response today.",
};

const PHASE_LINE: Record<LunarPhaseEnergy, string> = {
  new:
    "Lunar energy is inward and reset-oriented—favour intention over big launches.",
  waxing:
    "The Moon is building; momentum grows when you add consistent small steps.",
  full:
    "Illumination is high—patterns and feelings show themselves clearly; choose what to keep in the light.",
  waning:
    "A releasing tone suits integration and letting pressure ease without rushing the next cycle.",
};

const NAKSHATRA_TOUCH: Record<"same" | "adjacent", string> = {
  same:
    "Today’s lunar mansion echoes your natal Moon field—inner themes feel familiar and a little amplified.",
  adjacent:
    "The Moon sits beside your birth star today; gentle mood shifts are natural rather than alarming.",
};

function capSign(sign: string | undefined): string {
  if (!sign) return "";
  return sign.charAt(0).toUpperCase() + sign.slice(1);
}

function formatNakshatraLabel(raw: string | undefined): string {
  const k = normalizeNakshatraKey(raw);
  if (!k) return "";
  return k
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** One line for UI: "Cancer · Pushya P3" */
export function formatMoonContextLine(
  moon: { sign?: string; nakshatra?: string; nakshatraPada?: number; pada?: number } | undefined
): string | null {
  if (!moon?.sign) return null;
  const pada = moon.nakshatraPada ?? moon.pada;
  const nak = formatNakshatraLabel(moon.nakshatra);
  const padStr = pada != null && pada > 0 ? ` P${pada}` : "";
  return `${capSign(moon.sign)}${nak ? ` · ${nak}` : ""}${padStr}`;
}

/**
 * Build a short judgment from natal vs today’s transit (same “today” as transit chart).
 * Returns null if essential bodies are missing.
 */
export function buildDailyMoonJudgment(
  natal: VedicChartCalculations,
  transit: VedicChartCalculations
): DailyMoonJudgment | null {
  const nm = natal.planets?.moon;
  const tm = transit.planets?.moon;
  const ts = transit.planets?.sun;
  if (!nm || !tm || ts == null || typeof tm.longitude !== "number" || typeof ts.longitude !== "number") {
    return null;
  }

  const natalSn = signNumberFromPlanet(nm);
  const transitSn = signNumberFromPlanet(tm);
  if (natalSn == null || transitSn == null) return null;

  const houseFromMoon = countSignsBetween(natalSn, transitSn);
  const angle = phaseAngleDeg(tm.longitude, ts.longitude);
  const phaseEnergy = lunarPhaseEnergyFromAngle(angle);

  const houseLine =
    HOUSE_FROM_MOON[houseFromMoon] ??
    "The Moon’s position relative to your chart colours the emotional tone today.";
  const phaseLine = PHASE_LINE[phaseEnergy];

  const touch = nakshatraTouchesNatal(nm.nakshatra, tm.nakshatra);
  const extra = touch ? ` ${NAKSHATRA_TOUCH[touch]}` : "";

  const headline = `Moon in your ${ordinalHouse(houseFromMoon)} house from Chandra`;
  const body = `${houseLine} ${phaseLine}${extra}`.replace(/\s+/g, " ").trim();

  return {
    headline,
    body,
    houseFromMoon,
    phaseEnergy,
    transitNakshatra: formatNakshatraLabel(tm.nakshatra) || (tm.nakshatra ?? ""),
  };
}

/** YYYY-MM-DD in the given IANA timezone for `date` (default: now). Matches transit cache keys. */
export function formatLocalCalendarDateYmd(timeZone: string, date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

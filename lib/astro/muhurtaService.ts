// STATUS: done | Premium Features - Muhurta Finder
/**
 * lib/astro/muhurtaService.ts
 * Electional astrology - finding auspicious timing windows.
 * Calculates planetary hours, tithi, nakshatra for timing recommendations.
 */

import type { BirthProfile } from "@prisma/client";
import type { VedicChart, VedicPlanet } from "@/lib/astro/types";
import type { HDChartData } from "@/types";
import { getOrCreateVedicChart, getOrCreateHDChart } from "@/lib/astro/chartService";

// ─── Types ────────────────────────────────────────────────────────────────

export type IntentionCategory = 
  | "career"
  | "relationships"
  | "health"
  | "finance"
  | "travel"
  | "spiritual"
  | "general";

export interface TimingWindow {
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  quality: "excellent" | "good" | "moderate";
  planetaryHour: string;
  tithi: string;
  nakshatra: string;
  reasoning: string[];
  hdAlignment: string;
}

export interface MuhurtaData {
  windows: TimingWindow[];
  nextWeekWindows?: TimingWindow[];
  weekStart: string;
  weekEnd: string;
  nextWeekStart?: string;
  nextWeekEnd?: string;
  intention: IntentionCategory;
  hdType: string;
  hdAuthority: string;
  hdStrategy: string;
  moonSign: string | null;
  currentNakshatra: string | null;
}

// ─── Planetary Hour Rulers (Chaldean order) ───────────────────────────────

const PLANETARY_HOURS_ORDER = [
  "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"
];

const DAY_RULERS: Record<number, string> = {
  0: "Sun",      // Sunday
  1: "Moon",     // Monday
  2: "Mars",     // Tuesday
  3: "Mercury",  // Wednesday
  4: "Jupiter",  // Thursday
  5: "Venus",    // Friday
  6: "Saturn",   // Saturday
};

// ─── Tithi Names ──────────────────────────────────────────────────────────

const TITHIS = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
];

// ─── Nakshatra Names ──────────────────────────────────────────────────────

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Moola", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

// ─── Intention → Planet Mapping ───────────────────────────────────────────

const INTENTION_PLANETS: Record<IntentionCategory, string[]> = {
  career: ["Sun", "Jupiter", "Saturn", "Mars"],
  relationships: ["Venus", "Moon", "Jupiter"],
  health: ["Sun", "Mars", "Moon"],
  finance: ["Jupiter", "Venus", "Mercury"],
  travel: ["Mercury", "Moon", "Jupiter"],
  spiritual: ["Jupiter", "Ketu", "Moon", "Saturn"],
  general: ["Jupiter", "Venus", "Mercury", "Moon"],
};

// ─── HD Authority Timing Guidance ─────────────────────────────────────────

const HD_AUTHORITY_GUIDANCE: Record<string, string> = {
  "Emotional": "Wait for emotional clarity over time. The best timing comes after your emotional wave has settled—not at peaks or valleys.",
  "Sacral": "Trust your gut response in the moment. When a window arrives, your body will give you a clear 'uh-huh' or 'uhn-uhn'.",
  "Splenic": "Your intuition speaks in the moment. When a timing window feels right instantly, trust it—don't overthink.",
  "Ego Manifested": "You can initiate when you feel willpower and determination. Trust your sense of what you truly want to commit to.",
  "Ego Projected": "Wait for recognition and invitation. The best timing arrives when others acknowledge your value.",
  "Self-Projected": "Talk through the timing with trusted others. Your truth becomes clear in the process of expressing it.",
  "Mental": "Take time to discuss and consider with your sounding board. Clarity comes through dialogue, not internal processing.",
  "Lunar": "Wait through your full lunar cycle. Major decisions benefit from 28 days of reflection.",
};

// ─── Planetary Hour Quality for Intentions ────────────────────────────────

function getPlanetaryHourQuality(
  planetaryHour: string,
  intention: IntentionCategory
): "excellent" | "good" | "moderate" {
  const favorablePlanets = INTENTION_PLANETS[intention];
  
  if (favorablePlanets.slice(0, 2).includes(planetaryHour)) {
    return "excellent";
  } else if (favorablePlanets.includes(planetaryHour)) {
    return "good";
  }
  return "moderate";
}

// ─── Calculate Planetary Hour ─────────────────────────────────────────────

function getPlanetaryHour(date: Date, latitude: number): string {
  const dayOfWeek = date.getDay();
  const dayRuler = DAY_RULERS[dayOfWeek];
  const dayRulerIndex = PLANETARY_HOURS_ORDER.indexOf(dayRuler);
  
  const hour = date.getHours();
  const isDay = hour >= 6 && hour < 18;
  
  let hourIndex: number;
  if (isDay) {
    hourIndex = Math.floor((hour - 6) / 1);
  } else {
    hourIndex = Math.floor((hour >= 18 ? hour - 18 : hour + 6) / 1) + 12;
  }
  
  const planetIndex = (dayRulerIndex + hourIndex) % 7;
  return PLANETARY_HOURS_ORDER[planetIndex];
}

// ─── Calculate Approximate Tithi ──────────────────────────────────────────

function getTithi(date: Date): string {
  const lunarCycle = 29.53059;
  const knownNewMoon = new Date("2024-01-11T11:57:00Z").getTime();
  const diff = date.getTime() - knownNewMoon;
  const daysSinceNewMoon = diff / (1000 * 60 * 60 * 24);
  const phase = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;
  const tithiIndex = Math.floor(phase / 2) % 15;
  const paksha = phase < 15 ? "Shukla" : "Krishna";
  return `${paksha} ${TITHIS[tithiIndex]}`;
}

// ─── Calculate Approximate Nakshatra ──────────────────────────────────────

function getNakshatra(date: Date): string {
  const siderealMonth = 27.321661;
  const knownAshwiniStart = new Date("2024-01-01T00:00:00Z").getTime();
  const diff = date.getTime() - knownAshwiniStart;
  const daysSince = diff / (1000 * 60 * 60 * 24);
  const nakshatraIndex = Math.floor((daysSince % siderealMonth) / (siderealMonth / 27)) % 27;
  return NAKSHATRAS[nakshatraIndex];
}

// ─── Generate Timing Windows ──────────────────────────────────────────────

function generateWindowsForWeek(
  startDate: Date,
  intention: IntentionCategory,
  latitude: number,
  hdAuthority: string
): TimingWindow[] {
  const windows: TimingWindow[] = [];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (let d = 0; d < 7; d++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + d);

    const dateStr = currentDate.toISOString().split("T")[0];
    const dayOfWeek = dayNames[currentDate.getDay()];
    const dayRuler = DAY_RULERS[currentDate.getDay()];
    const tithi = getTithi(currentDate);
    const nakshatra = getNakshatra(currentDate);

    const favorablePlanets = INTENTION_PLANETS[intention];

    const timeSlots = [9, 10, 11, 14, 15, 16];

    for (const hour of timeSlots) {
      const slotDate = new Date(currentDate);
      slotDate.setHours(hour, 0, 0, 0);

      const planetaryHour = getPlanetaryHour(slotDate, latitude);
      const quality = getPlanetaryHourQuality(planetaryHour, intention);

      const reasoning: string[] = [];
      if (favorablePlanets.includes(planetaryHour)) {
        reasoning.push(`${planetaryHour} hour favors ${intention}`);
      }
      if (favorablePlanets.includes(dayRuler)) {
        reasoning.push(`${dayOfWeek} ruled by ${dayRuler}`);
      }
      reasoning.push(`Nakshatra: ${nakshatra}`);

      windows.push({
        date: dateStr,
        dayOfWeek,
        startTime: `${String(hour).padStart(2, "0")}:00`,
        endTime: `${String(hour + 1).padStart(2, "0")}:00`,
        quality,
        planetaryHour,
        tithi,
        nakshatra,
        reasoning,
        hdAlignment: HD_AUTHORITY_GUIDANCE[hdAuthority] || HD_AUTHORITY_GUIDANCE["Sacral"],
      });
    }
  }

  // Return sorted by date then time — all 42 slots for the week
  return windows.sort((a, b) =>
    a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────

/**
 * Calculate muhurta (auspicious timing) windows for the week.
 * Pass weeks=2 to also include next week's windows (VIP feature).
 */
export async function calculateMuhurta(
  userId: string,
  birthProfile: BirthProfile,
  intention: IntentionCategory = "general",
  weeks: 1 | 2 = 1
): Promise<MuhurtaData> {
  const [vedicChartRaw, hdChart] = await Promise.all([
    getOrCreateVedicChart(userId, birthProfile).catch(() => null),
    getOrCreateHDChart(userId, birthProfile),
  ]);
  
  const vedicChart = vedicChartRaw as unknown as VedicChart | null;
  const d1 = vedicChart?.rawResponse?.chartD1;
  
  const moonPlanet = d1?.planets?.find(p => p.name.toLowerCase() === "moon");
  const moonSign = moonPlanet?.sign ? capitalize(moonPlanet.sign) : null;
  const currentNakshatra = moonPlanet?.nakshatra?.replace(/_/g, " ") || null;
  
  const now = new Date();
  const weekStart = new Date(now);
  const dow = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  weekStart.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1)); // roll back to Monday
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const latitude = birthProfile.observationLatitude || birthProfile.latitude;
  const windows = generateWindowsForWeek(weekStart, intention, latitude, hdChart.authority);

  const result: MuhurtaData = {
    windows,
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: weekEnd.toISOString().split("T")[0],
    intention,
    hdType: hdChart.type,
    hdAuthority: hdChart.authority,
    hdStrategy: hdChart.strategy,
    moonSign,
    currentNakshatra,
  };

  if (weeks === 2) {
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(weekStart.getDate() + 7);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
    result.nextWeekWindows = generateWindowsForWeek(nextWeekStart, intention, latitude, hdChart.authority);
    result.nextWeekStart = nextWeekStart.toISOString().split("T")[0];
    result.nextWeekEnd = nextWeekEnd.toISOString().split("T")[0];
  }

  return result;
}

/**
 * Get basic muhurta data for FREE tier.
 */
export async function getBasicMuhurtaData(
  userId: string,
  birthProfile: BirthProfile
): Promise<{
  hdAuthority: string;
  hdStrategy: string;
  todayDayRuler: string;
  todayNakshatra: string;
}> {
  const hdChart = await getOrCreateHDChart(userId, birthProfile);
  
  const today = new Date();
  const todayDayRuler = DAY_RULERS[today.getDay()];
  const todayNakshatra = getNakshatra(today);

  return {
    hdAuthority: hdChart.authority,
    hdStrategy: hdChart.strategy,
    todayDayRuler,
    todayNakshatra,
  };
}

// ─── Utility ──────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

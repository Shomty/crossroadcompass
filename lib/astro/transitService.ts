// STATUS: done | Task 3.6 | Synthesis Engine Phase 1.2
/**
 * lib/astro/transitService.ts
 * Western and Vedic transit cache layer using KV (Upstash Redis).
 * One cache entry per user per calendar day — auto-expires after 24h.
 *
 * Western module: Tropical planets + aspects (all planets, not just slow).
 * Vedic module: Vedic API integration (stub for now).
 */

import type { BirthProfile } from "@prisma/client";
import { kvGet, kvSet } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import { getWesternCalculator } from "@/lib/astro/calculatorService";
import { prismaProfileToBirthInfo } from "@/lib/astro/birthInfoMapper";
import type {
  BirthInfo,
  WesternPlanetPosition,
  WesternAspect,
  WesternTransit,
  TransitTimeline,
  WesternPlanetName,
  WesternAspectType,
} from "@/types";

/**
 * Returns today's transit data for a user, using KV cache when available.
 * Cache key includes today's date in the user's timezone.
 * TTL: KV_TTL.TRANSIT_SECONDS (24h) — transits auto-expire.
 *
 * @param userId        - user identifier for the KV key
 * @param birthProfile  - used by the API call on cache miss (not yet implemented)
 */
export async function getTodayTransits(
  userId: string,
  birthProfile: BirthProfile
): Promise<unknown> { // type tightened once Vedic API response schema confirmed
  // Date key in user's timezone — format: YYYY-MM-DD
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: birthProfile.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const cacheKey = kvKeys.transit(userId, today);

  const cached = await kvGet<unknown>(cacheKey);
  if (cached !== null) return cached;

  // DECISION NEEDED: Vedic API transit endpoint + payload schema
  // Replace the error below with the actual API call once confirmed with Milosh
  // Example stub for when endpoint is confirmed:
  //   const data = await fetchDailyTransits({ ...birthInfo, date: today, timezone: birthProfile.timezone });
  //   await kvSet(cacheKey, data, KV_TTL.TRANSIT_SECONDS);
  //   return data;
  throw new Error(
    "Transit API endpoint not yet confirmed — see DECISION NEEDED in transitService.ts"
  );
}

// ─── Western Module (Tropical) ────────────────────────────────────────────

/**
 * Map planet name from openastrology output to our WesternPlanetName type.
 */
function mapPlanetName(name: string): WesternPlanetName {
  const normalized = name.toLowerCase();
  const planetMap: Record<string, WesternPlanetName> = {
    sun: 'sun',
    moon: 'moon',
    mercury: 'mercury',
    venus: 'venus',
    mars: 'mars',
    jupiter: 'jupiter',
    saturn: 'saturn',
    uranus: 'uranus',
    neptune: 'neptune',
    pluto: 'pluto',
  };
  return planetMap[normalized] || 'sun';
}

/**
 * Map aspect angle (0-180) to WesternAspectType.
 */
function mapAspectType(angle: number): WesternAspectType {
  const normalized = angle % 180;
  if (normalized < 30) return 'conjunction';
  if (normalized < 60) return 'sextile';
  if (normalized < 100) return 'square';
  if (normalized < 130) return 'trine';
  return 'opposition';
}

/**
 * Calculate Western transits for a given date.
 * Uses WesternAstrologyCalculator (Placidus, tropical).
 * Returns all planets (not just slow planets) with aspects.
 *
 * @param birthInfo    - User's birth data (UTC)
 * @param transitDate  - Target date for transits (YYYY-MM-DD)
 * @returns WesternTransit snapshot
 */
export async function getWesternTransitsForDate(
  birthInfo: BirthInfo,
  transitDate: string
): Promise<WesternTransit> {
  const calculator = getWesternCalculator();

  const transitChart = await calculator.calculateChart({
    dateOfBirth: transitDate,
    timeOfBirth: '12:00',
    latitude: birthInfo.latitude,
    longitude: birthInfo.longitude,
    timezone: (birthInfo as any).timezone ?? 'UTC',
  } as any);

  // Extract planet positions
  const planets: WesternPlanetPosition[] = [];
  const planetNames: WesternPlanetName[] = [
    'sun', 'moon', 'mercury', 'venus', 'mars',
    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
  ];

  const chartPlanets = (transitChart as any).planets || {};

  for (const pname of planetNames) {
    const oaPlanet = chartPlanets[pname];
    if (!oaPlanet) continue;

    const longitude = oaPlanet.longitude ?? 0;
    const sign = Math.floor(longitude / 30) + 1; // 0-11 → 1-12
    const signDegree = longitude % 30;
    const signIndex = sign - 1;
    const signNames = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                       'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    const signName = signNames[signIndex] || 'aries';

    planets.push({
      name: mapPlanetName(pname),
      longitude,
      latitude: oaPlanet.latitude ?? 0,
      house: oaPlanet.house ?? 1,
      sign: signName,
      signDegree,
      isRetrograde: oaPlanet.isRetrograde ?? false,
      speed: oaPlanet.speed ?? 0,
      dignity: oaPlanet.dignity ?? undefined,
    });
  }

  // Calculate aspects (6° orb)
  const aspects: WesternAspect[] = [];
  const orb = 6;
  const aspectAngles = [0, 60, 90, 120, 180];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const diff = Math.abs(p1.longitude - p2.longitude);
      const angle = diff > 180 ? 360 - diff : diff;

      for (const targetAngle of aspectAngles) {
        if (Math.abs(angle - targetAngle) <= orb) {
          const actualOrb = Math.abs(angle - targetAngle);
          const strength = Math.max(0, 100 - (actualOrb / orb) * 100); // 100 at exact, 0 at orb limit

          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            angle: targetAngle,
            angleName: mapAspectType(targetAngle),
            orb: actualOrb,
            isApplying: p1.speed > p2.speed, // Simplified: assuming p1 is faster
            strength,
          });
          break; // Only one aspect per pair
        }
      }
    }
  }

  return {
    date: transitDate,
    planets,
    aspects,
    slowPlanetEvents: undefined, // Calculated separately if needed
  };
}

/**
 * Get Western transits for a date range, using KV cache.
 * Aggregates daily calculations into a timeline.
 *
 * @param userId       - User ID (for KV cache key)
 * @param birthProfile - User's birth profile
 * @param startDate    - Start date (YYYY-MM-DD)
 * @param endDate      - End date (YYYY-MM-DD)
 * @returns TransitTimeline with 30-day forecast
 */
export async function getWesternTransitTimeline(
  userId: string,
  birthProfile: BirthProfile,
  startDate: string,
  endDate: string
): Promise<TransitTimeline> {
  const birthInfo = prismaProfileToBirthInfo(birthProfile);
  const transits: WesternTransit[] = [];

  // Parse dates
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];

    const transit = await getWesternTransitsForDate(birthInfo as any, dateStr);
    transits.push(transit);
    current.setDate(current.getDate() + 1);
  }

  return {
    startDate,
    endDate,
    transits,
    keyEvents: [], // Populated separately
  };
}

/**
 * Identify major life-stage transits (Saturn Return, Uranus opposition, etc.).
 * Returns dates when key transits occur.
 */
export function identifyLifeStageMilestones(
  birthDate: Date,
  currentDate: Date = new Date()
): Array<{ date: Date; type: string; description: string; strength: number }> {
  const ageYears = (currentDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const events: Array<{ date: Date; type: string; description: string; strength: number }> = [];

  // Saturn Return (~age 29.5, every 29.5 years)
  let saturnReturn = new Date(birthDate);
  saturnReturn.setFullYear(saturnReturn.getFullYear() + 29);
  saturnReturn.setMonth(saturnReturn.getMonth() + 6); // ~6 months offset
  if (saturnReturn > birthDate && saturnReturn.getTime() > currentDate.getTime() - 365.25 * 24 * 60 * 60 * 1000) {
    events.push({
      date: saturnReturn,
      type: 'saturn-return',
      description: 'Saturn Return - Major life restructuring (~age 29.5)',
      strength: 95,
    });
  }

  // Uranus Opposition (~age 42)
  let uranusOpp = new Date(birthDate);
  uranusOpp.setFullYear(uranusOpp.getFullYear() + 42);
  if (uranusOpp > birthDate && uranusOpp.getTime() > currentDate.getTime() - 365.25 * 24 * 60 * 60 * 1000) {
    events.push({
      date: uranusOpp,
      type: 'uranus-opposition',
      description: 'Uranus Opposition - Existential questioning (~age 42)',
      strength: 90,
    });
  }

  // Jupiter Return (~age 12, 24, 36, etc.)
  for (let i = 1; i <= 10; i++) {
    let jupiterReturn = new Date(birthDate);
    jupiterReturn.setFullYear(jupiterReturn.getFullYear() + i * 12);
    if (jupiterReturn > birthDate && jupiterReturn.getTime() > currentDate.getTime() - 365.25 * 24 * 60 * 60 * 1000) {
      events.push({
        date: jupiterReturn,
        type: 'jupiter-return',
        description: `Jupiter Return - Expansion & opportunity (age ${i * 12})`,
        strength: 70,
      });
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

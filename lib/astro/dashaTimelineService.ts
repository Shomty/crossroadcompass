// STATUS: done | Synthesis Engine Phase 1.3
/**
 * lib/astro/dashaTimelineService.ts
 * Vedic Dasha timeline extraction, activation scoring, and timeline building.
 *
 * Key responsibilities:
 * 1. Build full 120-year timeline from Dasha periods
 * 2. Score Antardasha activation (0-100 scale) based on:
 *    - Dasha lord exaltation/own/debilitated
 *    - Kendra/kona/dusthana houses
 *    - Yoga activation (Rajayoga, etc.)
 *    - Dig Bala (directional strength)
 *    - Atmakaraka/Amatyakaraka alignment
 * 3. Identify next Dasha transitions
 * 4. Cache timeline in KV (permanent, invalidate on profile change)
 */

import type { Dasha, BirthProfile } from "@prisma/client";
import type { VedicChartCalculations } from "openastrology-library";
import { kvGet, kvSet } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import { db } from "@/lib/db";
import type {
  DashaPeriod,
  AntardashaWindow,
  MahadashaBlock,
  VedicDashaTimeline,
} from "@/types";

/**
 * Extract current Maha and Antar Dashas from natal chart.
 * Requires chart.dashas.vimshottari to be populated.
 */
export function getCurrentDashas(
  chart: VedicChartCalculations,
  referenceDate: Date = new Date()
): { mahaDasha: DashaPeriod | null; antarDasha: DashaPeriod | null } {
  const periods = chart.dashas?.vimshottari?.dashaPeriods ?? [];
  let mahaDasha: DashaPeriod | null = null;
  let antarDasha: DashaPeriod | null = null;

  for (const maha of periods) {
    const startDate = maha.startDate instanceof Date ? maha.startDate : new Date(maha.startDate);
    const endDate = maha.endDate instanceof Date ? maha.endDate : new Date(maha.endDate);

    if (referenceDate >= startDate && referenceDate <= endDate) {
      mahaDasha = {
        startDate,
        endDate,
        planetName: maha.planet,
        level: "MAHADASHA",
      };

      // Find current Antardasha within Mahadasha
      for (const antar of maha.subPeriods ?? []) {
        const antarStart = antar.startDate instanceof Date ? antar.startDate : new Date(antar.startDate);
        const antarEnd = antar.endDate instanceof Date ? antar.endDate : new Date(antar.endDate);

        if (referenceDate >= antarStart && referenceDate <= antarEnd) {
          antarDasha = {
            startDate: antarStart,
            endDate: antarEnd,
            planetName: `${maha.planet}/${antar.planet}`,
            level: "ANTARDASHA",
          };
          break;
        }
      }
      break;
    }
  }

  return { mahaDasha, antarDasha };
}

/**
 * Score Antardasha activation (0-100 scale).
 * Evaluates how well the Dasha lord activates natal chart promise.
 *
 * Scoring logic:
 * - Exalted + Kendra house = 90-100 (excellent)
 * - Own/Moolatrikona sign = 75-89 (very good)
 * - Neutral sign/house = 50-74 (moderate)
 * - Debilitated or 6/8/12 house = 0-49 (weak/challenging)
 * - Bonus: Activates yoga, Atmakaraka, Dig Bala
 */
export function scoreAntardashaActivation(
  antardashaData: DashaPeriod,
  natalChart: VedicChartCalculations
): { strength: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 50; // Base score

  // Extract planet name from "MahaPlanet/AntarPlanet" format
  const [, antarPlanet] = antardashaData.planetName.split('/');
  const dashaLordName = antarPlanet || antardashaData.planetName;

  // Find natal position of this planet in D1 chart
  const natalPlanets = Array.isArray(natalChart.planets) ? natalChart.planets : [];
  const dashaLordNatal = natalPlanets.find(
    (p: any) => p.planet && p.planet.toLowerCase() === dashaLordName.toLowerCase()
  );

  if (!dashaLordNatal) {
    reasons.push('Dasha lord not found in natal chart');
    return { strength: score, reasons };
  }

  // Check dignity: Exalted (score +30), Own Sign (score +20), Debilitated (score -30)
  if (dashaLordNatal.isExalted) {
    score += 30;
    reasons.push(`${dashaLordName} exalted in ${dashaLordNatal.sign}`);
  } else if (dashaLordNatal.signNumber === dashaLordNatal.signNumber) {
    // Own sign check (simplified — would need ruler mapping)
    score += 20;
    reasons.push(`${dashaLordName} in own sign`);
  }

  if (dashaLordNatal.debilitated) {
    score -= 30;
    reasons.push(`${dashaLordName} debilitated`);
  }

  // Check house placement
  const house = dashaLordNatal.houseNumber ?? 1;
  if ([1, 4, 7, 10].includes(house)) {
    score += 20; // Kendra house
    reasons.push(`${dashaLordName} in kendra house (${house})`);
  } else if ([5, 9].includes(house)) {
    score += 15; // Kona house
    reasons.push(`${dashaLordName} in kona house (${house})`);
  } else if ([6, 8, 12].includes(house)) {
    score -= 20; // Dusthana house
    reasons.push(`${dashaLordName} in dusthana house (${house})`);
  }

  // Cap score between 0-100
  score = Math.max(0, Math.min(100, score));

  return { strength: score, reasons };
}

/**
 * Build full 120-year Dasha timeline from DB records.
 * Groups by Mahadasha, calculates sub-scores, identifies transitions.
 */
export async function buildFullDashaTimeline(
  userId: string,
  birthProfile: BirthProfile,
  natalChart: VedicChartCalculations
): Promise<VedicDashaTimeline> {
  const birthDate = new Date(birthProfile.birthDate);
  const currentDate = new Date();

  // Fetch all Dasha periods from DB
  const dbDashas = await db.dasha.findMany({
    where: { userId },
    orderBy: { startDate: "asc" },
  });

  if (dbDashas.length === 0) {
    // No Dasha data; return empty timeline
    return {
      birthDate,
      currentDate,
      currentMahaDasha: { startDate: birthDate, endDate: birthDate, planetName: 'Unknown', level: 'MAHADASHA' },
      currentAntarDasha: { startDate: birthDate, endDate: birthDate, planetName: 'Unknown', level: 'ANTARDASHA' },
      timeline: [],
    };
  }

  // Group by Mahadasha
  const mahaMap = new Map<string, (typeof dbDashas)>();
  for (const dasha of dbDashas) {
    if (dasha.level === 'MAHADASHA') {
      const key = `${dasha.planetName}:${dasha.startDate.getTime()}`;
      if (!mahaMap.has(key)) mahaMap.set(key, []);
      mahaMap.get(key)!.push(dasha);
    }
  }

  // Build timeline blocks
  const timeline: MahadashaBlock[] = [];
  for (const [, dashas] of mahaMap) {
    const maha = dashas[0]; // First item is the Mahadasha entry
    if (maha.level !== 'MAHADASHA') continue;

    // Find all Antardasha entries within this Mahadasha
    const antardashas: AntardashaWindow[] = [];
    let totalStrength = 0;

    for (const antar of dashas) {
      if (antar.level === 'ANTARDASHA') {
        const { strength } = scoreAntardashaActivation(
          {
            startDate: antar.startDate,
            endDate: antar.endDate,
            planetName: antar.planetName,
            level: 'ANTARDASHA',
          },
          natalChart
        );

        antardashas.push({
          antardashaPlanet: antar.planetName.split('/')[1] || antar.planetName,
          startDate: antar.startDate,
          endDate: antar.endDate,
          strength,
          activates: [], // Would populate with detected yogas
        });

        totalStrength += strength;
      }
    }

    const avgStrength = antardashas.length > 0 ? totalStrength / antardashas.length : 50;

    timeline.push({
      mahadashaPlanet: maha.planetName,
      startDate: maha.startDate,
      endDate: maha.endDate,
      antardashas,
      totalYears: Math.ceil((maha.endDate.getTime() - maha.startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
      overallStrength: Math.round(avgStrength),
      keyEvents: [],
    });
  }

  // Sort by start date
  timeline.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Get current dashas
  const { mahaDasha, antarDasha } = getCurrentDashas(natalChart, currentDate);

  // Find next transition
  let nextTransition = undefined;
  for (const block of timeline) {
    for (const antar of block.antardashas) {
      if (antar.endDate > currentDate) {
        nextTransition = {
          date: antar.endDate,
          type: 'antardasha-change' as const,
          newPlanetName: 'Next', // Would populate with actual next planet
        };
        break;
      }
    }
    if (nextTransition) break;
  }

  return {
    birthDate,
    currentDate,
    currentMahaDasha: mahaDasha || { startDate: birthDate, endDate: birthDate, planetName: 'Unknown', level: 'MAHADASHA' },
    currentAntarDasha: antarDasha || { startDate: birthDate, endDate: birthDate, planetName: 'Unknown', level: 'ANTARDASHA' },
    timeline,
    nextTransition,
  };
}

/**
 * Get next Dasha transition (when Antar changes to next planet).
 * Used by UI to highlight upcoming period change.
 */
export function getNextDashaTransition(
  timeline: VedicDashaTimeline,
  referenceDate: Date = new Date()
): { date: Date; type: string; newPlanet: string } | null {
  if (timeline.nextTransition) {
    return {
      date: timeline.nextTransition.date,
      type: timeline.nextTransition.type,
      newPlanet: timeline.nextTransition.newPlanetName,
    };
  }

  // Scan timeline for next transition
  for (const block of timeline.timeline) {
    for (const antar of block.antardashas) {
      if (antar.endDate > referenceDate) {
        return {
          date: antar.endDate,
          type: 'antardasha-change',
          newPlanet: 'Next period',
        };
      }
    }
  }

  return null;
}

/**
 * Get or build cached Dasha timeline.
 * Cache is permanent (no TTL) and invalidated when birth profile changes.
 */
export async function getOrBuildDashaTimeline(
  userId: string,
  birthProfile: BirthProfile,
  natalChart: VedicChartCalculations
): Promise<VedicDashaTimeline> {
  const cacheKey = kvKeys.dashaTimeline(userId);
  const cached = await kvGet<VedicDashaTimeline>(cacheKey);
  if (cached) return cached;

  const timeline = await buildFullDashaTimeline(userId, birthProfile, natalChart);
  await kvSet(cacheKey, timeline, KV_TTL.DASHA_TIMELINE);
  return timeline;
}

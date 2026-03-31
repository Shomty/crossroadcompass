/**
 * lib/astro/dashaService.ts
 * Dasha extraction and DB cache layer.
 * Caching rule (section 18.4): fetch once; valid for years.
 * Dashas are embedded in the Vedic birth chart response (chartD1.dashas.vimshottari).
 * They are extracted and stored in the Dasha table after chart generation.
 * Rows are deleted atomically when birth data changes (via invalidateChartCache).
 */

import { db } from "@/lib/db";
import type { VedicChartCalculations } from "openastrology-library";
import { Dasha, DashaLevel } from "@prisma/client";

/**
 * Persists dasha periods from a VedicChartCalculations into the DB.
 * Called once after chart generation. Replaces any existing rows for this user.
 */
export async function storeDashasFromChart(
  userId: string,
  chart: VedicChartCalculations
): Promise<void> {
  const periods = chart.dashas?.vimshottari?.dashaPeriods;
  if (!periods?.length) return;

  const rows: {
    userId: string;
    startDate: Date;
    endDate: Date;
    planetName: string;
    level: DashaLevel;
  }[] = [];

  for (const mahadasha of periods) {
    rows.push({
      userId,
      startDate: mahadasha.startDate instanceof Date ? mahadasha.startDate : new Date(mahadasha.startDate),
      endDate:   mahadasha.endDate   instanceof Date ? mahadasha.endDate   : new Date(mahadasha.endDate),
      planetName: mahadasha.planet,
      level: "MAHADASHA" as DashaLevel,
    });
    for (const antardasha of mahadasha.subPeriods ?? []) {
      rows.push({
        userId,
        startDate: antardasha.startDate instanceof Date ? antardasha.startDate : new Date(antardasha.startDate),
        endDate:   antardasha.endDate   instanceof Date ? antardasha.endDate   : new Date(antardasha.endDate),
        planetName: `${mahadasha.planet}/${antardasha.planet}`,
        level: "ANTARDASHA" as DashaLevel,
      });
    }
  }

  await db.$transaction([
    db.dasha.deleteMany({ where: { userId } }),
    db.dasha.createMany({ data: rows }),
  ]);
}

/**
 * Returns all dasha periods for a user from the DB cache.
 */
export async function getOrFetchDashas(userId: string): Promise<Dasha[]> {
  const twelveMonthsFromNow = new Date();
  twelveMonthsFromNow.setMonth(twelveMonthsFromNow.getMonth() + 12);

  const coverage = await db.dasha.findFirst({
    where: { userId, endDate: { gte: twelveMonthsFromNow } },
  });

  if (coverage) {
    return db.dasha.findMany({
      where: { userId },
      orderBy: { startDate: "asc" },
    });
  }

  // Not yet populated — chart generation will call storeDashasFromChart
  return [];
}

/**
 * Returns the mahadasha period currently active for a user.
 */
export async function getCurrentDasha(userId: string): Promise<Dasha | null> {
  const now = new Date();
  return db.dasha.findFirst({
    where: {
      userId,
      startDate: { lte: now },
      endDate: { gte: now },
      level: "MAHADASHA",
    },
  });
}

/**
 * Returns the Antardasha period currently active for a user.
 * `planetName` in DB: "MAHADASHA_PLANET/ANTARDASHA_PLANET"
 */
export async function getCurrentAntardasha(userId: string): Promise<Dasha | null> {
  const now = new Date();
  return db.dasha.findFirst({
    where: {
      userId,
      startDate: { lte: now },
      endDate: { gte: now },
      level: "ANTARDASHA",
    },
  });
}

/** Fractional months remaining in a period from today (floor at 0). */
export function monthsRemaining(endDate: Date): number {
  const now = new Date();
  const msLeft = endDate.getTime() - now.getTime();
  return Math.max(0, Math.round(msLeft / (1000 * 60 * 60 * 24 * 30.44)));
}

/** Whole years remaining in a period from today (floor at 0). */
export function yearsRemaining(endDate: Date): number {
  const now = new Date();
  const msLeft = endDate.getTime() - now.getTime();
  return Math.max(0, Math.round(msLeft / (1000 * 60 * 60 * 24 * 365.25)));
}

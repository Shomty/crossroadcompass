/**
 * lib/astro/dashaService.ts
 * Dasha extraction and DB cache layer.
 * Caching rule (section 18.4): fetch once; valid for years.
 * Dashas are embedded in the Vedic birth chart response (chartD1.dashas.vimshottari).
 * They are extracted and stored in the Dasha table after chart generation.
 * Rows are deleted atomically when birth data changes (via invalidateChartCache).
 */

import { db } from "@/lib/db";
import type { VedicBirthChartResponse } from "@/lib/astro/types";
import { Dasha, DashaLevel } from "@prisma/client";

/**
 * Persists dasha periods from a Vedic birth chart response into the DB.
 * Called once after chart generation. Replaces any existing rows for this user.
 */
export async function storeDashasFromChart(
  userId: string,
  chart: VedicBirthChartResponse
): Promise<void> {
  const periods = chart.chartD1?.dashas?.vimshottari?.dashaPeriods;
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
      startDate: new Date(mahadasha.startDate),
      endDate: new Date(mahadasha.endDate),
      planetName: mahadasha.planet,
      level: "MAHADASHA" as DashaLevel,
    });
    for (const antardasha of mahadasha.subPeriods ?? []) {
      rows.push({
        userId,
        startDate: new Date(antardasha.startDate),
        endDate: new Date(antardasha.endDate),
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

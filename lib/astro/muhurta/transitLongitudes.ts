import type { BirthProfile } from "@prisma/client";
import type { VedicChartCalculations } from "openastrology-library";
import type { PlanetName } from "@/types";
import { kvGet } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import { getOrCreateTransitsForLocalCalendarDate } from "@/lib/astro/chartService";
import { siderealLongitudesFromOpenAstrologyChart } from "@/lib/astro/muhurta/planetLongitudesFromVedicChart";
import { formatLocalYmd } from "@/lib/astro/muhurta/safeTime";

/**
 * Sidereal longitudes for grahas at `utcTimestamp` (civil date in user's timezone).
 * Fills KV via `getOrCreateTransitsForLocalCalendarDate` on miss.
 */
export async function getTransitSiderealLongitudes(
  userId: string,
  profile: BirthProfile,
  utcTimestamp: Date
): Promise<Partial<Record<PlanetName, number>>> {
  const ymd = formatLocalYmd(utcTimestamp, profile.timezone);
  let chart = await kvGet<VedicChartCalculations>(kvKeys.transit(userId, ymd));
  if (!chart) {
    try {
      chart = await getOrCreateTransitsForLocalCalendarDate(userId, profile, ymd, {
        ttlSeconds: KV_TTL.TRANSIT_LOOKAHEAD_SECONDS,
      });
    } catch (err) {
      console.error(
        `[muhurta] transit chart failed userId=${userId} ymd=${ymd}:`,
        err
      );
      return {};
    }
  }
  return siderealLongitudesFromOpenAstrologyChart(chart);
}

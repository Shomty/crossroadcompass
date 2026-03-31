// STATUS: done | Muhurta / multi-day transit KV warm-up (cron)
/**
 * Pre-compute sidereal transit charts into KV for upcoming civil dates in the
 * user's timezone. Feeds future Muhurta window scans (`kvKeys.transit`).
 *
 * ## Cost model (for capacity planning)
 *
 * Per user, per cron run, with `TRANSIT_LOOKAHEAD_DAYS = 30` (31 distinct keys):
 *
 * - **Best case (warm):** up to 31 × `kvGet` only — sub-second on Redis-class KV.
 * - **Cold case:** 31 × `kvGet` miss + 31 × `calculateChart` (Swiss Ephemeris).
 *   Ephemeris work dominates (~tens of ms per chart locally; budget ~1–3 s/user cold).
 * - **Fleet:** `users × cold_cost` can approach `maxDuration` (300s) on Vercel if
 *   many profiles miss cache the same day. Mitigations: skip-if-cached (implemented),
 *   shard users across multiple cron schedules, or background queue.
 *
 * Date list uses `formatInTimeZone(addDays(anchor, i), tz, 'yyyy-MM-dd')`; rare TZ/DST
 * edge cases may collapse two offsets into one civil date — acceptable for lookahead.
 */

import type { BirthProfile } from "@prisma/client";
import { addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { kvGet } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import { getOrCreateTransitsForLocalCalendarDate } from "@/lib/astro/chartService";
import type { VedicChartCalculations } from "openastrology-library";

/** Inclusive: day 0 = today (in user TZ) through day 30 → 31 keys. */
export const TRANSIT_LOOKAHEAD_DAYS = 30;

export type TransitPrecacheSummary = {
  datesConsidered: number;
  cacheHits: number;
  chartsComputed: number;
};

function enumerateLookaheadDateKeys(timezone: string, anchorUtc: Date): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];
  for (let i = 0; i <= TRANSIT_LOOKAHEAD_DAYS; i++) {
    const ymd = formatInTimeZone(addDays(anchorUtc, i), timezone, "yyyy-MM-dd");
    if (!seen.has(ymd)) {
      seen.add(ymd);
      keys.push(ymd);
    }
  }
  return keys;
}

/**
 * Ensures `kvKeys.transit(userId, ymd)` exists for ~31 civil dates ahead in
 * `profile.timezone`, using long TTL. Idempotent — skips dates already cached.
 */
export async function precomputeTransitsLookaheadForUser(
  userId: string,
  profile: BirthProfile,
  anchorUtc: Date = new Date()
): Promise<TransitPrecacheSummary> {
  const timezone = profile.timezone;
  const dateKeys = enumerateLookaheadDateKeys(timezone, anchorUtc);

  let cacheHits = 0;
  let chartsComputed = 0;

  for (const ymd of dateKeys) {
    const key = kvKeys.transit(userId, ymd);
    const existing = await kvGet<VedicChartCalculations>(key);
    if (existing !== null) {
      cacheHits++;
      continue;
    }
    await getOrCreateTransitsForLocalCalendarDate(userId, profile, ymd, {
      ttlSeconds: KV_TTL.TRANSIT_LOOKAHEAD_SECONDS,
    });
    chartsComputed++;
  }

  return {
    datesConsidered: dateKeys.length,
    cacheHits,
    chartsComputed,
  };
}

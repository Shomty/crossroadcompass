// STATUS: done | Task 3.6
/**
 * lib/astro/transitService.ts
 * Daily transit cache layer using KV (Upstash Redis).
 * One cache entry per user per calendar day — auto-expires after 24h.
 * See copilot-instructions section 18.3.
 *
 * DECISION NEEDED: Vedic API transit endpoint path + payload schema.
 * See open-decisions tracker item #1 in TASKS.md.
 */

import type { BirthProfile } from "@prisma/client";
import { kvGet, kvSet } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";

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

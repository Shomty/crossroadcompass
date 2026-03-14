/**
 * lib/astro/transitChartService.ts
 * Fetches today's planetary positions (transit chart) for a given user.
 *
 * Strategy:
 *   - Calls POST /api/v1/birth-charts with today's date/time and the user's
 *     birth location — this returns current planetary positions.
 *   - Result cached in KV for 24h (one entry per user per calendar day).
 *   - If the API is unavailable, returns null so callers can degrade gracefully.
 */

import type { BirthProfile } from "@prisma/client";
import { kvGet, kvSet } from "@/lib/kv/helpers";
import { kvKeys, KV_TTL } from "@/lib/kv/keys";
import { fetchVedicNatalChart } from "@/lib/astro/vedicApiClient";
import type { VedicChart } from "@/lib/astro/types";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

/**
 * Returns today's transit chart for the user, using KV cache when available.
 * "Today" is resolved in the user's timezone from their birth profile.
 *
 * @param locationOverride - Optional "City, Country" string. When provided
 *   (from the user's saved observation location), the Vedic API geocodes
 *   using this position instead of birth location.
 */
export async function getTodayTransitChart(
  userId: string,
  profile: BirthProfile,
  locationOverride?: string
): Promise<VedicChart | null> {
  // Date key in user's timezone: YYYY-MM-DD
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: profile.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const cacheKey = kvKeys.transit(userId, today);
  const cached = await kvGet<VedicChart>(cacheKey);
  if (cached !== null) return cached;

  // Use observation location if provided, otherwise fall back to birth location
  const location = locationOverride
    ?? [profile.birthCity, profile.birthCountry].filter(Boolean).join(", ");

  // Build current time for the transit call
  const now = new Date();
  const timeOfBirth = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

  try {
    const chart = await fetchVedicNatalChart({
      dateOfBirth: today,
      timeOfBirth,
      location,
      isTimeApproximate: false,
      gender: (profile.gender as "male" | "female" | "other" | null) ?? "male",
      name: "transit",
    });

    await kvSet(cacheKey, chart, KV_TTL.TRANSIT_SECONDS);
    return chart;
  } catch (err) {
    console.error("[transitChartService] API call failed:", err);
    return null;
  }
}

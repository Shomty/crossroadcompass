// STATUS: done | Task OA transit
/**
 * lib/astro/transitChartService.ts
 * Thin wrapper around chartService.getOrCreateTodayTransits for backwards compatibility.
 */

import type { BirthProfile } from '@prisma/client'
import type { VedicChartCalculations } from 'openastrology-library'
import { getOrCreateTodayTransits } from '@/lib/astro/chartService'

/**
 * Returns today's transit chart for the user, using KV cache when available.
 * "Today" is resolved in the user's timezone from their birth profile.
 *
 * @param latOverride  - Optional latitude override (observation location).
 * @param lngOverride  - Optional longitude override (observation location).
 * @param tzOverride   - Optional IANA timezone override.
 */
export async function getTodayTransitChart(
  userId: string,
  profile: BirthProfile,
  latOverride?: number,
  lngOverride?: number,
  tzOverride?: string
): Promise<VedicChartCalculations | null> {
  try {
    return await getOrCreateTodayTransits(userId, profile, latOverride, lngOverride, tzOverride)
  } catch (err) {
    console.error('[transitChartService] Transit calculation failed:', err)
    return null
  }
}

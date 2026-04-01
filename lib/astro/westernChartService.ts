/**
 * lib/astro/westernChartService.ts
 * KV-cached Western (tropical) natal chart calculation.
 * THIS IS THE ONLY FILE that calls getWesternCalculator() for natal charts.
 * Transit calculations remain in transitService.ts.
 */

import type { BirthProfile } from '@prisma/client'
import type { WesternChartCalculations } from 'openastrology-library'
import { getWesternCalculator } from '@/lib/astro/calculatorService'
import { prismaProfileToBirthInfo } from '@/lib/astro/birthInfoMapper'
import { kvGet, kvSet } from '@/lib/kv/helpers'
import { kvKeys, KV_TTL } from '@/lib/kv/keys'

/**
 * Returns the Western natal chart for a user.
 * Cache strategy: KV with no TTL (permanent until invalidateChartCache is called).
 * On KV miss: recalculate and re-store.
 */
export async function getOrCreateWesternNatalChart(
  userId: string,
  birthProfile: BirthProfile
): Promise<WesternChartCalculations> {
  const cacheKey = kvKeys.westernNatalChart(userId)

  const cached = await kvGet<WesternChartCalculations>(cacheKey)
  if (cached !== null) return cached

  const birthInfo = prismaProfileToBirthInfo(birthProfile)
  const calculator = getWesternCalculator()
  const chart = await calculator.calculateChart(birthInfo)

  await kvSet(cacheKey, chart, KV_TTL.NATAL_CHART)

  return chart
}

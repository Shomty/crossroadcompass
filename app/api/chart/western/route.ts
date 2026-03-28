// STATUS: done | Task OA.11
/**
 * app/api/chart/western/route.ts
 * GET /api/chart/western
 *
 * Returns the Western (tropical) natal chart for the authenticated user.
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getWesternCalculator } from '@/lib/astro/calculatorService'
import { prismaProfileToBirthInfo } from '@/lib/astro/birthInfoMapper'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const birthProfile = await db.birthProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!birthProfile) {
    return NextResponse.json({ error: 'Birth profile not found' }, { status: 404 })
  }

  try {
    const birthInfo = prismaProfileToBirthInfo(birthProfile)
    const western = getWesternCalculator()
    const chart = await western.calculateChart(birthInfo)

    return NextResponse.json({
      ascendant: chart.ascendant,
      planets:   chart.planets,
    })
  } catch (err) {
    console.error('[chart/western] Calculation failed:', err)
    return NextResponse.json(
      { error: 'Chart calculation failed. Please try again.' },
      { status: 500 }
    )
  }
}

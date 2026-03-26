// STATUS: done | Task SP.16
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getOrCreateSpecialPoints } from '@/lib/astro/chartService'
import { getOrCreateSpecialPointsInsights } from '@/lib/ai/specialPointsInsightService'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const isAdmin = session.user.role === 'ADMIN'

  if (!isAdmin) {
    const subscription = await db.subscription.findUnique({
      where: { userId },
      select: { tier: true },
    })
    const tier = subscription?.tier ?? 'FREE'
    if (tier !== 'CORE' && tier !== 'VIP') {
      return NextResponse.json(
        { error: 'UPGRADE_REQUIRED', requiredTier: 'CORE' },
        { status: 403 }
      )
    }
  }

  const specialPoints = await getOrCreateSpecialPoints(userId)
  if (!specialPoints) {
    return NextResponse.json(
      {
        error: 'Special points not yet available.',
        detail: 'Vedic chart may still be generating. Retry after chart generation completes.',
      },
      { status: 202 }
    )
  }

  const userName =
    session.user.name ?? session.user.email?.split('@')[0] ?? 'the native'

  const insights = await getOrCreateSpecialPointsInsights(userId, specialPoints, userName)
  return NextResponse.json(insights, {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

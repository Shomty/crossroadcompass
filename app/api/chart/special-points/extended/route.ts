// STATUS: done | SP-EXT.10
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOrCreateExtendedSpecialPoints } from '@/lib/astro/chartService'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await getOrCreateExtendedSpecialPoints(session.user.id)

  if (!result) {
    return NextResponse.json(
      {
        error: 'Extended special points not yet available.',
        detail: 'Base chart or Hora Lagna may still be generating. Retry after /api/chart/special-points returns 200.',
      },
      { status: 202 }
    )
  }

  return NextResponse.json(result)
}

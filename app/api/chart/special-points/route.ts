// STATUS: done | Task SP.13
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOrCreateSpecialPoints } from '@/lib/astro/chartService'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await getOrCreateSpecialPoints(session.user.id)

  if (!result) {
    return NextResponse.json(
      {
        error: 'Special points not yet available.',
        detail: 'Vedic chart may still be generating. Retry after chart generation completes.',
      },
      { status: 202 }
    )
  }

  return NextResponse.json(result)
}

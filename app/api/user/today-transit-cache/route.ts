/**
 * POST /api/user/today-transit-cache
 * Clears KV cache for today’s transit chart (user’s local calendar day) so the next
 * dashboard load recomputes Moon / transits. Used by Today’s Moon refresh control.
 */

import { NextResponse } from "next/server";
import { formatLocalCalendarDateYmd } from "@/lib/astro/dailyMoonJudgment";
import { getRequiredSession } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { kvDelete } from "@/lib/kv/helpers";
import { kvKeys } from "@/lib/kv/keys";

export async function POST() {
  let session: Awaited<ReturnType<typeof getRequiredSession>>;
  try {
    session = await getRequiredSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const profile = await db.birthProfile.findUnique({
    where: { userId },
    select: { timezone: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "No birth profile" }, { status: 404 });
  }

  const transitDateYmd = formatLocalCalendarDateYmd(profile.timezone);
  await kvDelete(kvKeys.transit(userId, transitDateYmd));
  await kvDelete(kvKeys.todayMoonReading(userId, transitDateYmd));

  return NextResponse.json({ ok: true as const, transitDateYmd });
}

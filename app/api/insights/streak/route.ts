// STATUS: done | FE-10
/**
 * GET /api/insights/streak
 * Returns the number of consecutive calendar days (ending today) that have
 * a DAILY insight for the authenticated user.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch the last 60 DAILY insights ordered by date descending
  const insights = await db.insight.findMany({
    where: { userId, type: "DAILY" },
    orderBy: { periodDate: "desc" },
    take: 60,
    select: { periodDate: true },
  });

  if (insights.length === 0) {
    return NextResponse.json({ streak: 0 });
  }

  // Normalise to UTC day strings for comparison
  const days = new Set(
    insights.map((i) => i.periodDate.toISOString().slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return NextResponse.json({ streak });
}

/**
 * GET /api/insights/daily — today's DAILY insight row (FE-10).
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
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const insight = await db.insight.findFirst({
    where: {
      userId,
      type: "DAILY",
      periodDate: { gte: today, lt: tomorrow },
    },
    orderBy: { generatedAt: "desc" },
    select: {
      id: true,
      content: true,
      periodDate: true,
      generatedAt: true,
      insightFeedback: true,
      accuracyRating: true,
    },
  });

  if (!insight) {
    return NextResponse.json({ pending: true, insight: null });
  }

  return NextResponse.json({
    pending: false,
    insight: {
      id: insight.id,
      content: insight.content,
      periodDate: insight.periodDate.toISOString(),
      generatedAt: insight.generatedAt.toISOString(),
      insightFeedback: insight.insightFeedback,
      accuracyRating: insight.accuracyRating,
    },
  });
}

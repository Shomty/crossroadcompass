/**
 * POST /api/insights/feedback — thumbs on daily insight (FE-10).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const bodySchema = z.object({
  /** YYYY-MM-DD — must match stored periodDate calendar day */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  feedback: z.enum(["positive", "negative"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { date, feedback } = parsed.data;
  const userId = session.user.id;

  const [y, m, d] = date.split("-").map(Number);
  const dayStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  const dayEnd = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0, 0));

  const result = await db.insight.updateMany({
    where: {
      userId,
      type: "DAILY",
      periodDate: { gte: dayStart, lt: dayEnd },
    },
    data: { insightFeedback: feedback },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "No daily insight for that date" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

// STATUS: done | Task Admin-10
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/admin/auditLogger";
import { db } from "@/lib/db";
import { generateDailyInsight } from "@/lib/ai/dailyInsightService";
import type { HDChartData } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { userId } = await params;
  const body = await request.json();
  const { type = "DAILY" } = body as { type?: string };

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { birthProfile: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!user.birthProfile?.chartDataHumanDesign) {
    return NextResponse.json({ error: "User has no HD chart data" }, { status: 400 });
  }

  if (type === "DAILY") {
    const chart = user.birthProfile.chartDataHumanDesign as unknown as HDChartData;
    await generateDailyInsight(userId, chart, user.name);

    await writeAuditLog({
      adminEmail: session!.user.email ?? "",
      actionType: "CRON_MANUALLY_TRIGGERED",
      targetId: userId,
      targetType: "User",
      notes: `Manually triggered ${type} insight`,
    });

    return NextResponse.json({ success: true, type });
  }

  return NextResponse.json({ error: `Insight type "${type}" not supported for manual trigger yet` }, { status: 400 });
}

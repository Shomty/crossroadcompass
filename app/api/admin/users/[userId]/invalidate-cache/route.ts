// STATUS: done | Task Admin-10
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/admin/auditLogger";
import { invalidateChartCache } from "@/lib/astro/chartService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { userId } = await params;

  await invalidateChartCache(userId);

  await writeAuditLog({
    adminEmail: session!.user.email ?? "",
    actionType: "USER_CHART_INVALIDATED",
    targetId: userId,
    targetType: "User",
  });

  return NextResponse.json({ success: true });
}

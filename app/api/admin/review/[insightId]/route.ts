// STATUS: done | Task Admin-6
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/admin/auditLogger";
import { db } from "@/lib/db";

interface ReviewBody {
  action: "approve" | "reject" | "edit_approve";
  editedContent?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ insightId: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { insightId } = await params;
  const body = (await request.json()) as ReviewBody;

  const insight = await db.insight.findUnique({ where: { id: insightId } });
  if (!insight) {
    return NextResponse.json({ error: "Insight not found" }, { status: 404 });
  }

  const adminEmail = session!.user.email ?? "";

  if (body.action === "approve") {
    const updated = await db.insight.update({
      where: { id: insightId },
      data: {
        reviewedByConsultant: true,
        reviewedAt: new Date(),
        deliveredAt: new Date(),
      },
    });
    await writeAuditLog({
      adminEmail,
      actionType: "INSIGHT_APPROVED",
      targetId: insightId,
      targetType: "Insight",
      before: { reviewedByConsultant: false },
      after: { reviewedByConsultant: true },
    });
    return NextResponse.json({ insight: updated });
  }

  if (body.action === "edit_approve") {
    if (!body.editedContent) {
      return NextResponse.json({ error: "editedContent required for edit_approve" }, { status: 400 });
    }
    const updated = await db.insight.update({
      where: { id: insightId },
      data: {
        content: body.editedContent,
        reviewedByConsultant: true,
        reviewedAt: new Date(),
        deliveredAt: new Date(),
      },
    });
    await writeAuditLog({
      adminEmail,
      actionType: "INSIGHT_EDITED",
      targetId: insightId,
      targetType: "Insight",
      before: { content: insight.content },
      after: { content: body.editedContent, reviewedByConsultant: true },
    });
    return NextResponse.json({ insight: updated });
  }

  if (body.action === "reject") {
    const updated = await db.insight.update({
      where: { id: insightId },
      data: {
        rejectedAt: new Date(),
        rejectedBy: adminEmail,
      },
    });
    await writeAuditLog({
      adminEmail,
      actionType: "INSIGHT_REJECTED",
      targetId: insightId,
      targetType: "Insight",
      before: { rejectedAt: null },
      after: { rejectedAt: updated.rejectedAt, rejectedBy: adminEmail },
    });
    // TODO: Phase 2 — auto-trigger regeneration on reject
    return NextResponse.json({ insight: updated });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

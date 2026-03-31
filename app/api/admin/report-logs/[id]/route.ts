import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/auth/adminHelpers";
import { db } from "@/lib/db";

/**
 * DELETE — remove a generated report and its purchase record (admin only).
 * `id` is the GeneratedReport row id (same as report logs UI / regenerate route).
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { id } = await context.params;

  const gr = await db.generatedReport.findUnique({
    where: { id },
    include: {
      purchase: {
        include: {
          user: { select: { email: true } },
          reportProduct: { select: { title: true } },
        },
      },
    },
  });

  if (!gr) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const purchaseId = gr.purchaseId;
  const adminEmail = session!.user.email ?? "admin";
  const detail = `${gr.purchase.user.email ?? "?"} · ${gr.purchase.reportProduct.title}`;

  await db.reportPurchase.delete({ where: { id: purchaseId } });

  await writeAuditLog({
    adminEmail,
    action: "report.purchase.delete",
    targetType: "report",
    targetId: purchaseId,
    detail,
  });

  return NextResponse.json({ ok: true, deletedPurchaseId: purchaseId });
}

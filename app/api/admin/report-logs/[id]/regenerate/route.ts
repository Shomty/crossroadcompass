import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/auth/adminHelpers";
import { db } from "@/lib/db";
import { generateReportForPurchase } from "@/lib/reports/reportGenerationService";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { id } = await context.params;
  const gr = await db.generatedReport.findUnique({
    where: { id },
    include: { purchase: true },
  });

  if (!gr) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.generatedReport.update({
    where: { id },
    data: {
      status: "PENDING",
      errorMsg: null,
      regeneratedAt: new Date(),
    },
  });

  await db.reportPurchase.update({
    where: { id: gr.purchaseId },
    data: { status: "PAID" },
  });

  await generateReportForPurchase(gr.purchaseId);

  await writeAuditLog({
    adminEmail: session!.user.email ?? "admin",
    action: "report.regenerate",
    targetType: "report",
    targetId: id,
  });

  return NextResponse.json({ status: "queued" });
}

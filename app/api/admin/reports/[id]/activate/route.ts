import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/auth/adminHelpers";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { id } = await context.params;
  const existing = await db.reportProduct.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const next = !existing.isActive;
  await db.reportProduct.update({
    where: { id },
    data: { isActive: next },
  });

  await writeAuditLog({
    adminEmail: session!.user.email ?? "admin",
    action: "report.activate",
    targetType: "report",
    targetId: id,
    detail: next ? "activated" : "deactivated",
  });

  return NextResponse.json({ isActive: next });
}

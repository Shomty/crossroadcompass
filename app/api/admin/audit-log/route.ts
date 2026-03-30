import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const url = new URL(request.url);
  const adminEmail = url.searchParams.get("adminEmail");
  const targetType = url.searchParams.get("targetType");
  const actionSearch = url.searchParams.get("action");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const perPage = 50;

  const where: Record<string, unknown> = {};
  if (adminEmail) where.adminEmail = { contains: adminEmail };
  if (targetType) where.targetType = targetType;
  if (actionSearch) {
    where.OR = [
      { actionLabel: { contains: actionSearch } },
      { notes: { contains: actionSearch } },
    ];
  }

  const [rows, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.auditLog.count({ where }),
  ]);

  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      adminEmail: r.adminEmail,
      actionType: r.actionType,
      actionLabel: r.actionLabel,
      targetType: r.targetType,
      targetId: r.targetId,
      detail: r.detail,
      ip: r.ip,
      createdAt: r.timestamp.toISOString(),
    })),
    total,
    page,
    pages: Math.ceil(total / perPage),
  });
}

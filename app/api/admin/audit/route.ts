// STATUS: done | Task Admin-13
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import { AuditActionType } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const url = new URL(request.url);
  const adminEmail = url.searchParams.get("adminEmail");
  const actionType = url.searchParams.get("actionType") as AuditActionType | null;
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");
  const cursor = url.searchParams.get("cursor");
  const PAGE_SIZE = 50;

  const where: Record<string, unknown> = {};
  if (adminEmail) where.adminEmail = { contains: adminEmail };
  if (actionType) where.actionType = actionType;
  if (dateFrom || dateTo) {
    where.timestamp = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    };
  }

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: PAGE_SIZE,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const nextCursor = logs.length === PAGE_SIZE ? logs[logs.length - 1].id : null;

  return NextResponse.json({ logs, nextCursor });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import type { ReportGenerationStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("perPage") ?? "50", 10))
  );
  const status = url.searchParams.get("status") as ReportGenerationStatus | "ALL" | null;
  const reportId = url.searchParams.get("reportId");

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") {
    where.status = status;
  }
  if (reportId) {
    where.purchase = { reportProductId: reportId };
  }

  const [rows, total] = await Promise.all([
    db.generatedReport.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { generatedAt: "desc" },
      include: {
        purchase: {
          include: {
            user: { select: { email: true } },
            reportProduct: { select: { title: true } },
          },
        },
      },
    }),
    db.generatedReport.count({ where }),
  ]);

  const items = rows.map((r) => ({
    id: r.id,
    userId: r.purchase.userId,
    userEmail: r.purchase.user.email,
    reportName: r.purchase.reportProduct.title,
    status: r.status,
    generatedAt: r.generatedAt.toISOString(),
    regeneratedAt: r.regeneratedAt?.toISOString() ?? null,
    errorMsg:
      r.errorMsg && r.errorMsg.length > 200
        ? `${r.errorMsg.slice(0, 200)}…`
        : r.errorMsg,
  }));

  return NextResponse.json({
    items,
    total,
    page,
    pages: Math.ceil(total / perPage),
  });
}

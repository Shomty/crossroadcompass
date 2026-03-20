// STATUS: done | Task Admin-10
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const PAGE_SIZE = 50;

  const where = search
    ? { email: { contains: search } }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        subscription: { select: { tier: true, status: true } },
        birthProfile: { select: { hdType: true, chartDataHumanDesign: true, chartDataVedic: true } },
        insights: {
          orderBy: { deliveredAt: "desc" },
          take: 1,
          select: { deliveredAt: true, type: true },
        },
        _count: { select: { insights: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  const items = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    tier: u.subscription?.tier ?? "FREE",
    status: u.subscription?.status ?? "ACTIVE",
    role: u.role,
    createdAt: u.createdAt,
    chartCached: !!(u.birthProfile?.chartDataHumanDesign),
    lastInsight: u.insights[0]?.deliveredAt ?? null,
    totalInsights: u._count.insights,
  }));

  return NextResponse.json({ items, total, page, pages: Math.ceil(total / PAGE_SIZE) });
}

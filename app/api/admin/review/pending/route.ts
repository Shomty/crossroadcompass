// STATUS: done | Task Admin-6
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const PAGE_SIZE = 50;

  const insights = await db.insight.findMany({
    where: {
      reviewedByConsultant: false,
      rejectedAt: null,
    },
    orderBy: { generatedAt: "asc" },
    take: PAGE_SIZE,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      user: { select: { email: true, birthProfile: { select: { hdType: true } } } },
    },
  });

  const items = insights.map((insight) => {
    const email = insight.user.email ?? "";
    const atIdx = email.indexOf("@");
    const partialEmail =
      atIdx > 3
        ? email.slice(0, 3) + "***" + email.slice(atIdx)
        : email.slice(0, 1) + "***" + (atIdx >= 0 ? email.slice(atIdx) : "");

    return {
      id: insight.id,
      type: insight.type,
      content: insight.content,
      generatedAt: insight.generatedAt,
      partialEmail,
      hdType: insight.user.birthProfile?.hdType ?? null,
    };
  });

  const nextCursor = insights.length === PAGE_SIZE ? insights[insights.length - 1].id : null;

  return NextResponse.json({ items, nextCursor, total: items.length });
}

import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const { id } = await context.params;
  const rows = await db.reportPromptVersion.findMany({
    where: { reportProductId: id },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      savedBy: true,
      savedAt: true,
    },
  });

  return NextResponse.json({
    items: rows.map((r) => ({
      ...r,
      savedAt: r.savedAt.toISOString(),
    })),
  });
}

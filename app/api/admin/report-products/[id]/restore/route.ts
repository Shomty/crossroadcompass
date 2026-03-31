// STATUS: done | Admin report catalog — restore soft-deleted product
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/auth/adminHelpers";
import { db } from "@/lib/db";
import { parseRestoreSlugFromArchived } from "@/lib/reports/reportProductArchive";

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

  if (!existing.deletedAt) {
    return NextResponse.json({ error: "Product is not deleted" }, { status: 400 });
  }

  const restoredSlug = parseRestoreSlugFromArchived(existing.slug, id);
  if (!restoredSlug) {
    return NextResponse.json(
      { error: "Could not derive original slug; fix slug manually after restore." },
      { status: 400 }
    );
  }

  const clash = await db.reportProduct.findFirst({
    where: { slug: restoredSlug, deletedAt: null, NOT: { id } },
    select: { id: true, title: true },
  });
  if (clash) {
    return NextResponse.json(
      {
        error:
          "Another active product already uses this slug. Rename the other product or edit this one’s slug after a manual fix.",
      },
      { status: 409 }
    );
  }

  try {
    const product = await db.reportProduct.update({
      where: { id },
      data: { deletedAt: null, slug: restoredSlug },
      include: { _count: { select: { purchases: true } } },
    });
    const adminEmail = session!.user.email ?? "admin";
    await writeAuditLog({
      adminEmail,
      action: "report.product.restore",
      targetType: "report",
      targetId: id,
      detail: `${restoredSlug} · ${product.title}`,
    });
    return NextResponse.json({ product });
  } catch (e) {
    console.error("[admin/report-products restore]", e);
    return NextResponse.json({ error: "Failed to restore product" }, { status: 500 });
  }
}

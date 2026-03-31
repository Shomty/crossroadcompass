// STATUS: done | Admin report catalog
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/auth/adminHelpers";
import { db } from "@/lib/db";
import { updateReportProductSchema } from "@/lib/admin/reportProductValidation";
import { archivedReportProductSlug } from "@/lib/reports/reportProductArchive";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const { id } = await context.params;

  const product = await db.reportProduct.findUnique({
    where: { id },
    include: { _count: { select: { purchases: true } } },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PATCH(
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

  if (existing.deletedAt) {
    return NextResponse.json(
      { error: "Product is soft-deleted. Restore it before editing." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateReportProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 }
    );
  }

  if (data.slug !== undefined && data.slug !== existing.slug) {
    const clash = await db.reportProduct.findFirst({
      where: { slug: data.slug, deletedAt: null, NOT: { id } },
      select: { id: true },
    });
    if (clash) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 409 }
      );
    }
  }

  const promptChanged =
    data.geminiPrompt !== undefined &&
    data.geminiPrompt !== existing.geminiPrompt;

  const sharedFields = {
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.title !== undefined && { title: data.title }),
    ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.category !== undefined && { category: data.category }),
    ...(data.priceUsd !== undefined && { priceUsd: data.priceUsd }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
    ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    ...(data.coverImageUrl !== undefined && {
      coverImageUrl: data.coverImageUrl,
    }),
    ...(data.estimatedWordCount !== undefined && {
      estimatedWordCount: data.estimatedWordCount,
    }),
  };

  try {
    let product;

    if (promptChanged) {
      const adminEmail = session!.user.email ?? "admin";
      const nextVersion = existing.promptVersion + 1;
      await db.$transaction([
        db.reportPromptVersion.create({
          data: {
            reportProductId: id,
            version: nextVersion,
            prompt: data.geminiPrompt!,
            savedBy: adminEmail,
          },
        }),
        db.reportProduct.update({
          where: { id },
          data: {
            ...sharedFields,
            geminiPrompt: data.geminiPrompt!,
            promptVersion: nextVersion,
          },
        }),
      ]);
      await writeAuditLog({
        adminEmail,
        action: "prompt.save",
        targetType: "prompt",
        targetId: id,
      });
      const reloaded = await db.reportProduct.findUnique({
        where: { id },
        include: { _count: { select: { purchases: true } } },
      });
      if (!reloaded) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      product = reloaded;
    } else {
      product = await db.reportProduct.update({
        where: { id },
        data: {
          ...sharedFields,
          ...(data.geminiPrompt !== undefined && {
            geminiPrompt: data.geminiPrompt,
          }),
        },
        include: { _count: { select: { purchases: true } } },
      });
    }

    return NextResponse.json({ product });
  } catch (e) {
    console.error("[admin/report-products PATCH]", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { id } = await context.params;

  const existing = await db.reportProduct.findUnique({
    where: { id },
    include: { _count: { select: { purchases: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.deletedAt) {
    return NextResponse.json({ ok: true, softDeleted: true });
  }

  const archivedSlug = archivedReportProductSlug(existing.slug, id);

  try {
    await db.reportProduct.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        slug: archivedSlug,
      },
    });
    const adminEmail = session!.user.email ?? "admin";
    await writeAuditLog({
      adminEmail,
      action: "report.product.delete",
      targetType: "report",
      targetId: id,
      detail: `soft-deleted · ${existing.title} · ${existing._count.purchases} purchase row(s) kept`,
    });
    return NextResponse.json({ ok: true, softDeleted: true });
  } catch (e) {
    console.error("[admin/report-products DELETE]", e);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

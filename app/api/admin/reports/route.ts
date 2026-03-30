import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/auth/adminHelpers";
import { db } from "@/lib/db";
import { ReportCategory } from "@prisma/client";

export async function GET(request: Request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const products = await db.reportProduct.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const purchases = await db.reportPurchase.findMany({
    select: {
      reportProductId: true,
      generatedReport: { select: { status: true } },
    },
  });
  const doneCount = new Map<string, number>();
  for (const p of purchases) {
    if (p.generatedReport?.status === "DONE") {
      doneCount.set(
        p.reportProductId,
        (doneCount.get(p.reportProductId) ?? 0) + 1
      );
    }
  }

  const items = products.map((r) => ({
    id: r.id,
    name: r.title,
    slug: r.slug,
    isActive: r.isActive,
    promptVersion: r.promptVersion,
    priceCents: r.priceUsd,
    updatedAt: r.updatedAt.toISOString(),
    generatedCount: doneCount.get(r.id) ?? 0,
  }));

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  let body: { name?: string; slug?: string; description?: string; priceCents?: number };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!name || !slug) {
    return NextResponse.json(
      { error: "name and slug are required" },
      { status: 400 }
    );
  }

  const adminEmail = session!.user.email ?? "admin";

  try {
    const product = await db.reportProduct.create({
      data: {
        title: name,
        slug,
        description: body.description?.trim() ?? "Draft report",
        category: ReportCategory.CUSTOM,
        priceUsd: typeof body.priceCents === "number" ? body.priceCents : 0,
        isActive: false,
        geminiPrompt: "",
        createdBy: adminEmail,
        sortOrder: 999,
      },
    });

    await writeAuditLog({
      adminEmail,
      action: "report.create",
      targetType: "report",
      targetId: product.id,
    });

    return NextResponse.json(
      {
        id: product.id,
        name: product.title,
        slug: product.slug,
        isActive: product.isActive,
        promptVersion: product.promptVersion,
      },
      { status: 201 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("unique")) {
      return NextResponse.json({ error: "Duplicate slug" }, { status: 409 });
    }
    console.error("[admin/reports POST]", e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}

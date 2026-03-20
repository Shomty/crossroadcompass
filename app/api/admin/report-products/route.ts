// STATUS: done | Admin report catalog
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import { createReportProductSchema } from "@/lib/admin/reportProductValidation";

export async function GET(request: Request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const products = await db.reportProduct.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { purchases: true } },
    },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createReportProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const createdBy = session.user.email ?? "admin";

  try {
    const product = await db.reportProduct.create({
      data: {
        slug: data.slug,
        title: data.title,
        subtitle: data.subtitle ?? null,
        description: data.description,
        category: data.category,
        priceUsd: data.priceUsd,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        coverImageUrl:
          data.coverImageUrl === undefined ? null : data.coverImageUrl,
        geminiPrompt: data.geminiPrompt,
        estimatedWordCount: data.estimatedWordCount ?? 2000,
        createdBy,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Unique constraint") && msg.toLowerCase().includes("slug")) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 409 }
      );
    }
    console.error("[admin/report-products POST]", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

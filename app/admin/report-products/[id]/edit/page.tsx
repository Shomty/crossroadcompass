// STATUS: done | Admin report catalog
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ReportProductForm from "../../ReportProductForm";
import type { ReportProductFormInitial } from "../../ReportProductForm";
import type { ReportCategory } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditReportProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;

  const product = await db.reportProduct.findUnique({ where: { id } });
  if (!product) notFound();

  const initial: ReportProductFormInitial = {
    slug: product.slug,
    title: product.title,
    subtitle: product.subtitle ?? "",
    description: product.description,
    category: product.category as ReportCategory,
    priceUsd: product.priceUsd,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
    coverImageUrl: product.coverImageUrl ?? "",
    geminiPrompt: product.geminiPrompt,
    estimatedWordCount: product.estimatedWordCount,
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 10,
            color: "#c8873a",
            letterSpacing: "0.2em",
            marginBottom: 8,
          }}
        >
          ADMIN · REPORT CATALOG · EDIT
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display, 'Cormorant Garamond')",
            fontSize: 26,
            color: "#e8b96a",
            margin: 0,
            fontWeight: 400,
          }}
        >
          Edit: {product.title}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 11,
            color: "#606880",
            margin: "8px 0 0",
          }}
        >
          id · {product.id}
        </p>
      </div>
      <ReportProductForm mode="edit" productId={product.id} initial={initial} />
    </div>
  );
}

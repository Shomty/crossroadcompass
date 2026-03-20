// STATUS: done | Task R.9
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { V4GlassCard } from "@/components/v4/V4GlassCard";
import { PurchaseReportButton } from "./PurchaseReportButton";
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const params = await searchParams;
  const activeCategory = (params.category ?? "ALL") as string;

  const reportProduct = (db as any).reportProduct as
    | { findMany: Function }
    | undefined;

  if (!reportProduct?.findMany) {
    return (
      <PageLayout
        eyebrow="REPORTS"
        title="My Reports"
        subtitle="Deep, personalized reports generated from your unique chart data."
      >
        <section className="animate-enter animate-enter-2">
          <div className="glass-card border border-white/10 rounded-xl p-6 cc-body">
            Reports are not ready yet. Please run `npx prisma generate` and
            restart the dev server (or redeploy) so the Prisma client includes
            `reportProduct` tables.
          </div>
        </section>
      </PageLayout>
    );
  }

  const products = (await reportProduct.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      description: true,
      category: true,
      priceUsd: true,
      isActive: true,
      sortOrder: true,
      coverImageUrl: true,
      estimatedWordCount: true,
    },
  })) as Array<{
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string;
    category: string;
    priceUsd: number;
    isActive: boolean;
    sortOrder: number;
    coverImageUrl: string | null;
    estimatedWordCount: number;
  }>;

  const reportPurchase = (db as any).reportPurchase as
    | { findMany: Function }
    | undefined;

  if (!reportPurchase?.findMany) {
    return (
      <PageLayout
        eyebrow="REPORTS"
        title="My Reports"
        subtitle="Deep, personalized reports generated from your unique chart data."
      >
        <section className="animate-enter animate-enter-2">
          <div className="glass-card border border-white/10 rounded-xl p-6 cc-body">
            Reports are not ready yet. Please run `npx prisma generate` and
            restart the dev server so the Prisma client includes
            `reportPurchase` tables.
          </div>
        </section>
      </PageLayout>
    );
  }

  const purchases = (await reportPurchase.findMany({
    where: {
      userId,
      status: { in: ["PAID", "GENERATING", "COMPLETE"] },
    },
    select: {
      reportProductId: true,
      status: true,
      id: true,
    },
  })) as Array<{
    reportProductId: string;
    status: string;
    id: string;
  }>;

  const purchaseMap = new Map<string, (typeof purchases)[number]>(
    purchases.map((p) => [p.reportProductId, p])
  );

  const cards = products.map((product) => {
    const purchase = purchaseMap.get(product.id);
    return {
      ...product,
      purchaseStatus: purchase?.status ?? null,
      purchaseId: purchase?.id ?? null,
    };
  });

  const categories = Array.from(new Set(cards.map((c) => c.category)));
  const categoryOptions = ["ALL", ...categories] as const;

  const normalizedCategory = categoryOptions.includes(
    activeCategory as (typeof categoryOptions)[number]
  )
    ? activeCategory
    : "ALL";

  const filtered =
    normalizedCategory === "ALL"
      ? cards
      : cards.filter((c) => c.category === normalizedCategory);

  return (
    <PageLayout
      eyebrow="REPORTS"
      title="My Reports"
      subtitle="Deep, personalized reports generated from your unique chart data."
    >
      <section className="animate-enter animate-enter-2">
        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {categoryOptions.map((cat) => {
            const isActive = normalizedCategory === cat;
            const label =
              cat === "ALL"
                ? "All Reports"
                : String(cat)
                    .split("_")
                    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
                    .join(" ");

            const href =
              cat === "ALL"
                ? "/reports"
                : `/reports?category=${encodeURIComponent(String(cat))}`;

            return (
              <Link
                key={cat}
                href={href}
                className={[
                  "cc-tag",
                  isActive ? "cc-tag--amber" : "",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((product) => {
            const isComplete = product.purchaseStatus === "COMPLETE";
            const isGenerating = product.purchaseStatus === "GENERATING";
            const isPaid = product.purchaseStatus === "PAID";

            const priceDisplay = `$${(product.priceUsd / 100).toFixed(0)}`;
            const wordDisplay = `~${(product.estimatedWordCount / 1000).toFixed(0)}k words`;

            return (
              <V4GlassCard key={product.id} className="h-full">
                <div className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="cc-tag">
                      {String(product.category)
                        .split("_")
                        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
                        .join(" ")}
                    </span>

                    {product.purchaseStatus && (
                      <span
                        className={[
                          "cc-tag",
                          "cc-tag--amber",
                          isGenerating ? "animate-pulse" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {isComplete
                          ? "READY TO READ"
                          : isGenerating
                            ? "GENERATING"
                            : isPaid
                              ? "AWAITING GENERATION"
                              : String(product.purchaseStatus)}
                      </span>
                    )}
                  </div>

                  <h3 className="cc-title-card mt-4">{product.title}</h3>

                  {product.subtitle && (
                    <p className="cc-body mt-2 text-sm">{product.subtitle}</p>
                  )}

                  <p className="cc-body mt-3 line-clamp-4">{product.description}</p>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="cc-mono">{wordDisplay}</span>
                    <span className="cc-mono">{priceDisplay}</span>
                  </div>

                  <div className="mt-5 flex flex-col gap-2">
                    {isComplete && product.purchaseId ? (
                      <Link
                        href={`/reports/${product.purchaseId}`}
                        className="w-full rounded-xl border border-amber-400/40 bg-amber-500/20 px-3 py-2 text-center text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/30"
                      >
                        Read Report
                      </Link>
                    ) : isGenerating || isPaid ? (
                      <button
                        type="button"
                        disabled
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/40"
                      >
                        {isGenerating
                          ? "Generating your report..."
                          : "Awaiting Generation"}
                      </button>
                    ) : (
                      <PurchaseReportButton
                        reportProductId={product.id}
                        priceUsdCents={product.priceUsd}
                      />
                    )}
                  </div>
                </div>
              </V4GlassCard>
            );
          })}
        </div>
      </section>
    </PageLayout>
  );
}


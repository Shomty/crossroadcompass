// STATUS: done | Task R.9
import { getAppUserContext } from "@/lib/auth/appContext";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { PurchaseReportButton } from "./PurchaseReportButton";
import { TriggerGenerateButton } from "./TriggerGenerateButton";
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const ctx = await getAppUserContext();
  if (!ctx) redirect("/login");
  const userId = ctx.userId;

  const params = await searchParams;
  const activeCategory = (params.category ?? "ALL") as string;

  const products = await db.reportProduct.findMany({
    where: { isActive: true, deletedAt: null },
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
  });

  const purchases = await db.reportPurchase.findMany({
    where: {
      userId,
      status: { in: ["PAID", "GENERATING", "COMPLETE"] },
    },
    select: {
      reportProductId: true,
      status: true,
      id: true,
    },
  });

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
        <div className="synthesis-tab-rail">
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
                className="btn-toggle"
                data-active={isActive ? "true" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Cards Grid */}
        <div
          style={{
            marginTop: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
          }}
        >
          {filtered.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                padding: "4rem 0",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "3rem",
                  color: "rgba(200,135,58,0.2)",
                  lineHeight: 1,
                }}
              >
                ◈
              </div>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                  fontSize: 14,
                  color: "rgba(240,220,160,0.38)",
                }}
              >
                No reports in this category yet.
              </p>
            </div>
          )}

          {filtered.map((product) => {
            const isComplete = product.purchaseStatus === "COMPLETE";
            const isGenerating = product.purchaseStatus === "GENERATING";
            const isPaid = product.purchaseStatus === "PAID";

            const priceDisplay =
              product.priceUsd === 0
                ? "Free"
                : `$${(product.priceUsd / 100).toFixed(0)}`;
            const wordDisplay = `~${(product.estimatedWordCount / 1000).toFixed(0)}k words`;

            const categoryLabel = String(product.category)
              .split("_")
              .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
              .join(" ");

            return (
              <div
                key={product.id}
                className="report-card"
                style={{
                  background: "rgba(13,18,37,0.72)",
                  border: "1px solid rgba(200,135,58,0.18)",
                  borderRadius: 16,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Header strip */}
                {product.coverImageUrl ? (
                  <div
                    style={{
                      height: 120,
                      backgroundImage: `url(${product.coverImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center top",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to bottom, transparent 40%, rgba(13,18,37,0.92))",
                      }}
                    />
                  </div>
                ) : null}

                {/* Card body */}
                <div
                  style={{
                    padding: "20px 22px 24px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  {/* Tag row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <span className="cc-tag">{categoryLabel}</span>
                    {product.purchaseStatus && (
                      <span
                        className={["cc-tag", "cc-tag--amber", isGenerating ? "animate-pulse" : ""].filter(Boolean).join(" ")}
                      >
                        {isComplete
                          ? "Ready"
                          : isGenerating
                            ? "Generating…"
                            : isPaid
                              ? "Queued"
                              : String(product.purchaseStatus)}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      marginTop: 12,
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.92)",
                      lineHeight: 1.35,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {product.title}
                  </h3>

                  {/* Subtitle */}
                  {product.subtitle && (
                    <p
                      style={{
                        marginTop: 4,
                        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "rgba(200,135,58,0.78)",
                        fontStyle: "italic",
                        lineHeight: 1.5,
                      }}
                    >
                      {product.subtitle}
                    </p>
                  )}

                  {/* Description */}
                  <p
                    style={{
                      marginTop: 10,
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                      fontSize: 13,
                      fontWeight: 400,
                      color: "rgba(240,220,160,0.55)",
                      lineHeight: 1.65,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {product.description}
                  </p>

                  {/* Spacer */}
                  <div style={{ flex: 1 }} />

                  {/* Metadata row */}
                  <div
                    style={{
                      marginTop: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      paddingTop: 14,
                      borderTop: "1px solid rgba(200,135,58,0.1)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        letterSpacing: "0.06em",
                        color: "rgba(240,220,160,0.35)",
                      }}
                    >
                      {wordDisplay}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 14,
                        fontWeight: 500,
                        color: "rgba(240,220,160,0.72)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {priceDisplay}
                    </span>
                  </div>

                  {/* Action */}
                  <div style={{ marginTop: 14 }}>
                    {isComplete && product.purchaseId ? (
                      <Link
                        href={`/reports/${product.purchaseId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-read-report"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                        </svg>
                        Read Report
                      </Link>
                    ) : isGenerating || isPaid ? (
                      isPaid ? (
                        <TriggerGenerateButton reportProductId={product.id} />
                      ) : (
                        <button type="button" disabled className="btn-primary w-full">
                          Generating…
                        </button>
                      )
                    ) : (
                      <PurchaseReportButton
                        reportProductId={product.id}
                        priceUsdCents={product.priceUsd}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PageLayout>
  );
}


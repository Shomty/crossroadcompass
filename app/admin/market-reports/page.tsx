import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MarketReportsAdminPage() {
  await requireAdminSession();

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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display, 'Cormorant Garamond')",
              fontSize: 28,
              color: "#e8b96a",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Report Builder
          </h1>
          <p style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#606880", margin: "8px 0 0" }}>
            Marketplace report products — prompts and activation.
          </p>
        </div>
        <Link
          href="/admin/market-reports/new"
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 11,
            padding: "10px 18px",
            background: "rgba(200,135,58,0.2)",
            border: "1px solid rgba(200,135,58,0.45)",
            borderRadius: 8,
            color: "#e8b96a",
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}
        >
          NEW REPORT
        </Link>
      </div>

      <div
        style={{
          background: "rgba(28,35,64,0.4)",
          border: "1px solid rgba(200,135,58,0.1)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 80px 80px 90px 100px",
            padding: "10px 16px",
            borderBottom: "1px solid rgba(200,135,58,0.15)",
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 10,
            color: "#c8873a",
            letterSpacing: "0.1em",
          }}
        >
          <div>Name</div>
          <div>Slug</div>
          <div>Status</div>
          <div>Price</div>
          <div>Generated</div>
          <div>Actions</div>
        </div>
        {products.map((r, i) => (
          <div
            key={r.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 80px 80px 90px 100px",
              padding: "10px 16px",
              borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              alignItems: "center",
              fontFamily: "var(--font-mono, 'DM Mono')",
              fontSize: 12,
              color: "#a0a8c0",
            }}
          >
            <div style={{ color: "#c8d0e8" }}>{r.title}</div>
            <div style={{ color: "#606880" }}>{r.slug}</div>
            <div style={{ color: r.isActive ? "#80D4A0" : "#c8873a" }}>
              {r.isActive ? "Active" : "Draft"}
            </div>
            <div>{(r.priceUsd / 100).toFixed(0)}</div>
            <div>{doneCount.get(r.id) ?? 0}</div>
            <div>
              <Link
                href={`/admin/market-reports/${r.id}`}
                style={{ color: "#e8b96a", textDecoration: "none", fontSize: 11 }}
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

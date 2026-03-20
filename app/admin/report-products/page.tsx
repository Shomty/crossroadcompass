// STATUS: done | Admin report catalog
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminReportProductsPage() {
  await requireAdminSession();

  const products = await db.reportProduct.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { purchases: true } } },
  });

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 10,
            color: "#c8873a",
            letterSpacing: "0.2em",
            marginBottom: 8,
          }}
        >
          ADMIN · REPORT CATALOG
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
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
              Report products
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body, 'Instrument Sans')",
                fontSize: 13,
                color: "#606880",
                margin: "8px 0 0",
                maxWidth: 520,
              }}
            >
              Create and edit catalog items shown on the user-facing{" "}
              <Link href="/reports" style={{ color: "#c8873a" }}>
                /reports
              </Link>{" "}
              page. For one-off assembled reports, use{" "}
              <Link href="/admin/reports" style={{ color: "#c8873a" }}>
                Custom Report Builder
              </Link>
              .
            </p>
          </div>
          <Link
            href="/admin/report-products/new"
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid rgba(200,135,58,0.45)",
              background: "rgba(200,135,58,0.15)",
              color: "#e8b96a",
              fontFamily: "var(--font-mono, 'DM Mono')",
              fontSize: 11,
              letterSpacing: "0.1em",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            + NEW PRODUCT
          </Link>
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
          border: "1px solid rgba(200,135,58,0.2)",
          borderRadius: 12,
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(200,135,58,0.2)" }}>
              {["Active", "Title", "Slug", "Category", "Price", "Purchases", ""].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: h === "" ? "right" : "left",
                      padding: "12px 14px",
                      fontFamily: "var(--font-mono, 'DM Mono')",
                      fontSize: 10,
                      color: "#c8873a",
                      letterSpacing: "0.12em",
                      fontWeight: 400,
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "#606880",
                    fontFamily: "var(--font-body, 'Instrument Sans')",
                  }}
                >
                  No products yet. Create one to populate the marketplace.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono, 'DM Mono')",
                        fontSize: 10,
                        color: p.isActive ? "#6ec98a" : "#806080",
                      }}
                    >
                      {p.isActive ? "ON" : "OFF"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "#e8e0d0",
                      fontFamily: "var(--font-body, 'Instrument Sans')",
                      maxWidth: 220,
                    }}
                  >
                    {p.title}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "#8088a0",
                      fontFamily: "var(--font-mono, 'DM Mono')",
                      fontSize: 11,
                    }}
                  >
                    {p.slug}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "#a0a8c0",
                      fontSize: 12,
                    }}
                  >
                    {String(p.category).split("_").join(" ")}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "#e8b96a",
                      fontFamily: "var(--font-mono, 'DM Mono')",
                      fontSize: 12,
                    }}
                  >
                    ${(p.priceUsd / 100).toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "#606880",
                      fontFamily: "var(--font-mono, 'DM Mono')",
                      fontSize: 12,
                    }}
                  >
                    {p._count.purchases}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    <Link
                      href={`/admin/report-products/${p.id}/edit`}
                      style={{
                        fontFamily: "var(--font-mono, 'DM Mono')",
                        fontSize: 11,
                        color: "#6080c0",
                        textDecoration: "none",
                      }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

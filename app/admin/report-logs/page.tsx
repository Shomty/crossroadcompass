import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import type { ReportGenerationStatus } from "@prisma/client";
import { ReportLogsActions } from "@/components/admin/ReportLogsActions";

export const dynamic = "force-dynamic";

export default async function ReportLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; reportId?: string; page?: string }>;
}) {
  await requireAdminSession();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const perPage = 50;
  const status = (sp.status ?? "ALL") as ReportGenerationStatus | "ALL";
  const reportId = sp.reportId;

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") where.status = status;
  if (reportId) where.purchase = { reportProductId: reportId };

  const [rows, total, products] = await Promise.all([
    db.generatedReport.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { generatedAt: "desc" },
      include: {
        purchase: {
          include: {
            user: { select: { email: true } },
            reportProduct: { select: { title: true, id: true } },
          },
        },
      },
    }),
    db.generatedReport.count({ where }),
    db.reportProduct.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display, 'Cormorant Garamond')", fontSize: 28, color: "#e8b96a", margin: "0 0 8px", fontWeight: 400 }}>
        Report logs
      </h1>
      <p style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#606880", marginBottom: 20 }}>
        Generated marketplace reports — view content and regenerate.
      </p>

      <form method="GET" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <select
          name="status"
          defaultValue={status}
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            padding: "8px 12px",
            background: "rgba(13,18,32,0.8)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 6,
            color: "#c8d0e8",
          }}
        >
          <option value="ALL">All statuses</option>
          <option value="DONE">DONE</option>
          <option value="FAILED">FAILED</option>
          <option value="PENDING">PENDING</option>
          <option value="GENERATING">GENERATING</option>
        </select>
        <select
          name="reportId"
          defaultValue={reportId ?? ""}
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            padding: "8px 12px",
            background: "rgba(13,18,32,0.8)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 6,
            color: "#c8d0e8",
            minWidth: 200,
          }}
        >
          <option value="">All reports</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 11,
            padding: "8px 16px",
            background: "rgba(200,135,58,0.2)",
            border: "1px solid rgba(200,135,58,0.4)",
            borderRadius: 6,
            color: "#e8b96a",
            cursor: "pointer",
          }}
        >
          Filter
        </button>
      </form>

      <div
        style={{
          background: "rgba(28,35,64,0.4)",
          border: "1px solid rgba(200,135,58,0.1)",
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11 }}>
          <thead>
            <tr style={{ color: "#c8873a", textAlign: "left" }}>
              <th style={{ padding: 10 }}>User</th>
              <th style={{ padding: 10 }}>Report</th>
              <th style={{ padding: 10 }}>At</th>
              <th style={{ padding: 10 }}>Status</th>
              <th style={{ padding: 10 }}>Error</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "#a0a8c0" }}>
                <td style={{ padding: 10 }}>{r.purchase.user.email}</td>
                <td style={{ padding: 10 }}>{r.purchase.reportProduct.title}</td>
                <td style={{ padding: 10 }}>{r.generatedAt.toLocaleString()}</td>
                <td style={{ padding: 10, color: r.status === "DONE" ? "#80D4A0" : r.status === "FAILED" ? "#E8705A" : "#c8873a" }}>{r.status}</td>
                <td style={{ padding: 10, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.errorMsg ?? ""}>
                  {r.errorMsg ? `${r.errorMsg.slice(0, 80)}${r.errorMsg.length > 80 ? "…" : ""}` : "—"}
                </td>
                <td style={{ padding: 10 }}>
                  <ReportLogsActions
                    reportRowId={r.id}
                    contentPreview={r.content?.slice(0, 4000) ?? ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#606880" }}>
        Page {page} — {total} total
        {page > 1 ? (
          <Link href={`?status=${status}&reportId=${reportId ?? ""}&page=${page - 1}`} style={{ color: "#c8873a", marginLeft: 12 }}>
            Prev
          </Link>
        ) : null}
        {page * perPage < total ? (
          <Link href={`?status=${status}&reportId=${reportId ?? ""}&page=${page + 1}`} style={{ color: "#c8873a", marginLeft: 12 }}>
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}

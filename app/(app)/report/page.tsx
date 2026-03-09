/**
 * app/(app)/report/page.tsx
 * Full HD report page — same shell/style as dashboard.
 * Uses DashboardReport component (same widget as dashboard card).
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DashboardReport } from "@/components/report/DashboardReport";

export default async function ReportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const firstName = session.user?.name?.split(" ")[0] ?? "You";

  return (
    <div className="v2-content">

      {/* ── Topbar ─────────────────────────────────────────────── */}
      <div
        className="dashboard-topbar"
        style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, gap: 20, flexWrap: "wrap" }}
      >
        <div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
            color: "var(--faint)",
            marginBottom: 6,
          }}>
            Human Design
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(22px, 3vw, 30px)",
            fontWeight: 400,
            letterSpacing: "0.01em",
            color: "var(--moon)",
            lineHeight: 1.1,
            margin: 0,
          }}>
            {firstName}&apos;s <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Foundation Report</em>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: 12.5,
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: "var(--muted)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <ChevronLeft size={14} />
            Dashboard
          </Link>
        </div>
      </div>

      {/* ── Report content ─────────────────────────────────────── */}
      <DashboardReport />
    </div>
  );
}

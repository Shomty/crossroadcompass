// STATUS: done | Admin Custom Report Builder
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import ReportBuilder from "./ReportBuilder";

export default async function AdminReportsPage() {
  await requireAdminSession();

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
          ADMIN · REPORTS
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display, 'Cormorant Garamond')",
            fontSize: 28,
            color: "#e8b96a",
            margin: 0,
            fontWeight: 400,
          }}
        >
          Custom Report Builder
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body, 'Instrument Sans')",
            fontSize: 13,
            color: "#606880",
            margin: "8px 0 0",
          }}
        >
          Compose bespoke reports for users by selecting data variables and AI-generated sections.
          For paid catalog items on{" "}
          <Link href="/admin/report-products" style={{ color: "#c8873a" }}>
            Report Catalog
          </Link>
          , use that screen instead.
        </p>
      </div>

      <ReportBuilder />
    </div>
  );
}

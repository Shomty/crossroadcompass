// STATUS: done | Admin report catalog
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import ReportProductForm from "../ReportProductForm";

export default async function NewReportProductPage() {
  await requireAdminSession();

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
          ADMIN · REPORT CATALOG · NEW
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
          New report product
        </h1>
      </div>
      <ReportProductForm mode="create" />
    </div>
  );
}

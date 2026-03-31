import type { CSSProperties } from "react";
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const linkCardStyle: CSSProperties = {
  display: "block",
  padding: "20px 22px",
  borderRadius: 10,
  border: "1px solid rgba(200,135,58,0.2)",
  background: "rgba(28,35,64,0.45)",
  textDecoration: "none",
  transition: "border-color 0.15s, background 0.15s",
};

const linkTitleStyle: CSSProperties = {
  fontFamily: "var(--font-display, 'Cormorant Garamond')",
  fontSize: 20,
  fontWeight: 400,
  color: "#f0dca0",
  margin: 0,
  marginBottom: 6,
};

const linkDescStyle: CSSProperties = {
  fontFamily: "var(--font-mono, 'DM Mono')",
  fontSize: 11,
  color: "#606880",
  margin: 0,
  lineHeight: 1.5,
};

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const recentActivity = await db.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 10,
    select: {
      id: true,
      timestamp: true,
      adminEmail: true,
      actionType: true,
      actionLabel: true,
      targetType: true,
      targetId: true,
      detail: true,
      notes: true,
    },
  });

  return (
    <div>
      <header style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "var(--font-display, 'Cormorant Garamond')",
            fontSize: 28,
            fontWeight: 400,
            color: "#f0dca0",
            margin: 0,
            marginBottom: 6,
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            color: "#606880",
            margin: 0,
          }}
        >
          Quick access to common admin tasks and the latest audit activity.
        </p>
      </header>

      <section style={{ marginBottom: 36 }}>
        <h2
          style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 10,
            color: "#c8873a",
            letterSpacing: "0.14em",
            margin: "0 0 14px",
          }}
        >
          QUICK LINKS
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <Link href="/admin/report-products/new" style={linkCardStyle}>
            <h3 style={linkTitleStyle}>New report product</h3>
            <p style={linkDescStyle}>
              Create a catalog report: metadata, Gemini prompt, test generation,
              and version history.
            </p>
          </Link>
          <Link href="/admin/users" style={linkCardStyle}>
            <h3 style={linkTitleStyle}>Manage users</h3>
            <p style={linkDescStyle}>
              Search accounts, adjust tiers, and open user detail pages.
            </p>
          </Link>
        </div>
      </section>

      <section>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-mono, 'DM Mono')",
              fontSize: 10,
              color: "#c8873a",
              letterSpacing: "0.14em",
              margin: 0,
            }}
          >
            RECENT ACTIVITY
          </h2>
          <Link
            href="/admin/audit"
            style={{
              fontFamily: "var(--font-mono, 'DM Mono')",
              fontSize: 11,
              color: "#e8b96a",
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            View full audit log →
          </Link>
        </div>

        <div
          style={{
            background: "rgba(28,35,64,0.4)",
            border: "1px solid rgba(200,135,58,0.12)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {recentActivity.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--font-mono, 'DM Mono')",
                fontSize: 12,
                color: "#606880",
                padding: "28px 20px",
                margin: 0,
                textAlign: "center",
              }}
            >
              No audit entries yet.
            </p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr 1fr 160px",
                  gap: 12,
                  padding: "10px 16px",
                  borderBottom: "1px solid rgba(200,135,58,0.1)",
                  fontFamily: "var(--font-mono, 'DM Mono')",
                  fontSize: 10,
                  color: "#c8873a",
                  letterSpacing: "0.08em",
                }}
              >
                <div>Time</div>
                <div>Admin</div>
                <div>Action</div>
                <div>Target</div>
              </div>
              {recentActivity.map((row, i) => {
                const action =
                  row.actionLabel?.trim() || String(row.actionType);
                const target =
                  row.targetType && row.targetId
                    ? `${row.targetType}: ${row.targetId}`
                    : row.targetId ?? row.targetType ?? "—";
                const extra = row.detail?.trim() || row.notes?.trim();
                return (
                  <div
                    key={row.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "140px 1fr 1fr 160px",
                      gap: 12,
                      padding: "12px 16px",
                      borderTop:
                        i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      fontFamily: "var(--font-mono, 'DM Mono')",
                      fontSize: 11,
                      alignItems: "start",
                    }}
                  >
                    <div style={{ color: "#606880" }}>
                      {row.timestamp.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div
                      style={{
                        color: "#a0a8c0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={row.adminEmail}
                    >
                      {row.adminEmail}
                    </div>
                    <div style={{ color: "#c8d0e8", minWidth: 0 }}>
                      <span style={{ color: "#a0a8c0" }}>{action}</span>
                      {extra ? (
                        <div
                          style={{
                            fontSize: 10,
                            color: "#505870",
                            marginTop: 4,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={extra}
                        >
                          {extra}
                        </div>
                      ) : null}
                    </div>
                    <div
                      style={{
                        color: "#404860",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={target}
                    >
                      {target}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

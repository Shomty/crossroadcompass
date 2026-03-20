// STATUS: done | Task Admin-2
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import Link from "next/link";
import "@/styles/v2.css";

const NAV_LINKS = [
  { href: "/admin/review", label: "Review Queue", icon: "◎" },
  { href: "/admin/prompts", label: "Prompts", icon: "✦" },
  { href: "/admin/users", label: "Users", icon: "⊙" },
  { href: "/admin/insights", label: "Quality", icon: "◈" },
  { href: "/admin/cron", label: "Cron Jobs", icon: "⟳" },
  { href: "/admin/config", label: "Config", icon: "⚙" },
  { href: "/admin/audit", label: "Audit Log", icon: "▤" },
  { href: "/admin/report-products", label: "Report Catalog", icon: "▣" },
  { href: "/admin/reports", label: "Report Builder", icon: "◧" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d1220" }}>
      {/* Admin Sidebar */}
      <aside style={{
        width: 220,
        background: "rgba(13,18,32,0.95)",
        borderRight: "1px solid rgba(200,135,58,0.2)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        flexShrink: 0,
      }}>
        {/* Logo / Title */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(200,135,58,0.15)" }}>
          <div style={{ fontFamily: "var(--font-display, 'Cormorant Garamond')", fontSize: 16, color: "#e8b96a", letterSpacing: "0.1em" }}>
            CROSSROADS
          </div>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.2em", marginTop: 2 }}>
            ADMIN PANEL
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                fontFamily: "var(--font-mono, 'DM Mono')",
                fontSize: 12,
                color: "#a0a8c0",
                textDecoration: "none",
                transition: "color 0.15s, background 0.15s",
                letterSpacing: "0.05em",
              }}
            >
              <span style={{ color: "#c8873a", width: 16, textAlign: "center" }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Admin Identity */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(200,135,58,0.15)",
        }}>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.15em", marginBottom: 4 }}>
            ADMIN
          </div>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880", wordBreak: "break-all" }}>
            {session.user.email}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0, padding: "32px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}

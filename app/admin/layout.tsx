// STATUS: done | Task Admin-2
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import "@/styles/v2.css";

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

        <AdminSidebarNav />

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

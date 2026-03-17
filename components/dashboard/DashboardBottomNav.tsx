"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText, Star, Headphones, User, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutGrid, label: "Home" },
  { href: "/report", icon: FileText, label: "Chart" },
  { href: "/settings/profile", icon: User, label: "Profile" },
];

export function DashboardBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="dashboard-bottom-nav">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "6px 14px",
                textDecoration: "none",
                color: active ? "var(--gold)" : "var(--faint)",
                transition: "color 0.2s",
              }}
            >
              <Icon size={22} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={() => { window.location.href = "/api/auth/logout"; }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            padding: "6px 14px",
            background: "none",
            border: "none",
            color: "var(--faint)",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
        >
          <LogOut size={22} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
            Sign Out
          </span>
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 8px" }}>
        <div style={{ width: 100, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 999 }} />
      </div>
    </nav>
  );
}

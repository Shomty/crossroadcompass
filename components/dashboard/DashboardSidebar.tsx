"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutGrid, FileText, Star, Headphones, User, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/report", icon: FileText, label: "Reports" },
  { href: "/settings/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface DashboardSidebarProps {
  userName: string;
  tier: string;
}

export function DashboardSidebar({ userName, tier }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="dashboard-sidebar">
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 8px", marginBottom: 36 }}>
        <div style={{
          width: 36, height: 36,
          border: "1px solid var(--border-lit)",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--gold-glow)",
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeDasharray="2 3"/>
            <line x1="12" y1="2" x2="12" y2="6"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="6" y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 500, letterSpacing: "0.01em", color: "var(--moon)", lineHeight: 1.2 }}>
            Crossroads Compass
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--faint)", marginTop: 1 }}>
            Personal Navigation
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 2 }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "10px 12px",
                borderRadius: 10,
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: 13.5,
                fontWeight: 400,
                letterSpacing: "0.01em",
                color: active ? "var(--gold)" : "var(--faint)",
                background: active ? "var(--gold-glow)" : "none",
                border: `1px solid ${active ? "var(--border-lit)" : "transparent"}`,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              <Icon size={17} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", margin: "16px 8px" }} />

      {/* User chip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 10px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onClick={() => router.push("/settings")}
      >
        <div style={{
          width: 34, height: 34,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c6bc4, #4f7de0)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 14,
          color: "#fff",
          position: "relative",
        }}>
          {userName.charAt(0).toUpperCase()}
          <span style={{
            position: "absolute",
            top: -1, right: -1,
            width: 9, height: 9,
            background: "var(--gold)",
            borderRadius: "50%",
            border: "2px solid var(--deep)",
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--moon)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
            {userName}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--gold)", marginTop: 1 }}>
            {tier} Member
          </div>
        </div>
        <button
          style={{ background: "none", border: "none", color: "var(--faint)", cursor: "pointer", padding: 4, borderRadius: 6, flexShrink: 0 }}
          onClick={(e) => { e.stopPropagation(); router.push("/settings"); }}
        >
          <Settings size={15} />
        </button>
        <button
          title="Sign out"
          style={{ background: "none", border: "none", color: "var(--faint)", cursor: "pointer", padding: 4, borderRadius: 6, flexShrink: 0 }}
          onClick={(e) => { e.stopPropagation(); signOut({ callbackUrl: "/login" }); }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}

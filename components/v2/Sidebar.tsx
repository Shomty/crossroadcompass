"use client";
/**
 * components/v2/Sidebar.tsx
 * Premium V2 sidebar — left-rule active indicator, refined logo.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutGrid, FileText, User, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/v2/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/report",       icon: FileText,   label: "Reports"   },
  { href: "/settings/profile", icon: User,   label: "Profile"   },
  { href: "/settings",    icon: Settings,    label: "Settings"  },
];

interface Props {
  userName: string;
  tier: string;
}

export function SidebarV2({ userName, tier }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="v2-sidebar">
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 6px", marginBottom: 42 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          border: "1px solid var(--v2-border-lit)",
          background: "var(--v2-gold-glow)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 0 18px rgba(201,168,76,0.08)",
        }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--v2-gold)" strokeWidth="1.3">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeDasharray="2 3"/>
            <line x1="12" y1="2" x2="12" y2="6"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="2"  y1="12" x2="6"  y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 400, letterSpacing: "0.01em", color: "var(--v2-moon)", lineHeight: 1.25 }}>
            Crossroads Compass
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "var(--v2-faint)", marginTop: 2 }}>
            Personal Navigation
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: "0.26em", textTransform: "uppercase" as const, color: "var(--v2-whisper)", padding: "0 6px", marginBottom: 10 }}>
        Navigation
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 2 }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/v2/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`v2-nav-item${active ? " active" : ""}`}>
              <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.55 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Ornamental divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--v2-border), transparent)", margin: "22px 6px" }} />

      {/* User chip */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "11px 12px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.022)",
          border: "1px solid var(--v2-border)",
          cursor: "pointer",
          transition: "background 0.2s, border-color 0.2s",
        }}
        onClick={() => router.push("/settings")}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.022)"; }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #4a3fa0, #2c5baa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Playfair Display', serif",
          fontSize: 14, color: "rgba(255,255,255,0.9)",
          position: "relative",
        }}>
          {userName.charAt(0).toUpperCase()}
          <span style={{
            position: "absolute", top: -1, right: -1,
            width: 8, height: 8,
            background: "var(--v2-gold)", borderRadius: "50%",
            border: "2px solid var(--v2-surface)",
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 12.5, fontWeight: 500, color: "var(--v2-moon)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
            {userName}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--v2-gold)", marginTop: 2 }}>
            {tier} Member
          </div>
        </div>
        <button
          title="Sign out"
          style={{ background: "none", border: "none", color: "var(--v2-faint)", cursor: "pointer", padding: 4, borderRadius: 6, flexShrink: 0 }}
          onClick={e => { e.stopPropagation(); signOut({ callbackUrl: "/login" }); }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}

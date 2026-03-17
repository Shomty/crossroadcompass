"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 4px", marginBottom: 36 }}>
        <Image
          src="/logo-icon.png"
          alt="Crossroads Compass"
          width={40}
          height={40}
          priority
          style={{ objectFit: "contain", borderRadius: "50%", boxShadow: "0 0 0 1px rgba(212,175,55,0.30), 0 0 14px rgba(212,175,55,0.15)", flexShrink: 0 }}
        />
        <span style={{ fontFamily: "Cinzel, serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase" as const, color: "#e8b96a", lineHeight: 1.35 }}>
          <span style={{ display: "block" }}>CROSSROADS</span>
          <span style={{ display: "block" }}>COMPASS</span>
        </span>
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
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
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
          fontFamily: "Cinzel, serif",
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
          onClick={(e) => { e.stopPropagation(); window.location.href = "/api/auth/logout"; }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}

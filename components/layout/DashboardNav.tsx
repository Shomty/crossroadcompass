// STATUS: done | Task 8.1 (nav component for dashboard)
/**
 * components/layout/DashboardNav.tsx
 * Dashboard top navigation bar with subscription tier badge.
 * Server-compatible (no "use client" needed — uses plain links).
 */

import Link from "next/link";
import Image from "next/image";

interface DashboardNavProps {
  tier: string;
}

const TIER_LABEL: Record<string, string> = {
  FREE: "Free",
  CORE: "Core",
  VIP: "VIP",
};

const TIER_COLOR: Record<string, string> = {
  FREE: "rgba(200,135,58,0.25)",
  CORE: "rgba(200,135,58,0.55)",
  VIP: "#c8873a",
};

export function DashboardNav({ tier }: DashboardNavProps) {
  const label = TIER_LABEL[tier] ?? tier;
  const badgeColor = TIER_COLOR[tier] ?? TIER_COLOR.FREE;

  return (
    <nav
      className="dashboard-nav-inner"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.85rem 1.5rem",
        background: "rgba(8, 12, 26, 0.96)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Image
          src="/crossroads-compass-logo-2.svg"
          alt="Crossroads Compass"
          width={180}
          height={56}
          priority
          style={{ height: 32, width: "auto" }}
        />
      </Link>

      {/* Links + tier badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <div className="dashboard-nav-links" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/report" className="nav-link">My Chart</Link>
          <Link href="/settings/profile" className="nav-link">Profile</Link>
        </div>

        {/* Tier badge */}
        <span
          style={{
            fontSize: "9px",
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: badgeColor,
            border: `1px solid ${badgeColor}`,
            padding: "3px 8px",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        >
          {label}
        </span>
      </div>
    </nav>
  );
}

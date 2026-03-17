"use client";
/**
 * components/v2/TopNav.tsx
 * Full-width top navigation bar — replaces the left sidebar.
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, FileText, User, Settings, LogOut } from "lucide-react";

/* FRONTEND.md §12 — dashboard nav links: Dashboard, My Chart, Consultations, Account */
const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard"     },
  { href: "/report",    icon: FileText,   label: "My Chart"      },
  { href: "/transit",   icon: User,       label: "Consultations" },
  { href: "/settings",  icon: Settings,   label: "Account"       },
];

interface Props {
  userName: string;
  tier: string;
}

export function TopNavV2({ userName, tier }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="v2-topnav">
      {/* Logo */}
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
        <Image
          src="/logo-icon.png"
          alt="Crossroads Compass"
          width={34}
          height={34}
          priority
          style={{ objectFit: "contain", borderRadius: "50%", boxShadow: "0 0 0 1px rgba(212,175,55,0.30), 0 0 12px rgba(212,175,55,0.14)" }}
        />
      </Link>

      {/* Nav links */}
      <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`v2-topnav-item${active ? " active" : ""}`}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User chip */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 10px",
            borderRadius: 3,
            background: "rgba(255,255,255,0.022)",
            border: "1px solid rgba(200, 135, 58, 0.12)",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onClick={() => router.push("/settings")}
        >
          <div style={{
            width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--earth), var(--sky))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Cinzel, serif",
            fontSize: 13, color: "var(--gold)",
            position: "relative",
          }}>
            {userName.charAt(0).toUpperCase()}
            <span style={{
              position: "absolute", top: -1, right: -1,
              width: 7, height: 7,
              background: "var(--gold)", borderRadius: "50%",
              border: "2px solid var(--cosmos)",
            }} />
          </div>
          <div style={{ lineHeight: 1 }} className="v2-topnav-username">
            <div style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12, fontWeight: 500, color: "var(--cream)" }}>
              {userName.split(" ")[0]}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--gold)", marginTop: 2 }}>
              {tier}
            </div>
          </div>
        </div>

        <button
          title="Sign out"
          style={{ background: "none", border: "1px solid rgba(200, 135, 58, 0.12)", color: "var(--mist)", cursor: "pointer", padding: "7px 8px", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s, color 0.2s" }}
          onClick={() => { window.location.href = "/api/auth/logout"; }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}

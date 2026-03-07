"use client";
/**
 * components/v2/BottomNav.tsx
 * Premium V2 mobile bottom navigation bar.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutGrid, FileText, User, LogOut } from "lucide-react";

const NAV = [
  { href: "/v2/dashboard",      icon: LayoutGrid, label: "Home"    },
  { href: "/report",            icon: FileText,   label: "Chart"   },
  { href: "/settings/profile",  icon: User,       label: "Profile" },
];

export function BottomNavV2() {
  const pathname = usePathname();

  return (
    <nav className="v2-bottom-nav">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 8px" }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/v2/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "6px 16px", textDecoration: "none",
                color: active ? "var(--v2-gold)" : "var(--v2-faint)",
                transition: "color 0.2s",
                position: "relative",
              }}
            >
              {active && (
                <span style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: 28, height: 1.5, background: "var(--v2-gold)", borderRadius: 1,
                }} />
              )}
              <Icon size={21} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
                {label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "6px 16px", background: "none", border: "none",
            color: "var(--v2-faint)", cursor: "pointer", transition: "color 0.2s",
          }}
        >
          <LogOut size={21} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
            Exit
          </span>
        </button>
      </div>
    </nav>
  );
}

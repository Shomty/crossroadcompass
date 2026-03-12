"use client";
/**
 * components/app/SidebarNav.tsx
 * Left sidebar navigation — replaces top nav for authenticated app shell.
 * Desktop: fixed 256px left sidebar.
 * Mobile: fixed 64px top header bar + CSS slide-in drawer (no framer-motion).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report",    label: "My Chart"  },
  { href: "/transit",   label: "Transits"  },
  { href: "/settings",  label: "Settings"  },
];

interface Props {
  userName: string;
  tier: string;
}

const CompassIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeDasharray="2 3" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2"  y1="12" x2="6"  y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);

export function SidebarNav({ userName, tier }: Props) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const Logo = ({ onClick }: { onClick?: () => void }) => (
    <Link href="/dashboard" className="app-sidebar-logo" onClick={onClick}>
      <div className="app-sidebar-logo-icon">
        <CompassIcon />
      </div>
      <span className="app-sidebar-wordmark">CROSSROADS</span>
    </Link>
  );

  const NavLinks = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="app-sidebar-nav">
      {NAV_ITEMS.map(({ href, label }) => {
        const active =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`app-sidebar-item${active ? " active" : ""}`}
            onClick={onItemClick}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const UserBadge = () => (
    <div className="app-sidebar-user">
      <div className="app-sidebar-avatar">{initials}</div>
      <div className="app-sidebar-user-info">
        <span className="app-sidebar-user-name">{userName.split(" ")[0]}</span>
        <span className="app-sidebar-user-tier">{tier}</span>
      </div>
      <button
        className="app-sidebar-signout"
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Sign out"
      >
        <LogOut size={15} />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="app-sidebar">
        <Logo />
        <NavLinks />
        <UserBadge />
      </aside>

      {/* Mobile top header bar */}
      <header className="app-sidebar-mobile-header">
        <button
          className="app-sidebar-hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <Logo />
      </header>

      {/* Mobile drawer backdrop */}
      <div
        className={`app-sidebar-overlay${drawerOpen ? " visible" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile slide-in drawer */}
      <div className={`app-sidebar-drawer${drawerOpen ? " open" : ""}`}>
        <div className="app-sidebar-drawer-top">
          <Logo onClick={() => setDrawerOpen(false)} />
          <button
            className="app-sidebar-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <NavLinks onItemClick={() => setDrawerOpen(false)} />
        <UserBadge />
      </div>
    </>
  );
}

"use client";
/**
 * components/app/SidebarNav.tsx
 * Left sidebar navigation — replaces top nav for authenticated app shell.
 * Desktop: fixed 256px left sidebar, collapsible to 64px icon rail.
 * Mobile: fixed 64px top header bar + CSS slide-in drawer (no framer-motion).
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X, Compass, Moon, Globe, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/dashboard",        label: "Dashboard", Icon: Compass },
  { href: "/report",           label: "My Chart",  Icon: Moon },
  { href: "/transit",          label: "Transits",  Icon: Globe },
  { href: "/settings/profile", label: "Settings",  Icon: SlidersHorizontal },
];

interface Props {
  userName: string;
  tier: string;
}


export function SidebarNav({ userName, tier }: Props) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const initials = userName
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  // Restore compact state from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem("sidebar_compact") === "true";
    setIsCompact(stored);
    document.body.setAttribute("data-sidebar", stored ? "compact" : "expanded");
  }, []);

  function toggleCompact() {
    const next = !isCompact;
    setIsCompact(next);
    localStorage.setItem("sidebar_compact", String(next));
    document.body.setAttribute("data-sidebar", next ? "compact" : "expanded");
  }

  const Logo = ({ onClick, compact }: { onClick?: () => void; compact?: boolean }) => (
    <Link href="/dashboard" className={`app-sidebar-logo${compact ? " compact" : ""}`} onClick={onClick}>
      {/* Glyph — always visible */}
      <span className="logo-glyph-ring">
        <Image
          src="/logo-icon.png"
          alt="Crossroads Compass"
          width={36}
          height={36}
          priority
          style={{ display: "block", width: 36, height: 36, objectFit: "contain" }}
        />
      </span>

      {/* Wordmark — fades out when compact */}
      {!compact && (
        <span className="logo-wordmark" aria-label="Crossroads Compass">
          <span className="logo-wordmark-primary">
            <span>CROSSROADS</span>
            <span>COMPASS</span>
          </span>
          <span className="logo-wordmark-sub">VEDIC · HUMAN DESIGN</span>
        </span>
      )}
    </Link>
  );

  const NavLinks = ({ onItemClick, compact }: { onItemClick?: () => void; compact?: boolean }) => (
    <nav className="app-sidebar-nav">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`app-sidebar-item${active ? " active" : ""}${compact ? " compact" : ""}`}
            onClick={onItemClick}
            title={compact ? label : undefined}
          >
            <span className="app-sidebar-item-icon">
              <Icon size={18} strokeWidth={1.5} />
            </span>
            {!compact && (
              <span className="app-sidebar-item-label">{label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const UserBadge = ({ compact }: { compact?: boolean }) => (
    <div className={`app-sidebar-user${compact ? " compact" : ""}`}>
      <div className="app-sidebar-avatar">{initials}</div>
      {!compact && (
        <>
          <div className="app-sidebar-user-info">
            <span className="app-sidebar-user-name">{userName.split(" ")[0]}</span>
            <span className="app-sidebar-user-tier">{tier}</span>
          </div>
          <button
            className="app-sidebar-signout"
            onClick={() => { window.location.href = "/api/auth/logout"; }}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`app-sidebar${isCompact ? " compact" : ""}`}>
        <Logo compact={isCompact} />
        <NavLinks compact={isCompact} />
        <div className="app-sidebar-footer">
          <UserBadge compact={isCompact} />
          <button
            className="app-sidebar-collapse-btn"
            onClick={toggleCompact}
            title={isCompact ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCompact ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
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

      {/* Mobile slide-in drawer — always full width, no compact */}
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

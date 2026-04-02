"use client";
// STATUS: done | Task R.11
/**
 * components/app/SidebarNav.tsx
 * Left sidebar navigation — replaces top nav for authenticated app shell.
 * Desktop: fixed 256px left sidebar, collapsible to 64px icon rail.
 * Mobile: fixed 64px top header bar + CSS slide-in drawer (no framer-motion).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut, Menu, X, Compass, LayoutGrid, Moon, Globe, SlidersHorizontal,
  ChevronLeft, ChevronRight, ChevronDown, Clock, BookOpen, Zap, Target,
  Sparkles, Timer, Heart, Telescope, CalendarClock, Sunrise, MessageSquare, Layers,
} from "lucide-react";
import { useState, useEffect, type ComponentType } from "react";

interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}

interface NavGroup {
  id: string;
  label: string;
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  items: NavItem[];
}

const ROOT_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: Compass },
  { href: "/chat",      label: "Chat",      Icon: MessageSquare },
];

const NAV_GROUPS: NavGroup[] = [
  {
    id: "charts",
    label: "Charts",
    Icon: LayoutGrid,
    items: [
      { href: "/chart",                   label: "Jyotish Chart",      Icon: LayoutGrid },
      { href: "/chart/sudarshana-chakra", label: "Sudarshana Chakra",  Icon: Layers },
      { href: "/chemistry",               label: "Cosmic Chemistry",    Icon: Heart },
    ],
  },
  {
    id: "sky",
    label: "Sky",
    Icon: Telescope,
    items: [
      { href: "/sky-observer",          label: "Sky Observer",       Icon: Telescope },
      { href: "/transit",               label: "Transits",           Icon: Globe },
      { href: "/muhurta",               label: "Muhurta Finder",     Icon: Timer },
      { href: "/new-muhurta",           label: "Muhurta (new)",      Icon: CalendarClock },
      { href: "/purushartha-muhurta",   label: "Puruṣārtha Muhūrta", Icon: Sunrise },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    Icon: Moon,
    items: [
      { href: "/reports",          label: "My Reports",       Icon: Moon },
      { href: "/karma-timeline",   label: "Karma Timeline",   Icon: Clock },
      { href: "/life-blueprint",   label: "Life Blueprint",   Icon: BookOpen },
      { href: "/energy-blueprint", label: "Energy Blueprint", Icon: Zap },
      { href: "/purpose",          label: "Purpose Decoder",  Icon: Target },
      { href: "/shadow",           label: "Shadow Work",      Icon: Sparkles },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    Icon: SlidersHorizontal,
    items: [
      { href: "/settings/profile", label: "Settings", Icon: SlidersHorizontal },
    ],
  },
];

interface Props {
  userName: string;
  tier: string;
}

/** Inline SVG orbital compass — replaces the logo image file. */
function CompassGlyph() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="logo-compass-glyph"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="14.25" stroke="rgba(212,175,55,0.55)" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="9" stroke="rgba(212,175,55,0.20)" strokeWidth="0.75" />
      <line x1="16" y1="3" x2="16" y2="29" stroke="rgba(212,175,55,0.45)" strokeWidth="1" />
      <line x1="3" y1="16" x2="29" y2="16" stroke="rgba(212,175,55,0.30)" strokeWidth="1" />
      <circle cx="16" cy="16" r="2" fill="rgba(212,175,55,0.70)" />
      {/* North pointer */}
      <polygon points="16,5 14.5,13 16,11 17.5,13" fill="rgba(212,175,55,0.75)" />
    </svg>
  );
}

/** Detect which group ID contains the currently active route. */
function getActiveGroupId(pathname: string): string | null {
  for (const group of NAV_GROUPS) {
    if (group.items.some((item) =>
      item.href === pathname || (item.href !== "/dashboard" && pathname.startsWith(item.href))
    )) {
      return group.id;
    }
  }
  return null;
}

const DEFAULT_GROUPS: Record<string, boolean> = {
  charts: false,
  sky: false,
  reports: false,
  settings: false,
};

export function SidebarNav({ userName, tier }: Props) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(DEFAULT_GROUPS);

  const initials = userName
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  // Restore compact + group state; auto-expand active group
  useEffect(() => {
    const compact = localStorage.getItem("sidebar_compact") === "true";
    setIsCompact(compact);
    document.body.setAttribute("data-sidebar", compact ? "compact" : "expanded");

    let stored: Record<string, boolean> = { ...DEFAULT_GROUPS };
    try {
      const raw = localStorage.getItem("sidebar_groups");
      if (raw) stored = { ...DEFAULT_GROUPS, ...JSON.parse(raw) };
    } catch { /* ignore */ }

    const activeId = getActiveGroupId(pathname);
    if (activeId) stored[activeId] = true;
    setOpenGroups(stored);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-expand the active group whenever route changes
  useEffect(() => {
    const activeId = getActiveGroupId(pathname);
    if (!activeId) return;
    setOpenGroups((prev) => {
      if (prev[activeId]) return prev;
      const next = { ...prev, [activeId]: true };
      localStorage.setItem("sidebar_groups", JSON.stringify(next));
      return next;
    });
  }, [pathname]);

  function toggleCompact() {
    const next = !isCompact;
    setIsCompact(next);
    localStorage.setItem("sidebar_compact", String(next));
    document.body.setAttribute("data-sidebar", next ? "compact" : "expanded");
  }

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("sidebar_groups", JSON.stringify(next));
      return next;
    });
  }

  const Logo = ({ onClick, compact }: { onClick?: () => void; compact?: boolean }) => (
    <Link href="/dashboard" className={`app-sidebar-logo${compact ? " compact" : ""}`} onClick={onClick}>
      <CompassGlyph />
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

  const NavGroups = ({ onItemClick, compact }: { onItemClick?: () => void; compact?: boolean }) => (
    <nav className="app-sidebar-nav">
      {/* Root standalone items */}
      {ROOT_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`app-sidebar-item${active ? " active" : ""}${compact ? " compact" : ""}`}
            onClick={onItemClick}
            title={compact ? label : undefined}
          >
            <span className="app-sidebar-item-icon"><Icon size={18} strokeWidth={1.5} /></span>
            {!compact && <span className="app-sidebar-item-label">{label}</span>}
          </Link>
        );
      })}

      {/* Grouped sections */}
      {NAV_GROUPS.map(({ id, label, Icon, items }) => {
        const isOpen = openGroups[id] ?? false;
        const hasActive = items.some((item) =>
          item.href === pathname || (item.href !== "/dashboard" && pathname.startsWith(item.href))
        );
        return (
          <div key={id} className="sidebar-group">
            <button
              type="button"
              className={`sidebar-group-header${hasActive ? " active" : ""}${compact ? " compact" : ""}`}
              onClick={() => !compact && toggleGroup(id)}
              aria-expanded={isOpen}
              title={compact ? label : undefined}
            >
              <span className="app-sidebar-item-icon"><Icon size={18} strokeWidth={1.5} /></span>
              {!compact && (
                <>
                  <span className="sidebar-group-label">{label}</span>
                  <ChevronDown
                    size={14}
                    strokeWidth={2}
                    className={`sidebar-group-chevron${isOpen ? " open" : ""}`}
                  />
                </>
              )}
            </button>

            {!compact && (
              <div className={`sidebar-group-items${isOpen ? " open" : ""}`}>
                {items.map(({ href, label: itemLabel, Icon: ItemIcon }) => {
                  const active =
                    href === pathname ||
                    (href !== "/dashboard" && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`app-sidebar-item sidebar-item-child${active ? " active" : ""}`}
                      onClick={onItemClick}
                    >
                      <span className="app-sidebar-item-icon"><ItemIcon size={16} strokeWidth={1.5} /></span>
                      <span className="app-sidebar-item-label">{itemLabel}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
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
        <NavGroups compact={isCompact} />
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
        <NavGroups onItemClick={() => setDrawerOpen(false)} />
        <UserBadge />
      </div>
    </>
  );
}

"use client";

/**
 * components/layout/Nav.tsx
 * Fixed top navigation bar.
 * Logo: Cormorant Garamond + amber dot separator.
 * Links: mist color, hover gold.
 * CTA: amber border button.
 */

import Link from "next/link";
import Image from "next/image";

interface NavProps {
  /** Which set of links to show: marketing site or dashboard */
  variant?: "marketing" | "dashboard";
}

const marketingLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
];

const dashboardLinks = [
  { label: "My Chart", href: "/report" },
  { label: "My Profile", href: "/settings/profile" },
  { label: "Consultations", href: "/consultations" },
  { label: "Account", href: "/account" },
];

export function Nav({ variant = "marketing" }: NavProps) {
  const links = variant === "dashboard" ? dashboardLinks : marketingLinks;

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.4rem 3rem",
        background: "linear-gradient(to bottom, rgba(13,18,32,0.95), transparent)",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Image
          src="/crossroads-compass-logo-2.svg"
          alt="Crossroads Compass"
          width={200}
          height={62}
          priority
          style={{ height: 42, width: "auto" }}
        />
      </Link>

      {/* Links — hidden on mobile (max-width 900px) */}
      <ul
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          listStyle: "none",
        }}
        className="nav-links-list"
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="nav-link">
              {link.label}
            </Link>
          </li>
        ))}
        {variant === "marketing" && (
          <li>
            <Link href="/login" className="nav-cta">
              Sign in
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

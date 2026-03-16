/**
 * components/layout/PageLayout.tsx
 *
 * Canonical page wrapper for the v4 Digital Grimoire design system.
 * Use this for EVERY new authenticated page in app/(app)/.
 *
 * Provides:
 *   - Consistent max-width, padding, and flex-column gap (reuses .v4-wrap)
 *   - Optional page header: eyebrow label (mono/gold) + title (serif) + subtitle (sans)
 *   - Staggered entrance animation on the header (animate-enter-1)
 *   - Children are rendered below the header with the same gap rhythm
 *
 * Usage:
 *   <PageLayout eyebrow="Natal Chart" title="My Chart" subtitle="Your birth blueprint">
 *     <section className="animate-enter animate-enter-2">...</section>
 *   </PageLayout>
 *
 * DO NOT:
 *   - Add navigation or a sidebar — the app shell in app/(app)/layout.tsx handles that
 *   - Hardcode hex values — use CSS variables from app/globals.css
 *   - Use .dash-card / .dash-grid — those are legacy; use V4GlassCard instead
 *   - Add position:fixed elements — only the app shell may do that
 */

import React from "react";

interface PageLayoutProps {
  /** Short all-caps mono label above the title (e.g. "Natal Chart") */
  eyebrow?: string;
  /** Primary serif heading (e.g. "My Chart") */
  title?: string;
  /** Supporting sans-serif description line */
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: PageLayoutProps) {
  const hasHeader = eyebrow || title || subtitle;

  return (
    <div className={["v4-wrap", className].filter(Boolean).join(" ")}>
      {hasHeader && (
        <header className="page-layout-header animate-enter animate-enter-1">
          {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
          {title && <h1 className="page-title">{title}</h1>}
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </header>
      )}
      {children}
    </div>
  );
}

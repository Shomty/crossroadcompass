"use client";
// STATUS: done | Phase 4 Glimpse
/**
 * components/glimpse/GlimpseCTA.tsx
 * Three variants of the upgrade call-to-action button.
 *
 * primary   — Gold gradient button with glow (inside blur overlays)
 * secondary — Outlined gold button (after locked cards)
 * inline    — Text link with arrow (mid-content)
 */

import Link from "next/link";
import { trackGlimpse } from "@/lib/analytics/glimpseEvents";

interface GlimpseCTAProps {
  text?: string;
  variant?: "primary" | "secondary" | "inline";
  featureName: string;
  href?: string;
  onClick?: () => void;
}

export function GlimpseCTA({
  text = "Unlock full access",
  variant = "primary",
  featureName,
  href = "/pricing",
  onClick,
}: GlimpseCTAProps) {
  function handleClick() {
    trackGlimpse({ type: "glimpse_cta_click", feature: featureName, pattern: variant });
    trackGlimpse({ type: "glimpse_to_pricing", feature: featureName });
    onClick?.();
  }

  if (variant === "primary") {
    return (
      <Link
        href={href}
        onClick={handleClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 24px",
          borderRadius: 20,
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.06em",
          background: "linear-gradient(135deg, #c8873a, #e8b96a)",
          color: "#0d1220",
          boxShadow: "0 0 20px rgba(200,135,58,0.35)",
          transition: "box-shadow 0.2s",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.boxShadow =
            "0 0 32px rgba(200,135,58,0.6)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.boxShadow =
            "0 0 20px rgba(200,135,58,0.35)";
        }}
      >
        <span>◈</span>
        {text}
      </Link>
    );
  }

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        onClick={handleClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 20px",
          borderRadius: 20,
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.04em",
          border: "1px solid rgba(200,135,58,0.4)",
          color: "#e8b96a",
          background: "transparent",
          transition: "border-color 0.2s, background 0.2s",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,135,58,0.85)";
          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(200,135,58,0.07)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,135,58,0.4)";
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        }}
      >
        {text}
        <span>→</span>
      </Link>
    );
  }

  // inline
  return (
    <Link
      href={href}
      onClick={handleClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#c8873a",
        textDecoration: "none",
        transition: "opacity 0.2s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.8"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
    >
      {text}
      <span aria-hidden>→</span>
    </Link>
  );
}

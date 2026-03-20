"use client";
// STATUS: done | Phase 4 Glimpse
/**
 * components/glimpse/ShadowHeadline.tsx
 * Pattern 6 — The Shadow Headline.
 *
 * One devastating, accurate headline. Nothing else.
 * Large Cormorant Garamond typography. Dark background. Minimal.
 * The restraint IS the hook. No blur needed.
 */

import { useEffect } from "react";
import { GlimpseCTA } from "./GlimpseCTA";
import { trackGlimpse } from "@/lib/analytics/glimpseEvents";

interface ShadowHeadlineProps {
  /** The core shadow theme headline — 4-8 words, maximum psychological impact */
  headline: string;
  /** 1-2 sentences of context (optional) */
  subtext?: string;
  featureName: string;
  ctaText?: string;
  ctaHref?: string;
}

export function ShadowHeadline({
  headline,
  subtext,
  featureName,
  ctaText = "Explore your shadow map",
  ctaHref = "/pricing",
}: ShadowHeadlineProps) {
  useEffect(() => {
    trackGlimpse({ type: "glimpse_view", feature: featureName, pattern: "shadow_headline" });
  }, [featureName]);

  return (
    <div
      className="rounded-xl px-6 py-8 text-center space-y-5"
      style={{
        background: "rgba(6, 8, 16, 0.85)",
        border: "1px solid rgba(200, 135, 58, 0.12)",
      }}
    >
      {/* Eyebrow label */}
      <p
        className="text-xs font-semibold tracking-[0.3em] uppercase"
        style={{ color: "rgba(200, 135, 58, 0.7)" }}
      >
        Shadow Work
      </p>

      {/* Main headline — large, Cormorant Garamond */}
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
          lineHeight: 1.2,
          fontWeight: 600,
          color: "#f0dca0",
          letterSpacing: "-0.01em",
        }}
      >
        {headline}
      </h2>

      {subtext && (
        <p
          className="text-sm leading-relaxed max-w-sm mx-auto"
          style={{ color: "rgba(240, 220, 160, 0.6)" }}
        >
          {subtext}
        </p>
      )}

      {/* Inline CTA — subtle, respects the minimal aesthetic */}
      <div className="pt-2">
        <GlimpseCTA
          text={ctaText}
          variant="inline"
          featureName={featureName}
          href={ctaHref}
        />
      </div>
    </div>
  );
}

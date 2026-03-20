"use client";
// STATUS: done | Phase 4 Glimpse
/**
 * components/glimpse/GlimpseBlur.tsx
 * Pattern 1 — The Blur Wall.
 *
 * Renders a visible preview paragraph followed by the actual premium content
 * blurred behind a gradient overlay. The blurred content is REAL content
 * (not placeholder) so users feel the depth.
 */

import { useEffect } from "react";
import { GlimpseCTA } from "./GlimpseCTA";
import { trackGlimpse } from "@/lib/analytics/glimpseEvents";

interface GlimpseBlurProps {
  /** First paragraph shown in full (visible, readable) */
  preview: string;
  /** Optional section header above the preview */
  sectionTitle?: string;
  /** Real premium content rendered below preview but blurred */
  children?: React.ReactNode;
  /** Feature identifier for analytics */
  featureName: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA link destination */
  ctaHref?: string;
}

export function GlimpseBlur({
  preview,
  sectionTitle,
  children,
  featureName,
  ctaText = "Unlock full access",
  ctaHref = "/pricing",
}: GlimpseBlurProps) {
  useEffect(() => {
    trackGlimpse({ type: "glimpse_view", feature: featureName, pattern: "blur_wall" });
  }, [featureName]);

  return (
    <div className="glimpse-blur-container" style={{ position: "relative" }}>
      {/* Visible preview section */}
      {sectionTitle && (
        <h3
          className="mb-3 text-sm font-semibold tracking-widest uppercase"
          style={{ color: "#c8873a" }}
        >
          {sectionTitle}
        </h3>
      )}
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: "rgba(240, 220, 160, 0.9)" }}
      >
        {preview}
      </p>

      {/* Blurred premium content */}
      {children && (
        <div style={{ position: "relative" }}>
          {/* The actual content — blurred */}
          <div
            aria-hidden="true"
            style={{
              maxHeight: 200,
              overflow: "hidden",
              position: "relative",
              filter: "blur(5px)",
              WebkitFilter: "blur(5px)",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            {children}
          </div>

          {/* Gradient fade overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(13,18,32,0.5) 40%, rgba(13,18,32,0.95) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* CTA centered at the bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <GlimpseCTA
              text={ctaText}
              variant="primary"
              featureName={featureName}
              href={ctaHref}
            />
          </div>
        </div>
      )}

      {/* If no children, just show the CTA below the preview */}
      {!children && (
        <div className="mt-4 flex justify-center">
          <GlimpseCTA
            text={ctaText}
            variant="primary"
            featureName={featureName}
            href={ctaHref}
          />
        </div>
      )}
    </div>
  );
}

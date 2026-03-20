"use client";
// STATUS: done | Phase 4 Glimpse
/**
 * components/glimpse/TimelineCliff.tsx
 * Pattern 4 — The Timeline Cliffhanger.
 *
 * Shows current period content in full.
 * Next period shows first 2 sentences, then fades out mid-sentence
 * creating psychological tension. "Continue reading..." CTA below the fade.
 */

import { useEffect } from "react";
import { GlimpseCTA } from "./GlimpseCTA";
import { trackGlimpse } from "@/lib/analytics/glimpseEvents";

interface TimelineCliffProps {
  /** Full text of the current (visible) period */
  currentContent: string;
  /** Title of the current period e.g. "Saturn Mahadasha (2019–2038)" */
  currentTitle: string;
  /** First 2 sentences of the next period — cut off mid-insight */
  nextPreview: string;
  /** Title of the next period e.g. "Mercury Mahadasha (2038–2055)" */
  nextTitle: string;
  featureName: string;
  ctaText?: string;
  ctaHref?: string;
}

export function TimelineCliff({
  currentContent,
  currentTitle,
  nextPreview,
  nextTitle,
  featureName,
  ctaText = "Continue reading your timeline",
  ctaHref = "/pricing",
}: TimelineCliffProps) {
  useEffect(() => {
    trackGlimpse({ type: "glimpse_view", feature: featureName, pattern: "timeline_cliff" });
  }, [featureName]);

  return (
    <div className="space-y-6">
      {/* Current period — fully visible */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "rgba(13, 18, 32, 0.7)",
          border: "1px solid rgba(200, 135, 58, 0.35)",
        }}
      >
        {/* Timeline dot */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: "linear-gradient(135deg, #c8873a, #e8b96a)",
                boxShadow: "0 0 8px rgba(200, 135, 58, 0.6)",
              }}
            />
            <div style={{ width: 1, height: 40, background: "rgba(200, 135, 58, 0.25)" }} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: "#c8873a" }}>
              Current Period
            </p>
            <p className="text-sm font-medium mb-2" style={{ color: "#f0dca0" }}>
              {currentTitle}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(240, 220, 160, 0.8)" }}>
              {currentContent}
            </p>
          </div>
        </div>
      </div>

      {/* Next period — cliffhanger */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "rgba(13, 18, 32, 0.5)",
          border: "1px solid rgba(200, 135, 58, 0.15)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: "rgba(200, 135, 58, 0.3)",
                border: "1px solid rgba(200, 135, 58, 0.4)",
              }}
            />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: "rgba(200, 135, 58, 0.6)" }}>
              Next Period
            </p>
            <p className="text-sm font-medium mb-3" style={{ color: "rgba(240, 220, 160, 0.7)" }}>
              {nextTitle}
            </p>

            {/* Cliffhanger text with fade-out mask */}
            <div style={{ position: "relative" }}>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "rgba(240, 220, 160, 0.65)",
                  // Fade text to transparent mid-sentence
                  WebkitMaskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
                  maskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
                }}
              >
                {nextPreview}
                {/* Ensure the text doesn't end cleanly — ellipsis creates tension */}
                {nextPreview && !nextPreview.endsWith("...") ? "..." : ""}
              </p>
            </div>

            {/* CTA below the cliff */}
            <div className="mt-4">
              <GlimpseCTA
                text={ctaText}
                variant="secondary"
                featureName={featureName}
                href={ctaHref}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

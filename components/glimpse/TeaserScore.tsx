"use client";
// STATUS: done | Phase 4 Glimpse
/**
 * components/glimpse/TeaserScore.tsx
 * Pattern 3 — The Teaser Score.
 *
 * Shows a compelling metric (e.g. "Alignment: 7.8/10") clearly.
 * Reveals one dimension in full. Locks the rest behind a frosted overlay.
 * "You're 78% compatible. Want to know WHY?" — the score IS the hook.
 */

import { useEffect } from "react";
import { GlimpseCTA } from "./GlimpseCTA";
import { trackGlimpse } from "@/lib/analytics/glimpseEvents";

interface TeaserScoreProps {
  score: number;
  maxScore: number;
  /** e.g. "Cosmic Chemistry" or "Daily Alignment" */
  label: string;
  /** The one revealed dimension name + value */
  revealedDimension: { name: string; value: string };
  /** Names of the locked dimensions */
  lockedDimensions: string[];
  featureName: string;
  ctaText?: string;
  ctaHref?: string;
}

export function TeaserScore({
  score,
  maxScore,
  label,
  revealedDimension,
  lockedDimensions,
  featureName,
  ctaText = "Unlock all dimensions",
  ctaHref = "/pricing",
}: TeaserScoreProps) {
  useEffect(() => {
    trackGlimpse({ type: "glimpse_view", feature: featureName, pattern: "teaser_score" });
  }, [featureName]);

  const percentage = Math.round((score / maxScore) * 100);

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{
        background: "rgba(13, 18, 32, 0.6)",
        border: "1px solid rgba(200, 135, 58, 0.2)",
      }}
    >
      {/* Main score display */}
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "#c8873a" }}>
          {label}
        </p>
        <div className="flex items-baseline justify-center gap-1">
          <span
            className="font-display font-semibold"
            style={{ fontSize: "3rem", lineHeight: 1, color: "#f0dca0" }}
          >
            {score.toFixed(1)}
          </span>
          <span className="text-lg" style={{ color: "rgba(240, 220, 160, 0.5)" }}>
            /{maxScore}
          </span>
        </div>
        {/* Progress arc / bar */}
        <div
          className="mt-2 mx-auto rounded-full overflow-hidden"
          style={{
            height: 4,
            width: "80%",
            background: "rgba(255,255,255,0.1)",
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${percentage}%`,
              background: "linear-gradient(90deg, #c8873a, #e8b96a)",
              transition: "width 1s ease-out",
            }}
          />
        </div>
      </div>

      {/* Revealed dimension */}
      <div
        className="rounded-lg p-3"
        style={{ background: "rgba(200, 135, 58, 0.08)", border: "1px solid rgba(200, 135, 58, 0.2)" }}
      >
        <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#c8873a" }}>
          {revealedDimension.name}
        </p>
        <p className="text-sm" style={{ color: "#f0dca0" }}>
          {revealedDimension.value}
        </p>
      </div>

      {/* Locked dimensions (frosted) */}
      {lockedDimensions.length > 0 && (
        <div className="relative space-y-2">
          {lockedDimensions.map((dim) => (
            <div
              key={dim}
              className="rounded-lg p-3 flex items-center justify-between"
              style={{
                background: "rgba(13, 18, 32, 0.4)",
                border: "1px dashed rgba(200, 135, 58, 0.2)",
                filter: "blur(1px)",
                userSelect: "none",
              }}
              aria-hidden="true"
            >
              <span className="text-xs uppercase tracking-wider" style={{ color: "rgba(240, 220, 160, 0.4)" }}>
                {dim}
              </span>
              <span style={{ color: "rgba(200, 135, 58, 0.5)" }}>🔒</span>
            </div>
          ))}

          {/* Frosted overlay over locked dimensions */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-lg"
            style={{
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
              background: "rgba(13, 18, 32, 0.3)",
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
    </div>
  );
}

"use client";
// STATUS: done | Phase 4 Glimpse
/**
 * components/glimpse/LockedInsightCard.tsx
 * Pattern 2 — The Locked Insight Counter.
 *
 * Card showing a specific locked insight (e.g. "Saturn Insight").
 * Same dimensions as unlocked cards. Dashed amber border. Lock icon.
 * Clicking fires analytics and navigates to /pricing.
 */

import Link from "next/link";
import { trackGlimpse } from "@/lib/analytics/glimpseEvents";

interface LockedInsightCardProps {
  /** Icon element (planet icon, emoji, SVG, etc.) */
  icon?: React.ReactNode;
  /** Label shown e.g. "Saturn Insight" */
  label: string;
  /** One-line teaser shown below the label */
  teaser?: string;
  featureName: string;
  href?: string;
}

export function LockedInsightCard({
  icon,
  label,
  teaser,
  featureName,
  href = "/pricing",
}: LockedInsightCardProps) {
  function handleClick() {
    trackGlimpse({ type: "glimpse_cta_click", feature: featureName, pattern: "locked_card" });
    trackGlimpse({ type: "glimpse_to_pricing", feature: featureName });
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="block rounded-xl p-4 transition-all duration-200"
      style={{
        border: "1px dashed rgba(200, 135, 58, 0.3)",
        background: "rgba(13, 18, 32, 0.4)",
        opacity: 0.75,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.opacity = "0.95";
        el.style.borderColor = "rgba(200, 135, 58, 0.65)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.opacity = "0.75";
        el.style.borderColor = "rgba(200, 135, 58, 0.3)";
      }}
      aria-label={`${label} — locked. Upgrade to unlock.`}
    >
      <div className="flex items-start gap-3">
        {/* Planet icon */}
        {icon && (
          <span className="text-xl leading-none flex-shrink-0 opacity-50">{icon}</span>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-sm font-medium truncate"
              style={{ color: "rgba(240, 220, 160, 0.7)" }}
            >
              {label}
            </span>
            {/* Lock icon */}
            <span style={{ color: "#c8873a", flexShrink: 0 }} aria-hidden="true">
              🔒
            </span>
          </div>

          {teaser && (
            <p
              className="mt-1 text-xs leading-relaxed line-clamp-1"
              style={{ color: "rgba(240, 220, 160, 0.4)" }}
            >
              {teaser}
            </p>
          )}

          <p
            className="mt-1.5 text-xs font-medium"
            style={{ color: "#c8873a" }}
          >
            Unlock with Core →
          </p>
        </div>
      </div>
    </Link>
  );
}

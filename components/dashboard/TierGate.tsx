/**
 * components/dashboard/TierGate.tsx
 * Blur overlay + upgrade CTA for locked / tier-gated content.
 * FRONTEND.md §12 — locked content: opacity 0.4, filter blur(4px),
 * upgrade CTA overlaid, centered, var(--amber) border button.
 */

import Link from "next/link";

interface TierGateProps {
  /** The content to display (blurred when locked) */
  children: React.ReactNode;
  /** Whether the content is locked for this user */
  locked: boolean;
  /** Label shown above the upgrade button */
  label?: string;
  /** CTA button text */
  ctaText?: string;
  /** Where the CTA links to */
  ctaHref?: string;
}

export function TierGate({
  children,
  locked,
  label = "Core Plan Required",
  ctaText = "Unlock Access",
  ctaHref = "/subscribe",
}: TierGateProps) {
  if (!locked) return <>{children}</>;

  return (
    <div className="tier-gate-wrap">
      {/* Blurred content */}
      <div className="tier-gate-blurred" aria-hidden="true">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="tier-gate-overlay">
        <span className="tier-gate-label">◈ {label}</span>
        <Link href={ctaHref} className="tier-gate-btn">
          {ctaText}
        </Link>
      </div>
    </div>
  );
}

"use client";
// STATUS: done | Phase 4 Glimpse
/**
 * components/glimpse/GlimpseGate.tsx
 * Primary wrapper for tier-gated content.
 *
 * Checks the user's subscription tier and renders:
 *   - freeContent    → FREE users
 *   - glimpseContent → FREE users with teaser (same as freeContent unless specified)
 *   - premiumContent → CORE / VIP users
 *
 * The component is client-only so it can read session state.
 * For server components, use the TierGate in components/dashboard/TierGate.tsx.
 */

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { trackGlimpse } from "@/lib/analytics/glimpseEvents";
import type { SubscriptionTier } from "@/types";

interface GlimpseGateProps {
  /** Minimum tier required to see premiumContent */
  requiredTier: "CORE" | "VIP";
  /** Feature identifier for analytics */
  featureName: string;
  /** What FREE users always see (typically a brief intro or chart) */
  freeContent?: React.ReactNode;
  /**
   * The teaser / glimpse content shown to FREE users.
   * If omitted, freeContent is used as the glimpse.
   */
  glimpseContent?: React.ReactNode;
  /** Full premium content for CORE / VIP users */
  premiumContent: React.ReactNode;
  /** Fallback while session is loading */
  loadingFallback?: React.ReactNode;
}

/** Tier hierarchy for comparison */
const TIER_RANK: Record<SubscriptionTier, number> = {
  FREE: 0,
  CORE: 1,
  VIP: 2,
};

export function GlimpseGate({
  requiredTier,
  featureName,
  freeContent,
  glimpseContent,
  premiumContent,
  loadingFallback,
}: GlimpseGateProps) {
  const { data: session, status } = useSession();

  // The tier stored on the session user object
  const userTier = (session?.user as { subscriptionTier?: SubscriptionTier } | undefined)
    ?.subscriptionTier ?? "FREE";

  const hasAccess = TIER_RANK[userTier] >= TIER_RANK[requiredTier];

  useEffect(() => {
    if (status === "authenticated" && !hasAccess) {
      trackGlimpse({ type: "glimpse_view", feature: featureName, pattern: "gate" });
    }
  }, [status, hasAccess, featureName]);

  if (status === "loading") {
    return <>{loadingFallback ?? null}</>;
  }

  if (hasAccess) {
    return <>{premiumContent}</>;
  }

  // FREE user — show glimpse (or freeContent as fallback)
  const teaserContent = glimpseContent ?? freeContent;
  return <>{teaserContent}</>;
}

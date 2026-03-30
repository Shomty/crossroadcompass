"use client";

/**
 * FE-10 — primary daily insight card (implementation shared with CosmicGuidanceCard).
 */
import { CosmicGuidanceCard } from "./CosmicGuidanceCard";

export function DailyInsightCard(props: React.ComponentProps<typeof CosmicGuidanceCard>) {
  return <CosmicGuidanceCard {...props} />;
}

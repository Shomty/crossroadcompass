"use client";
// STATUS: done | Phase 5 Feature Pages
/**
 * components/insights/KarmaTimeline.tsx
 * Scrollable Vimshottari Dasha Mahadasha timeline.
 *
 * FREE:  current period fully shown. Next period: TimelineCliff cliffhanger.
 *        All other periods: title + dates only.
 * CORE+: all periods shown with static guidance. AI insight loaded for current period.
 */

import { useEffect, useState } from "react";
import { DashaPeriodCard } from "./DashaPeriodCard";
import { TimelineCliff } from "@/components/glimpse/TimelineCliff";
import { GlimpseCTA } from "@/components/glimpse/GlimpseCTA";
import type { SubscriptionTier } from "@/types";

interface DashaPeriod {
  id: string;
  planetName: string;
  startDate: Date;
  endDate: Date;
}

interface KarmaTimelineProps {
  periods: DashaPeriod[];
  currentPeriodId: string | null;
  userTier: SubscriptionTier;
}

const DASHA_THEME: Record<string, string> = {
  Saturn:  "Karma · Discipline · Endurance",
  Jupiter: "Wisdom · Expansion · Grace",
  Mars:    "Action · Courage · Drive",
  Sun:     "Identity · Authority · Purpose",
  Moon:    "Emotion · Intuition · Nurture",
  Mercury: "Intellect · Communication · Adaptability",
  Venus:   "Beauty · Pleasure · Abundance",
  Rahu:    "Desire · Illusion · Transformation",
  Ketu:    "Liberation · Detachment · Spirituality",
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function KarmaTimeline({ periods, currentPeriodId, userTier }: KarmaTimelineProps) {
  const isPaid = userTier === "CORE" || userTier === "VIP";
  const [currentInsight, setCurrentInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // Find current and next period indices
  const currentIdx = currentPeriodId
    ? periods.findIndex((p) => p.id === currentPeriodId)
    : -1;
  const nextIdx = currentIdx >= 0 && currentIdx < periods.length - 1
    ? currentIdx + 1
    : -1;

  // Load AI insight for current period
  useEffect(() => {
    if (currentIdx < 0) return;
    setInsightLoading(true);
    fetch("/api/insights/dasha", { method: "POST" })
      .then((r) => r.json())
      .then((d) => { if (d.insight) setCurrentInsight(d.insight); })
      .catch(() => {/* fail silently */})
      .finally(() => setInsightLoading(false));
  }, [currentIdx]);

  if (periods.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          fontSize: 14, color: "var(--mist, rgba(255,255,255,0.4))", lineHeight: 1.65,
        }}>
          No Dasha periods found. Complete your birth profile to generate your Karma Timeline.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {periods.map((period, idx) => {
        const planetName = cap(period.planetName);
        const isCurrent = period.id === currentPeriodId;
        const isNext = idx === nextIdx;
        const now = new Date();
        const status: "past" | "current" | "future" =
          isCurrent ? "current"
          : new Date(period.endDate) < now ? "past"
          : "future";

        // FREE: only show current period fully; next period as TimelineCliff; rest as collapsed
        if (!isPaid) {
          if (isCurrent) {
            return (
              <div key={period.id} style={{ animationDelay: `${idx * 0.05}s` }} className="animate-enter">
                <DashaPeriodCard
                  planet={period.planetName}
                  startDate={period.startDate}
                  endDate={period.endDate}
                  status="current"
                  insight={insightLoading ? "Reading the stars…" : currentInsight}
                  userTier={userTier}
                />
              </div>
            );
          }

          if (isNext) {
            const nextPlanetName = planetName;
            const nextTheme = DASHA_THEME[nextPlanetName] ?? "Reflection · Growth · Unfolding";
            return (
              <div key={period.id}>
                <TimelineCliff
                  currentTitle={currentIdx >= 0 ? `${cap(periods[currentIdx].planetName)} Mahadasha` : "Current Period"}
                  currentContent={currentInsight ?? `Your ${currentIdx >= 0 ? cap(periods[currentIdx].planetName) : ""} Mahadasha shapes how you experience the world right now. The themes of this period are woven into every major domain of your life — from your career to your closest relationships.`}
                  nextTitle={`${nextPlanetName} Mahadasha`}
                  nextPreview={`The ${nextPlanetName} period tends to bring ${nextTheme.toLowerCase()} into focus. Many who enter this phase notice a significant shift in their priorities and the quality of their attention. The seeds planted during this transition...`}
                  featureName="karma_timeline"
                  ctaText="See your full Karma Timeline"
                  ctaHref="/pricing"
                />
              </div>
            );
          }

          // Past and far-future periods — collapsed for FREE
          return (
            <div key={period.id}>
              <DashaPeriodCard
                planet={period.planetName}
                startDate={period.startDate}
                endDate={period.endDate}
                status={status}
                userTier={userTier}
              />
            </div>
          );
        }

        // CORE/VIP: render all periods with full info
        return (
          <div key={period.id} className="animate-enter" style={{ animationDelay: `${Math.min(idx, 8) * 0.04}s` }}>
            <DashaPeriodCard
              planet={period.planetName}
              startDate={period.startDate}
              endDate={period.endDate}
              status={status}
              insight={isCurrent ? (insightLoading ? "Reading the stars…" : currentInsight) : null}
              userTier={userTier}
            />
          </div>
        );
      })}

      {/* Upgrade CTA at the bottom for FREE users */}
      {!isPaid && (
        <div style={{ textAlign: "center", padding: "2rem 0 1rem" }}>
          <GlimpseCTA
            text="Unlock your full Karma Timeline"
            variant="primary"
            featureName="karma_timeline_bottom"
            href="/pricing"
          />
        </div>
      )}
    </div>
  );
}

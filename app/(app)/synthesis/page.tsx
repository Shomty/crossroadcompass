// STATUS: done | Synthesis Engine Phase 4.6
/**
 * app/(app)/synthesis/page.tsx
 * PageLayout + Life Blueprint rhythm: section gap 14, chart-variant-toggle tabs, ChapterCard-style tab headers.
 */

"use client";

import { useState, useEffect } from "react";
import type { SynthesisResult, OpportunityScores, TransitTimeline, VedicDashaTimeline } from "@/types";
import { PageLayout } from "@/components/layout/PageLayout";
import { SynthesisDashboard } from "@/components/synthesis/SynthesisDashboard";
import { WesternTransitView } from "@/components/synthesis/WesternTransitView";
import { VedicDashaView } from "@/components/synthesis/VedicDashaView";
import { ConvergenceTimeline } from "@/components/synthesis/ConvergenceTimeline";
import { OpportunityScorecardView } from "@/components/synthesis/OpportunityScorecardView";
import { SynthesisPeriodicReport } from "@/components/synthesis/SynthesisPeriodicReport";
import { NatalAnalysisView } from "@/components/synthesis/NatalAnalysisView";
import { SynthesisTabBar, type SynthesisTabId } from "@/components/synthesis/SynthesisTabBar";
import { SynthesisTabHeader } from "@/components/synthesis/SynthesisTabHeader";
import { calculateOpportunityScores } from "@/lib/astro/opportunityScoreService";
import {
  synthesisBodyMuted,
  synthesisPrimaryCta,
} from "@/components/synthesis/synthesisPanelClasses";

const BP_PANEL = {
  borderRadius: 12,
  background: "rgba(13,18,32,0.5)",
  border: "1px solid rgba(200,135,58,0.12)",
} as const;

const BP_PANEL_SOFT = {
  borderRadius: 12,
  background: "rgba(13,18,32,0.5)",
  border: "1px solid rgba(200,135,58,0.12)",
} as const;

const TAB_BAR_ITEMS: Array<{ id: SynthesisTabId; label: string }> = [
  { id: "dashboard", label: "◆ Dashboard" },
  { id: "natal-analysis", label: "◈ Natal Analysis" },
  { id: "reports", label: "✦ Reports" },
  { id: "western", label: "◇ Western Transits" },
  { id: "vedic", label: "◇ Vedic Dasha" },
  { id: "convergence", label: "◇ Convergence" },
  { id: "scorecard", label: "◆ Opportunities" },
];

const TAB_HEADERS: Record<
  SynthesisTabId,
  { glyph: string; eyebrow: string; title: string; subtitle?: string }
> = {
  dashboard: {
    glyph: "◆",
    eyebrow: "Overview",
    title: "Dashboard",
    subtitle:
      "Current timing, convergence snapshot, and upcoming synthesis events at a glance.",
  },
  "natal-analysis": {
    glyph: "◈",
    eyebrow: "Trait engine",
    title: "Natal analysis",
    subtitle:
      "Dual-system trait scores, alignment, and narrative layers from your Western and Vedic charts.",
  },
  reports: {
    glyph: "✦",
    eyebrow: "Reports",
    title: "Synthesis reports",
    subtitle:
      "AI-generated insights bridging your Western and Vedic charts across different time horizons.",
  },
  western: {
    glyph: "◇",
    eyebrow: "Tropical",
    title: "Western transits",
    subtitle: "30-day transit timeline with key life-stage events and daily aspects.",
  },
  vedic: {
    glyph: "◇",
    eyebrow: "Jyotish",
    title: "Vedic dasha",
    subtitle: "Vimshottari timeline with current mahadasha, antardasha, and period strength.",
  },
  convergence: {
    glyph: "◇",
    eyebrow: "Merged window",
    title: "Convergence",
    subtitle: "Dates where Western transits and Vedic timing reinforce the same themes.",
  },
  scorecard: {
    glyph: "◆",
    eyebrow: "Life areas",
    title: "Opportunities",
    subtitle: "Relative timing strength across career, love, relocation, health, and spirituality.",
  },
};

export default function SynthesisPage() {
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [transitTimeline, setTransitTimeline] = useState<TransitTimeline | null>(null);
  const [dashaTimeline, setDashaTimeline] = useState<VedicDashaTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SynthesisTabId>("dashboard");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const synthRes = await fetch("/api/chart/synthesis");
        if (!synthRes.ok) throw new Error("Failed to load synthesis");
        const synthData = (await synthRes.json()) as SynthesisResult;
        setSynthesis(synthData);

        const today = new Date().toISOString().split("T")[0];
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const transitRes = await fetch(`/api/chart/western-transits?start=${today}&end=${endDate}`);
        if (transitRes.ok) {
          const transitData = (await transitRes.json()) as TransitTimeline;
          setTransitTimeline(transitData);
        }

        const dashaRes = await fetch("/api/chart/dasha-timeline");
        if (dashaRes.ok) {
          const dashaData = (await dashaRes.json()) as VedicDashaTimeline;
          setDashaTimeline(dashaData);
        }
      } catch (err) {
        console.error("[SynthesisPage] Error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [refresh]);

  const layoutProps = {
    eyebrow: "Dharma Synthesis",
    title: "Synthesis Engine",
    subtitle: "Unified view of Western and Vedic astrology convergence",
  };

  if (loading) {
    return (
      <PageLayout {...layoutProps}>
        <section
          className="animate-enter animate-enter-2 flex flex-col items-center justify-center gap-5 py-20"
          style={{ ...BP_PANEL_SOFT, textAlign: "center", padding: "4rem 1.5rem" }}
        >
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "rgba(200,135,58,0.45)" }}
            aria-hidden
          />
          <p className="text-sm leading-relaxed" style={{ ...synthesisBodyMuted, margin: 0 }}>
            Loading synthesis…
          </p>
        </section>
      </PageLayout>
    );
  }

  if (error || !synthesis) {
    return (
      <PageLayout {...layoutProps}>
        <section
          className="animate-enter animate-enter-2 flex flex-col items-center justify-center gap-5 py-16"
          style={{ ...BP_PANEL_SOFT, textAlign: "center", padding: "3rem 1.5rem" }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{
              fontFamily: synthesisBodyMuted.fontFamily,
              lineHeight: 1.65,
              margin: 0,
              maxWidth: 420,
              color: "rgba(248,113,113,0.92)",
            }}
          >
            {error || "Failed to load synthesis"}
          </p>
          <button type="button" style={synthesisPrimaryCta} onClick={() => setRefresh((r) => r + 1)}>
            Try again
          </button>
        </section>
      </PageLayout>
    );
  }

  const opportunityScores: OpportunityScores = calculateOpportunityScores(synthesis);
  const header = TAB_HEADERS[activeTab];

  return (
    <PageLayout {...layoutProps}>
      <section className="animate-enter animate-enter-2 flex flex-col" style={{ gap: 14 }}>
        <div style={{ ...BP_PANEL, padding: "12px 14px 14px" }}>
          <SynthesisTabBar tabs={TAB_BAR_ITEMS} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div style={{ ...BP_PANEL, padding: "16px 16px 20px" }}>
          <SynthesisTabHeader
            glyph={header.glyph}
            eyebrow={header.eyebrow}
            title={header.title}
            subtitle={header.subtitle}
          />

          <div className="flex flex-col gap-4">
            {activeTab === "dashboard" && (
              <SynthesisDashboard
                synthesis={synthesis}
                opportunityScores={opportunityScores}
                onRecalcComplete={() => setRefresh((r) => r + 1)}
              />
            )}

            {activeTab === "natal-analysis" && <NatalAnalysisView synthesis={synthesis} />}

            {activeTab === "reports" && <SynthesisPeriodicReport />}

            {activeTab === "western" && transitTimeline && (
              <WesternTransitView transitTimeline={transitTimeline} />
            )}

            {activeTab === "western" && !transitTimeline && (
              <p className="text-sm" style={{ ...synthesisBodyMuted, margin: 0 }}>
                Western transit data is not available yet.
              </p>
            )}

            {activeTab === "vedic" && dashaTimeline && (
              <VedicDashaView
                dashaTimeline={dashaTimeline}
                currentMahaDasha={synthesis.currentMahaDasha}
                currentAntarDasha={synthesis.currentAntarDasha}
              />
            )}

            {activeTab === "vedic" && !dashaTimeline && (
              <p className="text-sm" style={{ ...synthesisBodyMuted, margin: 0 }}>
                Vedic dasha timeline is not available yet.
              </p>
            )}

            {activeTab === "convergence" && (
              <ConvergenceTimeline events={synthesis.convergenceWindow} />
            )}

            {activeTab === "scorecard" && (
              <OpportunityScorecardView scores={opportunityScores} />
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

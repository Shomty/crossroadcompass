// STATUS: done | Synthesis Engine Phase 4.6
/**
 * app/(app)/synthesis/page.tsx
 * Full-page synthesis dashboard — STYLE_GUIDE.md (PageLayout, V4GlassCard violetGlow, inner panels).
 */

"use client";

import { useState, useEffect } from "react";
import type { SynthesisResult, OpportunityScores, TransitTimeline, VedicDashaTimeline } from "@/types";
import { PageLayout } from "@/components/layout/PageLayout";
import { V4GlassCard } from "@/components/v4/V4GlassCard";
import { SynthesisDashboard } from "@/components/synthesis/SynthesisDashboard";
import { WesternTransitView } from "@/components/synthesis/WesternTransitView";
import { VedicDashaView } from "@/components/synthesis/VedicDashaView";
import { ConvergenceTimeline } from "@/components/synthesis/ConvergenceTimeline";
import { OpportunityScorecardView } from "@/components/synthesis/OpportunityScorecardView";
import { SynthesisPeriodicReport } from "@/components/synthesis/SynthesisPeriodicReport";
import { NatalAnalysisView } from "@/components/synthesis/NatalAnalysisView";
import { calculateOpportunityScores } from "@/lib/astro/opportunityScoreService";
import { synthesisPrimaryCta, synthesisTitleCinzel } from "@/components/synthesis/synthesisPanelClasses";

type TabType = "dashboard" | "natal-analysis" | "western" | "vedic" | "convergence" | "scorecard" | "reports";

const TAB_BAR_BTN =
  "whitespace-nowrap rounded-t-lg border-b-2 px-3 py-2.5 text-[11px] uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,95,0.35)]";

export default function SynthesisPage() {
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [transitTimeline, setTransitTimeline] = useState<TransitTimeline | null>(null);
  const [dashaTimeline, setDashaTimeline] = useState<VedicDashaTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
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
        <section className="animate-enter animate-enter-2 flex flex-col items-center justify-center gap-4 py-24">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "rgba(200,135,58,0.45)" }}
            aria-hidden
          />
          <p className="page-subtitle text-center text-sm">Loading synthesis…</p>
        </section>
      </PageLayout>
    );
  }

  if (error || !synthesis) {
    return (
      <PageLayout {...layoutProps}>
        <section className="animate-enter animate-enter-2 flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-center text-sm text-red-300/90">{error || "Failed to load synthesis"}</p>
          <button type="button" style={synthesisPrimaryCta} onClick={() => setRefresh((r) => r + 1)}>
            Try again
          </button>
        </section>
      </PageLayout>
    );
  }

  const opportunityScores: OpportunityScores = calculateOpportunityScores(synthesis);

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: "dashboard", label: "Dashboard", icon: "◆" },
    { id: "natal-analysis", label: "Natal Analysis", icon: "◈" },
    { id: "reports", label: "Reports", icon: "✦" },
    { id: "western", label: "Western Transits", icon: "◇" },
    { id: "vedic", label: "Vedic Dasha", icon: "◇" },
    { id: "convergence", label: "Convergence", icon: "◇" },
    { id: "scorecard", label: "Opportunities", icon: "◆" },
  ];

  return (
    <PageLayout {...layoutProps}>
      <section className="animate-enter animate-enter-2 flex flex-col gap-6">
        <V4GlassCard violetGlow>
          <div className="mb-6 flex flex-wrap gap-1 border-b border-white/10 pb-px">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={TAB_BAR_BTN}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    borderBottomColor: active ? "rgba(200,135,58,0.5)" : "transparent",
                    background: active ? "rgba(200,135,58,0.08)" : "transparent",
                    color: active
                      ? "var(--cream, rgba(255,255,255,0.92))"
                      : "var(--mist, rgba(255,255,255,0.5))",
                  }}
                >
                  <span className="mr-1 opacity-90">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-6">
            {activeTab === "dashboard" && (
              <SynthesisDashboard
                synthesis={synthesis}
                opportunityScores={opportunityScores}
                onRecalcComplete={() => setRefresh((r) => r + 1)}
              />
            )}

            {activeTab === "natal-analysis" && (
              <NatalAnalysisView synthesis={synthesis} />
            )}

            {activeTab === "reports" && (
              <div>
                <h2 className="mb-1 text-lg font-normal" style={synthesisTitleCinzel}>
                  Synthesis reports
                </h2>
                <p className="page-subtitle mb-6 text-sm">
                  AI-generated insights bridging your Western and Vedic charts across different time horizons.
                </p>
                <SynthesisPeriodicReport />
              </div>
            )}

            {activeTab === "western" && transitTimeline && (
              <WesternTransitView transitTimeline={transitTimeline} />
            )}

            {activeTab === "western" && !transitTimeline && (
              <p className="page-subtitle text-sm">Western transit data is not available yet.</p>
            )}

            {activeTab === "vedic" && dashaTimeline && (
              <VedicDashaView
                dashaTimeline={dashaTimeline}
                currentMahaDasha={synthesis.currentMahaDasha}
                currentAntarDasha={synthesis.currentAntarDasha}
              />
            )}

            {activeTab === "vedic" && !dashaTimeline && (
              <p className="page-subtitle text-sm">Vedic dasha timeline is not available yet.</p>
            )}

            {activeTab === "convergence" && (
              <ConvergenceTimeline events={synthesis.convergenceWindow} />
            )}

            {activeTab === "scorecard" && (
              <OpportunityScorecardView scores={opportunityScores} />
            )}
          </div>
        </V4GlassCard>
      </section>
    </PageLayout>
  );
}

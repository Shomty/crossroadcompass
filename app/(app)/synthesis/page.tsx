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
          className="animate-enter animate-enter-2"
          style={{
            textAlign: "center",
            padding: "5rem 1rem",
            background: "rgba(13,18,32,0.5)",
            borderRadius: 16,
            border: "1px solid rgba(200,135,58,0.12)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 20, color: "rgba(200,135,58,0.4)" }}>◈</div>
          <h2
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 22,
              fontWeight: 400,
              color: "rgba(255,255,255,0.9)",
              marginBottom: 12,
            }}
          >
            Aligning your charts
          </h2>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.65,
              maxWidth: 400,
              margin: "0 auto 28px",
            }}
          >
            Synthesising your Western and Vedic data…
          </p>
          <div
            className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "rgba(200,135,58,0.45)" }}
            aria-hidden
          />
        </section>
      </PageLayout>
    );
  }

  if (error || !synthesis) {
    return (
      <PageLayout {...layoutProps}>
        <section
          className="animate-enter animate-enter-2"
          style={{
            textAlign: "center",
            padding: "5rem 1rem",
            background: "rgba(13,18,32,0.5)",
            borderRadius: 16,
            border: "1px solid rgba(200,135,58,0.12)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 20, color: "rgba(200,135,58,0.4)" }}>◇</div>
          <h2
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 22,
              fontWeight: 400,
              color: "rgba(255,255,255,0.9)",
              marginBottom: 12,
            }}
          >
            Synthesis unavailable
          </h2>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 14,
              color: "rgba(248,113,113,0.75)",
              lineHeight: 1.65,
              maxWidth: 420,
              margin: "0 auto 28px",
            }}
          >
            {error || "Unable to load your synthesis data. Check your birth profile and try again."}
          </p>
          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #c8873a, #e8b96a)",
              color: "#0d1220",
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 600,
            }}
            onClick={() => setRefresh((r) => r + 1)}
          >
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
      <section className="animate-enter animate-enter-2 flex flex-col" style={{ gap: 20 }}>
        <SynthesisTabBar tabs={TAB_BAR_ITEMS} activeTab={activeTab} onChange={setActiveTab} />

        <SynthesisTabHeader
          glyph={header.glyph}
          eyebrow={header.eyebrow}
          title={header.title}
          subtitle={header.subtitle}
        />

        <div className="flex flex-col gap-6">
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
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  background: "rgba(13,18,32,0.5)",
                  borderRadius: 12,
                  border: "1px solid rgba(200,135,58,0.12)",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16, color: "rgba(200,135,58,0.4)" }}>◇</div>
                <p
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: 16,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: 8,
                  }}
                >
                  Transit data unavailable
                </p>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.65,
                    maxWidth: 360,
                    margin: "0 auto",
                  }}
                >
                  Western transit data will appear once your birth profile is complete.
                </p>
              </div>
            )}

            {activeTab === "vedic" && dashaTimeline && (
              <VedicDashaView
                dashaTimeline={dashaTimeline}
                currentMahaDasha={synthesis.currentMahaDasha}
                currentAntarDasha={synthesis.currentAntarDasha}
              />
            )}

            {activeTab === "vedic" && !dashaTimeline && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  background: "rgba(13,18,32,0.5)",
                  borderRadius: 12,
                  border: "1px solid rgba(200,135,58,0.12)",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16, color: "rgba(200,135,58,0.4)" }}>◉</div>
                <p
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: 16,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: 8,
                  }}
                >
                  Dasha timeline unavailable
                </p>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.65,
                    maxWidth: 360,
                    margin: "0 auto",
                  }}
                >
                  Vedic dasha data will appear once your Jyotish chart is generated.
                </p>
              </div>
            )}

            {activeTab === "convergence" && (
              <ConvergenceTimeline events={synthesis.convergenceWindow} />
            )}

            {activeTab === "scorecard" && (
              <OpportunityScorecardView scores={opportunityScores} />
            )}
          </div>
      </section>
    </PageLayout>
  );
}

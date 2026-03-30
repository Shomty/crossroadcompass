"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { Planet, VedicChartCalculations } from "openastrology-library";
import { getVimshottariPeriods, parseSerializedVedicChart } from "@/lib/astro/serializeVedicChart";
import { NatalChartGrid } from "./NatalChartGrid";
import { ChartSkeleton } from "./ChartSkeleton";
import { PlanetSummaryCard } from "./PlanetSummaryCard";
import { PlanetTable } from "./PlanetTable";
import { PlanetExportButton } from "./PlanetExportButton";
import { DrushtiVisualizer } from "./DrushtiVisualizer";
import { HouseGrid } from "./HouseGrid";
import { YogaSummaryPanel } from "./YogaSummaryPanel";
import { DashaTimelinePanel } from "./DashaTimelinePanel";
import { SpecialPointsSection } from "./SpecialPointsSection";
import { AshtakavargaPanel } from "./AshtakavargaPanel";
import { DivisionalChartsPanel } from "./DivisionalChartsPanel";
import { V4GlassCard } from "@/components/v4/V4GlassCard";

type TabId =
  | "chart"
  | "planets"
  | "houses"
  | "yogas"
  | "dasha"
  | "special"
  | "ashtakavarga"
  | "divisional";

const TABS: { id: TabId; label: string }[] = [
  { id: "chart", label: "Chart" },
  { id: "planets", label: "Planets" },
  { id: "houses", label: "Houses" },
  { id: "yogas", label: "Chart Combinations" },
  { id: "dasha", label: "Life Periods" },
  { id: "special", label: "Special Points" },
  { id: "ashtakavarga", label: "Ashtakavarga" },
  { id: "divisional", label: "Divisional" },
];

interface Props {
  initialChart: unknown;
  birthTimeKnown: boolean;
}

export function ChartPageClient({ initialChart, birthTimeKnown }: Props) {
  const [chart, setChart] = useState<VedicChartCalculations | null>(null);
  const [tab, setTab] = useState<TabId>("chart");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [transit, setTransit] = useState<VedicChartCalculations | null>(null);
  const [showTransits, setShowTransits] = useState(false);
  const [showChartTransits, setShowChartTransits] = useState(false);
  useEffect(() => {
    setChart(parseSerializedVedicChart(initialChart));
  }, [initialChart]);

  useEffect(() => {
    void fetch("/api/user/astro-snapshot", { method: "PATCH" }).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/chart/transits");
        if (!res.ok) return;
        const json = (await res.json()) as { transitChart?: unknown };
        if (!cancelled && json.transitChart) {
          setTransit(parseSerializedVedicChart(json.transitChart));
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!chart) {
    return <ChartSkeleton />;
  }

  const dashaPeriods = getVimshottariPeriods(chart);

  return (
    <section className="chart-page animate-enter animate-enter-2">
      <nav className="chart-page-tabs" aria-label="Chart sections" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            data-active={tab === t.id ? "true" : "false"}
            className="chart-tab-btn"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <V4GlassCard>
        <div className="chart-page-panel flex flex-col gap-6">
          {tab === "chart" && (
            <div className="flex flex-col gap-5">
              {transit?.planets != null && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowChartTransits((v) => !v)}
                    className={clsx(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      showChartTransits
                        ? "border-[rgba(100,160,255,0.5)] bg-[rgba(100,160,255,0.15)] text-[rgba(150,200,255,0.9)]"
                        : "border-[rgba(200,135,58,0.3)] text-[var(--mist)] hover:border-[rgba(200,135,58,0.5)] hover:text-[var(--cream)]"
                    )}
                  >
                    {showChartTransits ? "Hide today's transits" : "Show today's transits"}
                  </button>
                </div>
              )}
              <NatalChartGrid
                chart={chart}
                birthTimeKnown={birthTimeKnown}
                transitChart={showChartTransits ? transit : null}
              />
            </div>
          )}

          {tab === "planets" &&
            (chart.planets != null ? (
              <div className="flex flex-col gap-6">
                <PlanetSummaryCard planets={chart.planets} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <PlanetExportButton planets={chart.planets} />
                  {transit?.planets != null && (
                    <button
                      type="button"
                      onClick={() => setShowTransits((v) => !v)}
                      className={clsx(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        showTransits
                          ? "border-[rgba(100,160,255,0.5)] bg-[rgba(100,160,255,0.15)] text-[rgba(150,200,255,0.9)]"
                          : "border-[rgba(200,135,58,0.3)] text-[var(--mist)] hover:border-[rgba(200,135,58,0.5)] hover:text-[var(--cream)]"
                      )}
                    >
                      {showTransits ? "Hide today's transits" : "Show today's transits"}
                    </button>
                  )}
                </div>
                <PlanetTable
                  planets={chart.planets}
                  onPlanetSelect={setSelectedPlanet}
                  transitPlanets={showTransits ? (transit?.planets ?? null) : null}
                />
                <DrushtiVisualizer
                  planets={chart.planets}
                  selected={selectedPlanet}
                  onClear={() => setSelectedPlanet(null)}
                />
              </div>
            ) : (
              <p className="text-muted-chart">Planet positions are not available for this chart.</p>
            ))}

          {tab === "houses" && <HouseGrid houses={chart.houses} />}

          {tab === "yogas" && <YogaSummaryPanel yogas={chart.yogas} />}

          {tab === "dasha" &&
            (dashaPeriods != null ? (
              <DashaTimelinePanel dashaPeriods={dashaPeriods} />
            ) : (
              <p className="text-muted-chart">Dasha data is not available for this chart.</p>
            ))}

          {tab === "special" && <SpecialPointsSection />}

          {tab === "ashtakavarga" && <AshtakavargaPanel chart={chart} />}

          {tab === "divisional" && <DivisionalChartsPanel birthTimeKnown={birthTimeKnown} />}
        </div>
      </V4GlassCard>
    </section>
  );
}

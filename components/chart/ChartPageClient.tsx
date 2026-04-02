"use client";

import { useEffect, useState } from "react";
import type { Planet, VedicChartCalculations } from "openastrology-library";
import { AnimatedNorthIndianChart, SouthIndianChart } from "@node-jhora/ui-react";
import { getVimshottariPeriods, parseSerializedVedicChart } from "@/lib/astro/serializeVedicChart";
import type { JhoraUiChartProps } from "@/lib/chart/mapJhoraChartToUiReact";
import { NatalChartGrid, NORTH_INDIAN_CHART_SIZE_PX } from "./NatalChartGrid";
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
  jhoraChart: JhoraUiChartProps | null;
}

export function ChartPageClient({ initialChart, birthTimeKnown, jhoraChart }: Props) {
  const [chart, setChart] = useState<VedicChartCalculations | null>(null);
  const [tab, setTab] = useState<TabId>("chart");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [transit, setTransit] = useState<VedicChartCalculations | null>(null);
  const [showChartTransits, setShowChartTransits] = useState(false);
  const [jhoraStyle, setJhoraStyle] = useState<"north" | "south">("north");
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
      <nav className="synthesis-tab-rail" aria-label="Chart sections" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            data-active={tab === t.id ? "true" : "false"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <V4GlassCard style={{ padding: "22px 24px" }}>
        <div className="chart-page-panel flex flex-col gap-6">
          {tab === "chart" && (
            <div className="flex flex-col gap-8">
              {transit?.planets != null && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowChartTransits((v) => !v)}
                    className="btn-toggle"
                    data-active={showChartTransits ? "true" : undefined}
                  >
                    {showChartTransits ? "Hide today's transits" : "Show today's transits"}
                  </button>
                </div>
              )}

              {/* ── Charts row ── */}
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
                {/* Jhora rāśi */}
                <div className="min-w-0 flex-1">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="chart-panel-eyebrow">Jhora · rāśi</p>

                    </div>
                    <div
                      className="chart-variant-toggle shrink-0"
                      role="group"
                      aria-label="Jhora chart style"
                    >
                      <button
                        type="button"
                        onClick={() => setJhoraStyle("north")}
                        data-active={jhoraStyle === "north" ? "true" : undefined}
                      >
                        North Indian
                      </button>
                      <button
                        type="button"
                        onClick={() => setJhoraStyle("south")}
                        data-active={jhoraStyle === "south" ? "true" : undefined}
                      >
                        South Indian
                      </button>
                    </div>
                  </div>
                  {jhoraChart ? (
                    <>
                      {jhoraStyle === "north" ? (
                        <AnimatedNorthIndianChart
                          planets={jhoraChart.planets}
                          ascendant={jhoraChart.ascendant}
                          width={NORTH_INDIAN_CHART_SIZE_PX}
                          height={NORTH_INDIAN_CHART_SIZE_PX}
                        />
                      ) : (
                        <SouthIndianChart
                          planets={jhoraChart.planets}
                          ascendant={jhoraChart.ascendant}
                          width={NORTH_INDIAN_CHART_SIZE_PX}
                          height={NORTH_INDIAN_CHART_SIZE_PX}
                        />
                      )}
                    </>
                  ) : (
                    <p className="text-muted-chart text-sm">
                      Jhora chart could not be loaded for your profile.
                    </p>
                  )}
                </div>

                {/* North Indian classic */}
                <div className="min-w-0 flex-1">
                  <p className="chart-panel-eyebrow mb-4">North Indian · classic</p>
                  <NatalChartGrid
                    chart={chart}
                    birthTimeKnown={birthTimeKnown}
                    transitChart={showChartTransits ? transit : null}
                    centered={false}
                  />
                </div>
              </div>

              {/* ── Planet table below both charts ── */}
              {chart.planets != null && (
                <div className="flex flex-col gap-4 border-t border-[rgba(200,135,58,0.18)] pt-6">
                  <div>
                    <h2 className="chart-panel-section-title">Planetary Positions</h2>
                  </div>
                  <PlanetSummaryCard planets={chart.planets} />
                  <PlanetTable
                    variant="default"
                    planets={chart.planets}
                    onPlanetSelect={setSelectedPlanet}
                    transitPlanets={showChartTransits ? (transit?.planets ?? null) : null}
                  />
                </div>
              )}
            </div>
          )}

          {tab === "planets" &&
            (chart.planets != null ? (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="chart-panel-section-title">Planetary Positions</h2>
                </div>
                <PlanetSummaryCard planets={chart.planets} />
                <PlanetTable
                  variant="default"
                  planets={chart.planets}
                  onPlanetSelect={setSelectedPlanet}
                  transitPlanets={showChartTransits ? (transit?.planets ?? null) : null}
                />
                <PlanetExportButton planets={chart.planets} />
                {Object.values(chart.planets).some((p) => p.aspects.length > 0) && (
                  <div
                    style={{
                      borderRadius: 12,
                      border: "1px solid rgba(212,175,95,0.14)",
                      background: "rgba(13,18,32,0.6)",
                      padding: "18px 20px",
                    }}
                  >
                    <h2 className="chart-panel-section-title" style={{ marginBottom: 4 }}>Drishti (Vedic Aspects)</h2>
                    <DrushtiVisualizer
                      planets={chart.planets}
                      selected={selectedPlanet}
                      onClear={() => setSelectedPlanet(null)}
                    />
                  </div>
                )}
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

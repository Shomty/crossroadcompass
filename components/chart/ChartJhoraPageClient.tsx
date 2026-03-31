"use client";

import { useEffect, useState } from "react";
import type { Planet, VedicChartCalculations } from "openastrology-library";
import { AnimatedNorthIndianChart, SouthIndianChart } from "@node-jhora/ui-react";
import { getVimshottariPeriods, parseSerializedVedicChart } from "@/lib/astro/serializeVedicChart";
import type { JhoraUiChartProps } from "@/lib/chart/mapJhoraChartToUiReact";
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

export function ChartJhoraPageClient({
  initialChart,
  birthTimeKnown,
  jhoraChart,
}: Props) {
  const [chart, setChart] = useState<VedicChartCalculations | null>(null);
  const [tab, setTab] = useState<TabId>("chart");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [transit, setTransit] = useState<VedicChartCalculations | null>(null);
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
              <p className="text-sm leading-relaxed text-[var(--mist)]">
                <strong className="text-[var(--cream)]">Jhora preview</strong> — North and South Indian
                rāśi SVGs from{" "}
                <span className="font-mono text-xs text-[var(--cream)]">@node-jhora/ui-react</span>, fed
                with the same sidereal longitudes as your saved natal chart. Tables on this tab use that
                chart as well.
              </p>
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
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
                <div className="flex min-w-0 flex-1 flex-col gap-8">
                  {jhoraChart ? (
                    <>
                      <div className="flex flex-col items-center gap-2 sm:items-start">
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--mist)]">
                          North Indian (animated)
                        </p>
                        <AnimatedNorthIndianChart
                          planets={jhoraChart.planets}
                          ascendant={jhoraChart.ascendant}
                          width={380}
                          height={380}
                          className="max-w-full text-[var(--cream)]"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-2 sm:items-start">
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--mist)]">
                          South Indian
                        </p>
                        <SouthIndianChart
                          planets={jhoraChart.planets}
                          ascendant={jhoraChart.ascendant}
                          width={380}
                          height={380}
                          className="max-w-full text-[var(--cream)]"
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-chart">
                      Jhora chart data could not be computed. Check server logs and ephemeris setup.
                    </p>
                  )}
                </div>
                {chart.planets != null ? (
                  <aside className="flex w-full min-w-0 flex-col gap-4 lg:w-[min(100%,400px)] lg:shrink-0">
                    <div>
                      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--mist)]">
                        Planet details (main engine)
                      </p>
                      <p className="text-xs text-[var(--mist)] opacity-80">
                        Natal table from your saved chart; optional transit rows when transits are on.
                      </p>
                    </div>
                    <PlanetSummaryCard planets={chart.planets} />
                    <PlanetTable
                      variant="panel"
                      planets={chart.planets}
                      onPlanetSelect={setSelectedPlanet}
                      transitPlanets={showChartTransits ? (transit?.planets ?? null) : null}
                    />
                  </aside>
                ) : null}
              </div>
            </div>
          )}

          {tab === "planets" &&
            (chart.planets != null ? (
              <div className="flex flex-col gap-6">
                <p className="text-sm leading-relaxed text-[var(--mist)]">
                  Positions, dignity summary, and the full planet table live on the{" "}
                  <strong className="text-[var(--cream)]">Chart</strong> tab next to the Jhora rāśi
                  charts.
                </p>
                <PlanetExportButton planets={chart.planets} />
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

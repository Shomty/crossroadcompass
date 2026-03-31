"use client";

import { useMemo } from "react";
import clsx from "clsx";
import type { VedicChartCalculations } from "openastrology-library";
import {
  generateNorthIndianChartSVG,
  vedicChartsToNorthIndianInput,
} from "@/lib/chart/northIndianDraw";

/** Matches `generateNorthIndianChartSVG` — use for Jhora SVGs on the same page. */
export const NORTH_INDIAN_CHART_SIZE_PX = 480;

export function BirthTimeBanner({ birthTimeKnown }: { birthTimeKnown: boolean }) {
  if (birthTimeKnown) return null;
  return (
    <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100">
      Birth time unknown — Ascendant and house positions are approximate (solar noon used).
    </div>
  );
}

function ChartLegend({ showTransitHint }: { showTransitHint: boolean }) {
  return (
    <div className="mt-3 space-y-1 text-[10px] text-[var(--mist)]">
      <p>
        Numerals in each cell are whole-sign rāśi from your Lagna (1 = Aries … 12 = Pisces); the diamond position is the
        house, the numeral is the sign occupying it.
      </p>
      {showTransitHint && (
        <p>
          Planet lines use the same colour; <span className="font-mono text-[var(--cream)]">T·</span> prefix = today&apos;s
          transit.
        </p>
      )}
    </div>
  );
}

interface Props {
  chart: VedicChartCalculations;
  birthTimeKnown: boolean;
  transitChart?: VedicChartCalculations | null;
  /** When false, chart is in a side-by-side layout — drop horizontal centering. */
  centered?: boolean;
}

export function NatalChartGrid({ chart, birthTimeKnown, transitChart, centered = true }: Props) {
  const svgMarkup = useMemo(() => {
    const input = vedicChartsToNorthIndianInput(chart, transitChart ?? null);
    return generateNorthIndianChartSVG(input, NORTH_INDIAN_CHART_SIZE_PX, NORTH_INDIAN_CHART_SIZE_PX);
  }, [chart, transitChart]);

  return (
    <div className={centered ? "" : "min-w-0"}>
      <BirthTimeBanner birthTimeKnown={birthTimeKnown} />
      <div
        className={clsx(
          "north-indian-chart-wrap w-full max-w-[min(100%,520px)] [&_svg]:h-auto [&_svg]:w-full",
          centered && "mx-auto",
        )}
        // SVG is generated only from server chart + transit data (no raw user HTML).
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
      <ChartLegend showTransitHint={Boolean(transitChart)} />
    </div>
  );
}

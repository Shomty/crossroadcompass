"use client";

import { useMemo } from "react";
import type { VedicChartCalculations } from "openastrology-library";
import {
  generateNorthIndianChartSVG,
  vedicChartsToNorthIndianInput,
} from "@/lib/chart/northIndianDraw";

function BirthTimeBanner({ birthTimeKnown }: { birthTimeKnown: boolean }) {
  if (birthTimeKnown) return null;
  return (
    <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100">
      Birth time unknown — Ascendant and house positions are approximate (solar noon used).
    </div>
  );
}

function TransitLegend() {
  return (
    <p className="mt-3 text-[10px] text-[var(--mist)]">
      Regular = natal · <span className="italic text-[rgba(232,185,106,0.9)]">T·italic</span> = today&apos;s
      transit
    </p>
  );
}

interface Props {
  chart: VedicChartCalculations;
  birthTimeKnown: boolean;
  transitChart?: VedicChartCalculations | null;
}

export function NatalChartGrid({ chart, birthTimeKnown, transitChart }: Props) {
  const svgMarkup = useMemo(() => {
    const input = vedicChartsToNorthIndianInput(chart, transitChart ?? null);
    return generateNorthIndianChartSVG(input, 480, 480);
  }, [chart, transitChart]);

  return (
    <div>
      <BirthTimeBanner birthTimeKnown={birthTimeKnown} />
      <div
        className="north-indian-chart-wrap mx-auto w-full max-w-[min(100%,520px)] [&_svg]:h-auto [&_svg]:w-full"
        // SVG is generated only from server chart + transit data (no raw user HTML).
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
      {transitChart && <TransitLegend />}
    </div>
  );
}

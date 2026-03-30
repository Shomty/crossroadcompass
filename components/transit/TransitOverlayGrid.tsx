"use client";
// STATUS: done | FE-09

import type { VedicChartCalculations } from "openastrology-library";
import { NatalChartGrid } from "@/components/chart/NatalChartGrid";

interface Props {
  natalChart: VedicChartCalculations;
  transitChart: VedicChartCalculations;
  birthTimeKnown: boolean;
}

/**
 * Overlays today's transit planets on the natal chart grid.
 * Transit planets are distinguished via the NatalChartGrid's built-in
 * transitChart prop (renders with different color/prefix).
 */
export function TransitOverlayGrid({ natalChart, transitChart, birthTimeKnown }: Props) {
  return (
    <div>
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--mist)]">
        Natal vs Today's Transits
      </p>
      <NatalChartGrid
        chart={natalChart}
        birthTimeKnown={birthTimeKnown}
        transitChart={transitChart}
      />
    </div>
  );
}

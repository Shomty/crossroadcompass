"use client";

import { useState } from "react";
import type { VedicChartCalculations } from "openastrology-library";
import { sarvaByHouse } from "@/lib/astro/ashtakavargaUtils";

interface Props {
  chart: VedicChartCalculations;
}

export function AshtakavargaPanel({ chart }: Props) {
  const [advanced, setAdvanced] = useState(false);
  const byHouse = sarvaByHouse(chart);
  const max = Math.max(1, ...Object.values(byHouse));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-muted-chart">Combined Sarva bindus mapped to each house sign.</p>
        <button
          type="button"
          className="text-xs font-mono uppercase tracking-wider text-[rgba(232,185,106,0.9)]"
          onClick={() => setAdvanced((a) => !a)}
        >
          {advanced ? "Simple view" : "Advanced grid"}
        </button>
      </div>
      {!advanced ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {Object.entries(byHouse).map(([h, score]) => (
            <div key={h} className="rounded-lg border border-[rgba(200,135,58,0.2)] p-2">
              <div className="text-[10px] text-[var(--mist)]">House {h}</div>
              <div className="text-lg font-semibold text-[var(--cream)]">{score}</div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-[rgba(255,255,255,0.08)]">
                <div
                  className="h-full bg-[#c8873a]"
                  style={{ width: `${Math.round((score / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <pre className="max-h-64 overflow-auto rounded-lg border border-[rgba(200,135,58,0.2)] p-2 text-[10px] text-[var(--mist)]">
          {JSON.stringify(chart.ashtakavarga, null, 2)}
        </pre>
      )}
    </div>
  );
}

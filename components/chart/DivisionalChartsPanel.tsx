"use client";

import { useEffect, useState } from "react";
import { DIVISIONAL_LABELS } from "@/lib/astro/divisionalLabels";
import { NatalChartGrid } from "./NatalChartGrid";
import { parseSerializedVedicChart } from "@/lib/astro/serializeVedicChart";
import type { VedicChartCalculations } from "openastrology-library";

interface Props {
  birthTimeKnown: boolean;
}

export function DivisionalChartsPanel({ birthTimeKnown }: Props) {
  const [divisional, setDivisional] = useState<Record<string, unknown> | null>(null);
  const [key, setKey] = useState("D9");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/chart/divisional");
        const json = (await res.json()) as { divisional?: Record<string, unknown>; error?: string };
        if (!res.ok) {
          if (!cancelled) setErr(json.error ?? "Failed");
          return;
        }
        if (!cancelled) setDivisional(json.divisional ?? null);
      } catch {
        if (!cancelled) setErr("Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) return <p className="text-sm text-amber-200">{err}</p>;
  if (!divisional) return <p className="text-muted-chart">Loading divisional charts…</p>;

  const keys = Object.keys(divisional).sort();
  const chart = parseSerializedVedicChart(divisional[key]) as VedicChartCalculations;
  const meta = DIVISIONAL_LABELS[key] ?? { name: key, meaning: "Divisional chart." };

  return (
    <div>
      <label className="mb-2 block text-[10px] font-mono uppercase tracking-wider text-[var(--mist)]">
        Chart
        <select
          className="ml-2 rounded-lg border border-[rgba(200,135,58,0.35)] bg-transparent px-2 py-1 text-sm text-[var(--cream)]"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        >
          {keys.map((k) => (
            <option key={k} value={k}>
              {DIVISIONAL_LABELS[k]?.name ?? k}
            </option>
          ))}
        </select>
      </label>
      <p className="text-muted-chart mb-3">{meta.meaning}</p>
      <NatalChartGrid chart={chart} birthTimeKnown={birthTimeKnown} />
    </div>
  );
}

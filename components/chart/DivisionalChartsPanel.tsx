"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AnimatedNorthIndianChart, SouthIndianChart } from "@node-jhora/ui-react";
import { DIVISIONAL_LABELS } from "@/lib/astro/divisionalLabels";
import { mapVedicChartToJhoraUi } from "@/lib/chart/vedicChartToJhoraUi";
import { parseSerializedVedicChart } from "@/lib/astro/serializeVedicChart";
import type { VedicChartCalculations } from "openastrology-library";
import { BirthTimeBanner, NORTH_INDIAN_CHART_SIZE_PX } from "./NatalChartGrid";

interface Props {
  birthTimeKnown: boolean;
}

export function DivisionalChartsPanel({ birthTimeKnown }: Props) {
  const [divisional, setDivisional] = useState<Record<string, unknown> | null>(null);
  const [key, setKey] = useState("D9");
  const [err, setErr] = useState<string | null>(null);
  const [jhoraStyle, setJhoraStyle] = useState<"north" | "south">("north");

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

  const keys = useMemo(() => (divisional ? Object.keys(divisional).sort() : []), [divisional]);

  useLayoutEffect(() => {
    if (!divisional || keys.length === 0) return;
    if (!keys.includes(key)) {
      setKey(keys[0]!);
    }
  }, [divisional, keys, key]);

  const chart = useMemo((): VedicChartCalculations | null => {
    if (!divisional || keys.length === 0) return null;
    const chartKey = keys.includes(key) ? key : keys[0]!;
    try {
      return parseSerializedVedicChart(divisional[chartKey]) as VedicChartCalculations;
    } catch {
      return null;
    }
  }, [divisional, key, keys]);

  const jhora = useMemo(() => (chart ? mapVedicChartToJhoraUi(chart) : null), [chart]);

  if (err) return <p className="text-sm text-amber-200">{err}</p>;
  if (!divisional) return <p className="text-muted-chart">Loading divisional charts…</p>;

  const chartKey = keys.includes(key) ? key : keys[0]!;
  const meta = DIVISIONAL_LABELS[chartKey] ?? { name: chartKey, meaning: "Divisional chart." };

  return (
    <div>
      <label className="mb-2 block text-[10px] font-mono uppercase tracking-wider text-[var(--mist)]">
        Chart
        <select
          className="ml-2 rounded-lg border border-[rgba(200,135,58,0.35)] bg-transparent px-2 py-1 text-sm text-[var(--cream)]"
          value={chartKey}
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

      <BirthTimeBanner birthTimeKnown={birthTimeKnown} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--mist)]">
            Jhora · {meta.name}
          </p>
          <p className="text-xs text-[var(--mist)] opacity-80">
            Same sidereal data as openastrology divisional charts; whole sign. Toggle North or South Indian.
          </p>
        </div>
        <div
          className="chart-variant-toggle shrink-0"
          role="group"
          aria-label="Divisional chart style"
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

      {!chart ? (
        <p className="text-muted-chart text-sm">Could not read this divisional chart from the server.</p>
      ) : jhora ? (
        <div className="text-[var(--cream)]">
          {jhoraStyle === "north" ? (
            <AnimatedNorthIndianChart
              planets={jhora.planets}
              ascendant={jhora.ascendant}
              width={NORTH_INDIAN_CHART_SIZE_PX}
              height={NORTH_INDIAN_CHART_SIZE_PX}
            />
          ) : (
            <SouthIndianChart
              planets={jhora.planets}
              ascendant={jhora.ascendant}
              width={NORTH_INDIAN_CHART_SIZE_PX}
              height={NORTH_INDIAN_CHART_SIZE_PX}
            />
          )}
        </div>
      ) : (
        <p className="text-muted-chart text-sm">
          This divisional payload is incomplete (missing grahas or ascendant) — Jhora view unavailable.
        </p>
      )}
    </div>
  );
}

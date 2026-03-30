"use client";
// STATUS: done | FE-04

import { useMemo, useState } from "react";
import type { Yoga } from "openastrology-library";
import { mapYogaType, type AppYogaCategory } from "@/lib/astro/mapYogaType";
import {
  compareYogasByStrength,
  pickStrongestYoga,
  yogaStrengthLabel,
} from "@/lib/astro/yogaStrength";

interface Props {
  yogas: Yoga[] | null | undefined;
}

type YogaTabId = "all" | AppYogaCategory;

const TABS: { id: YogaTabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "raj", label: "Leadership (Rāja)" },
  { id: "dhana", label: "Wealth (Dhana)" },
  { id: "other", label: "Other" },
];

function YogaCard({ yoga }: { yoga: Yoga }) {
  const label = yogaStrengthLabel(yoga.strength);
  const strengthColor =
    label === "Strong"
      ? "bg-emerald-600/25 text-emerald-200/95"
      : label === "Moderate"
        ? "bg-amber-600/25 text-amber-200/95"
        : "bg-slate-600/25 text-slate-200/90";

  return (
    <div className="chart-bp-card">
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <span className="font-medium text-[var(--cream)]">{yoga.name}</span>
        <span
          className={`rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${strengthColor}`}
        >
          {label}
        </span>
        <span className="text-[var(--type-label)] text-[var(--muted)]">· {yoga.type}</span>
      </div>
      {yoga.description && (
        <p className="chart-bp-muted mt-1.5">{yoga.description}</p>
      )}
    </div>
  );
}

export function YogaSummaryPanel({ yogas }: Props) {
  const [tab, setTab] = useState<YogaTabId>("all");

  if (yogas == null || yogas.length === 0) {
    return (
      <div className="chart-bp-stack">
        <div className="chart-bp-hero">
          <span className="chart-bp-hero-star" aria-hidden>
            ✦
          </span>
          <span className="chart-bp-hero-title">Planetary combinations</span>
          <span className="chart-bp-hero-sub">
            Classical yogas from your natal chart
          </span>
        </div>
        <div className="chart-bp-card">
          <p className="chart-bp-body text-[var(--muted)]">
            No classical combinations were detected for this chart. That can
            happen with certain house systems or sparse rule sets—your chart
            still carries full planetary meaning in houses and aspects.
          </p>
        </div>
      </div>
    );
  }

  const rajaCount = yogas.filter((y) => mapYogaType(y.type) === "raj").length;
  const dhanaCount = yogas.filter((y) => mapYogaType(y.type) === "dhana").length;
  const otherCount = yogas.filter((y) => mapYogaType(y.type) === "other").length;

  const topYoga = pickStrongestYoga(yogas);

  const filteredSorted = useMemo(() => {
    const base =
      tab === "all" ? yogas : yogas.filter((y) => mapYogaType(y.type) === tab);
    return [...base].sort(compareYogasByStrength);
  }, [yogas, tab]);

  return (
    <div className="chart-bp-stack">
      <div className="chart-bp-hero">
        <span className="chart-bp-hero-star" aria-hidden>
          ✦
        </span>
        <span className="chart-bp-hero-title">Planetary combinations</span>
        <span className="chart-bp-hero-sub">
          Classical yogas — strongest listed first within each filter
        </span>
      </div>

      <div className="chart-bp-card">
        <div className="chart-bp-section-title">At a glance</div>
        <p className="chart-bp-body mb-3">
          This chart lists <strong className="text-[var(--cream)]">{yogas.length}</strong>{" "}
          combination{yogas.length !== 1 ? "s" : ""}
          {rajaCount > 0 && (
            <>
              , including{" "}
              <strong className="text-[var(--cream)]">{rajaCount}</strong> leadership
              pattern{rajaCount !== 1 ? "s" : ""}
            </>
          )}
          {dhanaCount > 0 && (
            <>
              {" "}
              and <strong className="text-[var(--cream)]">{dhanaCount}</strong> wealth-related
              influence{dhanaCount !== 1 ? "s" : ""}
            </>
          )}
          .
        </p>
        {topYoga && (
          <p className="chart-bp-muted">
            The strongest-listed combination:{" "}
            <strong className="font-medium text-[rgba(240,220,160,0.9)]">{topYoga.name}</strong>
            {topYoga.description
              ? ` — ${topYoga.description.replace(/\.$/, "")}`
              : ""}
            .
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[rgba(200,135,58,0.12)] pt-3 font-mono text-[10px] uppercase tracking-wider text-[var(--mist)]">
          {rajaCount > 0 && <span>{rajaCount} Leadership</span>}
          {dhanaCount > 0 && <span>{dhanaCount} Wealth</span>}
          {otherCount > 0 && <span>{otherCount} Other</span>}
        </div>
      </div>

      <div className="chart-bp-card">
        <div className="chart-bp-section-title">All combinations</div>
        <p className="chart-bp-muted mb-4">
          Filter by category, or use <strong className="text-[rgba(240,220,160,0.85)]">All</strong> to
          see every yoga (sorted by strength, then name).
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`chart-bp-subtab ${tab === t.id ? "chart-bp-subtab-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {filteredSorted.length === 0 ? (
          <p className="chart-bp-muted">Nothing in this category for this chart.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredSorted.map((y, i) => (
              <li key={`${y.name}-${y.type}-${i}`}>
                <YogaCard yoga={y} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

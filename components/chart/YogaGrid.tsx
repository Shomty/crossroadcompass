// STATUS: done | Task YG.11
"use client";

import { useState } from "react";
import type { YogaCategory, YogaDetectionResult, YogaResult } from "@/types";

interface YogaGridProps {
  data: YogaDetectionResult;
}

const CATEGORY_LABELS: Record<YogaCategory, string> = {
  raj: "Raj — Authority",
  dhana: "Dhana — Wealth",
  daridra: "Daridra — Adversity",
  nabhasha: "Nabhasha — Chart Pattern",
  pancha_mahapurusha: "Pancha Mahapurusha — Great Person",
  lunar: "Lunar — Mind",
  solar: "Solar — Purpose",
  auspicious: "Auspicious — Blessings",
  neechabhanga: "Neechabhanga — Redeemed",
  vipareeta_raj: "Vipareeta — Reversal",
  arishta: "Arishta — Challenge",
  other: "Other",
};

const STRENGTH_STYLES: Record<string, string> = {
  strong: "text-amber-400 border border-amber-400/40 bg-amber-400/10",
  moderate: "text-yellow-300/70 border border-yellow-300/20 bg-yellow-300/5",
  weak: "text-slate-400 border border-slate-400/20 bg-slate-400/5",
};

type FilterMode = "all" | "active" | YogaCategory;

export function YogaGrid({ data }: YogaGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterMode>("active");
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories = [...new Set(data.yogas.map((y) => y.category))] as YogaCategory[];

  const filtered = data.yogas.filter((y) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return y.isActive;
    return y.category === activeFilter;
  });

  const dashaPowered = data.yogas.filter((y) => y.dashaActivated).length;

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-amber-500/60">
            Planetary Combinations
          </p>
          <h2
            className="font-serif text-3xl tracking-wide text-[#f0e8d8]"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Active Yogas
          </h2>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-[rgba(240,232,216,0.55)]">
            {data.activeCount} active · {data.strongCount} strong
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Total Detected", value: data.yogas.length, icon: "◈" },
          { label: "Active Now", value: data.activeCount, icon: "⬡" },
          { label: "Dasha Powered", value: dashaPowered, icon: "◎" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 backdrop-blur-sm"
          >
            <p className="mb-1 font-mono text-xs text-[rgba(240,232,216,0.55)]">
              {stat.icon} {stat.label}
            </p>
            <p className="font-serif text-2xl text-[#e8b96a]" style={{ fontFamily: "Cinzel, serif" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "active"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-all ${
              activeFilter === f
                ? "border-amber-500/60 bg-amber-500/15 text-amber-400"
                : "border-[rgba(255,255,255,0.08)] text-[rgba(240,232,216,0.45)] hover:border-amber-500/30"
            }`}
          >
            {f === "all" ? "All Yogas" : "Active Only"}
          </button>
        ))}
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveFilter(cat)}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-all ${
              activeFilter === cat
                ? "border-amber-500/60 bg-amber-500/15 text-amber-400"
                : "border-[rgba(255,255,255,0.08)] text-[rgba(240,232,216,0.45)] hover:border-amber-500/30"
            }`}
          >
            {cat.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((yoga) => (
          <YogaCard
            key={yoga.name}
            yoga={yoga}
            isExpanded={expanded === yoga.name}
            onToggle={() => setExpanded(expanded === yoga.name ? null : yoga.name)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center font-sans text-sm text-[rgba(240,232,216,0.4)]">
          No Yogas match the selected filter.
        </p>
      )}
    </section>
  );
}

function YogaCard({
  yoga,
  isExpanded,
  onToggle,
}: {
  yoga: YogaResult;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isInactive = !yoga.isActive;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        w-full rounded-2xl border p-5 text-left backdrop-blur-sm transition-all duration-300
        ${
          isInactive
            ? "border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] opacity-50"
            : yoga.dashaActivated
              ? "border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-[rgba(255,255,255,0.04)] shadow-lg shadow-amber-500/5"
              : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] hover:border-amber-500/25 hover:bg-[rgba(255,255,255,0.06)]"
        }
      `}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {yoga.icon}
          </span>
          <div>
            <p
              className="font-serif text-lg leading-tight text-[#f0e8d8]"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              {yoga.shortTitle}
            </p>
            {yoga.dashaActivated && (
              <span className="mt-1 inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] text-amber-400">
                ◎ Dasha Active
              </span>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] ${STRENGTH_STYLES[yoga.strength] ?? STRENGTH_STYLES.weak}`}
        >
          {yoga.strength}
        </span>
      </div>

      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[rgba(240,232,216,0.35)]">
        {CATEGORY_LABELS[yoga.category]}
      </p>

      <p className="line-clamp-2 font-sans text-sm leading-relaxed text-[rgba(240,232,216,0.65)]">
        {yoga.plainDescription}
      </p>

      {isExpanded && (
        <div className="mt-4 space-y-3 border-t border-[rgba(255,255,255,0.06)] pt-4">
          <p className="font-sans text-sm leading-relaxed text-[rgba(240,232,216,0.75)]">
            {yoga.plainDescription}
          </p>
          <div className="flex flex-wrap gap-2">
            {yoga.planetsInvolved.map((p) => (
              <span
                key={p}
                className="rounded bg-[rgba(255,255,255,0.06)] px-2 py-0.5 font-mono text-[11px] text-[rgba(240,232,216,0.55)]"
              >
                {p}
              </span>
            ))}
            {yoga.housesInvolved.map((h) => (
              <span
                key={`h-${h}`}
                className="rounded bg-amber-500/8 px-2 py-0.5 font-mono text-[11px] text-amber-500/60"
              >
                House {h}
              </span>
            ))}
          </div>
          <p className="font-mono text-[10px] text-[rgba(240,232,216,0.25)]">{yoga.bphsReference}</p>
          {isInactive && (
            <p className="rounded border border-orange-400/20 bg-orange-400/8 px-3 py-2 font-mono text-[11px] text-orange-400/60">
              Currently inactive — planet may be combust or debilitated without full strength.
            </p>
          )}
        </div>
      )}

      <p className="mt-3 text-right font-mono text-[10px] text-[rgba(240,232,216,0.2)]">
        {isExpanded ? "▲ less" : "▼ more"}
      </p>
    </button>
  );
}

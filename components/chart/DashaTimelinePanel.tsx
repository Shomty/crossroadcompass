"use client";
// STATUS: done | FE-05

import { useState } from "react";
import type { PlanetDasha } from "openastrology-library";
import { DASHA_LABELS, TOTAL_DASHA_YEARS } from "@/lib/astro/dashaLabels";
import { AntardashaList } from "@/components/dasha/AntardashaList";
import { UpcomingMilestones } from "@/components/dasha/UpcomingMilestones";

interface Props {
  dashaPeriods: PlanetDasha[];
}

function toDate(d: Date | unknown): Date {
  return d instanceof Date ? d : new Date(d as string);
}

function fmtYear(d: Date | unknown): string {
  return toDate(d).getFullYear().toString();
}

function remainingLabel(end: Date | unknown): string {
  const endDate = toDate(end);
  const days = Math.floor((endDate.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "Ended";
  if (days < 30) return `${days} days left`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months} months left`;
  const yrs = (days / 365.25).toFixed(1);
  return `${yrs} years left`;
}

export function DashaTimelinePanel({ dashaPeriods }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const now = new Date();
  const maha = dashaPeriods.slice(0, 9);

  const cycleStart =
    maha.length > 0 ? toDate(maha[0].startDate).getTime() : now.getTime();
  const cycleEnd =
    maha.length > 0
      ? toDate(maha[maha.length - 1].endDate).getTime()
      : now.getTime();
  const cycleSpan = Math.max(cycleEnd - cycleStart, 1);

  const activeIdx = maha.findIndex((d) => {
    const s = toDate(d.startDate);
    const e = toDate(d.endDate);
    return s <= now && now <= e;
  });

  const active = activeIdx >= 0 ? maha[activeIdx] : null;
  const activeLabel = active ? DASHA_LABELS[active.planet] : null;

  const nowPct = Math.min(
    100,
    Math.max(0, ((now.getTime() - cycleStart) / cycleSpan) * 100),
  );

  if (!dashaPeriods.length || !maha.length) {
    return (
      <div className="chart-bp-stack">
        <div className="chart-bp-hero">
          <span className="chart-bp-hero-star" aria-hidden>
            ✦
          </span>
          <span className="chart-bp-hero-title">Life periods</span>
          <span className="chart-bp-hero-sub">
            Vimśottarī mahādaśā — 120-year planetary chapters
          </span>
        </div>
        <div className="chart-bp-card">
          <p className="chart-bp-body text-[var(--muted)]">
            Vimśottarī periods are not available for this chart yet. They need a
            reliable birth time and full daśā computation from your chart data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-bp-stack">
      <div className="chart-bp-hero">
        <span className="chart-bp-hero-star" aria-hidden>
          ✦
        </span>
        <span className="chart-bp-hero-title">Life periods</span>
        <span className="chart-bp-hero-sub">
          Vimśottarī cycle — {TOTAL_DASHA_YEARS}-year rhythm of planetary emphasis
        </span>
      </div>

      {active && activeLabel && (
        <div className="chart-bp-card border-[rgba(200,135,58,0.28)] bg-[rgba(200,135,58,0.06)]">
          <div className="chart-bp-section-title">Now — mahādaśā</div>
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <div className={`h-2 w-2 animate-pulse rounded-full ${activeLabel.bgClass}`} />
            <h3 className="cc-title-card text-[var(--cream)]">
              {activeLabel.planet} period
            </h3>
            <span className="ml-auto font-mono text-[11px] text-[rgba(232,185,106,0.95)]">
              {remainingLabel(active.endDate)}
            </span>
          </div>
          <p className="chart-bp-muted mt-2">{activeLabel.theme}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activeLabel.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-md bg-[rgba(200,135,58,0.12)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[rgba(232,185,106,0.92)]"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="chart-bp-card">
        <div className="chart-bp-section-title">Full cycle overview</div>
        <p className="chart-bp-muted mb-3">
          Each band is one mahādaśā. Tap a segment or a row below for antardaśās
          (sub-periods).
        </p>
        <div className="relative h-7 overflow-hidden rounded-lg bg-[rgba(255,255,255,0.05)]">
          {maha.map((d, i) => {
            const start = toDate(d.startDate).getTime();
            const end = toDate(d.endDate).getTime();
            const leftPct = ((start - cycleStart) / cycleSpan) * 100;
            const widthPct = ((end - start) / cycleSpan) * 100;
            const label = DASHA_LABELS[d.planet];
            const isActive = i === activeIdx;
            return (
              <button
                key={i}
                type="button"
                title={`${label?.planet ?? d.planet} (${fmtYear(d.startDate)}–${fmtYear(d.endDate)})`}
                onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                className={`absolute top-0 h-full transition-opacity ${label?.bgClass ?? "bg-amber-600"} ${
                  isActive ? "opacity-100 ring-1 ring-white/35" : "opacity-45 hover:opacity-75"
                }`}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              />
            );
          })}
          <div
            className="pointer-events-none absolute top-0 h-full w-px bg-white/75"
            style={{ left: `${nowPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-wider text-[var(--mist)]">
          <span>{fmtYear(maha[0]?.startDate)}</span>
          <span className="text-white/55">Today</span>
          <span>{fmtYear(maha[maha.length - 1]?.endDate)}</span>
        </div>
      </div>

      <div className="chart-bp-card">
        <div className="chart-bp-section-title">Mahādaśā sequence</div>
        <ul className="space-y-2">
          {maha.map((d, i) => {
            const label = DASHA_LABELS[d.planet];
            const isActive = i === activeIdx;
            const isExpanded = expandedIdx === i;

            return (
              <li
                key={i}
                className={`overflow-hidden rounded-xl border transition-colors ${
                  isActive
                    ? "border-[rgba(200,135,58,0.42)] bg-[rgba(200,135,58,0.07)]"
                    : "border-[rgba(200,135,58,0.16)] bg-[rgba(13,18,32,0.35)]"
                }`}
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-3 text-left sm:px-4"
                  onClick={() => setExpandedIdx(isExpanded ? null : i)}
                >
                  <div
                    className={`h-2 w-2 flex-shrink-0 rounded-full ${label?.bgClass ?? "bg-amber-600"} ${isActive ? "animate-pulse" : "opacity-55"}`}
                  />
                  <span
                    className={`flex-1 text-[var(--type-small)] font-medium leading-snug ${isActive ? "text-[var(--cream)]" : "text-[var(--mist)]"}`}
                  >
                    {label?.planet ?? d.planet} life period
                  </span>
                  <span className="font-mono text-[10px] text-[var(--mist)]">
                    {fmtYear(d.startDate)}–{fmtYear(d.endDate)}
                  </span>
                  {isActive && (
                    <span className="hidden font-mono text-[9px] text-[rgba(232,185,106,0.9)] sm:inline">
                      {remainingLabel(d.endDate)}
                    </span>
                  )}
                  <span className="text-[var(--mist)]" aria-hidden>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>
                {isExpanded && (
                  <div className="border-t border-[rgba(200,135,58,0.1)] px-3 pb-4 pl-10 pr-3 sm:px-4 sm:pl-12">
                    {label?.theme && (
                      <p className="chart-bp-muted mb-3 pt-2">{label.theme}</p>
                    )}
                    <AntardashaList mahadasha={d} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <UpcomingMilestones dashaPeriods={dashaPeriods} />
    </div>
  );
}

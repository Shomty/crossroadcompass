// STATUS: done | Synthesis Engine Phase 4.5
/**
 * components/synthesis/VedicDashaView.tsx
 * Display Vedic Dasha timeline with Mahadasha and Antardasha blocks.
 * Color intensity represents activation strength (0-100).
 * Highlights current position and next transition.
 */

"use client";

import type { VedicDashaTimeline, DashaPeriod } from "@/types";
import {
  synthesisBodyMuted,
  synthesisCream,
  synthesisInnerPanel,
  synthesisInnerPanelAccent,
  synthesisInnerPanelDense,
  synthesisLabelClass,
  synthesisLabelStyle,
} from "@/components/synthesis/synthesisPanelClasses";

interface VedicDashaViewProps {
  dashaTimeline: VedicDashaTimeline;
  currentMahaDasha: DashaPeriod;
  currentAntarDasha: DashaPeriod;
}

function getActivationColor(strength?: number): string {
  if (!strength) return "border-[rgba(200,135,58,0.12)] bg-[rgba(13,18,32,0.42)]";
  if (strength >= 80) return 'bg-emerald-500/30 border-emerald-400/50';
  if (strength >= 60) return 'bg-amber-500/30 border-amber-400/50';
  if (strength >= 40) return 'bg-yellow-500/30 border-yellow-400/50';
  return 'bg-red-500/30 border-red-400/50';
}

function getTextColor(strength?: number): string {
  if (!strength) return "text-white/55";
  if (strength >= 80) return 'text-emerald-400';
  if (strength >= 60) return 'text-amber-400';
  if (strength >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

function formatDate(date: Date | undefined | string): string {
  if (!date) return 'TBD';
  if (typeof date === 'string') return date;
  if (!(date instanceof Date)) return 'TBD';
  return date.toLocaleDateString();
}

export function VedicDashaView({
  dashaTimeline,
  currentMahaDasha,
  currentAntarDasha,
}: VedicDashaViewProps) {
  const totalDashas = dashaTimeline.timeline.length;

  return (
    <div className="flex flex-col gap-4">
      <div className={synthesisInnerPanel}>
        <p className={`${synthesisLabelClass} mb-2`} style={synthesisLabelStyle}>
          Vimshottari dasha system
        </p>
        <p className="text-sm" style={synthesisBodyMuted}>
          120-year cycle with {totalDashas} major periods. Currently in{" "}
          <span className="font-medium text-[color:var(--amber,#c8873a)]">
            {currentMahaDasha.planetName}
          </span>{" "}
          Mahadasha.
        </p>
      </div>

      <div className={synthesisInnerPanelAccent}>
        <p className={`${synthesisLabelClass} mb-3 font-medium text-[color:var(--amber,#c8873a)]`} style={synthesisLabelStyle}>
          Current major period
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <p className="font-serif text-sm text-[color:var(--amber,#c8873a)]">
              {currentMahaDasha.planetName}
            </p>
            <p className="mt-1 text-xs" style={synthesisBodyMuted}>
              {formatDate(currentMahaDasha.startDate)} to{' '}
              {formatDate(currentMahaDasha.endDate)}
            </p>
            {currentMahaDasha.strength !== undefined && (
              <div className="mt-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(13,18,32,0.55)]">
                  <div
                    className="h-full bg-[linear-gradient(135deg,#c8873a,#e8b96a)]"
                    style={{ width: `${currentMahaDasha.strength}%` }}
                  />
                </div>
                <p className="mt-1 text-xs" style={synthesisBodyMuted}>
                  Strength: {currentMahaDasha.strength}/100
                </p>
              </div>
            )}
          </div>

          {currentAntarDasha && (
            <div className="border-t border-[rgba(200,135,58,0.2)] pt-3">
              <p className={`${synthesisLabelClass} mb-2`} style={synthesisLabelStyle}>
                Current sub-period
              </p>
              <p className="text-sm font-medium text-[color:var(--amber,#c8873a)]">
                {currentAntarDasha.planetName}
              </p>
              <p className="mt-1 text-xs" style={synthesisBodyMuted}>
                {formatDate(currentAntarDasha.startDate)} to{' '}
                {formatDate(currentAntarDasha.endDate)}
              </p>
              {currentAntarDasha.strength !== undefined && (
                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(13,18,32,0.55)]">
                    <div
                      className="h-full bg-[linear-gradient(135deg,#c8873a,#e8b96a)]"
                      style={{ width: `${currentAntarDasha.strength}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs" style={synthesisBodyMuted}>
                    Activation: {currentAntarDasha.strength}/100
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <p className={`${synthesisLabelClass} mb-3`} style={synthesisLabelStyle}>
          Complete timeline
        </p>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {dashaTimeline.timeline.map((dasha: any, idx: number) => {
            const isCurrent = dasha.mahadashaPlanet === currentMahaDasha.planetName;

            return (
              <div
                key={idx}
                className={`overflow-hidden rounded-[12px] border border-solid transition-all ${
                  isCurrent
                    ? "border-[rgba(200,135,58,0.35)] bg-[rgba(13,18,32,0.65)] ring-2 ring-[color:var(--amber,#c8873a)]"
                    : getActivationColor(dasha.overallStrength)
                }`}
              >
                <div className="flex items-start justify-between px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isCurrent ? "text-[color:var(--amber,#c8873a)]" : ""
                      }`}
                      style={!isCurrent ? synthesisCream : undefined}
                    >
                      {dasha.mahadashaPlanet}
                      {isCurrent && " ✦"}
                    </p>
                    <p className="mt-1 text-xs" style={synthesisBodyMuted}>
                      {formatDate(dasha.startDate)} to {formatDate(dasha.endDate)}
                    </p>
                  </div>
                  {dasha.overallStrength !== undefined && (
                    <p className={`text-xs font-medium ${getTextColor(dasha.overallStrength)}`}>
                      {dasha.overallStrength}/100
                    </p>
                  )}
                </div>

                {/* Antardasha Sub-periods */}
                {dasha.antardashas && dasha.antardashas.length > 0 && (
                  <div className="border-t border-[rgba(200,135,58,0.1)] bg-white/[0.02] px-3 py-2">
                    <p className={`${synthesisLabelClass} mb-1 opacity-80`} style={synthesisLabelStyle}>
                      Sub-periods ({dasha.antardashas.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {dasha.antardashas.slice(0, 4).map((antar: any, aidx: number) => (
                        <span
                          key={aidx}
                          className="rounded-md border border-[rgba(200,135,58,0.12)] bg-[rgba(13,18,32,0.5)] px-2 py-1 text-xs text-[rgba(240,220,160,0.72)]"
                        >
                          {antar.antardashaPlanet}
                        </span>
                      ))}
                      {dasha.antardashas.length > 4 && (
                        <span className="px-2 py-1 text-xs" style={synthesisBodyMuted}>
                          +{dasha.antardashas.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={synthesisInnerPanelDense}>
        <p className={`${synthesisLabelClass} mb-2`} style={synthesisLabelStyle}>
          Activation strength
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
            <span style={synthesisBodyMuted}>80-100: Strong</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500/50" />
            <span style={synthesisBodyMuted}>60-79: Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
            <span style={synthesisBodyMuted}>40-59: Weak</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/50" />
            <span style={synthesisBodyMuted}>&lt;40: Challenged</span>
          </div>
        </div>
      </div>
    </div>
  );
}

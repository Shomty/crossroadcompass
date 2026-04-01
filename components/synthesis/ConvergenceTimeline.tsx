// STATUS: done | Synthesis Engine Phase 4.5
/**
 * components/synthesis/ConvergenceTimeline.tsx
 * Merged Western + Vedic timeline showing convergence events.
 * Convergence score (0-100) with matched rules on tap.
 */

"use client";

import { useState } from "react";
import type { ConvergenceEvent } from "@/types";
import { ChevronDown } from "lucide-react";
import {
  synthesisBodyMuted,
  synthesisCream,
  synthesisLabelClass,
  synthesisLabelStyle,
} from "@/components/synthesis/synthesisPanelClasses";

interface ConvergenceTimelineProps {
  events: ConvergenceEvent[];
}

function getConvergenceColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500/30 border-emerald-400';
  if (score >= 60) return 'bg-amber-500/30 border-amber-400';
  if (score >= 40) return 'bg-yellow-500/30 border-yellow-400';
  return "border-[rgba(200,135,58,0.12)] bg-[rgba(13,18,32,0.42)]";
}

export function ConvergenceTimeline({ events }: ConvergenceTimelineProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  if (!events || events.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm" style={synthesisBodyMuted}>
          No significant convergence events in this period
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <div
          key={event.date}
          className={`overflow-hidden rounded-[12px] border transition-all ${getConvergenceColor(
            event.convergenceScore,
          )}`}
        >
          <button
            onClick={() => setExpandedDate(expandedDate === event.date ? null : event.date)}
            className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
          >
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-medium" style={synthesisCream}>
                {event.date}
              </p>
              <p className="mt-1 text-xs" style={synthesisBodyMuted}>
                {event.dasha.planetName} • Convergence: {event.convergenceScore}/100
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform text-[rgba(240,220,160,0.45)] ${
                expandedDate === event.date ? "rotate-180" : ""
              }`}
            />
          </button>

          {expandedDate === event.date && (
            <div className="space-y-3 border-t border-[rgba(200,135,58,0.1)] bg-white/[0.02] px-4 py-3">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className={synthesisLabelClass} style={synthesisLabelStyle}>
                    Convergence strength
                  </p>
                  <p className="font-serif text-sm text-[color:var(--amber,#c8873a)]">
                    {event.convergenceScore}/100
                  </p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(13,18,32,0.55)]">
                  <div
                    className="h-full bg-[linear-gradient(135deg,#c8873a,#e8b96a)] transition-all"
                    style={{ width: `${event.convergenceScore}%` }}
                  />
                </div>
              </div>

              <div>
                <p className={`${synthesisLabelClass} mb-1`} style={synthesisLabelStyle}>
                  Vedic period
                </p>
                <p className="text-sm" style={synthesisCream}>
                  {event.dasha.planetName}
                </p>
                <p className="mt-1 text-xs" style={synthesisBodyMuted}>
                  {event.dasha.startDate instanceof Date
                    ? event.dasha.startDate.toLocaleDateString()
                    : 'TBD'}{' '}
                  -{' '}
                  {event.dasha.endDate instanceof Date
                    ? event.dasha.endDate.toLocaleDateString()
                    : 'TBD'}
                </p>
              </div>

              {/* Transit Info */}
              {event.transitEvent && (
                <div>
                  <p className={`${synthesisLabelClass} mb-1`} style={synthesisLabelStyle}>
                    Western transit
                  </p>
                  <p className="text-sm" style={synthesisCream}>
                    {event.transitEvent.description}
                  </p>
                </div>
              )}

              {event.matchedRules.length > 0 && (
                <div>
                  <p className={`${synthesisLabelClass} mb-2`} style={synthesisLabelStyle}>
                    Astrological rules
                  </p>
                  <div className="space-y-2">
                    {event.matchedRules.slice(0, 2).map((rule) => (
                      <p key={rule.id} className="text-xs leading-relaxed" style={synthesisBodyMuted}>
                        <span className="text-[color:var(--amber,#c8873a)]">→</span> {rule.verdict}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {event.reasoning.length > 0 && (
                <div className="border-t border-[rgba(200,135,58,0.1)] pt-2">
                  <p className="text-xs italic leading-relaxed" style={synthesisBodyMuted}>
                    {event.reasoning[0]}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// STATUS: done | Synthesis Engine Phase 4.2
/**
 * components/synthesis/WesternTransitView.tsx
 * Display Western transits as a 30-day calendar with color-coded planets and aspect strength.
 * Shows life stage events (Saturn Return, Uranus Opposition, Jupiter returns).
 */

"use client";

import type { TransitTimeline } from "@/types";
import {
  synthesisBodyMuted,
  synthesisCream,
  synthesisInnerPanel,
  synthesisLabelClass,
  synthesisLabelStyle,
  synthesisNestedPanelBase,
} from "@/components/synthesis/synthesisPanelClasses";

interface WesternTransitViewProps {
  transitTimeline: TransitTimeline;
}

function getPlanetColor(planet: string): string {
  const colors: Record<string, string> = {
    sun: 'text-yellow-400',
    moon: 'text-slate-300',
    mercury: 'text-orange-300',
    venus: 'text-emerald-300',
    mars: 'text-red-400',
    jupiter: 'text-amber-400',
    saturn: 'text-orange-600',
    uranus: 'text-cyan-400',
    neptune: 'text-purple-400',
    pluto: 'text-indigo-400',
  };
  return colors[planet.toLowerCase()] || "text-white/55";
}

function getEventTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'saturn-return': 'bg-red-500/30 border-red-400/50',
    'uranus-opposition': 'bg-cyan-500/30 border-cyan-400/50',
    'jupiter-return': 'bg-amber-500/30 border-amber-400/50',
    'neptune-transit-begin': 'bg-purple-500/30 border-purple-400/50',
    other: "border-[rgba(200,135,58,0.12)] bg-[rgba(13,18,32,0.42)]",
  };
  return colors[type] || "border-[rgba(200,135,58,0.12)] bg-[rgba(13,18,32,0.42)]";
}

function formatPlanetName(planet: string): string {
  return planet.charAt(0).toUpperCase() + planet.slice(1);
}

export function WesternTransitView({
  transitTimeline,
}: WesternTransitViewProps) {
  const { transits, keyEvents } = transitTimeline;

  return (
    <div className="flex flex-col gap-4">
      {keyEvents && keyEvents.length > 0 && (
        <div className={synthesisInnerPanel}>
          <p className={`${synthesisLabelClass} mb-3`} style={synthesisLabelStyle}>
            Key events
          </p>
          <div className="space-y-2">
            {keyEvents.slice(0, 3).map((event, idx) => (
              <div
                key={idx}
                className={`rounded-[12px] border p-3 ${getEventTypeColor(event.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium" style={synthesisCream}>
                      {event.date}
                    </p>
                    <p className="mt-1 text-xs" style={synthesisBodyMuted}>
                      {event.description}
                    </p>
                  </div>
                  <span className={`text-xs font-medium ${getPlanetColor(event.planet)}`}>
                    {formatPlanetName(event.planet)}
                  </span>
                </div>
                <p className="mt-2 text-xs" style={synthesisBodyMuted}>
                  Strength: {event.strength}/100
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transit Timeline */}
      <div className="flex flex-col gap-3">
        {!transits || transits.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm" style={synthesisBodyMuted}>
              No transits in this period
            </p>
          </div>
        ) : (
          transits.map((transit, idx) => {
            const hasKeyEvent = keyEvents?.some((e) => e.date === transit.date);

            return (
              <div
                key={idx}
                className={`overflow-hidden border transition-all ${
                  hasKeyEvent
                    ? "rounded-[12px] border-[rgba(200,135,58,0.35)] bg-[rgba(200,135,58,0.08)]"
                    : synthesisNestedPanelBase
                }`}
              >
                <div className="border-b border-[rgba(200,135,58,0.1)] px-4 py-3">
                  <p className="text-sm font-medium" style={synthesisCream}>
                    {transit.date}
                  </p>
                  <p className="mt-1 text-xs" style={synthesisBodyMuted}>
                    {transit.planets.length} planets • {transit.aspects?.length || 0} aspects
                  </p>
                </div>

                {/* Planets */}
                {transit.planets && transit.planets.length > 0 && (
                  <div className="space-y-2 border-b border-[rgba(200,135,58,0.1)] px-4 py-3">
                    <p className={synthesisLabelClass} style={synthesisLabelStyle}>
                      Planets
                    </p>
                    <div className="space-y-1">
                      {transit.planets.slice(0, 5).map((planet, pidx) => (
                        <div key={pidx} className="flex items-start justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${getPlanetColor(planet.name)}`}>
                              {formatPlanetName(planet.name)}
                            </span>
                            {planet.isRetrograde && (
                              <span className="text-red-400 font-medium">R</span>
                            )}
                          </div>
                          <span className="text-xs" style={synthesisBodyMuted}>
                            {planet.sign} {planet.signDegree.toFixed(1)}°
                          </span>
                        </div>
                      ))}
                      {transit.planets.length > 5 && (
                        <p className="text-xs" style={synthesisBodyMuted}>
                          +{transit.planets.length - 5} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Aspects */}
                {transit.aspects && transit.aspects.length > 0 && (
                  <div className="space-y-2 px-4 py-3">
                    <p className={synthesisLabelClass} style={synthesisLabelStyle}>
                      Aspects
                    </p>
                    <div className="space-y-1">
                      {transit.aspects.slice(0, 3).map((aspect, aidx) => (
                        <div key={aidx} className="text-xs leading-relaxed" style={synthesisBodyMuted}>
                          <span className="text-[color:var(--amber,#c8873a)]">→</span>{" "}
                          {formatPlanetName(aspect.planet1)} {aspect.angleName}{" "}
                          {formatPlanetName(aspect.planet2)} (strength: {aspect.strength})
                        </div>
                      ))}
                      {transit.aspects.length > 3 && (
                        <p className="text-xs" style={synthesisBodyMuted}>
                          +{transit.aspects.length - 3} more aspects
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

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
  synthesisCardStyle,
  synthesisNestedCardBaseStyle,
  synthesisLabelClass,
  synthesisLabelStyle,
} from "@/components/synthesis/synthesisPanelClasses";

interface WesternTransitViewProps {
  transitTimeline: TransitTimeline;
}

function getPlanetColor(planet: string): string {
  const colors: Record<string, string> = {
    sun:     'text-[color:var(--gold,#e8b96a)]',
    moon:    'text-[rgba(240,220,160,0.60)]',
    mercury: 'text-[color:var(--gold-solar,#D4AF37)]',
    venus:   'text-[#EDE9FF]',
    mars:    'text-[color:var(--amber,#c8873a)]',
    jupiter: 'text-[color:var(--gold-solar,#D4AF37)]',
    saturn:  'text-[rgba(200,135,58,0.55)]',
    uranus:  'text-[color:var(--accent-indigo,#818CF8)]',
    neptune: 'text-[rgba(124,58,237,0.85)]',
    pluto:   'text-[rgba(124,58,237,0.65)]',
  };
  return colors[planet.toLowerCase()] || "text-[rgba(240,220,160,0.45)]";
}

function getEventTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'saturn-return':          'bg-[rgba(200,135,58,0.10)] border-[rgba(200,135,58,0.35)]',
    'uranus-opposition':      'bg-[rgba(129,140,248,0.08)] border-[rgba(129,140,248,0.30)]',
    'jupiter-return':         'bg-[rgba(200,135,58,0.08)] border-[rgba(200,135,58,0.25)]',
    'neptune-transit-begin':  'bg-[rgba(124,58,237,0.08)] border-[rgba(124,58,237,0.25)]',
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
    <div className="flex flex-col gap-6">
      {keyEvents && keyEvents.length > 0 && (
        <div style={synthesisCardStyle}>
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
                className={hasKeyEvent ? "overflow-hidden border transition-all rounded-[12px] border-[rgba(200,135,58,0.35)] bg-[rgba(200,135,58,0.08)]" : "overflow-hidden transition-all"}
                style={hasKeyEvent ? undefined : { ...synthesisNestedCardBaseStyle, overflow: "hidden" }}
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
                              <span className="font-medium text-[rgba(200,135,58,0.65)]">R</span>
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
                        <div key={aidx} className="text-sm leading-relaxed" style={synthesisBodyMuted}>
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

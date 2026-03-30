"use client";

import { useEffect } from "react";
import type { HouseNumber, Planet, PlanetaryPositions } from "openastrology-library";

interface Props {
  planets: PlanetaryPositions;
  selected: Planet | null;
  onClear: () => void;
}

const CX = 120;
const CY = 120;
const R = 90;

function houseAngle(h: HouseNumber) {
  return (-90 + (h - 1) * 30) * (Math.PI / 180);
}

function polar(h: HouseNumber, r: number) {
  const a = houseAngle(h);
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

export function DrushtiVisualizer({ planets, selected, onClear }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClear();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClear]);

  const hasAny = Object.values(planets).some((p) => p.aspects.length > 0);
  if (!hasAny) {
    return <p className="text-muted-chart">Aspect data unavailable for this chart.</p>;
  }

  const p = selected ? planets[selected] : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={240} height={240} viewBox="0 0 240 240" className="text-[rgba(232,185,106,0.85)]">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="currentColor" strokeOpacity={0.25} />
        {Array.from({ length: 12 }).map((_, i) => {
          const h = (i + 1) as HouseNumber;
          const outer = polar(h, R);
          const inner = polar(h, R - 18);
          return (
            <line
              key={h}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="currentColor"
              strokeOpacity={0.35}
            />
          );
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const h = (i + 1) as HouseNumber;
          const pt = polar(h, R - 28);
          return (
            <text key={h} x={pt.x} y={pt.y} fontSize={11} textAnchor="middle" fill="currentColor" opacity={0.85}>
              {h}
            </text>
          );
        })}
        {p &&
          p.aspects.map((a, i) => {
            const from = polar(p.house, R - 40);
            const to = polar(a.house as HouseNumber, R - 40);
            const dash = a.aspect === 7 ? undefined : a.aspect === 4 || a.aspect === 8 ? "6 4" : "2 4";
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#a5b4fc"
                strokeWidth={1.5}
                strokeDasharray={dash}
              />
            );
          })}
        {p && (
          <circle cx={polar(p.house, R - 40).x} cy={polar(p.house, R - 40).y} r={6} fill="#818cf8" />
        )}
      </svg>
      <p className="text-center text-sm leading-snug text-[var(--mist)]">
        {p ? (
          <>
            Drishti from <span className="text-[var(--cream)]">{selected}</span> — click row again to clear (Esc).
          </>
        ) : (
          <>Select a planet row to visualize Vedic aspects toward other houses.</>
        )}
      </p>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import type { VedicChartCalculations } from "openastrology-library";

interface Props {
  transitChart: VedicChartCalculations;
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Astronomy ──────────────────────────────────────────────────────────────

function calcMoonPosition(moonLonDeg: number, userLat: number, userLng: number) {
  const JD = Date.now() / 86400000 + 2440587.5;
  const T = (JD - 2451545.0) / 36525;
  const GMST = ((280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T) % 360 + 360) % 360;
  const LST = (GMST + userLng + 360) % 360;
  const tropLon = (moonLonDeg + 24.13 + 360) % 360;
  const epsRad = 23.44 * (Math.PI / 180);
  const lonRad = tropLon * (Math.PI / 180);
  const raRad = Math.atan2(Math.cos(epsRad) * Math.sin(lonRad), Math.cos(lonRad));
  const ra = ((raRad * (180 / Math.PI)) + 360) % 360;
  const decRad = Math.asin(Math.sin(epsRad) * Math.sin(lonRad));
  const HA = (LST - ra + 360) % 360;
  const haNorm = HA > 180 ? HA - 360 : HA;
  const haRad = haNorm * (Math.PI / 180);
  const latRad = userLat * (Math.PI / 180);
  const altitude = Math.asin(
    Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad),
  ) * (180 / Math.PI);
  return { altitude, hourAngle: haNorm };
}

function moonPhaseName(angle: number) {
  if (angle < 22.5 || angle >= 337.5) return "New Moon";
  if (angle < 67.5) return "Waxing Crescent";
  if (angle < 112.5) return "First Quarter";
  if (angle < 157.5) return "Waxing Gibbous";
  if (angle < 202.5) return "Full Moon";
  if (angle < 247.5) return "Waning Gibbous";
  if (angle < 292.5) return "Last Quarter";
  return "Waning Crescent";
}

// ── Moon phase disc ────────────────────────────────────────────────────────
// Renders accurately lit/dark hemisphere as an SVG, same technique as react-moonphase.

function moonLitPath(r: number, phase: number): string {
  if (phase <= 2 || phase >= 358) return "";
  if (phase >= 178 && phase <= 182)
    return `M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r} Z`;
  const waxing = phase < 180;
  if (waxing) {
    const tx = r * Math.cos(phase * (Math.PI / 180));
    const rx = Math.max(0.5, Math.abs(tx));
    return `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${rx} ${r} 0 0 ${tx > 0 ? 0 : 1} 0 ${-r} Z`;
  }
  const mtx = r * Math.cos((360 - phase) * (Math.PI / 180));
  const mrx = Math.max(0.5, Math.abs(mtx));
  return `M 0 ${-r} A ${mrx} ${r} 0 0 ${mtx > 0 ? 1 : 0} 0 ${r} A ${r} ${r} 0 0 0 0 ${-r} Z`;
}

function MoonDisc({ phaseAngle, size = 96 }: { phaseAngle: number; size?: number }) {
  const r = (size / 2) - 2;
  const cx = size / 2;
  const cy = size / 2;
  const litPath = moonLitPath(r, phaseAngle);
  const glowR = r + 8;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <defs>
        <radialGradient id="moonSurface" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="rgba(240,230,210,0.98)" />
          <stop offset="60%" stopColor="rgba(210,200,185,0.95)" />
          <stop offset="100%" stopColor="rgba(175,165,150,0.92)" />
        </radialGradient>
        <radialGradient id="moonDark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(18,20,35,0.97)" />
          <stop offset="100%" stopColor="rgba(8,10,22,0.99)" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(220,205,175,0.18)" />
          <stop offset="100%" stopColor="rgba(220,205,175,0)" />
        </radialGradient>
        <filter id="moonBlur">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Outer glow */}
      <circle cx={cx} cy={cy} r={glowR} fill="url(#moonGlow)" />

      {/* Dark side */}
      <circle cx={cx} cy={cy} r={r} fill="url(#moonDark)" />

      {/* Lit portion */}
      {litPath && (
        <g transform={`translate(${cx},${cy})`}>
          <path d={litPath} fill="url(#moonSurface)" />
        </g>
      )}

      {/* Rim */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(220,205,170,0.22)" strokeWidth="1" />
    </svg>
  );
}

// ── Compact sky bar ────────────────────────────────────────────────────────
// E ←────●────→ W  showing where moon sits on the horizon arc

function SkyBar({ hourAngle, altitude }: { hourAngle: number; altitude: number }) {
  // Map HA [-90, 90] → [0%, 100%], clamp to visible range
  const pos = Math.max(2, Math.min(98, ((hourAngle + 90) / 180) * 100));
  const visible = altitude > -3;

  return (
    <div style={{ padding: "0 4px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.22)",
          marginBottom: 6,
        }}
      >
        <span>E</span>
        <div style={{ flex: 1, position: "relative", height: 16 }}>
          {/* Track */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 1,
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.1)",
            }}
          />
          {/* Zenith tick */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 1,
              height: 6,
              background: "rgba(255,255,255,0.15)",
            }}
          />
          {/* Moon dot */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${pos}%`,
              transform: "translate(-50%, -50%)",
              width: visible ? 8 : 6,
              height: visible ? 8 : 6,
              borderRadius: "50%",
              background: visible
                ? "radial-gradient(circle, rgba(230,215,180,0.95) 0%, rgba(200,185,155,0.7) 100%)"
                : "rgba(255,255,255,0.18)",
              boxShadow: visible ? "0 0 6px rgba(220,205,160,0.6)" : "none",
              transition: "left 0.6s ease",
            }}
          />
        </div>
        <span>W</span>
      </div>
      <p
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          textAlign: "center",
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.12em",
          margin: 0,
        }}
      >
        {visible ? `${Math.round(altitude)}° above horizon` : "below horizon"}
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────

export function MoonTracker({ transitChart }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const moon = transitChart.planets.moon;
  const lonInSign = moon.longitude % 30;
  const pct = (lonInSign / 30) * 100;
  const transitioning = lonInSign > 25;

  const phaseAngle = useMemo(
    () => (moon.longitude - transitChart.planets.sun.longitude + 360) % 360,
    [moon.longitude, transitChart.planets.sun.longitude],
  );
  const phaseName = moonPhaseName(phaseAngle);
  const litFraction = Math.round(((1 - Math.cos(phaseAngle * (Math.PI / 180))) / 2) * 100);

  const skyData = useMemo(
    () => (coords ? calcMoonPosition(moon.longitude, coords.lat, coords.lng) : null),
    [moon.longitude, coords],
  );

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { timeout: 8000, maximumAge: 300_000 },
    );
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        width: "100%",
      }}
    >
      {/* Moon disc */}
      <div
        style={{
          position: "relative",
          marginBottom: 12,
          filter: "drop-shadow(0 0 18px rgba(210,195,160,0.22))",
        }}
      >
        <MoonDisc phaseAngle={phaseAngle} size={100} />
      </div>

      {/* Phase name */}
      <div
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: "0.95rem",
          fontWeight: 400,
          color: "rgba(240,228,200,0.92)",
          letterSpacing: "0.04em",
          textAlign: "center",
          marginBottom: 3,
        }}
      >
        {phaseName}
      </div>

      {/* Lit % */}
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--muted)",
          marginBottom: 14,
          textAlign: "center",
        }}
      >
        {litFraction}% illuminated
      </div>

      {/* Divider */}
      <div
        style={{
          width: "100%",
          height: 1,
          background: "var(--border)",
          marginBottom: 12,
        }}
      />

      {/* Sign / Nakshatra */}
      <div style={{ width: "100%", marginBottom: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, sans-serif",
              fontSize: 13,
              color: "rgba(240,228,200,0.88)",
            }}
          >
            ☽&ensp;{cap(moon.sign)}
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.1em",
              color: "var(--muted)",
            }}
          >
            {cap(moon.nakshatra)} P{moon.nakshatraPada}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 2,
            borderRadius: 99,
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 99,
              background: transitioning
                ? "linear-gradient(90deg, var(--gold), var(--amber))"
                : "rgba(232,185,106,0.5)",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        {transitioning && (
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, sans-serif",
              fontSize: 11,
              color: "var(--gold)",
              opacity: 0.8,
              marginTop: 6,
              lineHeight: 1.4,
            }}
          >
            Sign change soon
          </p>
        )}
      </div>

      {/* Sky position bar (when geolocation available) */}
      {skyData && (
        <>
          <div style={{ width: "100%", height: 1, background: "var(--border)", marginBottom: 10 }} />
          <div style={{ width: "100%" }}>
            <SkyBar hourAngle={skyData.hourAngle} altitude={skyData.altitude} />
          </div>
        </>
      )}

      {/* Retrograde */}
      {moon.isRetrograde && (
        <div
          style={{
            marginTop: 8,
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--amber)",
            border: "1px solid rgba(200,135,58,0.25)",
            borderRadius: 3,
            padding: "2px 6px",
          }}
        >
          (R) Retrograde
        </div>
      )}
    </div>
  );
}

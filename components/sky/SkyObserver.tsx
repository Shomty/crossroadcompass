"use client";
// STATUS: done | Sky Observer Integration
/**
 * components/sky/SkyObserver.tsx
 * Vedic Sky Observer adapted for the Crossroads Compass SaaS.
 * Logic is verbatim from vedic-sky-observer/src/App.tsx.
 * Style changes: amber/gold palette, Cinzel headings, no standalone header.
 * Accepts defaultLat/defaultLon from the server page (birth profile coords).
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  calculatePositions,
  type PlanetPosition,
  detectYogas,
  calculateAshtakavarga,
  RASHIS,
  RASHI_DATA,
  analyzeTransits,
} from "@/lib/sky/vedic-utils";
import { format } from "date-fns";
import SunCalc from "suncalc";
import {
  Clock,
  Zap,
  CircleDot,
  ChevronRight,
  Activity,
  Play,
  Rewind,
  FastForward,
  MapPin,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Amber/gold palette tokens ────────────────────────────────────────────
const AMBER = {
  accent: "#c8873a",
  highlight: "#e8b96a",
  tint10: "rgba(200,135,58,0.10)",
  tint15: "rgba(200,135,58,0.15)",
  tint20: "rgba(200,135,58,0.20)",
  tint50: "rgba(200,135,58,0.50)",
};

const RAIL = {
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--border)",
    borderRadius: 16,
  } as const,
  glowCard: {
    background:
      "linear-gradient(180deg, rgba(200,135,58,0.07) 0%, rgba(255,255,255,0.03) 22%, rgba(255,255,255,0.03) 100%)",
    border: "1px solid var(--border-lit)",
    borderRadius: 16,
  } as const,
};

function RailCard({
  children,
  glow = false,
  className,
}: {
  children: React.ReactNode;
  glow?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("overflow-hidden", className)} style={glow ? RAIL.glowCard : RAIL.card}>
      {children}
    </section>
  );
}

function RailLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="ui-label"
      style={{
        color: "var(--amber)",
        opacity: 0.82,
      }}
    >
      {children}
    </span>
  );
}

function MetaChip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "amber" | "success" | "danger" | "cool";
}) {
  const tones = {
    neutral: {
      background: "rgba(255,255,255,0.04)",
      color: "var(--mist)",
      border: "1px solid var(--border)",
    },
    amber: {
      background: "rgba(200,135,58,0.10)",
      color: "var(--amber)",
      border: "1px solid rgba(200,135,58,0.22)",
    },
    success: {
      background: "rgba(52,211,153,0.10)",
      color: "rgba(110,231,183,0.95)",
      border: "1px solid rgba(52,211,153,0.18)",
    },
    danger: {
      background: "rgba(244,63,94,0.10)",
      color: "rgba(251,113,133,0.95)",
      border: "1px solid rgba(244,63,94,0.18)",
    },
    cool: {
      background: "rgba(96,165,250,0.10)",
      color: "rgba(147,197,253,0.95)",
      border: "1px solid rgba(96,165,250,0.18)",
    },
  } as const;

  return (
    <span
      style={{
        ...tones[tone],
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        borderRadius: 999,
        padding: "5px 10px",
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

interface SkyObserverProps {
  defaultLat?: number | null;
  defaultLon?: number | null;
}

// ─── Continuous angle hook (prevents wrap-around jumps) ───────────────────

function useContinuousAngle(targetAngle: number) {
  const prevTargetRef = useRef(targetAngle);
  const continuousAngleRef = useRef(targetAngle);

  if (targetAngle !== prevTargetRef.current) {
    let diff = targetAngle - prevTargetRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    continuousAngleRef.current += diff;
    prevTargetRef.current = targetAngle;
  }

  return continuousAngleRef.current;
}

// ─── Planet ring radii & styles ───────────────────────────────────────────

const PLANET_RING_STYLES: Record<
  string,
  { radius: number; color: string; borderStyle: string; opacity: number }
> = {
  Ascendant: { radius: 100, color: "#10B981", borderStyle: "solid", opacity: 0.3 },
  Ketu:      { radius: 92,  color: "#A9A9A9", borderStyle: "dashed", opacity: 0.2 },
  Rahu:      { radius: 84,  color: "#8A2BE2", borderStyle: "dashed", opacity: 0.2 },
  Saturn:    { radius: 76,  color: "#708090", borderStyle: "dotted", opacity: 0.3 },
  Jupiter:   { radius: 68,  color: AMBER.highlight, borderStyle: "solid", opacity: 0.25 },
  Mars:      { radius: 60,  color: "#FF4500", borderStyle: "solid", opacity: 0.2 },
  Sun:       { radius: 52,  color: "#FFD700", borderStyle: "solid", opacity: 0.3 },
  Venus:     { radius: 44,  color: "#FF69B4", borderStyle: "solid", opacity: 0.2 },
  Mercury:   { radius: 36,  color: "#00CED1", borderStyle: "dotted", opacity: 0.3 },
  Moon:      { radius: 28,  color: "#F0F8FF", borderStyle: "dashed", opacity: 0.2 },
};

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── ZodiacLabel sub-component ────────────────────────────────────────────

interface ZodiacLabelProps {
  index: number;
  mapOffset: number;
  selectedZodiac: number | null;
  setSelectedZodiac: (idx: number | null) => void;
}

const ZodiacLabel: React.FC<ZodiacLabelProps> = ({
  index,
  mapOffset,
  selectedZodiac,
  setSelectedZodiac,
}) => {
  const targetAngle = index * 30 + mapOffset + 15;
  const angle = useContinuousAngle(targetAngle);
  const isSelected = selectedZodiac === index;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{ rotate: angle }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
    >
      <div
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-auto cursor-pointer transition-all duration-500",
          isSelected
            ? "shadow-[inset_0_0_40px_rgba(200,135,58,0.08)]"
            : "hover:bg-white/[0.03]"
        )}
        style={{
          clipPath: "polygon(50% 50%, 36.6% 0%, 63.4% 0%)",
          background: isSelected ? AMBER.tint10 : undefined,
        }}
        onClick={() => setSelectedZodiac(isSelected ? null : index)}
      />
      <div
        className="absolute top-0 left-1/2 w-px h-full bg-white/5 -translate-x-1/2"
        style={{ transform: "rotate(-15deg)" }}
      />
      <div
        className="absolute top-0 left-1/2 w-px h-full bg-white/5 -translate-x-1/2"
        style={{ transform: "rotate(15deg)" }}
      />

      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-[10px] font-mono uppercase transition-all duration-300"
        style={{
          color: isSelected ? "var(--cc-text-secondary)" : "var(--cc-text-tertiary)",
          letterSpacing: "0.08em",
          fontWeight: isSelected ? 700 : 400,
          filter: isSelected ? `drop-shadow(0 0 8px ${AMBER.tint50})` : undefined,
          transform: isSelected ? "scale(1.1)" : undefined,
        }}
        animate={{ rotate: -angle }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        {["ARI","TAU","GEM","CAN","LEO","VIR","LIB","SCO","SAG","CAP","AQU","PIS"][index]}
      </motion.div>
    </motion.div>
  );
};

// ─── PlanetMarker sub-component ───────────────────────────────────────────

interface PlanetMarkerProps {
  p: PlanetPosition;
  mapOffset: number;
  selectedPlanet: string | null;
  setSelectedPlanet: (name: string | null) => void;
  selectedZodiac: number | null;
}

const PlanetMarker: React.FC<PlanetMarkerProps> = ({
  p,
  mapOffset,
  selectedPlanet,
  setSelectedPlanet,
  selectedZodiac,
}) => {
  const targetAngle = p.siderealLongitude + mapOffset;
  const angle = useContinuousAngle(targetAngle);
  const radius = PLANET_RING_STYLES[p.name]?.radius || 100;
  const isInSelectedZodiac = selectedZodiac !== null && p.rashi === RASHIS[selectedZodiac];

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none group"
      animate={{ rotate: angle }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: `${50 - radius / 2}%` }}
      >
        <motion.div
          className="relative flex flex-col items-center"
          animate={{ rotate: -angle }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        >
          <motion.div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 pointer-events-auto cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)]",
              p.symbol.length > 1 ? "text-[10px]" : "text-sm",
              selectedPlanet === p.name
                ? "scale-125 ring-2 ring-white z-50 shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                : isInSelectedZodiac
                ? "scale-115 z-40"
                : "group-hover:scale-110 hover:z-40"
            )}
            style={{
              backgroundColor: p.color,
              color: "#000",
              boxShadow: isInSelectedZodiac
                ? `0 0 25px ${p.color}, 0 0 10px ${AMBER.tint50}`
                : undefined,
            }}
            layoutId={`planet-${p.name}`}
            onClick={() => setSelectedPlanet(selectedPlanet === p.name ? null : p.name)}
          >
            {p.symbol}
          </motion.div>
          <AnimatePresence>
            {(selectedPlanet === p.name || (isInSelectedZodiac && !selectedPlanet)) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute top-full mt-2 bg-black/90 backdrop-blur-md px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-auto z-50 flex flex-col items-center shadow-xl"
                style={{
                  border: `1px solid ${selectedPlanet === p.name ? "rgba(255,255,255,0.4)" : AMBER.tint50}`,
                }}
              >
                <div className="font-bold">
                  {p.name} {p.degree}°{p.minute}&apos;
                </div>
                {p.house && (
                  <div
                    className="text-[8px] uppercase tracking-widest mt-0.5"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {getOrdinal(p.house)} House
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────

export function SkyObserver({ defaultLat, defaultLon }: SkyObserverProps) {
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedZodiac, setSelectedZodiac] = useState<number | null>(null);
  const [isYogasExpanded, setIsYogasExpanded] = useState(false);
  const [isTransitsExpanded, setIsTransitsExpanded] = useState(false);

  // Seed location from birth profile, then allow browser override
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    defaultLat != null && defaultLon != null ? { lat: defaultLat, lon: defaultLon } : null
  );
  const [city, setCity] = useState<string | null>(
    defaultLat != null && defaultLon != null ? "Your birth location" : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const locateMe = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by this browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLocation({ lat, lon });
        try {
          const res = await fetch("/api/transit/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: lat, longitude: lon }),
          });
          if (res.ok) {
            const data = await res.json();
            setCity(data.city ?? `${lat.toFixed(2)}, ${lon.toFixed(2)}`);
          } else {
            setCity(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
          }
        } catch {
          setCity(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
        }
        setIsLocating(false);
      },
      (err) => {
        setLocationError(err.message);
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // Auto-geolocate on mount only if no birth profile coords provided
  useEffect(() => {
    if (defaultLat == null || defaultLon == null) {
      locateMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize currentTime client-side to avoid SSR hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date());
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isLive]);

  const adjustTime = (days: number) => {
    setIsLive(false);
    setCurrentTime((prev) => new Date((prev ?? new Date()).getTime() + days * 86400000));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    setIsLive(false);
    setCurrentTime(new Date(e.target.value));
  };

  const formatForInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const positions = useMemo(
    () => currentTime ? calculatePositions(currentTime, location?.lat, location?.lon) : [],
    [currentTime, location]
  );
  const yogas = useMemo(() => detectYogas(positions), [positions]);
  const ashtakavarga = useMemo(() => calculateAshtakavarga(positions), [positions]);
  const transits = useMemo(() => analyzeTransits(positions), [positions]);

  const sunTimes = useMemo(() => {
    if (!location || !currentTime) return null;
    return SunCalc.getTimes(currentTime, location.lat, location.lon);
  }, [currentTime, location]);

  const exportData = () => {
    const data = {
      timestamp: currentTime?.toISOString() ?? new Date().toISOString(),
      location: { lat: location?.lat, lon: location?.lon, city },
      sunTimes: sunTimes
        ? { sunrise: sunTimes.sunrise.toISOString(), sunset: sunTimes.sunset.toISOString() }
        : null,
      planetaryPositions: positions.map((p) => ({
        name: p.name,
        longitude: p.longitude,
        siderealLongitude: p.siderealLongitude,
        isRetrograde: p.isRetrograde,
        isCombust: p.isCombust,
        rashi: p.rashi,
        nakshatra: p.nakshatra,
        pada: p.pada,
        dignity: p.dignity,
        degree: p.degree,
        minute: p.minute,
      })),
      yogas,
      ashtakavarga,
      transits,
      rashiData: RASHI_DATA,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vedic-sky-${format(currentTime ?? new Date(), "yyyy-MM-dd-HHmm")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activePlanet = useMemo(
    () => positions.find((p) => p.name === selectedPlanet) || positions[0],
    [positions, selectedPlanet]
  );

  const ascendant = useMemo(() => positions.find((p) => p.name === "Ascendant"), [positions]);
  const mapOffset = ascendant ? -ascendant.siderealLongitude - 90 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Two-column layout: sky map + data rail ───────────────── */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Sky Map */}
        <div
          className="lg:col-span-7 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] rounded-2xl p-6 flex items-center justify-center relative overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at center, #0d102080 0%, var(--cc-bg-page, #07080f) 70%)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="relative w-full max-w-[680px] aspect-square">
            {/* Planetary rings */}
            {Object.entries(PLANET_RING_STYLES).map(([name, style]) => {
              const isSelected = selectedPlanet === name;
              return (
                <div
                  key={`ring-${name}`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-500"
                  style={{
                    width: `${style.radius}%`,
                    height: `${style.radius}%`,
                    borderWidth: name === "Ascendant" ? "2px" : "1px",
                    borderStyle: style.borderStyle,
                    borderColor:
                      name === "Ascendant"
                        ? "rgba(42, 184, 150, 0.3)"
                        : "rgba(255,255,255,0.06)",
                    opacity: isSelected ? 0.8 : style.opacity,
                    boxShadow: isSelected
                      ? `0 0 20px ${style.color}40 inset, 0 0 20px ${style.color}40`
                      : "none",
                    zIndex: isSelected ? 10 : 0,
                  }}
                />
              );
            })}

            {/* Earth center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20" />
              <div className="absolute w-32 h-32 border border-blue-500/20 rounded-full animate-[ping_3s_infinite]" />
            </div>

            {/* Horizon line */}
            <div className="absolute top-1/2 left-4 right-4 h-px bg-white/20 -translate-y-1/2 pointer-events-none z-10" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-full pr-2 z-10 flex items-center gap-1.5">
              <span className="cc-tag cc-tag--teal" style={{ fontSize: 9, padding: "1px 6px" }}>
                ASC
              </span>
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: 9,
                  color: "var(--cc-text-secondary)",
                  letterSpacing: "0.08em",
                }}
              >
                East (Lagna)
              </span>
            </div>
            <div
              className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-full pl-2 font-mono uppercase z-10"
              style={{
                fontSize: 10,
                color: "var(--cc-text-secondary)",
                letterSpacing: "0.08em",
              }}
            >
              West
            </div>

            {/* Zodiac labels */}
            {Array.from({ length: 12 }).map((_, i) => (
              <ZodiacLabel
                key={i}
                index={i}
                mapOffset={mapOffset}
                selectedZodiac={selectedZodiac}
                setSelectedZodiac={setSelectedZodiac}
              />
            ))}

            {/* Planet markers */}
            {positions.map((p) => (
              <PlanetMarker
                key={p.name}
                p={p}
                mapOffset={mapOffset}
                selectedPlanet={selectedPlanet}
                setSelectedPlanet={setSelectedPlanet}
                selectedZodiac={selectedZodiac}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-mono">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Earth ({location ? "Topocentric" : "Geocentric"} Center)
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-mono">
              <div className="w-2 h-2 rounded-full border border-white/20" />
              Ecliptic Path (Sidereal)
            </div>
          </div>
        </div>

        {/* Right panel: data */}
        <div className="lg:col-span-5 flex flex-col gap-4 self-start">
          <RailCard className="p-6">
                <div className="dash-card-header">
                  <div>
                    <h2 className="dash-section-title" style={{ fontSize: 15 }}>Temporal Engine</h2>
                    <span className="dash-section-subtitle">Time navigation · Live or manual</span>
                  </div>
                  <MetaChip tone={isLive ? "success" : "amber"}>
                    {isLive ? "Live Sync" : "Manual Override"}
                  </MetaChip>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="datetime-local"
                    value={currentTime ? formatForInput(currentTime) : ""}
                    onChange={handleDateChange}
                    className="rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none flex-1 transition-colors [color-scheme:dark]"
                    style={{
                      background: "rgba(3,5,15,0.52)",
                      border: "1px solid var(--border)",
                      color: "var(--cream)",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  />
                  <button
                    onClick={() => {
                      setIsLive(true);
                      setCurrentTime(new Date());
                    }}
                    className="p-2.5 rounded-xl transition-all flex items-center justify-center"
                    style={{
                      background: isLive ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.04)",
                      border: isLive
                        ? "1px solid rgba(52,211,153,0.24)"
                        : "1px solid var(--border)",
                      color: isLive ? "rgba(110,231,183,0.95)" : "var(--mist)",
                      boxShadow: isLive ? "0 0 0 1px rgba(52,211,153,0.06) inset" : "none",
                    }}
                    title="Return to live time"
                  >
                    <Play size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: "1M", days: -30, dir: "back" },
                    { label: "1D", days: -1, dir: "back" },
                    { label: "1D", days: 1, dir: "fwd" },
                    { label: "1M", days: 30, dir: "fwd" },
                  ].map(({ label, days, dir }, i) => (
                    <button
                      key={i}
                      onClick={() => adjustTime(days)}
                      className="py-2 text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--border)",
                        color: "var(--mist)",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {dir === "back" && <Rewind size={10} />}
                      {label}
                      {dir === "fwd" && <FastForward size={10} />}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 pt-3.5 border-t border-[var(--border)]">
                  <div>
                    <div className="ui-label" style={{ color: "var(--mist)", opacity: 0.6 }}>
                      Observer
                    </div>
                    {isLocating ? (
                      <div
                        className="flex items-center gap-1.5"
                        style={{
                          marginTop: 6,
                          color: "var(--amber)",
                          fontSize: 12,
                          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                        }}
                      >
                        <Loader2 size={11} className="animate-spin" /> Locating...
                      </div>
                    ) : (
                      <button
                        onClick={locateMe}
                        className="flex items-center gap-1.5"
                        style={{
                          marginTop: 6,
                          color: "var(--amber)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                          fontSize: 12.5,
                          textAlign: "left",
                        }}
                        title="Use browser location"
                      >
                        <MapPin size={12} />
                        {city || "Locate Me"}
                      </button>
                    )}
                    {locationError && (
                      <div
                        style={{
                          marginTop: 4,
                          color: "rgba(251,113,133,0.95)",
                          fontSize: 10,
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {locationError}
                      </div>
                    )}
                  </div>

                  {sunTimes && (
                    <>
                      <div>
                        <div className="ui-label" style={{ color: "var(--mist)", opacity: 0.6 }}>
                          Sunrise
                        </div>
                        <div
                          className="data-value"
                          style={{ marginTop: 6, color: "var(--gold)", fontSize: 14 }}
                        >
                          {format(sunTimes.sunrise, "HH:mm")}
                        </div>
                      </div>
                      <div>
                        <div className="ui-label" style={{ color: "var(--mist)", opacity: 0.6 }}>
                          Sunset
                        </div>
                        <div
                          className="data-value"
                          style={{ marginTop: 6, color: "var(--amber)", fontSize: 14 }}
                        >
                          {format(sunTimes.sunset, "HH:mm")}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="col-span-2 lg:col-span-3">
                    <div className="ui-label" style={{ color: "var(--mist)", opacity: 0.6 }}>
                      Current Epoch
                    </div>
                    <div
                      className="data-value"
                      style={{
                        marginTop: 6,
                        color: "var(--cream)",
                        fontSize: 13,
                      }}
                    >
                      {currentTime ? format(currentTime, "yyyy-MM-dd HH:mm:ss") : "—"} · Lahiri (Approx)
                    </div>
                  </div>
                </div>
              </RailCard>

          <RailCard glow className="p-6">
                <div className="dash-card-header mb-4">
                  <div>
                    <h2 className="dash-section-title" style={{ fontSize: 15 }}>Focused Body</h2>
                    <span className="dash-section-subtitle">Select a planet or sign on the map</span>
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  {selectedZodiac !== null && !selectedPlanet ? (
                    <motion.div
                      key="zodiac-detail"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                            style={{
                              background: "rgba(200,135,58,0.14)",
                              border: "1px solid rgba(200,135,58,0.28)",
                              color: "var(--amber)",
                            }}
                          >
                            {RASHI_DATA[selectedZodiac].symbol}
                          </div>
                          <div>
                            <h2
                              style={{
                                fontFamily: "Cinzel, serif",
                                fontSize: 30,
                                fontWeight: 400,
                                color: "var(--gold)",
                                margin: 0,
                              }}
                            >
                              {RASHIS[selectedZodiac]}
                            </h2>
                            <p
                              className="ui-body"
                              style={{
                                color: "var(--mist)",
                                opacity: 0.78,
                                marginTop: 4,
                                fontSize: 12.5,
                              }}
                            >
                              Zodiac sign · {selectedZodiac * 30}° – {(selectedZodiac + 1) * 30}°
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedZodiac(null)}
                          className="p-2 rounded-full transition-colors"
                          style={{
                            color: "var(--mist)",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <Loader2 size={16} className="rotate-45" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        {[
                          { label: "Lord", value: RASHI_DATA[selectedZodiac].lord, color: "var(--amber)" },
                          { label: "Element", value: RASHI_DATA[selectedZodiac].element, color: "rgba(147,197,253,0.95)" },
                          { label: "Quality", value: RASHI_DATA[selectedZodiac].quality, color: "rgba(216,180,254,0.95)" },
                          { label: "SAV Score", value: `${ashtakavarga.sav[selectedZodiac]} pts`, color: "rgba(110,231,183,0.95)" },
                        ].map(({ label, value, color }) => (
                          <div
                            key={label}
                            className="p-3 rounded-xl"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div className="ui-label" style={{ color: "var(--mist)", opacity: 0.65 }}>
                              {label}
                            </div>
                            <div
                              style={{
                                fontFamily: "Cinzel, serif",
                                fontSize: 14,
                                color,
                                marginTop: 6,
                              }}
                            >
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background: "rgba(200,135,58,0.06)",
                          border: "1px solid rgba(200,135,58,0.16)",
                        }}
                      >
                        <RailLabel>Planets in {RASHIS[selectedZodiac]}</RailLabel>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {positions
                            .filter((p) => p.rashi === RASHIS[selectedZodiac])
                            .map((p) => (
                              <button
                                key={p.name}
                                onClick={() => setSelectedPlanet(p.name)}
                                className="px-3 py-1.5 rounded-full transition-colors flex items-center gap-2"
                                style={{
                                  background: "rgba(3,5,15,0.44)",
                                  border: "1px solid var(--border)",
                                  color: "var(--cream)",
                                  fontFamily: "'DM Mono', monospace",
                                  fontSize: 11,
                                }}
                              >
                                <span style={{ color: p.color }}>{p.symbol}</span>
                                {p.name}
                              </button>
                            ))}
                          {positions.filter((p) => p.rashi === RASHIS[selectedZodiac]).length === 0 && (
                            <span
                              style={{
                                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                                fontSize: 12,
                                color: "var(--mist)",
                                opacity: 0.6,
                              }}
                            >
                              No planets currently transiting this sign
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : activePlanet ? (
                    <motion.div
                      key="planet-detail"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
                            style={{
                              backgroundColor: activePlanet.color,
                              color: "#000",
                              fontSize: activePlanet.symbol.length > 1 ? 18 : 28,
                              fontWeight: 700,
                            }}
                          >
                            {activePlanet.symbol}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2
                                style={{
                                  fontFamily: "Cinzel, serif",
                                  fontSize: 30,
                                  fontWeight: 400,
                                  color: "var(--cream)",
                                  margin: 0,
                                }}
                              >
                                {activePlanet.name}
                              </h2>
                              {selectedZodiac !== null && (
                                <button
                                  onClick={() => setSelectedPlanet(null)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-full transition-all"
                                  style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 10,
                                    color: "var(--amber)",
                                    background: "rgba(200,135,58,0.08)",
                                    border: "1px solid rgba(200,135,58,0.18)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.12em",
                                  }}
                                >
                                  <ChevronRight size={11} style={{ transform: "rotate(180deg)" }} />
                                  Back to {RASHIS[selectedZodiac]}
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {activePlanet.isRetrograde && !["Rahu", "Ketu"].includes(activePlanet.name) && (
                                <MetaChip tone="amber">Retrograde</MetaChip>
                              )}
                              {activePlanet.isCombust && <MetaChip tone="danger">Combust</MetaChip>}
                              <MetaChip tone="cool">Pada {activePlanet.pada}</MetaChip>
                              {activePlanet.dignity && (
                                <MetaChip
                                  tone={
                                    activePlanet.dignity === "Exalted"
                                      ? "success"
                                      : activePlanet.dignity === "Debilitated"
                                      ? "danger"
                                      : "cool"
                                  }
                                >
                                  {activePlanet.dignity}
                                </MetaChip>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className="data-value"
                            style={{
                              fontSize: 32,
                              fontWeight: 300,
                              letterSpacing: -1,
                              color: "var(--cream)",
                            }}
                          >
                            {activePlanet.degree}°{activePlanet.minute}&apos;
                          </div>
                          <div className="ui-label" style={{ color: "var(--mist)", opacity: 0.65 }}>
                            {activePlanet.rashi} {activePlanet.house ? `· ${getOrdinal(activePlanet.house)} House` : ""}
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "grid gap-3",
                          ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(
                            activePlanet.name
                          )
                            ? "grid-cols-3"
                            : "grid-cols-2"
                        )}
                      >
                        {[
                          {
                            label: "Nakshatra",
                            value: activePlanet.nakshatra,
                            sub: `Pada ${activePlanet.pada}`,
                            subColor: "var(--amber)",
                          },
                          {
                            label: "Longitude",
                            value: `${activePlanet.siderealLongitude.toFixed(4)}°`,
                            sub: "Sidereal",
                            subColor: "var(--mist)",
                          },
                        ].map(({ label, value, sub, subColor }) => (
                          <div
                            key={label}
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div className="ui-label" style={{ color: "var(--mist)", opacity: 0.65 }}>
                              {label}
                            </div>
                            <div
                              style={{
                                fontFamily: "Cinzel, serif",
                                fontSize: 18,
                                color: "var(--cream)",
                                marginTop: 6,
                              }}
                            >
                              {value}
                            </div>
                            <div
                              className="data-value"
                              style={{ color: subColor, marginTop: 6, fontSize: 10 }}
                            >
                              {sub}
                            </div>
                          </div>
                        ))}
                        {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(
                          activePlanet.name
                        ) && (
                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div className="ui-label" style={{ color: "var(--mist)", opacity: 0.65 }}>
                              Ashtakavarga
                            </div>
                            <div
                              className="data-value"
                              style={{ fontSize: 18, marginTop: 6, color: "var(--cream)" }}
                            >
                              {ashtakavarga.bav[activePlanet.name]?.[RASHIS.indexOf(activePlanet.rashi)]}
                              <span style={{ fontSize: 12, color: "var(--mist)", opacity: 0.65 }}>
                                {" "}
                                / 8
                              </span>
                            </div>
                            <div className="data-value" style={{ marginTop: 6, fontSize: 10, color: "var(--mist)", opacity: 0.5 }}>
                              Points
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
          </RailCard>

              {/* ── Active Yogas ─────────────────────────────────── */}
          <RailCard className="p-6">
                <div className="dash-card-header">
                  <div>
                    <h2 className="dash-section-title" style={{ fontSize: 15 }}>Active Yogas</h2>
                    <span className="dash-section-subtitle">Classical combinations · Current sky</span>
                  </div>
                  {yogas.length > 0
                    ? <MetaChip tone="amber">{yogas.length} active</MetaChip>
                    : <span className="ui-label" style={{ color: "var(--mist)", opacity: 0.35 }}>No yogas detected</span>
                  }
                </div>

                {yogas.length === 0 ? (
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "var(--mist)", opacity: 0.5, margin: 0 }}>
                    No classical yoga combinations are active for the current sky configuration.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {yogas.slice(0, isYogasExpanded ? undefined : 2).map((yoga, i) => {
                      const accent =
                        yoga.type === "auspicious" ? "rgba(110,231,183,0.7)"
                        : yoga.type === "inauspicious" ? "rgba(251,113,133,0.7)"
                        : "rgba(147,197,253,0.55)";
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex gap-3 rounded-xl overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
                        >
                          <div style={{ width: 3, flexShrink: 0, background: accent, borderRadius: "0 2px 2px 0" }} />
                          <div className="py-3 pr-3 flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span style={{ fontFamily: "Cinzel, serif", fontSize: 13, color: "var(--cream)", lineHeight: 1.3 }}>
                                {yoga.name}
                              </span>
                              <MetaChip tone={yoga.type === "auspicious" ? "success" : yoga.type === "inauspicious" ? "danger" : "cool"}>
                                {yoga.type}
                              </MetaChip>
                            </div>
                            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11.5, color: "var(--mist)", opacity: 0.78, margin: 0, lineHeight: 1.55 }}>
                              {yoga.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                    {yogas.length > 2 && (
                      <button
                        onClick={() => setIsYogasExpanded(!isYogasExpanded)}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl transition-colors"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border)",
                          color: "var(--mist)",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                        }}
                      >
                        {isYogasExpanded
                          ? <><ChevronUp size={10} /> Collapse</>
                          : <><ChevronDown size={10} /> +{yogas.length - 2} more yogas</>
                        }
                      </button>
                    )}
                  </div>
                )}
          </RailCard>

              {/* ── Transit Events ───────────────────────────────── */}
          <RailCard className="p-6">
                <div className="dash-card-header">
                  <div>
                    <h2 className="dash-section-title" style={{ fontSize: 15 }}>Transit Events</h2>
                    <span className="dash-section-subtitle">Dignity · Retrograde · Conjunctions</span>
                  </div>
                  {transits.length > 0
                    ? <MetaChip tone="cool">{transits.length} events</MetaChip>
                    : <span className="ui-label" style={{ color: "var(--mist)", opacity: 0.35 }}>No events</span>
                  }
                </div>

                {transits.length === 0 ? (
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "var(--mist)", opacity: 0.5, margin: 0 }}>
                    No notable dignity, retrograde, or conjunction events at this time.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {transits.slice(0, isTransitsExpanded ? undefined : 3).map((transit, i) => {
                      const accent =
                        transit.type === "positive" ? "rgba(110,231,183,0.7)"
                        : transit.type === "negative" ? "rgba(251,113,133,0.7)"
                        : "rgba(147,197,253,0.55)";
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex gap-3 rounded-xl overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
                        >
                          <div style={{ width: 3, flexShrink: 0, background: accent, borderRadius: "0 2px 2px 0" }} />
                          <div className="py-3 pr-3 flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span style={{ fontFamily: "Cinzel, serif", fontSize: 13, color: "var(--cream)", lineHeight: 1.3 }}>
                                {transit.title}
                              </span>
                              <MetaChip tone={transit.type === "positive" ? "success" : transit.type === "negative" ? "danger" : "cool"}>
                                {transit.type}
                              </MetaChip>
                            </div>
                            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11.5, color: "var(--mist)", opacity: 0.78, margin: 0, lineHeight: 1.55 }}>
                              {transit.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                    {transits.length > 3 && (
                      <button
                        onClick={() => setIsTransitsExpanded(!isTransitsExpanded)}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl transition-colors"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border)",
                          color: "var(--mist)",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                        }}
                      >
                        {isTransitsExpanded
                          ? <><ChevronUp size={10} /> Collapse</>
                          : <><ChevronDown size={10} /> +{transits.length - 3} more events</>
                        }
                      </button>
                    )}
                  </div>
                )}
          </RailCard>

          <RailCard className="p-6">
                <div className="dash-card-header">
                  <div>
                    <h2 className="dash-section-title" style={{ fontSize: 15 }}>Sarvashtakavarga</h2>
                    <span className="dash-section-subtitle">Rashi strength scores</span>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {RASHIS.map((rashi, i) => {
                    const score = ashtakavarga.sav[i];
                    const isStrong = score >= 28;
                    const isWeak = score < 25;
                    return (
                      <div
                        key={rashi}
                        className="p-2.5 rounded-xl flex flex-col items-center justify-center"
                        style={{
                          background: isStrong
                            ? "rgba(52,211,153,0.08)"
                            : isWeak
                            ? "rgba(244,63,94,0.08)"
                            : "rgba(255,255,255,0.04)",
                          border: isStrong
                            ? "1px solid rgba(52,211,153,0.18)"
                            : isWeak
                            ? "1px solid rgba(244,63,94,0.18)"
                            : "1px solid var(--border)",
                          color: isStrong
                            ? "rgba(110,231,183,0.95)"
                            : isWeak
                            ? "rgba(251,113,133,0.95)"
                            : "var(--cream)",
                        }}
                      >
                        <div className="ui-label" style={{ color: "inherit", opacity: 0.8 }}>
                          {rashi.substring(0, 3)}
                        </div>
                        <div
                          className="data-value"
                          style={{ marginTop: 4, fontSize: 13, color: "inherit" }}
                        >
                          {score}
                        </div>
                      </div>
                    );
                  })}
                </div>
          </RailCard>

          <RailCard className="p-6">
                <div className="dash-card-header">
                  <div>
                    <h2 className="dash-section-title" style={{ fontSize: 15 }}>Planetary Positions</h2>
                    <span className="dash-section-subtitle">Sidereal longitudes · Nakshatras</span>
                  </div>
                  {selectedZodiac !== null && <MetaChip tone="amber">{RASHIS[selectedZodiac]}</MetaChip>}
                </div>
                <div className="space-y-1">
                  {positions.map((p) => {
                    const isInSelectedZodiac =
                      selectedZodiac !== null && p.rashi === RASHIS[selectedZodiac];
                    const isSelected = selectedPlanet === p.name;
                    return (
                      <button
                        key={p.name}
                        onClick={() => setSelectedPlanet(p.name)}
                        className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group"
                        style={{
                          background: isSelected
                            ? "rgba(200,135,58,0.10)"
                            : isInSelectedZodiac
                            ? "rgba(200,135,58,0.06)"
                            : "rgba(255,255,255,0.02)",
                          border: isSelected
                            ? "1px solid var(--border-lit)"
                            : isInSelectedZodiac
                            ? "1px solid rgba(200,135,58,0.16)"
                            : "1px solid transparent",
                          transform: isSelected ? "translateY(-1px)" : undefined,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{
                              backgroundColor: p.color,
                              color: "#000",
                              fontSize: p.symbol.length > 1 ? 10 : 16,
                              fontWeight: 700,
                              boxShadow: isSelected ? "0 0 0 1px rgba(255,255,255,0.12) inset" : undefined,
                            }}
                          >
                            {p.symbol}
                          </div>
                          <div className="text-left">
                            <div
                              style={{
                                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                                fontSize: 13.5,
                                color: "var(--cream)",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              {p.name}
                              <div className="flex gap-1">
                                {p.isRetrograde && !["Rahu", "Ketu"].includes(p.name) && (
                                  <MetaChip tone="amber">Rx</MetaChip>
                                )}
                                {p.isCombust && <MetaChip tone="danger">C</MetaChip>}
                              </div>
                            </div>
                            <div
                              className="data-value"
                              style={{
                                fontSize: 10,
                                color: "var(--mist)",
                                opacity: 0.68,
                                marginTop: 3,
                              }}
                            >
                              {p.nakshatra} · P{p.pada}
                              {p.house ? ` · ${getOrdinal(p.house)} H` : ""}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="data-value"
                            style={{
                              fontSize: 13,
                              color: isSelected || isInSelectedZodiac ? "var(--amber)" : "var(--mist)",
                            }}
                          >
                            {p.degree}°{p.minute}&apos;
                          </div>
                          <ChevronRight
                            size={14}
                            style={{
                              color: isSelected ? "var(--amber)" : "rgba(255,255,255,0.22)",
                              transform: isSelected ? "rotate(90deg)" : undefined,
                              transition: "transform 0.2s",
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
          </RailCard>

          <RailCard className="p-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: <Activity size={13} />,
                    color: isLive ? "rgba(110,231,183,0.95)" : "var(--amber)",
                    label: "Engine",
                    value: isLive ? "Live Sync" : "Manual",
                  },
                  {
                    icon: <Zap size={13} />,
                    color: "var(--amber)",
                    label: "Precision",
                    value: "High (64-bit)",
                  },
                  {
                    icon: <CircleDot size={13} />,
                    color: "rgba(147,197,253,0.95)",
                    label: "Coordinate",
                    value: location ? "Topocentric" : "Geocentric",
                  },
                ].map(({ icon, color, label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span style={{ color }}>{icon}</span>
                    <div>
                      <div className="ui-label" style={{ color: "var(--mist)", opacity: 0.58 }}>
                        {label}
                      </div>
                      <div className="data-value" style={{ fontSize: 10, color: "var(--cream)", marginTop: 3 }}>
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </RailCard>
        </div>
      </main>
    </div>
  );
}

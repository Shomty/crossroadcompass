/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { calculatePositions, PlanetPosition, detectYogas, calculateAshtakavarga, RASHIS, RASHI_DATA, analyzeTransits, TransitEvent } from './vedic-utils';
import { format } from 'date-fns';
import SunCalc from 'suncalc';
import { 
  Compass, 
  Clock, 
  Info, 
  Maximize2, 
  Zap, 
  Moon, 
  Sun, 
  CircleDot,
  ChevronRight,
  Activity,
  Play,
  Pause,
  CalendarDays,
  Rewind,
  FastForward,
  MapPin,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function useContinuousAngle(targetAngle: number) {
  const prevTargetRef = useRef(targetAngle);
  const continuousAngleRef = useRef(targetAngle);

  if (targetAngle !== prevTargetRef.current) {
    let diff = targetAngle - prevTargetRef.current;
    // Handle 360 degree wrapping
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    continuousAngleRef.current += diff;
    prevTargetRef.current = targetAngle;
  }

  return continuousAngleRef.current;
}

const PLANET_RING_STYLES: Record<string, { radius: number, color: string, borderStyle: string, opacity: number }> = {
  "Ascendant": { radius: 100, color: "#10B981", borderStyle: "solid", opacity: 0.3 },
  "Ketu": { radius: 92, color: "#A9A9A9", borderStyle: "dashed", opacity: 0.2 },
  "Rahu": { radius: 84, color: "#8A2BE2", borderStyle: "dashed", opacity: 0.2 },
  "Saturn": { radius: 76, color: "#708090", borderStyle: "dotted", opacity: 0.3 },
  "Jupiter": { radius: 68, color: "#DAA520", borderStyle: "solid", opacity: 0.2 },
  "Mars": { radius: 60, color: "#FF4500", borderStyle: "solid", opacity: 0.2 },
  "Sun": { radius: 52, color: "#FFD700", borderStyle: "solid", opacity: 0.3 },
  "Venus": { radius: 44, color: "#FF69B4", borderStyle: "solid", opacity: 0.2 },
  "Mercury": { radius: 36, color: "#00CED1", borderStyle: "dotted", opacity: 0.3 },
  "Moon": { radius: 28, color: "#F0F8FF", borderStyle: "dashed", opacity: 0.2 },
};

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface ZodiacLabelProps {
  index: number;
  mapOffset: number;
  selectedZodiac: number | null;
  setSelectedZodiac: (idx: number | null) => void;
}

const ZodiacLabel: React.FC<ZodiacLabelProps> = ({ index, mapOffset, selectedZodiac, setSelectedZodiac }) => {
  const targetAngle = index * 30 + mapOffset + 15; // Center the label in the 30° segment
  const angle = useContinuousAngle(targetAngle);
  const isSelected = selectedZodiac === index;
  
  return (
    <motion.div 
      className="absolute inset-0 pointer-events-none"
      animate={{ rotate: angle }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
    >
      {/* Clickable segment - centered around the label */}
      <div 
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-auto cursor-pointer transition-all duration-500",
          isSelected ? "bg-orange-500/10 shadow-[inset_0_0_40px_rgba(249,115,22,0.1)]" : "hover:bg-white/[0.03]"
        )}
        style={{ 
          clipPath: 'polygon(50% 50%, 36.6% 0%, 63.4% 0%)',
        }}
        onClick={() => setSelectedZodiac(isSelected ? null : index)}
      />
      
      {/* Boundary lines */}
      <div className="absolute top-0 left-1/2 w-px h-full bg-white/5 -translate-x-1/2" style={{ transform: 'rotate(-15deg)' }} />
      <div className="absolute top-0 left-1/2 w-px h-full bg-white/5 -translate-x-1/2" style={{ transform: 'rotate(15deg)' }} />

      <motion.div 
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-[10px] font-mono uppercase tracking-widest transition-all duration-300",
          isSelected ? "text-orange-500 font-bold scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" : "text-white/20"
        )}
        animate={{ rotate: -angle }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        {["ARI", "TAU", "GEM", "CAN", "LEO", "VIR", "LIB", "SCO", "SAG", "CAP", "AQU", "PIS"][index]}
      </motion.div>
    </motion.div>
  );
}

interface PlanetMarkerProps {
  p: PlanetPosition;
  mapOffset: number;
  selectedPlanet: string | null;
  setSelectedPlanet: (name: string | null) => void;
  selectedZodiac: number | null;
}

const PlanetMarker: React.FC<PlanetMarkerProps> = ({ p, mapOffset, selectedPlanet, setSelectedPlanet, selectedZodiac }) => {
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
              selectedPlanet === p.name ? "scale-125 ring-2 ring-white z-50 shadow-[0_0_30px_rgba(255,255,255,0.4)]" : 
              isInSelectedZodiac ? "scale-115 ring-2 ring-orange-500/50 z-40 shadow-[0_0_20px_rgba(249,115,22,0.4)]" : "group-hover:scale-110 hover:z-40"
            )}
            style={{ 
              backgroundColor: p.color, 
              color: '#000',
              boxShadow: isInSelectedZodiac ? `0 0 25px ${p.color}, 0 0 10px rgba(249,115,22,0.3)` : undefined
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
                className={cn(
                  "absolute top-full mt-2 bg-black/90 backdrop-blur-md border px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-auto z-50 flex flex-col items-center shadow-xl",
                  selectedPlanet === p.name ? "border-white/40" : "border-orange-500/40"
                )}
              >
                <div className="font-bold">{p.name} {p.degree}°{p.minute}'</div>
                {p.house && <div className="text-white/60 text-[8px] uppercase tracking-widest mt-0.5">{getOrdinal(p.house)} House</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedZodiac, setSelectedZodiac] = useState<number | null>(null);
  const [isYogasExpanded, setIsYogasExpanded] = useState(false);
  const [isTransitsExpanded, setIsTransitsExpanded] = useState(false);
  
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>({ lat: 23.1765, lon: 75.7885 });
  const [city, setCity] = useState<string | null>("Ujjain, India (Default)");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const locateMe = () => {
    setIsLocating(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLocation({ lat, lon });
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const data = await res.json();
          const cityName = data.address.city || data.address.town || data.address.village || data.address.county || "Unknown Location";
          setCity(cityName);
        } catch (err) {
          setCity(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
        }
        setIsLocating(false);
      },
      (err) => {
        setLocationError(err.message);
        setIsLocating(false);
      }
    );
  };

  useEffect(() => {
    locateMe();
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isLive]);

  const adjustTime = (days: number) => {
    setIsLive(false);
    setCurrentTime(prev => new Date(prev.getTime() + days * 86400000));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    setIsLive(false);
    setCurrentTime(new Date(e.target.value));
  };

  const formatForInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const positions = useMemo(() => calculatePositions(currentTime, location?.lat, location?.lon), [currentTime, location]);
  const yogas = useMemo(() => detectYogas(positions), [positions]);
  const ashtakavarga = useMemo(() => calculateAshtakavarga(positions), [positions]);
  const transits = useMemo(() => analyzeTransits(positions), [positions]);

  const sunTimes = useMemo(() => {
    if (!location) return null;
    return SunCalc.getTimes(currentTime, location.lat, location.lon);
  }, [currentTime, location]);

  const exportData = () => {
    const data = {
      timestamp: currentTime.toISOString(),
      location: {
        lat: location?.lat,
        lon: location?.lon,
        city: city
      },
      sunTimes: sunTimes ? {
        sunrise: sunTimes.sunrise.toISOString(),
        sunset: sunTimes.sunset.toISOString()
      } : null,
      planetaryPositions: positions.map(p => ({
        name: p.name,
        longitude: p.longitude,
        siderealLongitude: p.siderealLongitude,
        latitude: p.latitude,
        distance: p.distance,
        isRetrograde: p.isRetrograde,
        isCombust: p.isCombust,
        rashi: p.rashi,
        nakshatra: p.nakshatra,
        pada: p.pada,
        dignity: p.dignity,
        degree: p.degree,
        minute: p.minute,
      })),
      yogas: yogas,
      ashtakavarga: ashtakavarga,
      transits: transits,
      rashiData: RASHI_DATA
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vedic-sky-data-${format(currentTime, 'yyyy-MM-dd-HHmm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activePlanet = useMemo(() => 
    positions.find(p => p.name === selectedPlanet) || positions[0], 
    [positions, selectedPlanet]
  );

  const ascendant = useMemo(() => positions.find(p => p.name === "Ascendant"), [positions]);
  const mapOffset = ascendant ? -ascendant.siderealLongitude - 90 : 0;

  return (
    <div className="h-[100dvh] bg-[#050505] text-white font-sans selection:bg-orange-500/30 overflow-hidden flex flex-col">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-orange-500/50 flex items-center justify-center bg-orange-500/10">
            <Compass className="w-6 h-6 text-orange-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter uppercase italic font-serif">Vedic Sky Observer</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Sidereal Geocentric Engine v1.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 font-mono text-sm">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">Observer Location</span>
            <div className="flex items-center gap-2">
              {isLocating ? (
                <span className="text-orange-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Locating...</span>
              ) : (
                <button 
                  onClick={locateMe}
                  className="text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors"
                  title="Click to update location"
                >
                  <MapPin className="w-3 h-3" /> {city || "Locate Me"}
                </button>
              )}
            </div>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          {sunTimes && (
            <>
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-white/40 text-[10px] uppercase tracking-widest">Sunrise</span>
                <span className="text-yellow-500">{format(sunTimes.sunrise, 'HH:mm')}</span>
              </div>
              <div className="w-px h-8 bg-white/10 hidden lg:block" />
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-white/40 text-[10px] uppercase tracking-widest">Sunset</span>
                <span className="text-orange-500">{format(sunTimes.sunset, 'HH:mm')}</span>
              </div>
              <div className="w-px h-8 bg-white/10 hidden lg:block" />
            </>
          )}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">Current Epoch</span>
            <span className="text-orange-500">{format(currentTime, 'yyyy-MM-dd HH:mm:ss')}</span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <div className="flex flex-col items-end">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">Ayanamsa</span>
            <span>Lahiri (Approx)</span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <button 
            onClick={exportData}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors flex items-center gap-2"
            title="Export Data as JSON"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline text-xs uppercase tracking-widest">Export</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Panel: Sky Map */}
        <div className="lg:col-span-7 p-8 flex items-center justify-center relative border-r border-white/5 min-h-0">
          <div className="relative w-full max-w-[700px] max-h-[50vh] lg:max-h-none aspect-square">
            {/* Planetary Rings */}
            {Object.entries(PLANET_RING_STYLES).map(([name, style]) => {
              const isSelected = selectedPlanet === name;
              return (
                <div 
                  key={`ring-${name}`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-500"
                  style={{ 
                    width: `${style.radius}%`, 
                    height: `${style.radius}%`,
                    borderWidth: name === "Ascendant" ? '2px' : '1px',
                    borderStyle: style.borderStyle,
                    borderColor: style.color,
                    opacity: isSelected ? 0.8 : style.opacity,
                    boxShadow: isSelected ? `0 0 20px ${style.color}40 inset, 0 0 20px ${style.color}40` : 'none',
                    zIndex: isSelected ? 10 : 0
                  }}
                />
              );
            })}
            
            {/* Central Earth */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20" />
              <div className="absolute w-32 h-32 border border-blue-500/20 rounded-full animate-[ping_3s_infinite]" />
            </div>

            {/* Horizon Line */}
            <div className="absolute top-1/2 left-4 right-4 h-px bg-white/20 -translate-y-1/2 pointer-events-none z-10" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-full pr-2 text-[10px] text-white/60 font-mono uppercase tracking-widest z-10">East (Lagna)</div>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-full pl-2 text-[10px] text-white/60 font-mono uppercase tracking-widest z-10">West</div>

            {/* Zodiac Labels */}
            {Array.from({ length: 12 }).map((_, i) => (
              <ZodiacLabel 
                key={i} 
                index={i} 
                mapOffset={mapOffset} 
                selectedZodiac={selectedZodiac}
                setSelectedZodiac={setSelectedZodiac}
              />
            ))}

            {/* Planets on Map */}
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
          <div className="absolute bottom-8 left-8 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Earth ({location ? "Topocentric" : "Geocentric"} Center)
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full border border-white/20" /> Ecliptic Path (Sidereal)
            </div>
          </div>
        </div>

        {/* Right Panel: Data Dashboard */}
        <div className="lg:col-span-5 flex flex-col overflow-hidden bg-white/[0.02] min-h-0">
          {/* Temporal Controls */}
          <div className="p-6 border-b border-white/5 bg-black/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                <Clock className="w-3 h-3" /> Temporal Engine
              </div>
              <div className={cn("text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 rounded", isLive ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500")}>
                {isLive ? "Live Sync" : "Manual Override"}
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <input 
                type="datetime-local" 
                value={formatForInput(currentTime)}
                onChange={handleDateChange}
                className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-orange-500 flex-1 transition-colors [color-scheme:dark]"
              />
              <button 
                onClick={() => {
                  setIsLive(true);
                  setCurrentTime(new Date());
                }} 
                className={cn(
                  "p-2.5 rounded-lg border transition-all flex items-center justify-center", 
                  isLive ? "bg-green-500/20 border-green-500/50 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]" : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                )}
                title="Return to Live Time"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => adjustTime(-30)} className="py-1.5 text-xs font-mono bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors flex items-center justify-center gap-1 text-white/60 hover:text-white">
                <Rewind className="w-3 h-3" /> 1M
              </button>
              <button onClick={() => adjustTime(-1)} className="py-1.5 text-xs font-mono bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors flex items-center justify-center gap-1 text-white/60 hover:text-white">
                <Rewind className="w-3 h-3" /> 1D
              </button>
              <button onClick={() => adjustTime(1)} className="py-1.5 text-xs font-mono bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors flex items-center justify-center gap-1 text-white/60 hover:text-white">
                1D <FastForward className="w-3 h-3" />
              </button>
              <button onClick={() => adjustTime(30)} className="py-1.5 text-xs font-mono bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors flex items-center justify-center gap-1 text-white/60 hover:text-white">
                1M <FastForward className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            {/* Active Planet or Zodiac Detail */}
            <div className="p-6 border-b border-white/5 flex-shrink-0 bg-gradient-to-b from-white/[0.02] to-transparent">
              <AnimatePresence mode="wait">
                {selectedZodiac !== null && !selectedPlanet ? (
                  <motion.div 
                    key="zodiac-detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="animate-in fade-in slide-in-from-top-4 duration-500"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-3xl text-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                          {RASHI_DATA[selectedZodiac].symbol}
                        </div>
                        <div>
                          <h2 className="text-4xl font-bold tracking-tighter italic font-serif text-orange-500">{RASHIS[selectedZodiac]}</h2>
                          <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">
                            Zodiac Sign • {selectedZodiac * 30}° - {(selectedZodiac + 1) * 30}°
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedZodiac(null)}
                        className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      >
                        <Loader2 className="w-4 h-4 rotate-45" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-mono">Lord</div>
                        <div className="text-sm font-serif italic text-orange-500/80">{RASHI_DATA[selectedZodiac].lord}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-mono">Element</div>
                        <div className="text-sm font-serif italic text-blue-400/80">{RASHI_DATA[selectedZodiac].element}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-mono">Quality</div>
                        <div className="text-sm font-serif italic text-purple-400/80">{RASHI_DATA[selectedZodiac].quality}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-mono">SAV Score</div>
                        <div className="text-sm font-mono text-emerald-400">{ashtakavarga.sav[selectedZodiac]} pts</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                      <div className="text-[10px] text-orange-500/60 uppercase tracking-widest mb-2 font-mono">Planets in {RASHIS[selectedZodiac]}</div>
                      <div className="flex flex-wrap gap-2">
                        {positions.filter(p => p.rashi === RASHIS[selectedZodiac]).map(p => (
                          <button 
                            key={p.name}
                            onClick={() => setSelectedPlanet(p.name)}
                            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono hover:border-orange-500/50 transition-colors flex items-center gap-2"
                          >
                            <span style={{ color: p.color }}>{p.symbol}</span>
                            {p.name}
                          </button>
                        ))}
                        {positions.filter(p => p.rashi === RASHIS[selectedZodiac]).length === 0 && (
                          <span className="text-xs text-white/20 italic font-serif">No planets currently transiting this sign</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="planet-detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="animate-in fade-in duration-500"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div 
                          className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-500",
                            activePlanet.symbol.length > 1 ? "text-xl font-bold" : "text-3xl"
                          )}
                          style={{ backgroundColor: activePlanet.color, color: '#000' }}
                        >
                          {activePlanet.symbol}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-4xl font-bold tracking-tighter italic font-serif">{activePlanet.name}</h2>
                            {selectedZodiac !== null && (
                              <button 
                                onClick={() => setSelectedPlanet(null)}
                                className="text-[10px] text-orange-500 hover:text-orange-400 font-mono uppercase tracking-widest flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20 transition-all"
                              >
                                <ChevronRight className="w-3 h-3 rotate-180" /> Back to {RASHIS[selectedZodiac]}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {activePlanet.isRetrograde && !["Rahu", "Ketu"].includes(activePlanet.name) && (
                              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-500 text-[10px] font-mono uppercase tracking-wider border border-orange-500/20">
                                Retrograde
                              </span>
                            )}
                            {activePlanet.isCombust && (
                              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 text-[10px] font-mono uppercase tracking-wider border border-red-500/20">
                                Combust
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-500 text-[10px] font-mono uppercase tracking-wider border border-blue-500/20">
                              Pada {activePlanet.pada}
                            </span>
                            {activePlanet.dignity && (
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border",
                                activePlanet.dignity === "Exalted" ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/20" :
                                activePlanet.dignity === "Debilitated" ? "bg-rose-500/20 text-rose-500 border-rose-500/20" :
                                "bg-purple-500/20 text-purple-500 border-purple-500/20"
                              )}>
                                {activePlanet.dignity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-mono font-light tracking-tighter">
                          {activePlanet.degree}°{activePlanet.minute}'
                        </div>
                        <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono">
                          {activePlanet.rashi} Rashi {activePlanet.house ? `• ${getOrdinal(activePlanet.house)} House` : ''}
                        </div>
                      </div>
                    </div>

                    <div className={cn("grid gap-4", ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(activePlanet.name) ? "grid-cols-3" : "grid-cols-2")}>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-mono">Nakshatra</div>
                        <div className="text-xl font-serif italic">{activePlanet.nakshatra}</div>
                        <div className="text-[10px] text-orange-500/80 font-mono mt-1">Pada {activePlanet.pada}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-mono">Longitude</div>
                        <div className="text-xl font-mono">{activePlanet.siderealLongitude.toFixed(4)}°</div>
                        <div className="text-[10px] text-white/20 font-mono mt-1">Sidereal</div>
                      </div>
                      {["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(activePlanet.name) && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-mono">Ashtakavarga</div>
                          <div className="text-xl font-mono">{ashtakavarga.bav[activePlanet.name][RASHIS.indexOf(activePlanet.rashi)]} <span className="text-sm text-white/40">/ 8</span></div>
                          <div className="text-[10px] text-white/20 font-mono mt-1">Points</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Celestial Yogas */}
            <div className={cn("border-b border-white/5 flex-shrink-0", yogas.length === 0 ? "p-4" : "p-6")}>
              <div className={cn("flex items-center justify-between", yogas.length > 0 && "mb-4")}>
                <div className="flex items-center gap-2">
                  <Sparkles className={cn("w-4 h-4", yogas.length > 0 ? "text-yellow-500" : "text-white/20")} />
                  <h3 className={cn("text-sm font-mono uppercase tracking-widest", yogas.length > 0 ? "text-white/80" : "text-white/40")}>Active Yogas</h3>
                  {yogas.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-mono">
                      {yogas.length}
                    </span>
                  )}
                </div>
                {yogas.length === 0 && (
                  <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest">None</span>
                )}
              </div>
              
              {yogas.length > 0 && (
                <div className="flex flex-col gap-3">
                  {yogas.slice(0, isYogasExpanded ? undefined : 1).map((yoga, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-mono text-sm text-white">{yoga.name}</h4>
                        <span className={clsx("text-[10px] uppercase tracking-widest px-2 py-0.5 rounded", 
                          yoga.type === 'auspicious' ? 'bg-green-500/10 text-green-500' : 
                          yoga.type === 'inauspicious' ? 'bg-red-500/10 text-red-500' : 
                          'bg-blue-500/10 text-blue-500'
                        )}>
                          {yoga.type}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{yoga.description}</p>
                    </motion.div>
                  ))}
                  
                  {yogas.length > 1 && (
                    <button 
                      onClick={() => setIsYogasExpanded(!isYogasExpanded)}
                      className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors text-xs text-white/60 font-mono uppercase tracking-widest"
                    >
                      {isYogasExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          +{yogas.length - 1} More
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Transit Analysis */}
            <div className={cn("border-b border-white/5 flex-shrink-0", transits.length === 0 ? "p-4" : "p-6")}>
              <div className={cn("flex items-center justify-between", transits.length > 0 && "mb-4")}>
                <div className="flex items-center gap-2">
                  <Activity className={cn("w-4 h-4", transits.length > 0 ? "text-purple-500" : "text-white/20")} />
                  <h3 className={cn("text-sm font-mono uppercase tracking-widest", transits.length > 0 ? "text-white/80" : "text-white/40")}>Transit Events</h3>
                  {transits.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-500 text-[10px] font-mono">
                      {transits.length}
                    </span>
                  )}
                </div>
                {transits.length === 0 && (
                  <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest">None</span>
                )}
              </div>
              
              {transits.length > 0 && (
                <div className="flex flex-col gap-3">
                  {transits.slice(0, isTransitsExpanded ? undefined : 2).map((transit, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-mono text-sm text-white">{transit.title}</h4>
                        <span className={clsx("text-[10px] uppercase tracking-widest px-2 py-0.5 rounded", 
                          transit.type === 'positive' ? 'bg-green-500/10 text-green-500' : 
                          transit.type === 'negative' ? 'bg-red-500/10 text-red-500' : 
                          'bg-blue-500/10 text-blue-500'
                        )}>
                          {transit.type}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{transit.description}</p>
                    </motion.div>
                  ))}
                  
                  {transits.length > 2 && (
                    <button 
                      onClick={() => setIsTransitsExpanded(!isTransitsExpanded)}
                      className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors text-xs text-white/60 font-mono uppercase tracking-widest"
                    >
                      {isTransitsExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          View All {transits.length} Events
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

          {/* Sarvashtakavarga (SAV) */}
          <div className="p-6 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-mono mb-4">
              <Activity className="w-3 h-3" /> Sarvashtakavarga (SAV)
            </div>
            <div className="grid grid-cols-6 gap-2">
              {RASHIS.map((rashi, i) => {
                const score = ashtakavarga.sav[i];
                const isStrong = score >= 28;
                const isWeak = score < 25;
                return (
                  <div key={rashi} className={cn(
                    "p-2 rounded border flex flex-col items-center justify-center transition-colors",
                    isStrong ? "bg-green-500/10 border-green-500/20 text-green-400" :
                    isWeak ? "bg-red-500/10 border-red-500/20 text-red-400" :
                    "bg-white/5 border-white/10 text-white/80"
                  )}>
                    <div className="text-[8px] uppercase tracking-wider mb-1">{rashi.substring(0, 3)}</div>
                    <div className="text-sm font-mono">{score}</div>
                  </div>
                );
              })}
            </div>
          </div>

            {/* Planet List */}
            <div className="p-4 space-y-2 flex-shrink-0">
              <div className="px-4 py-2 text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono flex justify-between items-center">
                <span>Planetary Positions</span>
                {selectedZodiac !== null && (
                  <span className="text-orange-500 animate-pulse">Filtering by {RASHIS[selectedZodiac]}</span>
                )}
              </div>
              {positions.map((p) => {
                const isInSelectedZodiac = selectedZodiac !== null && p.rashi === RASHIS[selectedZodiac];
                return (
                  <button
                    key={p.name}
                    onClick={() => {
                      setSelectedPlanet(p.name);
                      // If we were filtering by zodiac, maybe keep it or clear it? 
                      // Let's keep it for now as it's a "highlight" feature.
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group border",
                      selectedPlanet === p.name 
                        ? "bg-white/10 border-white/20 shadow-lg scale-[1.02]" 
                        : isInSelectedZodiac
                        ? "bg-orange-500/5 border-orange-500/20"
                        : "bg-transparent border-transparent hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                          p.symbol.length > 1 ? "text-xs font-bold" : "text-lg",
                          isInSelectedZodiac && "ring-1 ring-orange-500/50"
                        )}
                        style={{ backgroundColor: p.color, color: '#000' }}
                      >
                        {p.symbol}
                      </div>
                      <div className="text-left">
                        <div className="font-medium flex items-center gap-2">
                          {p.name}
                          <div className="flex gap-1">
                            {p.isRetrograde && !["Rahu", "Ketu"].includes(p.name) && (
                              <span className="text-[8px] px-1 rounded bg-orange-500/20 text-orange-500 border border-orange-500/20" title="Retrograde">Rx</span>
                            )}
                            {p.isCombust && (
                              <span className="text-[8px] px-1 rounded bg-red-500/20 text-red-500 border border-red-500/20" title="Combust">C</span>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                          {p.nakshatra} • P{p.pada} {p.house ? `• ${getOrdinal(p.house)} H` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className={cn("font-mono text-sm", isInSelectedZodiac && "text-orange-500")}>
                        {p.degree}°{p.minute}'
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-transform",
                        selectedPlanet === p.name ? "rotate-90 text-orange-500" : "text-white/20"
                      )} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Activity className={cn("w-4 h-4", isLive ? "text-green-500" : "text-orange-500")} />
              <div>
                <div className="text-[8px] text-white/40 uppercase tracking-widest font-mono">Engine Status</div>
                <div className="text-[10px] font-mono">{isLive ? "Live Sync" : "Manual"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-[8px] text-white/40 uppercase tracking-widest font-mono">Precision</div>
                <div className="text-[10px] font-mono">High (64-bit)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CircleDot className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-[8px] text-white/40 uppercase tracking-widest font-mono">Coordinate</div>
                <div className="text-[10px] font-mono">{location ? "Topocentric" : "Geocentric"}</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}

"use client";

/**
 * City search (GET /api/geocode) + browser geolocation with reverse geocode,
 * mirroring TodaysTransitForm. Updates lat/lng/timezone; syncs to BirthProfile via POST /api/transit/location.
 * Shares localStorage key with transit so one saved place applies to both flows.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Search } from "lucide-react";

const LOCATION_STORAGE_KEY = "cc:transit:location";

const barBtnBase =
  "inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,95,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(13,18,32,0.45)] disabled:opacity-50";
const LOCATION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface StoredLocation {
  displayName: string;
  lat: number;
  lon: number;
  savedAt: number;
}

interface CityResult {
  displayName: string;
  lat: number;
  lon: number;
  timezone?: string;
}

function saveLocationToStorage(loc: { displayName: string; lat: number; lon: number }) {
  try {
    const stored: StoredLocation = { ...loc, savedAt: Date.now() };
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    /* ignore */
  }
}

function syncLocationToDB(coords: { lat: number; lon: number }) {
  fetch("/api/transit/location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: coords.lat, longitude: coords.lon }),
  }).catch(() => {});
}

export interface PurusharthaLocationBarProps {
  latitude: string;
  longitude: string;
  timeZone: string;
  onLatitudeChange: (v: string) => void;
  onLongitudeChange: (v: string) => void;
  onTimeZoneChange: (v: string) => void;
  /** From BirthProfile.observationCity when available */
  initialPlaceLabel?: string | null;
}

export function PurusharthaLocationBar({
  latitude,
  longitude,
  timeZone,
  onLatitudeChange,
  onLongitudeChange,
  onTimeZoneChange,
  initialPlaceLabel,
}: PurusharthaLocationBarProps) {
  const [placeLabel, setPlaceLabel] = useState<string | null>(() => {
    const s = initialPlaceLabel != null ? String(initialPlaceLabel).trim() : "";
    return s.length > 0 ? s : null;
  });
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [citySearching, setCitySearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [geoState, setGeoState] = useState<"idle" | "requesting" | "granted" | "denied" | "error">("idle");
  const [geoError, setGeoError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyCoords = useCallback(
    (lat: number, lon: number, label: string, tz?: string) => {
      onLatitudeChange(String(lat));
      onLongitudeChange(String(lon));
      if (tz && tz.length > 1) onTimeZoneChange(tz);
      setPlaceLabel(label);
      saveLocationToStorage({ displayName: label, lat, lon });
      syncLocationToDB({ lat, lon });
    },
    [onLatitudeChange, onLongitudeChange, onTimeZoneChange]
  );

  const hasServerPlaceLabel =
    initialPlaceLabel != null && String(initialPlaceLabel).trim().length > 0;

  useEffect(() => {
    if (hasServerPlaceLabel) setPlaceLabel(String(initialPlaceLabel).trim());
  }, [hasServerPlaceLabel, initialPlaceLabel]);

  useEffect(() => {
    if (hasServerPlaceLabel) return;
    try {
      const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (!raw) return;
      const stored: StoredLocation = JSON.parse(raw);
      if (Date.now() - stored.savedAt >= LOCATION_MAX_AGE_MS) {
        localStorage.removeItem(LOCATION_STORAGE_KEY);
        return;
      }
      onLatitudeChange(String(stored.lat));
      onLongitudeChange(String(stored.lon));
      setPlaceLabel(stored.displayName);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore when no server city; setters stable enough
  }, [hasServerPlaceLabel, onLatitudeChange, onLongitudeChange]);

  const searchCities = useCallback(async (q: string) => {
    if (q.length < 3) {
      setCityResults([]);
      setNoResults(false);
      return;
    }
    setCitySearching(true);
    setNoResults(false);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const places: CityResult[] = (data.places ?? []).map(
        (p: { displayName: string; lat: number; lon: number; timezone?: string }) => ({
          displayName: p.displayName,
          lat: p.lat,
          lon: p.lon,
          timezone: p.timezone,
        })
      );
      setCityResults(places);
      setNoResults(places.length === 0);
    } catch {
      setCityResults([]);
    } finally {
      setCitySearching(false);
    }
  }, []);

  function handleCityQueryChange(val: string) {
    setCityQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCities(val), 300);
  }

  function selectCity(city: CityResult) {
    applyCoords(city.lat, city.lon, city.displayName, city.timezone);
    setShowCitySearch(false);
    setCityQuery("");
    setCityResults([]);
    setGeoError(null);
  }

  function requestGeolocation() {
    setGeoState("requesting");
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoState("error");
      setGeoError("Geolocation is not supported by this browser.");
      setShowCitySearch(true);
      return;
    }

    const timeout = setTimeout(() => {
      setGeoState("error");
      setGeoError("Location request timed out. Try searching for your city below.");
      setShowCitySearch(true);
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(timeout);
        const { latitude: lat, longitude: lon } = pos.coords;
        const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        try {
          const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
          if (!res.ok) throw new Error("reverse failed");
          const data = await res.json();
          if (data.displayName) {
            applyCoords(lat, lon, data.displayName, deviceTz);
            setGeoState("granted");
          } else {
            throw new Error("no name");
          }
        } catch {
          applyCoords(lat, lon, `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`, deviceTz);
          setGeoState("error");
          setGeoError(
            "Could not resolve a place name. Coordinates and your device timezone are set — search your city to refine the label."
          );
          setShowCitySearch(true);
        }
      },
      (err) => {
        clearTimeout(timeout);
        if (err.code === 1) {
          setGeoState("denied");
          setGeoError("Location access was denied. Search for your city below.");
        } else {
          setGeoState("error");
          setGeoError("Could not get your location. Search for your city below.");
        }
        setShowCitySearch(true);
      },
      { timeout: 9000, maximumAge: 60000 }
    );
  }

  return (
    <div
      className="rounded-[14px] border p-4"
      style={{
        background: "rgba(13,18,32,0.45)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] uppercase tracking-[0.14em]"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: "var(--mist, rgba(255,255,255,0.4))",
            }}
          >
            Observation place
          </p>
          {placeLabel ? (
            <p
              className="mt-1 truncate text-sm"
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                color: "var(--cream, rgba(255,255,255,0.88))",
              }}
            >
              {placeLabel}
            </p>
          ) : (
            <p
              className="mt-1 text-sm italic"
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                color: "var(--mist, rgba(255,255,255,0.4))",
              }}
            >
              Set coordinates via map pin or city search — needed for Lagna and houses.
            </p>
          )}
          <p
            className="mt-1 text-[11px]"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: "var(--mist, rgba(255,255,255,0.45))",
            }}
          >
            φ {latitude || "—"} · λ {longitude || "—"} · {timeZone || "—"}
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={requestGeolocation}
            disabled={geoState === "requesting"}
            className={`${barBtnBase} font-semibold border-[rgba(200,135,58,0.38)] bg-[rgba(200,135,58,0.08)] text-[color:var(--cream,rgba(255,255,255,0.9))] hover:border-[rgba(200,135,58,0.5)] hover:bg-[rgba(200,135,58,0.14)]`}
            style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
          >
            <MapPin
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: "var(--gold-solar, #D4AF37)" }}
              aria-hidden
            />
            {geoState === "requesting" ? "Locating…" : "Use my location"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCitySearch((s) => !s);
              setGeoError(null);
            }}
            className={
              showCitySearch
                ? `${barBtnBase} font-semibold border-[rgba(200,135,58,0.45)] bg-[rgba(200,135,58,0.12)] text-[color:var(--cream,rgba(255,255,255,0.92))] hover:bg-[rgba(200,135,58,0.18)]`
                : `${barBtnBase} font-medium border-white/15 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10`
            }
            style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
            aria-expanded={showCitySearch}
          >
            <Search
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: "var(--gold-solar, #D4AF37)" }}
              aria-hidden
            />
            {showCitySearch ? "Hide search" : "Search city"}
          </button>
        </div>
      </div>

      {geoState === "requesting" && (
        <p
          className="mt-3 text-xs"
          style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            color: "var(--mist, rgba(255,255,255,0.45))",
          }}
        >
          Requesting browser location…
        </p>
      )}

      {(geoState === "denied" || geoState === "error") && geoError && (
        <p className="mt-3 text-xs leading-relaxed text-rose-300/90">{geoError}</p>
      )}

      {showCitySearch && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <label
            className="text-[10px] uppercase tracking-[0.14em]"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: "var(--mist, rgba(255,255,255,0.4))",
            }}
          >
            Search city
          </label>
          <div className="relative mt-1.5">
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => handleCityQueryChange(e.target.value)}
              placeholder="Type at least 3 characters…"
              className="w-full rounded-[10px] border border-white/10 bg-[rgba(13,18,32,0.45)] px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[rgba(200,135,58,0.35)]"
            />
            {citySearching && (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">
                …
              </span>
            )}
          </div>
          {cityResults.length > 0 && (
            <ul
              className="mt-2 max-h-48 overflow-auto rounded-[14px] border border-white/10"
              style={{ background: "rgba(13,18,32,0.65)" }}
            >
              {cityResults.map((c, i) => (
                <li key={`${c.displayName}-${i}`} className="border-b border-white/[0.06] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => selectCity(c)}
                    className="w-full px-3 py-2.5 text-left text-sm text-white/90 transition-colors focus-visible:bg-[rgba(200,135,58,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgba(212,175,95,0.25)] hover:bg-[rgba(200,135,58,0.08)]"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    }}
                  >
                    {c.displayName}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {noResults && cityQuery.length >= 3 && !citySearching && (
            <p className="mt-2 text-xs text-white/45">No cities found.</p>
          )}
        </div>
      )}
    </div>
  );
}

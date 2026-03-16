"use client";
/**
 * components/transit/TodaysTransitForm.tsx
 * Today's Transit Chart — full client-side flow:
 * geolocation → city search fallback → submit → chart result
 *
 * Location persistence:
 *  - Saved to localStorage (cc:transit:location) with 7-day expiry after each resolve
 *  - Synced to DB via POST /api/transit/location (background, non-blocking)
 *  - On mount: restored from savedCity prop (DB) or localStorage, then auto-submits
 */

import { useState, useEffect, useRef, useCallback } from "react";

const LOCATION_STORAGE_KEY = "cc:transit:location";
const LOCATION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface StoredLocation {
  displayName: string;
  lat: number;
  lon: number;
  savedAt: number;
}

interface Props {
  userName: string;
  /** Pre-populated from DB (BirthProfile.observationCity). Skips localStorage check when present. */
  savedCity?: string;
}

interface CityResult {
  displayName: string;
  lat: number;
  lon: number;
}

interface TransitResult {
  chart: Record<string, unknown>;
  meta: {
    name: string;
    dateOfBirth: string;
    timeOfBirth: string;
    location: string;
    generatedAt: string;
  };
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}
function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function formatTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function saveLocationToStorage(loc: { displayName: string; lat: number; lon: number }) {
  try {
    const stored: StoredLocation = { ...loc, savedAt: Date.now() };
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // localStorage may be unavailable (private mode, etc.)
  }
}

function clearLocationFromStorage() {
  try {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Fire-and-forget: syncs lat/lon to BirthProfile in DB, busts KV cache */
function syncLocationToDB(coords: { lat: number; lon: number }) {
  fetch("/api/transit/location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: coords.lat, longitude: coords.lon }),
  }).catch(() => {
    // non-critical — DB sync is best-effort
  });
}

export function TodaysTransitForm({ userName, savedCity }: Props) {
  const [location, setLocation] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<"geo" | "manual" | "saved" | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "requesting" | "granted" | "denied" | "error">("idle");
  const [geoError, setGeoError] = useState<string | null>(null);

  const [showCitySearch, setShowCitySearch] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [citySearching, setCitySearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const [now, setNow] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TransitResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live clock — initialised client-side only to avoid SSR/hydration mismatch
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /** Core submit — accepts location string directly to avoid stale closure issues */
  const submitWithLocation = useCallback(async (loc: string) => {
    setSubmitting(true);
    setSubmitError(null);
    setResult(null);
    try {
      const res = await fetch("/api/transit/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: loc }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Chart generation failed. Please try again.");
      } else {
        setResult(data as TransitResult);
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Restore saved location on mount and auto-submit
  useEffect(() => {
    // 1. DB-persisted location passed as server prop (highest priority)
    if (savedCity) {
      setLocation(savedCity);
      setLocationSource("saved");
      submitWithLocation(savedCity);
      return;
    }

    // 2. Client-side localStorage (7-day expiry)
    try {
      const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (raw) {
        const stored: StoredLocation = JSON.parse(raw);
        if (Date.now() - stored.savedAt < LOCATION_MAX_AGE_MS) {
          setLocation(stored.displayName);
          setLocationSource("saved");
          submitWithLocation(stored.displayName);
        } else {
          localStorage.removeItem(LOCATION_STORAGE_KEY);
        }
      }
    } catch {
      // ignore parse errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-only — savedCity is stable from SSR

  // City search debounce
  const searchCities = useCallback(async (q: string) => {
    if (q.length < 3) { setCityResults([]); setNoResults(false); return; }
    setCitySearching(true);
    setNoResults(false);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const places: CityResult[] = (data.places ?? []).map((p: { displayName: string; lat: number; lon: number }) => ({
        displayName: p.displayName,
        lat: p.lat,
        lon: p.lon,
      }));
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
    setLocation(city.displayName);
    setLocationSource("manual");
    setShowCitySearch(false);
    setCityQuery("");
    setCityResults([]);
    // Persist to localStorage and sync to DB
    saveLocationToStorage({ displayName: city.displayName, lat: city.lat, lon: city.lon });
    syncLocationToDB({ lat: city.lat, lon: city.lon });
  }

  async function requestGeolocation() {
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
      setGeoError("Location request timed out.");
      setShowCitySearch(true);
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(timeout);
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error("Reverse geocode failed");
          const data = await res.json();
          if (data.displayName) {
            setLocation(data.displayName);
            setLocationSource("geo");
            setGeoState("granted");
            // Persist to localStorage and sync to DB
            saveLocationToStorage({ displayName: data.displayName, lat: latitude, lon: longitude });
            syncLocationToDB({ lat: latitude, lon: longitude });
          } else {
            throw new Error("No city returned");
          }
        } catch {
          setGeoState("error");
          setGeoError("Could not resolve your location name. Please enter your city manually.");
          setShowCitySearch(true);
        }
      },
      (err) => {
        clearTimeout(timeout);
        if (err.code === 1) {
          setGeoState("denied");
          setGeoError("Location access was denied. Please select your city manually.");
        } else {
          setGeoState("error");
          setGeoError("Could not get your location. Please enter your city manually.");
        }
        setShowCitySearch(true);
      },
      { timeout: 9000, maximumAge: 60000 }
    );
  }

  function handleChangeLocation() {
    setLocation(null);
    setLocationSource(null);
    setShowCitySearch(true);
    setCityQuery("");
    setCityResults([]);
    setResult(null);
    clearLocationFromStorage();
  }

  async function handleSubmit() {
    if (!location) return;
    submitWithLocation(location);
  }

  // ── Render ──────────────────────────────────────────────────────────────

  const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const serif: React.CSSProperties = { fontFamily: "Cinzel, serif" };
  const sans: React.CSSProperties = { fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" };
  const eyebrow: React.CSSProperties = { ...mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 6 };
  const label: React.CSSProperties = { ...mono, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--mist)", marginBottom: 4 };
  const value: React.CSSProperties = { ...sans, fontSize: 14, color: "var(--cream)", lineHeight: 1.5 };

  // Extract typed values from chart result for TypeScript narrowing
  type PlanetRow = Record<string, unknown>;
  const planets: PlanetRow[] = result && Array.isArray(result.chart.planets)
    ? (result.chart.planets as PlanetRow[])
    : [];
  const ascendant = result?.chart.ascendant as Record<string,unknown> | undefined | null;
  const currentDasha = result?.chart.currentDasha as Record<string,unknown> | undefined | null;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>

      {/* ── Info panel (read-only) ─────────────────────────────── */}
      <div className="v2-card" style={{ marginBottom: 20 }}>
        <p style={eyebrow}>✦ Chart Details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", marginBottom: 20 }}>
          <div>
            <p style={label}>Name</p>
            <p style={value}>{userName}</p>
          </div>
          <div>
            <p style={label}>Date</p>
            <p style={value}>{now ? formatDate(now) : '—'}</p>
          </div>
          <div>
            <p style={label}>Time (live)</p>
            <p style={{ ...value, ...mono, fontSize: 16, letterSpacing: "0.06em" }}>{now ? formatTime(now) : '--:--:--'}</p>
          </div>
          <div>
            <p style={label}>Location</p>
            {location ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <p style={{ ...value, flex: 1 }}>{location}</p>
                <button
                  onClick={handleChangeLocation}
                  style={{ ...mono, fontSize: 8, letterSpacing: "0.1em", background: "none", border: "none", color: "var(--amber)", cursor: "pointer", padding: "3px 0", textTransform: "uppercase", flexShrink: 0, marginTop: 2 }}
                >Change</button>
              </div>
            ) : (
              <p style={{ ...value, color: "var(--mist)", fontStyle: "italic" }}>Not set</p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(200,135,58,0.1)", margin: "4px 0 16px" }} />

        {/* ── Location detection ──────────────────────────── */}
        {!location && geoState === "idle" && (
          <div>
            <p style={{ ...sans, fontSize: 12.5, color: "var(--mist)", lineHeight: 1.65, marginBottom: 14 }}>
              To generate your transit chart, we need your current location.
              Your location is saved for future visits — you can change it at any time.
            </p>
            <button
              onClick={requestGeolocation}
              style={{ padding: "9px 20px", background: "rgba(200,135,58,0.06)", border: "1px solid rgba(200,135,58,0.28)", borderRadius: 2, color: "var(--gold)", ...sans, fontSize: 12.5, cursor: "pointer", letterSpacing: "0.06em" }}
            >
              Detect My Location
            </button>
            <button
              onClick={() => setShowCitySearch(true)}
              style={{ marginLeft: 10, background: "none", border: "none", color: "var(--mist)", ...sans, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              Enter city manually
            </button>
          </div>
        )}

        {geoState === "requesting" && (
          <p style={{ ...sans, fontSize: 12.5, color: "var(--mist)", fontStyle: "italic" }}>Requesting location…</p>
        )}

        {/* Geo error / denied notice */}
        {(geoState === "denied" || geoState === "error") && geoError && (
          <p style={{ ...sans, fontSize: 12, color: "rgba(200,100,60,0.9)", marginBottom: 12, lineHeight: 1.5 }}>
            {geoError}
          </p>
        )}

        {/* City search */}
        {(showCitySearch || (geoState !== "idle" && geoState !== "requesting" && !location)) && (
          <div style={{ marginTop: location ? 0 : 4 }}>
            <p style={{ ...label, marginBottom: 8 }}>Search City</p>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => handleCityQueryChange(e.target.value)}
                placeholder="Type at least 3 characters…"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "9px 12px", background: "rgba(13,18,32,0.6)",
                  border: "1px solid rgba(200,135,58,0.22)", borderRadius: 2,
                  color: "var(--cream)", ...sans, fontSize: 13,
                  outline: "none",
                }}
              />
              {citySearching && (
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", ...mono, fontSize: 9, color: "var(--mist)" }}>…</span>
              )}
            </div>
            {cityResults.length > 0 && (
              <ul style={{ listStyle: "none", margin: "4px 0 0", padding: 0, background: "rgba(13,18,32,0.95)", border: "1px solid rgba(200,135,58,0.18)", borderRadius: 2 }}>
                {cityResults.map((c, i) => (
                  <li key={i}>
                    <button
                      onClick={() => selectCity(c)}
                      style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "9px 12px", color: "var(--cream)", ...sans, fontSize: 13, cursor: "pointer", borderBottom: i < cityResults.length - 1 ? "1px solid rgba(200,135,58,0.08)" : "none" }}
                    >
                      {c.displayName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {noResults && cityQuery.length >= 3 && !citySearching && (
              <p style={{ ...sans, fontSize: 12, color: "var(--mist)", marginTop: 6 }}>No cities found.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Submit button ──────────────────────────────────────────── */}
      {!result && (
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <button
            onClick={handleSubmit}
            disabled={!location || submitting}
            style={{
              padding: "12px 36px",
              background: location && !submitting ? "rgba(200,135,58,0.08)" : "rgba(200,135,58,0.03)",
              border: `1px solid ${location && !submitting ? "rgba(200,135,58,0.45)" : "rgba(200,135,58,0.15)"}`,
              borderRadius: 2, ...sans, fontSize: 13, fontWeight: 500,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: location && !submitting ? "var(--gold)" : "var(--mist)",
              cursor: location && !submitting ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            {submitting ? "Reading the stars…" : "Generate My Chart"}
          </button>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────── */}
      {submitError && (
        <div className="v2-card" style={{ marginBottom: 20, borderColor: "rgba(200,80,60,0.25)" }}>
          <p style={{ ...sans, fontSize: 13, color: "rgba(220,100,80,0.9)", marginBottom: 12, lineHeight: 1.6 }}>{submitError}</p>
          <button
            onClick={handleSubmit}
            style={{ ...sans, fontSize: 12, color: "var(--amber)", background: "none", border: "1px solid rgba(200,135,58,0.22)", borderRadius: 2, padding: "6px 16px", cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Result ────────────────────────────────────────────────── */}
      {result && (
        <div className="v2-card">
          <p style={eyebrow}>✦ Transit Chart Generated</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 20px", marginBottom: 20 }}>
            {[
              { label: "Name", val: result.meta.name },
              { label: "Date", val: result.meta.dateOfBirth },
              { label: "Time", val: result.meta.timeOfBirth },
              { label: "Location", val: result.meta.location },
              { label: "Sun Sign", val: result.chart.sunSign as string ?? "—" },
              { label: "Moon Sign", val: result.chart.moonSign as string ?? "—" },
            ].map(({ label: l, val }) => (
              <div key={l}>
                <p style={label}>{l}</p>
                <p style={value}>{val ?? "—"}</p>
              </div>
            ))}
          </div>

          {/* Ascendant */}
          {ascendant ? (
            <div style={{ marginBottom: 16 }}>
              <p style={label}>Ascendant</p>
              <p style={value}>
                {`${ascendant.sign ?? "—"} ${ascendant.degree != null ? `${Number(ascendant.degree).toFixed(1)}°` : ""}`}
              </p>
            </div>
          ) : null}

          {planets.length > 0 ? (
            <div>
              <p style={{ ...label, marginTop: 16, marginBottom: 8 }}>Planetary Positions</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", ...sans, fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Planet", "Sign", "House", "Degree"].map(h => (
                        <th key={h} style={{ ...mono, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", textAlign: "left", padding: "4px 8px 8px 0", borderBottom: "1px solid rgba(200,135,58,0.12)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {planets.map((p, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(200,135,58,0.06)" }}>
                        <td style={{ color: "var(--cream)", padding: "6px 8px 6px 0", textTransform: "capitalize" }}>{String(p.name ?? "—")}</td>
                        <td style={{ color: "var(--mist)", padding: "6px 8px 6px 0" }}>{String(p.sign ?? p.rashi ?? "—")}</td>
                        <td style={{ color: "var(--mist)", padding: "6px 8px 6px 0" }}>{p.house != null ? String(p.house) : "—"}</td>
                        <td style={{ color: "var(--mist)", padding: "6px 8px 6px 0" }}>{p.degree != null ? `${Number(p.degree).toFixed(1)}°` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {currentDasha ? (
            <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(200,135,58,0.04)", border: "1px solid rgba(200,135,58,0.12)", borderRadius: 2 }}>
              <p style={{ ...mono, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 6 }}>Current Dasha</p>
              <p style={{ ...sans, fontSize: 13, color: "var(--cream)", lineHeight: 1.6 }}>
                {String(currentDasha.planetName ?? currentDasha.planet ?? "—")} Mahadasha
                {currentDasha.startDate ? ` · ${String(currentDasha.startDate).slice(0, 10)} – ${String(currentDasha.endDate ?? "").slice(0, 10)}` : ""}
              </p>
            </div>
          ) : null}

          <div style={{ marginTop: 16, textAlign: "right" }}>
            <button
              onClick={() => { setResult(null); setSubmitError(null); }}
              style={{ ...sans, fontSize: 11, color: "var(--mist)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.06em" }}
            >
              ↺ Generate Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

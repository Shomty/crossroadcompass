"use client";

/**
 * app/(app)/settings/profile/page.tsx
 * Edit birth profile — v2 glass card style.
 * Auth + shell provided by (app)/layout.tsx.
 */

import { useEffect, useState } from "react";
import { BirthDataForm, BirthDataValues } from "@/components/onboarding/BirthDataForm";

interface ProfileData extends BirthDataValues {
  cityLabel: string;
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Planetary positions / observation location state
  const [observationCity, setObservationCity] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [refreshingTransits, setRefreshingTransits] = useState(false);
  const [transitRefreshed, setTransitRefreshed] = useState(false);
  const [transitError, setTransitError] = useState<string | null>(null);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const res = await fetch("/api/birth-profile");
      if (res.status === 404) { setProfile(null); setLoading(false); return; }
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      const p = data.profile;
      const dateStr = p.birthDate ? p.birthDate.slice(0, 10) : "";
      setProfile({
        birthName: p.birthName ?? "",
        birthDate: dateStr,
        birthTimeKnown: p.birthTimeKnown ?? true,
        birthHour: p.birthHour ?? null,
        birthMinute: p.birthMinute ?? null,
        gender: p.gender ?? null,
        birthCity: p.birthCity ?? "",
        birthCountry: p.birthCountry ?? "",
        latitude: p.latitude ?? 0,
        longitude: p.longitude ?? 0,
        timezone: p.timezone ?? "",
        cityLabel: [p.birthCity, p.birthCountry].filter(Boolean).join(", "),
      });
      setObservationCity(p.observationCity ?? null);
    } catch {
      setFetchError("Could not load your profile. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  function handleSuccess() {
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
    loadProfile();
  }

  async function detectLocation() {
    setLocating(true);
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/transit/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Failed to save location");
          setObservationCity(data.city);
        } catch (e) {
          setLocError(e instanceof Error ? e.message : "Could not save location.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setLocError("Location access denied. Please allow location in your browser.");
        else setLocError("Could not detect location. Please try again.");
      },
      { timeout: 10000 }
    );
  }

  async function clearObservationLocation() {
    await fetch("/api/transit/location", { method: "DELETE" });
    setObservationCity(null);
  }

  async function refreshTransits() {
    setRefreshingTransits(true);
    setTransitError(null);
    setTransitRefreshed(false);
    try {
      const res = await fetch("/api/transit/reading?force=true");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to refresh");
      }
      setTransitRefreshed(true);
      setTimeout(() => setTransitRefreshed(false), 4000);
    } catch (e) {
      setTransitError(e instanceof Error ? e.message : "Refresh failed.");
    } finally {
      setRefreshingTransits(false);
    }
  }

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "calc(64px + 2rem) 1.5rem 6rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "var(--gold)", opacity: 0.7, marginBottom: "0.5rem" }}>
          Account
        </p>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(1.75rem, 4vw, 2.4rem)", fontWeight: 500, color: "var(--cream)", letterSpacing: "-0.02em", lineHeight: 1.1, margin: 0 }}>
          Birth Profile
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--mist)", lineHeight: 1.7, marginTop: "0.5rem" }}>
          Changes here will recalculate your Human Design chart.
        </p>
      </div>

      {/* Success toast */}
      {saved && (
        <div style={{ marginBottom: "1.5rem", padding: "0.75rem 1.25rem", borderRadius: 10, border: "1px solid rgba(212,175,95,0.3)", background: "rgba(212,175,95,0.08)", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", color: "var(--gold)", textTransform: "uppercase" as const }}>
          ✓ Profile saved — your chart is being recalculated
        </div>
      )}

      {/* Error */}
      {fetchError && (
        <p style={{ color: "#e07060", fontSize: "0.875rem", marginBottom: "1.5rem" }}>{fetchError}</p>
      )}

      {/* Glass card wrapper */}
      <div className="glass-card" style={{ padding: "2rem" }}>
        <div className="card-grain" />
        <div style={{ position: "relative", zIndex: 1 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: 52, borderRadius: 10, background: "rgba(212,175,95,0.06)", animation: "pulse 1.8s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          ) : (
            <BirthDataForm
              initialValues={profile ?? undefined}
              isEdit={profile !== null}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>

      {/* Chart data download */}
      {!loading && profile && (
        <div style={{ marginTop: "1.5rem", padding: "1.25rem 1.5rem", borderRadius: 10, border: "1px solid rgba(212,175,95,0.15)", background: "rgba(212,175,95,0.04)" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--gold)", opacity: 0.7, margin: "0 0 0.5rem" }}>
            Chart Data
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--mist)", lineHeight: 1.6, margin: "0 0 0.75rem" }}>
            Download the raw Vedic natal chart JSON. Regenerated only when you update your birth data.
          </p>
          <a
            href="/api/chart/vedic-data"
            download
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--gold)", border: "1px solid rgba(212,175,95,0.3)", borderRadius: 6, padding: "0.4rem 0.9rem", textDecoration: "none" }}
          >
            ↓ Download chart JSON
          </a>
        </div>
      )}

      {/* Planetary Positions */}
      {!loading && profile && (
        <div style={{ marginTop: "1.5rem", padding: "1.25rem 1.5rem", borderRadius: 10, border: "1px solid rgba(212,175,95,0.15)", background: "rgba(212,175,95,0.04)" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--gold)", opacity: 0.7, margin: "0 0 0.35rem" }}>
            Planetary Positions
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--mist)", lineHeight: 1.6, margin: "0 0 0.75rem" }}>
            Used to calculate today&apos;s transit sky view. Defaults to your birth location.
          </p>

          {/* Current observation location */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.9rem", fontSize: "0.8rem", color: "var(--mist)" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--gold)", opacity: 0.5 }}>
              Current:
            </span>
            <span>{observationCity ?? profile.cityLabel ?? "Birth location"}</span>
            {observationCity && (
              <button
                onClick={clearObservationLocation}
                title="Clear — revert to birth location"
                style={{ background: "none", border: "none", color: "rgba(212,175,95,0.4)", cursor: "pointer", padding: "0 2px", fontSize: 13, lineHeight: 1 }}
              >
                ×
              </button>
            )}
          </div>

          {locError && (
            <p style={{ fontSize: "0.75rem", color: "#e07060", marginBottom: "0.75rem" }}>{locError}</p>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10 }}>
            <button
              onClick={detectLocation}
              disabled={locating}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color: locating ? "rgba(212,175,95,0.4)" : "var(--gold)",
                border: "1px solid rgba(212,175,95,0.3)", borderRadius: 6,
                padding: "0.4rem 0.9rem", background: "none", cursor: locating ? "default" : "pointer",
              }}
            >
              {locating ? "Detecting…" : "◎ Detect my location"}
            </button>

            <button
              onClick={refreshTransits}
              disabled={refreshingTransits}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color: refreshingTransits ? "rgba(212,175,95,0.4)" : "var(--gold)",
                border: "1px solid rgba(212,175,95,0.3)", borderRadius: 6,
                padding: "0.4rem 0.9rem", background: "none", cursor: refreshingTransits ? "default" : "pointer",
              }}
            >
              {refreshingTransits ? "Refreshing…" : "↺ Refresh transits"}
            </button>
          </div>

          {transitRefreshed && (
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.12em", color: "var(--gold)", textTransform: "uppercase" as const, marginTop: "0.75rem" }}>
              ✓ Transit data refreshed
            </p>
          )}
          {transitError && (
            <p style={{ fontSize: "0.75rem", color: "#e07060", marginTop: "0.75rem" }}>{transitError}</p>
          )}
        </div>
      )}
    </div>
  );
}

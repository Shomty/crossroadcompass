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

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "calc(64px + 2rem) 1.5rem 6rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "var(--gold)", opacity: 0.7, marginBottom: "0.5rem" }}>
          Account
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.75rem, 4vw, 2.4rem)", fontWeight: 500, color: "var(--moon)", letterSpacing: "-0.02em", lineHeight: 1.1, margin: 0 }}>
          Birth Profile
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.7, marginTop: "0.5rem" }}>
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
    </div>
  );
}

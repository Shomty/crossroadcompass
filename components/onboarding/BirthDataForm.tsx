"use client";

/**
 * components/onboarding/BirthDataForm.tsx
 * 2-step birth data form — Auric Root design system.
 *
 * Step 1 — Personal details: name · date of birth · time of birth · gender
 * Step 2 — Place of birth (Nominatim geocoding)
 *
 * Used on: /onboarding (new users) and /settings/profile (edit mode).
 * In edit mode pass `initialValues` and `isEdit=true`; form submits PATCH
 * instead of POST and calls `onSuccess` instead of redirecting.
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────

type Gender = "male" | "female" | "other" | null;

interface GeoPlace {
  displayName: string;
  lat: number;
  lon: number;
  timezone: string;
}

interface FormState {
  birthName: string;
  birthDate: string;       // YYYY-MM-DD
  birthTimeKnown: boolean;
  birthHour: string;
  birthMinute: string;
  gender: Gender;
  cityQuery: string;
  selectedPlace: GeoPlace | null;
}

export interface BirthDataValues {
  birthName: string;
  birthDate: string;
  birthTimeKnown: boolean;
  birthHour: number | null;
  birthMinute: number | null;
  gender: Gender;
  birthCity: string;
  birthCountry: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface Props {
  /** Pre-fill for edit mode. */
  initialValues?: Partial<BirthDataValues> & { cityLabel?: string };
  /** true = show PATCH flow + call onSuccess; false = POST flow + redirect */
  isEdit?: boolean;
  onSuccess?: () => void;
}

// ─── Step indicator ───────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2.5rem" }}>
      {Array.from({ length: total }, (_, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.1em",
                border: active ? "1px solid var(--amber)" : done ? "1px solid rgba(200,135,58,0.4)" : "1px solid rgba(200,135,58,0.15)",
                background: active ? "rgba(200,135,58,0.12)" : "transparent",
                color: active ? "var(--amber)" : done ? "var(--amber)" : "var(--mist)",
                opacity: done ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {done ? "✓" : `0${num}`}
            </div>
            {i < total - 1 && (
              <div style={{ width: 32, height: 1, background: done ? "rgba(200,135,58,0.35)" : "rgba(200,135,58,0.1)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <label>{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

// ─── Gender radio chips ───────────────────────────────────────────────────

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: null, label: "Prefer not to say" },
];

function GenderChips({ value, onChange }: { value: Gender; onChange: (v: Gender) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
      {GENDERS.map((g) => {
        const selected = value === g.value;
        return (
          <button
            key={String(g.value)}
            type="button"
            onClick={() => onChange(g.value)}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 2,
              border: selected ? "1px solid var(--amber)" : "1px solid rgba(200,135,58,0.2)",
              background: selected ? "rgba(200,135,58,0.12)" : "transparent",
              color: selected ? "var(--amber)" : "var(--mist)",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {g.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

export function BirthDataForm({ initialValues, isEdit = false, onSuccess }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build initial city label for edit mode
  const initialCityLabel = initialValues?.cityLabel ?? (initialValues?.birthCity ? `${initialValues.birthCity}, ${initialValues.birthCountry ?? ""}`.trim().replace(/,$/, "") : "");

  const [form, setForm] = useState<FormState>({
    birthName: initialValues?.birthName ?? "",
    birthDate: initialValues?.birthDate ?? "",
    birthTimeKnown: initialValues?.birthTimeKnown ?? true,
    birthHour: initialValues?.birthHour != null ? String(initialValues.birthHour) : "",
    birthMinute: initialValues?.birthMinute != null ? String(initialValues.birthMinute) : "",
    gender: initialValues?.gender ?? null,
    cityQuery: initialCityLabel,
    selectedPlace: initialValues?.latitude != null ? {
      displayName: initialCityLabel,
      lat: initialValues.latitude,
      lon: initialValues.longitude ?? 0,
      timezone: initialValues.timezone ?? "",
    } : null,
  });

  // Geocoding state
  const [geoResults, setGeoResults] = useState<GeoPlace[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── Geocode search ──────────────────────────────────────────────────────

  const searchCity = useCallback(async () => {
    if (!form.cityQuery.trim()) return;
    setGeoLoading(true);
    setGeoError(null);
    setGeoResults([]);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(form.cityQuery)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Geocoding failed");
      setGeoResults(data.places ?? []);
      if (!data.places?.length) setGeoError("No results — try a more specific city name.");
    } catch {
      setGeoError("Could not search for this location. Please try again.");
    } finally {
      setGeoLoading(false);
    }
  }, [form.cityQuery]);

  // ── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!form.selectedPlace) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      birthName: form.birthName.trim(),
      birthDate: form.birthDate,
      birthTimeKnown: form.birthTimeKnown,
      birthHour: form.birthTimeKnown && form.birthHour !== "" ? parseInt(form.birthHour) : null,
      birthMinute: form.birthTimeKnown && form.birthMinute !== "" ? parseInt(form.birthMinute) : null,
      gender: form.gender,
      birthCity: form.selectedPlace.displayName.split(",")[0].trim(),
      birthCountry: form.selectedPlace.displayName.split(",").at(-1)?.trim() ?? "",
      latitude: form.selectedPlace.lat,
      longitude: form.selectedPlace.lon,
      timezone: form.selectedPlace.timezone,
    };

    try {
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch("/api/birth-profile", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); setSubmitting(false); return; }

      // Trigger HD report + all insights (fire-and-forget)
      void fetch("/api/report/generate", { method: "POST" });
      void fetch("/api/insights/generate", { method: "POST" });
      void fetch("/api/insights/generate/weekly", { method: "POST" });
      void fetch("/api/insights/generate/monthly", { method: "POST" });

      setSubmitting(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/report");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  // ── Validation ──────────────────────────────────────────────────────────

  const step1Valid =
    form.birthName.trim().length > 0 &&
    form.birthDate !== "" &&
    (!form.birthTimeKnown || (form.birthHour !== "" && form.birthMinute !== ""));

  const step2Valid = form.selectedPlace !== null;

  // ── Common input/select style ───────────────────────────────────────────
  const inputStyle: React.CSSProperties = {};

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="card" style={{ width: "100%", maxWidth: 480, padding: "2.5rem" }}>
      <StepIndicator current={step} total={2} />

      {/* ── Step 1: Personal details ──────────────────────────── */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Step 1 of 2</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 400, color: "var(--cream)", margin: 0 }}>
              Personal details
            </h3>
          </div>

          <Field label="Full name">
            <input
              type="text"
              value={form.birthName}
              onChange={(e) => update("birthName", e.target.value)}
              placeholder="e.g. Milosh Markovic"
              autoFocus
              style={inputStyle}
            />
          </Field>

          <Field label="Date of birth">
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => update("birthDate", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              style={{ colorScheme: "dark" }}
            />
          </Field>

          {/* Time of birth */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ margin: 0 }}>Time of birth</label>
              <button
                type="button"
                onClick={() => update("birthTimeKnown", !form.birthTimeKnown)}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <div
                  style={{
                    position: "relative", width: 28, height: 16, borderRadius: 8,
                    background: form.birthTimeKnown ? "var(--amber)" : "rgba(200,135,58,0.2)",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 2, width: 12, height: 12, borderRadius: "50%",
                    background: "var(--cosmos)", transition: "left 0.2s",
                    left: form.birthTimeKnown ? 14 : 2,
                  }} />
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.1em", color: "var(--mist)", textTransform: "uppercase" }}>
                  {form.birthTimeKnown ? "Known" : "Unknown"}
                </span>
              </button>
            </div>
            {form.birthTimeKnown ? (
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <select value={form.birthHour} onChange={(e) => update("birthHour", e.target.value)}>
                    <option value="">Hour</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <select value={form.birthMinute} onChange={(e) => update("birthMinute", e.target.value)}>
                    <option value="">Minute</option>
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p style={{
                fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.08em",
                color: "var(--mist)", lineHeight: 1.65,
                padding: "0.75rem 1rem",
                border: "1px solid rgba(200,135,58,0.15)",
                borderRadius: 2,
                margin: 0,
              }}>
                Without a birth time, some chart elements may be approximate. We&apos;ll use noon as a default.
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label style={{ marginBottom: "0.25rem", display: "block" }}>Gender</label>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.08em", color: "var(--mist)", marginBottom: "0.25rem" }}>
              Used to personalise your report language
            </p>
            <GenderChips value={form.gender} onChange={(v) => update("gender", v)} />
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!step1Valid}
            className="btn-primary"
            style={{ marginTop: "0.5rem" }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* ── Step 2: Place of birth ────────────────────────────── */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Step 2 of 2</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 400, color: "var(--cream)", margin: 0 }}>
              Place of birth
            </h3>
          </div>

          <Field label="City or town" error={geoError ?? undefined}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={form.cityQuery}
                onChange={(e) => { update("cityQuery", e.target.value); update("selectedPlace", null); }}
                onKeyDown={(e) => e.key === "Enter" && searchCity()}
                placeholder="e.g. Belgrade, Serbia"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={searchCity}
                disabled={geoLoading || !form.cityQuery.trim()}
                className="btn-ghost"
                style={{ flexShrink: 0, padding: "0 1rem" }}
              >
                {geoLoading ? "…" : "Search"}
              </button>
            </div>
          </Field>

          {/* Results list */}
          {geoResults.length > 0 && !form.selectedPlace && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.12em", color: "var(--mist)", textTransform: "uppercase" }}>
                Select your location
              </p>
              {geoResults.map((place, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    update("selectedPlace", place);
                    update("cityQuery", place.displayName.split(",").slice(0, 3).join(","));
                    setGeoResults([]);
                  }}
                  style={{
                    textAlign: "left", padding: "0.75rem 1rem",
                    border: "1px solid rgba(200,135,58,0.15)", borderRadius: 2,
                    background: "transparent", cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,135,58,0.4)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,135,58,0.05)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,135,58,0.15)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: "0.85rem", color: "var(--cream)", fontWeight: 500 }}>
                    {place.displayName.split(",")[0]}
                  </span>
                  <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: "0.8rem", color: "var(--mist)" }}>
                    {" — "}{place.displayName.split(",").slice(1, 3).join(",")}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.08em", color: "var(--amber)", marginLeft: "0.5rem", opacity: 0.7 }}>
                    {place.timezone}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Selected place confirmation */}
          {form.selectedPlace && (
            <div style={{
              padding: "0.75rem 1rem", borderRadius: 2,
              border: "1px solid rgba(200,135,58,0.35)",
              background: "rgba(200,135,58,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: "0.85rem", color: "var(--cream)", fontWeight: 500 }}>
                  ✓ {form.selectedPlace.displayName.split(",").slice(0, 2).join(",")}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.08em", color: "var(--amber)", marginLeft: "0.5rem", opacity: 0.7 }}>
                  {form.selectedPlace.timezone}
                </span>
              </div>
              <button
                type="button"
                onClick={() => { update("selectedPlace", null); update("cityQuery", ""); }}
                style={{ background: "none", border: "none", color: "var(--mist)", fontSize: "0.75rem", cursor: "pointer" }}
              >
                change
              </button>
            </div>
          )}

          {error && (
            <p style={{ fontSize: "0.8rem", color: "#e07060", border: "1px solid rgba(200,74,58,0.3)", borderRadius: 2, padding: "0.75rem 1rem", background: "rgba(200,74,58,0.05)" }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="button" onClick={() => setStep(1)} className="btn-ghost" style={{ flex: 1 }}>
              ← Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!step2Valid || submitting}
              className="btn-primary"
              style={{ flex: 2 }}
            >
              {submitting
                ? isEdit ? "Saving…" : "Building your chart…"
                : isEdit ? "Save changes" : "Generate my chart →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

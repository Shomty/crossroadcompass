"use client";
// STATUS: done | Premium Features - Cosmic Chemistry
/**
 * components/chemistry/CompatibilityForm.tsx
 * Partner birth data input form for compatibility analysis.
 */
// #region agent log
console.log('[DEBUG-2f76b5] CompatibilityForm module loaded');
// #endregion

import { useState } from "react";

interface CompatibilityFormProps {
  onSubmit: (data: { name: string; nakshatra: string; rashi: string }) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Moola", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const RASHIS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export function CompatibilityForm({ onSubmit, isLoading, disabled }: CompatibilityFormProps) {
  const [name, setName] = useState("");
  const [nakshatra, setNakshatra] = useState("");
  const [rashi, setRashi] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && nakshatra && rashi) {
      onSubmit({ name, nakshatra, rashi });
    }
  };

  const isValid = name.trim() && nakshatra && rashi;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "rgba(13,18,32,0.5)",
        border: "1px solid rgba(200,135,58,0.15)",
        borderRadius: 16,
        padding: "1.5rem",
      }}
    >
      <h3
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: 16,
          fontWeight: 400,
          color: "rgba(255,255,255,0.9)",
          margin: "0 0 20px",
        }}
      >
        Enter Partner&apos;s Details
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Name */}
        <div>
          <label
            style={{
              display: "block",
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: "rgba(200,135,58,0.8)",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Partner's first name"
            disabled={disabled}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid rgba(200,135,58,0.2)",
              background: "rgba(0,0,0,0.2)",
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 14,
              color: "rgba(255,255,255,0.9)",
              outline: "none",
            }}
          />
        </div>

        {/* Moon Nakshatra */}
        <div>
          <label
            style={{
              display: "block",
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: "rgba(200,135,58,0.8)",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            Moon Nakshatra
          </label>
          <select
            value={nakshatra}
            onChange={(e) => setNakshatra(e.target.value)}
            disabled={disabled}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid rgba(200,135,58,0.2)",
              background: "rgba(0,0,0,0.3)",
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 14,
              color: nakshatra ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
              outline: "none",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <option value="">Select nakshatra...</option>
            {NAKSHATRAS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Moon Sign (Rashi) */}
        <div>
          <label
            style={{
              display: "block",
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: "rgba(200,135,58,0.8)",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            Moon Sign (Rashi)
          </label>
          <select
            value={rashi}
            onChange={(e) => setRashi(e.target.value)}
            disabled={disabled}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid rgba(200,135,58,0.2)",
              background: "rgba(0,0,0,0.3)",
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 14,
              color: rashi ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
              outline: "none",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <option value="">Select moon sign...</option>
            {RASHIS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading || disabled}
          style={{
            marginTop: 8,
            padding: "14px 28px",
            borderRadius: 10,
            border: "none",
            background: isValid && !disabled
              ? "linear-gradient(135deg, #c8873a, #e8b96a)"
              : "rgba(200,135,58,0.2)",
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: isValid && !disabled ? "#0d1220" : "rgba(255,255,255,0.3)",
            cursor: isValid && !disabled ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
          }}
        >
          {isLoading ? "Analyzing..." : disabled ? "🔒 Unlock to Analyze" : "Check Compatibility"}
        </button>
      </div>
    </form>
  );
}

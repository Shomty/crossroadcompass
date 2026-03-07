"use client";
/**
 * components/subscribe/UpgradeButton.tsx
 * Client button that calls POST /api/stripe/checkout and redirects.
 */

import { useState } from "react";

interface Props {
  tier: "CORE" | "VIP";
  label: string;
  disabled?: boolean;
}

export function UpgradeButton({ tier, label, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        style={{
          width: "100%",
          padding: "12px 24px",
          background: loading ? "rgba(212,175,95,0.15)" : "rgba(212,175,95,0.12)",
          border: "1px solid rgba(212,175,95,0.5)",
          borderRadius: 4,
          color: "var(--gold, #d4af5f)",
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
          cursor: disabled || loading ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "all 0.2s",
        }}
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error && (
        <p style={{ marginTop: 8, fontSize: 12, color: "#c0392b", fontFamily: "'Instrument Sans', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

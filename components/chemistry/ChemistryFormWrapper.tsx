"use client";
/**
 * components/chemistry/ChemistryFormWrapper.tsx
 * Client wrapper for CompatibilityForm - handles form submission and state.
 * This wrapper is needed because Server Components cannot pass functions as props.
 */

import { useState } from "react";
import { CompatibilityForm } from "./CompatibilityForm";
import { CompatibilityResult } from "./CompatibilityResult";
import type { FullChemistryResult } from "@/lib/ai/chemistryInsightService";

interface ChemistryFormWrapperProps {
  disabled?: boolean;
  isPremium?: boolean;
}

interface PartnerData {
  name: string;
  nakshatra: string;
  rashi: string;
}

export function ChemistryFormWrapper({ disabled = false, isPremium = false }: ChemistryFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FullChemistryResult | null>(null);
  const [partnerName, setPartnerName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PartnerData) => {
    if (disabled) return;

    setIsLoading(true);
    setError(null);
    setPartnerName(data.name);

    try {
      const response = await fetch("/api/chemistry/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerName: data.name,
          partnerNakshatra: data.nakshatra,
          partnerRashi: data.rashi,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze compatibility");
      }

      const resultData = await response.json();
      setResult(resultData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <CompatibilityForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        disabled={disabled}
      />

      {error && (
        <div
          style={{
            background: "rgba(220,38,38,0.1)",
            border: "1px solid rgba(220,38,38,0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            color: "rgba(248,113,113,0.9)",
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {result && isPremium ? (
        <CompatibilityResult result={result} partnerName={partnerName} />
      ) : result ? (
        <div
          style={{
            background: "rgba(13,18,32,0.5)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 14,
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: "'DM Mono', monospace",
              fontSize: 32,
              color: "#e8b96a",
              marginBottom: 8,
            }}
          >
            {result.kutaResult?.overallPercentage ?? 0}%
          </span>
          <p
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 14,
              color: "rgba(255,255,255,0.7)",
              margin: 0,
            }}
          >
            Compatibility Score
          </p>
        </div>
      ) : !disabled ? (
        <div
          style={{
            background: "rgba(13,18,32,0.4)",
            border: "1px dashed rgba(200,135,58,0.2)",
            borderRadius: 14,
            padding: "3rem 1.5rem",
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: 32,
              color: "rgba(200,135,58,0.3)",
              marginBottom: 12,
            }}
          >
            ♡
          </span>
          <p
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 15,
              color: "rgba(255,255,255,0.5)",
              margin: 0,
            }}
          >
            Enter partner details above to see your compatibility analysis
          </p>
        </div>
      ) : null}
    </div>
  );
}

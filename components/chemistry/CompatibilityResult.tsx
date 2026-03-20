"use client";
// STATUS: done | Premium Features - Cosmic Chemistry
/**
 * components/chemistry/CompatibilityResult.tsx
 * Full compatibility result display.
 */

import { KutaChart } from "./KutaChart";
import type { FullChemistryResult } from "@/lib/ai/chemistryInsightService";

interface CompatibilityResultProps {
  result: FullChemistryResult;
  partnerName: string;
}

export function CompatibilityResult({ result, partnerName }: CompatibilityResultProps) {
  const { kutaResult, hdComposite, insight } = result;
  
  const scoreColor = kutaResult.overallPercentage >= 70
    ? "#4ade80"
    : kutaResult.overallPercentage >= 50
      ? "#e8b96a"
      : "#f87171";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Score Header */}
      <div
        className="animate-enter"
        style={{
          textAlign: "center",
          padding: "2rem",
          background: "linear-gradient(180deg, rgba(200,135,58,0.1) 0%, rgba(13,18,32,0.4) 100%)",
          borderRadius: 16,
          border: "1px solid rgba(200,135,58,0.2)",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: "#c8873a",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Compatibility Score
        </span>
        <div
          style={{
            fontSize: 56,
            fontFamily: "Cinzel, serif",
            fontWeight: 400,
            color: scoreColor,
            margin: "12px 0",
          }}
        >
          {kutaResult.overallPercentage}%
        </div>
        <h2
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 20,
            fontWeight: 400,
            color: "#f0dca0",
            margin: 0,
          }}
        >
          {insight.headline}
        </h2>
      </div>

      {/* Overview */}
      <section className="animate-enter animate-enter-2">
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 14,
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.75,
            whiteSpace: "pre-line",
          }}
        >
          {insight.overallNarrative}
        </p>
      </section>

      {/* Kuta Breakdown */}
      <section className="animate-enter animate-enter-3">
        <h3
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 16,
            fontWeight: 400,
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 16px",
          }}
        >
          8-Fold Kuta Analysis
        </h3>
        <KutaChart kutas={kutaResult.kutas} showAll />
      </section>

      {/* HD Composite */}
      {hdComposite && (
        <section
          className="animate-enter animate-enter-4"
          style={{
            background: "rgba(13,18,32,0.4)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 14,
            padding: "1.5rem",
          }}
        >
          <h3
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 16,
              fontWeight: 400,
              color: "#e8b96a",
              margin: "0 0 14px",
            }}
          >
            Human Design Composite
          </h3>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.65,
              margin: "0 0 12px",
            }}
          >
            <strong style={{ color: "#c8873a" }}>Type Dynamic:</strong> {hdComposite.typeDynamic}
          </p>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            <strong style={{ color: "#c8873a" }}>Authority:</strong> {hdComposite.authorityInterplay}
          </p>
        </section>
      )}

      {/* Attractions & Challenges */}
      <div
        className="animate-enter animate-enter-5"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 14,
        }}
      >
        <div
          style={{
            background: "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: 12,
            padding: "1.25rem",
          }}
        >
          <h4
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#4ade80",
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: "0 0 12px",
            }}
          >
            ✦ Attractions
          </h4>
          <ul
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.6,
              margin: 0,
              paddingLeft: 16,
            }}
          >
            {insight.attractions.map((a, i) => (
              <li key={i} style={{ marginBottom: 6 }}>{a}</li>
            ))}
          </ul>
        </div>

        <div
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 12,
            padding: "1.25rem",
          }}
        >
          <h4
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#f87171",
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: "0 0 12px",
            }}
          >
            ◇ Challenges
          </h4>
          <ul
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.6,
              margin: 0,
              paddingLeft: 16,
            }}
          >
            {insight.challenges.map((c, i) => (
              <li key={i} style={{ marginBottom: 6 }}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Practical Advice */}
      <section
        className="animate-enter animate-enter-6"
        style={{
          background: "rgba(200,135,58,0.08)",
          border: "1px solid rgba(200,135,58,0.15)",
          borderRadius: 14,
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: 18,
            color: "#e8b96a",
            marginBottom: 10,
          }}
        >
          💫
        </span>
        <p
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 14,
            fontStyle: "italic",
            color: "rgba(240,220,160,0.9)",
            lineHeight: 1.7,
            margin: 0,
            maxWidth: 500,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {insight.practicalAdvice}
        </p>
      </section>
    </div>
  );
}

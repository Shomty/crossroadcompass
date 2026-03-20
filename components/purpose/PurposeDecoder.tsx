"use client";
// STATUS: done | Premium Features - Purpose Decoder
/**
 * components/purpose/PurposeDecoder.tsx
 * Main component that displays the full purpose analysis.
 */

import { ArchetypeCard } from "./ArchetypeCard";
import { CrossBreakdown } from "./CrossBreakdown";
import type { PurposeInsight } from "@/lib/ai/purposeInsightService";

interface PurposeDecoderProps {
  insight: PurposeInsight;
  crossData: {
    type: string;
    name: string;
    gates: number[];
  };
}

export function PurposeDecoder({ insight, crossData }: PurposeDecoderProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Purpose Theme Header */}
      <div
        className="animate-enter"
        style={{
          textAlign: "center",
          padding: "2rem 1.5rem",
          background: "linear-gradient(180deg, rgba(200,135,58,0.08) 0%, rgba(13,18,32,0.4) 100%)",
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
          Your Purpose Theme
        </span>
        <h2
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 26,
            fontWeight: 400,
            color: "#f0dca0",
            margin: "12px 0 0",
          }}
        >
          {insight.purposeTheme}
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
          {insight.overview}
        </p>
      </section>

      {/* Two Column Layout: Cross + HD Narrative */}
      <div
        className="animate-enter animate-enter-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <CrossBreakdown
          crossType={crossData.type}
          crossName={crossData.name}
          gates={crossData.gates}
        />

        <div
          style={{
            background: "rgba(13,18,32,0.5)",
            border: "1px solid rgba(200,135,58,0.12)",
            borderRadius: 12,
            padding: "1.25rem",
          }}
        >
          <h4
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 14,
              fontWeight: 500,
              color: "#c8873a",
              margin: "0 0 12px",
            }}
          >
            HD Purpose Expression
          </h4>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {insight.hdPurposeNarrative}
          </p>
        </div>
      </div>

      {/* 10th House Narrative */}
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
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 14 }}>♄</span>
          Vedic Career Indicators
        </h3>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 14,
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.7,
            margin: 0,
            whiteSpace: "pre-line",
          }}
        >
          {insight.tenthHouseNarrative}
        </p>
      </section>

      {/* Career Archetypes */}
      <section className="animate-enter animate-enter-5">
        <h3
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 16,
            fontWeight: 400,
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 16px",
          }}
        >
          Your Career Archetypes
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {insight.archetypes.map((arch, i) => (
            <ArchetypeCard
              key={i}
              index={i}
              name={arch.name}
              match={arch.match}
              guidance={arch.guidance}
            />
          ))}
        </div>
      </section>

      {/* Practical Steps */}
      <section
        className="animate-enter animate-enter-6"
        style={{
          background: "rgba(200,135,58,0.06)",
          border: "1px solid rgba(200,135,58,0.15)",
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
          Practical Next Steps
        </h3>
        <ol
          style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.7,
            margin: 0,
            paddingLeft: 20,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {insight.practicalSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* Environment + Leadership + Timing Grid */}
      <div
        className="animate-enter animate-enter-7"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        <div
          style={{
            background: "rgba(13,18,32,0.5)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 12,
            padding: "1.25rem",
          }}
        >
          <h4
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#c8873a",
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: "0 0 10px",
            }}
          >
            Ideal Environment
          </h4>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {insight.idealEnvironment}
          </p>
        </div>

        <div
          style={{
            background: "rgba(13,18,32,0.5)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 12,
            padding: "1.25rem",
          }}
        >
          <h4
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#c8873a",
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: "0 0 10px",
            }}
          >
            Leadership Style
          </h4>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {insight.leadershipStyle}
          </p>
        </div>

        <div
          style={{
            background: "rgba(13,18,32,0.5)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 12,
            padding: "1.25rem",
          }}
        >
          <h4
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#c8873a",
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: "0 0 10px",
            }}
          >
            Decision Timing
          </h4>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {insight.timingGuidance}
          </p>
        </div>
      </div>
    </div>
  );
}

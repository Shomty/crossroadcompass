"use client";
// STATUS: done | Premium Features - Shadow Work Portal
/**
 * components/shadow/ShadowPortal.tsx
 * Main component displaying the full shadow work analysis.
 */

import { ShadowMap } from "./ShadowMap";
import { JournalingPrompt } from "./JournalingPrompt";
import type { ShadowInsight } from "@/lib/ai/shadowInsightService";

interface ShadowPortalProps {
  insight: ShadowInsight;
}

export function ShadowPortal({ insight }: ShadowPortalProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Shadow Theme Header */}
      <div
        className="animate-enter"
        style={{
          textAlign: "center",
          padding: "2rem 1.5rem",
          background: "linear-gradient(180deg, rgba(46,31,15,0.3) 0%, rgba(13,18,32,0.4) 100%)",
          borderRadius: 16,
          border: "1px solid rgba(200,135,58,0.15)",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: "rgba(200,135,58,0.8)",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Your Shadow Theme
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
          {insight.shadowTheme}
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

      {/* 12th House & Ketu Narratives */}
      <div
        className="animate-enter animate-enter-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <div
          style={{
            background: "rgba(13,18,32,0.5)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 14,
            padding: "1.25rem",
          }}
        >
          <h3
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 15,
              fontWeight: 400,
              color: "#c8873a",
              margin: "0 0 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 14 }}>☾</span>
            12th House Depths
          </h3>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {insight.twelfthHouseNarrative}
          </p>
        </div>

        {insight.ketuNarrative && insight.ketuNarrative !== "N/A" && (
          <div
            style={{
              background: "rgba(13,18,32,0.5)",
              border: "1px solid rgba(200,135,58,0.1)",
              borderRadius: 14,
              padding: "1.25rem",
            }}
          >
            <h3
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 15,
                fontWeight: 400,
                color: "#c8873a",
                margin: "0 0 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>☊</span>
              Karmic Release (Ketu)
            </h3>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {insight.ketuNarrative}
            </p>
          </div>
        )}
      </div>

      {/* Undefined Centers */}
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
          Undefined Centers: Your Wisdom Portals
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
          {insight.undefinedCentersNarrative}
        </p>
      </section>

      {/* Shadow Patterns */}
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
          Shadow Patterns
        </h3>
        <ShadowMap patterns={insight.shadowPatterns} />
      </section>

      {/* Journaling Prompts */}
      <section className="animate-enter animate-enter-6">
        <h3
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 16,
            fontWeight: 400,
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 16px",
          }}
        >
          Journaling Prompts
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {insight.journalingPrompts.map((jp, i) => (
            <JournalingPrompt
              key={i}
              index={i}
              theme={jp.theme}
              prompt={jp.prompt}
              depth={jp.depth}
            />
          ))}
        </div>
      </section>

      {/* Practical Practices */}
      <section
        className="animate-enter animate-enter-7"
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
          Practices for Integration
        </h3>
        <ul
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
          {insight.practicalPractices.map((practice, i) => (
            <li key={i}>{practice}</li>
          ))}
        </ul>
      </section>

      {/* Compassion Statement */}
      <section
        className="animate-enter animate-enter-8"
        style={{
          textAlign: "center",
          padding: "1.5rem",
          background: "linear-gradient(180deg, rgba(13,18,32,0.3) 0%, rgba(46,31,15,0.2) 100%)",
          borderRadius: 14,
          border: "1px solid rgba(200,135,58,0.1)",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: 20,
            color: "#e8b96a",
            marginBottom: 12,
          }}
        >
          ❦
        </span>
        <p
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 15,
            fontStyle: "italic",
            color: "rgba(240,220,160,0.85)",
            lineHeight: 1.7,
            margin: 0,
            maxWidth: 500,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {insight.compassionStatement}
        </p>
      </section>
    </div>
  );
}

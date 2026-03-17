"use client";

/**
 * components/report/V4Report.tsx
 * HD Foundation Report — dashboard design system.
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { HDChart, HDCenterName } from "@/lib/astro/types";

// ─── Types ─────────────────────────────────────────────────────────────────

interface ReportSection {
  title: string;
  content: string;
}

interface HDReport {
  summary: string;
  sections: ReportSection[];
  generatedAt: string;
}

// ─── HD Center metadata ────────────────────────────────────────────────────

const CENTER_META: Record<HDCenterName, { label: string; descriptor: string }> = {
  Head:        { label: "Head",         descriptor: "Inspiration & Pressure" },
  Ajna:        { label: "Ajna",         descriptor: "Concepts & Certainty" },
  Throat:      { label: "Throat",       descriptor: "Manifestation & Voice" },
  G:           { label: "G Center",     descriptor: "Identity & Direction" },
  Heart:       { label: "Heart",        descriptor: "Willpower & Value" },
  Sacral:      { label: "Sacral",       descriptor: "Life Force & Response" },
  SolarPlexus: { label: "Solar Plexus", descriptor: "Emotion & Clarity" },
  Spleen:      { label: "Spleen",       descriptor: "Intuition & Health" },
  Root:        { label: "Root",         descriptor: "Pressure & Adrenaline" },
};

const ALL_CENTERS: HDCenterName[] = [
  "Head", "Ajna", "Throat", "G", "Heart", "Sacral", "SolarPlexus", "Spleen", "Root",
];

// ─── Shared style tokens ───────────────────────────────────────────────────

const mono: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
};

const bodyText: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: "var(--type-body)",
  color: "var(--mist)",
  lineHeight: 1.65,
  marginBottom: 14,
};

// ─── Sub-components ────────────────────────────────────────────────────────

function DashDivider({ glyph }: { glyph: string }) {
  return (
    <div className="dash-divider">
      <span className="dash-divider-glyph">{glyph}</span>
    </div>
  );
}

function CosmicSpinner({ message }: { message: string }) {
  return (
    <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
      <div style={{
        width: 52, height: 52,
        borderRadius: "50%",
        border: "1px solid rgba(200,135,58,0.25)",
        background: "rgba(200,135,58,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 1.75rem",
      }}>
        <RefreshCw size={22} color="var(--amber, #C8873A)" style={{ animation: "spin 1.1s linear infinite" }} />
      </div>
      <p style={{
        fontFamily: "Cinzel, serif",
        fontSize: 22,
        fontWeight: 400,
        color: "rgba(255,255,255,0.9)",
        marginBottom: 10,
      }}>
        Your Human Design Report
      </p>
      <p style={{
        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
        fontSize: "var(--type-body)",
        color: "var(--mist)",
        lineHeight: 1.65,
        maxWidth: 300,
        margin: "0 auto",
        opacity: 0.55,
      }}>
        {message}
      </p>
    </div>
  );
}

function SectionCard({ section, index }: { section: ReportSection; index: number }) {
  const paragraphs = section.content.split(/\n\n+/).filter(Boolean);
  const num = String(index + 1).padStart(2, "0");

  return (
    <div className="glass-card" style={{ padding: "22px 24px 20px" }}>
      <div className="dash-card-header">
        <div>
          <span
            className="dash-eyebrow"
            style={{ marginBottom: 6, display: "block" }}
          >
            {num} · {section.title}
          </span>
          <h2 className="dash-section-title" style={{ fontSize: 18 }}>
            {section.title}
          </h2>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 10 }}>
        {paragraphs.map((p, i) => (
          <p key={i} style={{ ...bodyText, marginTop: 0, marginBottom: i === paragraphs.length - 1 ? 0 : 14 }}>
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

function CentersGrid({
  definedCenters,
  undefinedCenters,
}: {
  definedCenters: HDCenterName[];
  undefinedCenters: HDCenterName[];
}) {
  return (
    <div className="glass-card" style={{ padding: "22px 24px" }}>
      <div className="dash-card-header">
        <div>
          <span className="dash-eyebrow" style={{ marginBottom: 6, display: "block" }}>
            HD Chart
          </span>
          <h2 className="dash-section-title" style={{ fontSize: 18 }}>
            Energy Centers
          </h2>
          <span className="dash-section-subtitle">
            Defined · Open · Undefined
          </span>
        </div>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8,
        marginTop: 4,
      }}>
        {ALL_CENTERS.map((name) => {
          const isDefined = definedCenters.includes(name);
          const meta = CENTER_META[name];
          return (
            <div
              key={name}
              style={{
                padding: "11px 13px",
                borderRadius: 8,
                border: `1px solid ${isDefined ? "rgba(200,135,58,0.35)" : "rgba(255,255,255,0.07)"}`,
                background: isDefined
                  ? "rgba(200,135,58,0.06)"
                  : "rgba(255,255,255,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <span style={{
                ...mono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: isDefined ? "var(--amber, #C8873A)" : "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
              }}>
                {meta.label}
              </span>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, sans-serif",
                fontSize: 11,
                color: isDefined ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)",
                lineHeight: 1.4,
              }}>
                {meta.descriptor}
              </span>
              <span style={{
                ...mono,
                fontSize: 9,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: isDefined ? "rgba(200,135,58,0.65)" : "rgba(255,255,255,0.2)",
                marginTop: 2,
              }}>
                {isDefined ? "Defined" : "Open"}
              </span>
            </div>
          );
        })}
      </div>
      <p style={{
        ...bodyText,
        marginTop: 14,
        marginBottom: 0,
        opacity: 0.55,
      }}>
        Defined centers operate consistently. Open centers are where you receive and amplify energy from others.
      </p>
    </div>
  );
}

function ActiveChannels({ chart }: { chart: HDChart }) {
  if (!chart.activeChannels || chart.activeChannels.length === 0) return null;

  return (
    <div className="glass-card" style={{ padding: "22px 24px" }}>
      <div className="dash-card-header">
        <div>
          <span className="dash-eyebrow" style={{ marginBottom: 6, display: "block" }}>
            Circuitry
          </span>
          <h2 className="dash-section-title" style={{ fontSize: 18 }}>
            Active Channels
          </h2>
          <span className="dash-section-subtitle">
            {chart.activeChannels.length} active channel{chart.activeChannels.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {chart.activeChannels.map((ch, i) => {
          const [g1, g2] = ch.gates;
          const [c1, c2] = ch.centers;
          const c1Label = CENTER_META[c1]?.label ?? c1;
          const c2Label = CENTER_META[c2]?.label ?? c2;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 0",
                borderBottom: i < chart.activeChannels.length - 1
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "none",
              }}
            >
              <span style={{
                ...mono,
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 9px",
                borderRadius: 4,
                border: "1px solid rgba(200,135,58,0.3)",
                background: "rgba(200,135,58,0.08)",
                color: "var(--amber, #C8873A)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {g1}
              </span>
              <span style={{ ...mono, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>──</span>
              <span style={{
                ...mono,
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 9px",
                borderRadius: 4,
                border: "1px solid rgba(200,135,58,0.3)",
                background: "rgba(200,135,58,0.08)",
                color: "var(--amber, #C8873A)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {g2}
              </span>
              <span style={{
                ...mono,
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "rgba(255,255,255,0.35)",
                marginLeft: 4,
              }}>
                {c1Label} ↔ {c2Label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IncarnationCrossRow({ chart }: { chart: HDChart }) {
  if (!chart.incarnationCross) return null;
  const { type, gates } = chart.incarnationCross;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      paddingTop: 14,
      borderTop: "1px solid rgba(200,135,58,0.12)",
      marginTop: 8,
    }}>
      <span className="dash-eyebrow" style={{ fontSize: 9 }}>Incarnation Cross</span>
      <span style={{
        fontFamily: "Lora, Georgia, serif",
        fontSize: 13,
        color: "rgba(255,255,255,0.72)",
        fontStyle: "italic",
      }}>
        {type}
      </span>
      <span style={{
        ...mono,
        fontSize: 11,
        color: "rgba(255,255,255,0.28)",
      }}>
        Gates {gates.personalitySun} · {gates.personalityEarth} · {gates.designSun} · {gates.designEarth}
      </span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function V4Report({ firstName }: { firstName: string }) {
  const router = useRouter();
  const [report, setReport] = useState<HDReport | null>(null);
  const [chart, setChart] = useState<HDChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [reportRes, chartRes] = await Promise.all([
        fetch("/api/report/latest"),
        fetch("/api/hd-chart"),
      ]);

      if (reportRes.status === 401 || chartRes.status === 401) {
        router.push("/login");
        return;
      }

      if (reportRes.ok) {
        const data = await reportRes.json();
        setReport(data.report ?? null);
      }

      if (chartRes.ok) {
        const data = await chartRes.json();
        setChart(data.chart ?? null);
      }
    } catch {
      setError("Failed to load your report.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!loading && !report && !generating && !error) {
      void generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, report]);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/report/generate", { method: "POST" });
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) throw new Error("generation failed");
      const data = await res.json();
      setReport(data.report);
    } catch {
      setError("Report generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  // ── Loading / generating state ──────────────────────────────────────────

  if (loading || (!report && !error)) {
    return (
      <CosmicSpinner
        message={loading ? "Loading your report…" : "Preparing your personalised report…"}
      />
    );
  }

  if (generating) {
    return <CosmicSpinner message="Generating your personalised report…" />;
  }

  // ── Error (no report) ───────────────────────────────────────────────────

  if (!report && error) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          fontSize: "var(--type-body)",
          color: "#f87171",
          lineHeight: 1.65,
          marginBottom: "1.5rem",
        }}>
          {error}
        </p>
        <button
          onClick={generate}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 22px",
            background: "transparent",
            border: "1px solid rgba(200,135,58,0.35)",
            borderRadius: 10,
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, sans-serif",
            fontSize: 13, fontWeight: 500, letterSpacing: "0.04em",
            color: "var(--amber, #C8873A)",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={13} />
          Try Again
        </button>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  const genDate = new Date(report!.generatedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <header
        className="dash-header animate-enter animate-enter-1"
        style={{ marginBottom: "1.25rem" }}
      >
        <div className="dash-header-left">
          <span className="dash-eyebrow" style={{ marginBottom: 8, display: "block" }}>
            Human Design
          </span>
          <h1 className="dash-greeting" style={{ fontSize: "clamp(22px, 3vw, 32px)", opacity: 1, animation: "none" }}>
            {firstName}&apos;s{" "}
            <em>Foundation Report</em>
          </h1>
        </div>
        <div className="dash-header-actions">
          <Link
            href="/dashboard"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 16px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, sans-serif",
              fontSize: 12.5, fontWeight: 500, letterSpacing: "0.04em",
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "color 0.2s, border-color 0.2s",
            }}
          >
            <ChevronLeft size={14} />
            Dashboard
          </Link>
        </div>
      </header>

      {/* ── Summary card ─────────────────────────────────────────────── */}
      <div className="glass-card glass-card-hero animate-enter animate-enter-2" style={{ padding: "24px 26px 20px" }}>
        <div className="dash-card-header">
          <div>
            {/* AI-generated indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <div className="dash-live-dot" />
              <span style={{
                ...mono,
                fontSize: "var(--type-label, 10px)",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#4ADE80",
                opacity: 0.85,
              }}>
                AI Summary
              </span>
            </div>
            <h2 className="dash-section-title">Your Human Design</h2>
          </div>
          <button
            onClick={generate}
            disabled={generating}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "none", border: "none",
              ...mono,
              fontSize: 11, letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: generating ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.35)",
              cursor: generating ? "not-allowed" : "pointer",
              padding: "4px 0",
              transition: "color 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => !generating && (e.currentTarget.style.color = "var(--amber, #C8873A)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            <RefreshCw size={11} style={generating ? { animation: "spin 1s linear infinite" } : {}} />
            Regenerate
          </button>
        </div>

        <p style={{ ...bodyText, marginTop: 14, marginBottom: 0 }}>
          {report!.summary}
        </p>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingTop: 14,
          borderTop: "1px solid rgba(200,135,58,0.10)",
          marginTop: 14,
        }}>
          <span style={{
            ...mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.25)",
          }}>
            Generated {genDate}
          </span>
        </div>
        {error && (
          <p style={{ fontSize: 12, color: "#f87171", marginTop: 10 }}>{error}</p>
        )}
      </div>

      {/* ── Identity quick-view ──────────────────────────────────────── */}
      {chart && (
        <div className="animate-enter animate-enter-3">
          <DashDivider glyph="✦" />
          <div className="glass-card" style={{ padding: "20px 24px" }}>
            <div className="dash-card-header">
              <div>
                <span className="dash-eyebrow" style={{ marginBottom: 8, display: "block" }}>Identity</span>
                <h2 className="dash-section-title" style={{ fontSize: 18 }}>Chart Overview</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
              {[
                chart.type,
                chart.strategy,
                chart.authority,
                `Profile ${chart.profile}`,
                chart.definition,
              ].map((label) => label && (
                <span key={label} style={{
                  ...mono,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: "1px solid rgba(200,135,58,0.3)",
                  background: "rgba(200,135,58,0.07)",
                  color: "var(--amber, #C8873A)",
                }}>
                  {label}
                </span>
              ))}
            </div>
            <IncarnationCrossRow chart={chart} />
          </div>
        </div>
      )}

      {/* ── Report sections ───────────────────────────────────────────── */}
      <div className="animate-enter animate-enter-4">
        <DashDivider glyph="☽" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {report!.sections.map((section, i) => (
            <SectionCard key={i} section={section} index={i} />
          ))}
        </div>
      </div>

      {/* ── HD Insights: Centers + Channels ──────────────────────────── */}
      {chart && (
        <div className="animate-enter animate-enter-5">
          <DashDivider glyph="♃" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <CentersGrid
              definedCenters={chart.definedCenters}
              undefinedCenters={chart.undefinedCenters}
            />
            <ActiveChannels chart={chart} />
          </div>
        </div>
      )}

    </div>
  );
}

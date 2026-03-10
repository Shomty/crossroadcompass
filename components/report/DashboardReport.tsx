"use client";

/**
 * components/report/DashboardReport.tsx
 * V2: Summary box + accordion sections matching the v2 dashboard design.
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ChevronDown } from "lucide-react";

interface ReportSection { title: string; content: string; }
interface HDReport {
  summary: string;
  sections: ReportSection[];
  generatedAt: string;
}

const GEM_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, transition: "color 0.25s" }}>
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

function AccordionItem({ section, index, isOpen, onToggle }: {
  section: ReportSection;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const paragraphs = section.content.split(/\n\n+/).filter(Boolean);

  return (
    <div className={`accordion-item-v2${isOpen ? " open" : ""}`}>
      <button className="accordion-trigger-v2" onClick={onToggle}>
        <span style={{ color: isOpen ? "var(--gold)" : "var(--mist)", flexShrink: 0, transition: "color 0.25s" }}>
          {GEM_ICON}
        </span>
        <span style={{
          flex: 1,
          fontFamily: "'Instrument Sans', sans-serif",
          fontSize: 13.5,
          fontWeight: 400,
          color: isOpen ? "var(--cream)" : "var(--mist)",
          letterSpacing: "0.01em",
          transition: "color 0.25s",
        }}>
          {section.title}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: isOpen ? "var(--gold)" : "var(--mist)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s, color 0.25s",
            flexShrink: 0,
          }}
        />
      </button>
      <div className="accordion-body-v2">
        <div style={{ padding: "0 18px 18px 44px" }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: "var(--mist)",
              marginTop: i > 0 ? 10 : 0,
            }}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardReport() {
  const router = useRouter();
  const [report, setReport] = useState<HDReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState(0);

  const loadReport = useCallback(async () => {
    try {
      const res = await fetch("/api/report/latest");
      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 404) { setReport(null); setLoading(false); return; }
      if (!res.ok) throw new Error("Failed to load report");
      const data = await res.json();
      setReport(data.report ?? null);
    } catch {
      setError("Failed to load your report.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadReport(); }, [loadReport]);

  // Auto-generate on mount when no report exists — user never needs to click manually
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
      setOpenIndex(0);
    } catch {
      setError("Report generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading || (!report && !error)) {
    return (
      <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
        <div style={{
          width: 48, height: 48,
          borderRadius: "50%",
          border: "1px solid var(--border-lit)",
          background: "var(--gold-glow)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.25rem",
        }}>
          <RefreshCw size={20} color="var(--gold)" style={{ animation: "spin 1s linear infinite" }} />
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "var(--cream)", marginBottom: 8 }}>
          Your Human Design Report
        </p>
        <p style={{ fontSize: 13, color: "var(--mist)", lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>
          {loading ? "Loading…" : "Preparing your personalised report…"}
        </p>
      </div>
    );
  }

  if (!report && error) {
    return (
      <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
        <p style={{ fontSize: 12, color: "#f87171", marginBottom: "1rem" }}>{error}</p>
        <button
          onClick={generate}
          disabled={generating}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 22px",
            background: "transparent",
            border: "1px solid var(--border-lit)",
            borderRadius: 10,
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.04em",
            color: generating ? "var(--mist)" : "var(--gold)",
            cursor: generating ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {generating ? (
            <>
              <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
              Generating…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Try Again
            </>
          )}
        </button>
      </div>
    );
  }
  const genDate = new Date(report!.generatedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Summary box */}
      <div style={{
        background: "rgba(13,18,37,0.75)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "22px 22px 18px",
        backdropFilter: "blur(20px)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Top edge highlight */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.07) 50%, transparent 90%)",
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "var(--gold)" }}>
            Your Human Design
          </span>
        </div>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 15.5,
          fontWeight: 400,
          lineHeight: 1.75,
          color: "var(--cream)",
          marginBottom: 18,
        }}>
          {report!.summary}
        </p>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 14,
          borderTop: "1px solid var(--border)",
        }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9.5, letterSpacing: "0.08em", color: "var(--mist)" }}>
            Generated {genDate}
          </span>
          <button
            onClick={generate}
            disabled={generating}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "none", border: "none",
              fontFamily: "'DM Mono', monospace", fontSize: 9.5,
              letterSpacing: "0.1em", textTransform: "uppercase" as const,
              color: generating ? "var(--mist)" : "var(--mist)",
              cursor: generating ? "not-allowed" : "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--mist)")}
          >
            <RefreshCw size={12} style={generating ? { animation: "spin 1s linear infinite" } : {}} />
            Regenerate
          </button>
        </div>
      </div>

      {/* Accordion sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {report!.sections.map((section, i) => (
          <AccordionItem
            key={i}
            section={section}
            index={i}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </div>
  );
}

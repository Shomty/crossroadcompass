"use client";
// STATUS: done | Premium Features - Muhurta Finder
/**
 * components/muhurta/MuhurtaFinder.tsx
 * Main component for displaying muhurta timing windows.
 */

import { useState } from "react";
import { WeekTimeline } from "./WeekTimeline";
import { IntentionFilter } from "./IntentionFilter";
import { GlimpseCTA } from "@/components/glimpse";
import type { MuhurtaData, IntentionCategory } from "@/lib/astro/muhurtaService";
import type { MuhurtaInsight } from "@/lib/ai/muhurtaInsightService";

interface MuhurtaFinderProps {
  initialData: MuhurtaData;
  insight: MuhurtaInsight | null;
  isVip?: boolean;
  onIntentionChange?: (intention: IntentionCategory) => void;
}

export function MuhurtaFinder({ initialData, insight: initialInsight, isVip = false, onIntentionChange }: MuhurtaFinderProps) {
  const [intention, setIntention] = useState<IntentionCategory>(initialData.intention);
  const [data, setData] = useState<MuhurtaData>(initialData);
  const [insight, setInsight] = useState<MuhurtaInsight | null>(initialInsight);
  const [isLoading, setIsLoading] = useState(false);

  const handleIntentionChange = async (newIntention: IntentionCategory) => {
    if (newIntention === intention || isLoading) return;
    setIntention(newIntention);
    setInsight(null); // clear stale insight so computed data.windows show immediately
    setIsLoading(true);
    try {
      const res = await fetch(`/api/muhurta/windows?intention=${newIntention}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) setData(json.data);
        if (json.insight) setInsight(json.insight);
      }
    } catch { /* keep existing data on error */ } finally {
      setIsLoading(false);
    }
    onIntentionChange?.(newIntention);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header with Intention Filter */}
      <section
        className="animate-enter"
        style={{
          background: "rgba(13,18,32,0.5)",
          border: "1px solid rgba(200,135,58,0.12)",
          borderRadius: 14,
          padding: "1.25rem",
        }}
      >
        <h3
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 15,
            fontWeight: 400,
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 14px",
          }}
        >
          What are you planning?
        </h3>
        <IntentionFilter
          selected={intention}
          onChange={handleIntentionChange}
          disabled={isLoading}
        />
      </section>

      {/* Week Overview */}
      {insight && (
        <section
          className="animate-enter animate-enter-2"
          style={{
            background: "linear-gradient(180deg, rgba(200,135,58,0.08) 0%, rgba(13,18,32,0.4) 100%)",
            borderRadius: 14,
            padding: "1.5rem",
            border: "1px solid rgba(200,135,58,0.15)",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: "#c8873a",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            This Week&apos;s Energy
          </span>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 14,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.7,
              margin: "10px 0 0",
            }}
          >
            {insight.weekOverview}
          </p>
        </section>
      )}

      {/* Week Timeline */}
      <section className="animate-enter animate-enter-3">
        <h3
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 16,
            fontWeight: 400,
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          Week at a Glance
          {isLoading && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(200,135,58,0.6)", fontWeight: 400 }}>
              updating...
            </span>
          )}
        </h3>
        <div style={{ opacity: isLoading ? 0.5 : 1, transition: "opacity 0.2s" }}>
          <WeekTimeline
            windows={data.windows}
            narratives={insight?.topWindows?.map((w) => ({
              date: w.date,
              timeRange: w.timeRange,
              narrative: w.narrative,
            }))}
          />
        </div>
      </section>

      {/* HD Guidance */}
      {insight && (
        <section
          className="animate-enter animate-enter-4"
          style={{
            background: "rgba(13,18,32,0.4)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 14,
            padding: "1.25rem",
          }}
        >
          <h4
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 14,
              fontWeight: 400,
              color: "#c8873a",
              margin: "0 0 10px",
            }}
          >
            Timing with Your {data.hdAuthority} Authority
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
            {insight.hdGuidance}
          </p>
        </section>
      )}

      {/* Intention-Specific Advice */}
      {insight && (
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
              background: "rgba(200,135,58,0.06)",
              border: "1px solid rgba(200,135,58,0.12)",
              borderRadius: 12,
              padding: "1rem",
            }}
          >
            <h4
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: "#c8873a",
                textTransform: "uppercase",
                letterSpacing: 1,
                margin: "0 0 8px",
              }}
            >
              For Your {intention} Intentions
            </h4>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {insight.intentionSpecificAdvice}
            </p>
          </div>

          <div
            style={{
              background: "rgba(200,135,58,0.06)",
              border: "1px solid rgba(200,135,58,0.12)",
              borderRadius: 12,
              padding: "1rem",
            }}
          >
            <h4
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: "#c8873a",
                textTransform: "uppercase",
                letterSpacing: 1,
                margin: "0 0 8px",
              }}
            >
              General Timing Note
            </h4>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {insight.generalTiming}
            </p>
          </div>
        </div>
      )}

      {/* ─── VIP: Next Week Windows ─────────────────────────────────────── */}
      {isVip && data.nextWeekWindows && data.nextWeekWindows.length > 0 && (
        <section className="animate-enter animate-enter-6">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 16,
                fontWeight: 400,
                color: "rgba(255,255,255,0.9)",
                margin: 0,
              }}
            >
              Next Week&apos;s Best Windows
            </h3>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: "rgba(200,135,58,0.6)",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {data.nextWeekStart} → {data.nextWeekEnd}
            </span>
          </div>
          <WeekTimeline windows={data.nextWeekWindows} />
        </section>
      )}

      {/* ─── VIP: Monthly CTA ───────────────────────────────────────────── */}
      {isVip && (
        <section
          className="animate-enter animate-enter-7"
          style={{
            background: "linear-gradient(135deg, rgba(200,135,58,0.06) 0%, rgba(13,18,32,0.5) 100%)",
            border: "1px dashed rgba(200,135,58,0.3)",
            borderRadius: 16,
            padding: "2rem 1.5rem",
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: 28,
              color: "rgba(200,135,58,0.5)",
              marginBottom: 12,
            }}
          >
            ◈
          </span>
          <h3
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 18,
              fontWeight: 400,
              color: "#f0dca0",
              margin: "0 0 8px",
            }}
          >
            Full Month View
          </h3>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.6,
              margin: "0 0 20px",
              maxWidth: 360,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Get 4 weeks of auspicious timing windows with AI-powered reasoning,
            intention filters, and HD Authority guidance for the entire month ahead.
          </p>
          <GlimpseCTA
            text="Get Monthly Muhurta"
            variant="primary"
            featureName="muhurta_monthly_cta"
            href="/subscribe?plan=vip_monthly"
          />
        </section>
      )}
    </div>
  );
}

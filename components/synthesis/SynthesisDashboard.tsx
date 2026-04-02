// STATUS: done | Synthesis Engine Phase 4.1
/**
 * components/synthesis/SynthesisDashboard.tsx
 * Main synthesis dashboard — STYLE_GUIDE inner panels + tokens.
 */

"use client";

import { useState, useEffect } from "react";
import type { SynthesisResult, OpportunityScores } from "@/types";
import { RefreshCw } from "lucide-react";
import {
  synthesisBodyMuted,
  synthesisCream,
  synthesisCardStyle,
  synthesisCardStyleAccent,
  synthesisLabelClass,
  synthesisLabelStyle,
  synthesisTitleCinzel,
} from "@/components/synthesis/synthesisPanelClasses";

interface SynthesisDashboardProps {
  synthesis: SynthesisResult;
  opportunityScores: OpportunityScores;
  onRecalcComplete?: () => void;
}

interface RecalcStatus {
  status: "pending" | "done" | "error";
  progress: number;
  errorMessage?: string;
}

export function SynthesisDashboard({
  synthesis,
  opportunityScores,
  onRecalcComplete,
}: SynthesisDashboardProps) {
  const [recalcStatus, setRecalcStatus] = useState<RecalcStatus | null>(null);

  useEffect(() => {
    if (!recalcStatus || recalcStatus.status === "done") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/birth-profile/recalc-status");
        if (!res.ok) return;
        const data = (await res.json()) as { status: string; progress: number; errorMessage?: string };

        setRecalcStatus({
          status: (data.status as "pending" | "done" | "error") || "error",
          progress: data.progress || 0,
          errorMessage: data.errorMessage,
        });

        if (data.status === "done") {
          onRecalcComplete?.();
        }
      } catch (pollErr) {
        console.error("[SynthesisDashboard] Status poll error:", pollErr);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [recalcStatus, onRecalcComplete]);

  const isRecalculating = recalcStatus && recalcStatus.status === "pending";

  return (
    <div className="flex flex-col gap-6">
      {isRecalculating && (
        <div style={synthesisCardStyleAccent}>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw
                className="h-4 w-4 shrink-0 animate-spin"
                style={{ color: "var(--gold-solar, #D4AF37)" }}
                aria-hidden
              />
              <p className="text-sm font-semibold" style={synthesisCream}>
                Synthesis engine recalculating
              </p>
            </div>
            <p
              className="text-xs tabular-nums"
              style={{
                fontFamily: synthesisBodyMuted.fontFamily,
                color: synthesisBodyMuted.color,
              }}
            >
              {recalcStatus.progress || 0}%
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(13,18,32,0.55)]">
            <div
              className="h-full transition-all"
              style={{
                width: `${recalcStatus.progress || 0}%`,
                background: "linear-gradient(90deg, #c8873a, #e8b96a)",
              }}
            />
          </div>
        </div>
      )}

      {recalcStatus?.status === "error" && (
        <div className="rounded-[12px] border border-red-500/30 bg-red-950/25 p-5">
          <p className="text-sm text-red-200/95">
            {recalcStatus.errorMessage || "Recalculation failed. Try again."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          style={{
            background: "rgba(13,18,32,0.6)",
            border: "1px solid rgba(200,135,58,0.15)",
            borderRadius: 12,
            padding: "10px 16px 14px",
          }}
        >
          <p className={synthesisLabelClass} style={synthesisLabelStyle}>
            Current period
          </p>
          <p
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 18,
              fontWeight: 400,
              color: "rgba(240,220,160,0.95)",
            }}
          >
            {synthesis.currentMahaDasha.planetName}{" "}
            <span style={{ fontSize: 12, opacity: 0.6 }}>
              / {synthesis.currentAntarDasha.planetName}
            </span>
          </p>
          <p className="mt-2 text-xs" style={synthesisBodyMuted}>
            Vedic timing cycle
          </p>
        </div>

        <div
          style={{
            background: "rgba(13,18,32,0.6)",
            border: "1px solid rgba(200,135,58,0.15)",
            borderRadius: 12,
            padding: "10px 16px 14px",
          }}
        >
          <p className={synthesisLabelClass} style={synthesisLabelStyle}>
            Convergence
          </p>
          <div className="flex items-baseline gap-2">
            <p
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 28,
                fontWeight: 400,
                color: "#e8b96a",
                lineHeight: 1,
              }}
            >
              {opportunityScores.overall}
            </p>
            <p className="text-xs" style={synthesisBodyMuted}>
              /100
            </p>
          </div>
          <p className="mt-2 text-xs" style={synthesisBodyMuted}>
            {opportunityScores.overall >= 70
              ? "Excellent alignment"
              : opportunityScores.overall >= 50
                ? "Good timing"
                : "Mixed signals"}
          </p>
        </div>

        <div
          style={{
            background: "rgba(13,18,32,0.6)",
            border: "1px solid rgba(200,135,58,0.15)",
            borderRadius: 12,
            padding: "10px 16px 14px",
          }}
        >
          <p className={synthesisLabelClass} style={synthesisLabelStyle}>
            Best opportunity
          </p>
          <p
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 18,
              fontWeight: 400,
              color: "#c8873a",
            }}
          >
            {opportunityScores.bestArea.charAt(0).toUpperCase() + opportunityScores.bestArea.slice(1)}
          </p>
          <p className="mt-2 text-xs" style={synthesisBodyMuted}>
            Score: {opportunityScores[opportunityScores.bestArea as keyof typeof opportunityScores]}/100
          </p>
        </div>
      </div>

      {synthesis.criticalDates.length > 0 && (
        <div style={synthesisCardStyle}>
          <p className={`${synthesisLabelClass} mb-3`} style={synthesisLabelStyle}>
            Next event
          </p>
          <div className="flex flex-col gap-2">
            {synthesis.criticalDates.slice(0, 2).map((date, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-medium" style={synthesisCream}>
                    {date.date}
                  </p>
                  <p className="mt-1 text-xs" style={synthesisBodyMuted}>
                    {date.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

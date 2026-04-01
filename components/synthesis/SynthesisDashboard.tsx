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
  synthesisInnerPanel,
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
        <div
          className={`${synthesisInnerPanel} border-[rgba(200,135,58,0.35)] bg-[rgba(200,135,58,0.06)]`}
        >
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
            <p className="text-xs" style={synthesisBodyMuted}>
              {recalcStatus.progress || 0}%
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
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
        <div className={`${synthesisInnerPanel} border-red-500/30 bg-red-950/20`}>
          <p className="text-sm text-red-200/95">
            {recalcStatus.errorMessage || "Recalculation failed. Try again."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className={synthesisInnerPanel}>
          <p className={synthesisLabelClass} style={synthesisLabelStyle}>
            Current period
          </p>
          <p className="text-sm font-medium" style={synthesisCream}>
            {synthesis.currentMahaDasha.planetName}{" "}
            <span className="text-xs font-normal opacity-70">
              / {synthesis.currentAntarDasha.planetName}
            </span>
          </p>
          <p className="mt-2 text-xs" style={synthesisBodyMuted}>
            Vedic timing cycle
          </p>
        </div>

        <div className={synthesisInnerPanel}>
          <p className={synthesisLabelClass} style={synthesisLabelStyle}>
            Convergence
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-normal" style={synthesisTitleCinzel}>
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

        <div className={synthesisInnerPanel}>
          <p className={synthesisLabelClass} style={synthesisLabelStyle}>
            Best opportunity
          </p>
          <p
            className="text-sm font-medium"
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              color: "var(--amber, #c8873a)",
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
        <div className={synthesisInnerPanel}>
          <p className={`${synthesisLabelClass} mb-3`} style={synthesisLabelStyle}>
            Next event
          </p>
          <div className="flex flex-col gap-2">
            {synthesis.criticalDates.slice(0, 2).map((date, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium" style={synthesisCream}>
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

// STATUS: done | Synthesis Engine Phase 4.3
/**
 * components/synthesis/SynthesisCard.tsx
 * Dashboard widget showing brief synthesis snapshot.
 * Current Dasha + next transit + top opportunity area.
 */

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SynthesisResult } from "@/types";
import { calculateOpportunityScores } from "@/lib/astro/opportunityScoreService";
import {
  synthesisBodyMuted,
  synthesisCream,
  synthesisLabelClass,
  synthesisLabelStyle,
  synthesisTitleCinzel,
} from "@/components/synthesis/synthesisPanelClasses";

interface SynthesisCardProps {
  synthesis: SynthesisResult;
  isRecalculating?: boolean;
}

export function SynthesisCard({ synthesis, isRecalculating }: SynthesisCardProps) {
  const scores = calculateOpportunityScores(synthesis);
  const nextCritical = synthesis.criticalDates[0];

  return (
    <div className="rounded-[14px] border border-[rgba(200,135,58,0.22)] bg-[rgba(13,18,32,0.55)] p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg" style={synthesisTitleCinzel}>
          Synthesis
        </h3>
        {isRecalculating && (
          <span className="animate-pulse text-xs text-[color:var(--amber,#c8873a)]">Updating…</span>
        )}
      </div>

      <div className="mb-4">
        <p className={synthesisLabelClass} style={synthesisLabelStyle}>
          Current period
        </p>
        <p className="text-sm font-medium" style={synthesisCream}>
          {synthesis.currentMahaDasha.planetName}{" "}
          <span className="text-xs" style={synthesisBodyMuted}>
            / {synthesis.currentAntarDasha.planetName}
          </span>
        </p>
      </div>

      <div className="mb-4 rounded-[12px] border border-[rgba(200,135,58,0.15)] bg-[rgba(200,135,58,0.06)] p-3">
        <p className={`${synthesisLabelClass} mb-1`} style={synthesisLabelStyle}>
          Best opportunity
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[color:var(--amber,#c8873a)]">
            {scores.bestArea.charAt(0).toUpperCase() + scores.bestArea.slice(1)}
          </span>
          <span className="font-serif text-lg text-[color:var(--amber,#c8873a)]">
            {scores[scores.bestArea as keyof typeof scores]}/100
          </span>
        </div>
      </div>

      {nextCritical && (
        <div className="mb-4 text-xs">
          <p className={`${synthesisLabelClass} mb-1`} style={synthesisLabelStyle}>
            Next event
          </p>
          <p style={synthesisCream}>{nextCritical.date}</p>
          <p className="mt-1 text-xs" style={synthesisBodyMuted}>
            {nextCritical.reason}
          </p>
        </div>
      )}

      <Link
        href="/synthesis"
        className="mt-4 inline-flex items-center gap-2 text-xs text-[color:var(--amber,#c8873a)] transition-colors hover:text-[#e8b96a]"
      >
        View full synthesis <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

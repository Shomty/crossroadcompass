// STATUS: done | Synthesis Engine Phase 4.4
/**
 * components/synthesis/OpportunityScorecardView.tsx
 * Display opportunity scores for 5 life areas (0-100 each).
 * Color gradient: red (low) → yellow (medium) → green (high).
 */

"use client";

import type { OpportunityScores } from "@/types";
import { scoreToGuidance } from "@/lib/astro/opportunityScoreService";
import {
  synthesisBodyMuted,
  synthesisCream,
  synthesisLabelClass,
  synthesisLabelStyle,
  synthesisTitleCinzel,
} from "@/components/synthesis/synthesisPanelClasses";

interface OpportunityScorecardViewProps {
  scores: OpportunityScores;
}

interface AreaConfig {
  key: keyof Omit<OpportunityScores, 'overall' | 'bestArea' | 'risky'>;
  label: string;
  icon: string;
}

const AREAS: AreaConfig[] = [
  { key: 'career', label: 'Career', icon: '🏢' },
  { key: 'love', label: 'Love', icon: '❤️' },
  { key: 'relocation', label: 'Relocation', icon: '🏠' },
  { key: 'health', label: 'Health', icon: '💚' },
  { key: 'spirituality', label: 'Spirituality', icon: '✨' },
];

function getScoreColor(score: number): string {
  if (score >= 80) return 'from-emerald-900/30 to-emerald-800/10 border-emerald-500/30';
  if (score >= 60) return 'from-amber-900/30 to-amber-800/10 border-amber-500/30';
  if (score >= 40) return 'from-yellow-900/30 to-yellow-800/10 border-yellow-500/30';
  return 'from-red-900/30 to-red-800/10 border-red-500/30';
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

export function OpportunityScorecardView({ scores }: OpportunityScorecardViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="mb-8 text-center">
        <p className={`${synthesisLabelClass} mb-2`} style={synthesisLabelStyle}>
          Overall convergence
        </p>
        <div className="mb-2 text-5xl" style={synthesisTitleCinzel}>
          {scores.overall}
        </div>
        <p className="text-sm leading-relaxed" style={synthesisBodyMuted}>
          {scores.overall >= 70
            ? "Excellent alignment"
            : scores.overall >= 50
              ? "Good timing"
              : "Mixed signals"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {AREAS.map((area) => {
          const score = scores[area.key];
          const guidance = scoreToGuidance(area.key, score);
          const isBest = scores.bestArea === area.key;

          return (
            <div
              key={area.key}
              className={`rounded-[12px] border bg-gradient-to-br p-5 ${getScoreColor(score)} ${
                isBest ? "ring-2 ring-[color:var(--amber,#c8873a)]" : ""
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium" style={synthesisCream}>
                    <span className="mr-2">{area.icon}</span>
                    {area.label}
                  </p>
                </div>
                <div className={`text-2xl font-serif ${getScoreTextColor(score)}`}>
                  {score}
                </div>
              </div>

              {/* Score Bar */}
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-[rgba(13,18,32,0.55)]">
                <div
                  className={`h-full transition-all ${
                    score >= 80
                      ? 'bg-emerald-400'
                      : score >= 60
                      ? 'bg-amber-400'
                      : score >= 40
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>

              {/* Guidance */}
              <p className="text-xs leading-relaxed" style={synthesisBodyMuted}>
                {guidance}
              </p>

              {isBest && (
                <p className="mt-2 text-xs font-medium text-[color:var(--amber,#c8873a)]">
                  Best opportunity
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Risk Areas */}
      {scores.risky.length > 0 && (
        <div className="rounded-[12px] border border-red-500/30 bg-red-950/25 p-5">
          <p className="mb-2 text-xs font-medium text-red-400">Areas to watch</p>
          <p className="text-sm text-red-200">
            {scores.risky.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(", ")}{" "}
            <span style={synthesisBodyMuted}>are below 40. Proceed with caution or delay action.</span>
          </p>
        </div>
      )}
    </div>
  );
}

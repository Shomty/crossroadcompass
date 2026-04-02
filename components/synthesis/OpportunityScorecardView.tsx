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
  synthesisSectionHeading,
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
  { key: 'career', label: 'Career', icon: '◆' },
  { key: 'love', label: 'Love', icon: '◈' },
  { key: 'relocation', label: 'Relocation', icon: '◇' },
  { key: 'health', label: 'Health', icon: '◉' },
  { key: 'spirituality', label: 'Spirituality', icon: '✦' },
];

function getScoreTextColor(score: number): string {
  if (score >= 70) return 'text-[color:var(--gold,#e8b96a)]';
  if (score >= 40) return 'text-[color:var(--amber,#c8873a)]';
  return 'text-[rgba(240,220,160,0.45)]';
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
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                background: "rgba(200,135,58,0.06)",
                border: isBest
                  ? "1px solid rgba(200,135,58,0.55)"
                  : "1px solid rgba(200,135,58,0.25)",
                cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
                opacity: isBest ? 1 : 0.65,
              }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="mb-0.5 text-[9px] uppercase tracking-[0.16em]" style={{ ...synthesisLabelStyle, color: "rgba(200,135,58,0.65)" }}>
                    {area.icon}
                  </p>
                  <h4 style={{ ...synthesisSectionHeading, fontSize: 14 }}>{area.label}</h4>
                </div>
                <div className={`text-2xl font-serif ${getScoreTextColor(score)}`}>
                  {score}
                </div>
              </div>

              {/* Score Bar */}
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-[rgba(13,18,32,0.55)]">
                <div
                  className="h-full transition-all bg-[linear-gradient(135deg,#c8873a,#e8b96a)]"
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
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(200,135,58,0.06)",
            border: "1px solid rgba(200,135,58,0.25)",
            cursor: "pointer",
            transition: "background 0.15s, border-color 0.15s",
            opacity: 0.65,
          }}
        >          <div className="mb-3">
            <p className={synthesisLabelClass} style={synthesisLabelStyle}>Caution zones</p>
            <h3 style={{ ...synthesisSectionHeading, fontSize: 15 }}>Areas to Watch</h3>
          </div>
          <p className="text-sm" style={{ ...synthesisBodyMuted, color: "rgba(240,220,160,0.65)" }}>
            {scores.risky.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(", ")}{" "}
            <span style={synthesisBodyMuted}>are below 40. Proceed with caution or delay action.</span>
          </p>
        </div>
      )}
    </div>
  );
}

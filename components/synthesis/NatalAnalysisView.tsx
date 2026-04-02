/**
 * components/synthesis/NatalAnalysisView.tsx
 * engine3.md §8: All 6 report layers displayed from TraitAnalysis.
 *
 * Layer 1: Unified Summary — 5-7 bullets from high-confidence traits
 * Layer 2: Dual System Breakdown — Vedic card + Western card
 * Layer 3: Trait Alignment Table — 9 traits with dual scores + alignment
 * Layer 4: Contradictions + Resolution — AHA insights for conflicted traits
 * Layer 5: Psychological Interpretation — Western-led narrative
 * Layer 6: Confidence Index — per-trait HIGH/MEDIUM/LOW grid
 */

"use client";

import type React from "react";
import type { TraitAnalysis, TraitScore, TraitCategory, SynthesisResult, DashaPeriod } from "@/types";
import {
  synthesisBodyMuted,
  synthesisCream,
  synthesisLabelClass,
  synthesisLabelStyle,
  synthesisNestedCardStyle,
  synthesisNestedCardBaseStyle,
  synthesisSectionHeading,
  synthesisTitleCinzel,
} from "@/components/synthesis/synthesisPanelClasses";

interface NatalAnalysisViewProps {
  synthesis: SynthesisResult;
}

// ─── Visual helpers ───────────────────────────────────────────────────────────

const ALIGNMENT_CONFIG = {
  HIGH: {
    label: "HIGH",
    icon: "◆",
    color: "text-[color:var(--gold,#e8b96a)]",
    bar: "bg-[color:var(--amber,#c8873a)]",
  },
  MEDIUM: {
    label: "MED",
    icon: "◇",
    color: "text-[rgba(200,135,58,0.80)]",
    bar: "bg-[rgba(200,135,58,0.50)]",
  },
  LOW: {
    label: "LOW",
    icon: "○",
    color: "text-[rgba(240,220,160,0.35)]",
    bar: "bg-[rgba(240,220,160,0.15)]",
  },
} as const;

function AlignmentBadge({ level }: { level: "HIGH" | "MEDIUM" | "LOW" }) {
  const cfg = ALIGNMENT_CONFIG[level];
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-[0.14em] ${
        level === "HIGH"
          ? "border-[rgba(212,175,55,0.45)] bg-[rgba(200,135,58,0.08)]"
          : level === "MEDIUM"
            ? "border-[rgba(200,135,58,0.2)] bg-[rgba(200,135,58,0.04)]"
            : "border-[rgba(200,135,58,0.06)] bg-[rgba(13,18,32,0.30)]"
      } ${cfg.color}`}
      style={synthesisLabelStyle}
    >
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

// TableScoreCell removed — AlignmentTable now renders dual bars inline.

// ─── Layer 1: Unified Summary ─────────────────────────────────────────────────

function UnifiedSummary({ summary }: { summary: string[] }) {
  return (
    <div style={synthesisNestedCardStyle}>
      <div className="mb-4">
        <p className={synthesisLabelClass} style={synthesisLabelStyle}>Layer 1</p>
        <h3 style={synthesisSectionHeading}>Unified Summary</h3>
      </div>
      <ul className="mt-3 space-y-2.5">
        {summary.map((bullet, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 text-xs text-[color:var(--amber,#c8873a)]">◈</span>
            <span className="text-sm leading-relaxed" style={synthesisBodyMuted}>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Layer 2: Dual System Breakdown ──────────────────────────────────────────

function SystemCard({
  eyebrow,
  heading,
  system,
  scores,
  dasha,
}: {
  eyebrow: string;
  heading: string;
  system: 'vedic' | 'western';
  scores: TraitScore[];
  dasha?: DashaPeriod;
}) {
  const isVedic = system === 'vedic';
  const topScores = [...scores]
    .sort((a, b) => isVedic ? b.vedic_score - a.vedic_score : b.western_score - a.western_score)
    .slice(0, 5);

  const barBg = isVedic
    ? "linear-gradient(90deg,#c8873a,#e8b96a)"
    : "rgba(240,220,160,0.28)";
  const scoreHigh = isVedic ? "var(--gold,#e8b96a)" : "rgba(240,220,160,0.72)";
  const scoreLow  = isVedic ? "rgba(200,135,58,0.45)" : "rgba(240,220,160,0.28)";

  return (
    <div style={synthesisNestedCardStyle}>
      {/* Header row */}
      <div className="mb-5 flex items-start justify-between gap-2">
        <div>
          <p className={synthesisLabelClass} style={synthesisLabelStyle}>{eyebrow}</p>
          <h3 style={synthesisSectionHeading}>{heading}</h3>
        </div>
        <span
          style={{
            ...synthesisLabelStyle,
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
            color: isVedic ? "rgba(200,135,58,0.55)" : "rgba(240,220,160,0.35)",
            marginTop: 2,
          }}
        >
          {isVedic ? "Jyotish" : "Tropical"}
        </span>
      </div>

      {/* Trait score rows */}
      <div className="flex flex-col gap-4">
        {topScores.map((s) => {
          const score   = isVedic ? s.vedic_score   : s.western_score;
          const sources = isVedic ? s.vedic_sources : s.western_sources;
          const pct     = Math.round(score * 100);
          return (
            <div key={s.trait}>
              {/* Trait label + score number */}
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="font-serif text-sm font-medium leading-snug" style={synthesisTitleCinzel}>
                  {s.label}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 14,
                    lineHeight: 1,
                    color: pct >= 70 ? scoreHigh : scoreLow,
                    tabularNums: true,
                  } as React.CSSProperties}
                >
                  {pct}
                </span>
              </div>
              {/* Score bar */}
              <div
                className="mb-2 h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "rgba(13,18,32,0.55)" }}
                role="meter"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${s.label} score`}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: barBg }}
                />
              </div>
              {/* Source tag */}
              {sources.length > 0 && (
                <p
                  className="mt-1 truncate text-[11px] leading-snug"
                  style={{ ...synthesisBodyMuted, color: "rgba(255,255,255,0.42)" }}
                >
                  {sources[0]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Dasha block (Vedic only) */}
      {dasha && isVedic && (
        <div
          className="mt-5 rounded-[8px] p-3"
          style={{
            background: "rgba(200,135,58,0.05)",
            border: "1px solid rgba(200,135,58,0.15)",
          }}
        >
          <p className={`${synthesisLabelClass} mb-1`} style={synthesisLabelStyle}>Active Dasha Cycle</p>
          <p className="text-sm font-medium" style={synthesisCream}>
            {dasha.planetName}{" "}
            {dasha.level === "MAHADASHA" ? "Mahadasha" : "Antardasha"}
          </p>
          {dasha.remainingDays != null && (
            <p className="mt-0.5 text-xs" style={synthesisBodyMuted}>
              {dasha.remainingDays} days remaining
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Layer 3: Trait Alignment Table ──────────────────────────────────────────

function AlignmentTable({ scores }: { scores: TraitScore[] }) {
  return (
    <div style={synthesisNestedCardStyle}>
      {/* Header */}
      <div className="mb-2">
        <p className={synthesisLabelClass} style={synthesisLabelStyle}>Layer 3</p>
        <h3 style={synthesisSectionHeading}>Trait Alignment</h3>
      </div>
      <p className="mb-5 mt-1 text-sm leading-relaxed" style={synthesisBodyMuted}>
        Scores 0–100 per system. Match reflects how closely both systems agree.
      </p>

      {/* Column header row */}
      <div
        className="mb-1 hidden grid-cols-[1fr_100px_100px_72px] gap-3 px-3 sm:grid"
        aria-hidden
      >
        <p className={synthesisLabelClass} style={synthesisLabelStyle}>Trait</p>
        <p
          className={`${synthesisLabelClass} text-right`}
          style={{ ...synthesisLabelStyle, color: "var(--amber,#c8873a)" }}
        >
          Vedic
        </p>
        <p
          className={`${synthesisLabelClass} text-right`}
          style={{ ...synthesisLabelStyle, color: "rgba(240,220,160,0.40)" }}
        >
          Western
        </p>
        <p className={`${synthesisLabelClass} text-right`} style={synthesisLabelStyle}>Match</p>
      </div>

      {/* Trait rows */}
      <div
        className="overflow-hidden rounded-[10px]"
        style={{ border: "1px solid rgba(200,135,58,0.10)" }}
      >
        {scores.map((s, idx) => {
          const vPct = Math.round(s.vedic_score * 100);
          const wPct = Math.round(s.western_score * 100);
          const isLast = idx === scores.length - 1;
          return (
            <div
              key={s.trait}
              className="grid grid-cols-1 gap-y-3 px-3 py-3.5 transition-colors hover:bg-[rgba(200,135,58,0.03)] sm:grid-cols-[1fr_100px_100px_72px] sm:items-center sm:gap-x-3 sm:gap-y-0"
              style={{
                borderBottom: isLast ? "none" : "1px solid rgba(200,135,58,0.08)",
                background: idx % 2 === 1 ? "rgba(200,135,58,0.015)" : "transparent",
              }}
            >
              {/* Trait name + conflict badge */}
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span
                  className="font-serif text-sm font-medium leading-snug"
                  style={synthesisTitleCinzel}
                >
                  {s.label}
                </span>
                {s.contradiction && (
                  <span
                    className="rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wide"
                    style={{
                      ...synthesisLabelStyle,
                      color: "rgba(240,220,160,0.55)",
                      borderColor: "rgba(200,135,58,0.25)",
                      background: "rgba(200,135,58,0.06)",
                    }}
                    title="One system > 0.7, other < 0.4"
                  >
                    conflict
                  </span>
                )}
              </div>

              {/* Vedic score + bar */}
              <div className="flex flex-col items-end gap-1.5">
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 14,
                    lineHeight: 1,
                    color: vPct >= 70 ? "var(--gold,#e8b96a)" : "rgba(200,135,58,0.55)",
                  }}
                >
                  {vPct}
                </span>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: "rgba(13,18,32,0.55)" }}
                  role="meter"
                  aria-valuenow={vPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${s.label} Vedic score`}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${vPct}%`,
                      background: "linear-gradient(90deg,#c8873a,#e8b96a)",
                    }}
                  />
                </div>
              </div>

              {/* Western score + bar */}
              <div className="flex flex-col items-end gap-1.5">
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 14,
                    lineHeight: 1,
                    color: wPct >= 70 ? "rgba(240,220,160,0.72)" : "rgba(240,220,160,0.30)",
                  }}
                >
                  {wPct}
                </span>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: "rgba(13,18,32,0.55)" }}
                  role="meter"
                  aria-valuenow={wPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${s.label} Western score`}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${wPct}%`, background: "rgba(240,220,160,0.22)" }}
                  />
                </div>
              </div>

              {/* Match badge */}
              <div className="flex sm:justify-end">
                <AlignmentBadge level={s.alignment} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[rgba(200,135,58,0.12)] pt-3">
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-6 rounded-full"
            style={{ background: "linear-gradient(90deg,#c8873a,#e8b96a)" }}
          />
          <span className="text-xs" style={synthesisBodyMuted}>Vedic (Jyotish)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-6 rounded-full"
            style={{ background: "rgba(240,220,160,0.22)" }}
          />
          <span className="text-xs" style={synthesisBodyMuted}>Western (Tropical)</span>
        </div>
      </div>
    </div>
  );
}

// ─── Layer 4: Contradictions + Resolution ────────────────────────────────────

function ContradictionResolution({ contradictions, allScores }: { contradictions: TraitScore[]; allScores: TraitScore[] }) {
  const toShow = contradictions.length > 0 ? contradictions : allScores.filter(s => s.alignment === 'LOW').slice(0, 2);

  if (toShow.length === 0) {
    return (
      <div style={synthesisNestedCardStyle}>
        <div className="mb-4">
          <p className={synthesisLabelClass} style={synthesisLabelStyle}>Layer 4</p>
          <h3 style={synthesisSectionHeading}>Contradictions & Resolution</h3>
        </div>
        <p className="mt-3 text-sm" style={synthesisBodyMuted}>
          No significant contradictions detected between the two systems. This indicates strong alignment across your chart — both systems tell a consistent story.
        </p>
      </div>
    );
  }

  return (
    <div style={synthesisNestedCardStyle}>
      <div className="mb-4">
        <p className={synthesisLabelClass} style={synthesisLabelStyle}>Layer 4</p>
        <h3 style={synthesisSectionHeading}>Contradictions & Resolution</h3>
      </div>
      <p className="mb-4 mt-2 text-sm" style={synthesisBodyMuted}>
        When two systems diverge, the gap holds the greatest insight.
      </p>
      <div className="flex flex-col gap-5">
        {toShow.map((s) => {
          const vStronger = s.vedic_score > s.western_score;
          const vLabel = vStronger ? "Vedic capacity" : "Vedic pattern";
          const wLabel = vStronger ? "Western expression" : "Western drive";
          return (
            <div
              key={s.trait}
              style={{ ...synthesisNestedCardStyle, borderLeft: "2px solid rgba(200,135,58,0.35)" }}
            >
              <p className="mb-1.5 font-serif text-sm font-medium" style={synthesisTitleCinzel}>
                {s.label}
              </p>
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tabular-nums">
                <span className="text-[color:var(--amber,#c8873a)]">
                  {vLabel}: {Math.round(s.vedic_score * 100)}
                </span>
                <span className="text-[rgba(240,220,160,0.30)]">vs</span>
                <span style={synthesisCream}>
                  {wLabel}: {Math.round(s.western_score * 100)}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={synthesisBodyMuted}>
                {getResolutionNarrative(s)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getResolutionNarrative(s: TraitScore): string {
  const vLabel = s.vedic_sources[0] ?? 'your Vedic chart';
  const wLabel = s.western_sources[0] ?? 'your Western chart';
  const vStronger = s.vedic_score > s.western_score;

  const templates: Partial<Record<TraitCategory, string>> = {
    discipline: vStronger
      ? `Your karmic capacity for discipline (${vLabel}) far exceeds how you consciously experience yourself. You may underestimate your own resilience and structure. The invitation: own the discipline you already possess.`
      : `You approach life with visible structure and discipline (${wLabel}), yet at a deeper karmic level this pattern is still developing. Your outer discipline is ahead of your inner wiring — a useful lead to follow consciously.`,
    identity: vStronger
      ? `Your soul-level identity (${vLabel}) is stronger than your conscious self-concept. There is a version of you that is more powerful than the one you present. The gap is an invitation to grow into your actual magnitude.`
      : `You project confidence and clear identity outwardly (${wLabel}), while internally navigating a more complex, searching self-concept. Your outer presence has outpaced your inner security — a sign you're growing fast.`,
    emotional_profile: vStronger
      ? `Your emotional depth runs far deeper than others see (${vLabel}). A rich, complex inner world that rarely surfaces fully. The invitation: allow selective expression — it builds genuine intimacy.`
      : `You display emotional openness (${wLabel}), while your karmic emotional patterns run quieter. The outer expression is ahead of the inner processing — grounding practices help integrate both layers.`,
    risk_ambition: vStronger
      ? `Your karmic drive (${vLabel}) exceeds what you consciously claim. A quiet, powerful ambition that waits for the right moment. Stop underestimating the scale of what you are built to pursue.`
      : `Your conscious drive and ambition are strong (${wLabel}), while your deeper karmic pattern favours patience and consolidation. The formula: use visible ambition to open doors, then let depth and timing close them.`,
    social_orientation: vStronger
      ? `Your karmic orientation is toward deep social engagement (${vLabel}), though you may not currently live this out fully. Community and networks hold more karmic significance than you allow.`
      : `Outwardly social and network-oriented (${wLabel}), while your deeper karmic nature values deep one-to-one connection over breadth. Quantity of connection is less important to your soul than quality.`,
    communication: vStronger
      ? `Your intellectual depth (${vLabel}) exceeds what you articulate. More is understood than expressed. The invitation: trust your voice more — your insights are more valuable than you believe.`
      : `A natural communicator on the surface (${wLabel}), while your inner intellectual processing is quieter and more private. Writing or non-verbal expression may carry more of your true depth.`,
    relationship_patterns: vStronger
      ? `Relationships carry deep karmic weight in your Vedic chart (${vLabel}), yet you may not fully lean into this in daily life. Partnership is where your most significant soul growth happens.`
      : `Your Western chart shows strong relational drive and warmth (${wLabel}), while your Vedic pattern points to more complex karmic lessons through partnership. Relationships teach you more than you expect.`,
    energy_burnout: vStronger
      ? `Your physical vitality and resilience (${vLabel}) are stronger than you consciously access. Rest is important, but do not mistake your untapped reserve for genuine depletion.`
      : `High outward energy and activity (${wLabel}) masks a deeper pattern of variable cycles. You may operate above your sustainable baseline — honouring recovery is a strategic choice, not a weakness.`,
    life_direction: vStronger
      ? `Your dharmic path is clearer in the Vedic system (${vLabel}) than your conscious goals reflect. The soul knows where it is going — the invitation is to trust that direction more explicitly.`
      : `Your conscious life goals are well-defined (${wLabel}), while your deeper karmic direction is more fluid and surprising. Your greatest milestones often arrive in ways you did not plan.`,
  };

  return (
    templates[s.trait as TraitCategory] ??
    `Your ${s.label.toLowerCase()} shows different signatures across the two systems (${vLabel} vs ${wLabel}). ` +
    `Use the ${s.vedic_score > s.western_score ? 'Vedic' : 'Western'} signal as your deeper capacity, and the other as your conscious expression style.`
  );
}

// ─── Layer 5: Psychological Interpretation ───────────────────────────────────

function PsychologicalInterpretation({ scores }: { scores: TraitScore[] }) {
  const identity   = scores.find(s => s.trait === 'identity');
  const emotional  = scores.find(s => s.trait === 'emotional_profile');
  const social     = scores.find(s => s.trait === 'social_orientation');
  const relation   = scores.find(s => s.trait === 'relationship_patterns');
  const energy     = scores.find(s => s.trait === 'energy_burnout');

  const westernTopSource = (s?: TraitScore) => s?.western_sources?.[0] ?? '';

  return (
    <div style={synthesisNestedCardStyle}>
      <div className="mb-4">
        <p className={synthesisLabelClass} style={synthesisLabelStyle}>Layer 5</p>
        <h3 style={synthesisSectionHeading}>Psychological Interpretation</h3>
      </div>
      <p className="font-oracle mb-4 mt-1 text-sm italic leading-relaxed" style={synthesisBodyMuted}>
        Western-led reading of conscious experience and behavioural patterns.
      </p>
      <div className="flex flex-col gap-5">
        {identity && (
          <div className="border-t border-[rgba(200,135,58,0.12)] pt-4 first:border-t-0 first:pt-0">
            <p className="mb-1 font-serif text-sm font-medium" style={synthesisTitleCinzel}>
              Identity
            </p>
            <p className="text-sm leading-relaxed" style={synthesisBodyMuted}>
              {identity.western_score >= 0.7
                ? `A strong, clearly expressed sense of self. You tend to know who you are and project that with confidence. ${westernTopSource(identity)} shapes how you enter rooms.`
                : identity.western_score >= 0.5
                ? `A developing sense of identity — clearer in some areas than others. ${westernTopSource(identity)} points to the primary mode of self-expression.`
                : `Identity is an active growth area. ${westernTopSource(identity)} suggests the core identity theme, but expression may feel inconsistent.`}
            </p>
          </div>
        )}
        {emotional && (
          <div className="border-t border-[rgba(200,135,58,0.12)] pt-4 first:border-t-0 first:pt-0">
            <p className="mb-1 font-serif text-sm font-medium" style={synthesisTitleCinzel}>
              Emotional processing
            </p>
            <p className="text-sm leading-relaxed" style={synthesisBodyMuted}>
              {emotional.western_score >= 0.65
                ? `Emotionally complex and deeply feeling. ${westernTopSource(emotional)} — you process the world through emotion before logic.`
                : `Moderate emotional expression — you balance feeling with analysis. ${westernTopSource(emotional)}.`}
              {emotional.contradiction && ` Note: your visible emotional style differs from your inner pattern — what others see is not the whole picture.`}
            </p>
          </div>
        )}
        {social && (
          <div className="border-t border-[rgba(200,135,58,0.12)] pt-4 first:border-t-0 first:pt-0">
            <p className="mb-1 font-serif text-sm font-medium" style={synthesisTitleCinzel}>
              Social behaviour
            </p>
            <p className="text-sm leading-relaxed" style={synthesisBodyMuted}>
              {social.western_score >= 0.65
                ? `Naturally social — you gain energy from interaction and are drawn to networks. ${westernTopSource(social)}.`
                : social.western_score < 0.4
                ? `Selective in social engagement — quality over quantity defines your approach. ${westernTopSource(social)}.`
                : `Balanced social orientation — comfortable in groups but equally at ease alone. ${westernTopSource(social)}.`}
            </p>
          </div>
        )}
        {relation && (
          <div className="border-t border-[rgba(200,135,58,0.12)] pt-4 first:border-t-0 first:pt-0">
            <p className="mb-1 font-serif text-sm font-medium" style={synthesisTitleCinzel}>
              Relationship style
            </p>
            <p className="text-sm leading-relaxed" style={synthesisBodyMuted}>
              {relation.western_score >= 0.65
                ? `Relationships are central to your conscious experience of life. ${westernTopSource(relation)} — you invest deeply and expect depth in return.`
                : `Partnership matters but does not define you. ${westernTopSource(relation)} — you bring warmth without losing your independence.`}
            </p>
          </div>
        )}
        {energy && (
          <div className="border-t border-[rgba(200,135,58,0.12)] pt-4 first:border-t-0 first:pt-0">
            <p className="mb-1 font-serif text-sm font-medium" style={synthesisTitleCinzel}>
              Energy & recovery
            </p>
            <p className="text-sm leading-relaxed" style={synthesisBodyMuted}>
              {energy.western_score >= 0.65
                ? `High-energy constitution — you tend toward activity, productivity, and high output. ${westernTopSource(energy)}. Watch for burnout when intensity sustains too long.`
                : energy.western_score < 0.4
                ? `Variable energy cycles are part of your nature. ${westernTopSource(energy)}. Rhythm and recovery are strategic assets, not weaknesses.`
                : `Moderate, sustainable energy. ${westernTopSource(energy)}. You pace yourself naturally and rarely reach full depletion.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Layer 6: Confidence Index ────────────────────────────────────────────────

function ConfidenceIndex({ scores }: { scores: TraitScore[] }) {
  return (
    <div style={synthesisNestedCardStyle}>
      <div className="mb-4">
        <p className={synthesisLabelClass} style={synthesisLabelStyle}>Layer 6</p>
        <h3 style={synthesisSectionHeading}>Confidence Index</h3>
      </div>
      <p className="mb-4 mt-1 text-xs leading-relaxed" style={synthesisBodyMuted}>
        How consistently both systems agree on each trait.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {scores.map((s) => (
          <div
            key={s.trait}
            className="flex items-center justify-between gap-3"
            style={{ ...synthesisNestedCardBaseStyle, padding: "8px 12px" }}
          >
            <span className="text-sm font-medium font-serif" style={synthesisTitleCinzel}>
              {s.label}
            </span>
            <AlignmentBadge level={s.alignment} />
          </div>
        ))}
      </div>
      <div
        className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[rgba(200,135,58,0.12)] pt-3 text-[10px]"
        style={{ ...synthesisBodyMuted, ...synthesisLabelStyle }}
      >
        <span>
          <span className="text-[color:var(--gold,#e8b96a)]">◆ HIGH</span> — Both systems strongly agree
        </span>
        <span>
          <span className="text-[rgba(200,135,58,0.80)]">◇ MED</span> — Moderate
          alignment
        </span>
        <span>
          <span className="text-[rgba(240,220,160,0.35)]">○ LOW</span> — Systems diverge
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NatalAnalysisView({ synthesis }: NatalAnalysisViewProps) {
  const ta = synthesis.traitAnalysis;

  if (!ta) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm" style={synthesisBodyMuted}>
          Natal analysis is being computed. Refresh the page in a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Layer 1 — Unified Summary */}
      {ta.unifiedSummary.length > 0 && (
        <UnifiedSummary summary={ta.unifiedSummary} />
      )}

      {/* Layer 2 — Dual System Breakdown */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SystemCard
          eyebrow="Jyotish Layer"
          heading="Karmic Patterns"
          system="vedic"
          scores={ta.scores}
          dasha={synthesis.currentAntarDasha}
        />
        <SystemCard
          eyebrow="Western Layer"
          heading="Conscious Expression"
          system="western"
          scores={ta.scores}
        />
      </div>

      {/* Layer 3 — Trait Alignment Table */}
      <AlignmentTable scores={ta.scores} />

      {/* Layer 4 — Contradictions + Resolution */}
      <ContradictionResolution
        contradictions={ta.contradictions}
        allScores={ta.scores}
      />

      {/* Layer 5 — Psychological Interpretation */}
      <PsychologicalInterpretation scores={ta.scores} />

      {/* Layer 6 — Confidence Index */}
      <ConfidenceIndex scores={ta.scores} />

    </div>
  );
}

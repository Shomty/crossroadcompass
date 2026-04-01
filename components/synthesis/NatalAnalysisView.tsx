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

import type { TraitAnalysis, TraitScore, TraitCategory, SynthesisResult, DashaPeriod } from "@/types";
import {
  synthesisBodyMuted,
  synthesisCream,
  synthesisInnerPanel,
  synthesisLabelClass,
  synthesisLabelStyle,
  synthesisTitleCinzel,
} from "@/components/synthesis/synthesisPanelClasses";

interface NatalAnalysisViewProps {
  synthesis: SynthesisResult;
}

// ─── Visual helpers ───────────────────────────────────────────────────────────

const ALIGNMENT_CONFIG = {
  HIGH:   { label: 'HIGH',   icon: '◆', color: 'text-[#e8b96a]', bar: 'bg-[#c8873a]' },
  MEDIUM: { label: 'MED',    icon: '◇', color: 'text-[rgba(200,135,58,0.7)]', bar: 'bg-[rgba(200,135,58,0.5)]' },
  LOW:    { label: 'LOW',    icon: '○', color: 'text-[rgba(255,255,255,0.35)]', bar: 'bg-[rgba(255,255,255,0.15)]' },
} as const;

function AlignmentBadge({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const cfg = ALIGNMENT_CONFIG[level];
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-[0.1em] ${
        level === 'HIGH'
          ? 'border-[rgba(200,135,58,0.4)] bg-[rgba(200,135,58,0.08)]'
          : level === 'MEDIUM'
          ? 'border-[rgba(200,135,58,0.2)] bg-[rgba(200,135,58,0.04)]'
          : 'border-white/10 bg-white/[0.03]'
      } ${cfg.color}`}
    >
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const pct = Math.round(score * 100);
  const isWarm = label === 'V';
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-4 shrink-0 text-[9px] font-medium"
        style={{ ...synthesisLabelStyle, color: isWarm ? '#c8873a' : 'rgba(255,255,255,0.35)' }}
      >
        {label}
      </span>
      <div className="h-1.5 flex-1 rounded-full bg-white/5">
        <div
          className={`h-full rounded-full transition-all ${
            isWarm ? 'bg-gradient-to-r from-[#c8873a] to-[#e8b96a]' : 'bg-white/25'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className="w-6 shrink-0 text-right text-[9px]"
        style={{ ...synthesisLabelStyle, color: 'rgba(255,255,255,0.35)' }}
      >
        {pct}
      </span>
    </div>
  );
}

// ─── Layer 1: Unified Summary ─────────────────────────────────────────────────

function UnifiedSummary({ summary }: { summary: string[] }) {
  return (
    <div className={synthesisInnerPanel}>
      <p className={synthesisLabelClass} style={synthesisLabelStyle}>◆ Layer 1 — Unified Summary</p>
      <ul className="mt-3 space-y-2.5">
        {summary.map((bullet, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 text-[#c8873a] text-xs">◈</span>
            <span className="text-sm leading-relaxed" style={synthesisBodyMuted}>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Layer 2: Dual System Breakdown ──────────────────────────────────────────

function SystemCard({
  title,
  system,
  scores,
  dasha,
}: {
  title: string;
  system: 'vedic' | 'western';
  scores: TraitScore[];
  dasha?: DashaPeriod;
}) {
  const topScores = [...scores]
    .sort((a, b) =>
      system === 'vedic'
        ? b.vedic_score - a.vedic_score
        : b.western_score - a.western_score
    )
    .slice(0, 5);

  return (
    <div className={synthesisInnerPanel}>
      <p className={synthesisLabelClass} style={synthesisLabelStyle}>{title}</p>
      <div className="mt-3 space-y-3">
        {topScores.map(s => {
          const sources = system === 'vedic' ? s.vedic_sources : s.western_sources;
          const score = system === 'vedic' ? s.vedic_score : s.western_score;
          const pct = Math.round(score * 100);
          return (
            <div key={s.trait} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium" style={synthesisCream}>{s.label}</span>
                <span
                  className="text-[10px]"
                  style={{ ...synthesisLabelStyle, color: pct >= 70 ? '#e8b96a' : 'rgba(255,255,255,0.4)' }}
                >
                  {pct}
                </span>
              </div>
              {sources.slice(0, 2).map((src, i) => (
                <p key={i} className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
                  · {src}
                </p>
              ))}
            </div>
          );
        })}
        {dasha && system === 'vedic' && (
          <div className="mt-3 border-t border-white/5 pt-3">
            <p className={synthesisLabelClass} style={synthesisLabelStyle}>Current Dasha Cycle</p>
            <p className="mt-1 text-xs font-medium" style={synthesisCream}>
              {dasha.planetName} {dasha.level === 'MAHADASHA' ? 'Mahadasha' : 'Antardasha'}
            </p>
            {dasha.remainingDays != null && (
              <p className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
                {dasha.remainingDays} days remaining
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Layer 3: Trait Alignment Table ──────────────────────────────────────────

function AlignmentTable({ scores }: { scores: TraitScore[] }) {
  return (
    <div className={synthesisInnerPanel}>
      <p className={synthesisLabelClass} style={synthesisLabelStyle}>◇ Layer 3 — Trait Alignment (Vedic vs Western)</p>
      <div className="mt-4 space-y-4">
        {scores.map(s => (
          <div key={s.trait}>
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-xs font-medium" style={synthesisCream}>{s.label}</span>
              <div className="flex items-center gap-2">
                {s.contradiction && (
                  <span
                    className="rounded-full border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)] px-2 py-0.5 text-[10px] text-red-400"
                    title="Contradiction — one system > 0.7, other < 0.4"
                  >
                    ⚡ conflict
                  </span>
                )}
                <AlignmentBadge level={s.alignment} />
              </div>
            </div>
            <div className="space-y-1 pl-0">
              <ScoreBar score={s.vedic_score} label="V" />
              <ScoreBar score={s.western_score} label="W" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 border-t border-white/5 pt-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-[#c8873a]">V</span>
          <span className="text-[10px]" style={synthesisBodyMuted}>Vedic (Jyotish)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-white/30">W</span>
          <span className="text-[10px]" style={synthesisBodyMuted}>Western (Tropical)</span>
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
      <div className={synthesisInnerPanel}>
        <p className={synthesisLabelClass} style={synthesisLabelStyle}>⚡ Layer 4 — Contradictions & Resolution</p>
        <p className="mt-3 text-sm" style={synthesisBodyMuted}>
          No significant contradictions detected between the two systems. This indicates strong alignment across your chart — both systems tell a consistent story.
        </p>
      </div>
    );
  }

  return (
    <div className={synthesisInnerPanel}>
      <p className={synthesisLabelClass} style={synthesisLabelStyle}>⚡ Layer 4 — Contradictions & Resolution</p>
      <p className="mt-2 mb-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
        When two systems diverge, the gap holds the greatest insight.
      </p>
      <div className="space-y-5">
        {toShow.map(s => {
          const vStronger = s.vedic_score > s.western_score;
          const vLabel = vStronger ? 'Vedic capacity' : 'Vedic pattern';
          const wLabel = vStronger ? 'Western expression' : 'Western drive';
          return (
            <div key={s.trait} className="border-l-2 border-[rgba(200,135,58,0.3)] pl-3">
              <p className="text-xs font-medium mb-1.5" style={synthesisCream}>{s.label}</p>
              <div className="mb-2 flex items-center gap-3 text-xs">
                <span style={{ color: '#c8873a' }}>
                  {vLabel}: {Math.round(s.vedic_score * 100)}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>vs</span>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {wLabel}: {Math.round(s.western_score * 100)}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={synthesisBodyMuted}>
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
    <div className={synthesisInnerPanel}>
      <p className={synthesisLabelClass} style={synthesisLabelStyle}>◉ Layer 5 — Psychological Interpretation</p>
      <p className="mt-1 mb-4 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
        Western-led reading of conscious experience and behavioural patterns.
      </p>
      <div className="space-y-4">
        {identity && (
          <div>
            <p className="mb-1 text-xs font-medium" style={synthesisCream}>Identity</p>
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
          <div>
            <p className="mb-1 text-xs font-medium" style={synthesisCream}>Emotional Processing</p>
            <p className="text-sm leading-relaxed" style={synthesisBodyMuted}>
              {emotional.western_score >= 0.65
                ? `Emotionally complex and deeply feeling. ${westernTopSource(emotional)} — you process the world through emotion before logic.`
                : `Moderate emotional expression — you balance feeling with analysis. ${westernTopSource(emotional)}.`}
              {emotional.contradiction && ` Note: your visible emotional style differs from your inner pattern — what others see is not the whole picture.`}
            </p>
          </div>
        )}
        {social && (
          <div>
            <p className="mb-1 text-xs font-medium" style={synthesisCream}>Social Behaviour</p>
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
          <div>
            <p className="mb-1 text-xs font-medium" style={synthesisCream}>Relationship Style</p>
            <p className="text-sm leading-relaxed" style={synthesisBodyMuted}>
              {relation.western_score >= 0.65
                ? `Relationships are central to your conscious experience of life. ${westernTopSource(relation)} — you invest deeply and expect depth in return.`
                : `Partnership matters but does not define you. ${westernTopSource(relation)} — you bring warmth without losing your independence.`}
            </p>
          </div>
        )}
        {energy && (
          <div>
            <p className="mb-1 text-xs font-medium" style={synthesisCream}>Energy & Recovery</p>
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
    <div className={synthesisInnerPanel}>
      <p className={synthesisLabelClass} style={synthesisLabelStyle}>◈ Layer 6 — Confidence Index</p>
      <p className="mt-1 mb-4 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: '"Plus Jakarta Sans",sans-serif' }}>
        How consistently both systems agree on each trait.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {scores.map(s => (
          <div
            key={s.trait}
            className="flex items-center justify-between gap-3 rounded-[10px] border border-white/5 bg-white/[0.02] px-3 py-2"
          >
            <span className="text-xs" style={synthesisCream}>{s.label}</span>
            <AlignmentBadge level={s.alignment} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/5 pt-3 text-[10px]" style={synthesisBodyMuted}>
        <span><span className="text-[#e8b96a]">◆ HIGH</span> — Both systems strongly agree</span>
        <span><span className="text-[rgba(200,135,58,0.7)]">◇ MED</span> — Moderate alignment</span>
        <span><span className="text-white/30">○ LOW</span> — Systems diverge</span>
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

  const topVedic   = [...ta.scores].sort((a, b) => b.vedic_score   - a.vedic_score).slice(0, 5);
  const topWestern = [...ta.scores].sort((a, b) => b.western_score - a.western_score).slice(0, 5);

  return (
    <div className="space-y-5">

      {/* Layer 1 — Unified Summary */}
      {ta.unifiedSummary.length > 0 && (
        <UnifiedSummary summary={ta.unifiedSummary} />
      )}

      {/* Layer 2 — Dual System Breakdown */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SystemCard
          title="◆ Jyotish Layer — Karmic Patterns"
          system="vedic"
          scores={ta.scores}
          dasha={synthesis.currentAntarDasha}
        />
        <SystemCard
          title="◇ Western Layer — Conscious Expression"
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

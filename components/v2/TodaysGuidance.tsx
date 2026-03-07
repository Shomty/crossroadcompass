"use client";
/**
 * components/v2/TodaysGuidance.tsx
 * Premium V2 version — larger quote, refined action block, luxury feel.
 * Wraps the same logic as the v1 version with upgraded visual styling.
 */

import { useState, useEffect } from "react";

interface InsightContent {
  insight?: string;
  action?: string;
  energyTheme?: string;
}
interface InsightProp {
  id: string;
  content: string;
  generatedAt: Date;
  accuracyRating: number | null;
}
interface Props {
  insight: InsightProp | null;
  isPaid: boolean;
}

// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRating({ insightId, initial }: { insightId: string; initial: number | null }) {
  const [rating, setRating] = useState<number>(initial ?? 0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(initial !== null);

  async function handleRate(r: number) {
    if (submitted) return;
    setRating(r); setSubmitted(true);
    try {
      await fetch("/api/insights/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insightId, rating: r }),
      });
    } catch { /* optimistic */ }
  }

  const display = submitted ? rating : (hover || rating);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--v2-faint)" }}>
        Accuracy
      </span>
      <div style={{ display: "flex", gap: 3 }}>
        {[1,2,3,4,5].map(r => (
          <button key={r}
            onClick={() => handleRate(r)}
            onMouseEnter={() => !submitted && setHover(r)}
            onMouseLeave={() => !submitted && setHover(0)}
            style={{
              background: "none", border: "none", padding: "2px 1px", fontSize: 18, lineHeight: 1,
              cursor: submitted ? "default" : "pointer",
              color: display >= r ? "var(--v2-gold)" : "rgba(201,168,76,0.16)",
              transition: "color 0.15s",
            }}
            title={submitted ? `Rated ${rating}/5` : `Rate ${r}`}
            aria-label={`${r} star`}
          >★</button>
        ))}
      </div>
      {submitted && (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8.5, color: "var(--v2-amber)", opacity: 0.55, letterSpacing: "0.1em" }}>Saved</span>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function TodaysGuidanceV2({ insight, isPaid }: Props) {
  const [generated, setGenerated] = useState<InsightProp | null>(insight);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    if (!insight && isPaid) handleGenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/insights/generate", { method: "POST" });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? "Failed"); }
      const data = await res.json();
      setGenerated({ id: data.id ?? "new", content: JSON.stringify(data.insight), generatedAt: new Date(), accuracyRating: null });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  let parsed: InsightContent | null = null;
  if (generated) {
    try { parsed = JSON.parse(generated.content); } catch { /* fall through */ }
  }

  return (
    <>
      {/* Eyebrow */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div className="v2-eyebrow">Today&apos;s Cosmic Guidance · {today}</div>
        {parsed?.energyTheme && (
          <span style={{
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: 2, padding: "3px 10px",
            fontFamily: "'DM Mono', monospace",
            fontSize: 8.5, letterSpacing: "0.16em",
            textTransform: "uppercase" as const,
            color: "var(--v2-amber)", opacity: 0.8,
          }}>{parsed.energyTheme}</span>
        )}
      </div>

      {parsed ? (
        <>
          {/* Quote */}
          {parsed.insight && (
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(20px, 2.3vw, 28px)",
              fontWeight: 400, fontStyle: "italic",
              lineHeight: 1.65, color: "var(--v2-moon)",
              marginBottom: 22, letterSpacing: "0.01em",
            }}>
              &ldquo;{parsed.insight}&rdquo;
            </p>
          )}

          {/* Ornament */}
          <div className="v2-ornament" style={{ marginBottom: 18 }}>✦</div>

          {/* Action focus */}
          {parsed.action && (
            <div style={{
              padding: "12px 16px",
              borderLeft: "2px solid rgba(201,168,76,0.35)",
              background: "rgba(201,168,76,0.04)",
              borderRadius: "0 6px 6px 0",
            }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "var(--v2-amber)", opacity: 0.6, display: "block", marginBottom: 5 }}>
                Today&apos;s Focus
              </span>
              <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 13, color: "var(--v2-bone)", lineHeight: 1.6 }}>
                {parsed.action}
              </span>
            </div>
          )}

          <StarRating insightId={generated!.id} initial={generated!.accuracyRating} />
        </>
      ) : loading ? (
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontStyle: "italic", color: "var(--v2-muted)", lineHeight: 1.7, marginTop: 8 }}>
          Channeling today&apos;s cosmic energy…
        </p>
      ) : isPaid ? (
        <>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontStyle: "italic", color: "var(--v2-muted)", lineHeight: 1.7, marginBottom: 20 }}>
            Your guidance for today awaits…
          </p>
          <button onClick={handleGenerate} style={{
            padding: "10px 24px",
            background: "var(--v2-gold-glow)",
            border: "1px solid var(--v2-border-lit)",
            borderRadius: 3, color: "var(--v2-gold)",
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: 13, cursor: "pointer", letterSpacing: "0.06em",
            transition: "background 0.2s, border-color 0.2s",
          }}>
            ✦ Reveal Today&apos;s Guidance
          </button>
          {error && <p style={{ marginTop: 10, fontSize: 12, color: "rgba(220,80,80,0.8)" }}>{error}</p>}
        </>
      ) : (
        <>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontStyle: "italic", color: "var(--v2-muted)", lineHeight: 1.75, filter: "blur(4px)", userSelect: "none" as const, marginBottom: 20 }}>
            With the stars aligned in your chart, today calls for deep presence and inner clarity as you move with purpose.
          </p>
          <a href="/subscribe" style={{
            display: "inline-block", padding: "9px 22px",
            background: "var(--v2-gold-glow)", border: "1px solid var(--v2-border-lit)",
            borderRadius: 3, color: "var(--v2-gold)", fontSize: 12, textDecoration: "none",
            fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "0.08em",
          }}>Unlock Daily Guidance →</a>
        </>
      )}
    </>
  );
}

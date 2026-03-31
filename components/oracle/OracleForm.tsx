"use client";

/**
 * Crossroads Oracle™ — theme picker + POST /api/oracle/reading + reading display.
 * Styling aligned with Karma Timeline / DashaPeriodCard (Cinzel, Plus Jakarta, DM Mono, glass-card).
 */

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles, Moon, Sun, Compass } from "lucide-react";
import type { OracleReading, OracleTheme } from "@/types/oracle";
import { V4GlassCard } from "@/components/v4/V4GlassCard";

const THEMES: {
  id: OracleTheme;
  icon: string;
  label: string;
  teaser: string;
}[] = [
  {
    id: "IDENTITY",
    icon: "◎",
    label: "Identity",
    teaser: "Who you are becoming in this chapter of life.",
  },
  {
    id: "CAREER",
    icon: "◈",
    label: "Career",
    teaser: "Your work, purpose, and right livelihood now.",
  },
  {
    id: "LOVE",
    icon: "♡",
    label: "Love",
    teaser: "Patterns in connection you are ready to examine.",
  },
  {
    id: "FEAR",
    icon: "◌",
    label: "Fear",
    teaser: "What your fear is protecting and what releases it.",
  },
  {
    id: "LOSS",
    icon: "✦",
    label: "Loss",
    teaser: "What this loss is making room for.",
  },
];

const cardShell: React.CSSProperties = {
  borderRadius: 14,
  background: "rgba(13,18,32,0.45)",
  border: "1px solid rgba(255,255,255,0.05)",
};

const cardShellSelected: React.CSSProperties = {
  ...cardShell,
  border: "1px solid rgba(200,135,58,0.35)",
  background: "linear-gradient(135deg, rgba(200,135,58,0.06) 0%, rgba(13,18,32,0.55) 100%)",
};

const iconGold: React.CSSProperties = { color: "var(--gold-solar, #D4AF37)" };

const primaryCta: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  width: "100%",
  padding: "12px 20px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontSize: 13,
  fontWeight: 600,
  background: "linear-gradient(135deg, #c8873a, #e8b96a)",
  color: "#0d1220",
};

interface Props {
  displayName: string;
  birthPlace: string;
}

export function OracleForm({ displayName, birthPlace }: Props) {
  const [theme, setTheme] = useState<OracleTheme | null>(null);
  const [reading, setReading] = useState<OracleReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReading = useCallback(
    async (force: boolean) => {
      if (!theme) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/oracle/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme, force }),
        });
        const data = (await res.json()) as { reading?: OracleReading; error?: string };
        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          return;
        }
        if (data.reading) setReading(data.reading);
      } catch {
        setError("Network error. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [theme]
  );

  return (
    <V4GlassCard className="oracle-crossroads">
      <div className="flex flex-col gap-3">
        <p className="page-eyebrow text-center">Crossroads Oracle™</p>
        <h2
          className="text-center text-[clamp(1.15rem,2.2vw,1.5rem)] font-normal leading-snug"
          style={{
            fontFamily: "Cinzel, serif",
            color: "var(--cream, rgba(255,255,255,0.9))",
          }}
        >
          What area of life is weighing on you?
        </h2>
        <p
          className="page-subtitle mx-auto max-w-xl text-center"
          style={{ fontSize: "0.875rem" }}
        >
          Hi {displayName.split(" ")[0]}. Select a theme and receive a reading grounded in your current
          Dasha timing and today&apos;s transits.
          {birthPlace ? ` (${birthPlace})` : null}
        </p>

        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-5">
          {THEMES.map((t) => {
            const selected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setReading(null);
                  setError(null);
                }}
                className="flex flex-col items-center p-4 text-center transition-[border-color,background] duration-200"
                style={selected ? cardShellSelected : cardShell}
              >
                <span
                  className="mb-2 text-2xl"
                  style={{ color: "var(--cream, rgba(255,255,255,0.85))" }}
                >
                  {t.icon}
                </span>
                <span
                  className="mb-1 text-sm font-normal"
                  style={{
                    fontFamily: "Cinzel, serif",
                    color: "var(--cream, rgba(255,255,255,0.9))",
                  }}
                >
                  {t.label}
                </span>
                <span
                  className="text-xs leading-snug"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    color: "var(--mist, rgba(255,255,255,0.55))",
                  }}
                >
                  {t.teaser}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!theme || loading}
          onClick={() => requestReading(false)}
          style={{
            ...primaryCta,
            opacity: !theme || loading ? 0.45 : 1,
            cursor: !theme || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Receive your reading
        </button>

        {error && (
          <p className="text-center text-sm text-red-300/90" role="alert">
            {error}
          </p>
        )}

        {reading && (
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex justify-center">
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--gold-solar, #D4AF37)",
                  background: "rgba(212, 175, 95, 0.12)",
                  padding: "3px 9px",
                  borderRadius: 20,
                  border: "1px solid rgba(212, 175, 95, 0.25)",
                }}
              >
                {reading.dashaLabel}
              </span>
            </div>

            <OracleSection
              delayIndex={0}
              title="Cosmic context"
              body={reading.cosmicContext}
              icon={<Compass className="h-4 w-4 shrink-0" style={iconGold} />}
            />
            <OracleSection
              delayIndex={1}
              title="Psychological pattern"
              body={reading.psychologicalPattern}
              icon={<Moon className="h-4 w-4 shrink-0" style={iconGold} />}
            />
            <OracleSection
              delayIndex={2}
              title="Why now"
              body={reading.whyNow}
              icon={<Sun className="h-4 w-4 shrink-0" style={iconGold} />}
            />

            <div
              className="animate-enter"
              style={{ ...cardShell, padding: "14px 20px", animationDelay: "0.15s" }}
            >
              <h3
                className="mb-3 flex items-center gap-2 text-base font-normal"
                style={{
                  fontFamily: "Cinzel, serif",
                  color: "var(--cream, rgba(255,255,255,0.9))",
                }}
              >
                <Sparkles className="h-4 w-4 shrink-0" style={iconGold} />
                Three steps forward
              </h3>
              <ol className="flex flex-col gap-2.5">
                {reading.concreteSteps.map((step, i) => (
                  <li
                    key={i}
                    className="flex gap-3"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                      fontSize: 12,
                      lineHeight: 1.55,
                      color: "var(--mist, rgba(255,255,255,0.55))",
                    }}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px]"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        background: "rgba(200, 135, 58, 0.15)",
                        color: "var(--gold-solar, #D4AF37)",
                        border: "1px solid rgba(200, 135, 58, 0.22)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p
              className="text-center text-xs"
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                color: "var(--mist, rgba(255,255,255,0.45))",
                lineHeight: 1.6,
              }}
            >
              For your complete Life Blueprint™ — combining your natal chart, HD Bodygraph, and life areas —{" "}
              <Link
                href="/life-blueprint"
                className="text-[color:var(--cream,rgba(255,255,255,0.78))] underline decoration-white/25 underline-offset-2 hover:opacity-90"
              >
                see your full report
              </Link>
              .
            </p>

            <div className="text-center">
              <button
                type="button"
                disabled={loading}
                onClick={() => requestReading(true)}
                className="text-xs underline decoration-white/20 underline-offset-2 disabled:opacity-50"
                style={{
                  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                  color: "var(--mist, rgba(255,255,255,0.45))",
                  background: "none",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Regenerate reading
              </button>
            </div>
          </div>
        )}
      </div>
    </V4GlassCard>
  );
}

function OracleSection({
  title,
  body,
  icon,
  delayIndex,
}: {
  title: string;
  body: string;
  icon: ReactNode;
  delayIndex: number;
}) {
  return (
    <div
      className="animate-enter"
      style={{
        ...cardShell,
        padding: "14px 20px",
        animationDelay: `${delayIndex * 0.05}s`,
      }}
    >
      <h3
        className="mb-2 flex items-center gap-2 text-base font-normal"
        style={{
          fontFamily: "Cinzel, serif",
          color: "var(--cream, rgba(255,255,255,0.9))",
        }}
      >
        {icon}
        {title}
      </h3>
      <p
        style={{
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          fontSize: 13,
          lineHeight: 1.65,
          color: "var(--mist, rgba(255,255,255,0.55))",
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}

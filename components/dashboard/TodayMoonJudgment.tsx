"use client";

/**
 * Today's Moon — Gemini interpretation from Jyotish facts (KV-cached), with deterministic fallback.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { formatLocalCalendarDateYmd } from "@/lib/astro/dailyMoonJudgment";

interface Props {
  natalMoonLine: string | null;
  transitMoonLine: string | null;
  headline: string;
  body: string;
  daytimeFocus: string;
  caution: string;
  toneTags: string[];
  source: "ai" | "deterministic";
  phaseEnergy: string;
  houseFromChandra: number;
  timeZone: string;
  transitDateYmd: string;
  transitDateLabel: string;
}

export function TodayMoonJudgment({
  natalMoonLine,
  transitMoonLine,
  headline,
  body,
  daytimeFocus,
  caution,
  toneTags,
  source,
  phaseEnergy,
  houseFromChandra,
  timeZone,
  transitDateYmd,
  transitDateLabel,
}: Props) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const ymdRef = useRef(transitDateYmd);
  ymdRef.current = transitDateYmd;

  const checkNewLocalDay = useCallback(() => {
    const nowYmd = formatLocalCalendarDateYmd(timeZone);
    if (nowYmd !== ymdRef.current) {
      router.refresh();
    }
  }, [router, timeZone]);

  useEffect(() => {
    const id = setInterval(checkNewLocalDay, 60_000);
    return () => clearInterval(id);
  }, [checkNewLocalDay]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        checkNewLocalDay();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [checkNewLocalDay]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/user/today-transit-cache", { method: "POST" });
      if (!res.ok) {
        return;
      }
      router.refresh();
    } finally {
      setRefreshing(false);
    }
  }, [router]);

  const mono: CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: "var(--type-label)",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "var(--gold)",
    opacity: 0.75,
  };
  const sans: CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  };
  const serif: CSSProperties = { fontFamily: "Cinzel, serif" };

  return (
    <div className="glass-card" style={{ height: "100%" }}>
      <div
        style={{
          marginBottom: 14,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span style={mono}>Today&apos;s Moon · From your chart</span>
          <div
            style={{
              ...sans,
              marginTop: 6,
              fontSize: 11,
              letterSpacing: "0.04em",
              color: "rgba(200,190,170,0.5)",
            }}
          >
            For {transitDateLabel} · updates when your local day changes
            {source === "ai" ? " · AI interpretation" : ""}
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh today's Moon from current sky data"
          title="Refresh today's Moon"
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 3,
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--gold)",
            cursor: refreshing ? "wait" : "pointer",
            opacity: refreshing ? 0.55 : 1,
          }}
        >
          <RefreshCw size={16} style={{ display: "block" }} />
        </button>
      </div>

      {(natalMoonLine || transitMoonLine) && (
        <div
          style={{
            ...sans,
            fontSize: 12,
            color: "rgba(200,190,170,0.82)",
            lineHeight: 1.6,
            marginBottom: 16,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {natalMoonLine && (
            <div>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.14em" }}>
                NATAL ☽
              </span>
              <br />
              {natalMoonLine}
            </div>
          )}
          {transitMoonLine && (
            <div>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.14em" }}>
                SKY TODAY ☽
              </span>
              <br />
              {transitMoonLine}
            </div>
          )}
        </div>
      )}

      <h3
        style={{
          ...serif,
          fontSize: "1.05rem",
          fontWeight: 400,
          color: "rgba(240,228,200,0.95)",
          letterSpacing: "0.03em",
          lineHeight: 1.35,
          margin: "0 0 12px",
        }}
      >
        {headline}
      </h3>

      <p
        style={{
          ...sans,
          fontSize: 13,
          color: "var(--text-secondary, rgba(255,255,255,0.62))",
          lineHeight: 1.65,
          margin: "0 0 12px",
        }}
      >
        {body}
      </p>

      {(daytimeFocus || caution) && (
        <div
          style={{
            ...sans,
            fontSize: 12,
            color: "rgba(200,190,170,0.78)",
            lineHeight: 1.6,
            marginBottom: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {daytimeFocus ? (
            <div>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.12em" }}>
                LEAN IN
              </span>
              <br />
              {daytimeFocus}
            </div>
          ) : null}
          {caution ? (
            <div>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.12em" }}>
                PACE
              </span>
              <br />
              {caution}
            </div>
          ) : null}
        </div>
      )}

      {toneTags.length > 0 && (
        <div
          style={{
            ...sans,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 12,
          }}
        >
          {toneTags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "4px 8px",
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(200,190,170,0.75)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: "1px solid var(--border)",
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)",
        }}
      >
        Phase energy · {phaseEnergy} · House {houseFromChandra} from Chandra
      </div>
    </div>
  );
}

"use client";

/**
 * Personalized Vedic Muhurta (transit × natal) — same shell as MuhurtaFinder,
 * data from /api/muhurta/personalized.
 */

import { useCallback, useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { WeekTimeline } from "./WeekTimeline";
import { IntentionFilter } from "./IntentionFilter";
import { GlimpseCTA } from "@/components/glimpse";
import type { IntentionCategory, TimingWindow } from "@/lib/astro/muhurtaService";
import type {
  PersonalizedMuhurtaResponse,
  PersonalizedMuhurtaWindow,
} from "@/types";

function uiIntentionToQuery(i: IntentionCategory): string {
  if (i === "general") return "all";
  return i;
}

function personalizedWindowToTiming(
  pw: PersonalizedMuhurtaWindow,
  timeZone: string
): TimingWindow {
  const start = new Date(pw.startTime);
  const end = new Date(pw.endTime);
  const date = formatInTimeZone(start, timeZone, "yyyy-MM-dd");
  const dayOfWeek = formatInTimeZone(start, timeZone, "EEEE");
  const quality: TimingWindow["quality"] =
    pw.color === "green" ? "excellent" : pw.color === "amber" ? "good" : "moderate";

  const reasoning: string[] = [];
  if (pw.warningLabel) reasoning.push(pw.warningLabel);
  reasoning.push(
    `Functional: ${pw.scoreBreakdown.functionalNature} · Avastha: ${pw.scoreBreakdown.avasthaState} · Rekhas: ${pw.scoreBreakdown.ashtakavargaRekhas} · Dasha Δ: ${pw.scoreBreakdown.dashaModifier}`
  );

  return {
    date,
    dayOfWeek,
    startTime: formatInTimeZone(start, timeZone, "HH:mm"),
    endTime: formatInTimeZone(end, timeZone, "HH:mm"),
    quality,
    planetaryHour: `${pw.planet} (transit)`,
    tithi: `Total score ${pw.scoreBreakdown.totalScore}`,
    nakshatra: `House ${pw.houseFromLagna} · ${pw.houseDomain}`,
    reasoning,
    hdAlignment: "",
    timelineKey: pw.id,
  };
}

interface Props {
  timeZone: string;
  isPremium: boolean;
}

export function NewMuhurtaFinder({ timeZone, isPremium }: Props) {
  const [intention, setIntention] = useState<IntentionCategory>("general");
  const [data, setData] = useState<PersonalizedMuhurtaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(
    async (intent: IntentionCategory) => {
      setLoading(true);
      setErr(null);
      try {
        const q = uiIntentionToQuery(intent);
        const res = await fetch(`/api/muhurta/personalized?intention=${encodeURIComponent(q)}`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setErr((j as { error?: string }).error ?? "Failed to load");
          setData(null);
          return;
        }
        const json = (await res.json()) as PersonalizedMuhurtaResponse;
        setData(json);
      } catch {
        setErr("Network error");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void load("general");
  }, [load]);

  const handleIntentionChange = async (next: IntentionCategory) => {
    if (next === intention || loading) return;
    setIntention(next);
    await load(next);
  };

  const timingWindows: TimingWindow[] =
    data?.windows.map((w) => personalizedWindowToTiming(w, timeZone)) ?? [];

  const narratives = data?.windows.map((w) => {
    const tw = personalizedWindowToTiming(w, timeZone);
    return {
      date: tw.date,
      timeRange: `${tw.startTime} - ${tw.endTime}`,
      timelineKey: w.id,
      narrative: [
        `${w.planet} transiting sign ${w.transitSignNumber} from your Lagna (house ${w.houseFromLagna}).`,
        w.warningLabel ?? "",
      ]
        .filter(Boolean)
        .join(" "),
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section
        className="animate-enter"
        style={{
          background: "rgba(13,18,32,0.5)",
          border: "1px solid rgba(200,135,58,0.12)",
          borderRadius: 14,
          padding: "1.25rem",
        }}
      >
        <h3
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 15,
            fontWeight: 400,
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 14px",
          }}
        >
          What are you planning? (personalized transits)
        </h3>
        <IntentionFilter
          selected={intention}
          onChange={handleIntentionChange}
          disabled={loading}
        />
      </section>

      {data?.dashaContext && (
        <section
          className="animate-enter animate-enter-2"
          style={{
            background: "rgba(200,135,58,0.06)",
            border: "1px solid rgba(200,135,58,0.12)",
            borderRadius: 12,
            padding: "1rem",
          }}
        >
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.75)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#e8b96a" }}>Dasha backdrop:</strong>{" "}
            {data.dashaContext.mahadashaLord} Mahadasha / {data.dashaContext.antardashaLord}{" "}
            Antardasha (score modifier {data.dashaContext.modifierApplied >= 0 ? "+" : ""}
            {data.dashaContext.modifierApplied}).
          </p>
        </section>
      )}

      {err && (
        <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{err}</p>
      )}

      {loading && (
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>Computing windows…</p>
      )}

      {!loading && !err && timingWindows.length === 0 && (
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
          No windows for this filter in the next two weeks. Try &quot;General&quot; or another
          intention.
        </p>
      )}

      {!loading && timingWindows.length > 0 && (
        <section className="animate-enter animate-enter-3">
          <h3
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 16,
              fontWeight: 400,
              color: "rgba(255,255,255,0.9)",
              margin: "0 0 20px",
            }}
          >
            Transit windows (sign-based)
          </h3>
          <WeekTimeline windows={timingWindows} narratives={narratives} />
        </section>
      )}

      {!isPremium && (
        <section
          className="animate-enter animate-enter-4"
          style={{
            background: "rgba(13,18,32,0.4)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 14,
            padding: "1.25rem",
          }}
        >
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.55)",
              margin: "0 0 12px",
            }}
          >
            Free plan shows the top 3 scored windows only. Core/VIP unlock the full range + KV
            caching.
          </p>
          <GlimpseCTA
            text="Unlock full personalized Muhurta"
            variant="primary"
            featureName="muhurta_personalized_free"
            href="/subscribe"
          />
        </section>
      )}
    </div>
  );
}

"use client";
// STATUS: done | Muhurta Week Timeline UI
/**
 * components/muhurta/WeekTimeline.tsx
 * Full Monday-to-Sunday timeline showing all time slots color-coded by quality.
 * Clicking a slot pill expands an inline detail strip.
 */

import { useState } from "react";
import type { TimingWindow } from "@/lib/astro/muhurtaService";

interface AINarrative {
  date: string;
  timeRange: string;
  narrative: string;
}

interface WeekTimelineProps {
  windows: TimingWindow[];
  /** AI-curated narratives keyed by date+time, merged from insight.topWindows */
  narratives?: AINarrative[];
  /** Label shown above the timeline, e.g. "This Week" */
  label?: string;
}

const QUALITY = {
  excellent: {
    bg: "rgba(232,185,106,0.2)",
    border: "#e8b96a",
    text: "#e8b96a",
    dot: "●",
    label: "Excellent",
  },
  good: {
    bg: "rgba(200,135,58,0.12)",
    border: "#c8873a",
    text: "#c8873a",
    dot: "◈",
    label: "Good",
  },
  moderate: {
    bg: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.08)",
    text: "rgba(255,255,255,0.25)",
    dot: "○",
    label: "Moderate",
  },
};

const DAY_RULERS: Record<string, { planet: string; glyph: string }> = {
  Monday:    { planet: "Moon",    glyph: "☽" },
  Tuesday:   { planet: "Mars",    glyph: "♂" },
  Wednesday: { planet: "Mercury", glyph: "☿" },
  Thursday:  { planet: "Jupiter", glyph: "♃" },
  Friday:    { planet: "Venus",   glyph: "♀" },
  Saturday:  { planet: "Saturn",  glyph: "♄" },
  Sunday:    { planet: "Sun",     glyph: "☉" },
};

function groupByDate(windows: TimingWindow[]): Record<string, TimingWindow[]> {
  const groups: Record<string, TimingWindow[]> = {};
  for (const w of windows) {
    if (!groups[w.date]) groups[w.date] = [];
    groups[w.date].push(w);
  }
  return groups;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function isToday(dateStr: string): boolean {
  return new Date().toISOString().split("T")[0] === dateStr;
}

function isPast(dateStr: string): boolean {
  return dateStr < new Date().toISOString().split("T")[0];
}

export function WeekTimeline({ windows, narratives = [], label }: WeekTimelineProps) {
  const [expanded, setExpanded] = useState<string | null>(null); // "date|startTime"

  const grouped = groupByDate(windows);
  const dates = Object.keys(grouped).sort();

  const narrativeMap: Record<string, string> = {};
  for (const n of narratives) {
    // Match by date; timeRange from AI is "HH:00 - HH:00", startTime is "HH:00"
    const startTime = n.timeRange.split(" - ")[0]?.trim();
    if (startTime) narrativeMap[`${n.date}|${startTime}`] = n.narrative;
  }

  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {label && (
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "rgba(200,135,58,0.7)",
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 16,
          }}
        >
          {label}
        </div>
      )}

      {dates.map((date, dayIdx) => {
        const slots = grouped[date];
        const today = isToday(date);
        const past = isPast(date);
        const dayName = slots[0]?.dayOfWeek ?? "";
        const ruler = DAY_RULERS[dayName];

        return (
          <div
            key={date}
            style={{
              borderLeft: today
                ? "2px solid #e8b96a"
                : "2px solid rgba(200,135,58,0.08)",
              marginLeft: 0,
              paddingLeft: 16,
              paddingBottom: dayIdx < dates.length - 1 ? 20 : 0,
              paddingTop: 4,
              opacity: past && !today ? 0.45 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {/* Day header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 14,
                  fontWeight: 400,
                  color: today ? "#e8b96a" : "rgba(255,255,255,0.8)",
                  minWidth: 90,
                }}
              >
                {dayName}
              </span>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {formatDate(date)}
              </span>
              {ruler && (
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: "rgba(200,135,58,0.5)",
                  }}
                >
                  {ruler.glyph} {ruler.planet}
                </span>
              )}
              {today && (
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    color: "#0d1220",
                    background: "#e8b96a",
                    borderRadius: 10,
                    padding: "2px 8px",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Today
                </span>
              )}
            </div>

            {/* Slot pills */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {slots.map((slot) => {
                const key = `${slot.date}|${slot.startTime}`;
                const q = QUALITY[slot.quality];
                const isExpanded = expanded === key;
                const hasNarrative = !!narrativeMap[key];

                return (
                  <div key={key} style={{ display: "contents" }}>
                    <button
                      onClick={() => toggle(key)}
                      title={`${slot.startTime} — ${q.label} · ${slot.planetaryHour} hour`}
                      style={{
                        display: "inline-flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 3,
                        padding: "6px 10px",
                        borderRadius: 10,
                        border: `1px solid ${isExpanded ? q.border : q.border}`,
                        background: isExpanded ? q.bg : "transparent",
                        cursor: "pointer",
                        transition: "background 0.15s, transform 0.1s",
                        outline: "none",
                        minWidth: 56,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 10,
                          color: q.text,
                          letterSpacing: 0.5,
                        }}
                      >
                        {slot.startTime}
                      </span>
                      <span style={{ fontSize: 10, color: q.text }}>
                        {q.dot}
                        {hasNarrative && " ✦"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Expanded detail — shows for any expanded slot in this day */}
            {slots.map((slot) => {
              const key = `${slot.date}|${slot.startTime}`;
              if (expanded !== key) return null;
              const q = QUALITY[slot.quality];
              const narrative = narrativeMap[key];

              return (
                <div
                  key={`detail-${key}`}
                  style={{
                    marginTop: 10,
                    background: "rgba(13,18,32,0.6)",
                    border: `1px solid ${q.border}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 13,
                        color: q.text,
                        fontWeight: 500,
                      }}
                    >
                      {slot.startTime} – {slot.endTime}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 10,
                        color: q.text,
                        padding: "2px 8px",
                        borderRadius: 8,
                        background: q.bg,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {q.dot} {q.label}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div>
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 9,
                          color: "rgba(200,135,58,0.6)",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Planetary Hour
                      </span>
                      <p
                        style={{
                          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                          fontSize: 13,
                          color: "rgba(255,255,255,0.8)",
                          margin: "3px 0 0",
                        }}
                      >
                        {slot.planetaryHour}
                      </p>
                    </div>
                    <div>
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 9,
                          color: "rgba(200,135,58,0.6)",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Nakshatra
                      </span>
                      <p
                        style={{
                          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                          fontSize: 13,
                          color: "rgba(255,255,255,0.8)",
                          margin: "3px 0 0",
                        }}
                      >
                        {slot.nakshatra}
                      </p>
                    </div>
                    <div>
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 9,
                          color: "rgba(200,135,58,0.6)",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Tithi
                      </span>
                      <p
                        style={{
                          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                          fontSize: 13,
                          color: "rgba(255,255,255,0.8)",
                          margin: "3px 0 0",
                        }}
                      >
                        {slot.tithi}
                      </p>
                    </div>
                  </div>

                  {narrative && (
                    <p
                      style={{
                        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                        fontSize: 13,
                        color: "rgba(255,255,255,0.7)",
                        lineHeight: 1.65,
                        margin: 0,
                        paddingTop: 8,
                        borderTop: "1px solid rgba(200,135,58,0.1)",
                      }}
                    >
                      {narrative}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

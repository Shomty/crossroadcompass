"use client";

import { useState } from "react";

interface Props {
  /** YYYY-MM-DD UTC date string matching Insight.periodDate */
  dateStr: string;
  initial: "positive" | "negative" | null;
}

export function DailyInsightFeedback({ dateStr, initial }: Props) {
  const [v, setV] = useState<"positive" | "negative" | null>(initial);
  const [saving, setSaving] = useState(false);

  async function send(feedback: "positive" | "negative") {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/insights/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, feedback }),
      });
      if (res.ok) setV(feedback);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" as const }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--type-label)", letterSpacing: "0.14em", color: "var(--mist)" }}>
        Helpful?
      </span>
      <button
        type="button"
        disabled={saving}
        onClick={() => void send("positive")}
        style={{
          border: v === "positive" ? "1px solid rgba(74,222,128,0.6)" : "1px solid rgba(255,255,255,0.12)",
          background: v === "positive" ? "rgba(74,222,128,0.12)" : "transparent",
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: 12,
          cursor: saving ? "default" : "pointer",
          color: v === "positive" ? "#86efac" : "var(--mist)",
        }}
      >
        👍 Yes
      </button>
      <button
        type="button"
        disabled={saving}
        onClick={() => void send("negative")}
        style={{
          border: v === "negative" ? "1px solid rgba(248,113,113,0.5)" : "1px solid rgba(255,255,255,0.12)",
          background: v === "negative" ? "rgba(248,113,113,0.1)" : "transparent",
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: 12,
          cursor: saving ? "default" : "pointer",
          color: v === "negative" ? "#fca5a5" : "var(--mist)",
        }}
      >
        👎 Not quite
      </button>
    </div>
  );
}

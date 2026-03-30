"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { REPORT_VARIABLE_KEYS_AP5 } from "@/lib/content/reportVariableKeysAp5";

const GROUPS: { title: string; keys: readonly string[] }[] = [
  {
    title: "Vedic chart",
    keys: REPORT_VARIABLE_KEYS_AP5.filter((k) =>
      /^(lagna|sun_|moon_|mars_|mercury_|jupiter_|venus_|saturn_|rahu_|ketu_)/.test(k)
    ),
  },
  {
    title: "Dasha",
    keys: REPORT_VARIABLE_KEYS_AP5.filter((k) =>
      /mahadasha|antardasha|dasha/i.test(k)
    ),
  },
  {
    title: "Special lagnas",
    keys: REPORT_VARIABLE_KEYS_AP5.filter((k) =>
      /^(arudha_|ghati_|bhava_|hora_)/.test(k)
    ),
  },
  {
    title: "Charakarakas",
    keys: REPORT_VARIABLE_KEYS_AP5.filter((k) =>
      /karaka$/.test(k)
    ),
  },
  {
    title: "Human Design",
    keys: REPORT_VARIABLE_KEYS_AP5.filter((k) => k.startsWith("hd_")),
  },
  {
    title: "User",
    keys: REPORT_VARIABLE_KEYS_AP5.filter((k) =>
      ["user_name", "birth_date", "birth_location"].includes(k)
    ),
  },
];

export function MarketReportEditor({ reportId }: { reportId: string }) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");
  const [version, setVersion] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/reports/${reportId}`);
    if (!res.ok) return;
    const j = (await res.json()) as {
      geminiPrompt?: string;
      promptVersion?: number;
      isActive?: boolean;
      name?: string;
    };
    setPrompt(j.geminiPrompt ?? "");
    setVersion(j.promptVersion ?? 1);
    setIsActive(!!j.isActive);
    setName(j.name ?? "");
    setLoading(false);
  }, [reportId]);

  useEffect(() => {
    void load();
  }, [load]);

  function insertToken(key: string) {
    const token = `{{${key}}}`;
    const el = taRef.current;
    if (!el) {
      setPrompt((p) => p + token);
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    const next = el.value.slice(0, start) + token + el.value.slice(end);
    setPrompt(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
    void navigator.clipboard.writeText(token).catch(() => {});
  }

  async function save() {
    setMsg(null);
    const res = await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ geminiPrompt: prompt }),
    });
    const j = (await res.json()) as { promptVersion?: number; error?: string };
    if (!res.ok) {
      setMsg(j.error ?? "Save failed");
      return;
    }
    if (j.promptVersion) setVersion(j.promptVersion);
    setMsg("Saved.");
  }

  async function toggleActive() {
    const res = await fetch(`/api/admin/reports/${reportId}/activate`, {
      method: "POST",
    });
    const j = (await res.json()) as { isActive?: boolean };
    if (res.ok && typeof j.isActive === "boolean") setIsActive(j.isActive);
  }

  async function testRun() {
    setMsg(null);
    const res = await fetch(`/api/admin/reports/${reportId}/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const j = (await res.json()) as { preview?: string; error?: string };
    if (!res.ok) {
      setMsg(j.error ?? "Test failed");
      return;
    }
    setMsg(j.preview ?? "No preview");
  }

  if (loading) {
    return <div style={{ color: "#606880", fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12 }}>Loading…</div>;
  }

  return (
    <div>
      <Link href="/admin/market-reports" style={{ color: "#c8873a", fontSize: 12, textDecoration: "none" }}>
        ← Back
      </Link>
      <h1 style={{ fontFamily: "var(--font-display, 'Cormorant Garamond')", fontSize: 26, color: "#e8b96a", marginTop: 12, fontWeight: 400 }}>
        {name}
      </h1>
      <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880", marginBottom: 16 }}>
        Prompt v{version} · {isActive ? "Active" : "Draft"}
        <button
          type="button"
          onClick={() => void toggleActive()}
          style={{ marginLeft: 16, fontSize: 10, padding: "4px 10px", background: "rgba(200,135,58,0.15)", border: "1px solid rgba(200,135,58,0.35)", borderRadius: 4, color: "#e8b96a", cursor: "pointer" }}
        >
          Toggle active
        </button>
        <button
          type="button"
          onClick={() => void save()}
          style={{ marginLeft: 8, fontSize: 10, padding: "4px 10px", background: "rgba(128,212,160,0.12)", border: "1px solid rgba(128,212,160,0.35)", borderRadius: 4, color: "#80D4A0", cursor: "pointer" }}
        >
          Save prompt
        </button>
        <button
          type="button"
          onClick={() => void testRun()}
          style={{ marginLeft: 8, fontSize: 10, padding: "4px 10px", background: "rgba(100,149,237,0.12)", border: "1px solid rgba(100,149,237,0.35)", borderRadius: 4, color: "#a8c0ff", cursor: "pointer" }}
        >
          Test run
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <textarea
          ref={taRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{
            flex: "1 1 55%",
            minHeight: 480,
            minWidth: 280,
            fontFamily: "ui-monospace, monospace",
            fontSize: 12,
            lineHeight: 1.5,
            background: "rgba(13,18,32,0.9)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 8,
            color: "#c8d0e8",
            padding: 12,
          }}
        />
        <div
          style={{
            flex: "1 1 35%",
            maxHeight: 520,
            overflowY: "auto",
            background: "rgba(28,35,64,0.35)",
            border: "1px solid rgba(200,135,58,0.12)",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", marginBottom: 10 }}>
            VARIABLES (click to insert)
          </div>
          {GROUPS.map((g) => (
            <div key={g.title} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: "#606880", marginBottom: 6 }}>{g.title}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {g.keys.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => insertToken(k)}
                    style={{
                      fontSize: 9,
                      padding: "3px 6px",
                      background: "rgba(13,18,32,0.9)",
                      border: "1px solid rgba(200,135,58,0.15)",
                      borderRadius: 4,
                      color: "#a0a8c0",
                      cursor: "pointer",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    {`{{${k}}}`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {msg ? (
        <pre style={{ marginTop: 16, padding: 12, background: "rgba(0,0,0,0.25)", borderRadius: 8, color: "#a0a8c0", fontSize: 11, whiteSpace: "pre-wrap" }}>
          {msg}
        </pre>
      ) : null}
    </div>
  );
}

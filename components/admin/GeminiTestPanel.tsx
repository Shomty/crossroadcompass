"use client";
// STATUS: done | Admin Gemini connectivity test

import { useState } from "react";

type PingOk = { ok: true; model: string; durationMs: number; preview?: string };
type PingErr = {
  ok: false;
  model: string;
  durationMs: number;
  preview?: string;
  error?: string;
};

export function GeminiTestPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PingOk | PingErr | null>(null);
  const [httpError, setHttpError] = useState("");

  async function runTest() {
    setLoading(true);
    setResult(null);
    setHttpError("");
    try {
      const res = await fetch("/api/admin/gemini/test", { method: "POST" });
      const data = (await res.json()) as PingOk | PingErr;
      if (!res.ok) {
        setResult(data);
        setHttpError(res.status === 502 ? "" : `HTTP ${res.status}`);
        return;
      }
      setResult(data);
    } catch {
      setHttpError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 32,
        padding: 24,
        borderRadius: 12,
        border: "1px solid rgba(200,135,58,0.25)",
        background: "rgba(0,0,0,0.25)",
        maxWidth: 560,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono, 'DM Mono')",
          fontSize: 10,
          color: "#c8873a",
          letterSpacing: "0.15em",
          marginBottom: 8,
        }}
      >
        GEMINI API
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display, 'Cormorant Garamond')",
          fontSize: 22,
          fontWeight: 400,
          color: "#e8b96a",
          margin: "0 0 8px",
        }}
      >
        Connectivity test
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body, 'Instrument Sans')",
          fontSize: 13,
          color: "#606880",
          margin: "0 0 16px",
          lineHeight: 1.5,
        }}
      >
        Sends a tiny prompt via the same <code style={{ color: "#c8873a" }}>@google/generative-ai</code>{" "}
        stack as report generation (<code style={{ color: "#c8873a" }}>GEMINI_MODEL</code> from env).
      </p>

      <button
        type="button"
        onClick={runTest}
        disabled={loading}
        style={{
          padding: "10px 20px",
          borderRadius: 8,
          border: "1px solid rgba(200,135,58,0.45)",
          background: loading ? "rgba(200,135,58,0.06)" : "rgba(200,135,58,0.15)",
          color: "#e8b96a",
          fontFamily: "var(--font-mono, 'DM Mono')",
          fontSize: 11,
          letterSpacing: "0.08em",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "CALLING GEMINI…" : "RUN TEST"}
      </button>

      {httpError && (
        <p style={{ marginTop: 14, color: "#e07070", fontSize: 13 }}>{httpError}</p>
      )}

      {result && (
        <div style={{ marginTop: 16, fontSize: 13 }}>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#a0a8c0" }}>
            <span style={{ color: result.ok ? "#6ec98a" : "#e07070" }}>
              {result.ok ? "OK" : "FAILED"}
            </span>
            {" · "}
            model <span style={{ color: "#e8b96a" }}>{result.model}</span>
            {" · "}
            {result.durationMs}ms
          </div>
          {result.preview && (
            <div
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 8,
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#c8c0b0",
                fontFamily: "var(--font-mono, 'DM Mono')",
                fontSize: 12,
                wordBreak: "break-word",
              }}
            >
              {result.preview}
            </div>
          )}
          {!result.ok && result.error && (
            <p style={{ marginTop: 10, color: "#e09090", fontSize: 12 }}>{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

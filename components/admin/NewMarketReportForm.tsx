"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewMarketReportForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const j = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(j.error ?? "Failed");
      if (j.id) router.push(`/admin/market-reports/${j.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontFamily: "var(--font-display, 'Cormorant Garamond')", fontSize: 26, color: "#e8b96a", fontWeight: 400 }}>
        New report product
      </h1>
      <form onSubmit={(e) => void submit(e)} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name"
          required
          style={{
            padding: "10px 12px",
            background: "rgba(13,18,32,0.85)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 6,
            color: "#c8d0e8",
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
          }}
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="url-slug"
          required
          style={{
            padding: "10px 12px",
            background: "rgba(13,18,32,0.85)",
            border: "1px solid rgba(200,135,58,0.2)",
            borderRadius: 6,
            color: "#c8d0e8",
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
          }}
        />
        {err ? <div style={{ color: "#E8705A", fontSize: 12 }}>{err}</div> : null}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 16px",
            background: "rgba(200,135,58,0.25)",
            border: "1px solid rgba(200,135,58,0.45)",
            borderRadius: 8,
            color: "#e8b96a",
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          {loading ? "…" : "Create draft"}
        </button>
      </form>
    </div>
  );
}

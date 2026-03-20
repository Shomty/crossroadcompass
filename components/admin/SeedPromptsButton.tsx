"use client";
// STATUS: done | Task Admin-8

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SeedPromptsButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/prompts/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(`Seeded ${data.seeded} prompts successfully.`);
        router.refresh();
      } else {
        alert("Seed failed: " + JSON.stringify(data));
      }
    } catch (err) {
      alert("Seed error: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      style={{
        fontFamily: "var(--font-mono, 'DM Mono')",
        fontSize: 11,
        color: "#e8b96a",
        cursor: loading ? "not-allowed" : "pointer",
        padding: "8px 16px",
        border: "1px solid rgba(232,185,106,0.4)",
        borderRadius: 6,
        background: "rgba(232,185,106,0.08)",
        opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? "Seeding..." : "Seed default prompts"}
    </button>
  );
}

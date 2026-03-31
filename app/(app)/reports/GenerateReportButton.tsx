// STATUS: done | Task R.10
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateReportButton({ purchaseId }: { purchaseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Generation failed");
      }

      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "Generating..." : "Generate Report Now"}
      </button>
      {error && <p className="cc-body text-red-400">{error}</p>}
    </div>
  );
}


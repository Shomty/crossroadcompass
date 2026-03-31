"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Used on the reports list page when purchaseStatus === "PAID".
 * Calls the generate API with reportProductId (current-user self-service path).
 */
export function TriggerGenerateButton({ reportProductId }: { reportProductId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function trigger() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportProductId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Generation failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2">
      <button
        type="button"
        onClick={trigger}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "Starting generation…" : "Generate Now"}
      </button>
      {error && <p className="cc-body text-xs text-red-400">{error}</p>}
    </div>
  );
}

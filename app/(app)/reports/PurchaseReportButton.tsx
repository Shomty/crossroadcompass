// STATUS: done | Task R.9
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PurchaseReportButton({
  reportProductId,
  priceUsdCents,
}: {
  reportProductId: string;
  priceUsdCents?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function purchase() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportProductId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Purchase failed");
      }

      // Auto-trigger generation immediately after purchase so the user
      // never lands in a permanent "Awaiting Generation" state.
      await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportProductId }),
      });

      const purchaseId = data.purchaseId as string | undefined;
      if (!purchaseId) throw new Error("Missing purchaseId in response");
      router.push(`/reports/${purchaseId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Purchase failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2">
      <button
        type="button"
        onClick={purchase}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading
          ? "Creating purchase…"
          : priceUsdCents != null
            ? `Get This Report — $${(priceUsdCents / 100).toFixed(0)}`
            : "Get This Report"}
      </button>
      {error && <p className="cc-body text-red-400">{error}</p>}
    </div>
  );
}


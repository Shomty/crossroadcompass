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
        className="w-full rounded-xl border border-amber-400/40 bg-amber-500/20 px-3 py-2 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading
          ? "Creating purchase..."
          : priceUsdCents != null
            ? `Get This Report — $${(priceUsdCents / 100).toFixed(0)}`
            : "Get This Report"}
      </button>
      {error && <p className="cc-body text-red-400">{error}</p>}
    </div>
  );
}


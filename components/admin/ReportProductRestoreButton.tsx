"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportProductRestoreButton({
  productId,
  title,
}: {
  productId: string;
  title: string;
}) {
  const router = useRouter();
  const [restoring, setRestoring] = useState(false);

  async function onRestore() {
    if (
      !window.confirm(
        `Restore report product “${title}”? It will reappear in the marketplace if active.`
      )
    ) {
      return;
    }
    setRestoring(true);
    try {
      const res = await fetch(
        `/api/admin/report-products/${productId}/restore`,
        { method: "POST" }
      );
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        window.alert(j.error ?? "Restore failed");
        return;
      }
      router.refresh();
    } finally {
      setRestoring(false);
    }
  }

  return (
    <button
      type="button"
      disabled={restoring}
      onClick={() => void onRestore()}
      style={{
        fontFamily: "var(--font-mono, 'DM Mono')",
        fontSize: 11,
        padding: "4px 10px",
        background: "rgba(60,120,90,0.2)",
        border: "1px solid rgba(110,201,138,0.45)",
        borderRadius: 4,
        color: "#6ec98a",
        cursor: restoring ? "wait" : "pointer",
      }}
    >
      Restore
    </button>
  );
}

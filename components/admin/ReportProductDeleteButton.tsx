"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportProductDeleteButton({
  productId,
  title,
  purchaseCount,
}: {
  productId: string;
  title: string;
  purchaseCount: number;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    const purchaseNote =
      purchaseCount > 0
        ? ` ${purchaseCount} existing purchase row${purchaseCount === 1 ? "" : "s"} stay in the database (users keep access).`
        : "";
    if (
      !window.confirm(
        `Soft-delete “${title}”? It will disappear from /reports and new purchases will be blocked.${purchaseNote} You can restore from the catalog later.`
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/report-products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        window.alert(j.error ?? "Delete failed");
        return;
      }
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      disabled={deleting}
      onClick={() => void onDelete()}
      style={{
        fontFamily: "var(--font-mono, 'DM Mono')",
        fontSize: 11,
        padding: "4px 10px",
        background: "rgba(180,60,60,0.15)",
        border: "1px solid rgba(232,112,90,0.45)",
        borderRadius: 4,
        color: "#E8705A",
        cursor: deleting ? "wait" : "pointer",
      }}
    >
      Delete
    </button>
  );
}

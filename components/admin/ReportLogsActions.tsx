"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportLogsActions({
  reportRowId,
  contentPreview,
}: {
  reportRowId: string;
  contentPreview: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function regenerate() {
    setLoading(true);
    try {
      await fetch(`/api/admin/report-logs/${reportRowId}/regenerate`, {
        method: "POST",
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function deleteReport() {
    if (
      !window.confirm(
        "Delete this report and its purchase record? The user will need to buy again to get a new copy."
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/report-logs/${reportRowId}`, {
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
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          fontSize: 10,
          padding: "4px 8px",
          background: "rgba(13,18,32,0.9)",
          border: "1px solid rgba(200,135,58,0.25)",
          borderRadius: 4,
          color: "#e8b96a",
          cursor: "pointer",
        }}
      >
        View
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => void regenerate()}
        style={{
          fontSize: 10,
          padding: "4px 8px",
          background: "rgba(200,135,58,0.12)",
          border: "1px solid rgba(200,135,58,0.35)",
          borderRadius: 4,
          color: "#c8873a",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        Regenerate
      </button>
      <button
        type="button"
        disabled={deleting}
        onClick={() => void deleteReport()}
        style={{
          fontSize: 10,
          padding: "4px 8px",
          background: "rgba(180,60,60,0.15)",
          border: "1px solid rgba(232,112,90,0.45)",
          borderRadius: 4,
          color: "#E8705A",
          cursor: deleting ? "wait" : "pointer",
        }}
      >
        Delete
      </button>
      {open ? (
        <div
          role="dialog"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0d1220",
              border: "1px solid rgba(200,135,58,0.35)",
              borderRadius: 12,
              maxWidth: 720,
              maxHeight: "80vh",
              overflow: "auto",
              padding: 20,
            }}
          >
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, color: "#c8d0e8", margin: 0 }}>
              {contentPreview || "(empty)"}
            </pre>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ marginTop: 16, fontSize: 11, color: "#e8b96a", background: "transparent", border: "1px solid rgba(200,135,58,0.4)", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

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

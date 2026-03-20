"use client";
// STATUS: done | Task Admin-7

import { useState, useCallback } from "react";

interface ReviewItem {
  id: string;
  type: string;
  content: string;
  generatedAt: string;
  partialEmail: string;
  hdType: string | null;
}

interface Props {
  initialItems: ReviewItem[];
}

export function ReviewQueue({ initialItems }: Props) {
  const [items, setItems] = useState<ReviewItem[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const postAction = async (
    id: string,
    action: "approve" | "reject" | "edit_approve",
    content?: string
  ) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/review/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...(content ? { editedContent: content } : {}) }),
      });
      if (!res.ok) throw new Error("Request failed");
      removeItem(id);
    } catch {
      alert("Action failed. Please try again.");
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (items.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "#606880",
        fontFamily: "var(--font-mono, 'DM Mono')",
        fontSize: 13,
      }}>
        No insights pending review ✓
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map((item) => {
        const isEditing = editingId === item.id;
        const isLoading = loading[item.id];
        const currentContent = editedContent[item.id] ?? item.content;

        return (
          <div
            key={item.id}
            style={{
              background: "rgba(28,35,64,0.6)",
              border: "1px solid rgba(200,135,58,0.15)",
              borderRadius: 8,
              padding: 20,
            }}
          >
            {/* Header row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{
                fontFamily: "var(--font-mono, 'DM Mono')",
                fontSize: 11,
                color: "#606880",
              }}>
                {item.partialEmail}
              </span>
              {item.hdType && (
                <span style={{
                  fontFamily: "var(--font-mono, 'DM Mono')",
                  fontSize: 10,
                  color: "#c8873a",
                  background: "rgba(200,135,58,0.1)",
                  border: "1px solid rgba(200,135,58,0.3)",
                  borderRadius: 4,
                  padding: "2px 8px",
                }}>
                  {item.hdType}
                </span>
              )}
              <span style={{
                fontFamily: "var(--font-mono, 'DM Mono')",
                fontSize: 10,
                color: "#e8b96a",
                background: "rgba(232,185,106,0.08)",
                border: "1px solid rgba(232,185,106,0.2)",
                borderRadius: 4,
                padding: "2px 8px",
              }}>
                {item.type}
              </span>
              <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#404860", marginLeft: "auto" }}>
                {new Date(item.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* Content textarea */}
            <textarea
              value={currentContent}
              onChange={(e) => setEditedContent((prev) => ({ ...prev, [item.id]: e.target.value }))}
              readOnly={!isEditing}
              rows={6}
              style={{
                width: "100%",
                background: isEditing ? "rgba(13,18,32,0.8)" : "rgba(13,18,32,0.4)",
                border: `1px solid ${isEditing ? "rgba(200,135,58,0.4)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 6,
                color: "#c8d0e8",
                fontFamily: "var(--font-mono, 'DM Mono')",
                fontSize: 12,
                lineHeight: 1.6,
                padding: "12px",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                disabled={isLoading}
                onClick={() => postAction(item.id, "approve")}
                style={{
                  fontFamily: "var(--font-mono, 'DM Mono')",
                  fontSize: 11,
                  padding: "8px 16px",
                  background: "rgba(200,135,58,0.15)",
                  border: "1px solid rgba(200,135,58,0.5)",
                  borderRadius: 6,
                  color: "#e8b96a",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                }}
              >
                Approve
              </button>

              {!isEditing ? (
                <button
                  disabled={isLoading}
                  onClick={() => setEditingId(item.id)}
                  style={{
                    fontFamily: "var(--font-mono, 'DM Mono')",
                    fontSize: 11,
                    padding: "8px 16px",
                    background: "rgba(232,185,106,0.08)",
                    border: "1px solid rgba(232,185,106,0.3)",
                    borderRadius: 6,
                    color: "#f0dca0",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                  }}
                >
                  Edit + Approve
                </button>
              ) : (
                <button
                  disabled={isLoading}
                  onClick={() => postAction(item.id, "edit_approve", editedContent[item.id])}
                  style={{
                    fontFamily: "var(--font-mono, 'DM Mono')",
                    fontSize: 11,
                    padding: "8px 16px",
                    background: "rgba(232,185,106,0.2)",
                    border: "1px solid rgba(232,185,106,0.6)",
                    borderRadius: 6,
                    color: "#f0dca0",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                  }}
                >
                  Save + Approve
                </button>
              )}

              <button
                disabled={isLoading}
                onClick={() => postAction(item.id, "reject")}
                style={{
                  fontFamily: "var(--font-mono, 'DM Mono')",
                  fontSize: 11,
                  padding: "8px 16px",
                  background: "rgba(232,112,90,0.08)",
                  border: "1px solid rgba(232,112,90,0.3)",
                  borderRadius: 6,
                  color: "#E8705A",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  marginLeft: "auto",
                }}
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

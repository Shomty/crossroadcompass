"use client";
// STATUS: done | Task Admin-13

import { useState } from "react";

interface AuditEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  actionType: string;
  targetId: string | null;
  targetType: string | null;
  before: string | null;
  after: string | null;
  notes: string | null;
}

interface Props {
  logs: AuditEntry[];
  nextCursor: string | null;
}

const ACTION_COLORS: Record<string, string> = {
  INSIGHT_APPROVED: "#80D4A0",
  INSIGHT_REJECTED: "#E8705A",
  INSIGHT_EDITED: "#e8b96a",
  PROMPT_SAVED: "#c8873a",
  PROMPT_ROLLED_BACK: "#c8873a",
  USER_TIER_CHANGED: "#e8b96a",
  USER_CHART_INVALIDATED: "#a0a8c0",
  USER_DELETED: "#E8705A",
  CONFIG_CHANGED: "#a0a8c0",
  FEATURE_FLAG_TOGGLED: "#a0a8c0",
  CRON_MANUALLY_TRIGGERED: "#a0a8c0",
};

export function AuditLogViewer({ logs, nextCursor }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (logs.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "#606880",
        fontFamily: "var(--font-mono, 'DM Mono')",
        fontSize: 13,
        background: "rgba(28,35,64,0.3)",
        borderRadius: 8,
        border: "1px dashed rgba(200,135,58,0.2)",
      }}>
        No audit log entries found
      </div>
    );
  }

  return (
    <div>
      <div style={{
        background: "rgba(28,35,64,0.4)",
        border: "1px solid rgba(200,135,58,0.1)",
        borderRadius: 8,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "160px 200px 1fr 120px",
          padding: "8px 16px",
          borderBottom: "1px solid rgba(200,135,58,0.1)",
          fontFamily: "var(--font-mono, 'DM Mono')",
          fontSize: 10,
          color: "#c8873a",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          <div>Timestamp</div>
          <div>Admin</div>
          <div>Action</div>
          <div>Target</div>
        </div>

        {logs.map((log, i) => {
          const isExpanded = expanded[log.id];
          const hasDiff = log.before !== null || log.after !== null;

          return (
            <div key={log.id}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 200px 1fr 120px",
                  padding: "10px 16px",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  cursor: hasDiff ? "pointer" : "default",
                  alignItems: "center",
                }}
                onClick={() => hasDiff && setExpanded((prev) => ({ ...prev, [log.id]: !prev[log.id] }))}
              >
                <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880" }}>
                  {new Date(log.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#a0a8c0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {log.adminEmail}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontFamily: "var(--font-mono, 'DM Mono')",
                    fontSize: 10,
                    color: ACTION_COLORS[log.actionType] ?? "#a0a8c0",
                    background: "rgba(255,255,255,0.04)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    letterSpacing: "0.05em",
                  }}>
                    {log.actionType}
                  </span>
                  {log.notes && (
                    <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#404860" }}>{log.notes}</span>
                  )}
                  {hasDiff && (
                    <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#404860" }}>
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#404860", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {log.targetType && <span style={{ color: "#606880" }}>{log.targetType}:</span>} {log.targetId ?? "—"}
                </div>
              </div>

              {isExpanded && hasDiff && (
                <div style={{
                  padding: "8px 16px 12px",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  background: "rgba(13,18,32,0.4)",
                }}>
                  {log.before !== null && (
                    <div>
                      <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#E8705A", marginBottom: 6 }}>BEFORE</div>
                      <pre style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880", whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.5 }}>
                        {tryPrettyJson(log.before)}
                      </pre>
                    </div>
                  )}
                  {log.after !== null && (
                    <div>
                      <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#80D4A0", marginBottom: 6 }}>AFTER</div>
                      <pre style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#80D4A0", whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.5 }}>
                        {tryPrettyJson(log.after)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {nextCursor && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a
            href={`?cursor=${nextCursor}`}
            style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#c8873a", textDecoration: "none" }}
          >
            Load more →
          </a>
        </div>
      )}
    </div>
  );
}

function tryPrettyJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

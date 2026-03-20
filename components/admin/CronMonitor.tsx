"use client";
// STATUS: done | Task Admin-12

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CronRunItem {
  id: string;
  jobName: string;
  startedAt: string;
  completedAt: string | null;
  usersProcessed: number;
  insightsGenerated: number;
  errorCount: number;
  errors: string | null;
}

interface Props {
  byJob: Record<string, CronRunItem[]>;
}

export function CronMonitor({ byJob }: Props) {
  const router = useRouter();
  const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = useState<string | null>(null);
  const [triggering, setTriggering] = useState<string | null>(null);

  const handleTrigger = async (jobName: string) => {
    setTriggering(jobName);
    try {
      const res = await fetch(`/api/admin/cron/${jobName}/trigger`, { method: "POST" });
      if (!res.ok) throw new Error("Trigger failed");
      setConfirming(null);
      router.refresh();
    } catch (err) {
      alert("Trigger failed: " + String(err));
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {Object.entries(byJob).map(([jobName, runs]) => (
        <div key={jobName}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#e8b96a" }}>{jobName}</div>
            {confirming === jobName ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleTrigger(jobName)}
                  disabled={triggering === jobName}
                  style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, padding: "6px 14px", background: "rgba(200,135,58,0.2)", border: "1px solid rgba(200,135,58,0.5)", borderRadius: 6, color: "#e8b96a", cursor: "pointer" }}
                >
                  {triggering === jobName ? "Running..." : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirming(null)}
                  style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, padding: "6px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#606880", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(jobName)}
                style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, padding: "6px 14px", background: "rgba(28,35,64,0.8)", border: "1px solid rgba(200,135,58,0.2)", borderRadius: 6, color: "#a0a8c0", cursor: "pointer" }}
              >
                Run Now
              </button>
            )}
          </div>

          {runs.length === 0 ? (
            <div style={{
              fontFamily: "var(--font-mono, 'DM Mono')",
              fontSize: 12,
              color: "#404860",
              padding: "20px 16px",
              background: "rgba(28,35,64,0.3)",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.05)",
              textAlign: "center",
            }}>
              No runs recorded yet
            </div>
          ) : (
            <div style={{
              background: "rgba(28,35,64,0.4)",
              border: "1px solid rgba(200,135,58,0.1)",
              borderRadius: 8,
              overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "160px 70px 80px 70px 60px 1fr",
                padding: "8px 16px",
                borderBottom: "1px solid rgba(200,135,58,0.1)",
                fontFamily: "var(--font-mono, 'DM Mono')",
                fontSize: 10,
                color: "#c8873a",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                <div>Started</div>
                <div>Duration</div>
                <div>Users</div>
                <div>Insights</div>
                <div>Errors</div>
                <div></div>
              </div>

              {runs.map((run, i) => {
                const duration = run.completedAt
                  ? Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)
                  : null;

                return (
                  <div key={run.id}>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "160px 70px 80px 70px 60px 1fr",
                      padding: "10px 16px",
                      borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      alignItems: "center",
                    }}>
                      <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#a0a8c0" }}>
                        {new Date(run.startedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880" }}>
                        {duration !== null ? `${duration}s` : run.completedAt === null ? "…" : "—"}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880" }}>
                        {run.usersProcessed}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880" }}>
                        {run.insightsGenerated}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: run.errorCount > 0 ? "#E8705A" : "#80D4A0" }}>
                        {run.errorCount}
                      </div>
                      <div>
                        {run.errors && (
                          <button
                            onClick={() => setExpandedErrors((prev) => ({ ...prev, [run.id]: !prev[run.id] }))}
                            style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                          >
                            {expandedErrors[run.id] ? "▼ errors" : "▶ errors"}
                          </button>
                        )}
                      </div>
                    </div>

                    {run.errors && expandedErrors[run.id] && (
                      <div style={{
                        padding: "8px 16px 12px",
                        background: "rgba(232,112,90,0.05)",
                        borderTop: "1px solid rgba(232,112,90,0.1)",
                      }}>
                        <pre style={{
                          fontFamily: "var(--font-mono, 'DM Mono')",
                          fontSize: 11,
                          color: "#E8705A",
                          whiteSpace: "pre-wrap",
                          margin: 0,
                          lineHeight: 1.5,
                        }}>
                          {run.errors}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

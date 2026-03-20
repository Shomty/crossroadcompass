// STATUS: done | Task Admin-11
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { getInsightMetrics } from "@/lib/admin/metricsService";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireAdminSession();

  const sp = await searchParams;
  const days = sp.days === "30" ? 30 : 7;
  const metrics = await getInsightMetrics(days);

  const warningTypes = metrics.byHdType.filter((t) => t.approvalRate < 60 && t.count >= 3);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display, 'Cormorant Garamond')",
            fontSize: 28,
            fontWeight: 400,
            color: "#f0dca0",
            margin: 0,
            marginBottom: 6,
          }}>
            Insight Quality
          </h1>
          <p style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#606880", margin: 0 }}>
            Last {days} days
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="?days=7" style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, padding: "6px 12px", borderRadius: 6, border: `1px solid ${days === 7 ? "rgba(200,135,58,0.5)" : "rgba(255,255,255,0.1)"}`, color: days === 7 ? "#e8b96a" : "#606880", textDecoration: "none" }}>7d</Link>
          <Link href="?days=30" style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, padding: "6px 12px", borderRadius: 6, border: `1px solid ${days === 30 ? "rgba(200,135,58,0.5)" : "rgba(255,255,255,0.1)"}`, color: days === 30 ? "#e8b96a" : "#606880", textDecoration: "none" }}>30d</Link>
        </div>
      </div>

      {/* Warning banner */}
      {warningTypes.length > 0 && (
        <div style={{
          background: "rgba(200,135,58,0.12)",
          border: "1px solid rgba(200,135,58,0.4)",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 20,
          fontFamily: "var(--font-mono, 'DM Mono')",
          fontSize: 12,
          color: "#e8b96a",
        }}>
          ⚠ Low approval rate detected for: {warningTypes.map((t) => `${t.hdType} (${t.approvalRate}%)`).join(", ")} ·{" "}
          <Link href="/admin/prompts" style={{ color: "#c8873a" }}>Review prompts →</Link>
        </div>
      )}

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <MetricCard label="Generated" value={metrics.totalGenerated.toString()} />
        <MetricCard label="Approved" value={metrics.totalApproved.toString()} color="#80D4A0" />
        <MetricCard label="Pending" value={metrics.totalPending.toString()} color="#c8873a" />
        <MetricCard label="Approval Rate" value={`${metrics.approvalRate}%`} color={metrics.approvalRate >= 80 ? "#80D4A0" : "#c8873a"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Queue time */}
        <div style={{
          background: "rgba(28,35,64,0.4)",
          border: "1px solid rgba(200,135,58,0.1)",
          borderRadius: 8,
          padding: 16,
        }}>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", marginBottom: 8 }}>AVG QUEUE TIME</div>
          <div style={{ fontFamily: "var(--font-display, 'Cormorant Garamond')", fontSize: 32, color: "#f0dca0" }}>
            {metrics.avgQueueTimeHours}h
          </div>
        </div>

        {/* Rejected */}
        <div style={{
          background: "rgba(28,35,64,0.4)",
          border: "1px solid rgba(200,135,58,0.1)",
          borderRadius: 8,
          padding: 16,
        }}>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", marginBottom: 8 }}>REJECTED</div>
          <div style={{ fontFamily: "var(--font-display, 'Cormorant Garamond')", fontSize: 32, color: "#E8705A" }}>
            {metrics.totalRejected}
          </div>
        </div>
      </div>

      {/* HD Type breakdown */}
      {metrics.byHdType.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", marginBottom: 12 }}>APPROVAL BY HD TYPE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {metrics.byHdType.map((t) => (
              <div key={t.hdType} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#a0a8c0", width: 180, flexShrink: 0 }}>{t.hdType}</span>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 12, overflow: "hidden" }}>
                  <div style={{
                    width: `${t.approvalRate}%`,
                    height: "100%",
                    background: t.approvalRate >= 80 ? "#80D4A0" : t.approvalRate >= 60 ? "#c8873a" : "#E8705A",
                    borderRadius: 4,
                    transition: "width 0.3s",
                  }} />
                </div>
                <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880", width: 60, textAlign: "right" }}>
                  {t.approvalRate}% ({t.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low-rated / rejected */}
      {metrics.lowRatedInsights.length > 0 && (
        <div>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", marginBottom: 12 }}>REJECTED INSIGHTS</div>
          <div style={{
            background: "rgba(28,35,64,0.4)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 8,
            overflow: "hidden",
          }}>
            {metrics.lowRatedInsights.map((ins, i) => (
              <div key={ins.id} style={{
                padding: "12px 16px",
                borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#e8b96a" }}>{ins.type}</span>
                  <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#404860" }}>{new Date(ins.generatedAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880", lineHeight: 1.5 }}>
                  {ins.content}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color = "#f0dca0" }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: "rgba(28,35,64,0.4)",
      border: "1px solid rgba(200,135,58,0.1)",
      borderRadius: 8,
      padding: 16,
    }}>
      <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display, 'Cormorant Garamond')", fontSize: 36, color }}>{value}</div>
    </div>
  );
}

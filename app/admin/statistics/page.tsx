import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { computeAdminStatistics } from "@/lib/admin/adminStatistics";

export const dynamic = "force-dynamic";

function Sparkline({ points }: { points: { date: string; value: number }[] }) {
  if (!points.length) return null;
  const w = 320;
  const h = 80;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = max === min ? 1 : max - min;
  const denom = Math.max(1, points.length - 1);
  const poly = points
    .map((p, i) => {
      const x = (i / denom) * w;
      const y = h - ((p.value - min) / pad) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ maxWidth: "100%" }}>
      <polyline
        fill="none"
        stroke="#c8873a"
        strokeWidth="2"
        points={poly}
      />
    </svg>
  );
}

function Card({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: "rgba(28,35,64,0.45)",
        border: "1px solid rgba(200,135,58,0.12)",
        borderRadius: 10,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono, 'DM Mono')",
          fontSize: 10,
          color: "#c8873a",
          letterSpacing: "0.12em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display, 'Cormorant Garamond')",
          fontSize: 26,
          color: "#f0dca0",
        }}
      >
        {value}
      </div>
      {sub ? (
        <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#606880", marginTop: 6 }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

export default async function AdminStatisticsPage() {
  await requireAdminSession();
  const s = await computeAdminStatistics();

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-display, 'Cormorant Garamond')",
          fontSize: 28,
          color: "#e8b96a",
          margin: "0 0 8px",
          fontWeight: 400,
        }}
      >
        Statistics
      </h1>
      <p style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#606880", marginBottom: 28 }}>
        Platform KPIs (MRR estimated from tier list prices; trend line uses current MRR).
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Card label="MRR (USD est.)" value={`$${s.mrr.toFixed(2)}`} />
        <Card label="Active users" value={String(s.activeUsers)} />
        <Card label="Conversion (30d est.)" value={`${s.conversionRate.toFixed(1)}%`} />
        <Card label="Seeker (CORE)" value={String(s.seekerCount)} />
        <Card label="Navigator (VIP)" value={String(s.navigatorCount)} />
        <Card label="Churn (30d est.)" value={`${s.churnRate30d.toFixed(1)}%`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card label="Sessions booked (30d)" value={String(s.sessionsBooked30d)} />
        <Card label="Insight engagement rate" value={`${s.insightOpenRate.toFixed(1)}%`} />
        <Card label="Reports generated (DONE)" value={String(s.reportGeneratedCount)} />
        <Card label="Free tier" value={String(s.freeCount)} />
      </div>

      <div style={{ marginTop: 28 }}>
        <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", marginBottom: 10, letterSpacing: "0.1em" }}>
          MRR TREND (30 DAYS)
        </div>
        <Sparkline points={s.mrrTrend} />
      </div>
    </div>
  );
}

// STATUS: done | Task Admin-10
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { UserActions } from "@/components/admin/UserActions";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdminSession();

  const { userId } = await params;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      birthProfile: {
        select: {
          birthDate: true,
          birthCity: true,
          birthCountry: true,
          hdType: true,
          hdStrategy: true,
          hdAuthority: true,
          hdProfile: true,
          chartDataHumanDesign: true,
          chartDataVedic: true,
        },
      },
      insights: {
        orderBy: { generatedAt: "desc" },
        take: 10,
        select: {
          id: true,
          type: true,
          generatedAt: true,
          deliveredAt: true,
          reviewedByConsultant: true,
          rejectedAt: true,
        },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, tier: true, status: true, scheduledAt: true, createdAt: true },
      },
    },
  });

  if (!user) notFound();

  const hdCached = !!(user.birthProfile?.chartDataHumanDesign);
  const vedicCached = !!(user.birthProfile?.chartDataVedic);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "var(--font-display, 'Cormorant Garamond')",
          fontSize: 26,
          fontWeight: 400,
          color: "#f0dca0",
          margin: 0,
          marginBottom: 4,
        }}>
          {user.name ?? user.email}
        </h1>
        <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880" }}>
          {user.email} · joined {new Date(user.createdAt).toLocaleDateString()} · {user.role}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Profile card */}
        <div style={{
          background: "rgba(28,35,64,0.5)",
          border: "1px solid rgba(200,135,58,0.12)",
          borderRadius: 8,
          padding: 16,
        }}>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", marginBottom: 12 }}>PROFILE</div>
          {user.birthProfile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Row label="Birth" value={`${new Date(user.birthProfile.birthDate).toLocaleDateString()} · ${user.birthProfile.birthCity}, ${user.birthProfile.birthCountry}`} />
              <Row label="HD Type" value={user.birthProfile.hdType ?? "—"} />
              <Row label="Strategy" value={user.birthProfile.hdStrategy ?? "—"} />
              <Row label="Authority" value={user.birthProfile.hdAuthority ?? "—"} />
              <Row label="Profile" value={user.birthProfile.hdProfile ?? "—"} />
            </div>
          ) : (
            <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#404860" }}>No birth profile</div>
          )}
        </div>

        {/* Subscription card */}
        <div style={{
          background: "rgba(28,35,64,0.5)",
          border: "1px solid rgba(200,135,58,0.12)",
          borderRadius: 8,
          padding: 16,
        }}>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", marginBottom: 12 }}>SUBSCRIPTION</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Row label="Tier" value={user.subscription?.tier ?? "FREE"} />
            <Row label="Status" value={user.subscription?.status ?? "—"} />
            {user.subscription?.stripeCustomerId && (
              <Row label="Stripe ID" value={user.subscription.stripeCustomerId} />
            )}
            <Row label="HD Chart" value={hdCached ? "✓ Cached" : "✗ Not cached"} valueColor={hdCached ? "#80D4A0" : "#E8705A"} />
            <Row label="Vedic Chart" value={vedicCached ? "✓ Cached" : "✗ Not cached"} valueColor={vedicCached ? "#80D4A0" : "#E8705A"} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <UserActions userId={userId} userEmail={user.email ?? ""} currentTier={user.subscription?.tier ?? "FREE"} />

      {/* Insight history */}
      {user.insights.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", marginBottom: 12 }}>RECENT INSIGHTS</div>
          <div style={{
            background: "rgba(28,35,64,0.4)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 8,
            overflow: "hidden",
          }}>
            {user.insights.map((ins, i) => (
              <div key={ins.id} style={{
                display: "flex",
                gap: 16,
                padding: "10px 16px",
                borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#e8b96a", width: 80 }}>{ins.type}</span>
                <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880" }}>{new Date(ins.generatedAt).toLocaleDateString()}</span>
                <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: ins.reviewedByConsultant ? "#80D4A0" : ins.rejectedAt ? "#E8705A" : "#c8873a" }}>
                  {ins.reviewedByConsultant ? "approved" : ins.rejectedAt ? "rejected" : "pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consultations */}
      {user.bookings.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", letterSpacing: "0.1em", marginBottom: 12 }}>CONSULTATIONS</div>
          <div style={{
            background: "rgba(28,35,64,0.4)",
            border: "1px solid rgba(200,135,58,0.1)",
            borderRadius: 8,
            overflow: "hidden",
          }}>
            {user.bookings.map((b, i) => (
              <div key={b.id} style={{
                display: "flex",
                gap: 16,
                padding: "10px 16px",
                borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#e8b96a" }}>{b.tier}</span>
                <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#606880" }}>{b.status}</span>
                <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#404860" }}>{new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: "#404860", width: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 11, color: valueColor ?? "#a0a8c0" }}>{value}</span>
    </div>
  );
}

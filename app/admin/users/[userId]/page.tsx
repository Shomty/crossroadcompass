// STATUS: done | Admin Variable Inspector
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserActions } from "@/components/admin/UserActions";
import { UserVariableInspector } from "@/components/admin/UserVariableInspector";
import { loadReportTemplateSources } from "@/lib/admin/loadReportTemplateSources";
import { buildReportTemplateVars } from "@/lib/reports/reportTemplateVars";

export const dynamic = "force-dynamic";

const MONO = "var(--font-mono, 'DM Mono')";
const AMBER = "#c8873a";
const GOLD = "#e8b96a";
const STAR = "#f0dca0";
const DIM = "#606880";
const MID = "#a0a8c0";
const GREEN = "#80D4A0";
const RED = "#E8705A";
const SURFACE = "rgba(28,35,64,0.5)";
const BORDER = "rgba(200,135,58,0.12)";

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdminSession();

  const { userId } = await params;
  const { tab = "overview" } = await searchParams;

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

  // Load variable data only when on Variables tab
  let varsData: Record<string, string> | null = null;
  let dataSources: {
    hd: { available: boolean };
    vedic: { available: boolean };
    dashas: { available: boolean };
    transit: { available: boolean };
    specialPoints: { available: boolean; extendedAvailable: boolean };
  } | null = null;

  if (tab === "variables") {
    const sources = await loadReportTemplateSources(userId);
    varsData = buildReportTemplateVars(sources) as Record<string, string>;
    dataSources = {
      hd: { available: sources.hdData !== null },
      vedic: { available: sources.vedicData !== null },
      dashas: {
        available:
          !!(sources.currentMahadasha || sources.currentAntardasha) ||
          (Array.isArray(sources.dashasData) && (sources.dashasData as unknown[]).length > 0),
      },
      transit: { available: sources.transitData != null },
      specialPoints: {
        available: sources.specialPoints != null,
        extendedAvailable: sources.extendedSpecialPoints != null,
      },
    };
  }

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "variables", label: "Variables" },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, marginBottom: 6 }}>
          <Link href="/admin/users" style={{ color: AMBER, textDecoration: "none" }}>
            ← Users
          </Link>
        </div>
        <h1 style={{
          fontFamily: "var(--font-display, 'Cormorant Garamond')",
          fontSize: 26, fontWeight: 400, color: STAR, margin: 0, marginBottom: 4,
        }}>
          {user.name ?? user.email}
        </h1>
        <div style={{ fontFamily: MONO, fontSize: 11, color: DIM }}>
          {user.email} · joined {new Date(user.createdAt).toLocaleDateString()} · {user.role}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 2, marginBottom: 24,
        borderBottom: "1px solid rgba(200,135,58,0.15)",
      }}>
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          return (
            <Link
              key={id}
              href={`/admin/users/${userId}?tab=${id}`}
              style={{
                fontFamily: MONO, fontSize: 12, textDecoration: "none",
                padding: "8px 16px",
                color: active ? GOLD : MID,
                borderBottom: active ? `2px solid ${AMBER}` : "2px solid transparent",
                marginBottom: -1,
                transition: "color 0.15s",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* ── Overview tab ── */}
      {tab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* Profile card */}
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 16 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER, letterSpacing: "0.1em", marginBottom: 12 }}>PROFILE</div>
              {user.birthProfile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Row label="Birth" value={`${new Date(user.birthProfile.birthDate).toLocaleDateString()} · ${user.birthProfile.birthCity}, ${user.birthProfile.birthCountry}`} />
                  <Row label="HD Type" value={user.birthProfile.hdType ?? "—"} />
                  <Row label="Strategy" value={user.birthProfile.hdStrategy ?? "—"} />
                  <Row label="Authority" value={user.birthProfile.hdAuthority ?? "—"} />
                  <Row label="Profile" value={user.birthProfile.hdProfile ?? "—"} />
                </div>
              ) : (
                <div style={{ fontFamily: MONO, fontSize: 12, color: "#404860" }}>No birth profile</div>
              )}
            </div>

            {/* Subscription card */}
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 16 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER, letterSpacing: "0.1em", marginBottom: 12 }}>SUBSCRIPTION</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Row label="Tier" value={user.subscription?.tier ?? "FREE"} />
                <Row label="Status" value={user.subscription?.status ?? "—"} />
                {user.subscription?.stripeCustomerId && (
                  <Row label="Stripe ID" value={user.subscription.stripeCustomerId} />
                )}
                <Row label="HD Chart" value={hdCached ? "✓ Cached" : "✗ Not cached"} valueColor={hdCached ? GREEN : RED} />
                <Row label="Vedic Chart" value={vedicCached ? "✓ Cached" : "✗ Not cached"} valueColor={vedicCached ? GREEN : RED} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <UserActions
            userId={userId}
            userEmail={user.email ?? ""}
            currentTier={user.subscription?.tier ?? "FREE"}
            isAdminUser={user.role === "ADMIN" || user.isAdmin}
          />

          {/* Insight history */}
          {user.insights.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER, letterSpacing: "0.1em", marginBottom: 12 }}>RECENT INSIGHTS</div>
              <div style={{ background: "rgba(28,35,64,0.4)", border: "1px solid rgba(200,135,58,0.1)", borderRadius: 8, overflow: "hidden" }}>
                {user.insights.map((ins, i) => (
                  <div key={ins.id} style={{
                    display: "flex", gap: 16, padding: "10px 16px",
                    borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: GOLD, width: 80 }}>{ins.type}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: DIM }}>{new Date(ins.generatedAt).toLocaleDateString()}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: ins.reviewedByConsultant ? GREEN : ins.rejectedAt ? RED : AMBER }}>
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
              <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER, letterSpacing: "0.1em", marginBottom: 12 }}>CONSULTATIONS</div>
              <div style={{ background: "rgba(28,35,64,0.4)", border: "1px solid rgba(200,135,58,0.1)", borderRadius: 8, overflow: "hidden" }}>
                {user.bookings.map((b, i) => (
                  <div key={b.id} style={{
                    display: "flex", gap: 16, padding: "10px 16px",
                    borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: GOLD }}>{b.tier}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: DIM }}>{b.status}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: "#404860" }}>{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Variables tab ── */}
      {tab === "variables" && varsData && dataSources && (
        <UserVariableInspector vars={varsData} dataSources={dataSources} />
      )}
      {tab === "variables" && !varsData && (
        <div style={{ fontFamily: MONO, fontSize: 12, color: DIM, padding: 24 }}>
          No chart data available for this user.
        </div>
      )}
    </div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <span style={{ fontFamily: MONO, fontSize: 11, color: "#404860", width: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 11, color: valueColor ?? MID }}>{value}</span>
    </div>
  );
}

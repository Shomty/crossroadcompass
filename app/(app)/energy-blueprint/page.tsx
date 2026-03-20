// STATUS: done | Phase 5 Feature Pages
/**
 * app/(app)/energy-blueprint/page.tsx
 * HD Bodygraph with Jyotish gate-planet overlay.
 *
 * Tier behaviour:
 *   FREE  → Full gate list visible (all 64 possible), but planet correlations locked.
 *           Type / Strategy / Authority / Profile displayed.
 *   CORE  → Tap any gate row → see planet ruler. Gate list: first 3 unlocked, rest blurred.
 *   VIP   → Full gate-planet mapping, all rows expanded.
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import { PageLayout } from "@/components/layout/PageLayout";
import { GateDetail } from "@/components/chart/GateDetail";
import { GlimpseBlur } from "@/components/glimpse/GlimpseBlur";
import { GlimpseCTA } from "@/components/glimpse";
import { GATE_MAPPING, getGateInfo } from "@/lib/humandesign/gateMapping";
import type { SubscriptionTier } from "@/types";

export default async function EnergyBlueprintPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // ── Subscription ──────────────────────────────────────────────────────────
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { tier: true },
  });
  const tier = subscription?.tier ?? "FREE";
  const isAdmin = session.user?.email === "shomty@hotmail.com";
  const effectiveTier: SubscriptionTier = isAdmin ? "VIP" : (tier as SubscriptionTier);
  const isPaid = effectiveTier === "CORE" || effectiveTier === "VIP";

  // ── Load HD chart ─────────────────────────────────────────────────────────
  const birthProfile = await db.birthProfile.findUnique({ where: { userId } });
  let hdType: string | null = null;
  let hdStrategy: string | null = null;
  let hdAuthority: string | null = null;
  let hdProfile: string | null = null;
  let hdDefinition: string | null = null;
  let activeGates: number[] = [];

  if (birthProfile) {
    try {
      const hdChart = await getOrCreateHDChart(userId, birthProfile);
      hdType = hdChart.type ?? null;
      hdStrategy = hdChart.strategy ?? null;
      hdAuthority = hdChart.authority ?? null;
      hdProfile = hdChart.profile ?? null;
      hdDefinition = hdChart.definition ?? null;
    } catch { /* fail silently */ }
  }

  // Parse active gates from birthProfile JSON field
  if (birthProfile?.hdActiveGates) {
    try {
      const parsed = JSON.parse(birthProfile.hdActiveGates as string);
      if (Array.isArray(parsed)) {
        activeGates = parsed.filter((g): g is number => typeof g === "number");
      }
    } catch { /* ignore */ }
  }

  const hasProfile = !!hdType;
  const activeGateSet = new Set(activeGates);

  // All 64 gate infos, sorted: active first, then inactive
  const allGateInfos = Object.values(GATE_MAPPING);
  const sortedGates = [
    ...allGateInfos.filter((g) => activeGateSet.has(g.gate)),
    ...allGateInfos.filter((g) => !activeGateSet.has(g.gate)),
  ];

  // CORE: show first 3 gates, blur the rest
  const CORE_VISIBLE_COUNT = 3;

  return (
    <PageLayout
      eyebrow="Human Design · Jyotish Overlay"
      title="Energy Blueprint"
      subtitle="Your 64 HD gates mapped to their Jyotish planetary rulers"
    >
      {!hasProfile ? (
        <section
          className="animate-enter animate-enter-2"
          style={{
            textAlign: "center", padding: "5rem 1rem",
            background: "rgba(13,18,32,0.5)", borderRadius: 16,
            border: "1px solid rgba(200,135,58,0.12)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 20 }}>◉</div>
          <h2 style={{
            fontFamily: "Cinzel, serif", fontSize: 22, fontWeight: 400,
            color: "rgba(255,255,255,0.9)", marginBottom: 12,
          }}>
            Complete your birth profile
          </h2>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 14, color: "var(--mist, rgba(255,255,255,0.5))",
            lineHeight: 1.65, maxWidth: 380, margin: "0 auto 28px",
          }}>
            Your Energy Blueprint requires a complete birth profile to calculate your Human Design chart.
          </p>
          <a
            href="/settings/profile"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 10,
              background: "linear-gradient(135deg, #c8873a, #e8b96a)",
              color: "#0d1220",
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}
          >
            Set up birth profile →
          </a>
        </section>
      ) : (
        <>
          {/* ── HD Profile Summary Card ─────────────────────────────────── */}
          <section
            className="animate-enter animate-enter-2"
            style={{
              padding: "24px 28px",
              borderRadius: 16,
              background: "rgba(13,18,32,0.6)",
              border: "1px solid rgba(200,135,58,0.18)",
              marginBottom: 28,
            }}
          >
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9,
              letterSpacing: "0.16em", textTransform: "uppercase" as const,
              color: "rgba(200,135,58,0.8)", marginBottom: 16,
            }}>
              Your Human Design Foundation
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
              {[
                { label: "Type", value: hdType },
                { label: "Strategy", value: hdStrategy },
                { label: "Authority", value: hdAuthority },
                { label: "Profile", value: hdProfile },
                { label: "Definition", value: hdDefinition },
                { label: "Active Gates", value: `${activeGates.length} of 64` },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <div style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 8,
                    letterSpacing: "0.14em", textTransform: "uppercase" as const,
                    color: "rgba(255,255,255,0.5)", marginBottom: 4,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontFamily: "Cinzel, serif", fontSize: 14,
                    color: "var(--cream, rgba(255,255,255,0.9))",
                  }}>
                    {value}
                  </div>
                </div>
              ) : null)}
            </div>
          </section>

          {/* ── Gate List ────────────────────────────────────────────────── */}
          <section className="animate-enter animate-enter-3">
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 16,
            }}>
              <div>
                <h2 style={{
                  fontFamily: "Cinzel, serif", fontSize: 16, fontWeight: 400,
                  color: "var(--cream, rgba(255,255,255,0.9))", marginBottom: 4,
                }}>
                  Gate · Planet Correlations
                </h2>
                <p style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 9,
                  letterSpacing: "0.1em", textTransform: "uppercase" as const,
                  color: "rgba(255,255,255,0.5)",
                }}>
                  {activeGates.length > 0 ? `${activeGates.length} active · ` : ""}{isPaid ? "tap any gate to expand" : "CORE+ unlocks planet rulers"}
                </p>
              </div>
            </div>

            {isPaid ? (
              /* CORE/VIP: all gates visible */
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sortedGates.map((gateInfo) => (
                  <GateDetail
                    key={gateInfo.gate}
                    gateInfo={gateInfo}
                    userTier={effectiveTier}
                    isActive={activeGateSet.has(gateInfo.gate)}
                  />
                ))}
              </div>
            ) : (
              /* FREE: first 3 visible, rest blurred */
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                  {sortedGates.slice(0, CORE_VISIBLE_COUNT).map((gateInfo) => (
                    <GateDetail
                      key={gateInfo.gate}
                      gateInfo={gateInfo}
                      userTier={effectiveTier}
                      isActive={activeGateSet.has(gateInfo.gate)}
                    />
                  ))}
                </div>
                <GlimpseBlur
                  preview={`You have ${activeGates.length > 0 ? activeGates.length : "multiple"} active gates in your chart, each ruled by a Jyotish planet that shapes how that energy manifests in your life. The full map reveals which planetary cycles amplify or challenge your defined centers.`}
                  featureName="energy_blueprint_gates"
                  ctaText="Unlock gate-planet mapping"
                  ctaHref="/pricing"
                >
                  {/* Placeholder rows — real gate-planet data withheld from free users */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(13,18,32,0.4)", border: "1px solid rgba(200,135,58,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(200,135,58,0.06)", border: "1px solid rgba(200,135,58,0.12)", flexShrink: 0 }} />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ height: 10, width: "40%", borderRadius: 3, background: "rgba(255,255,255,0.06)" }} />
                          <div style={{ height: 8, width: "65%", borderRadius: 3, background: "rgba(255,255,255,0.04)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlimpseBlur>
              </div>
            )}
          </section>

          {/* Bottom CTA for FREE */}
          {!isPaid && (
            <div style={{ textAlign: "center", padding: "2rem 0 1rem" }}>
              <GlimpseCTA
                text="Unlock your full Energy Blueprint"
                variant="primary"
                featureName="energy_blueprint_bottom"
                href="/pricing"
              />
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}

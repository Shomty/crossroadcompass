// STATUS: done | Premium Features - Purpose Decoder
/**
 * app/(app)/purpose/page.tsx
 * Purpose Decoder feature page.
 *
 * Tier behavior:
 *   FREE  → HD Profile + Incarnation Cross name + 10th house lord only
 *   GLIMPSE → One paragraph on purpose theme (via GlimpseBlur)
 *   PREMIUM → Full synthesis with archetypes and practical steps
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/PageLayout";
import { GlimpseBlur, GlimpseCTA } from "@/components/glimpse";
import { PurposeDecoder } from "@/components/purpose/PurposeDecoder";
import { CrossBreakdown } from "@/components/purpose/CrossBreakdown";
import {
  getOrGeneratePurposeInsight,
  generateGlimpsePurposeInsight,
  type PurposeInsight,
  type GlimpsePurposeInsight,
} from "@/lib/ai/purposeInsightService";
import { getBasicPurposeData } from "@/lib/astro/purposeService";
import { getOrCreateHDChart } from "@/lib/astro/chartService";
import type { SubscriptionTier } from "@/types";

export default async function PurposePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // ── Get birth profile ───────────────────────────────────────────────────
  const birthProfile = await db.birthProfile.findUnique({
    where: { userId },
  });

  if (!birthProfile) {
    redirect("/onboarding");
  }

  // ── Subscription tier ───────────────────────────────────────────────────
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { tier: true },
  });
  const tier = subscription?.tier ?? "FREE";
  const isAdmin = session.user.role === "ADMIN";
  const effectiveTier: SubscriptionTier = isAdmin ? "VIP" : (tier as SubscriptionTier);
  const isPremium = effectiveTier === "CORE" || effectiveTier === "VIP";

  // ── Get HD chart for cross data ─────────────────────────────────────────
  const hdChart = await getOrCreateHDChart(userId, birthProfile);
  const crossGates = hdChart.incarnationCross.gates;
  const crossData = {
    type: hdChart.incarnationCross.type,
    name: `Cross of ${crossGates.personalitySun}/${crossGates.designSun}`,
    gates: [
      crossGates.personalitySun,
      crossGates.personalityEarth,
      crossGates.designSun,
      crossGates.designEarth,
    ],
  };

  // ── Fetch data based on tier ────────────────────────────────────────────
  let fullInsight: PurposeInsight | null = null;
  let glimpseInsight: GlimpsePurposeInsight | null = null;
  let basicData: Awaited<ReturnType<typeof getBasicPurposeData>> | null = null;

  if (isPremium) {
    fullInsight = await getOrGeneratePurposeInsight(userId, birthProfile);
  } else {
    // FREE/GLIMPSE tier - get basic data and glimpse
    basicData = await getBasicPurposeData(userId, birthProfile);
    try {
      glimpseInsight = await generateGlimpsePurposeInsight(userId, birthProfile);
    } catch (e) {
      console.error("Failed to generate glimpse insight:", e);
    }
  }

  return (
    <PageLayout
      eyebrow="Career · Life Purpose"
      title="Purpose Decoder"
      subtitle="Discover your unique contribution through Vedic + HD synthesis"
    >
      {isPremium && fullInsight ? (
        /* ─── PREMIUM VIEW ─────────────────────────────────────────────── */
        <PurposeDecoder insight={fullInsight} crossData={crossData} />
      ) : (
        /* ─── FREE / GLIMPSE VIEW ──────────────────────────────────────── */
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Basic Data Card */}
          <section
            className="animate-enter"
            style={{
              background: "rgba(13,18,32,0.5)",
              border: "1px solid rgba(200,135,58,0.15)",
              borderRadius: 16,
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 16,
                fontWeight: 400,
                color: "rgba(255,255,255,0.9)",
                margin: "0 0 16px",
              }}
            >
              Your Purpose Foundations
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "rgba(200,135,58,0.08)",
                  borderRadius: 10,
                  padding: "14px 16px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: "rgba(200,135,58,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  HD Type
                </span>
                <p
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: 18,
                    color: "#e8b96a",
                    margin: "6px 0 0",
                  }}
                >
                  {basicData?.hdType || hdChart.type}
                </p>
              </div>

              <div
                style={{
                  background: "rgba(200,135,58,0.08)",
                  borderRadius: 10,
                  padding: "14px 16px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: "rgba(200,135,58,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Profile
                </span>
                <p
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: 18,
                    color: "#e8b96a",
                    margin: "6px 0 0",
                  }}
                >
                  {basicData?.hdProfile || hdChart.profile}
                </p>
              </div>

              <div
                style={{
                  background: "rgba(200,135,58,0.08)",
                  borderRadius: 10,
                  padding: "14px 16px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: "rgba(200,135,58,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  10th House Lord
                </span>
                <p
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: 18,
                    color: "#e8b96a",
                    margin: "6px 0 0",
                  }}
                >
                  {basicData?.tenthHouseLord || "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Incarnation Cross */}
          <section className="animate-enter animate-enter-2">
            <CrossBreakdown
              crossType={crossData.type}
              crossName={basicData?.incarnationCrossName || crossData.name}
              gates={crossData.gates}
            />
          </section>

          {/* Glimpse Content */}
          {glimpseInsight && (
            <section className="animate-enter animate-enter-3">
              <GlimpseBlur
                sectionTitle="Your Purpose Theme"
                preview={glimpseInsight.overview}
                featureName="purpose_decoder"
                ctaText="Unlock your full Purpose Decoder"
                ctaHref="/subscribe"
              >
                {/* Blurred premium content preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div
                    style={{
                      background: "rgba(200,135,58,0.1)",
                      borderRadius: 12,
                      padding: 20,
                    }}
                  >
                    <h4
                      style={{
                        fontFamily: "Cinzel, serif",
                        fontSize: 16,
                        color: "#e8b96a",
                        margin: "0 0 12px",
                      }}
                    >
                      Career Archetype #1: The Visionary Leader
                    </h4>
                    <p
                      style={{
                        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                        fontSize: 13,
                        color: "rgba(255,255,255,0.7)",
                        lineHeight: 1.6,
                      }}
                    >
                      Your chart indicates a natural capacity for strategic thinking
                      and inspiring others toward a shared vision...
                    </p>
                  </div>
                  <div
                    style={{
                      background: "rgba(200,135,58,0.1)",
                      borderRadius: 12,
                      padding: 20,
                    }}
                  >
                    <h4
                      style={{
                        fontFamily: "Cinzel, serif",
                        fontSize: 16,
                        color: "#e8b96a",
                        margin: "0 0 12px",
                      }}
                    >
                      Practical Next Steps
                    </h4>
                    <p
                      style={{
                        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                        fontSize: 13,
                        color: "rgba(255,255,255,0.7)",
                        lineHeight: 1.6,
                      }}
                    >
                      Based on your unique chart configuration, here are three
                      actionable steps to align with your purpose...
                    </p>
                  </div>
                </div>
              </GlimpseBlur>
            </section>
          )}

          {/* Bottom CTA */}
          <section
            className="animate-enter animate-enter-4"
            style={{ textAlign: "center", padding: "1.5rem 0" }}
          >
            <p
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 14,
                fontStyle: "italic",
                color: "rgba(240,220,160,0.6)",
                marginBottom: 20,
              }}
            >
              Discover your career archetypes, ideal environment, and practical guidance.
            </p>
            <GlimpseCTA
              text="Unlock Purpose Decoder"
              variant="primary"
              featureName="purpose_decoder_bottom"
              href="/subscribe"
            />
          </section>
        </div>
      )}
    </PageLayout>
  );
}

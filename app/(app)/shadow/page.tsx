// STATUS: done | Premium Features - Shadow Work Portal
/**
 * app/(app)/shadow/page.tsx
 * Shadow Work Portal feature page.
 *
 * Tier behavior:
 *   FREE  → Locked teaser card
 *   GLIMPSE → Shadow theme headline + 2 sentences via GlimpseBlur
 *   PREMIUM → Full shadow map + journaling prompts + practices
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/PageLayout";
import { GlimpseBlur, GlimpseCTA, ShadowHeadline } from "@/components/glimpse";
import { ShadowPortal } from "@/components/shadow/ShadowPortal";
import {
  getOrGenerateShadowInsight,
  generateGlimpseShadowInsight,
  type ShadowInsight,
  type GlimpseShadowInsight,
} from "@/lib/ai/shadowInsightService";
import { getBasicShadowData } from "@/lib/astro/shadowService";
import type { SubscriptionTier } from "@/types";

export default async function ShadowPage() {
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
  const isAdmin = session.user?.email === "shomty@hotmail.com";
  const effectiveTier: SubscriptionTier = isAdmin ? "VIP" : (tier as SubscriptionTier);
  const isPremium = effectiveTier === "CORE" || effectiveTier === "VIP";

  // ── Fetch data based on tier ────────────────────────────────────────────
  let fullInsight: ShadowInsight | null = null;
  let glimpseInsight: GlimpseShadowInsight | null = null;
  let basicData: Awaited<ReturnType<typeof getBasicShadowData>> | null = null;

  if (isPremium) {
    fullInsight = await getOrGenerateShadowInsight(userId, birthProfile);
  } else {
    basicData = await getBasicShadowData(userId, birthProfile);
    try {
      glimpseInsight = await generateGlimpseShadowInsight(userId, birthProfile);
    } catch (e) {
      console.error("Failed to generate glimpse insight:", e);
    }
  }

  return (
    <PageLayout
      eyebrow="Self-Discovery · Integration"
      title="Shadow Work Portal"
      subtitle="Explore the hidden patterns that shape your journey"
    >
      {isPremium && fullInsight ? (
        /* ─── PREMIUM VIEW ─────────────────────────────────────────────── */
        <ShadowPortal insight={fullInsight} />
      ) : (
        /* ─── FREE / GLIMPSE VIEW ──────────────────────────────────────── */
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Teaser Card */}
          <section
            className="animate-enter"
            style={{
              background: "linear-gradient(180deg, rgba(46,31,15,0.2) 0%, rgba(13,18,32,0.5) 100%)",
              border: "1px solid rgba(200,135,58,0.15)",
              borderRadius: 16,
              padding: "2rem 1.5rem",
              textAlign: "center",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 32,
                color: "rgba(200,135,58,0.4)",
                marginBottom: 16,
              }}
            >
              ☽
            </span>
            <h3
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 20,
                fontWeight: 400,
                color: "rgba(255,255,255,0.9)",
                margin: "0 0 12px",
              }}
            >
              Every chart has a shadow side
            </h3>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: 14,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.65,
                maxWidth: 440,
                margin: "0 auto",
              }}
            >
              Understanding yours is the key to freedom. Your shadow isn&apos;t something to fix—it&apos;s a doorway to your deepest gifts.
            </p>
          </section>

          {/* Basic Data Display */}
          {basicData && (
            <section
              className="animate-enter animate-enter-2"
              style={{
                background: "rgba(13,18,32,0.5)",
                border: "1px solid rgba(200,135,58,0.12)",
                borderRadius: 14,
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
                    Not-Self Signal
                  </span>
                  <p
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 16,
                      color: "#e8b96a",
                      margin: "6px 0 0",
                    }}
                  >
                    {basicData.notSelfTheme}
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
                    Undefined Centers
                  </span>
                  <p
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 16,
                      color: "#e8b96a",
                      margin: "6px 0 0",
                    }}
                  >
                    {basicData.undefinedCentersCount} portals
                  </p>
                </div>

                {basicData.ketuHouse && (
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
                      Ketu House
                    </span>
                    <p
                      style={{
                        fontFamily: "Cinzel, serif",
                        fontSize: 16,
                        color: "#e8b96a",
                        margin: "6px 0 0",
                      }}
                    >
                      {basicData.ketuHouse}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Glimpse Content */}
          {glimpseInsight && (
            <section className="animate-enter animate-enter-3">
              <ShadowHeadline
                headline={glimpseInsight.shadowTheme}
                subtext={glimpseInsight.overview}
                featureName="shadow_portal"
                ctaText="Explore your Shadow Map"
                ctaHref="/subscribe"
              />
            </section>
          )}

          {/* Blurred Premium Preview */}
          <section className="animate-enter animate-enter-4">
            <GlimpseBlur
              sectionTitle="What awaits inside"
              preview="Your full Shadow Work Portal includes personalized journaling prompts designed specifically for your chart patterns, integration practices aligned with your HD Authority, and a compassionate exploration of your undefined centers as sources of wisdom."
              featureName="shadow_portal_preview"
              ctaText="Unlock Shadow Work Portal"
              ctaHref="/subscribe"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    background: "rgba(200,135,58,0.1)",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <h4
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 14,
                      color: "#e8b96a",
                      margin: "0 0 8px",
                    }}
                  >
                    Journaling Prompt: Fear of Being Seen
                  </h4>
                  <p
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 13,
                      fontStyle: "italic",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    &ldquo;What would change if the parts of you that feel hidden were fully witnessed and accepted?&rdquo;
                  </p>
                </div>
                <div
                  style={{
                    background: "rgba(200,135,58,0.1)",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <h4
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 14,
                      color: "#e8b96a",
                      margin: "0 0 8px",
                    }}
                  >
                    Integration Practice
                  </h4>
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    A daily practice designed for your specific Authority type...
                  </p>
                </div>
              </div>
            </GlimpseBlur>
          </section>

          {/* Bottom CTA */}
          <section
            className="animate-enter animate-enter-5"
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
              Discover your shadow patterns, receive personalized journaling prompts, and find your path to integration.
            </p>
            <GlimpseCTA
              text="Unlock Shadow Work Portal"
              variant="primary"
              featureName="shadow_portal_bottom"
              href="/subscribe"
            />
          </section>
        </div>
      )}
    </PageLayout>
  );
}

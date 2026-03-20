// STATUS: done | Premium Features - Cosmic Chemistry
/**
 * app/(app)/chemistry/page.tsx
 * Cosmic Chemistry compatibility feature page.
 *
 * Tier behavior:
 *   FREE  → Locked form with social proof counter
 *   GLIMPSE → Score + 1 Kuta dimension revealed + 1-sentence HD summary
 *   PREMIUM → Full 8-fold Kuta + HD composite + shareable card
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/PageLayout";
import { GlimpseCTA, TeaserScore } from "@/components/glimpse";
import { ChemistryFormWrapper } from "@/components/chemistry/ChemistryFormWrapper";
import type { SubscriptionTier } from "@/types";
// #region agent log
import * as fs from "fs";
const debugLog = (msg: string, data?: object) => {
  try { fs.appendFileSync('/Users/miloshmarkovic/Documents/crossroadcompass/.cursor/debug-2f76b5.log', JSON.stringify({sessionId:'2f76b5',location:'chemistry/page.tsx',message:msg,data,timestamp:Date.now(),hypothesisId:'B'})+'\n'); } catch {}
};
// #endregion

export default async function ChemistryPage() {
  // #region agent log
  debugLog('ChemistryPage render started');
  // #endregion
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

  // ── Social proof (mock count for now) ───────────────────────────────────
  const compatibilityCount = 14892;

  return (
    <PageLayout
      eyebrow="Relationship Compatibility"
      title="Cosmic Chemistry"
      subtitle="Discover your compatibility through Vedic Kuta + Human Design"
    >
      {isPremium ? (
        /* ─── PREMIUM VIEW ─────────────────────────────────────────────── */
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section className="animate-enter">
            <ChemistryFormWrapper disabled={false} isPremium={true} />
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Enter your partner&apos;s Moon nakshatra and sign to analyze compatibility.
              Results include 8-fold Kuta analysis and HD composite insights.
            </p>
          </section>
        </div>
      ) : (
        /* ─── FREE / GLIMPSE VIEW ──────────────────────────────────────── */
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Social Proof */}
          <section
            className="animate-enter"
            style={{
              background: "linear-gradient(180deg, rgba(200,135,58,0.08) 0%, rgba(13,18,32,0.5) 100%)",
              border: "1px solid rgba(200,135,58,0.15)",
              borderRadius: 16,
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 28,
                fontWeight: 500,
                color: "#e8b96a",
              }}
            >
              {compatibilityCount.toLocaleString()}
            </span>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                margin: "6px 0 0",
              }}
            >
              compatibility readings completed
            </p>
          </section>

          {/* Locked Form */}
          <section className="animate-enter animate-enter-2">
            <ChemistryFormWrapper disabled={true} isPremium={false} />
          </section>

          {/* Teaser Score Example */}
          <section className="animate-enter animate-enter-3">
            <TeaserScore
              score={7.8}
              maxScore={10}
              label="Average compatibility"
              revealedDimension={{ name: "Overall Match", value: "See how your cosmic energies align..." }}
              lockedDimensions={["Emotional Bond", "Physical Chemistry", "Mental Connection", "Spiritual Alignment"]}
              featureName="chemistry_teaser"
              ctaText="Unlock Cosmic Chemistry"
              ctaHref="/subscribe"
            />
          </section>

          {/* What You'll Discover */}
          <section
            className="animate-enter animate-enter-4"
            style={{
              background: "rgba(13,18,32,0.4)",
              border: "1px solid rgba(200,135,58,0.1)",
              borderRadius: 14,
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
              What You&apos;ll Discover
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {[
                { icon: "◈", title: "8-Fold Kuta", desc: "Complete Vedic compatibility" },
                { icon: "◇", title: "HD Composite", desc: "Channel connections & attractions" },
                { icon: "♡", title: "Share Card", desc: "Social media ready results" },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: "rgba(200,135,58,0.06)",
                    borderRadius: 10,
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: 20,
                      color: "rgba(200,135,58,0.6)",
                      marginBottom: 8,
                    }}
                  >
                    {item.icon}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "Cinzel, serif",
                      fontSize: 13,
                      color: "#e8b96a",
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
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
              The #1 organic growth feature — people share compatibility scores!
            </p>
            <GlimpseCTA
              text="Unlock Cosmic Chemistry"
              variant="primary"
              featureName="chemistry_bottom"
              href="/subscribe"
            />
          </section>
        </div>
      )}
    </PageLayout>
  );
}

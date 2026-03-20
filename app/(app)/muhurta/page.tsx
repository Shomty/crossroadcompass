// STATUS: done | Premium Features - Muhurta Finder
/**
 * app/(app)/muhurta/page.tsx
 * Muhurta Finder feature page - electional astrology.
 *
 * Tier behavior:
 *   FREE  → Current week timing windows (computed, no AI) + basic stats
 *   CORE  → Current week with AI narrative + HD guidance
 *   VIP   → Current week + next week with AI + monthly purchase CTA
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/PageLayout";
import { GlimpseCTA } from "@/components/glimpse";
import { MuhurtaFinder } from "@/components/muhurta/MuhurtaFinder";
import { calculateMuhurta } from "@/lib/astro/muhurtaService";
import { getMuhurtaWithInsight } from "@/lib/ai/muhurtaInsightService";
import type { SubscriptionTier } from "@/types";
import { TimingWindow } from "@/components/muhurta/TimingWindow";

const DAY_RULERS: Record<number, string> = {
  0: "Sun", 1: "Moon", 2: "Mars", 3: "Mercury",
  4: "Jupiter", 5: "Venus", 6: "Saturn",
};

export default async function MuhurtaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const birthProfile = await db.birthProfile.findUnique({ where: { userId } });
  if (!birthProfile) redirect("/onboarding");

  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { tier: true },
  });
  const tier = subscription?.tier ?? "FREE";
  const isAdmin = session.user?.email === "shomty@hotmail.com";
  const effectiveTier: SubscriptionTier = isAdmin ? "VIP" : (tier as SubscriptionTier);
  const isVip = effectiveTier === "VIP";
  const isPremium = effectiveTier === "CORE" || effectiveTier === "VIP";

  // ── Fetch data ───────────────────────────────────────────────────────────
  let muhurtaData = null;
  let muhurtaInsight = null;
  let freeData = null;

  if (isPremium) {
    const result = await getMuhurtaWithInsight(userId, birthProfile, "general", true, isVip ? 2 : 1);
    muhurtaData = result.data;
    muhurtaInsight = result.insight;
  } else {
    // FREE: compute windows + basic stats in parallel (no Gemini call)
    const [muhurta] = await Promise.allSettled([
      calculateMuhurta(userId, birthProfile, "general", 1),
    ]);
    freeData = muhurta.status === "fulfilled" ? muhurta.value : null;
  }

  const today = new Date();
  const todayDayRuler = DAY_RULERS[today.getDay()];

  return (
    <PageLayout
      eyebrow="Electional Astrology"
      title="Muhurta Finder"
      subtitle="Find your most auspicious timing windows"
    >
      {isPremium && muhurtaData ? (
        /* ─── PREMIUM / VIP VIEW ────────────────────────────────────────── */
        <MuhurtaFinder
          initialData={muhurtaData}
          insight={muhurtaInsight}
          isVip={isVip}
        />
      ) : (
        /* ─── FREE VIEW ─────────────────────────────────────────────────── */
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Basic stats row */}
          <section
            className="animate-enter"
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
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 12,
              }}
            >
              {[
                { label: "Your Authority", value: freeData?.hdAuthority ?? "—" },
                { label: "Your Strategy", value: freeData?.hdStrategy ?? "—" },
                { label: "Today's Ruler", value: todayDayRuler },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(200,135,58,0.08)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      color: "rgba(200,135,58,0.7)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {label}
                  </span>
                  <p
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 15,
                      color: "#e8b96a",
                      margin: "5px 0 0",
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Current week windows — visible but without AI narrative */}
          {freeData && freeData.windows.length > 0 && (
            <section className="animate-enter animate-enter-2">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: 16,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.9)",
                    margin: 0,
                  }}
                >
                  This Week&apos;s Best Windows
                </h3>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: "rgba(200,135,58,0.6)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {freeData.weekStart} → {freeData.weekEnd}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {freeData.windows.slice(0, 5).map((window, i) => (
                  <TimingWindow
                    key={i}
                    index={i}
                    date={window.date}
                    dayOfWeek={window.dayOfWeek}
                    timeRange={`${window.startTime} - ${window.endTime}`}
                    quality={window.quality}
                    planetaryHour={window.planetaryHour}
                    nakshatra={window.nakshatra}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Locked filters preview */}
          <section
            className="animate-enter animate-enter-3"
            style={{
              background: "rgba(13,18,32,0.4)",
              border: "1px solid rgba(200,135,58,0.1)",
              borderRadius: 14,
              padding: "1.25rem",
            }}
          >
            <h4
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 14,
                fontWeight: 400,
                color: "rgba(255,255,255,0.9)",
                margin: "0 0 12px",
              }}
            >
              Unlock with Core or VIP
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {["AI Narrative", "HD Authority Guidance", "Intention Filters", "Next Week (VIP)", "Full Month (VIP)"].map((feat) => (
                <span
                  key={feat}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 12px",
                    borderRadius: 16,
                    border: "1px solid rgba(200,135,58,0.15)",
                    background: "rgba(0,0,0,0.2)",
                    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  🔒 {feat}
                </span>
              ))}
            </div>
            <GlimpseCTA
              text="Unlock Full Muhurta Finder"
              variant="primary"
              featureName="muhurta_finder_free"
              href="/subscribe"
            />
          </section>
        </div>
      )}
    </PageLayout>
  );
}

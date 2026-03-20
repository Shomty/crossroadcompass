// STATUS: done | Phase 5 Feature Pages
/**
 * app/(app)/karma-timeline/page.tsx
 * Vimshottari Dasha Mahadasha timeline — birth to 120 years.
 *
 * Tier behaviour:
 *   FREE  → current period fully shown; next period TimelineCliff; rest collapsed
 *   CORE+ → all periods expanded with static guidance; AI insight for current period
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import { PageLayout } from "@/components/layout/PageLayout";
import { KarmaTimeline } from "@/components/insights/KarmaTimeline";
import type { SubscriptionTier } from "@/types";

export default async function KarmaTimelinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // ── Subscription ──────────────────────────────────────────────────────────
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { tier: true },
  });
  const tier = subscription?.tier ?? "FREE";
  const isAdmin = session.user.role === "ADMIN";
  const effectiveTier: SubscriptionTier = isAdmin ? "VIP" : (tier as SubscriptionTier);

  // ── Ensure Vedic chart + dasha rows exist ─────────────────────────────────
  const birthProfile = await db.birthProfile.findUnique({ where: { userId } });
  if (birthProfile) {
    try {
      await getOrCreateVedicChart(userId, birthProfile);
    } catch { /* fail silently */ }
  }

  // ── Load all Mahadasha periods ─────────────────────────────────────────────
  const allDashas = await db.dasha.findMany({
    where: { userId, level: "MAHADASHA" },
    orderBy: { startDate: "asc" },
  });

  // ── Determine current period ───────────────────────────────────────────────
  const now = new Date();
  const activeMaha = allDashas.find(
    (d) => d.startDate <= now && d.endDate >= now
  );

  // Serialize dates for client component
  const periods = allDashas.map((d) => ({
    id: d.id,
    planetName: d.planetName,
    startDate: d.startDate,
    endDate: d.endDate,
  }));

  return (
    <PageLayout
      eyebrow="Vimshottari Dasha"
      title="Karma Timeline"
      subtitle="Your complete cycle of planetary periods from birth to 120 years"
    >
      <section className="animate-enter animate-enter-2">
        <KarmaTimeline
          periods={periods}
          currentPeriodId={activeMaha?.id ?? null}
          userTier={effectiveTier}
        />
      </section>
    </PageLayout>
  );
}

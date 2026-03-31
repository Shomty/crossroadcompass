/**
 * Personalized Vedic Muhurta — transit × natal scoring (parallel to /muhurta UI).
 */

import { redirect } from "next/navigation";
import { getAppUserContext } from "@/lib/auth/appContext";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/PageLayout";
import { NewMuhurtaFinder } from "@/components/muhurta/NewMuhurtaFinder";
import { resolveSafeTimeZone } from "@/lib/astro/muhurta/safeTime";
import type { SubscriptionTier } from "@/types";

export default async function NewMuhurtaPage() {
  const ctx = await getAppUserContext();
  if (!ctx) redirect("/login");

  const birthProfile = await db.birthProfile.findUnique({
    where: { userId: ctx.userId },
  });
  if (!birthProfile) redirect("/onboarding");

  const subscription = await db.subscription.findUnique({
    where: { userId: ctx.userId },
    select: { tier: true },
  });
  const tier = subscription?.tier ?? "FREE";
  const isAdmin = ctx.isAdmin;
  const effectiveTier: SubscriptionTier = isAdmin ? "VIP" : (tier as SubscriptionTier);
  const isPremium = effectiveTier === "CORE" || effectiveTier === "VIP";

  return (
    <PageLayout
      eyebrow="Electional Astrology"
      title="Muhurta Finder (new)"
      subtitle="Personalised sidereal transit windows — functional benefics, Ashtakavarga, dasha, avastha"
    >
      <NewMuhurtaFinder
        timeZone={resolveSafeTimeZone(birthProfile.timezone)}
        isPremium={isPremium}
      />
    </PageLayout>
  );
}

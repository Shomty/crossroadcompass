/**
 * Puruṣārtha Muhūrta — Pañcāṅga, Pañcaka śuddhi, Lagna lord trika filter, Gaṇḍānta (BPHS-style).
 */

import { redirect } from "next/navigation";
import { getAppUserContext } from "@/lib/auth/appContext";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/PageLayout";
import { PurusharthaMuhurtaDashboard } from "@/components/muhurta/PurusharthaMuhurtaDashboard";
import { resolveSafeTimeZone } from "@/lib/astro/muhurta/safeTime";

export default async function PurusharthaMuhurtaPage() {
  const ctx = await getAppUserContext();
  if (!ctx) redirect("/login");

  const birthProfile = await db.birthProfile.findUnique({
    where: { userId: ctx.userId },
    select: {
      timezone: true,
      latitude: true,
      longitude: true,
      observationCity: true,
      observationLatitude: true,
      observationLongitude: true,
    },
  });
  if (!birthProfile) redirect("/onboarding");

  const tz = resolveSafeTimeZone(birthProfile.timezone);
  const lat = birthProfile.observationLatitude ?? birthProfile.latitude;
  const lng = birthProfile.observationLongitude ?? birthProfile.longitude;

  return (
    <PageLayout
      eyebrow="Electional Jyotiṣa"
      title="Puruṣārtha Muhūrta"
      subtitle="Five limbs, purity scoring, strong Lagna, and Gaṇḍānta safety — Swiss Ephemeris"
    >
      <PurusharthaMuhurtaDashboard
        defaultTimeZone={tz}
        defaultLatitude={lat}
        defaultLongitude={lng}
        defaultObservationCity={birthProfile.observationCity}
      />
    </PageLayout>
  );
}

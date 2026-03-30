// STATUS: done | Sky Observer Integration
/**
 * app/(app)/sky-observer/page.tsx
 * Real-time Vedic sky map — authenticated, all tiers.
 * Seeds the observer with the user's birth profile coordinates.
 */

import { redirect } from "next/navigation";
import { getAppUserContext } from "@/lib/auth/appContext";
import { db } from "@/lib/db";
import { SkyObserver } from "@/components/sky/SkyObserver";
import { PageLayout } from "@/components/layout/PageLayout";

export const metadata = {
  title: "Sky Observer — Crossroads Compass",
  description:
    "Real-time sidereal sky map showing planetary positions, yogas, and transits.",
};

export default async function SkyObserverPage() {
  const ctx = await getAppUserContext();
  if (!ctx) redirect("/login");

  const birthProfile = await db.birthProfile.findUnique({
    where: { userId: ctx.userId },
    select: {
      latitude: true,
      longitude: true,
      observationLatitude: true,
      observationLongitude: true,
    },
  });

  const lat =
    (birthProfile?.observationLatitude ?? birthProfile?.latitude) || null;
  const lon =
    (birthProfile?.observationLongitude ?? birthProfile?.longitude) || null;
  const isObservationLocation = birthProfile?.observationLatitude != null;

  return (
    <PageLayout
      className="sky-observer-page"
      eyebrow="Real-time Vedic Sky Map"
      title="Sky Observer"
      subtitle="Planetary positions · Active yogas · Transit events · Lahiri ayanamsa"
    >
      {/* Status badges */}
      <div
        className="animate-enter animate-enter-2"
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <span className="cc-tag cc-tag--amber">
          Sidereal · Geocentric · Lahiri
        </span>
        {lat != null && lon != null && (
          <span className="cc-tag">
            {isObservationLocation ? "Seeded from saved location" : "Seeded from birth profile"}
          </span>
        )}
      </div>

      {/* Sky Observer map */}
      <div className="animate-enter animate-enter-3">
        <SkyObserver defaultLat={lat} defaultLon={lon} />
      </div>
    </PageLayout>
  );
}

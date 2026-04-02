/**
 * /chart/sudarshana-chakra
 *
 * Sudarshana Chakra — three concentric rotated views of the natal chart.
 * Lagna Chakra (inner), Chandra Chakra (middle), Surya Chakra (outer).
 */
import { redirect } from "next/navigation";
import { getAppUserContext } from "@/lib/auth/appContext";
import { db } from "@/lib/db";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import {
  computeSudarshanChakra,
  extractPlanetPositions,
  extractHousePositions,
} from "@/lib/astro/sudarshanaChakraService";
import { SudarshanChakraPageClient } from "@/components/chart/SudarshanChakraPageClient";
import { PageLayout } from "@/components/layout/PageLayout";

export const metadata = {
  title: "Sudarshana Chakra",
  description:
    "Three-layered Vedic chart: Lagna, Chandra, and Surya Chakras — each revealing a different axis of your natal blueprint.",
};

export default async function SudarshanChakraPage() {
  const ctx = await getAppUserContext();
  if (!ctx) redirect("/login");

  const profile = await db.birthProfile.findUnique({
    where: { userId: ctx.userId },
  });
  if (!profile) redirect("/settings/profile");

  const chart = await getOrCreateVedicChart(ctx.userId, profile);
  const result = computeSudarshanChakra(chart);
  const planetPositions = extractPlanetPositions(chart);
  const housePositions = extractHousePositions(result);

  const lagnaSign = result.meta.lagnaSign;
  const lagnaLabel = lagnaSign
    ? `${lagnaSign.charAt(0).toUpperCase()}${lagnaSign.slice(1)} lagna`
    : "Natal chart";

  const subtitle =
    `${lagnaLabel} · Moon in house ${result.meta.moonHouse} · Sun in house ${result.meta.sunHouse}`;

  return (
    <PageLayout
      className="chart-page-root"
      eyebrow="Jyotish · Sudarshana Chakra"
      title="Sudarshana Chakra"
      subtitle={subtitle}
    >
      <SudarshanChakraPageClient
        result={result}
        planetPositions={planetPositions}
        housePositions={housePositions}
      />
    </PageLayout>
  );
}

/**
 * Natal Vedic chart — FE-01+ hub.
 */
import { redirect } from "next/navigation";
import { getAppUserContext } from "@/lib/auth/appContext";
import { db } from "@/lib/db";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import { serializeVedicChart } from "@/lib/astro/serializeVedicChart";
import { ChartPageClient } from "@/components/chart/ChartPageClient";
import { PageLayout } from "@/components/layout/PageLayout";

export default async function ChartPage() {
  const ctx = await getAppUserContext();
  if (!ctx) redirect("/login");

  const profile = await db.birthProfile.findUnique({
    where: { userId: ctx.userId },
  });
  if (!profile) redirect("/settings/profile");

  const chart = await getOrCreateVedicChart(ctx.userId, profile);
  const serialized = serializeVedicChart(chart);

  const lagnaSign = chart.ascendant?.sign;
  const lagnaLabel = lagnaSign
    ? `${lagnaSign.charAt(0).toUpperCase()}${lagnaSign.slice(1)} lagna`
    : "Natal chart";
  const subtitle = `${lagnaLabel} · explore planets, houses, periods, and divisional views below.`;

  return (
    <PageLayout
      className="chart-page-root"
      eyebrow="Jyotish · Natal wheel"
      title="Natal chart"
      subtitle={subtitle}
    >
      <ChartPageClient initialChart={serialized} birthTimeKnown={profile.birthTimeKnown} />
    </PageLayout>
  );
}

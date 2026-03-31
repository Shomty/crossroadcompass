/**
 * Unlisted Jhora rāśi preview — same shell as /chart, Chart tab uses @node-jhora/ui-react.
 * Access: admins always, or ?key=<JHORA_CHART_PREVIEW_SECRET> when that env var is set.
 * URL: /chart/jhora
 */
import { notFound, redirect } from "next/navigation";
import { getAppUserContext } from "@/lib/auth/appContext";
import { db } from "@/lib/db";
import { getOrCreateVedicChart } from "@/lib/astro/chartService";
import { serializeVedicChart } from "@/lib/astro/serializeVedicChart";
import { mapVedicChartToJhoraUi } from "@/lib/chart/vedicChartToJhoraUi";
import { ChartJhoraPageClient } from "@/components/chart/ChartJhoraPageClient";
import { PageLayout } from "@/components/layout/PageLayout";
import { env } from "@/lib/env";

export default async function ChartJhoraPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const ctx = await getAppUserContext();
  if (!ctx) redirect("/login");

  const sp = await searchParams;
  const secret = env.JHORA_CHART_PREVIEW_SECRET;
  const keyOk = Boolean(secret && sp.key === secret);
  if (!ctx.isAdmin && !keyOk) {
    notFound();
  }

  const profile = await db.birthProfile.findUnique({
    where: { userId: ctx.userId },
  });
  if (!profile) redirect("/settings/profile");

  const chart = await getOrCreateVedicChart(ctx.userId, profile);
  const serialized = serializeVedicChart(chart);
  const jhoraChart = mapVedicChartToJhoraUi(chart);

  const lagnaSign = chart.ascendant?.sign;
  const lagnaLabel = lagnaSign
    ? `${lagnaSign.charAt(0).toUpperCase()}${lagnaSign.slice(1)} lagna`
    : "Natal chart";
  const subtitle = `${lagnaLabel} · Jhora SVG preview (hidden). Same chart data as /chart.`;

  return (
    <PageLayout
      className="chart-page-root"
      eyebrow="Jyotish · Jhora preview"
      title="Natal chart (Jhora)"
      subtitle={subtitle}
    >
      <ChartJhoraPageClient
        initialChart={serialized}
        birthTimeKnown={profile.birthTimeKnown}
        jhoraChart={jhoraChart}
      />
    </PageLayout>
  );
}

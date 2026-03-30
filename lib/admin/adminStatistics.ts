import { db } from "@/lib/db";

const CORE_MRR_USD = 29;
const VIP_QUARTER_USD = 497;
const VIP_MRR_USD = VIP_QUARTER_USD / 3;

export type AdminStatisticsPayload = {
  mrr: number;
  activeUsers: number;
  freeCount: number;
  seekerCount: number;
  navigatorCount: number;
  churnRate30d: number;
  conversionRate: number;
  sessionsBooked30d: number;
  mrrTrend: { date: string; value: number }[];
  insightOpenRate: number;
  reportGeneratedCount: number;
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function computeAdminStatistics(): Promise<AdminStatisticsPayload> {
  const now = new Date();
  const thirtyAgo = new Date(now);
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);

  const subs = await db.subscription.findMany({
    select: {
      tier: true,
      status: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  const active = subs.filter((s) => s.status === "ACTIVE");
  const activePaid = active.filter((s) => s.tier !== "FREE");

  let mrr = 0;
  let freeCount = 0;
  let seekerCount = 0;
  let navigatorCount = 0;

  for (const s of active) {
    if (s.tier === "FREE") freeCount += 1;
    else if (s.tier === "CORE") {
      seekerCount += 1;
      mrr += CORE_MRR_USD;
    } else if (s.tier === "VIP") {
      navigatorCount += 1;
      mrr += VIP_MRR_USD;
    }
  }

  const cancelled30 = subs.filter(
    (s) =>
      s.status === "CANCELLED" &&
      s.updatedAt >= thirtyAgo &&
      s.updatedAt <= now
  ).length;
  const activeApprox30 = Math.max(1, active.length);
  const churnRate30d = (cancelled30 / activeApprox30) * 100;

  const newUsers30 = await db.user.count({
    where: { createdAt: { gte: thirtyAgo } },
  });
  const upgraded30 = await db.subscription.count({
    where: {
      tier: { in: ["CORE", "VIP"] },
      updatedAt: { gte: thirtyAgo },
      createdAt: { gte: thirtyAgo },
    },
  });
  const conversionRate =
    newUsers30 > 0 ? (upgraded30 / newUsers30) * 100 : 0;

  const sessionsBooked30d = await db.consultationBooking.count({
    where: { createdAt: { gte: thirtyAgo } },
  });

  const delivered = await db.insight.count({
    where: { deliveredAt: { not: null } },
  });
  const engaged = await db.insight.count({
    where: {
      deliveredAt: { not: null },
      OR: [
        { insightFeedback: { not: null } },
        { accuracyRating: { not: null } },
      ],
    },
  });
  const insightOpenRate = delivered > 0 ? (engaged / delivered) * 100 : 0;

  const reportGeneratedCount = await db.generatedReport.count({
    where: { status: "DONE" },
  });

  const mrrTrend: { date: string; value: number }[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    mrrTrend.push({ date: isoDate(d), value: Math.round(mrr * 100) / 100 });
  }

  return {
    mrr: Math.round(mrr * 100) / 100,
    activeUsers: active.length,
    freeCount,
    seekerCount,
    navigatorCount,
    churnRate30d: Math.round(churnRate30d * 100) / 100,
    conversionRate: Math.round(conversionRate * 100) / 100,
    sessionsBooked30d,
    mrrTrend,
    insightOpenRate: Math.round(insightOpenRate * 100) / 100,
    reportGeneratedCount,
  };
}

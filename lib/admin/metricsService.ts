// STATUS: done | Task Admin-11
import { db } from "@/lib/db";

export interface InsightMetrics {
  totalGenerated: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  approvalRate: number;
  avgQueueTimeHours: number;
  byHdType: Array<{ hdType: string; count: number; approved: number; approvalRate: number }>;
  lowRatedInsights: Array<{
    id: string;
    type: string;
    content: string;
    generatedAt: Date;
  }>;
}

export async function getInsightMetrics(days: number): Promise<InsightMetrics> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const insights = await db.insight.findMany({
    where: { generatedAt: { gte: since } },
    include: {
      user: { select: { birthProfile: { select: { hdType: true } } } },
    },
  });

  const totalGenerated = insights.length;
  const totalApproved = insights.filter((i) => i.reviewedByConsultant).length;
  const totalRejected = insights.filter((i) => i.rejectedAt !== null).length;
  const totalPending = insights.filter((i) => !i.reviewedByConsultant && i.rejectedAt === null).length;
  const approvalRate = totalGenerated > 0 ? Math.round((totalApproved / totalGenerated) * 100) : 0;

  // Avg queue time (generatedAt → reviewedAt)
  const reviewed = insights.filter((i) => i.reviewedByConsultant && i.reviewedAt && i.generatedAt);
  const avgQueueTimeMs =
    reviewed.length > 0
      ? reviewed.reduce((sum, i) => sum + (i.reviewedAt!.getTime() - i.generatedAt.getTime()), 0) / reviewed.length
      : 0;
  const avgQueueTimeHours = Math.round(avgQueueTimeMs / (1000 * 60 * 60) * 10) / 10;

  // By HD type
  const hdTypeMap: Record<string, { count: number; approved: number }> = {};
  for (const ins of insights) {
    const hdType = ins.user.birthProfile?.hdType ?? "Unknown";
    if (!hdTypeMap[hdType]) hdTypeMap[hdType] = { count: 0, approved: 0 };
    hdTypeMap[hdType].count++;
    if (ins.reviewedByConsultant) hdTypeMap[hdType].approved++;
  }
  const byHdType = Object.entries(hdTypeMap).map(([hdType, data]) => ({
    hdType,
    count: data.count,
    approved: data.approved,
    approvalRate: data.count > 0 ? Math.round((data.approved / data.count) * 100) : 0,
  }));

  // Low-rated: pending review (proxy for low quality until rating system is in place)
  const lowRatedInsights = insights
    .filter((i) => i.rejectedAt !== null)
    .slice(0, 20)
    .map((i) => ({
      id: i.id,
      type: i.type as string,
      content: (i.content as string).slice(0, 200),
      generatedAt: i.generatedAt,
    }));

  return {
    totalGenerated,
    totalApproved,
    totalRejected,
    totalPending,
    approvalRate,
    avgQueueTimeHours,
    byHdType,
    lowRatedInsights,
  };
}

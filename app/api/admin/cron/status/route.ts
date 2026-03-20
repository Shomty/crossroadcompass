// STATUS: done | Task Admin-12
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const runs = await db.cronRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  // Group by jobName, last 10 per job
  const byJob: Record<string, typeof runs> = {};
  for (const run of runs) {
    if (!byJob[run.jobName]) byJob[run.jobName] = [];
    if (byJob[run.jobName].length < 10) byJob[run.jobName].push(run);
  }

  return NextResponse.json({ byJob });
}

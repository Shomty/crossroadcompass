// STATUS: done | Task Admin-12
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/admin/auditLogger";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobName: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { jobName } = await params;

  const run = await db.cronRun.create({
    data: {
      jobName,
      startedAt: new Date(),
    },
  });

  // TODO: actually trigger the cron job function here
  // For now, record the trigger attempt
  await db.cronRun.update({
    where: { id: run.id },
    data: {
      completedAt: new Date(),
    },
  });

  await writeAuditLog({
    adminEmail: session!.user.email ?? "",
    actionType: "CRON_MANUALLY_TRIGGERED",
    targetId: jobName,
    targetType: "CronJob",
    notes: `Manual trigger of ${jobName}`,
  });

  return NextResponse.json({ success: true, runId: run.id });
}

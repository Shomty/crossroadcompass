// STATUS: done | Task Admin-12
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import { CronMonitor } from "@/components/admin/CronMonitor";

export const dynamic = "force-dynamic";

export default async function CronPage() {
  await requireAdminSession();

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

  // Ensure generate-insights appears even if no runs
  if (!byJob["generate-insights"]) byJob["generate-insights"] = [];

  const serialized = Object.fromEntries(
    Object.entries(byJob).map(([k, runs]) => [
      k,
      runs.map((r) => ({
        ...r,
        startedAt: r.startedAt.toISOString(),
        completedAt: r.completedAt?.toISOString() ?? null,
      })),
    ])
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "var(--font-display, 'Cormorant Garamond')",
          fontSize: 28,
          fontWeight: 400,
          color: "#f0dca0",
          margin: 0,
          marginBottom: 6,
        }}>
          Cron Jobs
        </h1>
        <p style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#606880", margin: 0 }}>
          Monitor and manually trigger scheduled jobs
        </p>
      </div>
      <CronMonitor byJob={serialized} />
    </div>
  );
}

// STATUS: done | Task Admin-12
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/admin/auditLogger";
import { db } from "@/lib/db";

const DEFAULT_CONFIG = [
  { key: "MAX_USERS_PER_CRON_RUN", value: "50" },
  { key: "INSIGHT_GENERATION_HOUR_UTC", value: "4" },
  { key: "DAILY_MAX_TOKENS", value: "800" },
  { key: "WEEKLY_MAX_TOKENS", value: "1200" },
  { key: "MONTHLY_MAX_TOKENS", value: "1500" },
];

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const configs = await db.systemConfig.findMany({ orderBy: { key: "asc" } });

  // Merge with defaults for display
  const configMap = Object.fromEntries(configs.map((c) => [c.key, c]));
  const merged = DEFAULT_CONFIG.map((d) => ({
    key: d.key,
    value: configMap[d.key]?.value ?? d.value,
    updatedAt: configMap[d.key]?.updatedAt ?? null,
    updatedBy: configMap[d.key]?.updatedBy ?? null,
  }));

  return NextResponse.json({ configs: merged });
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const body = await request.json();
  const { key, value } = body as { key: string; value: string };

  if (!key || value === undefined) {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  const before = await db.systemConfig.findUnique({ where: { key } });

  const config = await db.systemConfig.upsert({
    where: { key },
    create: { key, value, updatedBy: session!.user.email ?? "" },
    update: { value, updatedBy: session!.user.email ?? "" },
  });

  await writeAuditLog({
    adminEmail: session!.user.email ?? "",
    actionType: "CONFIG_CHANGED",
    targetId: key,
    targetType: "SystemConfig",
    before: { value: before?.value },
    after: { value },
  });

  return NextResponse.json({ config });
}

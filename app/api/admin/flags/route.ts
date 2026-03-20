// STATUS: done | Task Admin-12
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/admin/auditLogger";
import { db } from "@/lib/db";

const DEFAULT_FLAGS = [
  { key: "CONTENT_REVIEW_REQUIRED", value: true },
  { key: "DAILY_INSIGHTS_ENABLED", value: true },
  { key: "WEEKLY_INSIGHTS_ENABLED", value: true },
  { key: "MONTHLY_REPORTS_ENABLED", value: true },
  { key: "CONSULTATION_BOOKING_ENABLED", value: true },
];

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const flags = await db.featureFlag.findMany({ orderBy: { key: "asc" } });
  const flagMap = Object.fromEntries(flags.map((f) => [f.key, f]));

  const merged = DEFAULT_FLAGS.map((d) => ({
    key: d.key,
    value: flagMap[d.key]?.value ?? d.value,
    updatedAt: flagMap[d.key]?.updatedAt ?? null,
    updatedBy: flagMap[d.key]?.updatedBy ?? null,
  }));

  return NextResponse.json({ flags: merged });
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const body = await request.json();
  const { key, value } = body as { key: string; value: boolean };

  if (!key || typeof value !== "boolean") {
    return NextResponse.json({ error: "key (string) and value (boolean) required" }, { status: 400 });
  }

  const before = await db.featureFlag.findUnique({ where: { key } });

  const flag = await db.featureFlag.upsert({
    where: { key },
    create: { key, value, updatedBy: session!.user.email ?? "" },
    update: { value, updatedBy: session!.user.email ?? "" },
  });

  await writeAuditLog({
    adminEmail: session!.user.email ?? "",
    actionType: "FEATURE_FLAG_TOGGLED",
    targetId: key,
    targetType: "FeatureFlag",
    before: { value: before?.value },
    after: { value },
  });

  return NextResponse.json({ flag });
}

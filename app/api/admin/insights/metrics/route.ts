// STATUS: done | Task Admin-11
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { getInsightMetrics } from "@/lib/admin/metricsService";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") ?? "7");
  const validDays = [7, 30].includes(days) ? days : 7;

  const metrics = await getInsightMetrics(validDays);
  return NextResponse.json({ metrics });
}

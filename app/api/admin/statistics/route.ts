import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { computeAdminStatistics } from "@/lib/admin/adminStatistics";

export async function GET(request: Request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const stats = await computeAdminStatistics();
  return NextResponse.json(stats);
}

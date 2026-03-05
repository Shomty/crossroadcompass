/**
 * app/api/report/route.ts
 * GET /api/report
 * Returns the latest INITIAL HD report for the authenticated user.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLatestHDReport } from "@/lib/ai/hdReportService";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await getLatestHDReport(session.user.id);

  if (!report) {
    return NextResponse.json({ report: null });
  }

  return NextResponse.json({ report });
}

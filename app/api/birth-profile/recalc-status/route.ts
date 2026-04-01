// STATUS: done | Synthesis Engine Phase 3.2
/**
 * GET /api/birth-profile/recalc-status
 * Check the status of background recalculation.
 * Returns: { status: 'pending'|'running'|'done'|'error', progress: 0-100, ... }
 * Returns null if no recalculation in progress.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRecalcStatus, clearRecalcStatus } from "@/lib/astro/recalculationService";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = await getRecalcStatus(session.user.id);

    // Auto-clear "done" status after 1 second (UI polls this)
    if (status?.status === 'done') {
      // Optional: clear after response sent
      // await clearRecalcStatus(session.user.id);
    }

    return NextResponse.json({
      status,
      isRecalculating: status?.status === 'running' || status?.status === 'pending',
    });
  } catch (e) {
    console.error("[GET /api/birth-profile/recalc-status]", e);
    const message = e instanceof Error ? e.message : "Status check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

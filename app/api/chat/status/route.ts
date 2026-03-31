import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/helpers";
import { getRateLimitStatus } from "@/lib/ai/chatRateLimiter";
import {
  ensureActiveSession,
  loadThread,
} from "@/lib/ai/chatSessions";
import { db } from "@/lib/db";
import type { ChatRole } from "@/types";

export async function GET(): Promise<NextResponse> {
  let session: Awaited<ReturnType<typeof getRequiredSession>>;
  try {
    session = await getRequiredSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { tier: true },
  });
  const tier = (subscription?.tier ?? "FREE") as import("@/types").SubscriptionTier;

  const status = await getRateLimitStatus(session.user.id, tier);

  const sessionId = await ensureActiveSession(session.user.id);
  let history: Array<{ role: ChatRole; content: string }> = [];
  try {
    history = await loadThread(session.user.id, sessionId);
  } catch {
    /* non-critical */
  }

  return NextResponse.json({
    tier,
    remaining: status.remaining,
    resetAt: status.resetAt.toISOString(),
    unlimited: tier !== "FREE",
    history,
    sessionId,
    persistenceEnabled: true,
  });
}

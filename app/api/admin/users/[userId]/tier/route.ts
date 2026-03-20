// STATUS: done | Task Admin-10
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/admin/auditLogger";
import { db } from "@/lib/db";
import { SubscriptionTier } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { userId } = await params;
  const body = await request.json();
  const { tier, reason } = body as { tier: SubscriptionTier; reason?: string };

  if (!tier || !["FREE", "CORE", "VIP"].includes(tier)) {
    return NextResponse.json({ error: "Valid tier required: FREE | CORE | VIP" }, { status: 400 });
  }

  const before = await db.subscription.findUnique({ where: { userId }, select: { tier: true } });

  const subscription = await db.subscription.upsert({
    where: { userId },
    create: { userId, tier, status: "ACTIVE" },
    update: { tier },
  });

  await writeAuditLog({
    adminEmail: session!.user.email ?? "",
    actionType: "USER_TIER_CHANGED",
    targetId: userId,
    targetType: "User",
    before: { tier: before?.tier },
    after: { tier },
    notes: reason,
  });

  return NextResponse.json({ subscription });
}

// STATUS: done | Task Admin-10
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/auth/adminHelpers";
import { db } from "@/lib/db";
import type { SubscriptionStatus, SubscriptionTier } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  const { userId } = await params;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      birthProfile: {
        select: {
          birthDate: true,
          birthTimeKnown: true,
          birthHour: true,
          birthMinute: true,
          birthCity: true,
          birthCountry: true,
          timezone: true,
          hdType: true,
          hdStrategy: true,
          hdAuthority: true,
          hdProfile: true,
          chartDataHumanDesign: true,
          chartDataVedic: true,
          profileVersion: true,
        },
      },
      insights: {
        orderBy: { generatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          type: true,
          generatedAt: true,
          deliveredAt: true,
          reviewedByConsultant: true,
          rejectedAt: true,
        },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      reportPurchases: {
        orderBy: { purchasedAt: "desc" },
        take: 10,
        include: {
          reportProduct: { select: { id: true, title: true, slug: true } },
          generatedReport: {
            select: {
              id: true,
              status: true,
              generatedAt: true,
              errorMsg: true,
            },
          },
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const vedicCached = !!user.birthProfile?.chartDataVedic;
  const hdCached = !!user.birthProfile?.chartDataHumanDesign;

  return NextResponse.json({
    user: {
      ...user,
      birthProfile: user.birthProfile
        ? {
            ...user.birthProfile,
            chartDataHumanDesign: undefined,
            chartDataVedic: undefined,
          }
        : null,
      vedicChartCached: vedicCached,
      hdChartCached: hdCached,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { userId } = await params;
  const adminEmail = session!.user.email ?? "admin";

  let body: {
    subscriptionTier?: SubscriptionTier;
    subscriptionStatus?: SubscriptionStatus;
    isAdmin?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (body.subscriptionTier !== undefined) {
    await db.subscription.upsert({
      where: { userId },
      create: { userId, tier: body.subscriptionTier },
      update: { tier: body.subscriptionTier },
    });
    await writeAuditLog({
      adminEmail,
      action: "user.patch",
      targetType: "user",
      targetId: userId,
      detail: `subscriptionTier=${body.subscriptionTier}`,
    });
  }

  if (body.subscriptionStatus !== undefined) {
    await db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        tier: "FREE",
        status: body.subscriptionStatus,
      },
      update: { status: body.subscriptionStatus },
    });
    await writeAuditLog({
      adminEmail,
      action: "user.patch",
      targetType: "user",
      targetId: userId,
      detail: `subscriptionStatus=${body.subscriptionStatus}`,
    });
  }

  if (body.isAdmin !== undefined) {
    const actorAdmin =
      session!.user.role === "ADMIN" || session!.user.isAdmin === true;
    if (!actorAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await db.user.update({
      where: { id: userId },
      data: {
        isAdmin: body.isAdmin,
        role: body.isAdmin ? "ADMIN" : "USER",
      },
    });
    await writeAuditLog({
      adminEmail,
      action: "user.patch",
      targetType: "user",
      targetId: userId,
      detail: `isAdmin=${body.isAdmin}`,
    });
  }

  return NextResponse.json({ ok: true });
}

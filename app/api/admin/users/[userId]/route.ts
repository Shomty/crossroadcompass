// STATUS: done | Task Admin-10
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";

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
          birthCity: true,
          birthCountry: true,
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
        take: 10,
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
        take: 5,
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user });
}

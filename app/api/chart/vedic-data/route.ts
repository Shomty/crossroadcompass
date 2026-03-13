import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await db.birthProfile.findUnique({
    where: { userId: session.user.id },
    select: { chartDataVedic: true, birthName: true },
  });

  if (!profile?.chartDataVedic) {
    return NextResponse.json(
      { error: "No chart data available yet. Visit your dashboard to generate your chart." },
      { status: 404 }
    );
  }

  const json = JSON.stringify(profile.chartDataVedic, null, 2);
  const slug = (profile.birthName ?? "chart").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const filename = `vedic-chart-${slug}.json`;

  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

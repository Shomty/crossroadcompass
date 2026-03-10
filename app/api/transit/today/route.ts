/**
 * app/api/transit/today/route.ts
 * POST /api/transit/today
 *
 * Generates a Vedic birth chart for the current date/time and the user's
 * supplied location. Date and time are resolved server-side at request time.
 *
 * Body: { location: string }  — e.g. "Skopje, North Macedonia"
 * Auth: session required.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { fetchVedicNatalChart } from "@/lib/astro/vedicApiClient";

const bodySchema = z.object({
  location: z.string().min(1, "Location is required"),
});

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { location } = parsed.data;
  const name = session.user.name ?? session.user.email?.split("@")[0] ?? "User";

  // Resolve current date and time server-side at moment of request
  const now = new Date();
  const dateOfBirth = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  const timeOfBirth = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

  try {
    const chart = await fetchVedicNatalChart({
      dateOfBirth,
      timeOfBirth,
      location,
      isTimeApproximate: false,
      gender: "male",
      name,
    });

    return NextResponse.json({
      chart,
      meta: {
        name,
        dateOfBirth,
        timeOfBirth,
        location,
        generatedAt: now.toISOString(),
      },
    });
  } catch (err) {
    console.error("[transit/today] Vedic API error:", err);
    return NextResponse.json(
      { error: "Chart generation failed. Please try again." },
      { status: 502 }
    );
  }
}

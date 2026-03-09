/**
 * app/api/birth-profile/route.ts
 * Create or update a user's birth profile.
 *
 * POST /api/birth-profile — create profile (new user)
 * PATCH /api/birth-profile — update birth data (triggers cache invalidation)
 *
 * Birth data update flow (copilot-instructions section 19):
 *   1. Validate with Zod
 *   2. Prisma transaction:
 *      a. Update BirthProfile fields
 *      b. Increment profileVersion
 *      c. Null chartDataVedic + chartDataHumanDesign
 *      d. Delete all Dasha rows for this userId
 *   3. Return immediately (chart recalculation is async — see TODO below)
 *   4. Notify user that past insights used prior data (AC-04)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
// chartService imports Swiss Ephemeris native binaries — loaded lazily to avoid
// module evaluation errors when the route is first compiled.
async function getChartService() {
  return import("@/lib/astro/chartService");
}

// ─── GET — fetch birth profile ─────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await db.birthProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      birthName: true, birthDate: true, birthTimeKnown: true,
      birthHour: true, birthMinute: true, gender: true,
      birthCity: true, birthCountry: true, latitude: true,
      longitude: true, timezone: true, profileVersion: true,
    },
  });
  if (!profile) return NextResponse.json({ error: "No profile found" }, { status: 404 });
  return NextResponse.json({ profile });
}

// ─── Validation schema ─────────────────────────────────────────────────────

const birthDataSchema = z.object({
  birthName: z.string().min(1).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  birthTimeKnown: z.boolean(),
  birthHour: z.number().int().min(0).max(23).optional().nullable(),
  birthMinute: z.number().int().min(0).max(59).optional().nullable(),
  birthCity: z.string().min(1).max(100),
  birthCountry: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1), // IANA timezone e.g. "Europe/Belgrade"
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  // Onboarding intake fields (OB-05) — optional, present on first create only
  intakeLifeSituation: z.string().max(500).optional().nullable(),
  intakePrimaryFocus: z.string().max(500).optional().nullable(),
  intakeWantsClarity: z.string().max(500).optional().nullable(),
}).refine(
  (d) =>
    !d.birthTimeKnown ||
    (d.birthHour !== undefined &&
      d.birthHour !== null &&
      d.birthMinute !== undefined &&
      d.birthMinute !== null),
  { message: "birthHour and birthMinute are required when birthTimeKnown=true" }
);

// ─── POST — create birth profile ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = birthDataSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const existing = await db.birthProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Birth profile already exists. Use PATCH to update." },
      { status: 409 }
    );
  }

  const data = parsed.data;
  const profile = await db.birthProfile.create({
    data: {
      userId: session.user.id,
      birthDate: new Date(`${data.birthDate}T00:00:00.000Z`),
      birthTimeKnown: data.birthTimeKnown,
      birthHour: data.birthTimeKnown ? data.birthHour : null,
      birthMinute: data.birthTimeKnown ? data.birthMinute : null,
      birthCity: data.birthCity,
      birthCountry: data.birthCountry,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      birthName: data.birthName,
      gender: data.gender ?? null,
      intakeLifeSituation: data.intakeLifeSituation,
      intakePrimaryFocus: data.intakePrimaryFocus,
      intakeWantsClarity: data.intakeWantsClarity,
    },
  });

  // Pre-calculate both charts in the background so dashboard data is ready immediately.
  // Fire-and-forget — don't await so the 201 response is immediate.
  const userId = session.user.id;
  void getChartService().then(({ getOrCreateHDChart, getOrCreateVedicChart }) =>
    Promise.all([
      getOrCreateHDChart(userId, profile),
      // Vedic chart populates the Dasha table — required for DashaCard to show Current Period
      getOrCreateVedicChart(userId, profile),
    ])
  ).catch((err) =>
    console.error("[birth-profile] chart pre-calc failed:", err)
  );

  return NextResponse.json({ profileId: profile.id }, { status: 201 });
}

// ─── PATCH — update birth data ────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = birthDataSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const existing = await db.birthProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "No birth profile found. Use POST to create one." },
      { status: 404 }
    );
  }

  const data = parsed.data;
  const userId = session.user.id; // narrowed: checked above

  // Atomic transaction: update birth data + null cached chart columns + delete dashas
  await db.$transaction(async (tx) => {
    await tx.birthProfile.update({
      where: { userId },
      data: {
        birthDate: new Date(`${data.birthDate}T00:00:00.000Z`),
        birthTimeKnown: data.birthTimeKnown,
        birthHour: data.birthTimeKnown ? data.birthHour : null,
        birthMinute: data.birthTimeKnown ? data.birthMinute : null,
        birthCity: data.birthCity,
        birthCountry: data.birthCountry,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        birthName: data.birthName,
        gender: data.gender ?? null,
        profileVersion: { increment: 1 },
        chartDataHumanDesign: Prisma.DbNull,
        hdProfileVersion: null,
        chartDataVedic: Prisma.DbNull,
        vedicProfileVersion: null,
      },
    });

    // Delete stale dasha rows — regenerated from new natal chart
    await tx.dasha.deleteMany({ where: { userId } });
  });

  // Invalidate KV cache keys (separate from DB tx — KV is not transactional)
  const { invalidateChartCache, getOrCreateHDChart, getOrCreateVedicChart } = await getChartService();
  await invalidateChartCache(userId);

  // Re-fetch both charts in the background so dashboard data is ready immediately.
  const updatedProfile = await db.birthProfile.findUnique({ where: { userId } });
  if (updatedProfile) {
    void Promise.all([
      getOrCreateHDChart(userId, updatedProfile),
      // Vedic chart re-populates the Dasha table after birth data change
      getOrCreateVedicChart(userId, updatedProfile),
    ]).catch((err) =>
      console.error("[birth-profile] chart re-calc failed:", err)
    );
  }

  // AC-04: notify user that past insights were based on prior birth data
  return NextResponse.json({
    updated: true,
    notice:
      "Your chart has been updated. Past insights were generated using your previous birth data.",
  });
}

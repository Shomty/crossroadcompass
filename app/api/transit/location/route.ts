/**
 * app/api/transit/location/route.ts
 * POST /api/transit/location
 *
 * Saves the user's current observation location for transit calculations.
 * Called when the user clicks "Detect my location" in Settings.
 *
 * Body: { latitude: number, longitude: number }
 * Returns: { city: string } — human-readable label saved to DB
 *
 * Side effects:
 *   - Reverse-geocodes lat/lng via Nominatim
 *   - Updates BirthProfile.observationLatitude/Longitude/City
 *   - Busts the KV transit cache so next reading uses the new location
 *
 * DELETE /api/transit/location — clears observation location (reverts to birth location)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kvDelete } from "@/lib/kv/helpers";
import { kvKeys } from "@/lib/kv/keys";

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  country?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: { "User-Agent": "CrossroadCompass/1.0 (contact@crossroadscompass.com)" },
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data = (await res.json()) as NominatimResponse;
    const addr = data.address ?? {};
    const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? "";
    const country = addr.country ?? "";
    return [city, country].filter(Boolean).join(", ") || `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  } catch (err) {
    console.error("[transit/location] Nominatim error:", err);
    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let latitude: number, longitude: number;
  try {
    const body = (await req.json()) as { latitude?: unknown; longitude?: unknown };
    latitude = Number(body.latitude);
    longitude = Number(body.longitude);
    if (isNaN(latitude) || isNaN(longitude)) throw new Error("Invalid coords");
  } catch {
    return NextResponse.json({ error: "Body must include { latitude, longitude }" }, { status: 400 });
  }

  const city = await reverseGeocode(latitude, longitude);

  // Persist to BirthProfile
  await db.birthProfile.update({
    where: { userId },
    data: { observationLatitude: latitude, observationLongitude: longitude, observationCity: city },
  });

  // Bust today's transit KV cache so next reading uses new location
  const profile = await db.birthProfile.findUnique({ where: { userId }, select: { timezone: true } });
  if (profile) {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: profile.timezone,
      year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
    await kvDelete(kvKeys.transit(userId, today));
  }

  return NextResponse.json({ city });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  await db.birthProfile.update({
    where: { userId },
    data: { observationLatitude: null, observationLongitude: null, observationCity: null },
  });

  return NextResponse.json({ ok: true });
}

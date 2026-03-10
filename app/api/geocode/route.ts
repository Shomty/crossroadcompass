/**
 * app/api/geocode/route.ts
 * Server-side geocoding proxy using Photon (photon.komoot.io) — free, no API key,
 * OpenStreetMap-based. Falls back to Nominatim if Photon fails.
 * Also resolves IANA timezone via geo-tz.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
// tz-lookup: pure-JS timezone lookup (no filesystem reads — works in Turbopack)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tzlookup = require("tz-lookup") as (lat: number, lon: number) => string;

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    postcode?: string;
  };
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

function buildDisplayName(p: PhotonFeature["properties"]): string {
  const parts = [p.name, p.city, p.state, p.country].filter(
    (v, i, arr) => v && arr.indexOf(v) === i   // deduplicate
  );
  return parts.join(", ");
}

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");

  // ── Reverse geocode mode: ?lat=&lon= ───────────────────────────────────
  if (lat && lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json&zoom=10&addressdetails=1`;
      const res = await fetch(url, {
        cache: "no-store",
        headers: { "User-Agent": "CrossroadsCompass/1.0 (contact@crossroadscompass.com)" },
      });
      if (!res.ok) throw new Error(`Nominatim reverse HTTP ${res.status}`);
      const data = await res.json();
      const a = data.address ?? {};
      const city = a.city ?? a.town ?? a.village ?? a.county ?? "";
      const country = a.country ?? "";
      const displayName = [city, country].filter(Boolean).join(", ") || data.display_name;
      return NextResponse.json({ displayName });
    } catch (e) {
      console.error("[geocode/reverse] error:", e);
      return NextResponse.json({ error: "Reverse geocoding failed" }, { status: 502 });
    }
  }

  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing query parameter q" }, { status: 400 });
  }

  // ── Primary: Photon (Komoot) ────────────────────────────────────────────
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=en`;
    const res = await fetch(url, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const features: PhotonFeature[] = data.features ?? [];
      if (features.length > 0) {
        const places = features.map((f) => {
          const [lon, lat] = f.geometry.coordinates;
          return {
            displayName: buildDisplayName(f.properties),
            lat,
            lon,
            timezone: tzlookup(lat, lon) ?? "UTC",
          };
        });
        return NextResponse.json({ places });
      }
    }
  } catch (e) {
    console.error("[geocode] Photon error:", e);
    // Fall through to Nominatim
  }

  // ── Fallback: Nominatim (OpenStreetMap) ────────────────────────────────
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "CrossroadsCompass/1.0 (contact@crossroadscompass.com)" },
    });
    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const results: NominatimResult[] = await res.json();
    const places = results.map((r) => {
      const lat = parseFloat(r.lat);
      const lon = parseFloat(r.lon);
      return { displayName: r.display_name, lat, lon, timezone: tzlookup(lat, lon) ?? "UTC" };
    });
    return NextResponse.json({ places });
  } catch (e) {
    console.error("[geocode] Nominatim error:", e);
    return NextResponse.json({ error: "Geocoding service unavailable. Please try again." }, { status: 502 });
  }
}

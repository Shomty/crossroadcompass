/**
 * Client helper — delegates to `/api/geocode` (single server implementation).
 */
export interface GeocodePlace {
  displayName: string;
  lat: number;
  lon: number;
  timezone: string;
}

export async function geocodeLocation(query: string): Promise<GeocodePlace[] | null> {
  const q = query.trim();
  if (!q) return null;
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    const data = (await res.json()) as { places?: GeocodePlace[]; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Geocoding failed");
    return data.places ?? [];
  } catch {
    return null;
  }
}

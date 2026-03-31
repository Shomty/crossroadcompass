import type { BirthProfile } from "@prisma/client";
import { DateTime } from "luxon";
import { init, NodeJHora } from "@node-jhora/core";
import {
  mapJhoraChartToUiReact,
  type JhoraUiChartProps,
} from "@/lib/chart/mapJhoraChartToUiReact";

/**
 * Same calendar + wall-clock interpretation as prismaProfileToBirthInfo:
 * date parts from stored birthDate (UTC fields), time in profile.timezone.
 */
export function birthProfileToUtcInstant(profile: BirthProfile): Date {
  const d = new Date(profile.birthDate);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hour = profile.birthTimeKnown ? (profile.birthHour ?? 12) : 12;
  const minute = profile.birthTimeKnown ? (profile.birthMinute ?? 0) : 0;
  const zone = profile.timezone?.trim() || "UTC";
  const local = DateTime.fromObject(
    { year: y, month: m, day: day, hour, minute, second: 0 },
    { zone }
  );
  return local.toUTC().toJSDate();
}

/**
 * Standalone whole-sign chart via @node-jhora/core (separate ephemeris from openastrology).
 * For UI next to NatalChartGrid, prefer mapVedicChartToJhoraUi so data matches.
 */
export async function computeJhoraUiChartFromProfile(
  profile: BirthProfile
): Promise<JhoraUiChartProps | null> {
  try {
    await init();
    const jh = new NodeJHora({
      latitude: profile.latitude,
      longitude: profile.longitude,
    });
    await jh.init();
    const utc = birthProfileToUtcInstant(profile);
    const dt = DateTime.fromJSDate(utc, { zone: "utc" });
    const raw = jh.getChart(dt, "WholeSign");
    return mapJhoraChartToUiReact(raw);
  } catch (err) {
    console.error("[computeJhoraUiChartFromProfile]", err);
    return null;
  }
}

import { formatInTimeZone } from "date-fns-tz";

/** Valid IANA or UTC fallback — avoids RangeError from date-fns-tz. */
export function resolveSafeTimeZone(timezone: string | null | undefined): string {
  const t = typeof timezone === "string" ? timezone.trim() : "";
  if (!t) return "UTC";
  try {
    formatInTimeZone(new Date(), t, "yyyy-MM-dd");
    return t;
  } catch {
    return "UTC";
  }
}

export function formatLocalYmd(utcTimestamp: Date, timeZone: string): string {
  const tz = resolveSafeTimeZone(timeZone);
  try {
    return formatInTimeZone(utcTimestamp, tz, "yyyy-MM-dd");
  } catch {
    return formatInTimeZone(utcTimestamp, "UTC", "yyyy-MM-dd");
  }
}

export function toIsoStringSafe(d: Date): string {
  const ms = d.getTime();
  if (!Number.isFinite(ms)) return new Date(0).toISOString();
  return d.toISOString();
}

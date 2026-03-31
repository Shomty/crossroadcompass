/**
 * Interpret `yyyy-MM-ddTHH:mm[:ss]` as civil wall time in `timeZone`, return UTC instant.
 * Uses `toDate` from date-fns-tz so conversion does **not** depend on the host OS timezone.
 */

import { toDate } from "date-fns-tz";

export function wallTimeToUtc(startLocal: string, timeZone: string): Date {
  const raw = startLocal.trim();
  if (!raw) {
    throw new Error("startLocal is empty");
  }
  const normalized = raw.includes("T") ? raw.replace("T", " ") : raw;
  const d = toDate(normalized, { timeZone });
  if (!Number.isFinite(d.getTime())) {
    throw new Error("invalid datetime or timezone");
  }
  return d;
}

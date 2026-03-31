/**
 * openastrology-library rejects future `dateOfBirth` in validateBirthInfo, which blocks
 * electional / Muhūrta charts. Patch prototypes at load time so deploys still work even
 * when patch-package does not run (e.g. certain CI caches).
 */

import type { BirthInfo } from "openastrology-library";

/** Mirrors library validation minus the “cannot be in the future” guard. */
export function validateBirthInfoAllowFuture(birthInfo: BirthInfo): void {
  if (!birthInfo) throw new Error("Birth information is required");
  if (!birthInfo.dateOfBirth) throw new Error("Date of birth is required");
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(birthInfo.dateOfBirth)) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD");
  }
  const birthDate = new Date(birthInfo.dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) throw new Error("Invalid birth date");
  const minDate = new Date(1800, 0, 1);
  if (birthDate < minDate) throw new Error("Birth date too far in the past");
  if (birthInfo.timeOfBirth) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(birthInfo.timeOfBirth)) {
      throw new Error("Invalid time format. Expected HH:MM");
    }
  }
  if (
    typeof birthInfo.latitude !== "number" ||
    birthInfo.latitude < -90 ||
    birthInfo.latitude > 90
  ) {
    throw new Error("Latitude must be a number between -90 and 90");
  }
  if (
    typeof birthInfo.longitude !== "number" ||
    birthInfo.longitude < -180 ||
    birthInfo.longitude > 180
  ) {
    throw new Error("Longitude must be a number between -180 and 180");
  }
}

export function patchOpenAstrologyCalculatorsForFutureDates(
  VedicAstrologyCalculator: unknown,
  WesternAstrologyCalculator: unknown
): void {
  const v = VedicAstrologyCalculator as {
    prototype: { validateBirthInfo: typeof validateBirthInfoAllowFuture };
  };
  const w = WesternAstrologyCalculator as {
    prototype: { validateBirthInfo: typeof validateBirthInfoAllowFuture };
  };
  v.prototype.validateBirthInfo = validateBirthInfoAllowFuture;
  w.prototype.validateBirthInfo = validateBirthInfoAllowFuture;
}

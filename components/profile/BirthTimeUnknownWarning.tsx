"use client";

/**
 * FE-11 — shown when editing a profile that already had a chart and time is marked unknown.
 */
export function BirthTimeUnknownWarning() {
  return (
    <div className="rounded border border-amber-300 bg-amber-50 p-4 text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100">
      <p className="font-medium">Features affected by unknown birth time:</p>
      <ul className="mt-1 list-inside list-disc text-sm text-amber-700 dark:text-amber-200/90">
        <li>Ascendant (Lagna) sign and degree</li>
        <li>House positions for all planets</li>
        <li>Ghati, Bhava, and Hora Lagnas (Special Points)</li>
        <li>House strength scores (Ashtakavarga per house)</li>
      </ul>
      <p className="mt-2 text-sm text-amber-700 dark:text-amber-200/90">
        Yogas, Dasha periods, nakshatra positions, and planet signs are not affected.
      </p>
    </div>
  );
}

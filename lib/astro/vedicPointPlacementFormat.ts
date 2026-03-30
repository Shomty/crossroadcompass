/**
 * Client-safe formatting for precomputed {@link VedicPointPlacement} (no openastrology / swisseph).
 */

import type { VedicPointPlacement } from "@/types";

/** Compact line for tables: H3 · Gemini · Mrigashira P2 */
export function formatPlacementLine(p: VedicPointPlacement): string {
  return `H${p.houseFromLagna} · ${p.rasiName} · ${p.nakshatra} P${p.pada}`;
}

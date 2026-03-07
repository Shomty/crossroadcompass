// STATUS: done | Task 3.2
/**
 * lib/astro/hdCalculator.ts
 * Wrapper around openhumandesign-library.
 * Runs entirely server-side — no network calls.
 * See copilot-instructions section 16.2.
 *
 * LICENSE PENDING: Swiss Ephemeris commercial license required before launch.
 * openhumandesign-library defaults to AGPL-3.0. For commercial use, requires
 * LGPL-3.0 option which requires a Swiss Ephemeris professional license from
 * Astrodienst AG. Store proof in /docs/licenses/ before go-live.
 * See copilot-instructions section 16.3.
 */

// LICENSE PENDING
import { env } from "@/lib/env";
import type { BirthInfo, HDChartData } from "@/types";

export class HDCalculationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "HDCalculationError";
  }
}

/**
 * Calculate a Human Design chart from birth data.
 * Deterministic — same input always produces the same output.
 * All BirthInfo values must be UTC — the library has no timezone field.
 * Cache the result in KV; only recalculate when profileVersion changes (section 18.1).
 */
export function calculateHDChart(birthInfo: BirthInfo): HDChartData {
  // Require inside the function body — Turbopack only sees this at runtime,
  // not at bundle time, so it won't try to resolve the native .node binary.
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const { HumanDesignCalculator } = require(/* webpackIgnore: true */ "openhumandesign-library") as any;
  try {
    const chart = HumanDesignCalculator.calculateHumanDesignChart(birthInfo, {
      ephePath: env.EPHE_PATH,
    });

    return {
      type: chart.type,
      strategy: chart.strategy,
      signature: chart.signature,
      notSelfTheme: chart.notSelfTheme,
      authority: chart.authority,
      profile: chart.profile,
      definition: chart.definition,
      incarnationCross: chart.incarnationCross,
      definedCenters: chart.definedCenters,
      undefinedCenters: chart.undefinedCenters,
      activeChannels: chart.activeChannels,
      activeGates: chart.activeGates,
      variables: chart.variables,
      personality: chart.personality,
      design: chart.design,
      designDate:
        chart.designDate instanceof Date
          ? chart.designDate.toISOString()
          : String(chart.designDate),
    };
  } catch (err) {
    throw new HDCalculationError(
      "Human Design chart calculation failed. Check ephemeris files and birth data.",
      err
    );
  }
}

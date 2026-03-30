/**
 * Serialize VedicChartCalculations for JSON / client props (Date → ISO strings).
 */
import type {
  HouseInfo,
  HouseNumber,
  HousePositions,
  PlanetDasha,
  VedicChartCalculations,
} from "openastrology-library";

export function serializeVedicChart(chart: VedicChartCalculations): unknown {
  return JSON.parse(
    JSON.stringify(chart, (_key: string, value: unknown) =>
      value instanceof Date ? (value as Date).toISOString() : value
    )
  );
}

/** After JSON, `houses` may be keyed by string "1".."12" or (rarely) be a 12-length array. */
function normalizeHousePositions(raw: unknown): HousePositions | undefined {
  if (raw == null) return undefined;
  if (Array.isArray(raw)) {
    if (raw.length < 12) return undefined;
    const out: Record<number, HouseInfo> = {};
    for (let h = 1; h <= 12; h++) {
      out[h] = raw[h - 1] as HouseInfo;
    }
    return out as HousePositions;
  }
  if (typeof raw !== "object") return undefined;
  const o = raw as Record<string | number, HouseInfo>;
  const out: Record<number, HouseInfo> = {};
  for (let h = 1; h <= 12; h++) {
    const hi = o[h] ?? o[String(h)];
    if (hi != null) out[h] = hi;
  }
  if (Object.keys(out).length === 0) return undefined;
  return out as HousePositions;
}

/** Read vimshottari periods without assuming `dashas` / `vimshottari` exist (safe after JSON.parse). */
function extractVimshottariPeriodsFromDashas(raw: unknown): PlanetDasha[] | undefined {
  if (raw == null || typeof raw !== "object") return undefined;
  const vim = (raw as { vimshottari?: unknown }).vimshottari;
  if (vim == null || typeof vim !== "object") return undefined;
  const periods = (vim as { dashaPeriods?: unknown }).dashaPeriods;
  if (!Array.isArray(periods)) return undefined;
  return periods as PlanetDasha[];
}

function normalizeDashas(raw: unknown): VedicChartCalculations["dashas"] | undefined {
  const periods = extractVimshottariPeriodsFromDashas(raw);
  if (periods == null) return undefined;
  return {
    vimshottari: {
      type: "vimshottari",
      dashaPeriods: periods,
    },
  };
}

/** Safe for client/runtime — KV/DB charts may omit or partially serialize `dashas`. */
export function getVimshottariPeriods(chart: VedicChartCalculations): PlanetDasha[] | undefined {
  return extractVimshottariPeriodsFromDashas(chart.dashas);
}

export function parseSerializedVedicChart(data: unknown): VedicChartCalculations {
  if (data == null || typeof data !== "object") {
    return data as VedicChartCalculations;
  }
  const base = { ...(data as Record<string, unknown>) };
  const nh = normalizeHousePositions(base.houses);
  if (nh) base.houses = nh as unknown;
  const nd = normalizeDashas(base.dashas);
  if (nd) base.dashas = nd as unknown;
  else delete (base as { dashas?: unknown }).dashas;
  return base as unknown as VedicChartCalculations;
}

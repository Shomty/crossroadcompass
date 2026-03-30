# Task: FE-07 — Ashtakavarga Panel
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: FE-01 (GET /api/chart), UserAstroSnapshot model
# Updated: 2026-03-28

---

## What this builds

An Ashtakavarga panel with a beginner-friendly house strength bar chart as the
default view, and the full rekha grid behind an "Advanced" toggle.
Renders under the "Ashtakavarga" tab (visible only to users who have unlocked
the Advanced section — see UX gating below).

---

## Data source

`chart.ashtakavarga` from `GET /api/chart` (already in `VedicChartCalculations`).

Shape:
```typescript
interface AshtakavargaCalculations {
  bhinna: Record<Planet, Record<ZodiacSign, number>>  // per-planet rekhas per sign
  sarva:  Record<ZodiacSign, number>                  // combined rekhas per sign
}
```

To get sarva per **house** (not sign): map each house's sign to its sarva score.
Use `chart.houses[houseNumber].sign` to look up `chart.ashtakavarga.sarva[sign]`.

---

## New files

### `lib/astro/ashtakavargaUtils.ts`

```typescript
import type { VedicChartCalculations, ZodiacSign } from 'openastrology-library'

export function sarvaByHouse(chart: VedicChartCalculations): Record<number, number> {
  const result: Record<number, number> = {}
  for (let h = 1; h <= 12; h++) {
    const sign = chart.houses[h as HouseNumber].sign as ZodiacSign
    result[h] = chart.ashtakavarga.sarva[sign] ?? 0
  }
  return result
}

export function strengthLabel(score: number): { label: string; color: string; barColor: string } {
  if (score >= 30) return { label: 'Strong',   color: 'text-green-700',  barColor: 'bg-green-500' }
  if (score >= 25) return { label: 'Good',     color: 'text-teal-700',   barColor: 'bg-teal-400' }
  if (score >= 20) return { label: 'Moderate', color: 'text-amber-700',  barColor: 'bg-amber-400' }
  return               { label: 'Weak',     color: 'text-red-600',    barColor: 'bg-red-400' }
}

export function planetBhinnaTotal(
  chart: VedicChartCalculations,
  planet: keyof typeof chart.ashtakavarga.bhinna
): number {
  return Object.values(chart.ashtakavarga.bhinna[planet]).reduce((a, b) => a + b, 0)
}
```

### `components/chart/AshtakavargaPanel.tsx`

Props: `{ chart: VedicChartCalculations }`

Two sections:

**Section 1 — House Strength Overview (default, always visible)**

Bar chart: 12 horizontal bars, one per house, labeled with house life-domain:
```
Career (10th)  ████████████░░  28 — Good
Partnership (7th) ████████░░░░  22 — Moderate
...
```
- Bar width proportional to score / 56 (max theoretical sarva per house ≈ 56).
- Label: life domain (from `VEDIC_HOUSE_NAMES` in `lib/astro/houseLabels.ts`) + house number.
- Score and `strengthLabel` rendered to the right.
- Highlight the 3 strongest and the 1 weakest bars with a subtle left border accent.
- Summary text below: "Your chart shows the strongest support for [domain] and [domain].
  [Weakest domain] may require more conscious effort."

**Section 2 — Full Rekha Grid (Advanced toggle)**

Collapsed by default behind a "Show full grid →" toggle.

When expanded:

Sarva grid (13 columns: sign labels + 12 sign values):
```
Sign    | Ar | Ta | Ge | Ca | Le | Vi | Li | Sc | Sa | Ca | Aq | Pi |
Total   | 28 | 31 | 25 | ...
```
Color cells using `strengthLabel` barColor.

Bhinna tab selector: tabs for each of the 9 planets. Each tab shows that planet's
12-sign rekha row. Highlight cells where this planet is placed in the natal chart.

---

## UX gating

The "Ashtakavarga" tab in the chart page tab bar is hidden by default.
Reveal it when the user explicitly opens "Advanced Chart Data" — a collapsible
section at the bottom of the chart page:

```tsx
<button onClick={() => setShowAdvanced(!showAdvanced)}>
  {showAdvanced ? 'Hide Advanced Data ▲' : 'Show Advanced Chart Data ▼'}
</button>
{showAdvanced && (
  <div>
    {/* Ashtakavarga tab | Divisional Charts tab */}
  </div>
)}
```

This ensures beginners never encounter the grid unless they actively seek it.

---

## Admin variables to persist

Extend `UserAstroSnapshot` PATCH with:
```typescript
const sarvaByHouseMap = sarvaByHouse(chart)
const sarvaValues = Object.values(sarvaByHouseMap)
{
  avSarvaHouse1:   sarvaByHouseMap[1],
  avSarvaHouse5:   sarvaByHouseMap[5],
  avSarvaHouse7:   sarvaByHouseMap[7],
  avSarvaHouse10:  sarvaByHouseMap[10],
  avSarvaTotal:    sarvaValues.reduce((a, b) => a + b, 0),
  avSarvaMax:      Math.max(...sarvaValues),
  avSarvaMaxHouse: Number(Object.entries(sarvaByHouseMap).sort((a,b) => b[1]-a[1])[0][0]),
  avSarvaMin:      Math.min(...sarvaValues),
  avSarvaMinHouse: Number(Object.entries(sarvaByHouseMap).sort((a,b) => a[1]-b[1])[0][0]),
  avSunBhinna:     planetBhinnaTotal(chart, 'sun'),
  avMoonBhinna:    planetBhinnaTotal(chart, 'moon'),
  avJupiterBhinna: planetBhinnaTotal(chart, 'jupiter'),
  avSaturnBhinna:  planetBhinnaTotal(chart, 'saturn'),
}
```

Add these 13 fields to `UserAstroSnapshot`.

---

## Done when

- [ ] `ashtakavargaUtils.ts` created; `sarvaByHouse` and `strengthLabel` exported correctly.
- [ ] House strength bar chart renders 12 bars with correct scores and color tiers.
- [ ] Life-domain labels (from `houseLabels.ts`) used as bar labels, not raw house numbers.
- [ ] Plain-language summary text shows strongest and weakest domains.
- [ ] Full rekha grid hidden by default behind "Show full grid" toggle.
- [ ] Sarva grid colors cells by `strengthLabel`.
- [ ] Bhinna tabs work per planet; natal placement cells are highlighted.
- [ ] `AshtakavargaPanel` is gated behind the Advanced section on the chart page.
- [ ] 13 admin variables written to `UserAstroSnapshot`.
- [ ] TypeScript compiles. No `any` casts.

# Task: FE-09 — Daily Transit Panel
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: FE-01 (GET /api/chart), getOrCreateTodayTransits in chartService.ts (OA.5)
# Updated: 2026-03-28

---

## What this builds

A daily transit panel showing today's sidereal planetary positions overlaid on
the natal house grid, a Moon tracker, and a transit snapshot strip.
Displayed on the main dashboard as a collapsible card below the daily insight (FE-10).

---

## API route

**`GET /api/chart/transits`** — create `app/api/chart/transits/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { getOrCreateTodayTransits } from '@/lib/astro/chartService'

export async function GET() {
  const session = await getRequiredSession()
  const profile  = await prisma.birthProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'No birth profile' }, { status: 404 })
  const today = new Date().toISOString().slice(0, 10)
  const transitChart = await getOrCreateTodayTransits(session.user.id, profile)
  return NextResponse.json({ transitChart, date: today })
}
```

Cache is already handled by `getOrCreateTodayTransits` (24h KV TTL). No additional caching needed.

---

## New files

### `components/transit/TransitSnapshotStrip.tsx`

Props: `{ transitChart: VedicChartCalculations }`

A horizontal scrollable strip of compact planet chips:
```
☀ Sun · Aries   ☽ Moon · Scorpio (Jyeshtha)   ♂ Mars · Gemini (R)   ...
```
Show: Sun, Moon, and any retrograde planet in amber, combust planets with `*`.
Moon chip additionally shows its nakshatra in parentheses.

This strip is the top-of-dashboard transit summary — always visible without expanding.

### `components/transit/TransitOverlayGrid.tsx`

Props: `{ natalChart: VedicChartCalculations; transitChart: VedicChartCalculations }`

Extends `<NatalChartGrid>` (FE-01):
- Natal planets displayed normally (black text, existing styling).
- Transiting planets displayed with a different visual treatment: italic text, indigo color,
  prefixed with a small `T·` label. E.g., `T·Jupiter` in a house.
- If a transiting planet shares a house with a natal planet, show both stacked —
  natal on top, transit below with a subtle divider.
- Legend below the grid: "Regular = natal position   Italic = today's transit"

### `components/transit/MoonTracker.tsx`

Props: `{ transitChart: VedicChartCalculations }`

Card showing:
- "Moon today: [sign], [nakshatra] Pada [pada]"
- Moon's longitude within sign as a mini progress bar (0–30°).
- A note: "The Moon moves through a new nakshatra roughly every 24 hours."
- If Moon is within 5° of changing nakshatra (longitude in sign > 25°), show:
  "Transitioning to [next nakshatra] soon."

Compute "next nakshatra" using `NakshatraUtils.getNakshatraFromLongitude` from `'openastrology-library'`:
```typescript
import { NakshatraUtils } from 'openastrology-library'
const moonLong = transitChart.planets.moon.longitude
const nextLong = moonLong + (30 - transitChart.planets.moon.degree) // approx
const nextNakshatra = NakshatraUtils.getNakshatraFromLongitude(nextLong % 360)
```

### `components/transit/HotTransitsCard.tsx`

Props: `{ natalChart: VedicChartCalculations; transitChart: VedicChartCalculations }`

Identifies "hot transits" — transiting planets in Kendra or Trikona houses of the natal chart
OR transiting over the same sign as a natal planet (conjunction within 10°).

```typescript
import { HouseUtils } from 'openastrology-library'

const hotTransits = Object.entries(transitChart.planets)
  .filter(([, tp]) => {
    const inNatalHouse = Object.entries(natalChart.houses)
      .find(([, h]) => h.sign === tp.sign)
    if (!inNatalHouse) return false
    const houseNum = Number(inNatalHouse[0])
    return HouseUtils.isKendra(houseNum) || HouseUtils.isTrikona(houseNum)
  })
```

Render each as a card:
"[TransitPlanet] is moving through your [domain] — a time of [keyword from MAHADASHA_THEMES or sign-based implication]."

If no hot transits, show: "No major activations today — a quieter astrological day."

---

## Dashboard integration

On `app/dashboard/page.tsx`, below `<DailyInsightCard>` (FE-10):

```tsx
<CollapsibleCard title="Today's Planetary Weather" defaultOpen={false}>
  <TransitSnapshotStrip transitChart={transitChart} />
  <MoonTracker transitChart={transitChart} />
  <HotTransitsCard natalChart={natalChart} transitChart={transitChart} />
  <details>
    <summary>Show full transit chart</summary>
    <TransitOverlayGrid natalChart={natalChart} transitChart={transitChart} />
  </details>
</CollapsibleCard>
```

Auto-refresh: the transit data has a 24h KV TTL. Add a `Cache-Control: max-age=3600`
header to `GET /api/chart/transits` so the browser refreshes no more than once per hour.

---

## Admin variables to persist

Extend `UserAstroSnapshot` PATCH (fire daily, overwriting previous values):
```typescript
{
  transitSunSign:       transitChart.planets.sun.sign,
  transitMoonSign:      transitChart.planets.moon.sign,
  transitMoonNakshatra: transitChart.planets.moon.nakshatra,
  transitMarsSign:      transitChart.planets.mars.sign,
  transitJupiterSign:   transitChart.planets.jupiter.sign,
  transitSaturnSign:    transitChart.planets.saturn.sign,
  transitSaturnRetro:   transitChart.planets.saturn.isRetrograde,
  transitCacheDate:     today,  // YYYY-MM-DD
}
```

These 8 fields are overwritten daily (not historical). Add to `UserAstroSnapshot`.

---

## Done when

- [ ] `GET /api/chart/transits` returns a `VedicChartCalculations` for today without error.
- [ ] `TransitSnapshotStrip` renders all 9 planets with sign labels; Moon shows nakshatra.
- [ ] Retrograde planets shown in amber; combust planets show `*`.
- [ ] `TransitOverlayGrid` shows natal and transit planets distinguished visually.
- [ ] `MoonTracker` shows sign, nakshatra, pada, and progress bar.
- [ ] `HotTransitsCard` correctly identifies Kendra/Trikona transits or shows "quieter day."
- [ ] Dashboard integration: collapsible card, collapsed by default.
- [ ] 8 admin variables written to `UserAstroSnapshot` and refreshed daily.
- [ ] TypeScript compiles. No `any` casts.

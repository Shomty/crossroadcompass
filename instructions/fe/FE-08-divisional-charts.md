# Task: FE-08 — Divisional Charts (Navamsa D9, Dasamsa D10, and more)
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: FE-01 (NatalChartGrid, PlanetTooltip), GET /api/chart/divisional (OA.5)
# Updated: 2026-03-28

---

## What this builds

A chart selector for all 16 divisional varga charts. D9 and D10 are the primary
focus. Gated behind the Advanced section (same gate as FE-07). All divisional
charts reuse the South Indian grid from FE-01.

---

## Existing backend route

**`GET /api/chart/divisional`** — create `app/api/chart/divisional/route.ts` if not present:

```typescript
import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { getOrCreateDivisionalCharts } from '@/lib/astro/chartService'

export async function GET() {
  const session = await getRequiredSession()
  const profile  = await prisma.birthProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'No birth profile' }, { status: 404 })
  const divisional = await getOrCreateDivisionalCharts(session.user.id, profile)
  return NextResponse.json({ divisional })
}
```

Response type: `Record<string, VedicChartCalculations>` — keys are 'D1', 'D2', ... 'D16'.

---

## New files

### `lib/astro/divisionalLabels.ts`

```typescript
export const DIVISIONAL_LABELS: Record<string, { name: string; meaning: string; focusPlanets: string[] }> = {
  D1:  { name: 'D1 — Natal Chart',        meaning: 'Your overall life, personality, and life path.',        focusPlanets: [] },
  D2:  { name: 'D2 — Hora',               meaning: 'Wealth and financial flow.',                            focusPlanets: ['sun', 'moon'] },
  D3:  { name: 'D3 — Drekkana',           meaning: 'Siblings, courage, and short journeys.',                focusPlanets: ['mars'] },
  D4:  { name: 'D4 — Chaturthamsa',       meaning: 'Property, home, and fortune.',                         focusPlanets: ['moon'] },
  D7:  { name: 'D7 — Saptamsa',           meaning: 'Children and creative output.',                         focusPlanets: ['jupiter', 'venus'] },
  D9:  { name: 'D9 — Navamsa',            meaning: 'Relationships, dharma, and your inner spiritual path.', focusPlanets: ['venus', 'jupiter'] },
  D10: { name: 'D10 — Dasamsa',           meaning: 'Career, profession, and your public contribution.',     focusPlanets: ['sun', 'saturn'] },
  D12: { name: 'D12 — Dwadasamsa',        meaning: 'Parents and ancestral patterns.',                       focusPlanets: ['sun', 'moon'] },
  D16: { name: 'D16 — Shodasamsa',        meaning: 'Vehicles, comfort, and movement.',                      focusPlanets: ['venus'] },
  D20: { name: 'D20 — Vimsamsa',          meaning: 'Spiritual practices and religious life.',               focusPlanets: ['jupiter'] },
  D24: { name: 'D24 — Chaturvimsamsa',    meaning: 'Education and learning.',                               focusPlanets: ['mercury', 'jupiter'] },
  D27: { name: 'D27 — Bhamsa',            meaning: 'Strength and physical vitality.',                       focusPlanets: ['mars', 'sun'] },
  D30: { name: 'D30 — Trimsamsa',         meaning: 'Misfortunes and hidden challenges.',                    focusPlanets: ['saturn', 'mars'] },
  D40: { name: 'D40 — Khavedamsa',        meaning: 'Auspicious and inauspicious effects.',                  focusPlanets: [] },
  D45: { name: 'D45 — Akshavedamsa',      meaning: 'General well-being.',                                   focusPlanets: [] },
  D60: { name: 'D60 — Shashtiamsa',       meaning: 'Past karma and the deepest chart layer.',               focusPlanets: [] },
}
```

### `components/chart/DivisionalChartSelector.tsx`

Props:
```typescript
interface DivisionalChartSelectorProps {
  divisional: Record<string, VedicChartCalculations>
  natalChart:  VedicChartCalculations
}
```

A dropdown or horizontal scrollable pill selector:
```
[D1 Natal] [D9 Navamsa ●] [D10 Dasamsa] [D4] [D7] [D12] [more ▼]
```
Default selected: D9.

Below the selector, render `<DivisionalChartView>` for the selected chart.

### `components/chart/DivisionalChartView.tsx`

Props: `{ chart: VedicChartCalculations; divKey: string; natalChart: VedicChartCalculations }`

Layout:
1. **Context banner** (amber strip, always shown):
   ```
   "[DIVISIONAL_LABELS[divKey].meaning]"
   ```
2. **Reuse `<NatalChartGrid>`** from FE-01, passing the divisional chart.
   Do NOT show the birth-time warning banner on divisional charts.
   Pass `birthTimeKnown={true}` to suppress it (divisional position warnings
   are managed separately if needed).
3. **Focus planets card** (if `focusPlanets` is non-empty):
   "Key planets to watch in this chart: [Venus in Taurus] [Jupiter in Pisces]"
   Pull positions from the divisional chart's `planets` object.

**D9-specific comparison panel** (only for D9):
Below the chart, show a side-by-side comparison card:
```
             D1 Natal   →   D9 Navamsa
Moon Sign:   Scorpio         Pisces
Venus Sign:  Libra           Sagittarius
Ascendant:   Aries           Cancer
```
Pull from `natalChart.planets.*` vs `divisional.D9.planets.*` and `ascendant`.

**D10-specific note** (only for D10):
Add below the chart:
"10th house lord in D10: [planet] in [sign] — [dignityLabel]. Career direction is towards [plain implication based on sign element]."

---

## UX gating

Divisional charts are inside the same "Advanced Chart Data" collapsible section as Ashtakavarga (FE-07). Tab structure inside the advanced section:

```
[Ashtakavarga] [Divisional Charts]
```

Add a first-time tooltip on the Divisional Charts tab: "These charts zoom in on specific life areas. D9 (Navamsa) is most used — it reveals your dharma and relationship nature."

---

## Admin variables to persist

Extend `UserAstroSnapshot` PATCH on first divisional chart load:
```typescript
{
  d9MoonSign:       divisional.D9?.planets.moon.sign ?? null,
  d9VenusSign:      divisional.D9?.planets.venus.sign ?? null,
  d9AscendantSign:  divisional.D9?.ascendant.sign ?? null,
  d10SunSign:       divisional.D10?.planets.sun.sign ?? null,
  d10SaturnSign:    divisional.D10?.planets.saturn.sign ?? null,
  d10AscendantSign: divisional.D10?.ascendant.sign ?? null,
  divisionalChartsCachedAt: new Date().toISOString(),
}
```

Add these 7 fields to `UserAstroSnapshot`.

---

## Done when

- [ ] `GET /api/chart/divisional` returns `Record<string, VedicChartCalculations>`.
- [ ] `divisionalLabels.ts` created with all 16 varga entries.
- [ ] Chart selector renders all available keys; defaults to D9.
- [ ] Context banner shows the correct plain-language meaning per chart.
- [ ] `NatalChartGrid` reused with divisional planets rendering in correct houses.
- [ ] D9 comparison panel shows Moon, Venus, Ascendant vs. natal.
- [ ] D10 10th-lord note renders with dignity and plain implication.
- [ ] Advanced section gate matches FE-07 gate (same toggle).
- [ ] 7 admin variables written to `UserAstroSnapshot`.
- [ ] TypeScript compiles. No `any` casts.

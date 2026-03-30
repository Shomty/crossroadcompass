# Task: FE-01 — Natal Vedic Chart Grid
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: OA.5 (getOrCreateVedicChart in chartService.ts)
# Updated: 2026-03-28

---

## What this builds

A South Indian square house grid that renders the user's natal Vedic chart.
This is the primary visual entry point into the Jyotish engine output.

---

## New file

### `components/chart/NatalChartGrid.tsx`

Props:
```typescript
interface NatalChartGridProps {
  chart: VedicChartCalculations          // from 'openastrology-library'
  birthTimeKnown: boolean                // from BirthProfile.birthTime !== null
  variant?: 'south-indian' | 'north-indian'  // default: 'south-indian'
}
```

Rendering rules:
- South Indian grid: 4×4 fixed-position square grid; house 1 always top-center-left cell.
  Cell layout (row, col): H1=(0,1) H2=(0,2) H3=(1,3) H4=(2,3) H5=(3,2) H6=(3,1)
  H7=(3,0) H8=(2,0) H9=(1,0) H10=(0,0) H11=(0,1)... adjust per standard South Indian mapping.
  Use this canonical mapping:
  ```
  [H12][H01][H02][H03]
  [H11][    ][    ][H04]
  [H10][    ][    ][H05]
  [H09][H08][H07][H06]
  ```
- The center 2×2 cells are decorative / logo area, not house cells.
- Lagna house gets `border-2 border-indigo-600 bg-indigo-50`.
- Each house cell renders: house number (small, top-left) + sign name (small, top-right) + planet glyphs stacked vertically.

Planet rendering inside each cell:
- Pull planets from `Object.entries(chart.planets)` filtered by `planet.house === houseNumber`.
- Display planet name abbreviated: Sun→Su, Moon→Mo, Mars→Ma, Mercury→Me, Jupiter→Ju, Venus→Ve, Saturn→Sa, Rahu→Ra, Ketu→Ke.
- Retrograde planets: append `(R)` in amber text `text-amber-600`.
- Combust planets: append `*` in red text `text-red-500`.
- Tooltip on hover (use Radix UI Tooltip or Tailwind group-hover): show full planet data (see PlanetTooltip below).

### `components/chart/PlanetTooltip.tsx`

Props: `{ planet: PlanetPosition; planetKey: string }`

Tooltip content:
```
[Planet Name]
[sign] • [degreeDMSFormatted]
[nakshatra] Pada [nakshatraPada]
Dignity: [dignity]
[isRetrograde ? 'Retrograde' : ''][isCombust ? ' • Combust' : '']
```

### `components/chart/ChartVariantToggle.tsx`

Simple toggle button: South Indian / North Indian.
North Indian variant is a stub for Phase 2 — show "Coming soon" overlay.

---

## Birth time warning banner

If `birthTimeKnown === false`, render above the chart:
```tsx
<div className="bg-amber-50 border border-amber-200 rounded px-4 py-2 text-sm text-amber-800 mb-4">
  Birth time unknown — Ascendant and house positions are approximate (solar noon used).
</div>
```

---

## API route to create/confirm

**`GET /api/chart`** — `app/api/chart/route.ts`

If not already present, create this route:
```typescript
// app/api/chart/route.ts
import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { getOrCreateVedicChart } from '@/lib/astro/chartService'

export async function GET() {
  const session = await getRequiredSession()
  const profile = await prisma.birthProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'No birth profile' }, { status: 404 })
  const chart = await getOrCreateVedicChart(session.user.id, profile)
  return NextResponse.json({ chart, birthTimeKnown: profile.birthTime !== null })
}
```

---

## Page

**`app/chart/page.tsx`**

- Server component that calls `GET /api/chart`.
- Renders `<NatalChartGrid chart={chart} birthTimeKnown={birthTimeKnown} />`.
- Wraps in `<Suspense fallback={<ChartSkeleton />}>`.
- Provide a `ChartSkeleton` component: a 4×4 grid of pulsing gray squares.

---

## Admin variables to persist

On first successful chart render (client-side effect, fire once):

```typescript
// POST /api/admin/snapshot — upsert UserAstroSnapshot fields:
{
  lagnaSign:          chart.ascendant.sign,
  lagnaDegree:        chart.ascendant.degree,
  lagnaNakshatra:     chart.ascendant.nakshatra,
  lagnaNakshatraPada: chart.ascendant.nakshatraPada,
  ayanamsa:           chart.ayanamsa,
  birthTimeKnown:     profile.birthTime !== null,
  vedicChartCachedAt: new Date().toISOString(),
}
```

Create `app/api/admin/snapshot/route.ts` (PATCH, upsert to a `UserAstroSnapshot` Prisma model).
Create the Prisma model if it does not exist:
```prisma
model UserAstroSnapshot {
  userId              String   @id
  lagnaSign           String?
  lagnaDegree         Float?
  lagnaNakshatra      String?
  lagnaNakshatraPada  Int?
  ayanamsa            Float?
  birthTimeKnown      Boolean?
  vedicChartCachedAt  DateTime?
  // additional fields added by later FE tasks
  updatedAt           DateTime @updatedAt
  user                User     @relation(fields: [userId], references: [id])
}
```

---

## Done when

- [ ] South Indian house grid renders all 9 planets in correct house cells.
- [ ] Lagna house is visually highlighted.
- [ ] Retrograde and combust indicators display correctly.
- [ ] PlanetTooltip shows on hover with all fields populated.
- [ ] `birthTimeKnown === false` triggers the amber warning banner.
- [ ] `GET /api/chart` route returns `VedicChartCalculations` without error.
- [ ] `UserAstroSnapshot` Prisma model exists and upsert fires on first load.
- [ ] TypeScript compiles with no errors. No `any` casts on chart data.

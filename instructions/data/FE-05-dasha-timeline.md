# Task: FE-05 — Vimshottari Dasha Timeline
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: FE-01 (GET /api/chart), chartService.getCurrentDasha(), getMahadashaRemaining()
# Updated: 2026-03-28

---

## What this builds

A scrollable lifespan Mahadasha timeline with active period highlighted, remaining
time display, Antardasha sub-periods, and upcoming milestone cards.
Renders on a dedicated `/dashboard/dasha` page and as a widget on the main dashboard.

---

## API route

**`GET /api/chart/dasha`** — create `app/api/chart/dasha/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import { getOrCreateVedicChart, getCurrentDasha, getMahadashaRemaining } from '@/lib/astro/chartService'

export async function GET() {
  const session = await getRequiredSession()
  const profile  = await prisma.birthProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'No birth profile' }, { status: 404 })

  const chart    = await getOrCreateVedicChart(session.user.id, profile)
  const current  = getCurrentDasha(chart)
  const remaining = current.mahaDasha ? getMahadashaRemaining(chart) : null
  const periods  = chart.dashas.vimshottari.dashaPeriods

  return NextResponse.json({ periods, current, remaining })
}
```

---

## New files

### `lib/astro/dashaLabels.ts`

Create this file with plain-language Mahadasha themes:
```typescript
export const MAHADASHA_THEMES: Record<string, { theme: string; keyword: string; color: string }> = {
  sun:     { theme: 'Identity, authority, and recognition',   keyword: 'Identity',     color: '#F59E0B' },
  moon:    { theme: 'Emotions, home, and inner life',         keyword: 'Inner Life',   color: '#6366F1' },
  mars:    { theme: 'Drive, courage, and decisive action',    keyword: 'Action',       color: '#EF4444' },
  mercury: { theme: 'Communication, learning, and agility',  keyword: 'Learning',     color: '#10B981' },
  jupiter: { theme: 'Growth, wisdom, and expansion',         keyword: 'Growth',       color: '#8B5CF6' },
  venus:   { theme: 'Relationships, creativity, and beauty', keyword: 'Creativity',   color: '#EC4899' },
  saturn:  { theme: 'Structure, discipline, and endurance',  keyword: 'Endurance',    color: '#64748B' },
  rahu:    { theme: 'Ambition, disruption, and worldly desire', keyword: 'Ambition',  color: '#0EA5E9' },
  ketu:    { theme: 'Spirituality, release, and introspection', keyword: 'Release',   color: '#78716C' },
}
```

### `components/dasha/DashaTimeline.tsx`

Props:
```typescript
interface DashaTimelineProps {
  periods: PlanetDasha[]       // full vimshottari periods from API
  current: { mahaDasha?: PlanetDasha; antarDasha?: PlanetDasha }
  remaining: { years: number; months: number; days: number } | null
  birthDate: Date
}
```

Rendering:
- Horizontal scrollable bar spanning from user's birth year to birth year + 120 (max Vimshottari span).
- Each Mahadasha segment: width proportional to its duration (years), colored by planet from `MAHADASHA_THEMES`.
- Active Mahadasha: border-2 + pulsing dot indicator + slightly raised (shadow-md).
- Current date line: a vertical dashed line overlaid at today's position.
- On mobile: compress to show only past 2 years + next 10 years.

Active period card (below the timeline):
```
[Planet keyword] Period
[Full theme text]
[Start date] → [End date]
[Remaining: X years, Y months]
```
Format remaining time as human-readable: "About 2 years left" not raw numbers.
Rule: if `years >= 1` → "About [N] year[s] left", else → "[M] months left".

Clicking any Mahadasha segment expands an `<AntardashaList>` below.

### `components/dasha/AntardashaList.tsx`

Props: `{ period: PlanetDasha; currentAntardasha?: PlanetDasha }`

Renders `period.subPeriods` as a compact vertical timeline:
- Each sub-period: planet name | start date | end date.
- Active Antardasha highlighted with indigo left border and "← Now" label.

### `components/dasha/DashaWidget.tsx`

A compact version of the active period card for the main dashboard:
```
[Keyword] Period — [Theme, truncated to 8 words]
Ends [formatted end date] • [human remaining]
Next: [next Mahadasha planet keyword] period in [N] years
```
This widget links to the full `/dashboard/dasha` page.

### `components/dasha/UpcomingMilestones.tsx`

Props: `{ periods: PlanetDasha[] }`

Shows next 2 transition events:
1. Next Antardasha change (date + new planet keyword)
2. Next Mahadasha change (date + new planet keyword + theme preview)

---

## Plain-language UX bridge

- Never show raw "Mahadasha" or "Antardasha" labels to the user. Use "Life Period" and "Sub-period" as the primary labels.
- The period name is always the keyword: "Your Endurance Period (Saturn)" not "Saturn Mahadasha".
- Year/month/day remaining: always round to the coarsest useful unit for the top-line display.

---

## Page

**`app/dashboard/dasha/page.tsx`**

Fetch from `GET /api/chart/dasha` and render:
1. `<DashaTimeline />` (full width)
2. `<UpcomingMilestones />` (sidebar card)
3. "What does this period mean for you?" accordion linking to the monthly report (FN-06, future).

---

## Admin variables to persist

Extend `UserAstroSnapshot` PATCH with:
```typescript
{
  mahadashaPlanet:       current.mahaDasha?.planet ?? null,
  mahadashaStartDate:    current.mahaDasha?.startDate ?? null,
  mahadashaEndDate:      current.mahaDasha?.endDate ?? null,
  mahadashaRemainingYrs: remaining?.years ?? null,
  mahadashaRemainingMos: remaining?.months ?? null,
  antardashaP lanet:     current.antarDasha?.planet ?? null,
  antardashaStartDate:   current.antarDasha?.startDate ?? null,
  antardashaEndDate:     current.antarDasha?.endDate ?? null,
  nextMahadashaPlanet:   periods[nextIndex]?.planet ?? null,
  nextMahadashaStartDate: periods[nextIndex]?.startDate ?? null,
}
```

Add these 10 fields to `UserAstroSnapshot`. Dates stored as `DateTime?`.

---

## Done when

- [ ] `GET /api/chart/dasha` returns periods, current, and remaining without error.
- [ ] `dashaLabels.ts` exists with all 9 planet entries.
- [ ] Timeline bar renders all Mahadasha segments with proportional widths.
- [ ] Active Mahadasha is highlighted with pulsing indicator.
- [ ] Current date line renders correctly.
- [ ] Active period card shows theme + human-readable remaining time.
- [ ] Antardasha list expands on segment click; active Antardasha highlighted.
- [ ] `DashaWidget` renders on dashboard (compact).
- [ ] `UpcomingMilestones` shows next 2 transitions.
- [ ] "Life Period" / "Sub-period" labels used throughout; "Mahadasha" not shown to users.
- [ ] 10 admin variables written to `UserAstroSnapshot`.
- [ ] TypeScript compiles. No `any` casts.

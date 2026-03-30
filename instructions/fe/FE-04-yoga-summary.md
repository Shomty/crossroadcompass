# Task: FE-04 — Yoga Summary Panel
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: FE-01 (GET /api/chart), FE-02 (tabs on chart page)
# Updated: 2026-03-28

---

## What this builds

A yoga summary panel grouped into Raja / Dhana / Other tabs, with a plain-language
summary card as the default view. Power users can expand to see yoga names.
Renders under the "Yogas" tab on the chart page.

---

## New files

### `lib/astro/mapYogaType.ts`

Already exists per OA.10 — confirm it is present at this path and exports:
```typescript
export function mapYogaType(libType: 'Raja' | 'Dhana' | 'Arishtabhanga' | 'Neechabhanga' | 'Other'): 'raj' | 'dhana' | 'other'
```
If not present, create it:
```typescript
import type { Yoga } from 'openastrology-library'
export type YogaCategory = 'raj' | 'dhana' | 'other'

export function mapYogaType(libType: Yoga['type']): YogaCategory {
  const map: Record<Yoga['type'], YogaCategory> = {
    Raja:           'raj',
    Dhana:          'dhana',
    Neechabhanga:   'raj',
    Arishtabhanga:  'other',
    Other:          'other',
  }
  return map[libType] ?? 'other'
}
```

### `components/chart/YogaSummaryCard.tsx`

Props: `{ yogas: Yoga[] }`

Default (collapsed) view — plain language, no yoga names visible:
```tsx
// Example output:
"You have 5 planetary combinations in your chart.
 3 relate to power and leadership.
 2 relate to wealth and prosperity.
 Your strongest combination involves Jupiter and Saturn — a sign of disciplined authority."
```

Derive this text programmatically:
```typescript
const raja  = yogas.filter(y => mapYogaType(y.type) === 'raj')
const dhana = yogas.filter(y => mapYogaType(y.type) === 'dhana')
const strong = yogas.filter(y => y.strength === 'Strong')
const topYoga = strong.sort(...)[0]  // strongest by custom score if needed
```

Never use yoga names ("Hamsa Yoga", "Raja Yoga", etc.) in the summary card.
Use only: "leadership/authority combination", "wealth combination", "protective combination".

"View all [N] combinations →" button at bottom expands to full `<YogaTabPanel>`.

### `components/chart/YogaTabPanel.tsx`

Props: `{ yogas: Yoga[] }`

Three tabs: "Leadership (Raja)" | "Wealth (Dhana)" | "Other"

Each tab renders a list of `<YogaCard>` components sorted by strength: Strong → Moderate → Weak.

### `components/chart/YogaCard.tsx`

Props: `{ yoga: Yoga }`

Card content:
- **Name**: `yoga.name` (shown here — user has opted into the expanded view)
- **Strength badge**:
  ```typescript
  const strengthColor = {
    Strong:   'bg-green-100 text-green-800',
    Moderate: 'bg-amber-100 text-amber-800',
    Weak:     'bg-gray-100 text-gray-600',
  }
  ```
- **Planets**: `yoga.planets.map(p => capitalize(p)).join(', ')`
- **Houses**: `yoga.houses.map(h => `House ${h}`).join(', ')`
- **Description**: `yoga.description` — this comes from the library in English already.
  If the description starts with a Sanskrit term, prepend a plain English header:
  e.g., "Hamsa Yoga — Great Jupiter combination: [description]"

If `yogas.length === 0` for a tab, show:
```
"No [type] combinations detected in this chart."
```

---

## Plain-language UX bridge

IMPORTANT: The "Yogas" tab label itself must be renamed to "Chart Combinations" in the
tab bar for the primary user. Power users who already know the term will find it anyway.

Tab bar on chart page:
```
Chart | Planets | Houses | Chart Combinations | Special Points | Ashtakavarga | Divisional
```

---

## Admin variables to persist

Extend `UserAstroSnapshot` PATCH with:
```typescript
{
  totalYogasCount:  yogas.length,
  rajaYogasCount:   yogas.filter(y => y.type === 'Raja' || y.type === 'Neechabhanga').length,
  dhanaYogasCount:  yogas.filter(y => y.type === 'Dhana').length,
  strongYogasCount: yogas.filter(y => y.strength === 'Strong').length,
  hasNeechabhanga:  yogas.some(y => y.type === 'Neechabhanga'),
  topYogaName:      strong[0]?.name ?? null,
  topYogaStrength:  strong[0]?.strength ?? null,
  yogaNamesAll:     yogas.map(y => y.name),  // store as JSON array
}
```

Add these fields to `UserAstroSnapshot` Prisma model. `yogaNamesAll` is `String?` (JSON-stringified).

---

## Done when

- [ ] `mapYogaType` exists at `lib/astro/mapYogaType.ts` and is correct.
- [ ] Default view shows plain-language summary with no yoga names.
- [ ] "View all" expand reveals tabbed panel.
- [ ] Tab labels: "Leadership (Raja)" / "Wealth (Dhana)" / "Other".
- [ ] Yoga cards show name, strength badge, planets, houses, description.
- [ ] Empty tab state renders correctly.
- [ ] "Yogas" tab renamed to "Chart Combinations" in the chart page tab bar.
- [ ] 8 admin variables written to `UserAstroSnapshot`.
- [ ] TypeScript compiles. No `any` casts.

# Task: FE-03 — House Analysis Panel
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: FE-01 (GET /api/chart, UserAstroSnapshot), FE-02 (tabs on chart page)
# Updated: 2026-03-28

---

## What this builds

12 house cards in a 3×4 grid showing lord, resident planets, strength score,
house type badge, and plain-language significance. Renders under the "Houses" tab
on the chart page.

---

## New files

### `components/chart/HouseGrid.tsx`

Props: `{ houses: HousePositions; planets: PlanetaryPositions }` — types from `'openastrology-library'`.

Layout: CSS grid `grid-cols-3 md:grid-cols-4 gap-3`.

For each house 1–12 render a `<HouseCard>`.

### `components/chart/HouseCard.tsx`

Props: `{ house: HouseInfo; houseNumber: number; planets: PlanetaryPositions }`

Card content:
- **Header row**: `House [N] — [VEDIC_NAME]` + `[HOUSE_TYPE badge]`
- **Sign**: capitalize `house.sign`
- **Lord**: planet name, capitalized
- **Planets in house**: `house.planets.join(', ')` (empty = "—")
- **Strength bar**: progress bar 0–100% using `house.strength` (0–1 → multiply by 100).
  Color tiers:
  ```typescript
  strength >= 0.75  → 'bg-green-500'   (label: "Strong")
  strength >= 0.40  → 'bg-amber-400'   (label: "Moderate")
  otherwise         → 'bg-red-400'     (label: "Weak")
  ```
- **Significance tags**: `house.significance` array rendered as small gray pill chips.
  Show max 3 tags; overflow with "+N more" that expands on click.

Clicking the card opens a slide-over drawer (`<HouseDetailDrawer>`).

### `lib/astro/houseLabels.ts`

Static mapping — create this file:
```typescript
export const VEDIC_HOUSE_NAMES: Record<number, string> = {
  1:  'Tanu (Self)',
  2:  'Dhana (Wealth)',
  3:  'Sahaja (Siblings)',
  4:  'Sukha (Home)',
  5:  'Putra (Intelligence)',
  6:  'Ripu (Obstacles)',
  7:  'Kalatra (Partnership)',
  8:  'Mrityu (Transformation)',
  9:  'Dharma (Fortune)',
  10: 'Karma (Career)',
  11: 'Labha (Gains)',
  12: 'Vyaya (Liberation)',
}

export const HOUSE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  Kendra:   { label: 'Kendra',   color: 'bg-indigo-100 text-indigo-700' },
  Trikona:  { label: 'Trikona',  color: 'bg-purple-100 text-purple-700' },
  Upachaya: { label: 'Upachaya', color: 'bg-teal-100 text-teal-700' },
  Dusthana: { label: 'Dusthana', color: 'bg-red-100 text-red-600' },
  Maraka:   { label: 'Maraka',   color: 'bg-orange-100 text-orange-700' },
  Regular:  { label: 'Regular',  color: 'bg-gray-100 text-gray-600' },
}
```

Import `HouseUtils` from `'openastrology-library'` to determine house type:
```typescript
import { HouseUtils } from 'openastrology-library'
const type = HouseUtils.HOUSE_TYPES[houseNumber]  // 'Kendra' | 'Trikona' | etc.
```

### `components/chart/HouseDetailDrawer.tsx`

Props: `{ house: HouseInfo; houseNumber: number; isOpen: boolean; onClose: () => void }`

Slide-over panel (fixed right, z-50, backdrop blur):
- Full list of `house.significance` strings
- Aspecting planets: filter `Object.entries(planets)` for planets whose `aspects` array
  contains a target matching this house number. List as "Jupiter aspects this house (9th aspect)".
- Empty house note: if `house.planets.length === 0`, show "No planets reside here — ruled entirely by [lord] in [lord's current sign]."

---

## UX bridge — plain-language labels

The PRD target user does not know Vedic house names. Apply these rules:
- Primary label in card header is the life-domain: `"Career (10th)"` not `"10th House"`.
- Strength label uses: "Strong for this life area" / "Moderate" / "Needs attention" — not numeric.
- Significance tags must already be in English from `HouseUtils.getHouseSignificance(house)`.
  If any tag is in Sanskrit or technical Vedic, override with the plain English from `houseLabels.ts`.

---

## Admin variables to persist

Extend `UserAstroSnapshot` PATCH with:
```typescript
{
  house1Sign:      houses[1].sign,
  house1Lord:      houses[1].lord,
  house1Strength:  houses[1].strength,
  house5Sign:      houses[5].sign,
  house5Lord:      houses[5].lord,
  house5Strength:  houses[5].strength,
  house7Sign:      houses[7].sign,
  house7Lord:      houses[7].lord,
  house10Sign:     houses[10].sign,
  house10Lord:     houses[10].lord,
  house10Strength: houses[10].strength,
  strongestHouseNum: Object.entries(houses).reduce((a, [k, v]) =>
    v.strength > houses[Number(a)].strength ? Number(k) : a, 1),
  weakestHouseNum:   Object.entries(houses).reduce((a, [k, v]) =>
    v.strength < houses[Number(a)].strength ? Number(k) : a, 1),
}
```

Add these fields to `UserAstroSnapshot` Prisma model.

---

## Done when

- [ ] 12 house cards render in a 3×4 grid with correct sign, lord, and strength bar.
- [ ] House type badges use correct color per `HOUSE_TYPE_LABELS`.
- [ ] Significance tags are plain English; overflow shows "+N more".
- [ ] `HouseDetailDrawer` opens on card click; shows aspecting planets.
- [ ] Empty houses show the lord-in-sign fallback text.
- [ ] "Career (10th)" domain-first labeling used as the primary card header.
- [ ] 14 admin variables persisted to `UserAstroSnapshot`.
- [ ] TypeScript compiles. No `any` casts.

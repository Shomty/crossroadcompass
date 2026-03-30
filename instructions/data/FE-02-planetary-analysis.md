# Task: FE-02 — Planetary Analysis Panel
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: FE-01 (GET /api/chart route, UserAstroSnapshot model)
# Updated: 2026-03-28

---

## What this builds

A sortable planet table with dignity color-coding, Drishti aspect visualizer,
and a plain-language summary card. Gated behind the natal chart page as a
"Deep Dive" tab.

---

## New files

### `components/chart/PlanetTable.tsx`

Props: `{ planets: PlanetaryPositions }` — `PlanetaryPositions` from `'openastrology-library'`.

Table columns: Planet | Sign | House | Nakshatra | Pada | Dignity | R | Combust

Column rendering:
- **Planet**: full name, capitalized. Row sorted ascending by house number by default.
- **Sign**: capitalize first letter of ZodiacSign.
- **House**: number 1–12.
- **Nakshatra**: capitalize first letter.
- **Pada**: number 1–4.
- **Dignity**: colored badge — use this mapping exactly:
  ```typescript
  const dignityColor: Record<string, string> = {
    'Exalted':       'bg-green-100 text-green-800',
    'Own':           'bg-blue-100 text-blue-800',
    'Moolatrikona':  'bg-blue-100 text-blue-800',
    'Friendly':      'bg-teal-100 text-teal-800',
    'Neutral':       'bg-gray-100 text-gray-600',
    'Inimical':      'bg-orange-100 text-orange-700',
    'Debilitated':   'bg-red-100 text-red-700',
  }
  ```
- **R**: show `(R)` in `text-amber-600 font-medium` if `planet.isRetrograde`, empty otherwise.
- **Combust**: show `●` in `text-red-500` if `planet.isCombust`, empty otherwise.

Sortable columns: click column header toggles asc/desc. Default sort: house asc.

Expandable row: clicking a planet row reveals a second row with:
- `speed: X°/day` (from `planet.speed`, formatted to 4 decimal places)
- Aspects cast (from `planet.aspects`): list as "aspects [targetPlanet] in house [house] ([aspectType]°)"

### `components/chart/PlanetSummaryCard.tsx`

Shown above the table. Auto-generated plain-language text:

```typescript
// Derive from planets object:
const strongest = Object.entries(planets)
  .filter(([, p]) => ['Exalted', 'Own', 'Moolatrikona'].includes(p.dignity))
  .map(([k]) => k)

const debilitated = Object.entries(planets)
  .filter(([, p]) => p.dignity === 'Debilitated')
  .map(([k]) => k)

const retrograde = Object.entries(planets)
  .filter(([, p]) => p.isRetrograde)
  .map(([k]) => k)
```

Render:
```
"[N] of your planets are in strong positions[: Sun, Jupiter].
[If debilitated: Mercury is in a weakened position — an area of growth.]
[If retrograde: Mars and Saturn are retrograde — their energy turns inward.]"
```
Keep the language plain. Never say "Exalted" or "Debilitated" in the summary card — use "strongest position" and "weakened position."

### `components/chart/DrushtiVisualizer.tsx`

An SVG overlay on a simplified 12-house ring diagram.

- Render 12 equal segments around a circle, labeled by sign.
- When a planet is selected (click on table row), draw lines from that planet's house
  to each house it aspects (from `planet.aspects[].targetHouse`).
- Color aspects by type: special Vedic Drishti — 7th aspect = full (solid line),
  4th/8th = 3/4 strength (dashed), 5th/9th = 1/2 strength (dotted).
- Selected planet highlighted in the ring with a filled circle.
- Deselect by clicking again or pressing Escape.

If `planet.aspects` is empty for all planets, hide the visualizer and show:
```
"Aspect data unavailable for this chart."
```

### `components/chart/PlanetExportButton.tsx`

Button: "Export CSV". On click, generates and downloads a CSV:
```
Planet,Sign,House,Nakshatra,Pada,Dignity,Retrograde,Combust
Sun,aries,1,ashwini,2,Exalted,false,false
...
```
Use `URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))`.

---

## Page integration

Add a "Planets" tab to `app/chart/page.tsx` alongside the main chart grid.
Tabs: Chart | Planets | Houses (FE-03) | Yogas (FE-04)

Use a tab component (Radix UI Tabs or a simple state-driven tab bar).

---

## Admin variables to persist

Extend the `UserAstroSnapshot` PATCH call (from FE-01) to add on first chart load:

```typescript
{
  sunSign:         planets.sun.sign,
  sunHouse:        planets.sun.house,
  sunNakshatra:    planets.sun.nakshatra,
  sunDignity:      planets.sun.dignity,
  sunRetrograde:   planets.sun.isRetrograde,
  sunCombust:      planets.sun.isCombust,
  moonSign:        planets.moon.sign,
  moonHouse:       planets.moon.house,
  moonNakshatra:   planets.moon.nakshatra,
  moonNakshatraPada: planets.moon.nakshatraPada,
  moonDignity:     planets.moon.dignity,
  marsSign:        planets.mars.sign,
  marsHouse:       planets.mars.house,
  marsDignity:     planets.mars.dignity,
  marsRetrograde:  planets.mars.isRetrograde,
  mercurySign:     planets.mercury.sign,
  mercuryHouse:    planets.mercury.house,
  jupiterSign:     planets.jupiter.sign,
  jupiterHouse:    planets.jupiter.house,
  jupiterDignity:  planets.jupiter.dignity,
  venusSign:       planets.venus.sign,
  venusHouse:      planets.venus.house,
  saturnSign:      planets.saturn.sign,
  saturnHouse:     planets.saturn.house,
  saturnRetrograde: planets.saturn.isRetrograde,
  rahuSign:        planets.rahu.sign,
  rahuHouse:       planets.rahu.house,
  ketuSign:        planets.ketu.sign,
  ketuHouse:       planets.ketu.house,
  retrogradeCount: Object.values(planets).filter(p => p.isRetrograde).length,
  combustCount:    Object.values(planets).filter(p => p.isCombust).length,
}
```

Add all of the above fields to the `UserAstroSnapshot` Prisma model (all nullable).

---

## Done when

- [ ] Planet table renders all 9 planets with correct sign, house, nakshatra, dignity badge.
- [ ] Dignity badges use the correct color per the mapping above.
- [ ] Retrograde and combust columns display correctly.
- [ ] Sorting by any column works correctly.
- [ ] Expandable row shows speed and aspects.
- [ ] `PlanetSummaryCard` uses plain language (no "Exalted"/"Debilitated" in summary).
- [ ] `DrushtiVisualizer` draws aspect lines for selected planet.
- [ ] CSV export downloads a valid file.
- [ ] All 30 admin variables written to `UserAstroSnapshot` on first load.
- [ ] TypeScript compiles. No `any` casts.

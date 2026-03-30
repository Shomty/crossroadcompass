# Crossroads Compass — Frontend Task Files
# Jyotish Engine (openastrology-library backend)
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Updated: 2026-03-28

---

## Task Index

| File | Feature | Priority | Depends on |
|------|---------|----------|------------|
| FE-01-natal-chart-grid.md | South Indian house grid, planet glyphs, tooltips | P0 | OA.5 |
| FE-02-planetary-analysis.md | Planet table, dignity badges, Drishti visualizer, CSV export | P0 | FE-01 |
| FE-03-house-analysis.md | 12 house cards, strength bars, life-domain labels, drawer | P0 | FE-01, FE-02 |
| FE-04-yoga-summary.md | Yoga summary (plain-language first), tabbed cards, admin vars | P0 | FE-01 |
| FE-05-dasha-timeline.md | Lifespan timeline, active period card, milestones, widget | P0 | OA.5, FE-01 |
| FE-06-special-points.md | Arudha Lagna, Charakarakas, advanced GL/BL/HL toggle | P1 | OA.9, FE-01 |
| FE-07-ashtakavarga.md | House strength bar chart, full rekha grid (advanced), bhinna tabs | P1 | FE-01 |
| FE-08-divisional-charts.md | D9/D10 selector, context banners, natal grid reuse | P2 | FE-01, OA.5 |
| FE-09-daily-transit.md | Transit strip, overlay grid, Moon tracker, hot transits | P0 | OA.5, FE-01 |
| FE-10-daily-insight-feed.md | Daily insight card, dasha strip, feedback, streak, prompt rules | P0 | OA.12/OA.13 |
| FE-11-birth-profile.md | Birth form, geocoding, unknown-time UX, cache invalidation | P0 | OA.9 |

---

## Shared infrastructure created across these tasks

Every task that writes to `UserAstroSnapshot` depends on:

```prisma
model UserAstroSnapshot {
  userId String @id
  // fields added incrementally per task — see each task file
  updatedAt DateTime @updatedAt
  user      User @relation(fields: [userId], references: [id])
}
```

**Create this model in the first task you implement (FE-01).**
Each subsequent task adds its fields via a migration.

---

## Build order (recommended)

```
FE-11 (profile + auth foundation)
  → FE-01 (natal chart — core visual)
    → FE-10 (daily insight — primary dashboard value)
    → FE-09 (transit panel — supports insight context)
    → FE-02 (planet table)
    → FE-03 (house analysis)
    → FE-04 (yoga summary)
    → FE-05 (dasha timeline)
    → FE-06 (special points)
    → FE-07 (ashtakavarga — advanced gate)
    → FE-08 (divisional charts — advanced gate)
```

---

## Key library imports (all tasks)

```typescript
import type {
  VedicChartCalculations,
  VedicAstrologyCalculator,
  PlanetaryPositions,
  PlanetPosition,
  HousePositions,
  HouseInfo,
  Yoga,
  AshtakavargaCalculations,
  VimshottariDasha,
  PlanetDasha,
  Planet,
  ZodiacSign,
  HouseNumber,
  Nakshatra,
} from 'openastrology-library'

import {
  ZodiacUtils,
  NakshatraUtils,
  PlanetUtils,
  HouseUtils,
} from 'openastrology-library'
```

---

## NOT in scope for these tasks (separate BRD)

- Human Design bodygraph, HD type/strategy/authority
- HD weekly tips
- HD profile strip on dashboard
- openhumandesign-library integration

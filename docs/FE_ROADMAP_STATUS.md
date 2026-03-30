# FE roadmap — alignment with `instructions/data/README.md`

This document satisfies the roadmap review: each `FE-XX-*.md` under `instructions/data/` is indexed, the recommended build order is stated, and `UserAstroSnapshot` status is recorded. Update this file when a task’s implementation status changes.

## Recommended build order (from README)

```
FE-11 → FE-01 → FE-10 → FE-09 → FE-02 → FE-03 → FE-04 → FE-05 → FE-06 → FE-07 → FE-08
```

`FE-00-unified-chart-page.md` (not in the README table) explicitly **depends on FE-01–FE-11** and should be treated as **integration last**.

## Spec index and scope (one line each)

| Spec | File | What it defines |
|------|------|-----------------|
| FE-00 | `instructions/data/FE-00-unified-chart-page.md` | Single `/dashboard/chart` page: parallel fetch, sections, sticky nav — **wire-up after** FE-01–FE-11 |
| FE-01 | `FE-01-natal-chart-grid.md` | South/North natal grid, tooltips, `GET /api/chart`, first snapshot upsert |
| FE-02 | `FE-02-planetary-analysis.md` | Planet table, dignity, Drishti, CSV, **30** snapshot fields on first load |
| FE-03 | `FE-03-house-analysis.md` | 12 house cards, strength, **14** snapshot fields |
| FE-04 | `FE-04-yoga-summary.md` | Yoga summary UI, **8** snapshot fields |
| FE-05 | `FE-05-dasha-timeline.md` | Dasha timeline, milestones, **10** snapshot fields |
| FE-06 | `FE-06-special-points.md` | Special lagnas + Charakarakas UI, **8** snapshot fields |
| FE-07 | `FE-07-ashtakavarga.md` | Ashtakavarga panels, **13** snapshot fields |
| FE-08 | `FE-08-divisional-charts.md` | D9/D10 etc., **7** snapshot fields |
| FE-09 | `FE-09-daily-transit.md` | Daily transit strip, **8** daily-overwritten snapshot fields |
| FE-10 | `FE-10-daily-insight-feed.md` | Daily insight card, streak, feedback, **5** snapshot fields |
| FE-11 | `FE-11-birth-profile.md` | Birth form, geocode, unknown time, cache invalidation, **9** profile snapshot fields |

## `UserAstroSnapshot` (Prisma)

- **Present** in `prisma/schema.prisma` as model `UserAstroSnapshot` (`@@map("user_astro_snapshots")`), with scalar columns labeled in comments **FE-01** through **FE-10** plus `feJson Json?` for extensibility.
- **Writes today:** `PATCH /api/user/astro-snapshot` uses `lib/astro/snapshotFromChart.ts` (`buildSnapshotUpsertData`) to upsert lagna/ayanamsa/profile fields and merge **`feJson.planetSnapshot`**; it does **not** yet populate every scalar column listed for FE-03–FE-10 (those remain for incremental wiring per task checklists in each `FE-XX` file).

## Repo alignment (high level)

| README step | Typical location / notes |
|-------------|---------------------------|
| FE-11 | `components/profile/BirthProfileForm.tsx`, `app/api/birth-profile/route.ts`, `invalidateChartCache` |
| FE-01 | `app/(app)/chart/page.tsx` (natal hub; README’s “core visual”), `components/chart/NatalChartGrid.tsx` |
| FE-10 | Daily insights APIs and dashboard surfaces (see `app/api/insights/*`, dashboard) |
| FE-09 | Transit fetch + chart client (`app/api/chart/transits`, `ChartPageClient` transit) |
| FE-02–FE-08 | Chart tabs and panels under `components/chart/` (planets, houses, yogas, dasha, special points, ashtakavarga, divisional) |
| FE-00 | Target in spec is `app/dashboard/chart/page.tsx`; repo currently uses `app/(app)/chart/page.tsx` — unify or add dashboard route when implementing FE-00 |

## Out of scope (README)

Human Design bodygraph, HD tips, HD profile strip, and `openhumandesign-library` are **not** part of these FE task files.

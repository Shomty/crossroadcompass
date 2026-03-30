# Task: FE-00 — Unified Chart Page (All Calculations, One Page)
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: FE-01 through FE-11 components (all must be built first)
# This task wires everything together — build last
# Updated: 2026-03-28

---

## What this builds

A single page at `/dashboard/chart` that fetches all user calculations in parallel
and renders them in named, scrollable sections with a sticky sidebar navigation.

No new backend logic is introduced here. This task is purely the data-fetching
orchestration, page layout, and section wiring for components already built in FE-01 to FE-11.

---

## Page route

**`app/dashboard/chart/page.tsx`** — Next.js Server Component with parallel data fetching.

---

## Step 1 — Parallel data fetching (server-side)

Fetch all data in a single `Promise.all`. Never await sequentially.

```typescript
// app/dashboard/chart/page.tsx
import { getRequiredSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'
import {
  getOrCreateVedicChart,
  getOrCreateTodayTransits,
  getOrCreateDivisionalCharts,
  getOrCreateSpecialPoints,
  getCurrentDasha,
  getMahadashaRemaining,
} from '@/lib/astro/chartService'

export default async function ChartPage() {
  const session = await getRequiredSession()
  const userId  = session.user.id

  const profile = await prisma.birthProfile.findUnique({ where: { userId } })
  if (!profile) redirect('/onboarding')

  // ── All calculations fetched in parallel ──────────────────────────────
  const [
    chart,
    transitChart,
    divisionalCharts,
    specialPoints,
    todayInsight,
    streak,
  ] = await Promise.all([
    getOrCreateVedicChart(userId, profile),
    getOrCreateTodayTransits(userId, profile),
    getOrCreateDivisionalCharts(userId, profile),
    getOrCreateSpecialPoints(userId),
    prisma.insight.findUnique({
      where: { userId_date: { userId, date: new Date().toISOString().slice(0, 10) } }
    }),
    prisma.insight.count({ where: { userId } }),  // used for streak — swap for real streak calc
  ])

  // ── Derived values (pure, no extra DB/KV calls) ───────────────────────
  const currentDasha    = getCurrentDasha(chart)
  const dashaRemaining  = currentDasha.mahaDasha ? getMahadashaRemaining(chart) : null
  const birthTimeKnown  = profile.birthTime !== null

  return (
    <ChartPageLayout
      chart={chart}
      transitChart={transitChart}
      divisionalCharts={divisionalCharts}
      specialPoints={specialPoints}
      todayInsight={todayInsight}
      currentDasha={currentDasha}
      dashaRemaining={dashaRemaining}
      birthTimeKnown={birthTimeKnown}
      profile={profile}
    />
  )
}
```

**Important:** `getOrCreateVedicChart`, `getOrCreateTodayTransits`, `getOrCreateDivisionalCharts`, and `getOrCreateSpecialPoints` all read from KV first. For a returning user with a warm cache, the entire `Promise.all` completes in < 100ms (no ephemeris computation). Computation only happens on cache miss (first visit or after `invalidateChartCache`).

---

## Step 2 — Page layout component

**`components/chart/ChartPageLayout.tsx`** — Client Component (needs `useState` for active section).

```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import type {
  VedicChartCalculations,
  PlanetDasha,
} from 'openastrology-library'

interface ChartPageLayoutProps {
  chart:            VedicChartCalculations
  transitChart:     VedicChartCalculations
  divisionalCharts: Record<string, VedicChartCalculations>
  specialPoints:    SpecialPointsResult
  todayInsight:     Insight | null
  currentDasha:     { mahaDasha?: PlanetDasha; antarDasha?: PlanetDasha }
  dashaRemaining:   { years: number; months: number; days: number } | null
  birthTimeKnown:   boolean
  profile:          BirthProfile
}
```

---

## Step 3 — Section definitions

Define the sections as a static config array. This drives both the sidebar nav and
the section rendering order.

```typescript
// lib/chart/sections.ts

export interface SectionConfig {
  id:       string
  label:    string          // sidebar label
  sublabel: string          // one-line description shown in sidebar
  icon:     string          // emoji or Lucide icon name
  advanced: boolean         // gated behind "Advanced" toggle
}

export const CHART_SECTIONS: SectionConfig[] = [
  {
    id:       'insight',
    label:    'Today\'s Insight',
    sublabel: 'Your daily AI-generated guidance',
    icon:     '✦',
    advanced: false,
  },
  {
    id:       'natal',
    label:    'Birth Chart',
    sublabel: 'Planetary positions at birth',
    icon:     '◎',
    advanced: false,
  },
  {
    id:       'planets',
    label:    'Planets',
    sublabel: 'Dignity, nakshatra, aspects',
    icon:     '♃',
    advanced: false,
  },
  {
    id:       'houses',
    label:    'Life Areas',
    sublabel: 'Strength per life domain',
    icon:     '⌂',
    advanced: false,
  },
  {
    id:       'combinations',
    label:    'Chart Combinations',
    sublabel: 'Leadership & wealth indicators',
    icon:     '✦',
    advanced: false,
  },
  {
    id:       'dasha',
    label:    'Life Period',
    sublabel: 'Current Vimshottari phase',
    icon:     '◷',
    advanced: false,
  },
  {
    id:       'transits',
    label:    'Today\'s Sky',
    sublabel: 'Current planetary positions',
    icon:     '☽',
    advanced: false,
  },
  {
    id:       'special',
    label:    'Special Points',
    sublabel: 'Arudha Lagna, Charakarakas',
    icon:     '◈',
    advanced: false,
  },
  {
    id:       'ashtakavarga',
    label:    'Ashtakavarga',
    sublabel: 'House strength grid',
    icon:     '▦',
    advanced: true,
  },
  {
    id:       'divisional',
    label:    'Divisional Charts',
    sublabel: 'D9 Navamsa, D10 Dasamsa',
    icon:     '⊞',
    advanced: true,
  },
]
```

---

## Step 4 — Sticky sidebar navigation

**`components/chart/ChartSidebar.tsx`**

```typescript
'use client'

interface ChartSidebarProps {
  sections:       SectionConfig[]
  activeSection:  string
  showAdvanced:   boolean
  onToggleAdvanced: () => void
}
```

Layout (desktop only — hidden on mobile, replaced by top tab bar):
- Fixed left sidebar, `w-56`, full viewport height, `overflow-y-auto`.
- Each section as a nav item: icon + label + sublabel.
- Active section highlighted with `bg-indigo-50 border-l-2 border-indigo-600`.
- At the bottom of the list, a toggle:
  ```tsx
  <button onClick={onToggleAdvanced} className="text-xs text-gray-400 mt-4">
    {showAdvanced ? '▲ Hide advanced sections' : '▼ Show advanced sections'}
  </button>
  ```
  Advanced sections (ashtakavarga, divisional) are hidden from the nav until toggled.

On click, smooth-scroll to section using:
```typescript
document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
```

Active section tracking via `IntersectionObserver`:
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    entries => {
      const visible = entries.find(e => e.isIntersecting)
      if (visible) setActiveSection(visible.target.id)
    },
    { threshold: 0.3 }
  )
  sections.forEach(s => {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  })
  return () => observer.disconnect()
}, [sections])
```

---

## Step 5 — Mobile top tab bar

**`components/chart/ChartTabBar.tsx`**

Shown on `md:hidden`. Horizontally scrollable row of pill tabs, one per non-advanced section.
Active tab: `bg-indigo-600 text-white`. Tap scrolls to section (same smooth-scroll as sidebar).

```tsx
<div className="flex overflow-x-auto gap-2 px-4 py-2 sticky top-0 bg-white z-30 border-b">
  {sections.filter(s => !s.advanced).map(s => (
    <button
      key={s.id}
      onClick={() => scrollTo(s.id)}
      className={`whitespace-nowrap px-3 py-1 rounded-full text-sm font-medium
        ${activeSection === s.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
    >
      {s.icon} {s.label}
    </button>
  ))}
</div>
```

---

## Step 6 — Section wrapper component

**`components/chart/ChartSection.tsx`**

```typescript
interface ChartSectionProps {
  id:       string
  title:    string
  sublabel?: string
  children: React.ReactNode
}

export function ChartSection({ id, title, sublabel, children }: ChartSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-16 py-8 border-b border-gray-100 last:border-0"
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {sublabel && <p className="text-sm text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      {children}
    </section>
  )
}
```

`scroll-mt-16` offsets the sticky header height so sections are not cut off on anchor scroll.

---

## Step 7 — Full page assembly

**`components/chart/ChartPageLayout.tsx`** (continued from Step 2):

```tsx
export function ChartPageLayout({ chart, transitChart, divisionalCharts, specialPoints,
  todayInsight, currentDasha, dashaRemaining, birthTimeKnown, profile }: ChartPageLayoutProps) {

  const [activeSection, setActiveSection] = useState('insight')
  const [showAdvanced, setShowAdvanced]   = useState(false)

  const visibleSections = CHART_SECTIONS.filter(s => showAdvanced || !s.advanced)

  return (
    <div className="flex min-h-screen">

      {/* Sidebar — desktop */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="sticky top-0 h-screen overflow-y-auto py-6 pr-4">
          <ChartSidebar
            sections={visibleSections}
            activeSection={activeSection}
            showAdvanced={showAdvanced}
            onToggleAdvanced={() => setShowAdvanced(v => !v)}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 max-w-3xl px-4 md:px-8 py-6">

        {/* Mobile tab bar */}
        <div className="md:hidden -mx-4 mb-4">
          <ChartTabBar
            sections={visibleSections}
            activeSection={activeSection}
            onSelect={setActiveSection}
          />
        </div>

        {/* Birth time warning — shown once at top if applicable */}
        {!birthTimeKnown && (
          <div className="bg-amber-50 border border-amber-200 rounded px-4 py-2 text-sm text-amber-800 mb-6">
            Birth time unknown — Ascendant, house positions, and time-sensitive
            special points are approximate (solar noon used).
          </div>
        )}

        {/* ── Section: Today's Insight ── */}
        <ChartSection id="insight" title="Today's Insight" sublabel="Your daily Jyotish guidance">
          <DailyInsightCard
            insight={todayInsight}
            pending={!todayInsight}
            dashaContext={deriveDashaContext(currentDasha, dashaRemaining)}
            transitChart={transitChart}
          />
        </ChartSection>

        {/* ── Section: Birth Chart ── */}
        <ChartSection id="natal" title="Birth Chart" sublabel="Planetary positions at the moment of your birth">
          <NatalChartGrid chart={chart} birthTimeKnown={birthTimeKnown} />
        </ChartSection>

        {/* ── Section: Planets ── */}
        <ChartSection id="planets" title="Planets" sublabel="Dignity, nakshatra, house placement, and aspects">
          <PlanetSummaryCard planets={chart.planets} />
          <PlanetTable planets={chart.planets} />
          <DrushtiVisualizer planets={chart.planets} />
          <PlanetExportButton planets={chart.planets} />
        </ChartSection>

        {/* ── Section: Life Areas (Houses) ── */}
        <ChartSection id="houses" title="Life Areas" sublabel="How the 12 areas of life show up in your chart">
          <HouseGrid houses={chart.houses} planets={chart.planets} />
        </ChartSection>

        {/* ── Section: Chart Combinations (Yogas) ── */}
        <ChartSection id="combinations" title="Chart Combinations" sublabel="Planetary patterns shaping your strengths">
          <YogaSummaryCard yogas={chart.yogas} />
        </ChartSection>

        {/* ── Section: Life Period (Dasha) ── */}
        <ChartSection id="dasha" title="Life Period" sublabel="Your current Vimshottari phase and what it means">
          <DashaTimeline
            periods={chart.dashas.vimshottari.dashaPeriods}
            current={currentDasha}
            remaining={dashaRemaining}
            birthDate={profile.birthDate}
          />
          <UpcomingMilestones periods={chart.dashas.vimshottari.dashaPeriods} />
        </ChartSection>

        {/* ── Section: Today's Sky (Transits) ── */}
        <ChartSection id="transits" title="Today's Sky" sublabel="Where the planets are right now and what they activate">
          <TransitSnapshotStrip transitChart={transitChart} />
          <MoonTracker transitChart={transitChart} />
          <HotTransitsCard natalChart={chart} transitChart={transitChart} />
          <details className="mt-4">
            <summary className="text-sm text-indigo-600 cursor-pointer">
              Show full transit overlay chart
            </summary>
            <TransitOverlayGrid natalChart={chart} transitChart={transitChart} />
          </details>
        </ChartSection>

        {/* ── Section: Special Points ── */}
        <ChartSection id="special" title="Special Points" sublabel="Soul indicators and public image markers">
          <SpecialPointsPanel data={specialPoints} birthTimeKnown={birthTimeKnown} />
        </ChartSection>

        {/* ── Advanced sections (hidden until toggled) ── */}
        {showAdvanced && (
          <>
            {/* ── Section: Ashtakavarga ── */}
            <ChartSection id="ashtakavarga" title="Ashtakavarga" sublabel="House strength scoring by planetary contribution">
              <AshtakavargaPanel chart={chart} />
            </ChartSection>

            {/* ── Section: Divisional Charts ── */}
            <ChartSection id="divisional" title="Divisional Charts" sublabel="D9 Navamsa, D10 Dasamsa, and all 16 vargas">
              <DivisionalChartSelector
                divisional={divisionalCharts}
                natalChart={chart}
              />
            </ChartSection>
          </>
        )}

        {/* Advanced toggle (bottom of page) */}
        <div className="py-8 text-center">
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className="text-sm text-gray-400 hover:text-indigo-600 transition-colors"
          >
            {showAdvanced
              ? '▲ Hide advanced sections'
              : '▼ Show advanced chart data (Ashtakavarga, Divisional Charts)'}
          </button>
        </div>

      </main>
    </div>
  )
}
```

---

## Step 8 — Helper: deriveDashaContext

```typescript
// lib/chart/deriveDashaContext.ts
import type { PlanetDasha } from 'openastrology-library'
import { MAHADASHA_THEMES } from '@/lib/astro/dashaLabels'

export function deriveDashaContext(
  current:   { mahaDasha?: PlanetDasha; antarDasha?: PlanetDasha },
  remaining: { years: number; months: number; days: number } | null
) {
  if (!current.mahaDasha) return null

  const planet = current.mahaDasha.planet
  const theme  = MAHADASHA_THEMES[planet]

  return {
    mahadashaPlanet:   planet,
    antardashaP lanet: current.antarDasha?.planet ?? null,
    dashaEndDate:      current.mahaDasha.endDate.toISOString().slice(0, 10),
    dashaTheme:        theme?.theme ?? '',
    dashaKeyword:      theme?.keyword ?? '',
    humanRemaining:    remaining
      ? remaining.years >= 1
        ? `About ${remaining.years} year${remaining.years > 1 ? 's' : ''} left`
        : `${remaining.months} month${remaining.months !== 1 ? 's' : ''} left`
      : null,
  }
}
```

---

## Step 9 — Loading and error states

**`app/dashboard/chart/loading.tsx`** (Next.js built-in loading UI):

```tsx
export default function Loading() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:block w-56 shrink-0">
        <div className="p-6 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </aside>
      <main className="flex-1 max-w-3xl px-4 md:px-8 py-6 space-y-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
            <div className="h-48 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </main>
    </div>
  )
}
```

**`app/dashboard/chart/error.tsx`** (Next.js built-in error boundary):

```tsx
'use client'
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-gray-600">Something went wrong loading your chart.</p>
      <button onClick={reset} className="px-4 py-2 bg-indigo-600 text-white rounded">
        Try again
      </button>
    </div>
  )
}
```

---

## Step 10 — Navigation link

Add the chart page to the main app navigation in `components/layout/AppNav.tsx`:

```tsx
<NavLink href="/dashboard/chart" icon="◎">
  My Chart
</NavLink>
```

This should be the second item in the nav after "Dashboard" (daily insight home).

---

## Step 11 — Admin snapshot trigger

On this page's first render (client effect, fires once per session), call the snapshot upsert
to ensure all admin variables are up to date:

```typescript
// Inside ChartPageLayout — client side, fire once
useEffect(() => {
  fetch('/api/admin/snapshot', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildSnapshot(chart, transitChart, specialPoints, currentDasha, dashaRemaining, profile)),
  }).catch(() => {}) // fire and forget; never block render
}, []) // empty dep array = once per mount
```

**`lib/chart/buildSnapshot.ts`** — consolidates all admin variable derivations from FE-01 to FE-11 into a single object:

```typescript
import { sarvaByHouse, planetBhinnaTotal } from '@/lib/astro/ashtakavargaUtils'
import { MAHADASHA_THEMES } from '@/lib/astro/dashaLabels'

export function buildSnapshot(
  chart:         VedicChartCalculations,
  transitChart:  VedicChartCalculations,
  specialPoints: SpecialPointsResult,
  currentDasha:  { mahaDasha?: PlanetDasha; antarDasha?: PlanetDasha },
  remaining:     { years: number; months: number; days: number } | null,
  profile:       BirthProfile,
) {
  const p = chart.planets
  const sarva = sarvaByHouse(chart)
  const sarvaVals = Object.values(sarva)
  const yogas = chart.yogas
  const today = new Date().toISOString().slice(0, 10)

  return {
    // Birth profile
    birthDate:         profile.birthDate.toISOString().slice(0, 10),
    birthTime:         profile.birthTime ?? null,
    birthTimeKnown:    profile.birthTime !== null,
    birthLatitude:     profile.latitude,
    birthLongitude:    profile.longitude,
    birthTimezone:     profile.timezone,
    profileUpdatedAt:  profile.updatedAt,

    // Lagna
    lagnaSign:          chart.ascendant.sign,
    lagnaDegree:        chart.ascendant.degree,
    lagnaNakshatra:     chart.ascendant.nakshatra,
    lagnaNakshatraPada: chart.ascendant.nakshatraPada,
    ayanamsa:           chart.ayanamsa,

    // Planets
    sunSign: p.sun.sign, sunHouse: p.sun.house, sunNakshatra: p.sun.nakshatra,
    sunDignity: p.sun.dignity, sunRetrograde: p.sun.isRetrograde, sunCombust: p.sun.isCombust,
    moonSign: p.moon.sign, moonHouse: p.moon.house, moonNakshatra: p.moon.nakshatra,
    moonNakshatraPada: p.moon.nakshatraPada, moonDignity: p.moon.dignity,
    marsSign: p.mars.sign, marsHouse: p.mars.house, marsDignity: p.mars.dignity,
    marsRetrograde: p.mars.isRetrograde,
    mercurySign: p.mercury.sign, mercuryHouse: p.mercury.house,
    jupiterSign: p.jupiter.sign, jupiterHouse: p.jupiter.house, jupiterDignity: p.jupiter.dignity,
    venusSign: p.venus.sign, venusHouse: p.venus.house,
    saturnSign: p.saturn.sign, saturnHouse: p.saturn.house, saturnRetrograde: p.saturn.isRetrograde,
    rahuSign: p.rahu.sign, rahuHouse: p.rahu.house,
    ketuSign: p.ketu.sign, ketuHouse: p.ketu.house,
    retrogradeCount: Object.values(p).filter(pl => pl.isRetrograde).length,
    combustCount:    Object.values(p).filter(pl => pl.isCombust).length,

    // Houses
    house1Sign: chart.houses[1].sign, house1Lord: chart.houses[1].lord, house1Strength: chart.houses[1].strength,
    house5Sign: chart.houses[5].sign, house5Lord: chart.houses[5].lord, house5Strength: chart.houses[5].strength,
    house7Sign: chart.houses[7].sign, house7Lord: chart.houses[7].lord,
    house10Sign: chart.houses[10].sign, house10Lord: chart.houses[10].lord, house10Strength: chart.houses[10].strength,
    strongestHouseNum: Number(Object.entries(sarva).sort((a,b) => b[1]-a[1])[0][0]),
    weakestHouseNum:   Number(Object.entries(sarva).sort((a,b) => a[1]-b[1])[0][0]),

    // Yogas
    totalYogasCount:  yogas.length,
    rajaYogasCount:   yogas.filter(y => ['Raja','Neechabhanga'].includes(y.type)).length,
    dhanaYogasCount:  yogas.filter(y => y.type === 'Dhana').length,
    strongYogasCount: yogas.filter(y => y.strength === 'Strong').length,
    hasNeechabhanga:  yogas.some(y => y.type === 'Neechabhanga'),
    topYogaName:      yogas.filter(y => y.strength === 'Strong')[0]?.name ?? null,
    topYogaStrength:  yogas.filter(y => y.strength === 'Strong')[0]?.strength ?? null,
    yogaNamesAll:     JSON.stringify(yogas.map(y => y.name)),

    // Dasha
    mahadashaPlanet:       currentDasha.mahaDasha?.planet ?? null,
    mahadashaStartDate:    currentDasha.mahaDasha?.startDate ?? null,
    mahadashaEndDate:      currentDasha.mahaDasha?.endDate ?? null,
    mahadashaRemainingYrs: remaining?.years ?? null,
    mahadashaRemainingMos: remaining?.months ?? null,
    antardashaP lanet:     currentDasha.antarDasha?.planet ?? null,
    antardashaStartDate:   currentDasha.antarDasha?.startDate ?? null,
    antardashaEndDate:     currentDasha.antarDasha?.endDate ?? null,

    // Ashtakavarga
    avSarvaHouse1: sarva[1], avSarvaHouse5: sarva[5],
    avSarvaHouse7: sarva[7], avSarvaHouse10: sarva[10],
    avSarvaTotal:    sarvaVals.reduce((a,b) => a+b, 0),
    avSarvaMax:      Math.max(...sarvaVals),
    avSarvaMaxHouse: Number(Object.entries(sarva).sort((a,b) => b[1]-a[1])[0][0]),
    avSarvaMin:      Math.min(...sarvaVals),
    avSarvaMinHouse: Number(Object.entries(sarva).sort((a,b) => a[1]-b[1])[0][0]),
    avSunBhinna:     planetBhinnaTotal(chart, 'sun'),
    avMoonBhinna:    planetBhinnaTotal(chart, 'moon'),
    avJupiterBhinna: planetBhinnaTotal(chart, 'jupiter'),
    avSaturnBhinna:  planetBhinnaTotal(chart, 'saturn'),

    // Special points
    arudhaLagnaSign:       specialPoints.arudhaLagna?.sign ?? null,
    arudhaLagnaHouse:      specialPoints.arudhaLagna?.house ?? null,
    ghatiLagnaSign:        specialPoints.ghatiLagna?.sign ?? null,
    bhavaLagnaSign:        specialPoints.bhavaLagna?.sign ?? null,
    horaLagnaSign:         specialPoints.horaLagna?.sign ?? null,
    atmakarak aPlanet:     specialPoints.charakarakas?.atmakaraka ?? null,
    amatyakarakaPlanet:    specialPoints.charakarakas?.amatyakaraka ?? null,
    specialPointsCalcAt:   specialPoints.calculatedAt ?? null,

    // Transits (overwrite daily)
    transitSunSign:        transitChart.planets.sun.sign,
    transitMoonSign:       transitChart.planets.moon.sign,
    transitMoonNakshatra:  transitChart.planets.moon.nakshatra,
    transitMarsSign:       transitChart.planets.mars.sign,
    transitJupiterSign:    transitChart.planets.jupiter.sign,
    transitSaturnSign:     transitChart.planets.saturn.sign,
    transitSaturnRetro:    transitChart.planets.saturn.isRetrograde,
    transitCacheDate:      today,

    // Meta
    vedicChartCachedAt: new Date().toISOString(),
  }
}
```

---

## Step 12 — Performance checklist

Before considering this task done, verify these performance properties:

- [ ] The `Promise.all` in the server component resolves in < 200ms for warm-cache users
      (all data from KV, no ephemeris computation). Test with `console.time('chart-page')`.
- [ ] `getOrCreateDivisionalCharts` is the slowest call on cache miss (~500ms for 16 vargas).
      It must not block the page render. If it causes timeout: defer it — render the page without
      divisional charts and load them lazily via `useEffect` + client-side `fetch('/api/chart/divisional')`.
- [ ] `IntersectionObserver` for sidebar active section must not cause re-renders of the
      whole layout. Use a `ref` callback or `useCallback` to keep it stable.
- [ ] The snapshot upsert (`/api/admin/snapshot`) must be fire-and-forget. Never `await` it
      in the render path.

---

## Done when

- [ ] `app/dashboard/chart/page.tsx` exists and renders all sections in a single page load.
- [ ] `Promise.all` fetches all calculations in parallel (no sequential awaits).
- [ ] Sticky sidebar renders on desktop with all section links.
- [ ] `IntersectionObserver` tracks scroll position and highlights active sidebar link.
- [ ] Mobile tab bar renders and scrolls to sections on tap.
- [ ] Birth-time warning banner appears once at the top when `birthTimeKnown === false`.
- [ ] All 10 sections render with correct data from their respective components.
- [ ] Advanced sections (Ashtakavarga, Divisional Charts) hidden until toggled.
- [ ] `loading.tsx` skeleton renders while server component fetches data.
- [ ] `error.tsx` boundary catches and shows retry option.
- [ ] `buildSnapshot.ts` sends all ~144 admin variables to `/api/admin/snapshot` on first mount.
- [ ] Nav link to `/dashboard/chart` exists in `AppNav`.
- [ ] TypeScript compiles across all files with no `any` casts.
- [ ] Warm-cache page load < 200ms server time (verify with Next.js server timing headers).

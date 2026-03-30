# Task: FE-10 — Daily AI Insight Feed
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: OA.12/OA.13 (cron daily-insights), FE-05 (DashaWidget), FE-09 (TransitSnapshotStrip)
# Updated: 2026-03-28

---

## What this builds

The primary dashboard card. AI-generated daily insight (Jyotish-only: Dasha + transits)
with active dasha context, transit strip, feedback, share, and streak counter.

---

## Existing backend

- Cron: `GET /api/cron/daily-insights` — generates insight per user using
  `generateDailyInsight` in `lib/ai/dailyInsightService.ts`.
- Context: Vimshottari Dasha from Prisma `dasha` rows + sidereal transit lines
  from `getOrCreateTodayTransits` (OA.13).
- Output stored in the `insights` Prisma table (assumed schema: `userId`, `date`, `content`, `createdAt`).

Confirm `insights` table exists. If not, create migration:
```prisma
model Insight {
  id        String   @id @default(cuid())
  userId    String
  date      String   // YYYY-MM-DD
  content   String   @db.Text
  feedback  String?  // 'positive' | 'negative' | null
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, date])
}
```

---

## API route

**`GET /api/insights/daily`** — create `app/api/insights/daily/route.ts` if not present:

```typescript
import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getRequiredSession()
  const today   = new Date().toISOString().slice(0, 10)

  const insight = await prisma.insight.findUnique({
    where: { userId_date: { userId: session.user.id, date: today } }
  })

  if (!insight) return NextResponse.json({ pending: true })
  return NextResponse.json({ insight })
}
```

**`POST /api/insights/feedback`** — create `app/api/insights/feedback/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getRequiredSession()
  const { date, feedback } = await req.json()  // feedback: 'positive' | 'negative'
  await prisma.insight.update({
    where: { userId_date: { userId: session.user.id, date } },
    data:  { feedback },
  })
  return NextResponse.json({ ok: true })
}
```

---

## New files

### `components/dashboard/DailyInsightCard.tsx`

Props: `{ insight: Insight | null; pending: boolean; dashaContext: DashaContext; transitChart: VedicChartCalculations }`

Where `DashaContext` is:
```typescript
interface DashaContext {
  mahadashaPlanet:  string
  antardashaP lanet: string
  dashaEndDate:     string
  dashaTheme:       string  // from MAHADASHA_THEMES in lib/astro/dashaLabels.ts
}
```

**Pending state** (cron not yet run):
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
  <p className="text-sm text-gray-400 mt-3">Generating your daily insight...</p>
</div>
```

**Loaded state**:

Layout:
1. **Date badge**: `"[Weekday, Month Day]"` — e.g., "Saturday, March 28"
2. **Insight text** (collapsed): first 3 sentences visible.
   Detect sentence boundaries with a simple regex: `/[.!?]+\s+/`.
   "Read more →" expands to full content. Full content uses a `whitespace-pre-wrap` `<p>`.
3. **Active dasha strip** (below text):
   ```
   [Planet keyword] Period · [Antardasha planet] sub-period
   Ends [formatted date]
   ```
   Use `MAHADASHA_THEMES[mahadashaPlanet].keyword` for the label.
4. **Transit snapshot**: embed `<TransitSnapshotStrip>` from FE-09 (compact, 3-planet version: Sun, Moon, notable retrograde only).
5. **Action row**:
   - Share button: copies insight text to clipboard. Toast: "Copied to clipboard."
   - Thumbs up / Thumbs down: calls `POST /api/insights/feedback`. After click, show "Thanks for the feedback."
   - Selected feedback state persists (don't allow re-voting; gray out the unselected button).

**Streak counter** (below card):
```tsx
// Compute streak from consecutive daily Insight rows in DB
// Expose via GET /api/insights/streak → { streak: number }
<p className="text-sm text-gray-500">{streak}-day streak 🔥</p>
```
Show only if `streak >= 2`. Suppressed for day 1.

### `app/api/insights/streak/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getRequiredSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getRequiredSession()
  const insights = await prisma.insight.findMany({
    where:   { userId: session.user.id },
    orderBy: { date: 'desc' },
    select:  { date: true },
    take:    60,
  })
  let streak = 0
  let cursor = new Date()
  for (const { date } of insights) {
    const d = new Date(date)
    const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000)
    if (diff > 1) break
    streak++
    cursor = d
  }
  return NextResponse.json({ streak })
}
```

---

## Prompt quality enforcement (OA.13 prompt builder)

In `lib/content/promptBuilder.ts`, `buildDailyInsightPrompt` must enforce:
1. Hard cap: add to the system prompt — "Respond in exactly 3–4 sentences. No more."
2. No prediction language: add — "Never use 'you will', 'this will cause', 'you are going to'. Use 'this period tends to', 'you may notice', 'this is often a time when'."
3. Practical ending: add — "Always end with a specific, actionable implication or question for the user's day."

These additions do not require a new Gemini call — they are system prompt additions only.

---

## Dashboard layout

On `app/dashboard/page.tsx` (top-level):

```tsx
// Fetch in parallel:
const [insightData, dashaData, transitData, streakData] = await Promise.all([
  fetch('/api/insights/daily'),
  fetch('/api/chart/dasha'),
  fetch('/api/chart/transits'),
  fetch('/api/insights/streak'),
])

<main>
  <DailyInsightCard
    insight={insightData.insight ?? null}
    pending={insightData.pending ?? false}
    dashaContext={deriveDashaContext(dashaData)}
    transitChart={transitData.transitChart}
  />
  {/* streak shown below */}
  <DashaWidget ... />   {/* FE-05 */}
  {/* Transit panel (FE-09) collapsed card below */}
</main>
```

---

## Admin variables to persist

Extend `UserAstroSnapshot` PATCH (daily update):
```typescript
{
  lastInsightDate:        today,
  lastInsightGeneratedAt: insight.createdAt,
  insightStreakDays:       streak,
  totalInsightsCount:     await prisma.insight.count({ where: { userId } }),
  insightFeedbackLast:    insight.feedback ?? 'none',
}
```

---

## Done when

- [ ] `Insight` Prisma model exists with `@@unique([userId, date])`.
- [ ] `GET /api/insights/daily` returns insight or `{ pending: true }`.
- [ ] `POST /api/insights/feedback` updates the feedback field.
- [ ] `GET /api/insights/streak` correctly counts consecutive days.
- [ ] `DailyInsightCard` renders pending skeleton when cron has not yet run.
- [ ] Collapsed / expanded text works; 3-sentence detection is reasonable.
- [ ] Active dasha strip shows keyword + antardasha + end date.
- [ ] Transit strip shows Sun, Moon, and notable retrograde (compact, 3-planet).
- [ ] Share button copies to clipboard with toast confirmation.
- [ ] Thumbs up/down posts feedback; state persists visually.
- [ ] Streak counter shown for streak >= 2.
- [ ] Prompt builder enforces 3–4 sentence cap and no-prediction-language rules.
- [ ] 5 admin variables updated daily in `UserAstroSnapshot`.
- [ ] TypeScript compiles. No `any` casts.

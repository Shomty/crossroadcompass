# Copilot Task — Today's Guidance (DB-02)

## Paste this into: `gh copilot suggest`

---

Build the Today's Guidance component for the Crossroads Compass dashboard.

## Context

- Next.js App Router, TypeScript strict mode, Tailwind
- Dashboard layout already exists at `app/(dashboard)/layout.tsx`
- Auth: NextAuth, session available via `getRequiredSession()` from `lib/auth/helpers.ts`
- DB: Prisma. Relevant model:
  ```
  Insight {
    id           String
    userId       String
    type         InsightType   // 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'HD_TIP'
    content      String
    generatedAt  DateTime
    deliveredAt  DateTime?
    openedAt     DateTime?
    accuracyRating Int?        // 1–5, nullable
  }
  ```

## What to build

### 1. Server component — `app/(dashboard)/page.tsx`

- Get session with `getRequiredSession()`
- Query Prisma for the most recent Insight where:
  - `userId` = current user
  - `type` = `'DAILY'`
  - `generatedAt` is today (UTC)
- Pass result (or null) to `<TodaysGuidance />` as a prop

### 2. Client component — `components/insights/TodaysGuidance.tsx`

Props:
```typescript
type Props = {
  insight: {
    id: string
    content: string
    generatedAt: Date
    accuracyRating: number | null
  } | null
}
```

Render logic:
- **If insight is null:** show placeholder card — "Your guidance for today is being prepared. Check back shortly." Subtle pulsing skeleton style.
- **If insight exists:** show the insight content in a readable card. Below the content, show a 1–5 star accuracy rating widget.

### 3. Rating widget behaviour

- Stars are interactive (click to rate)
- On click: POST to `/api/insights/rate` with body `{ insightId, rating }`
- Optimistic UI — update star highlight immediately, don't wait for response
- If `accuracyRating` is already set: show filled stars as read-only (already rated)
- Do NOT use a form element. Use `onClick` handlers only.

### 4. API route — `app/api/insights/rate/route.ts`

- POST handler, requires auth
- Body: `{ insightId: string, rating: number }` — validate with Zod (rating must be 1–5 integer)
- Update `Insight.accuracyRating` in Prisma for the given `insightId` only if it belongs to the current user
- Return `{ ok: true }` on success

## Rules

- Max 4 sentences of insight content visible — no truncation needed, content is already short
- Tone of placeholder is warm, not technical ("being prepared" not "no data found")
- Stars use filled/empty state — no third-party rating library
- No `localStorage` or `sessionStorage`
- All DB queries server-side only — no Prisma calls in client components

## Do NOT build

- Weekly forecast (separate task)
- Life phase indicator (separate task)
- Email delivery logic

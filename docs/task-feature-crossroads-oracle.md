# Task: Crossroads Oracle™ — Personalized Life Guidance Engine
# Feature: F.CO (Crossroads Oracle)
# Phase: FREE Tier Feature — P0
# Purpose: Give every free user a single personalized, actionable reading that
#          combines their active Dasha period, current transits, and a
#          self-selected area of struggle into concrete psychological guidance.

---

## SYSTEM IDENTITY

You are the Jyotish Gem Developer AI building the Crossroads Oracle™ for
Crossroads Compass. Your goal is to combine active Dasha timing, live
planetary transits, and a user-selected life theme into a warm, practical,
psychologically grounded response via Gemini.

This is the primary FREE tier conversion hook. The quality of this reading
is what makes a free user upgrade. Make it feel personal, specific, and
unmistakably more precise than anything else they have tried.

Balance technical precision with empathetic, growth-oriented language.
Never predict outcomes. Always offer agency.

---

## CONTEXT (read before writing any code)

**Product:** Crossroads Compass — SaaS combining Vedic astrology and Human
Design for life navigation at crossroads.

**Feature position:** FREE tier. No paywall. Available to all authenticated
users who have a saved birth profile. This is the hook — the moment a user
feels seen for the first time.

**What this feature does:**

1. Loads the user's saved birth profile (date, time, place, gender).
2. Retrieves the active Mahadasha and Antardasha from `dashaService.ts`.
3. Renders a dropdown: "What area of life is weighing on you right now?"
   Options: Identity · Career · Love · Fear · Loss.
4. On submission, calls a new AI service that builds a Gemini prompt
   fusing the Dasha context, current transits, and the selected theme.
5. Returns a structured reading with four parts: Cosmic Context, Psychological
   Pattern, Why Now, and Three Concrete Steps.
6. Reading is cached per user per theme per Antardasha period (not date-based).
   When the Antardasha changes, the cache is invalidated automatically.

**Upstream dependencies (all already exist — do not rebuild):**
- `lib/astro/dashaService.ts` — `getCurrentDasha()`, `getOrFetchDashas()`
- `lib/astro/chartService.ts` — `getOrCreateVedicChart()`
- `lib/astro/transitService.ts` — current planetary positions
- `lib/ai/geminiClient.ts` — Gemini singleton (use the existing pattern from
  `transitReadingService.ts` or `lifeReadingService.ts`)
- `lib/kv/helpers.ts` — `kvGet`, `kvSet`
- `lib/kv/keys.ts` — add new key builder here
- `lib/auth/helpers.ts` — `getRequiredSession`
- `types/index.ts` — shared types live here

**Stack:** Next.js App Router, TypeScript strict, Tailwind, SQLite/Prisma,
Upstash Redis, Gemini API (`@google/genai`), dark cosmic-luxury design system.

---

## DATA FLOW

```
User selects theme
       ↓
POST /api/oracle/reading  { theme: OracleTheme }
       ↓
1. getRequiredSession() — auth gate
2. getOrCreateVedicChart(userId) — natal chart (cached)
3. getCurrentDasha(userId) — active Mahadasha
4. getCurrentAntardasha(userId) — active Antardasha  ← new helper needed
5. getTransitSnapshot() — today's planetary positions
6. kvGet(oracleKey) — cache hit? return cached reading
7. buildOraclePrompt(ctx) — assemble Gemini prompt
8. gemini.generateContent(prompt) — call Gemini
9. parseOracleResponse(raw) — extract structured JSON
10. kvSet(oracleKey, reading, TTL until Antardasha end) — cache
11. return OracleReading to client
```

---

## ATOMIC TASKS — complete in order, one at a time

---

### Task CO.1 — TypeScript types
**File:** `types/oracle.ts` (new file)

**Do:**
Define and export all Oracle-specific types:

```typescript
export type OracleTheme =
  | 'IDENTITY'
  | 'CAREER'
  | 'LOVE'
  | 'FEAR'
  | 'LOSS'

export interface OracleContext {
  userId: string
  birthProfile: {
    dateOfBirth: string    // ISO date string
    timeOfBirth: string    // HH:MM local time
    placeOfBirth: string   // city, country
    gender: string
  }
  mahadasha: {
    planet: string         // e.g. "Saturn"
    startDate: string      // ISO
    endDate: string        // ISO
    yearsRemaining: number
  }
  antardasha: {
    label: string          // e.g. "Saturn/Venus"
    planet: string         // Antardasha planet only
    startDate: string
    endDate: string
    monthsRemaining: number
  }
  transits: {
    moonSign: string       // current Moon sign
    sunSign: string        // current Sun sign
    retrogradeplanets: string[]
    notableTransit: string | null  // most significant active transit, 1 sentence
  }
  theme: OracleTheme
}

export interface OracleReading {
  theme: OracleTheme
  cosmicContext: string    // 2–3 sentences: what the Dasha + transit combination means
  psychologicalPattern: string  // 2–3 sentences: why this theme arises now, rooted in the chart
  whyNow: string           // 1–2 sentences: timing signal — why this period specifically
  concreteSteps: [string, string, string]  // exactly 3 actionable steps
  dashaLabel: string       // e.g. "Saturn Mahadasha · Venus Antardasha"
  generatedAt: string      // ISO timestamp
  cacheKey: string         // for client-side invalidation awareness
}
```

**Do NOT:**
- Add types to `types/index.ts` (keep oracle types isolated)
- Add any runtime logic

**Acceptance criteria:**
- File compiles with `rtk tsc` with zero errors
- All fields documented with inline comments

---

### Task CO.2 — Dasha helper extension
**File:** `lib/astro/dashaService.ts` (modify existing)

**Do:**
Add one new exported function below `getCurrentDasha()`:

```typescript
/**
 * Returns the antardasha period currently active for a user.
 * planetName format in DB: "MAHADASHA_PLANET/ANTARDASHA_PLANET"
 */
export async function getCurrentAntardasha(userId: string): Promise<Dasha | null> {
  const now = new Date()
  return db.dasha.findFirst({
    where: {
      userId,
      startDate: { lte: now },
      endDate:   { gte: now },
      level: 'ANTARDASHA',
    },
  })
}
```

Also add a pure helper (no DB):

```typescript
/**
 * Returns fractional months remaining in a Dasha period from today.
 */
export function monthsRemaining(endDate: Date): number {
  const now = new Date()
  const msLeft = endDate.getTime() - now.getTime()
  return Math.max(0, Math.round(msLeft / (1000 * 60 * 60 * 24 * 30.44)))
}
```

**Do NOT:**
- Touch any existing functions
- Add imports beyond what is already in the file

**Acceptance criteria:**
- `rtk tsc` passes
- `getCurrentAntardasha` returns the correct sub-period row

---

### Task CO.3 — KV key builder
**File:** `lib/kv/keys.ts` (modify existing)

**Do:**
Add one new key builder to the `kvKeys` object. Place it alongside existing
keys, do not reorganize the file:

```typescript
oracleReading: (userId: string, theme: string, antardashaLabel: string) =>
  `oracle:${userId}:${theme}:${antardashaLabel}`,
```

Also add one TTL constant (choose a sensible value):

```typescript
ORACLE_TTL_DAYS = 30   // re-generate at most once per 30 days per theme
```

**Acceptance criteria:**
- Key format is deterministic and collision-free
- `rtk tsc` passes

---

### Task CO.4 — Gemini prompt builder
**File:** `lib/ai/prompts/oraclePrompts.ts` (new file)

**Do:**
Export a single function `buildOraclePrompt(ctx: OracleContext): string`.

The prompt must:

1. Open with the user's active Dasha context in plain language:
   - Name the Mahadasha planet and its archetypal energy (e.g., "Saturn — the
     archetype of discipline, delay, and mastery through effort")
   - Name the Antardasha planet and the flavor it adds
   - Mention how many years/months remain in each period

2. State the selected theme explicitly and frame it as a question the cosmos
   is asking the user, not a problem to fix.

3. Include the current transit snapshot: Moon sign, Sun sign, any
   retrogrades, notable transit.

4. Instruct Gemini to return a JSON object with exactly these four fields:
   `cosmicContext`, `psychologicalPattern`, `whyNow`, `concreteSteps`
   (array of exactly 3 strings).

5. Enforce all content rules (see Content Rules section below) inside the
   prompt as explicit negative constraints.

6. Request warm, specific, non-predictive language. Max 3 sentences per
   section except `concreteSteps`.

Theme-specific framing (include in prompt based on `ctx.theme`):

| Theme    | Framing lens                                                  |
|----------|---------------------------------------------------------------|
| IDENTITY | Who am I becoming vs who I was conditioned to be?            |
| CAREER   | What is my work in the world, not just my job?               |
| LOVE     | What patterns in connection am I ready to examine?           |
| FEAR     | What is this fear protecting and what would release it?      |
| LOSS     | What is this loss making room for?                           |

**Dasha planet archetypes to embed in the prompt:**

| Planet  | Archetype                                              |
|---------|--------------------------------------------------------|
| Sun     | Soul, authority, father, vitality, leadership         |
| Moon    | Mind, emotion, mother, belonging, instinct            |
| Mars    | Drive, courage, conflict, initiation, will            |
| Mercury | Communication, intellect, commerce, discernment       |
| Jupiter | Wisdom, expansion, grace, dharma, teacher             |
| Venus   | Beauty, relationships, pleasure, values, refinement   |
| Saturn  | Discipline, karma, delay, mastery, time               |
| Rahu    | Obsession, ambition, foreign, illusion, hunger        |
| Ketu    | Detachment, spirituality, past patterns, dissolution  |

**Do NOT:**
- Call the Gemini API here — this file is prompt construction only
- Import anything from `lib/ai/`
- Add fallback logic

**Acceptance criteria:**
- Exported function is pure (no side effects, no async)
- Prompt compiles cleanly
- `rtk tsc` passes

---

### Task CO.5 — Oracle AI service
**File:** `lib/ai/crossroadsOracleService.ts` (new file)

**Do:**
Implement the primary AI service that orchestrates data retrieval, caching,
and Gemini generation.

Signature:

```typescript
export async function getCrossroadsOracleReading(
  userId: string,
  theme: OracleTheme,
  force?: boolean
): Promise<OracleReading>
```

Internal steps (in order):

1. `getOrCreateVedicChart(userId)` — natal chart
2. `getCurrentDasha(userId)` + `getCurrentAntardasha(userId)` in parallel
3. `getTransitSnapshot()` from `transitService.ts` — extract `moonSign`,
   `sunSign`, retrogrades, and the most significant transit line
4. Build `OracleContext` typed object
5. Build the cache key: `kvKeys.oracleReading(userId, theme, antardashaLabel)`
6. `kvGet(cacheKey)` — if hit and `!force`, return parsed cached reading
7. `buildOraclePrompt(ctx)` — assemble prompt string
8. Call Gemini: use `gemini-2.0-flash` model, temperature `0.85`,
   `responseMimeType: 'application/json'`
9. Parse the JSON response — use `parseModelJsonObject` from
   `lib/ai/parseModelJsonObject.ts` (already exists)
10. Validate that `concreteSteps` is an array of exactly 3 non-empty strings
11. Assemble final `OracleReading` object with `dashaLabel`, `generatedAt`,
    `cacheKey`
12. `kvSet(cacheKey, reading, KV_TTL.ORACLE_TTL_DAYS * 86400)` — cache
13. Return `OracleReading`

Error handling:
- If Dasha data is missing (not yet generated): throw `Error('DASHA_NOT_READY')`
- If Gemini parse fails: retry once with `force=true` approach (call generate
  again, do not return partial)
- If birth profile incomplete: throw `Error('BIRTH_PROFILE_INCOMPLETE')`

**Do NOT:**
- Re-implement `getOrCreateVedicChart` or any existing services
- Add a second Gemini client — import from `geminiClient.ts` or follow the
  singleton pattern from `transitReadingService.ts`
- Create database tables — cache lives in KV only

**Acceptance criteria:**
- First call generates via Gemini and caches
- Second call within the same Antardasha period returns from cache
- `force=true` bypasses cache and regenerates
- `rtk tsc` passes

---

### Task CO.6 — API route
**File:** `app/api/oracle/reading/route.ts` (new file)

**Do:**
Implement a POST handler.

Request body:
```typescript
{ theme: OracleTheme, force?: boolean }
```

Response (200):
```typescript
{ reading: OracleReading }
```

Error responses:
- 401 if unauthenticated
- 400 if theme is missing or invalid (validate against `OracleTheme` union)
- 412 if `DASHA_NOT_READY` (birth profile exists but chart not yet generated)
- 422 if `BIRTH_PROFILE_INCOMPLETE`
- 500 for unexpected errors (log to console, return generic message)

Implementation:
1. `getRequiredSession()` — auth guard
2. Validate `theme` from body against `OracleTheme` values
3. Call `getCrossroadsOracleReading(userId, theme, force)`
4. Return `NextResponse.json({ reading })`

No rate limiting needed on this route — Antardasha-scoped caching is the
natural throttle. One Gemini call per user per theme per Antardasha period.

**Do NOT:**
- Add tier checks — this is a FREE feature, all authenticated users access it
- Add request logging middleware
- Use `req.json()` more than once

**Acceptance criteria:**
- `curl -X POST /api/oracle/reading -d '{"theme":"CAREER"}' -H "cookie: ..."` returns a valid `OracleReading`
- Returns 401 when no session cookie present
- Returns 400 when theme is omitted

---

### Task CO.7 — UI: Oracle page
**File:** `app/(app)/oracle/page.tsx` (new file)

**Do:**
Build the full-page Oracle experience as a Server Component shell with a
Client Component for the interactive form + reading display.

Page structure:

```
<OracleShell>        ← Server Component, loads birth profile check
  <OracleForm />     ← Client Component (interactive)
</OracleShell>
```

`OracleShell` responsibilities:
- Check that user has a birth profile saved. If not, show
  `<BirthProfileGate />` — a centered card: "To receive your Crossroads
  Reading, we need your birth details." with a link to the profile setup page.
- If birth profile exists, render `<OracleForm />` with user's `displayName`
  and `birthPlace` as props (for the UI heading).

`OracleForm` responsibilities:
- Heading: "What area of life is weighing on you?" in Cormorant Garamond,
  display size, centered, star color (`#f0dca0`).
- Sub-heading: "Select a theme and receive a reading grounded in your current
  cosmic timing." in Instrument Sans, muted.
- Theme selector: five cards in a responsive grid (1 col mobile, 5 col desktop).
  Each card has an icon, a label, and a one-sentence teaser:

  | Theme    | Icon  | Teaser                                                 |
  |----------|-------|--------------------------------------------------------|
  | IDENTITY | ◎     | "Who you are becoming in this chapter of life."       |
  | CAREER   | ◈     | "Your work, purpose, and right livelihood now."       |
  | LOVE     | ♡     | "Patterns in connection you are ready to examine."    |
  | FEAR     | ◌     | "What your fear is protecting and what releases it."  |
  | LOSS     | ✦     | "What this loss is making room for."                  |

- Selected card glows with amber border (`#c8873a`) and gold background tint.
- "Receive Your Reading" button: full-width, amber background, gold text,
  disabled until a theme is selected, shows spinner during load.
- Reading display (shown after successful response):
  - Dasha label pill at top: e.g. "Saturn Mahadasha · Venus Antardasha"
    — small, DM Mono font, amber color.
  - Four sections rendered as glassmorphism cards stacked vertically:
    1. **Cosmic Context** — star icon + section title + body text
    2. **Psychological Pattern** — moon icon + section title + body text
    3. **Why Now** — sun icon + section title + body text
    4. **Three Steps Forward** — numbered list, each step on its own row
       with a small amber step number and the step text
  - "Regenerate reading" link (small, muted) below the reading.
    Calls API with `force=true`. Only show if reading is already displayed.
  - Fade-in animation on reading reveal (Tailwind `animate-fade-in` or
    CSS transition, whichever is already in the design system).

**Design tokens to use:**
- Background: `bg-cosmos` (`#0d1220`)
- Glass cards: `bg-white/5 backdrop-blur border border-white/10 rounded-2xl`
- Section headings: Cormorant Garamond, `text-star`
- Body text: Instrument Sans, `text-white/80`
- Dasha pill: DM Mono, `text-amber-400 bg-amber-400/10 rounded-full px-3 py-1`

**Do NOT:**
- Build a new chart rendering component — this page shows NO chart
- Add a sidebar or navigation chrome — the shell provides that
- Use `useEffect` for data fetching — use `fetch` inside a button handler
- Show any locked/blurred content (this is FREE, everything is visible)

**Acceptance criteria:**
- Page renders with no hydration errors
- Selecting a theme and clicking the button shows a reading
- Reading sections render with correct copy from the API
- Regenerate link triggers a fresh API call with `force=true`
- Mobile layout stacks theme cards vertically
- `rtk tsc` passes

---

### Task CO.8 — Navigation integration
**File:** `app/(app)/layout.tsx` or wherever the nav links live (check first)

**Do:**
Add "Oracle" to the navigation with a compass icon. Position it as the second
item after "Dashboard" (or the first featured item — wherever it makes most
impact for a free user).

Label: `Oracle`
Icon: use the existing icon system in the project (check `components/ui/`)
Route: `/oracle`

**Do NOT:**
- Restructure the navigation
- Change any existing nav items

**Acceptance criteria:**
- `/oracle` is reachable from the main nav
- Active state highlights correctly when on the Oracle page

---

## CONTENT RULES (Non-Negotiable — enforced in prompt AND in UI copy)

These apply to all text generated by Gemini AND to all static UI copy:

- **No prediction language:** "you will...", "this will cause...", "expect..." → use "this period tends to bring...", "you may notice...", "many people find that during..."
- **No mystical/woo framing:** "the universe is telling you...", "your destiny..." → use "your chart suggests...", "this combination often correlates with..."
- **Define every term on first use** in AI-generated content: "Saturn (the archetype of discipline and mastery through effort)..."
- **Every insight ends with agency:** the last sentence of every section must give the user something they can *do* or *consider*
- **Concrete steps must be concrete:** not "reflect on your values" → "Spend 10 minutes writing down three things you would pursue if job title did not exist"
- **Warm but not saccharine:** avoid "beautiful", "amazing", "incredible", "powerful journey"

---

## SCOPE BOUNDARIES — what this task does NOT include

- No HD (Human Design) integration in this feature — Dasha + transits only
- No Navamsha or divisional chart analysis — Rashi chart context only
- No email notifications when readings are ready
- No sharing or export of readings
- No admin panel view of oracle readings
- No analytics events (Phase 4 GLIMPSE analytics not yet built)
- No Glimpse blur — this is fully free, no paywall component needed
- No changes to existing feature pages

---

## UPGRADE HOOK — copy to add (implementation in CO.7)

At the bottom of the reading, after the Three Steps, add a single line in
muted text:

> "For your complete Life Blueprint™ — combining your natal chart, HD
> Bodygraph, and all 12 life areas — see your full report."

Link this to `/blueprint`. Do not use a CTA button — keep it subtle.
This is a soft upsell, not a conversion wall.

---

## FILE SUMMARY

| Task | File                                         | Action |
|------|----------------------------------------------|--------|
| CO.1 | `types/oracle.ts`                            | Create |
| CO.2 | `lib/astro/dashaService.ts`                  | Modify |
| CO.3 | `lib/kv/keys.ts`                             | Modify |
| CO.4 | `lib/ai/prompts/oraclePrompts.ts`            | Create |
| CO.5 | `lib/ai/crossroadsOracleService.ts`          | Create |
| CO.6 | `app/api/oracle/reading/route.ts`            | Create |
| CO.7 | `app/(app)/oracle/page.tsx`                  | Create |
| CO.8 | Nav layout file (confirm path first)         | Modify |

Total new files: 5 · Modified files: 3

---

## VERIFICATION CHECKLIST (run after all tasks complete)

```bash
rtk tsc                          # zero type errors
rtk npm run dev                  # app starts, no console errors
rtk curl -X POST /api/oracle/reading \
  -H "Content-Type: application/json" \
  -d '{"theme":"CAREER"}'        # returns 401 (unauthenticated — expected)
```

Manual smoke test (authenticated session):
- [ ] Visit `/oracle` — page renders
- [ ] No birth profile → gate card shown, no form
- [ ] With birth profile → theme selector renders with all 5 cards
- [ ] Select CAREER → button enables
- [ ] Submit → spinner shows, then reading renders in ~5–10 seconds
- [ ] Reading has all 4 sections: Cosmic Context, Psychological Pattern, Why Now, Three Steps
- [ ] Dasha label pill is visible and accurate
- [ ] "Regenerate reading" link appears after first reading
- [ ] Click Regenerate → new reading loads (different text)
- [ ] Second load of same theme (same Antardasha) → returns immediately from cache
- [ ] Mobile: theme cards stack to single column
- [ ] Navigate away and back → reading is gone (state not persisted — by design)

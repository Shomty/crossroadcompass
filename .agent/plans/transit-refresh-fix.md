# Plan: Fix Today's Transits Refresh on Navigation

**Problem**: `TransitTable` shows a loading skeleton and re-fetches the API every time the user navigates to the v4 page.

---

## Phase 0: Root Cause — CONFIRMED

### Diagnosis

**Root cause chain** (evidence below):

| Step | What happens | File:Line |
|------|-------------|-----------|
| 1 | User navigates to v4 page | Next.js router |
| 2 | `V4Page` server component re-renders | `app/(app)/v4/page.tsx:53` |
| 3 | `<TransitTable />` mounts fresh (client component, no props) | `v4/page.tsx:226` |
| 4 | `useEffect(() => { fetchReading() }, [])` fires on every mount | `TransitTable.tsx:48` |
| 5 | `fetch("/api/transit/reading")` called — no HTTP cache option | `TransitTable.tsx:54` |
| 6 | No `Cache-Control` header on response → browser fetches network | `api/transit/reading/route.ts:38,108` |
| 7 | KV cache on server responds fast, but client still shows skeleton | entire round-trip |

**KV caching exists** but only on the server. The client re-fetches on every mount because:
1. No `initialReading` prop passed from the server component
2. No `Cache-Control` HTTP header sent on the response
3. `useEffect(fn, [])` fires on every component mount

### Key Difference vs. ProfileStrip

`ProfileStrip` does NOT have this issue because `v4/page.tsx` passes HD data as an `initial` prop:
```tsx
// v4/page.tsx:179-186 — ProfileStrip receives server-fetched data
<ProfileStrip name={userName} initial={{ type: hdType, ... }} />

// ProfileStrip.tsx:47-56 — skips fetch if initial provided
useEffect(() => {
  if (initial) { setProfile(initial); return; }
  // ...client fetch only if initial is null
}, []);
```

`TransitTable` was never given this treatment — it always fetches from the client.

### Allowed APIs (confirmed from source)

- `getCachedTransitReading(userId: string): Promise<TransitReading | null>`
  Source: `lib/ai/transitReadingService.ts:167-174`
  Already imported in `api/transit/reading/route.ts:20`

- `TransitReading` type: exported from `lib/ai/transitReadingService.ts`
  Already imported in `TransitTable.tsx:12`

- `NextResponse.json(body, { headers: { ... } })` — standard Next.js API pattern

### Anti-Patterns to Avoid

- Do NOT call `generateTransitReading()` in the server component — it triggers AI generation and is too slow for SSR
- Do NOT add `export const dynamic = "force-static"` to the API route — it requires auth
- Do NOT remove the client-side fallback fetch — still needed when KV cache is cold (first visit of day)

---

## Phase 1: Add `initialReading` Prop to `TransitTable`

**What to change**: `components/v4/TransitTable.tsx`

**Pattern to copy from**: `components/v4/ProfileStrip.tsx` lines 47-56 (initial prop guard)

**Changes:**
1. Add `initialReading?: TransitReading | null` to the component props interface
2. Initialize `useState` with `initialReading ?? null` instead of `null`
3. Initialize `loading` with `initialReading ? false : true` (no skeleton if data already present)
4. In `useEffect`, skip fetch if `initialReading` was provided:
   ```tsx
   useEffect(() => {
     if (initialReading) return;  // already have data from server
     fetchReading();
   }, []);
   ```

**Result**: When the server passes cached data, the component renders immediately without a skeleton or network request. When no cached data is available (cold cache), behavior is identical to today.

**Verification:**
- [ ] `TransitTable` accepts `initialReading` prop without TypeScript errors
- [ ] When `initialReading` is provided, no skeleton renders
- [ ] When `initialReading` is null/undefined, skeleton + fetch still work (existing behavior preserved)
- [ ] `rtk tsc` → 0 new errors

---

## Phase 2: Fetch Transit Reading Server-Side in `v4/page.tsx`

**What to change**: `app/(app)/v4/page.tsx`

**What to add**:
1. Import `getCachedTransitReading` from `@/lib/ai/transitReadingService`
2. Call it server-side (KV lookup only — fast, no AI generation):
   ```tsx
   // After existing dasha queries (around line 109-116)
   const initialTransitReading = await getCachedTransitReading(userId).catch(() => null);
   ```
3. Pass result to `<TransitTable>`:
   ```tsx
   <TransitTable initialReading={initialTransitReading} />
   ```

**Behavior matrix:**
| KV cache state | Result |
|----------------|--------|
| Cache hit (typical) | `initialReading` is populated → no client fetch, no skeleton |
| Cache miss (first visit of day) | `initialReading` is null → client fetches as before |
| KV error | `.catch(() => null)` → degrades gracefully, client fetches as before |

**Verification:**
- [ ] `getCachedTransitReading` called in `v4/page.tsx` server component
- [ ] Result passed to `<TransitTable initialReading={...} />`
- [ ] Page renders without TypeScript errors (`rtk tsc`)
- [ ] Navigating away and back → no skeleton flash (cache hit scenario)

---

## Phase 3: Add `Cache-Control` Headers to API Response

**What to change**: `app/api/transit/reading/route.ts`

**What to add**: Return `Cache-Control: private, max-age=3600, stale-while-revalidate=86400` on successful responses.

This acts as a defense-in-depth — even if `initialReading` is null (cold cache), the browser caches the first fetch response. Subsequent navigations within 1 hour serve from browser cache instantly.

```tsx
// On cache hit (line 38) — already fast, add HTTP cache hint:
return NextResponse.json(
  { reading: cached, source: "cache" },
  { headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400" } }
);

// On generated (line 108) — new generation, cache for 1 hour:
return NextResponse.json(
  { reading, source: "generated" },
  { headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400" } }
);
```

Use `private` because this is user-specific data. Do NOT add cache headers to error responses.

**Verification:**
- [ ] Network tab shows `Cache-Control: private, max-age=3600` on API response
- [ ] Second navigation (within 1 hour) shows `(disk cache)` or `(memory cache)` in network tab
- [ ] Error responses (`401`, `404`, `502`, `503`) do NOT have cache headers

---

## Phase 4: Final Verification

**In-browser checks:**
1. Navigate to `/v4` — transit table should render with data immediately (no skeleton flash)
2. Navigate away to `/report` or `/dashboard`
3. Navigate back to `/v4` — transit table renders with data immediately, no skeleton
4. Open Network tab → `/api/transit/reading` should NOT appear on second navigation (served from server prop)
5. Dev server has no errors (`rtk tsc`, check console)

**Code checks:**
- [ ] `grep "initialReading"` in `TransitTable.tsx` returns the prop guard
- [ ] `grep "getCachedTransitReading"` in `v4/page.tsx` returns the server-side call
- [ ] `grep "Cache-Control"` in `api/transit/reading/route.ts` returns 2 occurrences (cache hit + generated)
- [ ] `grep "useEffect"` in `TransitTable.tsx` shows the `if (initialReading) return` guard

---

## Implementation Notes for Executing Agent

- **Implement in order**: Phase 1 → Phase 2 → Phase 3 (each phase depends on the previous)
- **Read before editing**: Read the full file before any Edit call
- **Copy the ProfileStrip pattern**: `components/v4/ProfileStrip.tsx:47-56` is the exact template to follow for Phase 1
- **Do NOT call `generateTransitReading` in the server component** — only `getCachedTransitReading`
- **Run `rtk tsc` after Phase 1 and Phase 2** to catch type errors early
- **The fix is additive**: nothing is removed; the client-side fetch fallback is preserved

# Task: FE-11 — Birth Profile Management + Chart Refresh
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: POST/PATCH /api/birth-profile (OA.9), invalidateChartCache in chartService.ts
# Updated: 2026-03-28

---

## What this builds

An editable birth profile form with location autocomplete, unknown-birth-time UX,
geocoding confirmation, cache invalidation flow, and a clear data-sensitivity warning.

---

## Existing backend routes (OA.9)

- `POST /api/birth-profile` — `app/api/birth-profile/route.ts` — creates `BirthProfile`
- `PATCH /api/birth-profile` — same file — updates birth data and calls `invalidateChartCache`

Confirm both exist and that `invalidateChartCache` covers all KV keys per OA.6.

---

## New files

### `components/profile/BirthProfileForm.tsx`

Props:
```typescript
interface BirthProfileFormProps {
  existing?: BirthProfile | null
  onSuccess: () => void
}
```

Fields:
1. **Date of Birth** — `<input type="date">` with a label: "Your birth date (required for all calculations)"
2. **Time of Birth** — `<input type="time">` with:
   - A checkbox: "I don't know my exact birth time"
   - When checked: disable the time input, set value to `null` in form state.
   - Show inline note: "Without a birth time, your Ascendant, house positions, and some special points will be approximate. We use 12:00 noon as a fallback."
3. **Birth Location** — text input with autocomplete (see below). Label: "City and country where you were born"
4. **Confirmed geo info** (read-only, shown after geocoding):
   - Latitude: `[value]°N/S`
   - Longitude: `[value]°E/W`
   - Timezone: `[IANA string]`
   These are shown in a `bg-gray-50 rounded` info box below the location field.

Submit button label:
- Create flow: "Generate My Chart →"
- Edit flow: "Update Birth Data"

### `lib/geocoding/geocodeLocation.ts`

```typescript
// Use the existing geocoding implementation if present, or implement using
// a free service: https://nominatim.openstreetmap.org/search
// Returns: { latitude, longitude, timezone, displayName }

export async function geocodeLocation(query: string): Promise<{
  latitude:    number
  longitude:   number
  timezone:    string   // IANA, derived from lat/lon via another API or a lookup table
  displayName: string
} | null>
```

For timezone from lat/lon, use the `Intl.DateTimeFormat` approach or a lightweight
`tzlookup` npm package. If neither is available, call the GeoNames timezone API:
`http://api.geonames.org/timezoneJSON?lat=...&lng=...&username=...`

The timezone must be a valid IANA string (e.g., `'America/New_York'`), not an offset.

Location autocomplete:
- Debounce the input (300ms).
- Call Nominatim on each debounced change: `https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=5`
- Render a dropdown of suggestions. On selection, geocode and populate lat/lon/timezone.

### `components/profile/BirthTimeUnknownWarning.tsx`

Shown inline when "I don't know my birth time" is checked AND an existing profile
is being edited (i.e., chart data has already been generated):

```tsx
<div className="bg-amber-50 border border-amber-300 rounded p-4 space-y-1">
  <p className="font-medium text-amber-800">Features affected by unknown birth time:</p>
  <ul className="text-sm text-amber-700 list-disc list-inside">
    <li>Ascendant (Lagna) sign and degree</li>
    <li>House positions for all planets</li>
    <li>Ghati, Bhava, and Hora Lagnas (Special Points)</li>
    <li>House strength scores (Ashtakavarga per house)</li>
  </ul>
  <p className="text-sm text-amber-700">Yogas, Dasha periods, nakshatra positions, and planet signs are not affected.</p>
</div>
```

### `components/profile/DataChangeConfirmModal.tsx`

Shown when an EXISTING profile is being updated (not on first creation).

```tsx
<Modal>
  <h2>Update Birth Data</h2>
  <p>Changing your birth data will recalculate your entire chart.
     All existing insights and cached chart data will be regenerated.
     This cannot be undone.</p>
  <p>Past insights you have already read will remain in your history.</p>
  <button onClick={onConfirm}>Yes, update my birth data</button>
  <button onClick={onCancel}>Cancel</button>
</Modal>
```

---

## Form submission flow

```typescript
async function handleSubmit(values: FormValues) {
  // 1. Show loading state
  setLoading(true)

  // 2. POST or PATCH
  const method  = existing ? 'PATCH' : 'POST'
  const res     = await fetch('/api/birth-profile', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      birthDate: values.date,
      birthTime: values.unknownTime ? null : values.time,
      latitude:  values.latitude,
      longitude: values.longitude,
      timezone:  values.timezone,
      city:      values.city,
      country:   values.country,
    }),
  })

  if (!res.ok) {
    setError(await res.json())
    return
  }

  // 3. Show success toast
  toast.success(existing
    ? 'Profile updated — your chart is being recalculated.'
    : 'Birth profile saved — generating your chart.'
  )

  // 4. Trigger background chart pre-computation (fire-and-forget)
  // The chart will be computed lazily on next page visit,
  // but we can pre-warm it by calling GET /api/chart in the background:
  fetch('/api/chart').catch(() => {})

  // 5. Redirect
  router.push('/chart')
}
```

---

## Pages

**`app/profile/page.tsx`** — Settings page embedding `<BirthProfileForm existing={profile} />`.

**`app/onboarding/page.tsx`** — First-time onboarding page (no existing profile).
Show a welcoming header: "Let's generate your personal Jyotish chart."
Embed `<BirthProfileForm existing={null} />`.
After successful creation, redirect to `/chart`.

---

## Admin variables to persist

These come from the `BirthProfile` record itself (not `UserAstroSnapshot`).
Confirm these fields exist on the Prisma `BirthProfile` model:
```prisma
model BirthProfile {
  userId      String   @id
  birthDate   DateTime
  birthTime   String?  // 'HH:MM:SS' — null if unknown
  latitude    Float
  longitude   Float
  timezone    String
  city        String?
  country     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
}
```

Also write to `UserAstroSnapshot` on any profile update:
```typescript
{
  birthDate:        profile.birthDate.toISOString().slice(0, 10),
  birthTime:        profile.birthTime ?? null,
  birthTimeKnown:   profile.birthTime !== null,
  birthCity:        profile.city ?? null,
  birthCountry:     profile.country ?? null,
  birthLatitude:    profile.latitude,
  birthLongitude:   profile.longitude,
  birthTimezone:    profile.timezone,
  profileUpdatedAt: profile.updatedAt,
  cacheInvalidatedAt: existing ? new Date().toISOString() : null,
}
```

---

## Done when

- [ ] `POST /api/birth-profile` and `PATCH /api/birth-profile` exist and work.
- [ ] Form renders date, time, and location fields with correct labels.
- [ ] "Unknown birth time" checkbox disables time input and shows affected-features list.
- [ ] Location autocomplete calls Nominatim and populates lat/lon/timezone.
- [ ] Confirmed geo info (lat, lon, timezone) shown read-only after selection.
- [ ] `DataChangeConfirmModal` appears on edit before submitting PATCH.
- [ ] On successful POST/PATCH: toast fires, chart pre-warms in background, redirect to `/chart`.
- [ ] `BirthProfile` Prisma model has all required fields.
- [ ] `UserAstroSnapshot` updated with 9 profile fields on each save.
- [ ] TypeScript compiles. No `any` casts.

# Task: FE-06 — Special Points Panel
# STATUS: pending
# Target: Claude Code CLI / Cursor
# Project root: /Users/miloshmarkovic/Documents/crossroadcompass
# Depends on: FE-01 (GET /api/chart), GET /api/chart/special-points (OA.9)
# Updated: 2026-03-28

---

## What this builds

A panel displaying Arudha Lagna, Ghati/Bhava/Hora Lagnas (behind an Advanced toggle),
and Charakarakas — each with a plain-language meaning. Renders under a "Special Points"
tab on the chart page.

---

## Existing backend route

**`GET /api/chart/special-points`** — already implemented per OA.9.
Calls `getOrCreateSpecialPoints(session.user.id)`.

Confirm the response shape includes at minimum:
```typescript
{
  arudhaLagna:   { sign: ZodiacSign; house: HouseNumber }
  ghatiLagna:    { sign: ZodiacSign; house: HouseNumber }  // time-sensitive
  bhavaLagna:    { sign: ZodiacSign; house: HouseNumber }  // time-sensitive
  horaLagna:     { sign: ZodiacSign; house: HouseNumber }  // time-sensitive
  charakarakas: {
    atmakaraka:     Planet   // highest degree
    amatyakaraka:   Planet
    bhratrukaraka:  Planet
    matrukaraka:    Planet
    putrakaraka:    Planet
    gnatikaraka:    Planet
    darakaraka:     Planet
  }
  calculatedAt:  string   // ISO timestamp
}
```

If the response shape differs, update this task to match the actual type from `lib/astro/specialPoints.ts`.

---

## New files

### `lib/astro/specialPointsLabels.ts`

```typescript
export const ARUDHA_LABEL = {
  title: 'Your Public Image',
  description: 'How others perceive you in the world — your reputation, career face, and social projection.',
}

export const CHARAKA_LABELS: Record<string, { title: string; description: string }> = {
  atmakaraka:    { title: 'Soul Planet',    description: 'The planet that most closely represents your soul\'s primary drive and life lesson.' },
  amatyakaraka:  { title: 'Career Planet',  description: 'Indicates the type of work and support you are naturally drawn toward.' },
  bhratrukaraka: { title: 'Sibling Planet', description: 'Reflects your relationship with siblings and close allies.' },
  matrukaraka:   { title: 'Mother Planet',  description: 'Reflects your relationship with your mother and nurturing influences.' },
  putrakaraka:   { title: 'Child Planet',   description: 'Related to creativity, children, and what you give life to.' },
  gnatikaraka:   { title: 'Conflict Planet',description: 'Represents recurring challenges and what demands the most effort.' },
  darakaraka:    { title: 'Partner Planet', description: 'Reflects the nature of your partnerships and what you seek in them.' },
}

export const TIMED_LAGNA_LABELS: Record<string, { title: string; description: string }> = {
  ghatiLagna: { title: 'Power Lagna',     description: 'The point of authority and ambition — how you seek power and recognition.' },
  bhavaLagna: { title: 'Vitality Lagna',  description: 'Related to your physical vitality and sustained life energy.' },
  horaLagna:  { title: 'Wealth Lagna',    description: 'The point governing your relationship with money and resources.' },
}
```

### `components/chart/SpecialPointsPanel.tsx`

Props:
```typescript
interface SpecialPointsProps {
  data: SpecialPointsResult     // from GET /api/chart/special-points
  birthTimeKnown: boolean
}
```

Layout — three sections, always visible:

**Section 1: Public Image (Arudha Lagna)**
Card showing:
- Title: "Your Public Image"
- Sign (capitalized) + House number
- Description from `ARUDHA_LABEL`
- Plain summary: "In [sign] in House [N] — [one-line implication based on sign element/quality]"

**Section 2: Soul & Life Indicators (Charakarakas)**
Grid of 7 cards, each showing:
- Title from `CHARAKA_LABELS[key].title`
- Planet name (capitalized)
- Description from `CHARAKA_LABELS[key].description`
- Atmakaraka card gets elevated styling: `ring-2 ring-indigo-400 shadow-md`
  + extra text: "This is your Soul Planet — the most important single planet in your chart."

**Section 3: Advanced Points (time-sensitive)**
Hidden by default. Toggle: "Show Advanced Points (requires accurate birth time)".
If `birthTimeKnown === false`, replace toggle with:
```tsx
<div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-700">
  Ghati, Bhava, and Hora Lagnas require an accurate birth time.
  Your chart uses solar noon — these values are approximate.
</div>
```

When expanded, render 3 cards for `ghatiLagna`, `bhavaLagna`, `horaLagna`:
- Title from `TIMED_LAGNA_LABELS[key].title`
- Sign + House
- Description from `TIMED_LAGNA_LABELS[key].description`

---

## Admin variables to persist

Extend `UserAstroSnapshot` PATCH with:
```typescript
{
  arudhaLagnaSign:       data.arudhaLagna.sign,
  arudhaLagnaHouse:      data.arudhaLagna.house,
  ghatiLagnaSign:        data.ghatiLagna.sign,
  bhavaLagnaSign:        data.bhavaLagna.sign,
  horaLagnaSign:         data.horaLagna.sign,
  atmakarak aPlanet:     data.charakarakas.atmakaraka,
  amatyakarakaPlanet:    data.charakarakas.amatyakaraka,
  specialPointsCalcAt:   data.calculatedAt,
}
```

Add these 8 fields to `UserAstroSnapshot`. Sign fields are `String?`, house fields `Int?`, planet fields `String?`, calcAt is `DateTime?`.

---

## Done when

- [ ] `GET /api/chart/special-points` returns without error; shape confirmed.
- [ ] `specialPointsLabels.ts` created with all entries.
- [ ] Arudha Lagna card renders with plain-language title and description.
- [ ] All 7 Charaka cards render; Atmakaraka has elevated ring styling.
- [ ] Advanced section hidden by default; toggle reveals it.
- [ ] `birthTimeKnown === false` shows amber warning instead of toggle.
- [ ] No Sanskrit terms visible to the user without an English label alongside.
- [ ] 8 admin variables written to `UserAstroSnapshot`.
- [ ] TypeScript compiles. No `any` casts.

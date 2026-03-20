# Admin Prompt Editor Guide

## Overview

All AI-generated content in Crossroads Compass is driven by prompt templates stored in the database. This guide explains how to seed, edit, version, and verify prompts through the admin panel.

---

## 1. Quick Start — Stop the Fallback Warnings

After a fresh install or DB reset, no `PromptTemplate` rows exist. Every Gemini call will print:

```
[promptBuilder] No DB prompt for key "life.career", using hardcoded fallback
```

This is safe — the app still works — but admin edits have no effect until prompts are seeded.

**To seed all 13 default templates:**

1. Navigate to `http://localhost:3000/admin/prompts`
2. Click the **"Seed Prompts"** button (top-right of the page)
3. Expect: **"13 prompts seeded"** toast and 13 rows appear, grouped by feature
4. The console warnings disappear on the next AI call

Seeding is **idempotent** — running it again will not overwrite customizations you've made.

---

## 2. Prompt Inventory

All 13 prompt keys, their feature group, and what they control:

| Key | Feature | Controls |
|-----|---------|---------|
| `daily.generator` | Daily Insight | Daily card for Generator HD type |
| `daily.manifesting_generator` | Daily Insight | Daily card for Manifesting Generator HD type |
| `daily.projector` | Daily Insight | Daily card for Projector HD type |
| `daily.manifestor` | Daily Insight | Daily card for Manifestor HD type |
| `daily.reflector` | Daily Insight | Daily card for Reflector HD type |
| `weekly.base` | Weekly Forecast | Weekly forecast narrative for all types |
| `monthly.base` | Monthly Report | Monthly report narrative for all types |
| `hd_report.base` | Onboarding Report | Initial Human Design report generated at onboarding |
| `life.career` | Life Reading | Career & Vocation card |
| `life.love` | Life Reading | Love & Relationships card |
| `life.health` | Life Reading | Health & Vitality card |
| `life.jyotish` | Life Reading | Jyotish deep reading card |
| `transit.base` | Transit Reading | Daily planetary transit card |

---

## 3. Variable Tokens

Prompts use `{{variableName}}` syntax. These are interpolated at call time in `lib/content/promptBuilder.ts` before the request is sent to Gemini.

### `life.*` keys (`life.career`, `life.love`, `life.health`, `life.jyotish`)

| Token | Description |
|-------|-------------|
| `{{name}}` | User's first name |
| `{{hdType}}` | Human Design type (e.g. "Generator") |
| `{{hdAuthority}}` | HD authority (e.g. "Sacral") |
| `{{hdProfile}}` | HD profile (e.g. "6/2") |
| `{{hdCenters}}` | Defined/undefined centers summary |
| `{{d1Planets}}` | D1 (Rashi) chart planetary positions |
| `{{d9Summary}}` | D9 (Navamsha) chart summary |
| `{{d10Summary}}` | D10 (Dasamsha) career chart summary |
| `{{dasha}}` | Current Vimshottari Dasha period |

### `transit.base`

| Token | Description |
|-------|-------------|
| `{{userName}}` | User's first name |
| `{{today}}` | Today's date (ISO format) |
| `{{ascendant}}` | User's rising sign |
| `{{moonSign}}` | User's natal moon sign |
| `{{dashaLord}}` | Current Dasha lord planet |
| `{{natalPlanets}}` | Natal planetary positions |
| `{{transitPlanets}}` | Today's transiting planetary positions |

### `daily.*` keys

| Token | Description |
|-------|-------------|
| `{{userName}}` | User's first name |
| `{{todayDate}}` | Today's date (ISO format) |
| `{{hdType}}` | Human Design type |
| `{{strategy}}` | HD strategy (e.g. "Respond") |
| `{{authority}}` | HD authority |
| `{{profile}}` | HD profile |
| `{{currentDasha}}` | Current Dasha period summary |

---

## 4. Editing a Prompt

1. Navigate to `http://localhost:3000/admin/prompts`
2. Click any prompt key in the list → opens the prompt editor page
3. Edit the **System Prompt** (AI persona/rules) and/or the **User Prompt Template** (the actual request with `{{variables}}`)
4. Click **Save** → the version number increments and the previous version is archived automatically
5. To preview without saving: use the **Live Test** panel — it fills sample variable values and calls Gemini in real-time, showing the raw response

---

## 5. Rollback

If a prompt change produces bad output:

1. Open the prompt editor page for that key
2. Click the **History** tab → lists all past versions with timestamps and the author's email
3. Click **Restore** on any past version → creates a new version with that content (does not overwrite history)

---

## 6. Verifying a Change Took Effect

After saving a prompt, the change applies on the **next** Gemini call for that key. Cached content will not update automatically.

**Life readings** (`life.career`, `life.love`, `life.health`, `life.jyotish`):
- Visit `/life-blueprint` as a VIP user
- Click **↺ Regenerate** on any card
- The card fetches fresh from Gemini using the new prompt

**Transit reading** (`transit.base`):
- Invalidate the Redis cache via admin: `POST /api/admin/users/{userId}/invalidate-cache`
- Refresh the dashboard — the transit card will regenerate

**Daily insights** (`daily.*`):
- Trigger the cron job manually: `POST /api/admin/cron/daily-insights/trigger`
- The next daily insight generated for any user will use the new prompt

**Verification in server logs:**
- `[promptBuilder] Using DB prompt for key "life.career"` → DB prompt was used ✓
- `[promptBuilder] No DB prompt for key "life.career", using hardcoded fallback` → DB prompt not found ✗

---

## 7. System Prompt vs User Prompt Template

**System Prompt** sets the AI persona and rules. It is sent as the `system` role in the Gemini request.

- `life.jyotish` — requires a detailed Jyotish scholar persona; this is pre-filled by the seed
- `life.career`, `life.love`, `life.health`, `transit.base`, `daily.*` — leave the system prompt empty or minimal; a generic persona is applied automatically

**User Prompt Template** is the actual request sent to Gemini. It contains the `{{variable}}` placeholders that are interpolated at call time. This is where you tune tone, depth, structure, and emphasis.

---

## 8. JSON Shape Warning — Do Not Rename Keys

Every prompt ends with an instruction telling Gemini to respond in a specific JSON shape. The parsers in the service layer expect **exactly** these key names:

| Service | File | Expected Keys |
|---------|------|---------------|
| Life readings | `lib/ai/lifeReadingService.ts` | `headline`, `overview`, `keyThemes`, `guidance` |
| Transit reading | `lib/ai/transitReadingService.ts` | `headline`, `overview`, `keyThemes`, `guidance` |
| Daily insights | `lib/ai/dailyInsightService.ts` | `headline`, `overview`, `keyThemes`, `guidance` |

**If you rename any of these keys in the prompt, the parser will fail silently and the card will not render.**

You may freely change:
- The instructions before the JSON block
- The tone, length, and emphasis directives
- The persona/role in the system prompt
- The variable tokens used (as long as those variables exist — see Section 3)

You must not change:
- The key names in the JSON response schema at the bottom of the prompt
- The `{{variable}}` token names (they map to code-side interpolation in `promptBuilder.ts`)

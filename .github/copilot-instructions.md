# Crossroads Compass — Agent Coding Instructions
# Model: claude-sonnet-4-6 | Version: 1.1 | March 2026
# CHANGES IN v1.1: Added sections 16-19 covering external integrations,
# data persistence strategy, caching layer, and chart service architecture.

... (all prior sections 1-15 remain unchanged) ...

---

## 16. EXTERNAL INTEGRATIONS — SOURCES OF TRUTH

Two external sources power all chart data. Understand the distinction
before touching any calculation or API code.

### 16.1 Vedic Astrology — External API

- **Base URL:** `http://144.76.78.183:9000/api/v1/`
- **Auth:** `X-Api-Key: <value>` request header
- **Key stored as:** `VEDIC_API_KEY` environment variable
- **Never hardcode the key.** Never log it. Never expose it client-side.

This is a paid, rate-limited external service. Every unnecessary call
costs money and risks hitting rate limits. The caching rules in
section 18 are non-negotiable.

All calls to this API must go through `/lib/astro/vedicApiClient.ts`.
No other file may call this API directly.
```typescript
// /lib/astro/vedicApiClient.ts — shape every request here
const VEDIC_API_BASE = process.env.VEDIC_API_URL!;
const VEDIC_API_KEY  = process.env.VEDIC_API_KEY!;

async function vedicFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${VEDIC_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': VEDIC_API_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // log server-side only, never surface key or raw body to client
    throw new VedicApiError(res.status, await res.text());
  }
  return res.json() as Promise<T>;
}
```

The exact endpoint paths and request/response shapes for this API are
not yet confirmed. Before calling any endpoint, add a
`// DECISION NEEDED: confirm endpoint path and payload schema` comment
and surface it to Milosh.

### 16.2 Human Design — Local Library

- **Package:** `openhumandesign-library` (GitHub: nikolamilenkovic/openhumandesign-library)
- **Language:** TypeScript — drop-in compatible with Next.js
- **Runs:** entirely server-side, no network calls
```bash
npm install github:nikolamilenkovic/openhumandesign-library
```

The library requires Swiss Ephemeris data files at runtime. These are
NOT included in the npm package and must be provisioned separately.

**Required ephemeris files** (download from https://www.astro.com/ftp/swisseph/ephe/):
```
sepl_00.se1  sepl_06.se1  sepl_12.se1  sepl_18.se1  sepl_24.se1  sepl_30.se1
semo_00.se1  semo_06.se1  semo_12.se1  semo_18.se1  semo_24.se1  semo_30.se1
```

Store them at `./ephe/` in the project root (or set `EPHE_PATH` env var
for a custom location). On Vercel, bundle them or mount from storage —
flag this as a deployment decision before going to production.

**Basic usage pattern:**
```typescript
import { HumanDesignCalculator, BirthInfo } from 'openhumandesign-library';

const birthInfo: BirthInfo = {
  year, month, day, hour, minute, second,
  latitude, longitude,
};

const chart = HumanDesignCalculator.calculateHumanDesignChart(birthInfo, {
  ephePath: process.env.EPHE_PATH ?? './ephe',
});
// chart.type, chart.authority, chart.profile, chart.strategy, etc.
```

**What the library returns** (use these field names consistently in DB):
- `type`: Generator | Manifesting Generator | Projector | Manifestor | Reflector
- `strategy`: string
- `authority`: Emotional | Sacral | Splenic | Ego | Self-Projected | Mental | Lunar
- `profile`: e.g. "1/3", "4/6"
- `definition`: Single | Split | Triple Split | Quadruple Split | None
- `incarnationCross`: string
- `definedCenters`: string[]
- `undefinedCenters`: string[]
- `activeChannels`: string[]
- `activeGates`: string[]
- `variables`: { digestion, environment, perspective, motivation }
- Planetary activations: array of { planet, gate, line, color, tone, base }

### 16.3 Licensing Warning — Commercial Use

**This is a commercial product. Read this before using the library.**

The `openhumandesign-library` defaults to AGPL-3.0. For a closed-source
commercial product, AGPL requires you to open-source your entire app —
which is not acceptable here.

The LGPL-3.0 option is available only if you hold a Swiss Ephemeris
professional license from Astrodienst AG (https://www.astro.com/swisseph/).

**Before going live:**
1. Purchase a Swiss Ephemeris professional license from Astrodienst AG
2. Store the license documentation in `/docs/licenses/`
3. Use the library under LGPL-3.0 terms

Until this is confirmed, add a `// LICENSE PENDING` comment anywhere the
library is imported, and flag it at every PR review.

---

## 17. DATA PERSISTENCE STRATEGY — WHY DB, NOT JSON FILES

Store all chart data in **PostgreSQL** (via Prisma), not in flat JSON files.

Reasons:
- Chart data is personal data under GDPR. It must be deletable by user
  ID in a single cascading operation. JSON files make this error-prone.
- The Vedic API is a paid external service. DB storage means one API
  call per user lifetime (plus one on birth data update). JSON files
  offer no query layer to detect whether a record already exists.
- Transits and dashas are time-dependent. The DB allows querying by
  userId + date range for cache validity checks. JSON files do not.
- Insight generation reads chart data thousands of times per day. A
  proper DB with indexed userId lookups is dramatically faster than
  reading/parsing JSON files at scale.

The one exception: raw API responses can be stored as a JSONB column
for auditability, but the parsed/normalized fields must also be stored
as typed columns. Never make the system depend on parsing raw JSONB
to function.

---

## 18. CACHING RULES — WHEN TO CALL EXTERNAL SOURCES

These rules define exactly when chart data is fetched fresh vs served
from the database. Treat any violation as a bug.

### 18.1 Human Design (library — local, no API cost)

HD charts are deterministic: same birth data always produces the same
result. Recalculate only when birth data changes.
```
IF BirthProfile.chartDataHumanDesign IS NULL
  → calculate, store, return
ELSE IF BirthProfile.profileVersion has changed since last HD calc
  → recalculate, overwrite, return
ELSE
  → return stored chartDataHumanDesign, do not recalculate
```

### 18.2 Vedic Natal Chart (API — paid, static per birth data)

The natal chart is also deterministic (same birth data = same result).
```
IF BirthProfile.chartDataVedic IS NULL
  → call Vedic API, store full response + parsed fields, return
ELSE IF BirthProfile.profileVersion has changed since last Vedic fetch
  → call Vedic API, overwrite, return
ELSE
  → return stored chartDataVedic, do not call API
```

### 18.3 Transits (API — time-dependent, fetched periodically)

Transits change daily. Store them with a validity window.

Add a `Transit` table:
```
Transit
  id
  userId
  date        (DATE — one row per user per calendar day)
  data        (JSONB — raw API response)
  fetchedAt   (TIMESTAMP)
```
```
IF Transit row exists for userId + today's date
  → return stored transit data, do not call API
ELSE
  → call Vedic API for today's transits, insert row, return
```

Transit rows older than 90 days can be pruned by a scheduled job.
Never delete transits for a date that has a generated Insight referencing it.

### 18.4 Dashas (API — fetched once, valid for years)

Dasha periods are calculated from the natal chart and cover years.

Add a `Dasha` table:
```
Dasha
  id
  userId
  startDate   (DATE)
  endDate     (DATE)
  planetName  (string)
  level       (mahadasha | antardasha)
  fetchedAt   (TIMESTAMP)
```
```
IF Dasha rows exist for userId AND cover the next 12 months
  → return from DB, do not call API
ELSE
  → call Vedic API for full dasha timeline, upsert rows, return
```

Regenerate dasha data only when birth data changes (profileVersion bump).

### 18.5 Summary table

| Data type | Source | Cache strategy | Recalculate when |
|---|---|---|---|
| HD chart | Local library | DB, permanent | Birth data changes |
| Vedic natal chart | Vedic API | DB, permanent | Birth data changes |
| Daily transits | Vedic API | DB, 1 row per user per day | Row missing for today |
| Dasha timeline | Vedic API | DB, covers 12+ months | Birth data changes |

---

## 19. CHART SERVICE ARCHITECTURE

All chart computation and retrieval is centralized in `/lib/astro/`.
No other part of the codebase calls external APIs or the HD library directly.
```
/lib/astro/
  vedicApiClient.ts     - Raw HTTP client for Vedic API (section 16.1)
  hdCalculator.ts       - Wrapper around openhumandesign-library
  chartService.ts       - Orchestrator: cache-check → fetch → store → return
  transitService.ts     - Daily transit fetch with DB cache layer
  dashaService.ts       - Dasha fetch with DB cache layer
  types.ts              - Shared TypeScript types for all chart data
```

### chartService.ts responsibilities
```typescript
// Public interface — all callers use these functions only
export async function getOrCreateVedicChart(userId: string): Promise<VedicChart>
export async function getOrCreateHDChart(userId: string): Promise<HDChart>
export async function invalidateChartCache(userId: string): Promise<void>
// called when birth data is updated — bumps profileVersion and clears stored data
```

`invalidateChartCache` must be called atomically with the birth data
update. Use a Prisma transaction. Never update birth data without
invalidating — stale chart data is a content correctness bug.

### Birth data update flow
```
1. User submits updated birth data
2. Validate with Zod
3. Begin Prisma transaction:
   a. Update BirthProfile fields
   b. Increment profileVersion
   c. Set chartDataVedic = null
   d. Set chartDataHumanDesign = null
   e. Delete all Dasha rows for this userId
4. Commit transaction
5. Trigger background job: recalculate both charts
6. Notify user that past insights were based on prior data (requirement AC-04)
```

Do not recalculate charts inline during the request. Queue the recalculation
as a background job so the user gets an immediate response.

---

## 20. ENVIRONMENT VARIABLES REFERENCE
```bash
# Vedic Astrology API
VEDIC_API_URL=http://144.76.78.183:9000/api/v1
VEDIC_API_KEY=<secret — never commit>

# Human Design ephemeris files
EPHE_PATH=./ephe

# Database
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Email
RESEND_API_KEY=...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...

# Storage
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

All of these must exist in `.env.local` for development. All must be
set in Vercel environment variables before any deployment. The app
must throw a clear startup error (not a runtime crash) if any required
variable is missing.

Add a `/lib/env.ts` validation file using Zod that runs at startup:
```typescript
import { z } from 'zod';

const envSchema = z.object({
  VEDIC_API_URL: z.string().url(),
  VEDIC_API_KEY: z.string().min(1),
  EPHE_PATH: z.string().default('./ephe'),
  DATABASE_URL: z.string().min(1),
  // ... all others
});

export const env = envSchema.parse(process.env);
// Import `env` from here everywhere — never access process.env directly
```

---

*Crossroads Compass PRD v1.1 | March 2026 | Agent instructions by Milosh*
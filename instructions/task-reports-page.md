# Crossroads Compass — Agent Task: Reports Page (My Reports)
# Version: 1.0 | March 2026
# Scope: Admin-created paid reports → user-facing "My Reports" page + Gemini generation
# Agent: Claude Code CLI or Cursor

---

## CONTEXT

The current "My Cart" page must be renamed and repurposed into a "My Reports"
page. This page displays paid reports that an Admin has created and categorized
via the existing Admin Panel Custom Report Builder.

When a user purchases a report, the platform sends their chart/DB data to Google
Gemini (via API) to generate a lengthy, human-readable, personalized report. The
admin user (shomty@hotmail.com) always has full preview access to every report
regardless of purchase status.

Read these files before writing any code:
- `crossroads-compass.instructions.md`
- `FRONTEND.md` (design tokens, palette, typography)
- `prisma/schema.prisma` (existing DB models)
- `app/(admin)/` directory (existing admin panel structure)
- `lib/content/promptBuilder.ts` (existing prompt patterns)

---

## RULES (follow strictly)

1. One sub-task at a time. Do not skip ahead.
2. Mark every created/modified file with: `// STATUS: done | Task R.X`
3. On any DECISION NEEDED: stop, write a comment block, surface it. Do not guess.
4. Never modify files from previous tasks unless this task explicitly requires it.
5. Design MUST use existing FRONTEND.md design tokens (cosmos/amber/gold palette,
   Cormorant Garamond + DM Mono + Instrument Sans, dark-only, glassmorphism).
6. Never import a new UI library. Use existing component patterns in the codebase.

---

## SUB-TASK R.1 — Database Schema: ReportProduct model

**File to create/modify:** `prisma/schema.prisma`

**Do:**

Add the following Prisma models. Do NOT delete or modify existing models.

```prisma
model ReportProduct {
  id            String   @id @default(cuid())
  slug          String   @unique          // URL-safe identifier, e.g. "shadow-work-deep-dive"
  title         String
  subtitle      String?
  description   String   @db.Text        // Shown on the reports listing page
  category      ReportCategory
  priceUsd      Int                       // Stored in cents, e.g. 4900 = $49.00
  isActive      Boolean  @default(true)   // Admin can deactivate without deleting
  sortOrder     Int      @default(0)
  coverImageUrl String?
  geminiPrompt  String   @db.Text        // The full system prompt sent to Gemini
                                          // Supports placeholders: {{hd_type}},
                                          // {{hd_authority}}, {{hd_profile}},
                                          // {{lagna}}, {{moon_sign}}, {{sun_sign}},
                                          // {{current_dasha}}, {{user_name}}
  estimatedWordCount Int @default(2000)   // Shown to user as "~X word report"
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  createdBy     String                    // Admin email who created it
  purchases     ReportPurchase[]
}

enum ReportCategory {
  LIFE_PURPOSE
  CAREER
  RELATIONSHIPS
  SHADOW_WORK
  TIMING
  HEALTH
  FINANCE
  CUSTOM
}

model ReportPurchase {
  id              String         @id @default(cuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id])
  reportProductId String
  reportProduct   ReportProduct  @relation(fields: [reportProductId], references: [id])
  stripePaymentId String?        @unique
  amountPaidUsd   Int            // in cents
  status          ReportPurchaseStatus @default(PENDING)
  generatedReport GeneratedReport?
  purchasedAt     DateTime       @default(now())
  @@unique([userId, reportProductId])  // one purchase per user per product
}

enum ReportPurchaseStatus {
  PENDING      // payment initiated
  PAID         // payment confirmed, generation not yet started
  GENERATING   // Gemini API call in progress
  COMPLETE     // report text is ready
  FAILED       // generation failed, needs retry
}

model GeneratedReport {
  id               String         @id @default(cuid())
  purchaseId       String         @unique
  purchase         ReportPurchase @relation(fields: [purchaseId], references: [id])
  content          String         @db.Text   // Full Gemini output, human-readable markdown
  wordCount        Int
  generatedAt      DateTime       @default(now())
  geminiModel      String         // e.g. "gemini-1.5-pro"
  generationTimeMs Int?           // for performance monitoring
}
```

Add `reportPurchases ReportPurchase[]` to the existing `User` model.

**Then run:**
```bash
npx prisma migrate dev --name add_report_products
npx prisma generate
```

**Done when:** migration succeeds, `npx prisma studio` shows all new tables.

---

## SUB-TASK R.2 — Types

**File to modify:** `types/index.ts`

**Do:**

Add these TypeScript types (do not replace existing types):

```typescript
export type ReportCategory =
  | 'LIFE_PURPOSE'
  | 'CAREER'
  | 'RELATIONSHIPS'
  | 'SHADOW_WORK'
  | 'TIMING'
  | 'HEALTH'
  | 'FINANCE'
  | 'CUSTOM'

export type ReportPurchaseStatus =
  | 'PENDING'
  | 'PAID'
  | 'GENERATING'
  | 'COMPLETE'
  | 'FAILED'

export interface ReportProductSummary {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string
  category: ReportCategory
  priceUsd: number          // in cents
  isActive: boolean
  sortOrder: number
  coverImageUrl: string | null
  estimatedWordCount: number
}

export interface UserReportCard {
  purchaseId: string
  product: ReportProductSummary
  status: ReportPurchaseStatus
  purchasedAt: string
  generatedAt: string | null
  wordCount: number | null
}

export interface ReportContentResponse {
  purchaseId: string
  productTitle: string
  content: string           // Full markdown text
  generatedAt: string
  wordCount: number
}

// For admin panel: full product with prompt
export interface ReportProductFull extends ReportProductSummary {
  geminiPrompt: string
  createdBy: string
  createdAt: string
}
```

**Done when:** `types/index.ts` compiles with no errors.

---

## SUB-TASK R.3 — Environment Variables

**Files to modify:** `.env.local`, `.env.example`, `lib/env.ts`

**Do:**

Add these env vars to `.env.example` (empty values):
```
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-pro
ADMIN_EMAIL=shomty@hotmail.com
```

Add them to `.env.local` with real values for GEMINI_API_KEY. Leave ADMIN_EMAIL
as `shomty@hotmail.com`.

In `lib/env.ts`, add to the Zod schema:
```typescript
GEMINI_API_KEY: z.string().min(1),
GEMINI_MODEL: z.string().default('gemini-1.5-pro'),
ADMIN_EMAIL: z.string().email().default('shomty@hotmail.com'),
```

**Done when:** app starts without errors, removing GEMINI_API_KEY causes a clear
startup error.

---

## SUB-TASK R.4 — Gemini Client

**File to create:** `lib/gemini/client.ts`

**Do:**

```typescript
// STATUS: done | Task R.4
// Gemini API client for report generation.
// Uses @google/generative-ai package.

// Install first: npm install @google/generative-ai
```

Install the package:
```bash
npm install @google/generative-ai
```

Implement:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/lib/env'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export class GeminiGenerationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'GeminiGenerationError'
  }
}

export interface GeminiGenerationResult {
  text: string
  wordCount: number
  model: string
  durationMs: number
}

/**
 * Generate a long-form report using Gemini.
 * @param systemPrompt - The full system/context prompt (from ReportProduct.geminiPrompt)
 * @param userDataContext - Assembled user chart data as a structured string
 */
export async function generateReportWithGemini(
  systemPrompt: string,
  userDataContext: string
): Promise<GeminiGenerationResult> {
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: systemPrompt,
  })

  const start = Date.now()

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: userDataContext }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,   // ~6000 words — adjust per report type
        topP: 0.9,
      },
    })

    const text = result.response.text()
    const wordCount = text.split(/\s+/).filter(Boolean).length
    const durationMs = Date.now() - start

    return {
      text,
      wordCount,
      model: env.GEMINI_MODEL,
      durationMs,
    }
  } catch (error) {
    throw new GeminiGenerationError(
      'Gemini report generation failed',
      error
    )
  }
}
```

**Done when:** client compiles with no TypeScript errors.

---

## SUB-TASK R.5 — Report Data Assembler (User Context Builder)

**File to create:** `lib/reports/contextBuilder.ts`

**Do:**

This function pulls the user's chart data from the DB and KV cache, then builds
a structured text context string to send to Gemini alongside the prompt.

```typescript
// STATUS: done | Task R.5

import { prisma } from '@/lib/prisma'
import { getOrCreateHDChart } from '@/lib/astro/chartService'
import { kvGet } from '@/lib/kv/helpers'
import { kvKeys } from '@/lib/kv/keys'

export async function buildUserReportContext(userId: string): Promise<string> {
  // 1. Fetch birth profile from DB
  const birthProfile = await prisma.birthProfile.findUnique({
    where: { userId },
  })

  if (!birthProfile) {
    throw new Error(`No birth profile found for user ${userId}`)
  }

  // 2. Fetch HD chart from KV (or calculate)
  const hdChart = await getOrCreateHDChart(userId, birthProfile)

  // 3. Fetch Vedic chart from KV (may be null — handle gracefully)
  const vedicChart = await kvGet<Record<string, unknown>>(
    kvKeys.vedicChart(userId)
  )

  // 4. Fetch dasha data from KV (may be null)
  const dashas = await kvGet<Record<string, unknown>>(
    kvKeys.dashas(userId)
  )

  // 5. Fetch user email for personalisation
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })

  // 6. Assemble context as structured plain text
  // Gemini receives this as the user message after the system prompt.
  const lines: string[] = [
    '=== USER CHART DATA FOR REPORT GENERATION ===',
    '',
    `User: ${user?.email ?? 'Unknown'}`,
    `Birth Date: ${birthProfile.birthDate.toISOString().split('T')[0]}`,
    `Birth Time: ${birthProfile.birthTime ?? 'Unknown'}`,
    `Birth Location: ${birthProfile.birthLocation}`,
    `Timezone: ${birthProfile.timezone}`,
    '',
    '--- HUMAN DESIGN ---',
    `Type: ${hdChart.type}`,
    `Strategy: ${hdChart.strategy}`,
    `Authority: ${hdChart.authority}`,
    `Profile: ${hdChart.profile}`,
    `Definition: ${hdChart.definition}`,
    `Incarnation Cross: ${hdChart.incarnationCross ?? 'Unknown'}`,
    `Defined Centers: ${JSON.stringify(hdChart.definedCenters ?? [])}`,
    `Undefined Centers: ${JSON.stringify(hdChart.undefinedCenters ?? [])}`,
    `Active Gates: ${JSON.stringify(hdChart.gates ?? [])}`,
    `Active Channels: ${JSON.stringify(hdChart.channels ?? [])}`,
    '',
  ]

  if (vedicChart) {
    lines.push('--- VEDIC ASTROLOGY ---')
    lines.push(`Lagna (Ascendant): ${vedicChart.lagna ?? 'Unknown'}`)
    lines.push(`Sun Sign: ${vedicChart.sunSign ?? 'Unknown'}`)
    lines.push(`Moon Sign: ${vedicChart.moonSign ?? 'Unknown'}`)
    lines.push(`Planetary Positions: ${JSON.stringify(vedicChart.planets ?? {})}`)
    lines.push(`House Cusps: ${JSON.stringify(vedicChart.houses ?? {})}`)
    lines.push('')
  } else {
    lines.push('--- VEDIC ASTROLOGY ---')
    lines.push('Note: Vedic chart data not yet available for this user.')
    lines.push('')
  }

  if (dashas) {
    lines.push('--- CURRENT DASHA PERIODS ---')
    lines.push(JSON.stringify(dashas, null, 2))
    lines.push('')
  }

  lines.push('=== END OF USER DATA ===')
  lines.push('')
  lines.push(
    'Using all the above data, generate the requested report. ' +
    'Write in warm, practical, non-predictive language. ' +
    'Avoid "you will" language. Prefer "you may notice", "this period tends to", ' +
    '"your chart suggests". Format output in clear sections with markdown headings. ' +
    'Be specific to this person\'s chart — never generic.'
  )

  return lines.join('\n')
}
```

**Done when:** function compiles. No runtime calls yet.

---

## SUB-TASK R.6 — Prompt Template Interpolation

**File to create:** `lib/reports/promptInterpolator.ts`

**Do:**

The admin writes a Gemini prompt using placeholder tokens. This function
replaces them with real user data before sending to Gemini.

```typescript
// STATUS: done | Task R.6

import type { HDChartData } from '@/types'

interface InterpolationContext {
  hdType: string
  hdAuthority: string
  hdProfile: string
  lagna?: string
  moonSign?: string
  sunSign?: string
  currentDasha?: string
  userName?: string
}

export function interpolatePrompt(
  template: string,
  ctx: InterpolationContext
): string {
  return template
    .replace(/{{hd_type}}/g, ctx.hdType)
    .replace(/{{hd_authority}}/g, ctx.hdAuthority)
    .replace(/{{hd_profile}}/g, ctx.hdProfile)
    .replace(/{{lagna}}/g, ctx.lagna ?? 'Unknown')
    .replace(/{{moon_sign}}/g, ctx.moonSign ?? 'Unknown')
    .replace(/{{sun_sign}}/g, ctx.sunSign ?? 'Unknown')
    .replace(/{{current_dasha}}/g, ctx.currentDasha ?? 'Unknown')
    .replace(/{{user_name}}/g, ctx.userName ?? 'Seeker')
}

export function buildInterpolationContext(
  hdChart: HDChartData,
  vedicChart?: Record<string, unknown> | null,
  dashas?: Record<string, unknown> | null,
  userEmail?: string
): InterpolationContext {
  const userName = userEmail?.split('@')[0] ?? 'Seeker'
  const currentDasha = dashas
    ? String((dashas as Record<string, unknown>).currentMahadasha ?? 'Unknown')
    : undefined

  return {
    hdType: hdChart.type,
    hdAuthority: hdChart.authority,
    hdProfile: hdChart.profile,
    lagna: vedicChart ? String(vedicChart.lagna ?? '') : undefined,
    moonSign: vedicChart ? String(vedicChart.moonSign ?? '') : undefined,
    sunSign: vedicChart ? String(vedicChart.sunSign ?? '') : undefined,
    currentDasha,
    userName,
  }
}
```

**Done when:** compiles with no errors.

---

## SUB-TASK R.7 — Report Generation Service

**File to create:** `lib/reports/reportGenerationService.ts`

**Do:**

This is the orchestrator. It:
1. Checks if the purchase exists and is in PAID status
2. Marks it as GENERATING
3. Assembles user context
4. Interpolates the admin prompt
5. Calls Gemini
6. Saves the GeneratedReport
7. Updates purchase status to COMPLETE or FAILED

```typescript
// STATUS: done | Task R.7

import { prisma } from '@/lib/prisma'
import { buildUserReportContext } from './contextBuilder'
import { interpolatePrompt, buildInterpolationContext } from './promptInterpolator'
import { generateReportWithGemini, GeminiGenerationError } from '@/lib/gemini/client'
import { getOrCreateHDChart } from '@/lib/astro/chartService'
import { kvGet } from '@/lib/kv/helpers'
import { kvKeys } from '@/lib/kv/keys'

export async function generateReportForPurchase(
  purchaseId: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Load purchase + product + user
  const purchase = await prisma.reportPurchase.findUnique({
    where: { id: purchaseId },
    include: {
      reportProduct: true,
      user: { select: { id: true, email: true } },
    },
  })

  if (!purchase) {
    return { success: false, error: 'Purchase not found' }
  }

  if (purchase.status !== 'PAID') {
    return {
      success: false,
      error: `Purchase is in status ${purchase.status}, expected PAID`,
    }
  }

  // 2. Mark as GENERATING
  await prisma.reportPurchase.update({
    where: { id: purchaseId },
    data: { status: 'GENERATING' },
  })

  try {
    const userId = purchase.user.id
    const birthProfile = await prisma.birthProfile.findUnique({
      where: { userId },
    })

    if (!birthProfile) {
      throw new Error('No birth profile for user')
    }

    // 3. Load chart data
    const hdChart = await getOrCreateHDChart(userId, birthProfile)
    const vedicChart = await kvGet<Record<string, unknown>>(
      kvKeys.vedicChart(userId)
    )
    const dashas = await kvGet<Record<string, unknown>>(
      kvKeys.dashas(userId)
    )

    // 4. Interpolate admin prompt
    const interpolationCtx = buildInterpolationContext(
      hdChart,
      vedicChart,
      dashas,
      purchase.user.email
    )
    const systemPrompt = interpolatePrompt(
      purchase.reportProduct.geminiPrompt,
      interpolationCtx
    )

    // 5. Build user data context
    const userContext = await buildUserReportContext(userId)

    // 6. Call Gemini
    const result = await generateReportWithGemini(systemPrompt, userContext)

    // 7. Save generated report
    await prisma.$transaction([
      prisma.generatedReport.create({
        data: {
          purchaseId,
          content: result.text,
          wordCount: result.wordCount,
          geminiModel: result.model,
          generationTimeMs: result.durationMs,
        },
      }),
      prisma.reportPurchase.update({
        where: { id: purchaseId },
        data: { status: 'COMPLETE' },
      }),
    ])

    return { success: true }
  } catch (error) {
    console.error('[reportGenerationService] Generation failed:', error)

    await prisma.reportPurchase.update({
      where: { id: purchaseId },
      data: { status: 'FAILED' },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
```

**Done when:** compiles with no errors. Do NOT call it yet.

---

## SUB-TASK R.8 — API Routes

Create all three API routes below. Each is a separate file.

---

### R.8a — GET /api/reports — List available report products

**File:** `app/api/reports/route.ts`

```typescript
// STATUS: done | Task R.8a
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth/helpers'

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all active report products
  const products = await prisma.reportProduct.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      description: true,
      category: true,
      priceUsd: true,
      coverImageUrl: true,
      estimatedWordCount: true,
      // Do NOT expose geminiPrompt to the client
    },
  })

  // For each product, check if this user has purchased it
  const purchases = await prisma.reportPurchase.findMany({
    where: {
      userId: user.id,
      status: { in: ['PAID', 'GENERATING', 'COMPLETE'] },
    },
    select: {
      reportProductId: true,
      status: true,
      id: true,
    },
  })

  const purchaseMap = new Map(purchases.map(p => [p.reportProductId, p]))

  const response = products.map(product => ({
    ...product,
    purchaseStatus: purchaseMap.get(product.id)?.status ?? null,
    purchaseId: purchaseMap.get(product.id)?.id ?? null,
  }))

  return NextResponse.json({ products: response })
}
```

---

### R.8b — GET /api/reports/[purchaseId] — Read a generated report

**File:** `app/api/reports/[purchaseId]/route.ts`

```typescript
// STATUS: done | Task R.8b
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth/helpers'
import { env } from '@/lib/env'

export async function GET(
  _req: Request,
  { params }: { params: { purchaseId: string } }
) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const purchase = await prisma.reportPurchase.findUnique({
    where: { id: params.purchaseId },
    include: {
      reportProduct: { select: { title: true } },
      generatedReport: true,
      user: { select: { email: true, id: true } },
    },
  })

  if (!purchase) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Allow access if: owner OR admin email
  const isOwner = purchase.user.id === user.id
  const isAdmin = user.email === env.ADMIN_EMAIL

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (purchase.status !== 'COMPLETE' || !purchase.generatedReport) {
    return NextResponse.json({
      status: purchase.status,
      message: 'Report not yet available',
    })
  }

  return NextResponse.json({
    purchaseId: purchase.id,
    productTitle: purchase.reportProduct.title,
    content: purchase.generatedReport.content,
    generatedAt: purchase.generatedReport.generatedAt,
    wordCount: purchase.generatedReport.wordCount,
  })
}
```

---

### R.8c — POST /api/reports/generate — Trigger generation (admin only)

**File:** `app/api/reports/generate/route.ts`

```typescript
// STATUS: done | Task R.8c
import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/helpers'
import { generateReportForPurchase } from '@/lib/reports/reportGenerationService'
import { env } from '@/lib/env'

export async function POST(req: Request) {
  const user = await getSessionUser()

  if (!user || user.email !== env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { purchaseId } = body as { purchaseId?: string }

  if (!purchaseId) {
    return NextResponse.json(
      { error: 'purchaseId is required' },
      { status: 400 }
    )
  }

  const result = await generateReportForPurchase(purchaseId)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

---

### R.8d — POST /api/reports/purchase — Create a purchase record (after Stripe payment)

**File:** `app/api/reports/purchase/route.ts`

This is a simplified stub. In production this is called from the Stripe webhook.
For now it allows manual purchase creation for testing.

```typescript
// STATUS: done | Task R.8d
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth/helpers'
import { env } from '@/lib/env'

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { reportProductId, stripePaymentId } = body as {
    reportProductId?: string
    stripePaymentId?: string
  }

  if (!reportProductId) {
    return NextResponse.json(
      { error: 'reportProductId is required' },
      { status: 400 }
    )
  }

  const product = await prisma.reportProduct.findUnique({
    where: { id: reportProductId },
  })

  if (!product || !product.isActive) {
    return NextResponse.json(
      { error: 'Report product not found or inactive' },
      { status: 404 }
    )
  }

  // Check for existing purchase
  const existing = await prisma.reportPurchase.findUnique({
    where: { userId_reportProductId: { userId: user.id, reportProductId } },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'Already purchased', purchaseId: existing.id },
      { status: 409 }
    )
  }

  const purchase = await prisma.reportPurchase.create({
    data: {
      userId: user.id,
      reportProductId,
      stripePaymentId: stripePaymentId ?? null,
      amountPaidUsd: product.priceUsd,
      // Admin can create as PAID directly for testing
      status: user.email === env.ADMIN_EMAIL ? 'PAID' : 'PENDING',
    },
  })

  return NextResponse.json({ purchaseId: purchase.id, status: purchase.status })
}
```

**Done when:** all four routes compile without errors.

---

## SUB-TASK R.9 — "My Reports" Page (User-Facing)

Rename the existing "My Cart" page or create this as a new route.

**File:** `app/(dashboard)/reports/page.tsx`

**Design reference:** The attached screenshot shows a marketplace-style grid of
report cards. Adapt this pattern using the existing app's design system:
- Dark glassmorphism cards (existing `.glass-card` or equivalent pattern)
- Cosmos/amber/gold palette from FRONTEND.md
- Cormorant Garamond for headings, Instrument Sans for body
- Category filter pills at the top (horizontal scroll on mobile)
- Each card: cover image area (or gradient placeholder), category badge,
  title, short description, estimated word count, price, and CTA

**Do:**

```typescript
// STATUS: done | Task R.9
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// Types (import from @/types)
// ReportProductSummary, ReportCategory

interface ProductWithStatus {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string
  category: string
  priceUsd: number
  coverImageUrl: string | null
  estimatedWordCount: number
  purchaseStatus: string | null
  purchaseId: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'All Reports',
  LIFE_PURPOSE: 'Life Purpose',
  CAREER: 'Career',
  RELATIONSHIPS: 'Relationships',
  SHADOW_WORK: 'Shadow Work',
  TIMING: 'Timing',
  HEALTH: 'Health',
  FINANCE: 'Finance',
  CUSTOM: 'Custom',
}

// Category gradient backgrounds (cosmic palette)
const CATEGORY_GRADIENTS: Record<string, string> = {
  LIFE_PURPOSE: 'from-amber-900/40 to-cosmos-900/60',
  CAREER: 'from-gold-900/40 to-amber-900/60',
  RELATIONSHIPS: 'from-rose-900/30 to-cosmos-900/60',
  SHADOW_WORK: 'from-slate-900/60 to-cosmos-900/80',
  TIMING: 'from-indigo-900/40 to-cosmos-900/60',
  HEALTH: 'from-emerald-900/30 to-cosmos-900/60',
  FINANCE: 'from-gold-900/50 to-cosmos-900/60',
  CUSTOM: 'from-cosmos-800/40 to-cosmos-900/60',
}

export default function MyReportsPage() {
  const [products, setProducts] = useState<ProductWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then(data => {
        setProducts(data.products ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load reports. Please refresh.')
        setLoading(false)
      })
  }, [])

  const filtered =
    activeCategory === 'ALL'
      ? products
      : products.filter(p => p.category === activeCategory)

  const categories = [
    'ALL',
    ...Array.from(new Set(products.map(p => p.category))),
  ]

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      {/* Page Header */}
      <div className="mb-10">
        <h1
          className="font-heading text-4xl md:text-5xl text-amber-100 mb-3"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Your Reports
        </h1>
        <p className="text-cosmos-300 text-lg max-w-2xl" style={{ fontFamily: 'Instrument Sans, sans-serif' }}>
          Deep, personalized reports generated from your unique chart data.
          Each report is written specifically for your Vedic and Human Design blueprint.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
              border transition-all duration-200
              ${
                activeCategory === cat
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                  : 'bg-cosmos-900/40 border-cosmos-700/40 text-cosmos-400 hover:border-amber-600/40 hover:text-amber-300'
              }
            `}
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card border border-red-900/40 p-6 text-red-300 text-sm rounded-xl mb-8">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-24">
          <p className="text-cosmos-400 text-lg">No reports available in this category yet.</p>
        </div>
      )}

      {/* Reports Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(product => (
            <ReportCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReportCard({ product }: { product: ProductWithStatus }) {
  const gradient =
    CATEGORY_GRADIENTS[product.category] ?? CATEGORY_GRADIENTS.CUSTOM
  const isPurchased = ['PAID', 'GENERATING', 'COMPLETE'].includes(
    product.purchaseStatus ?? ''
  )
  const isComplete = product.purchaseStatus === 'COMPLETE'
  const isGenerating = product.purchaseStatus === 'GENERATING'

  const priceDisplay = `$${(product.priceUsd / 100).toFixed(0)}`
  const wordDisplay = `~${(product.estimatedWordCount / 1000).toFixed(0)}k words`

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-cosmos-700/30 hover:border-amber-600/40 transition-all duration-300 flex flex-col group">
      {/* Cover Area */}
      <div
        className={`relative h-40 bg-gradient-to-br ${gradient} flex items-end p-5`}
      >
        {product.coverImageUrl ? (
          <img
            src={product.coverImageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        ) : null}

        {/* Category Badge */}
        <span
          className="relative z-10 text-xs px-3 py-1 rounded-full border border-amber-400/30 text-amber-300 bg-cosmos-900/60"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          {CATEGORY_LABELS[product.category] ?? product.category}
        </span>

        {/* Status Badge */}
        {isPurchased && (
          <span
            className={`
              relative z-10 ml-2 text-xs px-3 py-1 rounded-full font-medium
              ${isComplete ? 'bg-emerald-900/60 border border-emerald-500/40 text-emerald-300' : ''}
              ${isGenerating ? 'bg-amber-900/60 border border-amber-500/40 text-amber-300 animate-pulse' : ''}
              ${product.purchaseStatus === 'PAID' ? 'bg-cosmos-800/60 border border-cosmos-500/40 text-cosmos-300' : ''}
            `}
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {isComplete ? 'Ready to Read' : isGenerating ? 'Generating...' : 'Purchased'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <h3
          className="text-xl text-amber-100 mb-1 group-hover:text-amber-200 transition-colors"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          {product.title}
        </h3>
        {product.subtitle && (
          <p
            className="text-cosmos-400 text-sm mb-3"
            style={{ fontFamily: 'Instrument Sans, sans-serif' }}
          >
            {product.subtitle}
          </p>
        )}
        <p
          className="text-cosmos-300 text-sm leading-relaxed flex-1 line-clamp-3"
          style={{ fontFamily: 'Instrument Sans, sans-serif' }}
        >
          {product.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-4 text-xs text-cosmos-500" style={{ fontFamily: 'DM Mono, monospace' }}>
          <span>{wordDisplay}</span>
          <span className="w-1 h-1 rounded-full bg-cosmos-600" />
          <span>Personalized to your chart</span>
        </div>

        {/* CTA */}
        <div className="mt-5">
          {isComplete ? (
            <Link
              href={`/reports/${product.purchaseId}`}
              className="block w-full text-center py-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-sm font-medium hover:bg-amber-500/30 transition-all"
              style={{ fontFamily: 'Instrument Sans, sans-serif' }}
            >
              Read Report
            </Link>
          ) : isGenerating ? (
            <button
              disabled
              className="block w-full text-center py-3 rounded-xl bg-cosmos-800/40 border border-cosmos-600/30 text-cosmos-400 text-sm cursor-not-allowed"
              style={{ fontFamily: 'Instrument Sans, sans-serif' }}
            >
              Generating your report...
            </button>
          ) : isPurchased ? (
            <button
              disabled
              className="block w-full text-center py-3 rounded-xl bg-cosmos-800/40 border border-cosmos-600/30 text-cosmos-400 text-sm cursor-not-allowed"
              style={{ fontFamily: 'Instrument Sans, sans-serif' }}
            >
              Awaiting Generation
            </button>
          ) : (
            <Link
              href={`/reports/checkout/${product.id}`}
              className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-amber-600/30 to-gold-600/30 border border-amber-500/40 text-amber-100 text-sm font-medium hover:from-amber-600/40 hover:to-gold-600/40 transition-all"
              style={{ fontFamily: 'Instrument Sans, sans-serif' }}
            >
              Get This Report — {priceDisplay}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Done when:** page renders at `/reports` for authenticated users with correct styling.

---

## SUB-TASK R.10 — Individual Report Reader Page

**File:** `app/(dashboard)/reports/[purchaseId]/page.tsx`

This page renders the full generated report content. The content arrives as
markdown — render it with a prose style that matches the app's aesthetic.

**Install:** `npm install react-markdown`

```typescript
// STATUS: done | Task R.10
import { notFound, redirect } from 'next/navigation'
import { getRequiredSession } from '@/lib/auth/helpers'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import ReportReaderClient from './ReportReaderClient'

export default async function ReportPage({
  params,
}: {
  params: { purchaseId: string }
}) {
  const session = await getRequiredSession()

  const purchase = await prisma.reportPurchase.findUnique({
    where: { id: params.purchaseId },
    include: {
      reportProduct: { select: { title: true, subtitle: true, category: true } },
      generatedReport: true,
      user: { select: { id: true, email: true } },
    },
  })

  if (!purchase) notFound()

  const isOwner = purchase.user.id === session.user.id
  const isAdmin = session.user.email === env.ADMIN_EMAIL
  if (!isOwner && !isAdmin) redirect('/reports')

  return (
    <ReportReaderClient
      purchaseId={purchase.id}
      productTitle={purchase.reportProduct.title}
      productSubtitle={purchase.reportProduct.subtitle}
      category={purchase.reportProduct.category}
      status={purchase.status}
      content={purchase.generatedReport?.content ?? null}
      generatedAt={purchase.generatedReport?.generatedAt?.toISOString() ?? null}
      wordCount={purchase.generatedReport?.wordCount ?? null}
      isAdmin={isAdmin}
    />
  )
}
```

**File:** `app/(dashboard)/reports/[purchaseId]/ReportReaderClient.tsx`

```typescript
// STATUS: done | Task R.10
'use client'

import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

interface Props {
  purchaseId: string
  productTitle: string
  productSubtitle: string | null
  category: string
  status: string
  content: string | null
  generatedAt: string | null
  wordCount: number | null
  isAdmin: boolean
}

export default function ReportReaderClient({
  purchaseId,
  productTitle,
  productSubtitle,
  status,
  content,
  generatedAt,
  wordCount,
  isAdmin,
}: Props) {
  // Admin: trigger generation
  const handleGenerate = async () => {
    await fetch('/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseId }),
    })
    window.location.reload()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Back */}
      <Link
        href="/reports"
        className="text-cosmos-400 text-sm hover:text-amber-300 transition-colors mb-8 inline-block"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        ← Back to Reports
      </Link>

      {/* Header */}
      <div className="mb-10">
        <h1
          className="font-heading text-4xl md:text-5xl text-amber-100 mb-3"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          {productTitle}
        </h1>
        {productSubtitle && (
          <p className="text-cosmos-400 text-lg" style={{ fontFamily: 'Instrument Sans, sans-serif' }}>
            {productSubtitle}
          </p>
        )}

        {/* Meta */}
        {generatedAt && (
          <p className="text-cosmos-600 text-xs mt-3" style={{ fontFamily: 'DM Mono, monospace' }}>
            Generated {new Date(generatedAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
            {wordCount ? ` · ${wordCount.toLocaleString()} words` : ''}
          </p>
        )}
      </div>

      {/* Admin Controls */}
      {isAdmin && status !== 'COMPLETE' && (
        <div className="glass-card border border-amber-700/30 rounded-xl p-5 mb-8">
          <p className="text-amber-300 text-sm mb-3" style={{ fontFamily: 'Instrument Sans, sans-serif' }}>
            Admin: Report status is <strong>{status}</strong>. Trigger generation below.
          </p>
          <button
            onClick={handleGenerate}
            disabled={status === 'GENERATING'}
            className="px-5 py-2 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-200 text-sm hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ fontFamily: 'Instrument Sans, sans-serif' }}
          >
            {status === 'GENERATING' ? 'Generating...' : 'Generate Report Now'}
          </button>
        </div>
      )}

      {/* Not Ready State */}
      {!content && status !== 'COMPLETE' && (
        <div className="glass-card border border-cosmos-700/30 rounded-xl p-10 text-center">
          <p className="text-cosmos-300 text-lg" style={{ fontFamily: 'Instrument Sans, sans-serif' }}>
            {status === 'GENERATING'
              ? 'Your report is being generated. This may take a few minutes.'
              : 'Your report is queued and will be ready soon.'}
          </p>
        </div>
      )}

      {/* Report Content */}
      {content && (
        <div
          className="
            prose prose-invert max-w-none
            prose-headings:font-heading prose-headings:text-amber-100
            prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-xl
            prose-p:text-cosmos-200 prose-p:leading-relaxed prose-p:text-base
            prose-strong:text-amber-200
            prose-li:text-cosmos-200
            prose-hr:border-cosmos-700/40
          "
          style={{ fontFamily: 'Instrument Sans, sans-serif' }}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
```

**Done when:** page renders report content correctly. Markdown headings use
Cormorant Garamond, body text uses Instrument Sans.

---

## SUB-TASK R.11 — Navigation: Rename "My Cart" to "My Reports"

**File:** Update the dashboard sidebar/nav component (wherever "My Cart" or cart
link is defined — search for it).

**Do:**
- Rename the label from "My Cart" (or equivalent) to "My Reports"
- Update the href to `/reports`
- Update the icon if needed (use a `BookOpen` or `FileText` icon from lucide-react)

**Search command to find the nav file:**
```bash
grep -r "cart\|Cart" app/ components/ --include="*.tsx" -l
```

**Done when:** dashboard nav shows "My Reports" linking to `/reports`.

---

## SUB-TASK R.12 — Admin Panel: Create Test Report Product

This task creates a seed script to add one test report product to the database
so you can test the full flow end-to-end.

**File:** `scripts/seed-test-report.ts`

```typescript
// STATUS: done | Task R.12
// Run with: npx ts-node scripts/seed-test-report.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.reportProduct.findUnique({
    where: { slug: 'shadow-work-deep-dive-test' },
  })

  if (existing) {
    console.log('Test report product already exists:', existing.id)
    return
  }

  const product = await prisma.reportProduct.create({
    data: {
      slug: 'shadow-work-deep-dive-test',
      title: 'Shadow Work Deep Dive',
      subtitle: 'Your blind spots, your growth edge, your liberation',
      description:
        'A 2,000-word personalized analysis of your shadow patterns based on your ' +
        '12th house placements, undefined Human Design centers, and South Node themes. ' +
        'Includes journaling prompts and a practical integration pathway.',
      category: 'SHADOW_WORK',
      priceUsd: 4900,  // $49.00
      estimatedWordCount: 2000,
      isActive: true,
      sortOrder: 1,
      createdBy: 'shomty@hotmail.com',
      geminiPrompt: `You are a deeply skilled Vedic astrologer and Human Design analyst 
specializing in shadow work and psychological integration. 

The user is a {{hd_type}} with {{hd_authority}} Authority and a {{hd_profile}} profile.
Their Vedic Lagna is {{lagna}}, Moon is in {{moon_sign}}, and they are currently 
in their {{current_dasha}} Mahadasha period.

Write a comprehensive, warm, and practically focused Shadow Work report for {{user_name}}. 
The report should:

1. Open with a poetic but grounded framing of what shadow work means in their specific context
2. Identify their top 3 shadow themes from their chart data (12th house, undefined centers, Ketu)
3. Explain how each theme manifests in daily life — specific, observable behaviors
4. Provide 3-5 journaling prompts tailored to their exact configuration
5. Offer an integration pathway: practical steps, not just awareness
6. Close with an affirmation of their unique growth path

Tone: warm, non-clinical, non-predictive. Never say "you will". 
Use "you may notice", "this pattern tends to", "your chart suggests".
Write in clear sections with markdown headings. Aim for 2,000 words minimum.
Every paragraph must feel written for THIS person specifically, not a generic type.`,
    },
  })

  console.log('Created test report product:', product.id)
  console.log('Slug:', product.slug)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Run:**
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-test-report.ts
```

**Done when:** report product appears in Prisma Studio under ReportProduct.

---

## SUB-TASK R.13 — End-to-End Test (Manual)

Follow these steps to verify the full flow works:

1. Log in as shomty@hotmail.com
2. Navigate to `/reports` — confirm the test report product card appears
3. POST to `/api/reports/purchase` with `{ "reportProductId": "<id from step 2>" }`
   — confirm a purchase record is created with status PAID (admin bypass)
4. Navigate to `/reports` again — confirm the card shows "Awaiting Generation"
5. Navigate to `/reports/<purchaseId>` — confirm the Admin controls panel appears
6. Click "Generate Report Now" — confirm the API call fires
7. Wait for generation (Gemini may take 20-60 seconds)
8. Refresh the page — confirm the full markdown report renders
9. Navigate back to `/reports` — confirm the card now shows "Ready to Read"
10. Log in as a different test user — confirm they cannot access the report URL

**Done when:** all 10 steps succeed without errors.

---

## DECISION NEEDED BLOCKS

```
DECISION NEEDED
Task: R.8d (purchase route)
File: app/api/reports/purchase/route.ts
Question: Should paid report purchases go through a dedicated Stripe Checkout
  session (separate from subscription), or should admin manually mark purchases
  as PAID during testing and Stripe integration come in a later phase?
Blocking: Full payment flow for non-admin users
Raised: March 2026
Resolved: [fill in]

---

DECISION NEEDED
Task: R.10 (report reader)
File: app/(dashboard)/reports/[purchaseId]/ReportReaderClient.tsx
Question: Should completed reports be exportable as PDF? If yes, this requires
  a separate PDF generation task using the existing PDF skill.
Blocking: PDF export CTA on the reader page
Raised: March 2026
Resolved: [fill in]

---

DECISION NEEDED
Task: R.5 (context builder)
File: lib/reports/contextBuilder.ts
Question: The HDChartData fields (definedCenters, undefinedCenters, gates,
  channels, incarnationCross) must match the actual output shape of
  openhumandesign-library. Confirm field names before running generation.
Blocking: Correct context being sent to Gemini
Raised: March 2026
Resolved: [fill in]
```

---

## COMPLETION CHECKLIST — REPORTS FEATURE

- [ ] R.1 Prisma schema: ReportProduct, ReportPurchase, GeneratedReport
- [ ] R.2 TypeScript types added to types/index.ts
- [ ] R.3 GEMINI_API_KEY, GEMINI_MODEL, ADMIN_EMAIL in env
- [ ] R.4 Gemini client: lib/gemini/client.ts
- [ ] R.5 Context builder: lib/reports/contextBuilder.ts
- [ ] R.6 Prompt interpolator: lib/reports/promptInterpolator.ts
- [ ] R.7 Report generation service: lib/reports/reportGenerationService.ts
- [ ] R.8a API: GET /api/reports
- [ ] R.8b API: GET /api/reports/[purchaseId]
- [ ] R.8c API: POST /api/reports/generate (admin only)
- [ ] R.8d API: POST /api/reports/purchase
- [ ] R.9 My Reports page: app/(dashboard)/reports/page.tsx
- [ ] R.10 Report reader: app/(dashboard)/reports/[purchaseId]/page.tsx
- [ ] R.11 Nav renamed from "My Cart" to "My Reports"
- [ ] R.12 Seed script: shadow work test report created in DB
- [ ] R.13 End-to-end manual test: all 10 steps pass

---

## AGENT NOTES

- Install commands needed across this task:
  ```bash
  npm install @google/generative-ai
  npm install react-markdown
  ```

- Never expose `geminiPrompt` to the client — it is admin IP. The GET
  `/api/reports` route explicitly omits it from the select.

- The admin email check (`env.ADMIN_EMAIL`) is used throughout. Keep it
  sourced from env, never hardcoded in component files.

- The Gemini call is synchronous in the current implementation. For
  production with many users, move to a background queue (Upstash QStash
  or similar). Add a TODO comment where relevant.

- All user-facing text on the reports page must pass the content standards
  from the PRD Section 6: no prediction language, warm and specific tone,
  non-mystical.

---

*Crossroads Compass task-reports-page.md v1.0 | March 2026 | Milosh*

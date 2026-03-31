# Cosmic Chat — AI Chat Feature Build Instructions
# Project: Crossroads Compass
# Stack: Next.js 14 App Router · TypeScript strict · Tailwind · Upstash Redis · Gemini API
# For: Claude Code CLI / Cursor (vibe coding mode)
# Last updated: March 2026

---

## WHAT YOU ARE BUILDING

A floating AI chatbot embedded in the dashboard that answers questions about the
user's Vedic astrology chart and Human Design. It knows the user's full chart data
and responds in plain, practical language — no predictions, no mysticism.

Free tier: 3 questions per day (Gemini Flash).
Premium tier: unlimited questions (Gemini Pro), full chart context.

Visual: floating button bottom-right corner of every dashboard page.
Expands to a slide-up chat panel. Mobile-first.

---

## BEFORE YOU START — READ THESE FILES

Read these files in full before writing any code:

```
lib/env.ts                    — env var patterns, never use process.env directly
lib/kv/client.ts              — Redis client singleton
lib/kv/keys.ts                — KV key builder functions (you will add to this)
lib/kv/helpers.ts             — kvGet, kvSet, kvDelete typed wrappers
lib/auth/helpers.ts           — getRequiredSession, requireTier
lib/astro/chartService.ts     — getOrCreateHDChart, getOrCreateVedicChart
types/index.ts                — shared types (you will add to this)
```

Do NOT read any other files unless a task explicitly tells you to.

---

## AGENT RULES

1. Complete tasks in order. Do not skip ahead.
2. After each task, add `// STATUS: done | CHAT.X` at the top of every file you touched.
3. If you hit a DECISION NEEDED block, stop and surface it as a comment. Do not guess.
4. Never cast to `any`. If a type is unknown, add a TODO comment and use `unknown`.
5. Never import from `process.env` — always use `lib/env.ts`.
6. Never throw unhandled errors to the client — always return typed error responses.
7. Keep all Gemini prompt content server-side only. Never expose prompt strings to client.

---

## TASK CHAT.1 — Environment variables

**Files to touch:** `lib/env.ts`, `.env.local`, `.env.example`

**Do:**

Add these vars to `.env.local` (fill in real values) and `.env.example` (empty values):

```
GEMINI_API_KEY=
GEMINI_MODEL_PRO=gemini-1.5-pro-latest
GEMINI_MODEL_FLASH=gemini-1.5-flash-latest
```

Add to the Zod schema in `lib/env.ts`:

```typescript
GEMINI_API_KEY:      z.string().min(1),
GEMINI_MODEL_PRO:    z.string().default('gemini-1.5-pro-latest'),
GEMINI_MODEL_FLASH:  z.string().default('gemini-1.5-flash-latest'),
```

Install the Gemini SDK:

```bash
npm install @google/generative-ai
```

**Done when:** `npm run dev` starts, `env.GEMINI_API_KEY` resolves without error.

---

## TASK CHAT.2 — Shared types

**Files to touch:** `types/index.ts`

**Do:**

Add these types. Do not modify any existing types.

```typescript
// ─── Chat types ──────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string  // ISO string
}

export interface ChatSession {
  messages: ChatMessage[]
}

export interface ChatRequest {
  message: string
  history: Array<{ role: ChatRole; content: string }>
}

export interface ChatResponse {
  response: string
  remaining: number | null   // null = unlimited (premium)
  resetAt: string | null     // ISO string, null if unlimited
  tier: SubscriptionTier
}

export interface ChatRateLimitResponse {
  error: 'RATE_LIMITED'
  remaining: 0
  resetAt: string
  upgradeMessage: string
}

export interface ChatErrorResponse {
  error: string
  detail?: string
}
```

**Done when:** `types/index.ts` compiles with zero TypeScript errors.

---

## TASK CHAT.3 — KV key additions

**Files to touch:** `lib/kv/keys.ts`

**Do:**

Add these entries to the `kvKeys` object. Do not change existing entries.

```typescript
// Chat
chatRateLimit:  (userId: string) => `chat:ratelimit:${userId}`,
chatContext:    (userId: string) => `chat:context:${userId}`,
blueprintGlimpse: (userId: string) => `report:glimpse:${userId}`,
```

**Done when:** file compiles, all three keys exported.

---

## TASK CHAT.4 — Gemini client

**Files to create:** `lib/ai/geminiClient.ts`

**Do:**

Create the directory `lib/ai/` if it does not exist.

```typescript
// STATUS: pending | CHAT.4
// Server-only. Never import this file from a client component.

import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/lib/env'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export class GeminiError extends Error {
  constructor(
    public readonly code: 'EMPTY_RESPONSE' | 'API_ERROR' | 'RATE_LIMITED',
    message: string
  ) {
    super(message)
    this.name = 'GeminiError'
  }
}

/**
 * Generate a single response from Gemini.
 * model: 'pro'   = gemini-1.5-pro-latest   (premium users)
 * model: 'flash' = gemini-1.5-flash-latest  (free tier, cron jobs)
 *
 * Never expose systemInstruction or prompt content in error responses.
 */
export async function geminiGenerate(
  model: 'pro' | 'flash',
  userPrompt: string,
  systemInstruction?: string
): Promise<string> {
  const modelName = model === 'pro' ? env.GEMINI_MODEL_PRO : env.GEMINI_MODEL_FLASH
  const m = genAI.getGenerativeModel({ model: modelName })

  try {
    const result = await m.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      ...(systemInstruction && {
        systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
      }),
    })

    const text = result.response.text()
    if (!text?.trim()) {
      throw new GeminiError('EMPTY_RESPONSE', 'Model returned empty content')
    }
    return text.trim()
  } catch (err) {
    // Log server-side only — never forward raw Gemini errors to client
    console.error('[geminiGenerate] model=%s error=%s', modelName, String(err))
    if (err instanceof GeminiError) throw err
    throw new GeminiError('API_ERROR', 'Generation failed')
  }
}
```

**Done when:** file compiles. Do not call `geminiGenerate` yet.

---

## TASK CHAT.5 — Content rules

**Files to create:** `lib/ai/contentRules.ts`

**Do:**

```typescript
// STATUS: pending | CHAT.5
// Injected into every Gemini prompt as the system instruction.
// These rules enforce the product's non-prediction, practical framing philosophy.
// Server-only. Never expose this string to the client.

export const CONTENT_RULES = `
You are Compass, an AI guide for Crossroads Compass — a personal navigation platform
combining Vedic astrology (Jyotish, Parashara system) and Human Design.

Your role is practical self-understanding, not prediction or entertainment.

ABSOLUTE RULES — violations are unacceptable:
1. NEVER use prediction language. Banned phrases: "you will", "this will cause",
   "this means you will", "you are going to", "this guarantees", "you must",
   "destined to", "fated to", "cannot escape", "inevitable".
2. ALWAYS use pattern-recognition framing: "this period tends to...",
   "this placement often correlates with...", "many people with this
   configuration find that...", "you may notice...".
3. ALWAYS cite the specific placement when making a claim.
   CORRECT: "Your 10th lord Saturn in the 6th house often correlates with..."
   WRONG:   "Saturn indicates career challenges."
4. Every response ends with one concrete practical implication or action question.
5. Tone: warm, specific, grounded. Not mystical. Not clinical. Not generic.
6. Define astrological terms on first use in a session.
7. NEVER comment on health, medical conditions, or mortality.
8. NEVER make claims about absolute fate or destiny.
9. Keep responses concise: 3–5 sentences for simple questions,
   2–3 short paragraphs maximum for complex ones.
10. If you don't have enough chart data to answer properly, say so clearly
    and explain what information would help.
`.trim()

export const BANNED_PHRASES = [
  'you will', 'this will cause', 'this means you will',
  'you are going to', 'this guarantees', 'you must',
  'destined to', 'fated to', 'cannot escape', 'inevitable',
] as const
```

**Done when:** file compiles, `CONTENT_RULES` exported as a string.

---

## TASK CHAT.6 — Chart context builder

**Files to create:** `lib/ai/chartContextBuilder.ts`

**Do:**

This function builds the plain-text chart summary that gets injected into every
chat system prompt. It must handle partial data gracefully — vedicChart may be null
if it is still generating.

```typescript
// STATUS: pending | CHAT.6
// Builds the chart context string injected into Gemini system prompts.
// Server-only. Never expose combined context strings to the client.

import type { HDChartData, VedicChartData, SubscriptionTier } from '@/types'

function buildHDLines(hd: HDChartData): string[] {
  const lines: string[] = ['HUMAN DESIGN:']
  if (hd.type)             lines.push(`  Type: ${hd.type}`)
  if (hd.strategy)         lines.push(`  Strategy: ${hd.strategy}`)
  if (hd.authority)        lines.push(`  Authority: ${hd.authority}`)
  if (hd.profile)          lines.push(`  Profile: ${hd.profile}`)
  if (hd.incarnationCross) lines.push(`  Incarnation Cross: ${hd.incarnationCross}`)
  if (Array.isArray(hd.definedCenters) && hd.definedCenters.length > 0)
    lines.push(`  Defined centers: ${hd.definedCenters.join(', ')}`)
  if (Array.isArray(hd.undefinedCenters) && hd.undefinedCenters.length > 0)
    lines.push(`  Undefined centers: ${hd.undefinedCenters.join(', ')}`)
  return lines
}

function buildVedicLines(vedic: VedicChartData): string[] {
  const lines: string[] = ['VEDIC ASTROLOGY (Parashara system):']
  if (vedic.lagnaSignNumber)
    lines.push(`  Lagna (Ascendant): Sign ${vedic.lagnaSignNumber}`)
  if (Array.isArray(vedic.planets)) {
    lines.push('  Planetary placements:')
    for (const p of vedic.planets) {
      lines.push(`    ${p.planet}: Sign ${p.signNumber}, ${p.degreeInSign}° in sign`)
    }
  }
  if (vedic.currentDasha)
    lines.push(`  Current Mahadasha: ${vedic.currentDasha.planet} (${vedic.currentDasha.startDate} – ${vedic.currentDasha.endDate})`)
  if (vedic.currentAntardasha)
    lines.push(`  Current Antardasha: ${vedic.currentAntardasha.planet}`)
  return lines
}

/**
 * Builds the system prompt context block for a given user's tier.
 *
 * FREE tier: type, strategy, authority, lagna, current dasha only.
 *            Shallow context encourages upgrade naturally.
 * PREMIUM:   Full chart — all placements, all defined/undefined centers, full dasha.
 */
export function buildChatContext(
  tier: SubscriptionTier,
  hd: HDChartData,
  vedic: VedicChartData | null
): string {
  if (tier === 'FREE') {
    const hdSummary = [
      `Human Design Type: ${hd.type ?? 'unknown'}.`,
      `Strategy: ${hd.strategy ?? 'unknown'}.`,
      `Authority: ${hd.authority ?? 'unknown'}.`,
    ].join(' ')

    const vedicSummary = vedic
      ? [
          `Lagna: Sign ${vedic.lagnaSignNumber ?? 'unknown'}.`,
          vedic.currentDasha ? `Current Mahadasha: ${vedic.currentDasha.planet}.` : '',
        ].filter(Boolean).join(' ')
      : 'Vedic chart is still being calculated.'

    return [
      'USER CHART CONTEXT (partial — free tier):',
      hdSummary,
      vedicSummary,
      '',
      'INSTRUCTION: You have limited chart data for this user. Answer what you can.',
      'When the question requires deeper chart analysis, respond with what you know,',
      'then end naturally with: "Your full Life Blueprint goes much deeper on this —',
      'it includes [specific relevant section]." Do not say "free tier" or "upgrade".',
    ].join('\n')
  }

  // Premium: full context
  const hdLines = buildHDLines(hd)
  const vedicLines = vedic ? buildVedicLines(vedic) : ['VEDIC ASTROLOGY: still calculating.']

  return [
    'USER CHART CONTEXT (complete):',
    ...vedicLines,
    '',
    ...hdLines,
  ].join('\n')
}
```

**Done when:** file compiles, function handles null vedicChart without throwing.

---

## TASK CHAT.7 — Rate limiter

**Files to create:** `lib/ai/chatRateLimiter.ts`

**Do:**

```typescript
// STATUS: pending | CHAT.7

import { kv } from '@/lib/kv/client'
import { kvKeys } from '@/lib/kv/keys'
import type { SubscriptionTier } from '@/types'

const FREE_DAILY_LIMIT = 3
const SECONDS_PER_DAY  = 86400

export interface RateLimitResult {
  allowed:   boolean
  remaining: number        // 0 if blocked
  resetAt:   Date
}

/**
 * Check and increment the rate limit counter for a user.
 * Premium users always pass through — no Redis call made.
 * Uses atomic INCR + EXPIRE pattern for correctness under concurrency.
 */
export async function checkAndIncrementRateLimit(
  userId: string,
  tier: SubscriptionTier
): Promise<RateLimitResult> {
  // Premium: unlimited, skip Redis entirely
  if (tier !== 'FREE') {
    return {
      allowed:   true,
      remaining: Infinity as unknown as number,
      resetAt:   new Date(0),
    }
  }

  const key = kvKeys.chatRateLimit(userId)

  // Atomic increment
  const count = await kv.incr(key)

  // Set TTL only on first increment (avoids resetting on each call)
  if (count === 1) {
    await kv.expire(key, SECONDS_PER_DAY)
  }

  // Get remaining TTL to compute resetAt
  const ttl     = await kv.ttl(key)
  const resetAt = new Date(Date.now() + Math.max(ttl, 0) * 1000)

  if (count > FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, resetAt }
  }

  return {
    allowed:   true,
    remaining: FREE_DAILY_LIMIT - count,
    resetAt,
  }
}

/**
 * Read-only check — does not increment. Use for UI state (show counter).
 */
export async function getRateLimitStatus(
  userId: string,
  tier: SubscriptionTier
): Promise<RateLimitResult> {
  if (tier !== 'FREE') {
    return { allowed: true, remaining: Infinity as unknown as number, resetAt: new Date(0) }
  }

  const key   = kvKeys.chatRateLimit(userId)
  const raw   = await kv.get<number>(key)
  const count = raw ?? 0
  const ttl   = await kv.ttl(key)
  const resetAt = new Date(Date.now() + Math.max(ttl, 0) * 1000)

  return {
    allowed:   count < FREE_DAILY_LIMIT,
    remaining: Math.max(0, FREE_DAILY_LIMIT - count),
    resetAt,
  }
}
```

**Done when:** both functions compile, FREE tier correctly limited at 3/day.

---

## TASK CHAT.8 — Chat API route

**Files to create:** `app/api/chat/route.ts`

**Do:**

```typescript
// STATUS: pending | CHAT.8

import { NextRequest, NextResponse }    from 'next/server'
import { z }                             from 'zod'
import { getRequiredSession }            from '@/lib/auth/helpers'
import { checkAndIncrementRateLimit }    from '@/lib/ai/chatRateLimiter'
import { buildChatContext }              from '@/lib/ai/chartContextBuilder'
import { geminiGenerate, GeminiError }   from '@/lib/ai/geminiClient'
import { CONTENT_RULES }                 from '@/lib/ai/contentRules'
import { getOrCreateHDChart,
         getOrCreateVedicChart }         from '@/lib/astro/chartService'
import prisma                            from '@/lib/prisma'
import type { ChatResponse,
              ChatRateLimitResponse,
              ChatErrorResponse }        from '@/types'

// ─── Request validation ───────────────────────────────────────────────────────

const historyItemSchema = z.object({
  role:    z.enum(['user', 'assistant']),
  content: z.string().max(2000),
})

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(historyItemSchema).max(20).default([]),
})

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Auth
  let session: Awaited<ReturnType<typeof getRequiredSession>>
  try {
    session = await getRequiredSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json<ChatErrorResponse>(
      { error: 'Invalid JSON body' }, { status: 400 }
    )
  }

  const parsed = chatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ChatErrorResponse>(
      { error: 'Invalid request', detail: parsed.error.message },
      { status: 400 }
    )
  }

  const { message, history } = parsed.data

  // 3. Load user + birth profile
  const user = await prisma.user.findUnique({
    where:   { id: session.user.id },
    include: { birthProfile: true },
  })

  if (!user) {
    return NextResponse.json<ChatErrorResponse>(
      { error: 'User not found' }, { status: 404 }
    )
  }

  if (!user.birthProfile) {
    return NextResponse.json<ChatErrorResponse>(
      { error: 'Birth profile required to use chat.' }, { status: 400 }
    )
  }

  // 4. Rate limit (increments counter — do this before expensive work)
  const rateLimit = await checkAndIncrementRateLimit(user.id, user.subscriptionTier)

  if (!rateLimit.allowed) {
    return NextResponse.json<ChatRateLimitResponse>(
      {
        error:          'RATE_LIMITED',
        remaining:      0,
        resetAt:        rateLimit.resetAt.toISOString(),
        upgradeMessage: 'You have used your 3 free questions for today. Unlock unlimited conversations in your full Life Blueprint.',
      },
      { status: 429 }
    )
  }

  // 5. Fetch chart data (in parallel, vedicChart may be null)
  const [hdChart, vedicChart] = await Promise.all([
    getOrCreateHDChart(user.id, user.birthProfile),
    getOrCreateVedicChart(user.id, user.birthProfile).catch(() => null),
  ])

  // 6. Build system prompt
  const chartContext  = buildChatContext(user.subscriptionTier, hdChart, vedicChart)
  const systemPrompt  = `${CONTENT_RULES}\n\n${chartContext}`

  // 7. Build conversation prompt (prepend history)
  const conversationLines = [
    ...history.map(h =>
      `${h.role === 'user' ? 'User' : 'Compass'}: ${h.content}`
    ),
    `User: ${message}`,
    'Compass:',
  ]
  const fullPrompt = conversationLines.join('\n\n')

  // 8. Pick model: Flash for free, Pro for premium
  const model = user.subscriptionTier === 'FREE' ? 'flash' : 'pro'

  // 9. Generate
  let responseText: string
  try {
    responseText = await geminiGenerate(model, fullPrompt, systemPrompt)
  } catch (err) {
    console.error('[chat/route] generation error:', err)
    if (err instanceof GeminiError && err.code === 'RATE_LIMITED') {
      return NextResponse.json<ChatErrorResponse>(
        { error: 'AI service temporarily busy. Please try again in a moment.' },
        { status: 503 }
      )
    }
    return NextResponse.json<ChatErrorResponse>(
      { error: 'Could not generate a response. Please try again.' },
      { status: 500 }
    )
  }

  // 10. Return response
  const isUnlimited = user.subscriptionTier !== 'FREE'

  return NextResponse.json<ChatResponse>({
    response:  responseText,
    remaining: isUnlimited ? null : rateLimit.remaining,
    resetAt:   isUnlimited ? null : rateLimit.resetAt.toISOString(),
    tier:      user.subscriptionTier,
  })
}
```

**Done when:**
- POST with valid session + birth profile returns `{ response, remaining, tier }`
- 429 returned on 4th FREE tier question
- 401 returned without session

---

## TASK CHAT.9 — Rate limit status API route

**Files to create:** `app/api/chat/status/route.ts`

**Do:**

The frontend polls this on mount to show the correct counter state.
Read-only — does not increment.

```typescript
// STATUS: pending | CHAT.9

import { NextResponse }             from 'next/server'
import { getRequiredSession }       from '@/lib/auth/helpers'
import { getRateLimitStatus }       from '@/lib/ai/chatRateLimiter'
import prisma                        from '@/lib/prisma'

export async function GET(): Promise<NextResponse> {
  let session: Awaited<ReturnType<typeof getRequiredSession>>
  try {
    session = await getRequiredSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { subscriptionTier: true },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const status = await getRateLimitStatus(session.user.id, user.subscriptionTier)

  return NextResponse.json({
    tier:      user.subscriptionTier,
    remaining: status.remaining,
    resetAt:   status.resetAt.toISOString(),
    unlimited: user.subscriptionTier !== 'FREE',
  })
}
```

**Done when:** GET returns current counter for user without modifying it.

---

## TASK CHAT.10 — Chat hook (client-side state)

**Files to create:** `hooks/useCosmicChat.ts`

**Do:**

Create a `hooks/` folder at the project root if it does not exist.

This hook owns all chat state. The UI component imports only this hook.

```typescript
// STATUS: pending | CHAT.10
'use client'

import { useState, useCallback, useRef } from 'react'
import type { ChatMessage, ChatRole }     from '@/types'

interface UseChatOptions {
  initialRemaining?: number | null
  initialTier?: string
}

interface SendResult {
  ok:        boolean
  limited:   boolean
  errorMsg?: string
}

export function useCosmicChat(options: UseChatOptions = {}) {
  const [messages,   setMessages]   = useState<ChatMessage[]>([])
  const [loading,    setLoading]    = useState(false)
  const [remaining,  setRemaining]  = useState<number | null>(options.initialRemaining ?? null)
  const [tier,       setTier]       = useState(options.initialTier ?? 'FREE')
  const [limited,    setLimited]    = useState(false)
  const [limitReset, setLimitReset] = useState<Date | null>(null)
  const [error,      setError]      = useState<string | null>(null)

  // Keep history in a ref — not state — so sendMessage closure always sees latest
  const historyRef = useRef<Array<{ role: ChatRole; content: string }>>([])

  const addMessage = useCallback((role: ChatRole, content: string): ChatMessage => {
    const msg: ChatMessage = {
      id:        crypto.randomUUID(),
      role,
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, msg])
    historyRef.current = [...historyRef.current, { role, content }]
    return msg
  }, [])

  const sendMessage = useCallback(async (text: string): Promise<SendResult> => {
    if (loading)        return { ok: false, limited: false, errorMsg: 'Already loading' }
    if (!text.trim())   return { ok: false, limited: false, errorMsg: 'Empty message' }
    if (limited)        return { ok: false, limited: true }

    setError(null)
    setLoading(true)
    addMessage('user', text)

    // Keep only last 10 turns in history to limit token usage
    const history = historyRef.current.slice(-20).slice(0, -1)  // exclude the message we just added

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text, history }),
      })

      const data = await res.json()

      if (res.status === 429) {
        setLimited(true)
        setRemaining(0)
        if (data.resetAt) setLimitReset(new Date(data.resetAt))
        setLoading(false)
        return { ok: false, limited: true, errorMsg: data.upgradeMessage }
      }

      if (!res.ok) {
        const msg = data.error ?? 'Something went wrong. Please try again.'
        setError(msg)
        // Remove the user message we optimistically added
        setMessages(prev => prev.slice(0, -1))
        historyRef.current = historyRef.current.slice(0, -1)
        setLoading(false)
        return { ok: false, limited: false, errorMsg: msg }
      }

      addMessage('assistant', data.response)

      if (data.remaining !== null) setRemaining(data.remaining)
      if (data.tier)               setTier(data.tier)

      setLoading(false)
      return { ok: true, limited: false }

    } catch (err) {
      console.error('[useCosmicChat] fetch error:', err)
      const msg = 'Network error. Check your connection and try again.'
      setError(msg)
      setMessages(prev => prev.slice(0, -1))
      historyRef.current = historyRef.current.slice(0, -1)
      setLoading(false)
      return { ok: false, limited: false, errorMsg: msg }
    }
  }, [loading, limited, addMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
    historyRef.current = []
    setError(null)
    setLimited(false)
  }, [])

  return {
    messages,
    loading,
    remaining,
    tier,
    limited,
    limitReset,
    error,
    sendMessage,
    clearMessages,
  }
}
```

**Done when:** hook compiles, no TypeScript errors. Do not test UI yet.

---

## TASK CHAT.11 — Chat UI component

**Files to create:** `components/chat/CosmicChat.tsx`

**Do:**

Create `components/chat/` if it does not exist.

Design spec:
- Floating button: bottom-right corner, fixed position, amber/gold color from the design system
- Chat panel: slides up from bottom, 380px wide, 520px tall on desktop; full-width on mobile
- Dark background matching the dashboard's `cosmos` (#0d1220) color
- Cormorant Garamond display font for any headings, Instrument Sans for messages
- Amber (#c8873a) accent for user messages and the send button
- Smooth slide-up animation on open
- Auto-scroll to latest message
- Show remaining question count for FREE tier with a subtle counter
- On rate limit: show upgrade prompt inline inside the chat panel, not a modal

```typescript
// STATUS: pending | CHAT.11
'use client'

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react'
import { useCosmicChat }     from '@/hooks/useCosmicChat'
import type { ChatMessage }  from '@/types'

// ─── Sub-components ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div
      style={{
        display:       'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom:  '12px',
      }}
    >
      <div
        style={{
          maxWidth:     '82%',
          padding:      '10px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background:   isUser ? '#c8873a' : 'rgba(255,255,255,0.07)',
          color:        isUser ? '#1a0e00' : '#f0dca0',
          fontSize:     '14px',
          lineHeight:   '1.6',
          fontFamily:   '"Instrument Sans", sans-serif',
          border:       isUser ? 'none' : '1px solid rgba(200,135,58,0.2)',
          whiteSpace:   'pre-wrap',
          wordBreak:    'break-word',
        }}
      >
        {msg.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0 12px 4px' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width:           '6px',
            height:          '6px',
            borderRadius:    '50%',
            background:      '#c8873a',
            opacity:         0.6,
            animation:       `chatpulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function LimitedState({ resetAt, tier }: { resetAt: Date | null; tier: string }) {
  const resetStr = resetAt
    ? resetAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'tomorrow'

  return (
    <div
      style={{
        margin:       '12px',
        padding:      '16px',
        borderRadius: '12px',
        background:   'rgba(200,135,58,0.1)',
        border:       '1px solid rgba(200,135,58,0.3)',
        textAlign:    'center',
      }}
    >
      <p style={{ color: '#e8b96a', fontSize: '14px', margin: '0 0 8px', fontFamily: '"Instrument Sans", sans-serif' }}>
        3 free questions used today
      </p>
      <p style={{ color: '#a07040', fontSize: '13px', margin: '0 0 16px', fontFamily: '"Instrument Sans", sans-serif' }}>
        Resets at {resetStr}. Your Life Blueprint includes unlimited conversations.
      </p>
      <a
        href="/dashboard/account"
        style={{
          display:      'inline-block',
          padding:      '8px 20px',
          borderRadius: '8px',
          background:   '#c8873a',
          color:        '#1a0e00',
          fontSize:     '13px',
          fontWeight:   600,
          textDecoration: 'none',
          fontFamily:   '"Instrument Sans", sans-serif',
        }}
      >
        Unlock full access →
      </a>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CosmicChatProps {
  initialRemaining?: number | null
  initialTier?: string
}

export function CosmicChat({ initialRemaining, initialTier }: CosmicChatProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const {
    messages, loading, remaining, tier,
    limited, limitReset, error,
    sendMessage, clearMessages,
  } = useCosmicChat({ initialRemaining, initialTier })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading || limited) return
    setInput('')
    await sendMessage(text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isFreeTier  = tier === 'FREE'
  const questionsLeft = isFreeTier && remaining !== null ? remaining : null

  return (
    <>
      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes chatslideup {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes chatpulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40%           { transform: scale(1.2); opacity: 1;   }
        }
        @keyframes chatbounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        .cosmic-chat-btn:hover { transform: scale(1.08); }
        .cosmic-chat-btn       { transition: transform 0.15s ease; }
        .cosmic-send-btn:hover { background: #e8b96a !important; }
        .cosmic-send-btn       { transition: background 0.15s ease; }
        .cosmic-msg-input:focus { outline: none; border-color: rgba(200,135,58,0.5) !important; }
      `}</style>

      {/* ── Floating trigger button ── */}
      <button
        className="cosmic-chat-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open Compass chat'}
        style={{
          position:     'fixed',
          bottom:       '24px',
          right:        '24px',
          zIndex:       1000,
          width:        '52px',
          height:       '52px',
          borderRadius: '50%',
          background:   'linear-gradient(135deg, #c8873a, #e8b96a)',
          border:       'none',
          cursor:       'pointer',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          boxShadow:    '0 4px 20px rgba(200,135,58,0.4)',
        }}
      >
        {open ? (
          // Close icon
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="#1a0e00" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          // Sparkle/compass icon
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
              fill="#1a0e00" stroke="#1a0e00" strokeWidth="0.5"/>
          </svg>
        )}
        {/* Unread indicator (shown when closed and messages exist) */}
        {!open && messages.length > 0 && (
          <span style={{
            position:     'absolute',
            top:          '2px',
            right:        '2px',
            width:        '10px',
            height:       '10px',
            borderRadius: '50%',
            background:   '#f0dca0',
            border:       '2px solid #0d1220',
          }} />
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div
          style={{
            position:     'fixed',
            bottom:       '88px',
            right:        '24px',
            zIndex:       999,
            width:        'min(380px, calc(100vw - 32px))',
            height:       '520px',
            borderRadius: '16px',
            background:   '#0d1220',
            border:       '1px solid rgba(200,135,58,0.25)',
            display:      'flex',
            flexDirection: 'column',
            overflow:     'hidden',
            boxShadow:    '0 20px 60px rgba(0,0,0,0.6)',
            animation:    'chatslideup 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div style={{
            padding:    '14px 16px 12px',
            borderBottom: '1px solid rgba(200,135,58,0.15)',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <p style={{
                margin:     0,
                color:      '#f0dca0',
                fontSize:   '15px',
                fontWeight: 600,
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                letterSpacing: '0.02em',
              }}>
                Compass
              </p>
              <p style={{
                margin:     '2px 0 0',
                color:      '#c8873a',
                fontSize:   '11px',
                fontFamily: '"Instrument Sans", sans-serif',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                {isFreeTier && questionsLeft !== null
                  ? `${questionsLeft} question${questionsLeft !== 1 ? 's' : ''} remaining today`
                  : 'Unlimited · Navigator'
                }
              </p>
            </div>
            <button
              onClick={clearMessages}
              title="Clear conversation"
              style={{
                background: 'transparent',
                border:     'none',
                color:      'rgba(240,220,160,0.4)',
                cursor:     'pointer',
                fontSize:   '11px',
                fontFamily: '"Instrument Sans", sans-serif',
                padding:    '4px 8px',
              }}
            >
              Clear
            </button>
          </div>

          {/* Messages area */}
          <div style={{
            flex:       '1 1 0',
            overflowY:  'auto',
            padding:    '16px 12px 8px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(200,135,58,0.3) transparent',
          }}>
            {/* Welcome message */}
            {messages.length === 0 && !limited && (
              <div style={{
                textAlign:  'center',
                padding:    '20px 16px',
                color:      'rgba(240,220,160,0.5)',
                fontSize:   '13px',
                fontFamily: '"Instrument Sans", sans-serif',
                lineHeight: '1.7',
              }}>
                <p style={{ margin: '0 0 8px', fontSize: '22px' }}>✦</p>
                <p style={{ margin: 0 }}>
                  Ask me anything about your chart — dashas, placements, timing, or
                  what a transit means for you specifically.
                </p>
              </div>
            )}

            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {loading && <TypingIndicator />}

            {limited && (
              <LimitedState resetAt={limitReset} tier={tier} />
            )}

            {error && !loading && (
              <p style={{
                color:      'rgba(255,120,100,0.8)',
                fontSize:   '13px',
                fontFamily: '"Instrument Sans", sans-serif',
                textAlign:  'center',
                padding:    '8px',
                margin:     0,
              }}>
                {error}
              </p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          {!limited && (
            <div style={{
              padding:    '10px 12px 14px',
              borderTop:  '1px solid rgba(200,135,58,0.15)',
              display:    'flex',
              gap:        '8px',
              alignItems: 'flex-end',
              flexShrink: 0,
            }}>
              <textarea
                ref={inputRef}
                className="cosmic-msg-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your chart…"
                rows={1}
                disabled={loading}
                style={{
                  flex:       '1 1 0',
                  resize:     'none',
                  background: 'rgba(255,255,255,0.06)',
                  border:     '1px solid rgba(200,135,58,0.2)',
                  borderRadius: '10px',
                  padding:    '10px 12px',
                  color:      '#f0dca0',
                  fontSize:   '14px',
                  fontFamily: '"Instrument Sans", sans-serif',
                  lineHeight: '1.5',
                  maxHeight:  '96px',
                  overflowY:  'auto',
                  opacity:    loading ? 0.5 : 1,
                }}
                onInput={e => {
                  // Auto-resize textarea
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 96) + 'px'
                }}
              />
              <button
                className="cosmic-send-btn"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  flexShrink:   0,
                  width:        '38px',
                  height:       '38px',
                  borderRadius: '10px',
                  background:   loading || !input.trim() ? 'rgba(200,135,58,0.3)' : '#c8873a',
                  border:       'none',
                  cursor:       loading || !input.trim() ? 'not-allowed' : 'pointer',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 8L2 2l3 6-3 6 12-6z"
                    fill={loading || !input.trim() ? 'rgba(26,14,0,0.5)' : '#1a0e00'}/>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
```

**Done when:** component renders with no TypeScript errors, chat panel opens and closes.

---

## TASK CHAT.12 — Load initial rate limit state (server component helper)

**Files to create:** `lib/ai/getChatInitialState.ts`

**Do:**

The dashboard layout will call this to pass initial rate limit state as props to
`CosmicChat`, avoiding a loading flash on mount.

```typescript
// STATUS: pending | CHAT.12
// Server-only helper. Call from server components or route handlers.

import { getRateLimitStatus } from '@/lib/ai/chatRateLimiter'
import prisma                  from '@/lib/prisma'

export interface ChatInitialState {
  remaining:    number | null   // null = unlimited
  tier:         string
  resetAt:      string | null   // ISO string
}

export async function getChatInitialState(userId: string): Promise<ChatInitialState> {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { subscriptionTier: true },
  })

  if (!user) return { remaining: null, tier: 'FREE', resetAt: null }

  if (user.subscriptionTier !== 'FREE') {
    return { remaining: null, tier: user.subscriptionTier, resetAt: null }
  }

  const status = await getRateLimitStatus(userId, user.subscriptionTier)

  return {
    remaining: status.remaining,
    tier:      user.subscriptionTier,
    resetAt:   status.resetAt.toISOString(),
  }
}
```

**Done when:** function compiles, handles missing user gracefully.

---

## TASK CHAT.13 — Wire into dashboard layout

**Files to touch:** `app/(dashboard)/layout.tsx`

**Do:**

Import and render `CosmicChat` at the bottom of the layout. This makes the
chat available on every dashboard page.

Add to the layout server component:

```typescript
// Add these imports at the top:
import { getRequiredSession }    from '@/lib/auth/helpers'
import { getChatInitialState }   from '@/lib/ai/getChatInitialState'
import { CosmicChat }            from '@/components/chat/CosmicChat'

// Inside the layout component, before the closing tag, add:

// Fetch initial chat state server-side to avoid loading flash
const session      = await getRequiredSession()
const chatState    = await getChatInitialState(session.user.id)

// Add just before </body> or before the closing layout wrapper div:
<CosmicChat
  initialRemaining={chatState.remaining}
  initialTier={chatState.tier}
/>
```

**Important:** `CosmicChat` is a client component (`'use client'`). The layout
is a server component. This is the correct pattern — server component fetches
initial data, passes it as props to client component.

**Done when:** chat button appears on all dashboard pages, initial state loaded without flash.

---

## TASK CHAT.14 — Suggested questions (starter prompts)

**Files to touch:** `components/chat/CosmicChat.tsx`

**Do:**

When the message history is empty and the panel is open, show 3 tappable
starter prompts instead of (or below) the welcome message.

Add these starter prompts inside the component:

```typescript
const STARTER_PROMPTS = [
  'What does my current Dasha period mean for me?',
  'What should I know about my Human Design type?',
  'What areas of life are highlighted for me right now?',
]
```

Render them as clickable pill buttons when `messages.length === 0`:

```typescript
{messages.length === 0 && !limited && (
  <div style={{ padding: '0 4px 12px' }}>
    {STARTER_PROMPTS.map(prompt => (
      <button
        key={prompt}
        onClick={() => sendMessage(prompt)}
        disabled={loading}
        style={{
          display:      'block',
          width:        '100%',
          textAlign:    'left',
          background:   'rgba(200,135,58,0.08)',
          border:       '1px solid rgba(200,135,58,0.2)',
          borderRadius: '8px',
          padding:      '9px 12px',
          marginBottom: '8px',
          color:        'rgba(240,220,160,0.8)',
          fontSize:     '13px',
          fontFamily:   '"Instrument Sans", sans-serif',
          cursor:       loading ? 'not-allowed' : 'pointer',
          transition:   'background 0.15s',
        }}
        onMouseEnter={e => {
          if (!loading) e.currentTarget.style.background = 'rgba(200,135,58,0.15)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(200,135,58,0.08)'
        }}
      >
        {prompt}
      </button>
    ))}
  </div>
)}
```

**Done when:** starter prompts appear on empty state, clicking one sends the message.

---

## COMPLETION CHECKLIST

Run through each item before marking the feature done.

**Backend**
- [ ] CHAT.1  — `GEMINI_API_KEY` in env, Zod schema updated, `@google/generative-ai` installed
- [ ] CHAT.2  — chat types in `types/index.ts`
- [ ] CHAT.3  — KV keys added (`chatRateLimit`, `chatContext`, `blueprintGlimpse`)
- [ ] CHAT.4  — `lib/ai/geminiClient.ts` — `geminiGenerate` with error handling
- [ ] CHAT.5  — `lib/ai/contentRules.ts` — `CONTENT_RULES` system prompt string
- [ ] CHAT.6  — `lib/ai/chartContextBuilder.ts` — FREE (shallow) vs PREMIUM (full) context
- [ ] CHAT.7  — `lib/ai/chatRateLimiter.ts` — 3/day FREE, unlimited premium, atomic INCR
- [ ] CHAT.8  — `app/api/chat/route.ts` — POST handler, all error codes handled
- [ ] CHAT.9  — `app/api/chat/status/route.ts` — GET read-only counter
- [ ] CHAT.12 — `lib/ai/getChatInitialState.ts` — server helper for SSR initial state

**Frontend**
- [ ] CHAT.10 — `hooks/useCosmicChat.ts` — all state, send/clear, history ref
- [ ] CHAT.11 — `components/chat/CosmicChat.tsx` — full UI, animations, limit state
- [ ] CHAT.13 — dashboard layout wired up, `CosmicChat` rendered with SSR props
- [ ] CHAT.14 — starter prompts on empty state

**Manual QA steps after completion**
- [ ] Send a message as FREE tier user — response received
- [ ] Send 3 messages — 4th blocked with upgrade prompt
- [ ] Reload after limit — counter persists (Redis-backed)
- [ ] Switch to CORE/VIP account — no counter shown, unlimited working
- [ ] Send message with no birth profile — get clear 400 error message, not a crash
- [ ] Kill network mid-request — error message shown, user message removed from history
- [ ] Open on mobile — panel is full-width, input usable on iOS/Android keyboard
- [ ] Check dashboard on all pages — chat button present, does not obscure page content

---

## OPEN DECISIONS

These need Milosh's answer before the affected code can be finalised.

```
DECISION NEEDED
Task: CHAT.8
File: app/api/chat/route.ts
Question: Should conversation history be persisted to Redis (7-day TTL)
  so users can continue conversations across page reloads and browser sessions?
  Current impl: history is in-memory (lost on page reload).
  To persist: store historyRef.current to KV on each message, load on mount.
  Cost: negligible. Privacy note: chat history would be stored server-side.
Blocking: nothing — in-memory works for MVP. Persistence is a UX upgrade.
Raised: 2026-03-30
Resolved: [fill in]
```

```
DECISION NEEDED
Task: CHAT.8
File: app/api/chat/route.ts
Question: Premium users currently have no hard message limit.
  Recommend: soft ceiling of 50 messages/day with a warning at 40,
  no hard block — to prevent abuse while not frustrating paying users.
  Implement as: separate KV key `chat:premium:ratelimit:{userId}` checked in route.
Blocking: nothing for MVP. Add before scaling.
Raised: 2026-03-30
Resolved: [fill in]
```

```
DECISION NEEDED
Task: CHAT.11
File: components/chat/CosmicChat.tsx
Question: The upgrade CTA in LimitedState links to /dashboard/account.
  Confirm this is the correct path for the subscription upgrade flow.
  If the upgrade page is at a different route, update the href.
Blocking: upgrade CTA in rate-limited state.
Raised: 2026-03-30
Resolved: [fill in]
```

---

## COST REFERENCE

Gemini 1.5 Flash (free tier, 3 questions/day):
  ~500 tokens input (context + history) + ~150 tokens output per message
  Cost per question: ~$0.00005
  Cost per free user per day: ~$0.00015 (effectively free)

Gemini 1.5 Pro (premium, unlimited):
  ~1200 tokens input + ~250 tokens output per message
  Cost per message: ~$0.007
  50 messages/day × 30 days = 1500 messages × $0.007 = ~$10.50/month at max usage
  At $19.99/mo subscription: margin protected at ~$9.49+ even for heavy users

Recommendation: add the soft 50-message/day premium ceiling before scaling past 500 users.

---

*Crossroads Compass — CHAT-FEATURE-BUILD.md v1.0 | March 2026*

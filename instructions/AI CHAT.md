# Cosmic Chat — AI Chat Feature Implementation
# Project: Crossroads Compass
# Implemented: March 2026

---

## WHAT WAS BUILT

A floating AI chatbot embedded in all dashboard pages that answers questions about
the user's Vedic astrology chart and Human Design. The assistant ("Compass") knows
the user's full chart data and responds in plain, practical language — no predictions,
no mysticism.

- **Free tier**: 3 questions per day (Gemini Flash)
- **Premium tier (CORE/VIP)**: unlimited questions (Gemini Pro), full chart context, soft 50/day warning at 40
- **History**: conversation persists across page reloads via Redis (7-day TTL)
- **Visual**: floating amber button bottom-right corner of every dashboard page, slides up to a 380×520px chat panel

---

## OPEN DECISIONS (RESOLVED)

| Decision | Resolution |
|---|---|
| Persist chat history across reloads? | Yes — Redis, 7-day TTL |
| Premium soft ceiling? | Yes — warn at 40 messages/day, no hard block at 50 |
| Upgrade CTA route? | `/subscribe` |

---

## FILES CREATED

### `lib/auth/helpers.ts` _(new — not in original spec)_
Thin auth wrapper for API routes. The spec referenced this file but it didn't exist.
The project's actual auth lives in `lib/auth/appContext.ts` (`getAppUserContext`), but
API routes need a simpler throw-on-unauthenticated pattern.

```
getRequiredSession() → wraps auth() from NextAuth, throws if no session
```

### `lib/ai/geminiClient.ts`
Chat-specific Gemini client. Kept separate from the existing `lib/gemini/client.ts`
(which handles report generation) to avoid coupling.

Key points:
- `geminiGenerate(model, userPrompt, systemInstruction)` — `model` is `'pro' | 'flash'`
- Uses `GEMINI_MODEL_PRO` / `GEMINI_MODEL_FLASH` env vars (both default to `gemini-2.5-flash`)
- **Critical**: `systemInstruction` must be passed to `getGenerativeModel()`, NOT inside `generateContent()` — this was the initial bug that caused "Could not generate a response"
- `GeminiChatError` class with codes: `EMPTY_RESPONSE | API_ERROR | RATE_LIMITED`
- Lazy client init via `getClient()` to handle missing API key gracefully

### `lib/ai/contentRules.ts`
System prompt string injected into every Gemini call. Server-only — never exposed to client.

- `CONTENT_RULES` — full system prompt defining Compass persona, banned prediction phrases, framing requirements, response length rules
- `BANNED_PHRASES` — const array of forbidden phrases ("you will", "destined to", etc.)

### `lib/ai/chartContextBuilder.ts`
Builds the chart summary injected after `CONTENT_RULES` in the system prompt.
Two modes based on subscription tier.

**Adaptations from spec** — the spec used a simplified `VedicChartData` type.
The actual type is `VedicChartCalculations` from `openastrology-library` with a different shape:
- `vedic.planets` is a **dict** keyed by planet name (`{ sun: PlanetPosition, moon: ... }`) — NOT an array
- `vedic.ascendant.sign` is a string (`'aries'`, `'scorpio'`) — NOT a sign number
- No `lagnaSignNumber` on the chart directly — derived from `ascendant.sign`
- Dasha accessed via `getChartCurrentDasha(vedic)` from `chartService.ts` → `{ mahaDasha, antarDasha }`
- `PlanetDasha.planet` is the planet name string (not `planetName`)

```
FREE tier:   HD type + strategy + authority + lagna sign + current mahadasha only
             Ends with soft nudge toward Life Blueprint (no "upgrade" or "free tier" wording)
CORE/VIP:    Full planetary placements (all 9 planets), houses, retrogrades,
             mahadasha + antardasha with year range, all HD centers defined/undefined
```

### `lib/ai/chatRateLimiter.ts`
Redis-backed rate limiting with null-safe guards (kv can be null in local dev without Redis).

```
checkAndIncrementRateLimit(userId, tier)  — atomic INCR+EXPIRE, FREE: 3/day
getRateLimitStatus(userId, tier)          — read-only, used for UI counter
checkPremiumSoftLimit(userId)             — CORE/VIP: warn at 40/day, no block at 50
```

All functions return gracefully if `kv === null` (local dev without Redis configured).

### `lib/ai/getChatInitialState.ts`
Server helper called from the dashboard layout to pre-load initial state for SSR,
avoiding a loading flash on mount.

Returns: `{ remaining, tier, resetAt, history }` — includes persisted Redis history.

### `app/api/chat/route.ts`
Main POST handler. Full request flow:

1. Auth via `getRequiredSession()`
2. Zod validation — message (max 1000 chars), history (max 20 items, each max 2000 chars)
3. Load user + birthProfile from DB
4. Load subscription tier via `db.subscription.findUnique` (**not** `user.subscriptionTier` — tier lives in a separate `Subscription` model)
5. Rate limit check + increment (before expensive work)
6. Fetch HD + Vedic charts in parallel (`Promise.all`, vedicChart failures caught → null)
7. Build system prompt: `CONTENT_RULES + chartContext`
8. Merge server history (Redis) with client history (client takes precedence)
9. Build conversation string (history + new message + `Compass:` suffix)
10. Pick model: FREE → `flash`, CORE/VIP → `pro`
11. Generate with Gemini
12. Persist updated history to Redis (trimmed to 20 turns, 7-day TTL)
13. Check premium soft ceiling for CORE/VIP users
14. Return `ChatResponse` with remaining count, resetAt, tier, optional warning flag

Error responses:
- `401` — not authenticated
- `400` — invalid JSON / missing birth profile
- `404` — user not found
- `429` — rate limited (FREE tier at 4th question), with `upgradeMessage`
- `503` — Gemini rate limited
- `500` — generation failed

### `app/api/chat/status/route.ts`
GET route — read-only counter check. Called on mount to show current counter state
without incrementing. Also returns persisted history so the hook can hydrate on load.

### `hooks/useCosmicChat.ts`
Client-side state hook. Owns all chat state so the UI component stays thin.

```
messages, loading, remaining, tier, limited, limitReset, error  — state
sendMessage(text)   — fetch POST /api/chat, handles all error cases
clearMessages()     — reset conversation (does NOT clear Redis — only local state)
```

Key implementation details:
- `historyRef` (useRef) holds the history sent to the API — avoids stale closure issues
- Optimistic user message added immediately; removed on error
- `initialMessages` prop hydrates both `messages` state and `historyRef` from SSR
- History trimmed to last 20 turns before sending to API

### `components/chat/CosmicChat.tsx`
Full UI component. Client component (`'use client'`).

Sub-components:
- `MessageBubble` — user (amber, right-aligned) vs assistant (glass, left-aligned) bubbles
- `TypingIndicator` — 3 animated amber dots with staggered pulse
- `LimitedState` — inline rate limit notice with reset time + `/subscribe` CTA

Main features:
- Floating 52px amber/gold circular button, bottom-right, fixed position, z-index 1000
- Unread indicator dot when panel is closed and messages exist
- Slide-up animation (`chatslideup` keyframe) on panel open
- Auto-scroll to latest message via `bottomRef`
- Auto-focus textarea when panel opens
- Auto-resize textarea (max 96px height)
- Enter to send, Shift+Enter for newline
- Starter prompts shown on empty state (3 tappable pill buttons)
- `questionsLeft` counter shown in header subtitle for FREE tier
- All styles via inline style objects (no Tailwind classes) to avoid CSS conflicts

Starter prompts:
```
"What does my current Dasha period mean for me?"
"What should I know about my Human Design type?"
"What areas of life are highlighted for me right now?"
```

---

## FILES MODIFIED

### `lib/env.ts`
Added two new optional env vars with defaults:
```
GEMINI_MODEL_PRO:   default "gemini-2.5-flash"
GEMINI_MODEL_FLASH: default "gemini-2.5-flash"
```
Both default to `gemini-2.5-flash` — the same model already working in the project.
Override in `.env.local` to use different models per tier in production.

### `lib/kv/keys.ts`
Added 5 new key builders and a `KV_TTL_CHAT` constant object:
```
chatRateLimit(userId)                → chat:ratelimit:{userId}
chatHistory(userId)                  → chat:history:{userId}
chatContext(userId)                  → chat:context:{userId}
blueprintGlimpse(userId)             → report:glimpse:{userId}
chatPremiumLimit(userId)             → chat:premium:ratelimit:{userId}

KV_TTL_CHAT.RATE_LIMIT_SECONDS      = 86400  (24h)
KV_TTL_CHAT.HISTORY_SECONDS         = 604800 (7 days)
```

### `types/index.ts`
Added 7 new types at the bottom of the file:
```typescript
ChatRole               — 'user' | 'assistant'
ChatMessage            — { id, role, content, createdAt }
ChatSession            — { messages: ChatMessage[] }
ChatRequest            — { message, history }
ChatResponse           — { response, remaining, resetAt, tier, warning? }
ChatRateLimitResponse  — { error: 'RATE_LIMITED', remaining: 0, resetAt, upgradeMessage }
ChatErrorResponse      — { error, detail? }
```

### `app/(app)/layout.tsx`
Added CosmicChat to the shared authenticated layout so it appears on every dashboard page.

```typescript
// Added imports:
import { CosmicChat }           from "@/components/chat/CosmicChat"
import { getChatInitialState }  from "@/lib/ai/getChatInitialState"

// Added inside component (reuses existing ctx.userId):
const chatState = await getChatInitialState(ctx.userId)

// Added before closing </div>:
<CosmicChat
  initialRemaining={chatState.remaining}
  initialTier={chatState.tier}
  initialMessages={chatState.history}
/>
```

Note: `CosmicChat` is a client component; the layout is a server component.
This is the correct Next.js pattern — server fetches initial data, passes as props.

### `.env.local`
Added:
```
GEMINI_MODEL_PRO=gemini-2.5-flash
GEMINI_MODEL_FLASH=gemini-2.5-flash
```

### `.env.example`
Added same vars with explanatory comment.

---

## CODEBASE ADAPTATIONS (spec vs reality)

The spec (`instructions/CHAT-FEATURE-BUILD.md`) was written with assumptions that
differed from the actual codebase. Here's what was adapted:

| Spec assumption | Actual codebase | What was done |
|---|---|---|
| `lib/auth/helpers.ts` exists | Doesn't exist — auth via `getAppUserContext()` in `lib/auth/appContext.ts` | Created `lib/auth/helpers.ts` with `getRequiredSession()` |
| `user.subscriptionTier` field | Tier is in separate `Subscription` model | Queried `db.subscription.findUnique` in API route |
| `kv` always available | `kv` is `Redis \| null` — null without Redis in local dev | Every kv call null-guarded; rate limiting skipped if null |
| `app/(dashboard)/layout.tsx` | Actual path is `app/(app)/layout.tsx` | Wired into `app/(app)/layout.tsx` |
| `VedicChartData` type | Type is `VedicChartCalculations` from `openastrology-library` with different shape | Adapted chartContextBuilder to use actual type |
| `@google/generative-ai` needs install | Already installed (used by `lib/gemini/client.ts`) | Skipped install, imported directly |
| In-memory history only | User requested Redis persistence | Added `chat:history:{userId}` KV storage, 7-day TTL |
| No premium ceiling | User requested soft ceiling | Added `chat:premium:ratelimit:{userId}` KV key + `checkPremiumSoftLimit()` |

---

## BUGS FIXED DURING IMPLEMENTATION

### Bug 1 — `systemInstruction` wrong location
**Symptom**: "Could not generate a response. Please try again." on every message.

**Cause**: Initial implementation passed `systemInstruction` inside `generateContent()`:
```typescript
// WRONG
await m.generateContent({
  contents: [...],
  systemInstruction: { role: 'system', parts: [{ text: ... }] },
})
```

**Fix**: Must pass to `getGenerativeModel()`, matching the pattern in `lib/gemini/client.ts`:
```typescript
// CORRECT
const m = getClient().getGenerativeModel({
  model: modelName,
  systemInstruction,   // ← here
})
await m.generateContent({ contents: [...] })
```

### Bug 2 — Deprecated model names
**Symptom**: API errors with `gemini-1.5-flash-latest` / `gemini-1.5-pro-latest`.

**Cause**: Spec used 1.5-series model names. Project already uses `gemini-2.5-flash`.

**Fix**: Changed both `GEMINI_MODEL_PRO` and `GEMINI_MODEL_FLASH` defaults to `gemini-2.5-flash`.

---

## ARCHITECTURE NOTES

### Two Gemini clients
The project has two separate Gemini clients:
- `lib/gemini/client.ts` — report generation (long-form, high token limits, configurable)
- `lib/ai/geminiClient.ts` — chat (concise, system instruction + conversation turns)

They are intentionally separate. Do not merge them — the report client has output token
configuration that would be wrong for chat, and the chat client is optimized for
multi-turn conversation format.

### History persistence pattern
Server history (Redis) and client history (from the hook's historyRef) are merged in the
API route. Client history takes precedence when provided (it's more up-to-date than what's
in Redis, since the current turn hasn't been saved yet). After generation, the combined
history is written back to Redis with the new turn appended.

### Rate limit: null Redis behavior
In local development without Redis configured, all rate limiting is skipped — the user
gets unlimited questions. This is intentional. Redis is required for rate limiting in
production (set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`).

---

## MANUAL QA CHECKLIST

- [ ] Send a message as FREE tier user — response received, counter shows `2 remaining`
- [ ] Send 3 messages — 4th blocked with inline upgrade prompt + reset time
- [ ] Reload page — conversation history restored (requires Redis configured)
- [ ] Switch to CORE/VIP account — no counter, shows "Unlimited · Navigator"
- [ ] Send 40 messages as premium — response still succeeds (no hard block)
- [ ] Send message with no birth profile — returns clear 400 error, not a crash
- [ ] Kill network mid-request — error shown, user message removed from history
- [ ] Open on mobile — panel is full-width (`min(380px, calc(100vw - 32px))`), input usable
- [ ] Check all dashboard pages — chat button present, does not obscure content
- [ ] Click a starter prompt — sends as a question, prompt buttons disappear
- [ ] Click Clear — empties local messages, starts fresh

---

## COST REFERENCE

| Tier | Model | Input tokens | Output tokens | Cost/message |
|---|---|---|---|---|
| FREE | gemini-2.5-flash | ~500 | ~150 | ~$0.00005 |
| CORE/VIP | gemini-2.5-flash | ~1200 | ~250 | ~$0.007 |

Free user (3/day × 30 days = 90 messages/month): ~$0.005/month/user — effectively free.
Premium user at 50/day × 30 days = 1500 messages/month: ~$10.50/month.
At $19.99/mo subscription: margin protected at ~$9.49+ even for heavy users.

**Recommendation**: Monitor usage at scale. If premium users exceed 30 messages/day on
average, consider promoting `GEMINI_MODEL_PRO` to a true Pro model for quality, or tighten
the soft ceiling.

// STATUS: done | CHAT.7

import { kv } from '@/lib/kv/client'
import { kvKeys, KV_TTL_CHAT } from '@/lib/kv/keys'
import type { SubscriptionTier } from '@/types'

const FREE_DAILY_LIMIT    = 3
const PREMIUM_WARN_AT     = 40
const PREMIUM_SOFT_LIMIT  = 50   // no hard block; warning shown at 40

export interface RateLimitResult {
  allowed:   boolean
  remaining: number        // 0 if blocked
  resetAt:   Date
}

export interface PremiumLimitResult {
  count:   number
  warning: boolean         // true when count >= PREMIUM_WARN_AT
}

// ─── FREE tier ────────────────────────────────────────────────────────────────

/**
 * Check and increment the rate limit counter for a user.
 * Premium users always pass through — no Redis call made.
 * Uses atomic INCR + EXPIRE pattern for correctness under concurrency.
 * If Redis is unavailable (kv === null), allows the request through.
 */
export async function checkAndIncrementRateLimit(
  userId: string,
  tier: SubscriptionTier
): Promise<RateLimitResult> {
  // Premium: unlimited, skip Redis entirely
  if (tier !== 'FREE') {
    return {
      allowed:   true,
      remaining: Number.MAX_SAFE_INTEGER,
      resetAt:   new Date(0),
    }
  }

  // No Redis in local dev — allow without limiting
  if (!kv) {
    return {
      allowed:   true,
      remaining: FREE_DAILY_LIMIT,
      resetAt:   new Date(Date.now() + KV_TTL_CHAT.RATE_LIMIT_SECONDS * 1000),
    }
  }

  const key = kvKeys.chatRateLimit(userId)

  // Atomic increment
  const count = await kv.incr(key)

  // Set TTL only on first increment (avoids resetting on each call)
  if (count === 1) {
    await kv.expire(key, KV_TTL_CHAT.RATE_LIMIT_SECONDS)
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
    return { allowed: true, remaining: Number.MAX_SAFE_INTEGER, resetAt: new Date(0) }
  }

  if (!kv) {
    return { allowed: true, remaining: FREE_DAILY_LIMIT, resetAt: new Date(0) }
  }

  const key     = kvKeys.chatRateLimit(userId)
  const raw     = await kv.get<number>(key)
  const count   = raw ?? 0
  const ttl     = await kv.ttl(key)
  const resetAt = new Date(Date.now() + Math.max(ttl, 0) * 1000)

  return {
    allowed:   count < FREE_DAILY_LIMIT,
    remaining: Math.max(0, FREE_DAILY_LIMIT - count),
    resetAt,
  }
}

// ─── Premium soft ceiling ─────────────────────────────────────────────────────

/**
 * Check and increment the soft daily ceiling for premium users.
 * Returns a warning flag when approaching the ceiling — no hard block.
 * Skipped entirely if Redis is unavailable.
 */
export async function checkPremiumSoftLimit(
  userId: string
): Promise<PremiumLimitResult> {
  if (!kv) {
    return { count: 0, warning: false }
  }

  const key   = kvKeys.chatPremiumLimit(userId)
  const count = await kv.incr(key)

  if (count === 1) {
    await kv.expire(key, KV_TTL_CHAT.RATE_LIMIT_SECONDS)
  }

  return {
    count,
    warning: count >= PREMIUM_WARN_AT && count <= PREMIUM_SOFT_LIMIT,
  }
}

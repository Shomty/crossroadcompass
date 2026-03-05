// STATUS: done | Task 2.1
/**
 * lib/kv/client.ts
 * Single KV (Redis) client instance for the entire application.
 * No other file instantiates a Redis client.
 * Uses Upstash Redis REST API — compatible with edge and serverless runtimes.
 * When UPSTASH vars are absent (local dev), returns a no-op client — cache misses always.
 */

import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

// No-op client for local dev when Upstash is not configured.
const noopKv = {
  get: async () => null,
  set: async () => "OK" as const,
  del: async () => 0,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

export const kv: Redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : noopKv;

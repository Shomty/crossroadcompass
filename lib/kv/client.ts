// STATUS: done | Task 2.1
/**
 * lib/kv/client.ts
 * Single KV (Redis) client instance for the entire application.
 * No other file instantiates a Redis client.
 * Uses Upstash Redis REST API — compatible with edge and serverless runtimes.
 *
 * When UPSTASH_REDIS_REST_URL / TOKEN are absent (local dev without Redis),
 * `kv` is null and all helpers in kv/helpers.ts short-circuit gracefully.
 */

import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

export const kv: Redis | null =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

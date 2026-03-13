// STATUS: done | Task 2.3
/**
 * lib/kv/helpers.ts
 * Typed get/set/delete wrappers around the KV client.
 * All functions handle Redis errors gracefully:
 *   - Log server-side only
 *   - kvGet returns null on miss or error — caller decides what to do
 *   - kvSet/kvDelete/kvDeleteMany never throw to caller
 */

import { kv } from "@/lib/kv/client";

const kvWarnedKeys = new Set<string>();

function logKvIssue(operation: string, key: string, err: unknown): void {
  const isFetchError =
    err instanceof TypeError &&
    typeof err.message === "string" &&
    err.message.toLowerCase().includes("fetch failed");

  // During local/dev outages, treat KV as an optional cache and avoid
  // surfacing noisy console errors in the Next.js error overlay.
  if (isFetchError) {
    const warnKey = `${operation}:${key}`;
    if (!kvWarnedKeys.has(warnKey)) {
      kvWarnedKeys.add(warnKey);
      console.warn(
        `[KV] ${operation} unavailable for key "${key}" (network issue). Falling back without cache.`
      );
    }
    return;
  }

  console.error(`[KV] ${operation} failed for key "${key}":`, err);
}

export async function kvGet<T>(key: string): Promise<T | null> {
  if (!kv) return null;
  try {
    const value = await kv.get<T>(key);
    return value ?? null;
  } catch (err) {
    logKvIssue("kvGet", key, err);
    return null;
  }
}

export async function kvSet<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  if (!kv) return;
  try {
    if (ttlSeconds !== undefined) {
      await kv.set(key, value, { ex: ttlSeconds });
    } else {
      await kv.set(key, value);
    }
  } catch (err) {
    logKvIssue("kvSet", key, err);
  }
}

export async function kvDelete(key: string): Promise<void> {
  if (!kv) return;
  try {
    await kv.del(key);
  } catch (err) {
    logKvIssue("kvDelete", key, err);
  }
}

export async function kvDeleteMany(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  if (!kv) return;
  try {
    await kv.del(...keys);
  } catch (err) {
    const key = keys.join(", ");
    logKvIssue("kvDeleteMany", key, err);
  }
}

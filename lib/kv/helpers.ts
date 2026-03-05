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

export async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const value = await kv.get<T>(key);
    return value ?? null;
  } catch (err) {
    console.error(`[KV] kvGet failed for key "${key}":`, err);
    return null;
  }
}

export async function kvSet<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  try {
    if (ttlSeconds !== undefined) {
      await kv.set(key, value, { ex: ttlSeconds });
    } else {
      await kv.set(key, value);
    }
  } catch (err) {
    console.error(`[KV] kvSet failed for key "${key}":`, err);
  }
}

export async function kvDelete(key: string): Promise<void> {
  try {
    await kv.del(key);
  } catch (err) {
    console.error(`[KV] kvDelete failed for key "${key}":`, err);
  }
}

export async function kvDeleteMany(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    await kv.del(...keys);
  } catch (err) {
    console.error(`[KV] kvDeleteMany failed for keys [${keys.join(", ")}]:`, err);
  }
}

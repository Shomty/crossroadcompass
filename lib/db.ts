/**
 * lib/db.ts
 * Prisma client singleton. Safe for use in Next.js serverless functions
 * (avoids "too many connections" in development hot-reload).
 *
 * Prisma must be listed in next.config `serverExternalPackages` so Turbopack
 * does not bundle a stripped client (missing model delegates).
 *
 * `db` is a Proxy so every access runs through getPrismaSingleton(). That way
 * Turbopack/HMR cannot leave a stale module-level reference to a client that
 * predates new Prisma models (missing delegates like chatStarterPrompt).
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
    }),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

/**
 * Reuse global client; replace if it predates new Prisma models (HMR / schema drift).
 */
function getPrismaSingleton(): PrismaClient {
  const cached = globalForPrisma.prisma;
  const p = cached as
    | {
        userChatState?: { findUnique?: unknown };
        chatStarterPrompt?: { findMany?: unknown };
      }
    | undefined;
  const hasUser = typeof p?.userChatState?.findUnique === "function";
  const hasChat = typeof p?.chatStarterPrompt?.findMany === "function";
  if (cached && hasUser && hasChat) {
    return cached;
  }
  if (cached) {
    void cached.$disconnect().catch(() => {});
  }
  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getPrismaSingleton();
    const v = Reflect.get(client, prop, client);
    if (typeof v === "function") {
      return v.bind(client);
    }
    return v;
  },
});

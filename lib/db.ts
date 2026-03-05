/**
 * lib/db.ts
 * Prisma client singleton using libsql adapter (Prisma 7).
 * Safe for use in Next.js serverless functions
 * (avoids "too many connections" in development hot-reload).
 */

import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // DATABASE_URL for SQLite in dev looks like: file:./prisma/dev.db
  // libsql expects an absolute file:// URL
  const rawUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const libsqlUrl = rawUrl.startsWith("file:")
    ? `file:${path.resolve(rawUrl.replace(/^file:/, ""))}`
    : rawUrl;

  const adapter = new PrismaLibSql({ url: libsqlUrl });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

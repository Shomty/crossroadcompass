-- Fix: periodic_reports FK referenced "User" (model name) instead of "users" (mapped table).
-- SQLite cannot ALTER FK constraints directly; recreate the table with the correct reference.

PRAGMA foreign_keys = OFF;

CREATE TABLE "periodic_reports_fixed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "periodic_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "periodic_reports_fixed" SELECT * FROM "periodic_reports";

DROP TABLE "periodic_reports";

ALTER TABLE "periodic_reports_fixed" RENAME TO "periodic_reports";

CREATE UNIQUE INDEX "periodic_reports_userId_period_periodKey_key" ON "periodic_reports"("userId", "period", "periodKey");
CREATE INDEX "periodic_reports_userId_period_idx" ON "periodic_reports"("userId", "period");

PRAGMA foreign_keys = ON;

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN "actionLabel" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "detail" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "ip" TEXT;

-- CreateTable
CREATE TABLE "report_prompt_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportProductId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "savedBy" TEXT NOT NULL,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testResult" TEXT,
    CONSTRAINT "report_prompt_versions_reportProductId_fkey" FOREIGN KEY ("reportProductId") REFERENCES "ReportProduct" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GeneratedReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DONE',
    "errorMsg" TEXT,
    "regeneratedAt" DATETIME,
    "content" TEXT NOT NULL DEFAULT '',
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geminiModel" TEXT NOT NULL DEFAULT '',
    "generationTimeMs" INTEGER,
    CONSTRAINT "GeneratedReport_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "ReportPurchase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GeneratedReport" ("content", "geminiModel", "generatedAt", "generationTimeMs", "id", "purchaseId", "wordCount") SELECT "content", "geminiModel", "generatedAt", "generationTimeMs", "id", "purchaseId", "wordCount" FROM "GeneratedReport";
DROP TABLE "GeneratedReport";
ALTER TABLE "new_GeneratedReport" RENAME TO "GeneratedReport";
CREATE UNIQUE INDEX "GeneratedReport_purchaseId_key" ON "GeneratedReport"("purchaseId");
CREATE TABLE "new_ReportProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceUsd" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "coverImageUrl" TEXT,
    "geminiPrompt" TEXT NOT NULL,
    "promptVersion" INTEGER NOT NULL DEFAULT 1,
    "estimatedWordCount" INTEGER NOT NULL DEFAULT 2000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL
);
INSERT INTO "new_ReportProduct" ("category", "coverImageUrl", "createdAt", "createdBy", "description", "estimatedWordCount", "geminiPrompt", "id", "isActive", "priceUsd", "slug", "sortOrder", "subtitle", "title", "updatedAt") SELECT "category", "coverImageUrl", "createdAt", "createdBy", "description", "estimatedWordCount", "geminiPrompt", "id", "isActive", "priceUsd", "slug", "sortOrder", "subtitle", "title", "updatedAt" FROM "ReportProduct";
DROP TABLE "ReportProduct";
ALTER TABLE "new_ReportProduct" RENAME TO "ReportProduct";
CREATE UNIQUE INDEX "ReportProduct_slug_key" ON "ReportProduct"("slug");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_users" ("createdAt", "email", "emailVerified", "id", "image", "name", "role", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Backfill admin flag from legacy role
UPDATE "users" SET "isAdmin" = 1 WHERE "role" = 'ADMIN';

-- CreateIndex
CREATE INDEX "report_prompt_versions_reportProductId_idx" ON "report_prompt_versions"("reportProductId");

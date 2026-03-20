/*
  Warnings:

  - You are about to drop the column `accuracyRating` on the `insights` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "birth_profiles" ADD COLUMN "hdInsights" TEXT;
ALTER TABLE "birth_profiles" ADD COLUMN "observationCity" TEXT;
ALTER TABLE "birth_profiles" ADD COLUMN "observationLatitude" REAL;
ALTER TABLE "birth_profiles" ADD COLUMN "observationLongitude" REAL;

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promptKey" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "hdType" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "userPromptTemplate" TEXT NOT NULL,
    "bannedPhrases" TEXT NOT NULL DEFAULT '',
    "maxTokens" INTEGER NOT NULL DEFAULT 800,
    "temperature" REAL NOT NULL DEFAULT 0.8,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "prompt_template_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promptTemplateId" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "userPromptTemplate" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "savedBy" TEXT NOT NULL,
    CONSTRAINT "prompt_template_versions_promptTemplateId_fkey" FOREIGN KEY ("promptTemplateId") REFERENCES "prompt_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminEmail" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetId" TEXT,
    "targetType" TEXT,
    "before" TEXT,
    "after" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "system_configs" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "cron_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobName" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "usersProcessed" INTEGER NOT NULL DEFAULT 0,
    "insightsGenerated" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_insights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "periodDate" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedByConsultant" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" DATETIME,
    "deliveredAt" DATETIME,
    "rejectedAt" DATETIME,
    "rejectedBy" TEXT,
    CONSTRAINT "insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_insights" ("content", "deliveredAt", "generatedAt", "id", "periodDate", "reviewedAt", "reviewedByConsultant", "type", "userId") SELECT "content", "deliveredAt", "generatedAt", "id", "periodDate", "reviewedAt", "reviewedByConsultant", "type", "userId" FROM "insights";
DROP TABLE "insights";
ALTER TABLE "new_insights" RENAME TO "insights";
CREATE INDEX "insights_userId_type_periodDate_idx" ON "insights"("userId", "type", "periodDate");
CREATE UNIQUE INDEX "insights_userId_type_periodDate_key" ON "insights"("userId", "type", "periodDate");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER'
);
INSERT INTO "new_users" ("createdAt", "email", "emailVerified", "id", "image", "name", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "prompt_templates_promptKey_key" ON "prompt_templates"("promptKey");

-- CreateIndex
CREATE INDEX "prompt_template_versions_promptTemplateId_idx" ON "prompt_template_versions"("promptTemplateId");

-- CreateIndex
CREATE INDEX "audit_logs_adminEmail_idx" ON "audit_logs"("adminEmail");

-- CreateIndex
CREATE INDEX "audit_logs_actionType_idx" ON "audit_logs"("actionType");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "cron_runs_jobName_idx" ON "cron_runs"("jobName");

-- CreateIndex
CREATE INDEX "cron_runs_startedAt_idx" ON "cron_runs"("startedAt");

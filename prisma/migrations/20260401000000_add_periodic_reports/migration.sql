-- CreateTable
CREATE TABLE "periodic_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "periodic_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "periodic_reports_userId_period_periodKey_key" ON "periodic_reports"("userId", "period", "periodKey");

-- CreateIndex
CREATE INDEX "periodic_reports_userId_period_idx" ON "periodic_reports"("userId", "period");

-- CreateTable
CREATE TABLE "ReportProduct" (
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
    "estimatedWordCount" INTEGER NOT NULL DEFAULT 2000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ReportPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reportProductId" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "amountPaidUsd" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReportPurchase_reportProductId_fkey" FOREIGN KEY ("reportProductId") REFERENCES "ReportProduct" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneratedReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geminiModel" TEXT NOT NULL,
    "generationTimeMs" INTEGER,
    CONSTRAINT "GeneratedReport_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "ReportPurchase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportProduct_slug_key" ON "ReportProduct"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ReportPurchase_stripePaymentId_key" ON "ReportPurchase"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportPurchase_userId_reportProductId_key" ON "ReportPurchase"("userId", "reportProductId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedReport_purchaseId_key" ON "GeneratedReport"("purchaseId");

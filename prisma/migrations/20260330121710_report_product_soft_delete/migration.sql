-- AlterTable
ALTER TABLE "ReportProduct" ADD COLUMN "deletedAt" DATETIME;

-- CreateIndex
CREATE INDEX "ReportProduct_deletedAt_idx" ON "ReportProduct"("deletedAt");

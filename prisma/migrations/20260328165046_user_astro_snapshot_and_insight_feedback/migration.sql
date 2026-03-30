-- AlterTable
ALTER TABLE "insights" ADD COLUMN "insightFeedback" TEXT;

-- CreateTable
CREATE TABLE "user_astro_snapshots" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "lagnaSign" TEXT,
    "lagnaDegree" REAL,
    "lagnaNakshatra" TEXT,
    "lagnaNakshatraPada" INTEGER,
    "ayanamsa" REAL,
    "birthTimeKnown" BOOLEAN,
    "vedicChartCachedAt" DATETIME,
    "birthDateSnapshot" DATETIME,
    "birthCitySnapshot" TEXT,
    "birthCountrySnapshot" TEXT,
    "birthLatitude" REAL,
    "birthLongitude" REAL,
    "birthTimezone" TEXT,
    "profileUpdatedAt" DATETIME,
    "cacheInvalidatedAt" DATETIME,
    "feJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_astro_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

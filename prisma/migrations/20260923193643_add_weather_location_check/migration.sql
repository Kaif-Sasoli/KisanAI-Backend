-- CreateTable
CREATE TABLE "WeatherLocationCheck" (
    "id" TEXT NOT NULL,
    "locationKey" TEXT NOT NULL,
    "city" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherLocationCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeatherLocationCheck_locationKey_key" ON "WeatherLocationCheck"("locationKey");

-- CreateIndex
CREATE INDEX "WeatherLocationCheck_lastCheckedAt_idx" ON "WeatherLocationCheck"("lastCheckedAt");

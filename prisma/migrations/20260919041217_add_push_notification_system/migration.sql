-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('WEATHER', 'RAIN', 'TEMPERATURE', 'WIND', 'HUMIDITY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateTable
CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "DevicePlatform" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "city" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isPushed" BOOLEAN NOT NULL DEFAULT false,
    "dedupeKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");

-- CreateIndex
CREATE INDEX "PushToken_farmerId_idx" ON "PushToken"("farmerId");

-- CreateIndex
CREATE INDEX "PushToken_isActive_idx" ON "PushToken"("isActive");

-- CreateIndex
CREATE INDEX "Notification_farmerId_createdAt_idx" ON "Notification"("farmerId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_farmerId_dedupeKey_key" ON "Notification"("farmerId", "dedupeKey");

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

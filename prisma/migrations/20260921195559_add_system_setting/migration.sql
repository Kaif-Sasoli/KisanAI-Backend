/*
  Warnings:

  - Made the column `isRevoked` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "isRevoked" SET NOT NULL;

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

/*
  Warnings:

  - You are about to drop the column `createdAt` on the `DiseasePrediction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DiseasePrediction" DROP COLUMN "createdAt",
ADD COLUMN     "imagePublicId" TEXT;

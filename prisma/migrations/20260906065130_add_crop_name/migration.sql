/*
  Warnings:

  - Added the required column `cropName` to the `Crop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Crop" ADD COLUMN     "cropName" TEXT NOT NULL;

/*
  Warnings:

  - Changed the type of `treatment` on the `DiseasePrediction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "DiseasePrediction" DROP COLUMN "treatment",
ADD COLUMN     "treatment" JSONB NOT NULL;

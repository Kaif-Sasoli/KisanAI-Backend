/*
  Warnings:

  - The `soilType` column on the `Field` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `irrigationType` column on the `Field` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SoilType" AS ENUM ('SANDY', 'CLAY', 'LOAMY', 'SILTY', 'PEATY', 'CHALKY', 'OTHER');

-- CreateEnum
CREATE TYPE "IrrigationType" AS ENUM ('RAINFED', 'CANAL', 'TUBE_WELL', 'WELL', 'DRIP', 'SPRINKLER', 'OTHER');

-- AlterTable
ALTER TABLE "Field" DROP COLUMN "soilType",
ADD COLUMN     "soilType" "SoilType",
DROP COLUMN "irrigationType",
ADD COLUMN     "irrigationType" "IrrigationType";

/*
  Warnings:

  - The values [USER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `tehsil` on the `Farmer` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `tehsil` on the `Field` table. All the data in the column will be lost.
  - Changed the type of `cropName` on the `Crop` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Region" AS ENUM ('CENTRAL', 'NORTH', 'EAST', 'WEST', 'SOUTH');

-- CreateEnum
CREATE TYPE "CropType" AS ENUM ('WHEAT', 'RICE', 'MAIZE', 'COTTON', 'SUGARCANE', 'POTATO');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'FARMER');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'FARMER';
COMMIT;

-- AlterTable
ALTER TABLE "Crop" DROP COLUMN "cropName",
ADD COLUMN     "cropName" "CropType" NOT NULL;

-- AlterTable
ALTER TABLE "Farmer" DROP COLUMN "tehsil",
ADD COLUMN     "city" TEXT;

-- AlterTable
ALTER TABLE "Field" DROP COLUMN "district",
DROP COLUMN "tehsil",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "region" "Region";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'FARMER';

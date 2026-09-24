-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "AreaUnit" AS ENUM ('ACRE', 'HECTARE');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('RABI', 'KHARIF', 'ZAID');

-- CreateEnum
CREATE TYPE "CropStatus" AS ENUM ('PLANNED', 'ACTIVE', 'HARVESTED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "providerId" TEXT,
    "providerType" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "phoneNumber" TEXT,
    "profileImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "province" TEXT,
    "district" TEXT,
    "tehsil" TEXT,
    "village" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Field" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "name" TEXT,
    "area" DOUBLE PRECISION NOT NULL,
    "areaUnit" "AreaUnit" NOT NULL DEFAULT 'ACRE',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "province" TEXT,
    "district" TEXT,
    "tehsil" TEXT,
    "village" TEXT,
    "soilType" TEXT,
    "irrigationType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "season" "Season" NOT NULL,
    "plantingDate" TIMESTAMP(3),
    "expectedHarvestDate" TIMESTAMP(3),
    "actualHarvestDate" TIMESTAMP(3),
    "area" DOUBLE PRECISION,
    "areaUnit" "AreaUnit",
    "status" "CropStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilData" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "nitrogen" DOUBLE PRECISION,
    "phosphorus" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "soilPH" DOUBLE PRECISION,
    "soilMoisture" DOUBLE PRECISION,
    "organicCarbon" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoilData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherData" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "rainfall" DOUBLE PRECISION,
    "rainProbability" DOUBLE PRECISION,
    "windSpeed" DOUBLE PRECISION,
    "weather" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseasePrediction" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT,
    "cropId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "diseaseName" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "treatment" TEXT NOT NULL,
    "predictionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseasePrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YieldPrediction" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "predictedYield" DOUBLE PRECISION NOT NULL,
    "yieldUnit" TEXT NOT NULL DEFAULT 'tons',
    "predictionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inputData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YieldPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isRevoked" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_userId_key" ON "Farmer"("userId");

-- CreateIndex
CREATE INDEX "Field_farmerId_idx" ON "Field"("farmerId");

-- CreateIndex
CREATE INDEX "Crop_fieldId_idx" ON "Crop"("fieldId");

-- CreateIndex
CREATE INDEX "SoilData_fieldId_idx" ON "SoilData"("fieldId");

-- CreateIndex
CREATE INDEX "WeatherData_fieldId_idx" ON "WeatherData"("fieldId");

-- CreateIndex
CREATE INDEX "WeatherData_recordedAt_idx" ON "WeatherData"("recordedAt");

-- CreateIndex
CREATE INDEX "DiseasePrediction_cropId_idx" ON "DiseasePrediction"("cropId");

-- CreateIndex
CREATE INDEX "DiseasePrediction_farmerId_idx" ON "DiseasePrediction"("farmerId");

-- CreateIndex
CREATE INDEX "YieldPrediction_cropId_idx" ON "YieldPrediction"("cropId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "EmailVerification_email_idx" ON "EmailVerification"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordReset_tokenHash_idx" ON "PasswordReset"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");

-- AddForeignKey
ALTER TABLE "Farmer" ADD CONSTRAINT "Farmer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilData" ADD CONSTRAINT "SoilData_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeatherData" ADD CONSTRAINT "WeatherData_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseasePrediction" ADD CONSTRAINT "DiseasePrediction_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseasePrediction" ADD CONSTRAINT "DiseasePrediction_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YieldPrediction" ADD CONSTRAINT "YieldPrediction_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

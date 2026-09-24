-- AlterTable
ALTER TABLE "YieldPrediction" ADD COLUMN     "farmerId" TEXT;

-- CreateIndex
CREATE INDEX "YieldPrediction_farmerId_idx" ON "YieldPrediction"("farmerId");

-- AddForeignKey
ALTER TABLE "YieldPrediction" ADD CONSTRAINT "YieldPrediction_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

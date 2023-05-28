-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('DAY', 'MONTH', 'YEAR');

-- AlterTable
ALTER TABLE "SubscriptionPayment" ADD COLUMN     "periodType" "PeriodType" NOT NULL DEFAULT 'MONTH';

-- AlterTable
ALTER TABLE "SubscriptionPrice" ADD COLUMN     "periodType" "PeriodType" NOT NULL DEFAULT 'MONTH';

-- AddForeignKey
ALTER TABLE "SubscriptionPricingPlan" ADD CONSTRAINT "SubscriptionPricingPlan_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "SubscriptionPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `paymentId` on the `Subscription` table. All the data in the column will be lost.
  - The `info` column on the `SubscriptionPayment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[subscriptionPaymentId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subscriptionPaymentId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_paymentId_fkey";

-- DropIndex
DROP INDEX "Subscription_paymentId_key";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "reference" SET DEFAULT 'SUBSCRIPTION';

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "paymentId",
ADD COLUMN     "subscriptionPaymentId" TEXT NOT NULL,
ADD COLUMN     "type" "SubscriptionType" NOT NULL,
ALTER COLUMN "startDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SubscriptionPayment" DROP COLUMN "info",
ADD COLUMN     "info" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionPaymentId_key" ON "Subscription"("subscriptionPaymentId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_subscriptionPaymentId_fkey" FOREIGN KEY ("subscriptionPaymentId") REFERENCES "SubscriptionPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `providerSubscriptionId` on the `SubscriptionPayment` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "relatedSubscription" TEXT,
ALTER COLUMN "endDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SubscriptionPayment" DROP COLUMN "providerSubscriptionId";

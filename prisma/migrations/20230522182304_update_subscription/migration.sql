/*
  Warnings:

  - Added the required column `type` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "reference" SET DEFAULT 'SUBSCRIPTION';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "type" "SubscriptionType" NOT NULL;

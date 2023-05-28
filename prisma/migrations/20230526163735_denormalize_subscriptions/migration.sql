/*
  Warnings:

  - You are about to drop the column `type` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `SubscriptionPayment` table. All the data in the column will be lost.
  - You are about to drop the column `periodType` on the `SubscriptionPayment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "SubscriptionPayment" DROP COLUMN "period",
DROP COLUMN "periodType";

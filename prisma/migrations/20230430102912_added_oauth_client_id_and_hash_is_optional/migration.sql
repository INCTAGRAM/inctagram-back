-- AlterTable
ALTER TABLE "User" ADD COLUMN     "oauthClientId" TEXT,
ALTER COLUMN "hash" DROP NOT NULL;

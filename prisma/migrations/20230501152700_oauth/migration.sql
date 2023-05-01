-- AlterTable
ALTER TABLE "User" ADD COLUMN     "oauthClientId" TEXT,
ALTER COLUMN "hash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AccountsMergeInfo" (
    "id" TEXT NOT NULL,
    "mergeCode" TEXT,
    "isMerged" BOOLEAN NOT NULL DEFAULT false,
    "expirationDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "AccountsMergeInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountsMergeInfo_userId_key" ON "AccountsMergeInfo"("userId");

-- AddForeignKey
ALTER TABLE "AccountsMergeInfo" ADD CONSTRAINT "AccountsMergeInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Avatar" ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "previewUrl" DROP NOT NULL,
ALTER COLUMN "size" DROP NOT NULL,
ALTER COLUMN "height" DROP NOT NULL,
ALTER COLUMN "width" DROP NOT NULL;

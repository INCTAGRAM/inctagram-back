-- CreateEnum
CREATE TYPE "Ratio" AS ENUM ('ORIGINAL', 'PORTRAIT', 'LANDSCAPE', 'SQUARE');

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "previewUrl" TEXT,
    "description" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageMetadata" (
    "id" TEXT NOT NULL,
    "zoom" INTEGER NOT NULL,
    "ratio" "Ratio" NOT NULL DEFAULT 'ORIGINAL',
    "cropInfo" JSONB NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageCropInfo" (
    "id" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageCropInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_userId_key" ON "Post"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_postId_key" ON "Image"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "ImageMetadata_imageId_key" ON "ImageMetadata"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "ImageCropInfo_imageId_key" ON "ImageCropInfo"("imageId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageMetadata" ADD CONSTRAINT "ImageMetadata_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageCropInfo" ADD CONSTRAINT "ImageCropInfo_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

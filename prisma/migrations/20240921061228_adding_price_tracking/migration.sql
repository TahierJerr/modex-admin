-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PROCESSOR', 'SOFTWARE', 'GRAPHICS', 'MEMORY', 'STORAGE', 'POWER', 'PCCASE', 'COOLER', 'MOTHERBOARD');

-- AlterTable
ALTER TABLE "Cooler" ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceTrackUrl" TEXT;

-- AlterTable
ALTER TABLE "Graphics" ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceTrackUrl" TEXT;

-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceTrackUrl" TEXT;

-- AlterTable
ALTER TABLE "Motherboard" ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceTrackUrl" TEXT;

-- AlterTable
ALTER TABLE "Pccase" ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceTrackUrl" TEXT;

-- AlterTable
ALTER TABLE "Power" ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceTrackUrl" TEXT;

-- AlterTable
ALTER TABLE "Processor" ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceTrackUrl" TEXT;

-- AlterTable
ALTER TABLE "Software" ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceTrackUrl" TEXT;

-- AlterTable
ALTER TABLE "Storage" ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "priceTrackUrl" TEXT;

-- CreateTable
CREATE TABLE "PriceTracking" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "product" "ProductType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceTrackUrl" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceTracking_pkey" PRIMARY KEY ("id")
);

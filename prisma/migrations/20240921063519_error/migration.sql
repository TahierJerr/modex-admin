/*
  Warnings:

  - Changed the type of `product` on the `PriceTracking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PriceTracking" DROP COLUMN "product",
ADD COLUMN     "product" TEXT NOT NULL;

-- DropEnum
DROP TYPE "ProductType";

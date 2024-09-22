/*
  Warnings:

  - You are about to drop the column `product` on the `PriceTracking` table. All the data in the column will be lost.
  - Added the required column `productType` to the `PriceTracking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PriceTracking" DROP COLUMN "product",
ADD COLUMN     "productType" TEXT NOT NULL;

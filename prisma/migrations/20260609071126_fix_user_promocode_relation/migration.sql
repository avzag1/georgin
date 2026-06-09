/*
  Warnings:

  - You are about to drop the column `isUsed` on the `user_promocodes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "appliedPromo" TEXT,
ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "promocodes" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'PERCENT',
ALTER COLUMN "discount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "user_promocodes" DROP COLUMN "isUsed";

-- CreateTable
CREATE TABLE "product_promocodes" (
    "productId" INTEGER NOT NULL,
    "promocodeId" INTEGER NOT NULL,

    CONSTRAINT "product_promocodes_pkey" PRIMARY KEY ("productId","promocodeId")
);

-- CreateTable
CREATE TABLE "promocode_usages" (
    "id" SERIAL NOT NULL,
    "promocodeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promocode_usages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_promocodes" ADD CONSTRAINT "product_promocodes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_promocodes" ADD CONSTRAINT "product_promocodes_promocodeId_fkey" FOREIGN KEY ("promocodeId") REFERENCES "promocodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promocode_usages" ADD CONSTRAINT "promocode_usages_promocodeId_fkey" FOREIGN KEY ("promocodeId") REFERENCES "promocodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promocode_usages" ADD CONSTRAINT "promocode_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promocode_usages" ADD CONSTRAINT "promocode_usages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

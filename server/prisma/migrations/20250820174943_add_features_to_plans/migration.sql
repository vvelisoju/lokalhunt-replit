/*
  Warnings:

  - You are about to drop the column `updated_at` on the `plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."plans" DROP COLUMN "updated_at",
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "updated_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

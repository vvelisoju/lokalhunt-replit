/*
  Warnings:

  - The values [ARCHIVED] on the enum `AdStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AdStatus_new" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'CLOSED', 'REJECTED');
ALTER TABLE "public"."ads" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."ads" ALTER COLUMN "status" TYPE "public"."AdStatus_new" USING ("status"::text::"public"."AdStatus_new");
ALTER TYPE "public"."AdStatus" RENAME TO "AdStatus_old";
ALTER TYPE "public"."AdStatus_new" RENAME TO "AdStatus";
DROP TYPE "public"."AdStatus_old";
ALTER TABLE "public"."ads" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "public"."ads" ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "rejected_by" TEXT,
ADD COLUMN     "rejection_reason" TEXT;

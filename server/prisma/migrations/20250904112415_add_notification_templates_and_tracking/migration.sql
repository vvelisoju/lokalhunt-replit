-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'PROFILE_VIEWED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'JOB_BOOKMARKED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'NEW_APPLICATION';
ALTER TYPE "public"."NotificationType" ADD VALUE 'JOB_VIEW_MILESTONE';

-- CreateTable
CREATE TABLE "public"."notification_templates" (
    "id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_notification_trackers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notification_type" "public"."NotificationType" NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_notification_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_views" (
    "id" TEXT NOT NULL,
    "ad_id" TEXT NOT NULL,
    "user_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile_views" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "employer_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_view_milestones" (
    "id" TEXT NOT NULL,
    "ad_id" TEXT NOT NULL,
    "milestone" INTEGER NOT NULL,
    "achieved" BOOLEAN NOT NULL DEFAULT false,
    "achieved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_view_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_type_key" ON "public"."notification_templates"("type");

-- CreateIndex
CREATE UNIQUE INDEX "daily_notification_trackers_user_id_notification_type_date_key" ON "public"."daily_notification_trackers"("user_id", "notification_type", "date");

-- CreateIndex
CREATE UNIQUE INDEX "job_view_milestones_ad_id_milestone_key" ON "public"."job_view_milestones"("ad_id", "milestone");

-- AddForeignKey
ALTER TABLE "public"."daily_notification_trackers" ADD CONSTRAINT "daily_notification_trackers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_views" ADD CONSTRAINT "job_views_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_views" ADD CONSTRAINT "job_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_views" ADD CONSTRAINT "profile_views_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_views" ADD CONSTRAINT "profile_views_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_view_milestones" ADD CONSTRAINT "job_view_milestones_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

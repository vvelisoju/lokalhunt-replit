/*
  Warnings:

  - You are about to drop the column `created_at` on the `education_qualifications` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `education_qualifications` table. All the data in the column will be lost.
  - You are about to drop the column `sort_order` on the `education_qualifications` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `education_qualifications` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `education_qualifications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CurrentEmploymentStatus" AS ENUM ('LOOKING_FOR_JOB', 'OPEN_TO_OPPORTUNITIES', 'CURRENTLY_WORKING', 'STUDENT_RECENT_GRADUATE');

-- CreateEnum
CREATE TYPE "public"."ShiftPreference" AS ENUM ('DAY_SHIFT', 'NIGHT_SHIFT', 'FLEXIBLE_HOURS', 'WEEKEND_ONLY');

-- CreateEnum
CREATE TYPE "public"."Availability" AS ENUM ('IMMEDIATELY', 'WITHIN_1_WEEK', 'WITHIN_1_MONTH', 'AFTER_2_MONTHS');

-- CreateEnum
CREATE TYPE "public"."Language" AS ENUM ('ENGLISH', 'HINDI', 'TELUGU', 'TAMIL', 'KANNADA', 'MALAYALAM', 'BENGALI', 'MARATHI', 'GUJARATI', 'PUNJABI', 'URDU', 'ODIA');

-- AlterTable
ALTER TABLE "public"."candidates" ADD COLUMN     "availability_date" TIMESTAMP(3),
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "current_employment_status" TEXT,
ADD COLUMN     "current_salary" DECIMAL(10,2),
ADD COLUMN     "github_url" TEXT,
ADD COLUMN     "linkedin_url" TEXT,
ADD COLUMN     "notice_period" TEXT,
ADD COLUMN     "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboarding_step" INTEGER DEFAULT 0,
ADD COLUMN     "preferred_industries" TEXT[],
ADD COLUMN     "preferred_job_titles" TEXT[],
ADD COLUMN     "preferred_job_types" TEXT[],
ADD COLUMN     "preferred_languages" TEXT[],
ADD COLUMN     "preferred_locations" TEXT[],
ADD COLUMN     "preferred_salary_max" DECIMAL(10,2),
ADD COLUMN     "preferred_salary_min" DECIMAL(10,2),
ADD COLUMN     "remote_work_preference" TEXT,
ADD COLUMN     "shift_preference" TEXT,
ADD COLUMN     "skills_with_experience" JSONB,
ADD COLUMN     "travel_willingness" BOOLEAN,
ADD COLUMN     "website_url" TEXT;

-- AlterTable
ALTER TABLE "public"."education_qualifications" DROP COLUMN "created_at",
DROP COLUMN "is_active",
DROP COLUMN "sort_order",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."job_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_roles_name_key" ON "public"."job_roles"("name");

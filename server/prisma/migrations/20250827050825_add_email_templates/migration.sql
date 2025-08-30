-- CreateEnum
CREATE TYPE "public"."EmailTemplateType" AS ENUM ('OTP_VERIFICATION', 'JOB_APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'JOB_REJECTED', 'WELCOME', 'PASSWORD_RESET', 'PROFILE_APPROVED', 'SUBSCRIPTION_EXPIRED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'TEST');

-- CreateTable
CREATE TABLE "public"."email_templates" (
    "id" TEXT NOT NULL,
    "type" "public"."EmailTemplateType" NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_type_key" ON "public"."email_templates"("type");

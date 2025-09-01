-- CreateTable
CREATE TABLE "public"."sms_templates" (
    "id" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sms_templates_template_name_key" ON "public"."sms_templates"("template_name");

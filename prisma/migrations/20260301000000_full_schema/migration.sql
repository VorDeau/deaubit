-- Migration: full_schema
-- Adds all tables created via db push (User, Click, Report)
-- plus full ShortLink columns, and new otpExpiresAt field

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: User (if not exists)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "otpSecret" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: User.email unique
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Alter ShortLink: add missing columns (if not exists)
ALTER TABLE "ShortLink"
    ADD COLUMN IF NOT EXISTS "password" TEXT,
    ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- AddForeignKey: ShortLink.userId -> User.id
DO $$ BEGIN
    ALTER TABLE "ShortLink" ADD CONSTRAINT "ShortLink_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: Click (if not exists)
CREATE TABLE IF NOT EXISTS "Click" (
    "id" TEXT NOT NULL,
    "shortLinkId" TEXT NOT NULL,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "country" TEXT,
    "city" TEXT,
    "ip" TEXT,
    "referrer" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Click.shortLinkId
CREATE INDEX IF NOT EXISTS "Click_shortLinkId_idx" ON "Click"("shortLinkId");

-- AddForeignKey: Click.shortLinkId -> ShortLink.id
DO $$ BEGIN
    ALTER TABLE "Click" ADD CONSTRAINT "Click_shortLinkId_fkey"
        FOREIGN KEY ("shortLinkId") REFERENCES "ShortLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: Report (if not exists)
CREATE TABLE IF NOT EXISTS "Report" (
    "id" TEXT NOT NULL,
    "shortLinkId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "contact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Report.shortLinkId
CREATE INDEX IF NOT EXISTS "Report_shortLinkId_idx" ON "Report"("shortLinkId");

-- AddForeignKey: Report.shortLinkId -> ShortLink.id
DO $$ BEGIN
    ALTER TABLE "Report" ADD CONSTRAINT "Report_shortLinkId_fkey"
        FOREIGN KEY ("shortLinkId") REFERENCES "ShortLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add otpExpiresAt column to User (if not already added above - idempotent)
ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "otpExpiresAt" TIMESTAMP(3);

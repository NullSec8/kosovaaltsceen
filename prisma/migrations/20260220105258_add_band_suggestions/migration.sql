-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'ADDED', 'DISMISSED');

-- CreateTable
CREATE TABLE "BandSuggestion" (
    "id" TEXT NOT NULL,
    "bandName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "genres" TEXT NOT NULL,
    "yearFounded" INTEGER,
    "links" TEXT,
    "notes" TEXT,
    "contributorEmail" TEXT,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BandSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BandSuggestion_status_idx" ON "BandSuggestion"("status");

-- CreateIndex
CREATE INDEX "BandSuggestion_createdAt_idx" ON "BandSuggestion"("createdAt");

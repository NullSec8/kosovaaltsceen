-- Run this in Supabase: SQL Editor → New query → paste → Run
-- Creates the tables for Kosovo Alt Scene (Band, Album, Member, Image)

-- Enum for band status
CREATE TYPE "BandStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- Bands table
CREATE TABLE "Band" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "yearFounded" INTEGER NOT NULL,
  "status" "BandStatus" NOT NULL,
  "genres" TEXT[] NOT NULL,
  "biography" TEXT NOT NULL,
  "youtubeUrl" TEXT,
  "spotifyUrl" TEXT,
  "instagramUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Band_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Band_slug_key" ON "Band"("slug");
CREATE INDEX "Band_name_idx" ON "Band"("name");
CREATE INDEX "Band_city_idx" ON "Band"("city");
CREATE INDEX "Band_yearFounded_idx" ON "Band"("yearFounded");
CREATE INDEX "Band_status_idx" ON "Band"("status");

-- Albums table
CREATE TABLE "Album" (
  "id" TEXT NOT NULL,
  "bandId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "releaseYear" INTEGER NOT NULL,
  "coverImage" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Album_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Album_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Album_bandId_idx" ON "Album"("bandId");
CREATE INDEX "Album_releaseYear_idx" ON "Album"("releaseYear");

-- Members table
CREATE TABLE "Member" (
  "id" TEXT NOT NULL,
  "bandId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "yearsActive" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Member_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Member_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Member_bandId_idx" ON "Member"("bandId");

-- Images table
CREATE TABLE "Image" (
  "id" TEXT NOT NULL,
  "bandId" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "caption" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Image_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Image_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Image_bandId_idx" ON "Image"("bandId");

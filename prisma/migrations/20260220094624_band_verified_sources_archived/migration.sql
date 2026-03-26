-- AlterTable
ALTER TABLE "Band" ADD COLUMN     "archivedUrl" TEXT,
ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "sources" JSONB;

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bandId" TEXT NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Interview_slug_key" ON "Interview"("slug");

-- CreateIndex
CREATE INDEX "Interview_dateCreated_idx" ON "Interview"("dateCreated");

-- CreateIndex
CREATE INDEX "Interview_bandId_idx" ON "Interview"("bandId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add ReleaseType enum and Album.type with default
CREATE TYPE "ReleaseType" AS ENUM ('ALBUM', 'EP', 'SINGLE');

ALTER TABLE "Album"
ADD COLUMN "type" "ReleaseType" NOT NULL DEFAULT 'ALBUM';

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VOLUNTEER');

-- AlterTable
ALTER TABLE "Communication" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'VOLUNTEER';

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Everyone who could sign in until now managed everything.
UPDATE "User" SET "role" = 'ADMIN';

-- Sign-in looks emails up lower-cased. An email that would then clash with
-- another account's is left as it is and has to be fixed by hand.
UPDATE "User" AS u
SET "email" = LOWER(u."email")
WHERE u."email" <> LOWER(u."email")
  AND NOT EXISTS (
    SELECT 1 FROM "User" AS o
    WHERE o."id" <> u."id" AND LOWER(o."email") = LOWER(u."email")
  );

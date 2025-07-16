-- DropIndex
DROP INDEX "Donor_oib_key";

-- AlterTable
ALTER TABLE "Donor" ALTER COLUMN "dob" DROP NOT NULL,
ALTER COLUMN "oib" DROP NOT NULL,
ALTER COLUMN "bloodType" DROP NOT NULL;

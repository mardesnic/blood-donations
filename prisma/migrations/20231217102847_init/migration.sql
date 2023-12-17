-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('SMS', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "DenyReasonType" AS ENUM ('SEVEN_DAYS', 'FIFTEEN_DAYS', 'ONE_MONTH', 'SIX_MONTHS', 'ONE_YEAR', 'LONGER', 'PERMANENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "fullName" VARCHAR(100),
    "fatherName" VARCHAR(100),
    "email" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(100),
    "dob" TIMESTAMP(3) NOT NULL,
    "oib" VARCHAR(11) NOT NULL,
    "address" VARCHAR(100),
    "city" VARCHAR(100),
    "gender" "Gender" NOT NULL,
    "bloodType" "BloodType" NOT NULL,
    "donationCount" INTEGER NOT NULL DEFAULT 0,
    "lastDonation" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "actionId" TEXT,
    "denied" BOOLEAN NOT NULL DEFAULT false,
    "denyReason" "DenyReasonType",
    "donationDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "placeId" TEXT,
    "title" VARCHAR(100) NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "donationCount" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Communication" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "address" VARCHAR(100),
    "city" VARCHAR(100),
    "phone" VARCHAR(100),
    "email" VARCHAR(100),
    "contactName" VARCHAR(100),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_email_key" ON "Donor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_oib_key" ON "Donor"("oib");

-- CreateIndex
CREATE INDEX "Donor_firstName_idx" ON "Donor"("firstName");

-- CreateIndex
CREATE INDEX "Donor_lastName_idx" ON "Donor"("lastName");

-- CreateIndex
CREATE INDEX "Donor_city_idx" ON "Donor"("city");

-- CreateIndex
CREATE INDEX "Donor_address_idx" ON "Donor"("address");

-- CreateIndex
CREATE INDEX "Donor_bloodType_idx" ON "Donor"("bloodType");

-- CreateIndex
CREATE INDEX "Action_title_idx" ON "Action"("title");

-- CreateIndex
CREATE INDEX "Communication_type_idx" ON "Communication"("type");

-- CreateIndex
CREATE INDEX "Place_title_idx" ON "Place"("title");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

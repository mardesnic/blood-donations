-- AlterTable
ALTER TABLE "Donor" ADD COLUMN "initialDonationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "initialLastDonation" TIMESTAMP(3);

-- Until now donationCount and lastDonation were never updated when donations
-- were recorded, so their current values become the starting values.
UPDATE "Donor"
SET "initialDonationCount" = "donationCount",
    "initialLastDonation" = "lastDonation";

-- Totals = starting values + recorded successful donations. Donation times
-- are moments; their calendar day is taken in Europe/Zagreb.
UPDATE "Donor" AS d
SET "donationCount" = d."initialDonationCount" + s.successful,
    "lastDonation" = GREATEST(d."initialLastDonation", s.last_day)
FROM (
    SELECT "donorId",
           COUNT(*)::INTEGER AS successful,
           date_trunc('day', (MAX("donationDate") AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Zagreb') AS last_day
    FROM "Donation"
    WHERE NOT "denied"
    GROUP BY "donorId"
) AS s
WHERE s."donorId" = d."id";

-- Action counts were never maintained either (no form field sets them).
UPDATE "Action" AS a
SET "donationCount" = (
    SELECT COUNT(*)::INTEGER
    FROM "Donation"
    WHERE "actionId" = a."id" AND NOT "denied"
);

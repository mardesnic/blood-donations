-- Calendar dates are stored as UTC midnight of the day. The CSV import used
-- the import machine's local midnight instead, which in Croatia is 22:00 or
-- 23:00 UTC of the previous day. Move exactly those values (local midnight in
-- Europe/Zagreb, not already UTC midnight) to UTC midnight of the local day.

UPDATE "Donor"
SET "dob" = date_trunc('day', ("dob" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Zagreb')
WHERE "dob"::time <> '00:00'
  AND (("dob" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Zagreb')::time = '00:00';

UPDATE "Donor"
SET "lastDonation" = date_trunc('day', ("lastDonation" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Zagreb')
WHERE "lastDonation"::time <> '00:00'
  AND (("lastDonation" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Zagreb')::time = '00:00';

UPDATE "Donor"
SET "initialLastDonation" = date_trunc('day', ("initialLastDonation" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Zagreb')
WHERE "initialLastDonation"::time <> '00:00'
  AND (("initialLastDonation" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Zagreb')::time = '00:00';

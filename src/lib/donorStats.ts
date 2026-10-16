import { toAppDay } from '@/lib/dates';

// A donor's totals are the starting values (donations before the app, from
// the CSV import or typed in) plus the successful donations recorded here.
export function computeDonorStats(
  initialDonationCount: number | null | undefined,
  initialLastDonation: Date | null | undefined,
  successfulDonations: number | null | undefined,
  latestSuccessfulDonation: Date | null | undefined
): { donationCount: number; lastDonation: Date | null } {
  const latestDay = toAppDay(latestSuccessfulDonation);
  const initialDay = initialLastDonation ?? null;
  let lastDonation = latestDay ?? initialDay;
  if (latestDay && initialDay && initialDay > latestDay) {
    lastDonation = initialDay;
  }
  return {
    donationCount: (initialDonationCount || 0) + (successfulDonations || 0),
    lastDonation,
  };
}

import { toAppDay } from '@/lib/dates';

// Donation counts worth celebrating (successful donations, including those
// from before the records started).
export const MILESTONES = [10, 20, 30, 40, 50, 75, 100] as const;

const count = (value: number | null | undefined) =>
  Number.isFinite(value) && (value as number) > 0 ? (value as number) : 0;

// The highest milestone reached with this many donations, or null.
export function reachedMilestone(
  donationCount: number | null | undefined
): number | null {
  const total = count(donationCount);
  return [...MILESTONES].reverse().find((m) => m <= total) ?? null;
}

// The next milestone and how many donations it still needs, or null after
// the last one.
export function nextMilestone(
  donationCount: number | null | undefined
): { milestone: number; remaining: number } | null {
  const total = count(donationCount);
  const milestone = MILESTONES.find((m) => m > total);
  return milestone ? { milestone, remaining: milestone - total } : null;
}

// Donation counts one short of a milestone: the next successful donation
// reaches it.
export const ONE_BEFORE_MILESTONE = MILESTONES.map((m) => m - 1);

// The milestones a donor has reached and the day each was reached (a
// calendar date, UTC midnight). A milestone among the donations from before
// the records has no known day, except the last of them, which is the
// initial last donation.
export function milestoneDates(
  initialDonationCount: number | null | undefined,
  initialLastDonation: Date | null | undefined,
  successfulDonationDates: (Date | null | undefined)[] | null | undefined
): { milestone: number; date: Date | null }[] {
  const initial = count(initialDonationCount);
  const days = (successfulDonationDates || [])
    .map((date) => toAppDay(date ?? null))
    .filter((day): day is Date => !!day)
    .sort((a, b) => a.getTime() - b.getTime());
  const total = initial + days.length;
  return MILESTONES.filter((m) => m <= total).map((milestone) => ({
    milestone,
    date:
      milestone < initial
        ? null
        : milestone === initial
          ? (initialLastDonation ?? null)
          : days[milestone - initial - 1],
  }));
}

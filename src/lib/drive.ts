// When a donation entered in drive mode happened: now while the action is
// on, otherwise (entering beforehand or afterwards) the action's start.
export function defaultDonationTime(
  now: Date,
  start: Date | string | null | undefined,
  end: Date | string | null | undefined
): Date {
  const from = start ? new Date(start) : null;
  const to = end ? new Date(end) : null;
  if (!from || Number.isNaN(from.getTime())) {
    return now;
  }
  const until = to && !Number.isNaN(to.getTime()) ? to : from;
  return now >= from && now <= until ? now : from;
}

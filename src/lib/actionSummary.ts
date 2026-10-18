import { BLOOD_TYPES } from '@/lib/const';

export interface ActionDonation {
  denied: boolean;
  denyReason: string | null;
  donor: { bloodType: string | null } | null;
}

export interface ActionSummary {
  successful: number;
  denied: number;
  // Most common first.
  denyReasons: { reason: string | null; count: number }[];
  // Of successful donations, most common first; null is "unknown".
  bloodTypes: { bloodType: string | null; count: number }[];
}

const BLOOD_TYPE_ORDER = Object.keys(BLOOD_TYPES);

function tally<K extends string | null>(keys: K[], order: (key: K) => number) {
  const counts = new Map<K, number>();
  for (const key of keys) {
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || order(a.key) - order(b.key));
}

// How an action went: successful and denied donations, why donors were
// denied and the blood types collected.
export function summarizeActionDonations(
  donations: ActionDonation[] | null | undefined
): ActionSummary {
  const list = donations || [];
  const successful = list.filter((d) => !d.denied);
  const denied = list.filter((d) => d.denied);
  // Unknown values go last among equal counts.
  const rank = (keys: string[]) => (key: string | null) =>
    key === null ? keys.length : keys.indexOf(key);
  return {
    successful: successful.length,
    denied: denied.length,
    denyReasons: tally(
      denied.map((d) => d.denyReason),
      () => 0
    ).map(({ key, count }) => ({ reason: key, count })),
    bloodTypes: tally(
      successful.map((d) => d.donor?.bloodType ?? null),
      rank(BLOOD_TYPE_ORDER)
    ).map(({ key, count }) => ({ bloodType: key, count })),
  };
}

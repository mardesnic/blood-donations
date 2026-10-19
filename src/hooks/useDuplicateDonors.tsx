import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DuplicateReason, isOib } from '@/lib/duplicates';
import { DonorListItem } from '@/hooks/useDonors';

export interface DuplicateMatch {
  // With eligibility, like the donors list.
  donor: DonorListItem;
  reason: DuplicateReason;
}

interface Input {
  firstName?: string;
  lastName?: string;
  // "YYYY-MM-DD" or empty.
  dob?: string;
  oib?: string;
  // The donor being edited, who is not a duplicate of themselves.
  excludeId?: string;
}

// Existing donors who may be the same person, looked up once typing pauses.
export function useDuplicateDonors(input: Input): DuplicateMatch[] {
  const params = new URLSearchParams({
    firstName: input.firstName?.trim() || '',
    lastName: input.lastName?.trim() || '',
    dob: input.dob || '',
    oib: input.oib?.trim() || '',
    excludeId: input.excludeId || '',
  }).toString();
  const [debounced, setDebounced] = useState(params);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(params), 400);
    return () => clearTimeout(timer);
  }, [params]);

  const query = new URLSearchParams(debounced);
  const enabled =
    isOib(query.get('oib')) ||
    (!!query.get('firstName') && !!query.get('lastName'));
  const { data } = useQuery({
    queryKey: ['DONOR_DUPLICATES', debounced],
    queryFn: async () =>
      (
        (await fetch(`/api/donors/duplicates?${debounced}`).then((r) =>
          r.json()
        )) as { matches: DuplicateMatch[] }
      ).matches,
    enabled,
  });
  return enabled ? data || [] : [];
}

// Saving is blocked by the same OIB, and by the same name and date of birth
// until the user confirms it is a different person.
export function duplicatesBlockSaving(
  matches: DuplicateMatch[] | null | undefined,
  confirmedDifferent: boolean
): boolean {
  const list = matches || [];
  return (
    list.some((m) => m.reason === 'oib') ||
    (!confirmedDifferent && list.some((m) => m.reason === 'nameDob'))
  );
}

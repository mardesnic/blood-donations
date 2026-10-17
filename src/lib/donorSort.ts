import { Prisma } from '@/generated/prisma/client';

// Sortable donor columns that can be empty. Postgres puts empty values first
// when sorting descending, so these ask for them last in both directions.
const NULLABLE_SORT_FIELDS = new Set([
  'fullName',
  'oib',
  'bloodType',
  'lastDonation',
  'dob',
]);

// The donors list and export order: the chosen column, empty values last,
// then id so rows with equal values keep their order between pages.
export function donorOrderBy(
  sortField: string | null | undefined,
  sort: string | null | undefined
): Prisma.DonorOrderByWithRelationInput[] {
  const direction: Prisma.SortOrder = sort === 'asc' ? 'asc' : 'desc';
  const field = sortField || 'createdAt';
  const primary = NULLABLE_SORT_FIELDS.has(field)
    ? { [field]: { sort: direction, nulls: 'last' } }
    : { [field]: direction };
  return [primary as Prisma.DonorOrderByWithRelationInput, { id: 'asc' }];
}

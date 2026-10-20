import { NextRequest, NextResponse } from 'next/server';
import CommunicationService from '@/app/api/communications/service';
import { parseCallListQuery } from '@/lib/callList';
import { parsePagination, withAuth } from '@/lib/api';

// Donors to call: ?bloodType=&city=&hideContacted=&page=&pageSize=
// (see parseCallListQuery). ?cities=1 also returns the cities to pick from.
export const GET = withAuth(async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const { take, skip } = parsePagination(
    params.get('page'),
    params.get('pageSize')
  );
  const [list, cities] = await Promise.all([
    CommunicationService.callList(parseCallListQuery(params), take, skip),
    params.get('cities') ? CommunicationService.cities() : undefined,
  ]);
  return NextResponse.json({ ...list, cities });
});

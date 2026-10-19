import { NextRequest, NextResponse } from 'next/server';
import DonorService from '../service';
import { withAuth } from '@/lib/api';

// Donors who may be the same person as the one being entered:
// ?firstName=&lastName=&dob=YYYY-MM-DD&oib=&excludeId=
export const GET = withAuth(async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const matches = await DonorService.findDuplicates(
    {
      firstName: params.get('firstName'),
      lastName: params.get('lastName'),
      dob: params.get('dob'),
      oib: params.get('oib'),
    },
    params.get('excludeId') || undefined
  );
  return NextResponse.json({ matches });
});

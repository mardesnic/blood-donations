import { NextRequest, NextResponse } from 'next/server';
import ActionService from '../../service';
import { withAuth } from '@/lib/api';

// Successful and denied donations recorded at the action so far (the
// running count on the drive-mode page).
export const GET = withAuth(
  async (_: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return NextResponse.json(await ActionService.donationCounts(id));
  }
);

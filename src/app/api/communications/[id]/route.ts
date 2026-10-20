import { NextRequest, NextResponse } from 'next/server';
import CommunicationService from '../service';
import { withAuth } from '@/lib/api';

// Removes a contact logged by mistake (see CommunicationService.delete).
export const DELETE = withAuth(
  async (
    _: NextRequest,
    context: { params: Promise<{ id: string }> },
    user
  ) => {
    const { id } = await context.params;
    await CommunicationService.delete(id, user);
    return NextResponse.json({
      message: `Successfully deleted contact ${id}.`,
    });
  }
);

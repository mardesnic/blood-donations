import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from 'yup';
import CommunicationService, {
  MAX_CONTACT_NOTE_LENGTH,
} from '@/app/api/communications/service';
import { isContactType } from '@/lib/callList';
import { withAuth } from '@/lib/api';

type Context = { params: Promise<{ id: string }> };

// The donor's latest contacts, newest first.
export const GET = withAuth(async (_: NextRequest, context: Context) => {
  const { id } = await context.params;
  const contacts = await CommunicationService.history(id);
  return NextResponse.json({ contacts });
});

// Logs a contact: { type: 'CALL' | 'SMS' | 'EMAIL', note?: string }.
export const POST = withAuth(
  async (req: NextRequest, context: Context, user) => {
    const { id } = await context.params;
    const body = (await req.json()) as Record<string, unknown> | null;
    const type = body?.type;
    const note = typeof body?.note === 'string' ? body.note.trim() : '';
    if (!isContactType(type)) {
      throw new ValidationError('type must be CALL, SMS or EMAIL');
    }
    if (note.length > MAX_CONTACT_NOTE_LENGTH) {
      throw new ValidationError(
        `note must be at most ${MAX_CONTACT_NOTE_LENGTH} characters`
      );
    }
    const contact = await CommunicationService.log(
      id,
      type,
      note || null,
      user.id
    );
    return NextResponse.json(contact);
  }
);

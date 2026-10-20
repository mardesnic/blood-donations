import { prisma } from '@/db';
import { Prisma } from '@/generated/prisma/client';
import { eligibleNowWhere } from '@/lib/donorFilters';
import { CallListQuery, contactedSince, ContactType } from '@/lib/callList';
import { toAppDay } from '@/lib/dates';
import { ForbiddenError } from '@/lib/api';
import { isAdmin } from '@/lib/users';
import { CurrentUser } from '@/app/api/auth/service';

const CONTACT_FIELDS = {
  id: true,
  type: true,
  note: true,
  createdAt: true,
  createdById: true,
  // Who logged it; null for older contacts.
  createdBy: { select: { name: true, email: true } },
} as const;

const LATEST_CONTACT = {
  orderBy: { createdAt: 'desc' },
  take: 1,
  select: CONTACT_FIELDS,
} as const;

export type Contact = Prisma.CommunicationGetPayload<{
  select: typeof CONTACT_FIELDS;
}>;

export const MAX_CONTACT_NOTE_LENGTH = 500;
// The donor page shows this many of the latest contacts.
const HISTORY_LENGTH = 20;

export default class CommunicationService {
  // Donors who can donate now and can be reached by phone or e-mail, with
  // their latest contact. Those longest since their last donation come first.
  static async callList(query: CallListQuery, take: number, skip: number) {
    const today = toAppDay(new Date()) as Date;
    const since = contactedSince(query.hideContactedDays, today);
    const where: Prisma.DonorWhereInput = {
      AND: [
        eligibleNowWhere(today),
        { OR: [{ phone: { not: '' } }, { email: { not: '' } }] },
        query.bloodTypes.length ? { bloodType: { in: query.bloodTypes } } : {},
        query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {},
        since
          ? { communications: { none: { createdAt: { gte: since } } } }
          : {},
      ],
    };
    const [donors, count] = await Promise.all([
      prisma.donor.findMany({
        where,
        take,
        skip,
        orderBy: [
          { lastDonation: { sort: 'asc', nulls: 'last' } },
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          bloodType: true,
          city: true,
          phone: true,
          email: true,
          lastDonation: true,
          donationCount: true,
          communications: LATEST_CONTACT,
        },
      }),
      prisma.donor.count({ where }),
    ]);
    return {
      donors: donors.map(({ communications, ...donor }) => ({
        ...donor,
        lastContact: communications[0] ?? null,
      })),
      count,
    };
  }

  // Cities of donors, for the call list's city picker; spellings that differ
  // only in case or spaces are listed once, as the filter ignores case.
  static async cities(): Promise<string[]> {
    const rows = await prisma.donor.findMany({
      where: { city: { not: null }, NOT: { city: '' } },
      distinct: ['city'],
      select: { city: true },
      orderBy: { city: 'asc' },
    });
    const byKey = new Map<string, string>();
    for (const { city } of rows) {
      const name = (city || '').trim();
      if (name && !byKey.has(name.toLowerCase())) {
        byKey.set(name.toLowerCase(), name);
      }
    }
    return Array.from(byKey.values());
  }

  static async lastContact(donorId: string): Promise<Contact | null> {
    return prisma.communication.findFirst({
      where: { donorId },
      ...LATEST_CONTACT,
    });
  }

  static async history(donorId: string): Promise<Contact[]> {
    return prisma.communication.findMany({
      where: { donorId },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LENGTH,
      select: CONTACT_FIELDS,
    });
  }

  // Throws P2025 (404) for an unknown donor.
  static async log(
    donorId: string,
    type: ContactType,
    note: string | null,
    createdById: string
  ): Promise<Contact> {
    await prisma.donor.findUniqueOrThrow({
      where: { id: donorId },
      select: { id: true },
    });
    return prisma.communication.create({
      data: { donorId, type, note, createdById },
      select: CONTACT_FIELDS,
    });
  }

  // Volunteers may remove only contacts they logged (e.g. Undo on the call
  // list); admins may remove any. Throws P2025 (404) for an unknown id.
  static async delete(id: string, user: CurrentUser) {
    const contact = await prisma.communication.findUniqueOrThrow({
      where: { id },
      select: { createdById: true },
    });
    if (!isAdmin(user) && contact.createdById !== user.id) {
      throw new ForbiddenError(
        "Only admins can delete other people's contacts.",
        'ADMIN_ONLY'
      );
    }
    return prisma.communication.delete({ where: { id } });
  }
}

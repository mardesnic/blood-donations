import { prisma } from '@/db';
import { BLOOD_TYPES, DATE_FORMAT } from '@/lib/const';
import { buildDonorFilter } from '@/lib/donorFilters';
import { donorOrderBy } from '@/lib/donorSort';
import {
  DUPLICATE_REASONS,
  DuplicateInput,
  DuplicateReason,
  duplicateReason,
  isOib,
} from '@/lib/duplicates';
import { ConflictError } from '@/lib/api';
import { ageOn, formatDay, toAppDay } from '@/lib/dates';
import {
  computeEligibility,
  Eligibility,
  eligibilityLabel,
  EligibilityTranslate,
} from '@/lib/eligibility';
import { donorDataFromBody } from './body';
import { refreshActionStats, refreshDonorStats } from './stats';

type DonorInput = ReturnType<typeof donorDataFromBody>;
import { Donor, Prisma } from '@/generated/prisma/client';
import dayjs from 'dayjs';
import { format } from 'fast-csv';
import { Readable } from 'stream';

// The export's columns in order; their names are in the "export" messages.
const EXPORT_COLUMNS = [
  'firstName',
  'lastName',
  'fatherName',
  'oib',
  'email',
  'phone',
  'city',
  'gender',
  'bloodType',
  'donations',
  'lastDonation',
  'nextEligible',
  'dob',
  'note',
  'createdAt',
  'updatedAt',
  'active',
] as const;

// Denied attempts, which the eligibility rules need.
const DENIALS = {
  where: { denied: true },
  select: { donationDate: true, denyReason: true },
} as const;

export type DonorWithEligibility = Donor & {
  eligibility: Eligibility;
  _count: { donations: number };
};

export default class DonorService {
  static async find(
    take: number,
    skip: number,
    search: string,
    filters: string[],
    sortField: keyof Donor = 'createdAt',
    sort: string = 'desc'
  ): Promise<{ donors: DonorWithEligibility[]; count: number }> {
    const today = toAppDay(new Date()) as Date;
    const whereCondition = this.constructWhereCondition(search, filters, today);

    const donors = await prisma.donor.findMany({
      take,
      skip,
      orderBy: donorOrderBy(sortField, sort),
      where: whereCondition,
      include: {
        _count: {
          select: { donations: true },
        },
        donations: DENIALS,
      },
    });
    const count = await prisma.donor.count({ where: whereCondition });
    return {
      donors: donors.map(({ donations, ...donor }) => ({
        ...donor,
        eligibility: computeEligibility(
          { ...donor, denials: donations },
          today
        ),
      })),
      count,
    };
  }

  // The donor for its overview page, with eligibility and age worked out the
  // same way as in the donors list.
  static async findOverview(id: string) {
    const today = toAppDay(new Date()) as Date;
    const found = await prisma.donor.findUnique({
      where: { id },
      include: { donations: DENIALS },
    });
    if (!found) {
      return null;
    }
    const { donations, ...donor } = found;
    return {
      donor,
      eligibility: computeEligibility({ ...donor, denials: donations }, today),
      age: ageOn(donor.dob, today),
    };
  }

  // Just the donor: its pages load donations separately, page by page.
  static async findOne(id: string) {
    return await prisma.donor.findUnique({ where: { id } });
  }

  // Donors who may be the same person as `input` (see duplicateReason),
  // strongest match first, leaving out the donor being edited.
  static async findDuplicates(input: DuplicateInput, excludeId?: string) {
    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();
    const or: Prisma.DonorWhereInput[] = [];
    if (isOib(input.oib)) {
      or.push({ oib: input.oib?.trim() });
    }
    if (firstName && lastName) {
      or.push({
        firstName: { equals: firstName, mode: 'insensitive' },
        lastName: { equals: lastName, mode: 'insensitive' },
      });
    }
    if (!or.length) {
      return [];
    }
    const today = toAppDay(new Date()) as Date;
    const candidates = await prisma.donor.findMany({
      where: { OR: or, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      include: { donations: DENIALS },
      take: 10,
    });
    // With eligibility, like the donors list, for picking one in drive mode.
    return candidates
      .map(({ donations, ...donor }) => ({
        donor: {
          ...donor,
          eligibility: computeEligibility(
            { ...donor, denials: donations },
            today
          ),
        },
        reason: duplicateReason(donor, input),
      }))
      .filter(
        (
          match
        ): match is {
          donor: Donor & { eligibility: Eligibility };
          reason: DuplicateReason;
        } => !!match.reason
      )
      .sort(
        (a, b) =>
          DUPLICATE_REASONS.indexOf(a.reason) -
          DUPLICATE_REASONS.indexOf(b.reason)
      );
  }

  // One OIB belongs to one person. Only checked when the OIB is set or
  // changed, so donors that already share one can still be edited.
  private static async assertOibFree(
    tx: Prisma.TransactionClient,
    oib: string | null,
    id?: string
  ) {
    if (!oib) {
      return;
    }
    if (id) {
      const current = await tx.donor.findUnique({
        where: { id },
        select: { oib: true },
      });
      if (current?.oib === oib) {
        return;
      }
    }
    const taken = await tx.donor.findFirst({
      where: { oib, ...(id ? { NOT: { id } } : {}) },
      select: { id: true },
    });
    if (taken) {
      throw new ConflictError('Another donor has this OIB.', 'DUPLICATE_OIB');
    }
  }

  static async create(data: DonorInput): Promise<Donor> {
    return prisma.$transaction(async (tx) => {
      await this.assertOibFree(tx, data.oib);
      const donor = await tx.donor.create({ data });
      await refreshDonorStats(tx, donor.id);
      return tx.donor.findUniqueOrThrow({ where: { id: donor.id } });
    });
  }

  static async update(id: string, data: DonorInput) {
    return prisma.$transaction(async (tx) => {
      await this.assertOibFree(tx, data.oib, id);
      await tx.donor.update({ where: { id }, data });
      await refreshDonorStats(tx, id);
      return tx.donor.findUniqueOrThrow({ where: { id } });
    });
  }

  static async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      const donations = await tx.donation.findMany({
        where: { donorId: id },
        select: { actionId: true },
      });
      await tx.donation.deleteMany({ where: { donorId: id } });
      await tx.communication.deleteMany({ where: { donorId: id } });
      const donor = await tx.donor.delete({ where: { id } });
      for (const actionId of Array.from(
        new Set(donations.map((d) => d.actionId))
      )) {
        await refreshActionStats(tx, actionId);
      }
      return donor;
    });
  }

  static async generateExport(
    search: string,
    filters: string[],
    sortField: keyof Donor = 'createdAt',
    sort: string = 'desc',
    // All messages, for the column names and the values (gender, blood
    // type, status, eligibility) in the user's language.
    t: (key: string, values?: Record<string, string | number>) => string
  ): Promise<string> {
    const tEligibility: EligibilityTranslate = (key, values) =>
      t(`eligibility.${key}`, values);
    const today = toAppDay(new Date()) as Date;
    const whereCondition = this.constructWhereCondition(search, filters, today);

    const donors = await prisma.donor.findMany({
      orderBy: donorOrderBy(sortField, sort),
      where: whereCondition,
      include: { donations: DENIALS },
    });

    const csvData = donors.map((donor) => {
      const row: Record<(typeof EXPORT_COLUMNS)[number], unknown> = {
        firstName: donor.firstName,
        lastName: donor.lastName,
        fatherName: donor.fatherName,
        oib: donor.oib,
        email: donor.email,
        phone: donor.phone,
        city: donor.city,
        gender: t(`genders.${donor.gender}`),
        bloodType: donor.bloodType ? BLOOD_TYPES[donor.bloodType] : '',
        donations: donor.donationCount,
        lastDonation: formatDay(donor.lastDonation),
        nextEligible: eligibilityLabel(
          computeEligibility({ ...donor, denials: donor.donations }, today),
          tEligibility
        ),
        dob: formatDay(donor.dob),
        note: donor.note,
        createdAt: dayjs(donor.createdAt).format(DATE_FORMAT),
        updatedAt: dayjs(donor.updatedAt).format(DATE_FORMAT),
        active: t(`statuses.${donor.active ? 'ACTIVE' : 'INACTIVE'}`),
      };
      return Object.fromEntries(
        EXPORT_COLUMNS.map((key) => [t(`export.${key}`), row[key]])
      );
    });

    // Convert donors to CSV
    const csvStream = format({ headers: true });
    csvData.forEach((donor) => csvStream.write(donor));
    csvStream.end();

    // Convert stream to a promise of a string
    const streamToString = (stream: Readable): Promise<string> => {
      const chunks: Buffer[] = [];
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', reject);
        stream.on('end', () =>
          resolve(
            Buffer.concat(chunks as unknown as Uint8Array[]).toString('utf-8')
          )
        );
      });
    };

    return streamToString(csvStream);
  }

  private static constructWhereCondition(
    search: string,
    filters: string[],
    today: Date
  ): Prisma.DonorWhereInput {
    let whereCondition = {};
    let searchCondition = {};
    const filterCondition = buildDonorFilter(filters, today);
    if (search?.length) {
      searchCondition = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { oib: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    if (
      Object.values(searchCondition).length &&
      Object.values(filterCondition).length
    ) {
      whereCondition = { AND: [searchCondition, filterCondition] };
    } else {
      whereCondition = { ...searchCondition, ...filterCondition };
    }

    return whereCondition;
  }
}

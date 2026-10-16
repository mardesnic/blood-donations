import { prisma } from '@/db';
import { DATE_FORMAT } from '@/lib/const';
import { buildDonorFilter } from '@/lib/donorFilters';
import { formatDay } from '@/lib/dates';
import { donorDataFromBody } from './body';
import { refreshActionStats, refreshDonorStats } from './stats';

type DonorInput = ReturnType<typeof donorDataFromBody>;
import { Donor, Prisma } from '@/generated/prisma/client';
import dayjs from 'dayjs';
import { format } from 'fast-csv';
import { Readable } from 'stream';

export default class DonorService {
  static async find(
    take: number,
    skip: number,
    search: string,
    filters: string[],
    sortField: keyof Donor = 'createdAt',
    sort: string = 'desc'
  ): Promise<{ donors: Donor[]; count: number }> {
    const whereCondition = this.constructWhereCondition(search, filters);

    const donors = await prisma.donor.findMany({
      take,
      skip,
      orderBy: { [sortField]: sort },
      where: whereCondition,
      include: {
        _count: {
          select: { donations: true },
        },
      },
    });
    const count = await prisma.donor.count({ where: whereCondition });
    return { donors, count };
  }

  static async findOne(id: string) {
    return await prisma.donor.findUnique({
      where: { id },
      include: {
        donations: true,
        communications: true,
      },
    });
  }

  static async create(data: DonorInput): Promise<Donor> {
    return prisma.$transaction(async (tx) => {
      const donor = await tx.donor.create({ data });
      await refreshDonorStats(tx, donor.id);
      return tx.donor.findUniqueOrThrow({ where: { id: donor.id } });
    });
  }

  static async update(id: string, data: DonorInput) {
    return prisma.$transaction(async (tx) => {
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
    sort: string = 'desc'
  ): Promise<string> {
    const whereCondition = this.constructWhereCondition(search, filters);

    const donors = await prisma.donor.findMany({
      orderBy: { [sortField]: sort },
      where: whereCondition,
    });

    const csvData = donors.map((donor) => ({
      Name: donor.firstName,
      'Last Name': donor.lastName,
      'Father Name': donor.fatherName,
      OIB: donor.oib,
      Email: donor.email,
      Phone: donor.phone,
      City: donor.city,
      Gender: donor.gender,
      'Blood Type': donor.bloodType,
      Donations: donor.donationCount,
      'Last Donation': formatDay(donor.lastDonation),
      'Date of Birth': formatDay(donor.dob),
      Note: donor.note,
      'Created At': dayjs(donor.createdAt).format(DATE_FORMAT),
      'Updated At': dayjs(donor.updatedAt).format(DATE_FORMAT),
      Active: donor.active,
    }));

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
    filters: string[]
  ): Prisma.DonorWhereInput {
    let whereCondition = {};
    let searchCondition = {};
    const filterCondition = buildDonorFilter(filters);
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

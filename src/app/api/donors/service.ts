import { prisma } from '@/db';
import { DATE_FORMAT } from '@/lib/const';
import {
  getPrismaOperatorFromGridOperator,
  getPrismaTermFromGridOperator,
} from '@/lib/utils';
import { Donor, Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { format } from 'fast-csv';
import { Readable } from 'stream';

export default class DonorService {
  static async find(
    take: number,
    skip: number,
    search: string,
    filterField: keyof Donor,
    filterOperator: string,
    filterTerm: string,
    sortField: keyof Donor = 'createdAt',
    sort: string = 'desc'
  ): Promise<{ donors: Donor[]; count: number }> {
    const whereCondition = this.constructWhereCondition(
      search,
      filterField,
      filterOperator,
      filterTerm
    );
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

  static async create(data: Partial<Donor>): Promise<Donor> {
    return await prisma.donor.create({
      data: data as Donor,
    });
  }

  static async update(id: string, data: Partial<Donor>) {
    return await prisma.donor.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    await prisma.donation.deleteMany({
      where: { donorId: id },
    });
    await prisma.communication.deleteMany({
      where: { donorId: id },
    });
    return await prisma.donor.delete({ where: { id } });
  }

  static async generateExport(
    search: string,
    filterField: keyof Donor,
    filterOperator: string,
    filterTerm: string,
    sortField: keyof Donor = 'createdAt',
    sort: string = 'desc'
  ): Promise<string> {
    const whereCondition = this.constructWhereCondition(
      search,
      filterField,
      filterOperator,
      filterTerm
    );
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
      'Last Donation': dayjs(donor.lastDonation).format(DATE_FORMAT),
      'Date of Birth': dayjs(donor.dob).format(DATE_FORMAT),
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
          resolve(Buffer.concat(chunks).toString('utf-8'))
        );
      });
    };

    return streamToString(csvStream);
  }

  private static constructWhereCondition(
    search: string,
    filterField: keyof Donor,
    filterOperator: string,
    filterTerm: string
  ): Prisma.DonorWhereInput {
    let whereCondition = {};
    let searchCondition = {};
    let filterCondition = {};
    if (search?.length) {
      searchCondition = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { oib: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    if (filterField && filterOperator && typeof filterTerm !== 'undefined') {
      const { prismaOperator, mode } =
        getPrismaOperatorFromGridOperator(filterOperator);
      const prismaTerm = getPrismaTermFromGridOperator(
        filterOperator,
        filterTerm
      );
      if (prismaTerm !== '') {
        filterCondition = {
          [filterField]: {
            [prismaOperator]: prismaTerm,
            mode,
          },
        };
      }
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

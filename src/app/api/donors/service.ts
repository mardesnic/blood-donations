import { prisma } from '@/db';
import {
  getPrismaOperatorFromGridOperator,
  getPrismaTermFromGridOperator,
} from '@/lib/utils';
import { Donor, Prisma } from '@prisma/client';

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
          { fullName: { contains: search } },
          { city: { contains: search } },
          { email: { contains: search } },
          { oib: { contains: search } },
        ],
      };
    }
    if (filterField && filterOperator && typeof filterTerm !== 'undefined') {
      const prismaOperator = getPrismaOperatorFromGridOperator(filterOperator);
      const prismaTerm = getPrismaTermFromGridOperator(
        filterOperator,
        filterTerm
      );
      if (prismaTerm !== '') {
        filterCondition = { [filterField]: { [prismaOperator]: prismaTerm } };
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

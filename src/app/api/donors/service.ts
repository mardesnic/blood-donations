import { prisma } from '@/db';
import {
  getPrismaOperatorFromGridOperator,
  getPrismaTermFromGridOperator,
} from '@/lib/utils';
import { Donor } from '@prisma/client';

export default class DonorService {
  static async find(
    take: number,
    skip: number,
    search: string,
    filterField: keyof Donor,
    filterOperator: string,
    filterTerm: string
  ): Promise<{ donors: Donor[]; count: number }> {
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
      if (prismaTerm !== '' && prismaTerm.toString().length !== 0) {
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
    // TODO: remove dev log after testing
    console.log('searchCondition', JSON.stringify(searchCondition, null, 2));
    console.log('filterCondition', JSON.stringify(filterCondition, null, 2));
    console.log('whereCondition', JSON.stringify(whereCondition, null, 2));

    const donors = await prisma.donor.findMany({
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      where: whereCondition,
    });
    const count = await prisma.donor.count({ where: whereCondition });
    return { donors, count };
  }

  static async findOne(id: string) {
    return await prisma.donor.findUnique({
      where: { id },
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
}

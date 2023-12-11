import { prisma } from '@/db';
import { Donor } from '@prisma/client';

export default class DonorService {
  static async find(
    take: number,
    skip: number,
    search: string[]
  ): Promise<{ donors: Donor[]; count: number }> {
    let whereCondition = {};
    if (search?.length) {
      const fullNameCondition = { fullName: { contains: search.join(' ') } };
      const searchConditions = search.map((term) => ({
        OR: [
          { city: { contains: term } },
          { email: { contains: term } },
          { oib: { contains: term } },
        ],
      }));
      whereCondition = { OR: [fullNameCondition, ...searchConditions] };
    }

    const donors = await prisma.donor.findMany({
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      where: whereCondition,
    });
    const count = await prisma.donor.count();
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

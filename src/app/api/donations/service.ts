import { prisma } from '@/db';
import { Donation } from '@prisma/client';

export default class DonationService {
  static async find(
    take: number,
    skip: number,
    sortField: keyof Donation = 'donationDate',
    sort: string = 'desc'
  ) {
    return Promise.all([
      prisma.donation.findMany({
        take,
        skip,
        orderBy: { [sortField]: sort },
        include: {
          donor: true,
          action: true,
        },
      }),
      prisma.donation.count(),
    ]);
  }

  static async findOne(id: string) {
    return await prisma.donation.findUnique({
      where: { id },
    });
  }

  static async create(data: Donation): Promise<Donation> {
    return prisma.donation.create({
      data,
    });
  }

  static async update(id: string, data: Partial<Donation>) {
    return await prisma.donation.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.donation.delete({ where: { id } });
  }
}

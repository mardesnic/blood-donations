import { prisma } from '@/db';
import { Donation } from '@prisma/client';

export default class DonationService {
  static async find() {
    return await prisma.donation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
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

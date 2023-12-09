import { prisma } from '@/db';
import { Donor } from '@prisma/client';

export default class DonorService {
  static async find() {
    return await prisma.donor.findMany({ orderBy: { createdAt: 'desc' } });
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

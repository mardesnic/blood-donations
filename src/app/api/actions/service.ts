import { prisma } from '@/db';
import { Action } from '@prisma/client';

export default class ActionService {
  static async find() {
    return await prisma.action.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        place: true,
      },
    });
  }

  static async findOne(id: string) {
    return await prisma.action.findUnique({
      where: { id },
    });
  }

  static async create(data: Action): Promise<Action> {
    return prisma.action.create({
      data,
    });
  }

  static async update(id: string, data: Partial<Action>) {
    return await prisma.action.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    await prisma.donation.updateMany({
      where: { actionId: id },
      data: { actionId: null },
    });
    return prisma.action.delete({ where: { id } });
  }
}

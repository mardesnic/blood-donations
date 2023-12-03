import { prisma } from '@/db';
import { Action } from '@prisma/client';

export default class ActionService {
  static async find() {
    return await prisma.action.findMany({ orderBy: { createdAt: 'desc' } });
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
    return prisma.action.delete({ where: { id } });
  }
}

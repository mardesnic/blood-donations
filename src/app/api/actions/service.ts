import { prisma } from '@/db';

export default class ActionService {
  static async find() {
    return await prisma.action.findMany();
  }
}

import { prisma } from '@/db';

export default class PlaceService {
  static async find() {
    return await prisma.place.findMany();
  }
}

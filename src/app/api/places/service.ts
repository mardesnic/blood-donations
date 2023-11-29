import { prisma } from '@/db';

export default class PlaceService {
  static async find() {
    return await prisma.place.findMany();
  }

  static async delete(id: string) {
    await prisma.action.updateMany({
      where: { placeId: id },
      data: { placeId: null },
    });
    return await prisma.place.delete({ where: { id } });
  }
}

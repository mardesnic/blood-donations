import { prisma } from '@/db';
import { Place } from '@prisma/client';

export default class PlaceService {
  static async find() {
    return await prisma.place.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async findOne(id: string) {
    return await prisma.place.findUnique({
      where: { id },
    });
  }

  static async create(data: Partial<Place>): Promise<Place> {
    return await prisma.place.create({
      data: data as Place,
    });
  }

  static async update(id: string, data: Partial<Place>) {
    return await prisma.place.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    await prisma.action.updateMany({
      where: { placeId: id },
      data: { placeId: null },
    });
    return await prisma.place.delete({ where: { id } });
  }
}

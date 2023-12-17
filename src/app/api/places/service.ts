import { prisma } from '@/db';
import {
  getPrismaOperatorFromGridOperator,
  getPrismaTermFromGridOperator,
} from '@/lib/utils';
import { Place, Prisma } from '@prisma/client';

export default class PlaceService {
  static async find(
    take: number,
    skip: number,
    search: string,
    filterField: keyof Place,
    filterOperator: string,
    filterTerm: string,
    sortField: keyof Place = 'createdAt',
    sort: string = 'desc'
  ): Promise<{ places: Place[]; count: number }> {
    const whereCondition = this.constructWhereCondition(
      search,
      filterField,
      filterOperator,
      filterTerm
    );
    const places = await prisma.place.findMany({
      take,
      skip,
      orderBy: { [sortField]: sort },
      where: whereCondition,
    });
    const count = await prisma.place.count({ where: whereCondition });
    return { places, count };
  }

  static async findOne(id: string) {
    return await prisma.place.findUnique({
      where: { id },
      include: {
        actions: {
          include: {
            donations: true,
          },
        },
      },
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

  private static constructWhereCondition(
    search: string,
    filterField: keyof Place,
    filterOperator: string,
    filterTerm: string
  ): Prisma.PlaceWhereInput {
    let whereCondition = {};
    let searchCondition = {};
    let filterCondition = {};
    if (search?.length) {
      searchCondition = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    if (filterField && filterOperator && typeof filterTerm !== 'undefined') {
      const prismaOperator = getPrismaOperatorFromGridOperator(filterOperator);
      const prismaTerm = getPrismaTermFromGridOperator(
        filterOperator,
        filterTerm
      );
      if (prismaTerm !== '') {
        filterCondition = { [filterField]: { [prismaOperator]: prismaTerm } };
      }
    }
    if (
      Object.values(searchCondition).length &&
      Object.values(filterCondition).length
    ) {
      whereCondition = { AND: [searchCondition, filterCondition] };
    } else {
      whereCondition = { ...searchCondition, ...filterCondition };
    }
    return whereCondition;
  }
}

import { prisma } from '@/db';
import {
  getPrismaOperatorFromGridOperator,
  getPrismaTermFromGridOperator,
} from '@/lib/utils';
import { Place, Prisma } from '@/generated/prisma/client';

// How many actions use each place, shown in the list and when deleting.
const ACTION_COUNT = {
  _count: { select: { actions: true } },
} as const;

export type PlaceWithActionCount = Prisma.PlaceGetPayload<{
  include: typeof ACTION_COUNT;
}>;

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
  ): Promise<{ places: PlaceWithActionCount[]; count: number }> {
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
      include: ACTION_COUNT,
    });
    const count = await prisma.place.count({ where: whereCondition });
    return { places, count };
  }

  static async findOne(id: string) {
    return await prisma.place.findUnique({
      where: { id },
      include: ACTION_COUNT,
    });
  }

  // The place for its overview page, with a summary of its actions.
  static async findOverview(id: string) {
    const place = await prisma.place.findUnique({
      where: { id },
      include: ACTION_COUNT,
    });
    if (!place) {
      return null;
    }
    const now = new Date();
    const select = {
      id: true,
      title: true,
      startDateTime: true,
      endDateTime: true,
    };
    const [totals, nextAction, lastAction] = await Promise.all([
      prisma.action.aggregate({
        where: { placeId: id },
        _sum: { donationCount: true },
      }),
      prisma.action.findFirst({
        where: { placeId: id, startDateTime: { gte: now } },
        orderBy: { startDateTime: 'asc' },
        select,
      }),
      prisma.action.findFirst({
        where: { placeId: id, startDateTime: { lt: now } },
        orderBy: { startDateTime: 'desc' },
        select,
      }),
    ]);
    return {
      place,
      donationCount: totals._sum.donationCount ?? 0,
      nextAction,
      lastAction,
    };
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
      const { prismaOperator, mode } =
        getPrismaOperatorFromGridOperator(filterOperator);
      const prismaTerm = getPrismaTermFromGridOperator(
        filterOperator,
        filterTerm
      );
      if (prismaTerm !== '') {
        filterCondition = {
          [filterField]: { [prismaOperator]: prismaTerm, mode },
        };
      }
    }
    if (
      Object.values(searchCondition).length &&
      Object.values(filterCondition).length
    ) {
      return { AND: [searchCondition, filterCondition] };
    }
    return { ...searchCondition, ...filterCondition };
  }
}

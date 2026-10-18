import { prisma } from '@/db';
import { Action, Prisma } from '@/generated/prisma/client';
import { summarizeActionDonations } from '@/lib/actionSummary';

export default class ActionService {
  static async find(
    placeId: string,
    take: number,
    skip: number,
    sortField: keyof Action = 'startDateTime',
    sort: string = 'desc'
  ) {
    let whereCondition: Prisma.ActionWhereInput = {};
    if (placeId) {
      whereCondition = { placeId };
    }

    return Promise.all([
      prisma.action.findMany({
        take,
        skip,
        orderBy: { [sortField]: sort },
        include: {
          place: true,
        },
        where: whereCondition,
      }),
      prisma.action.count({
        where: whereCondition,
      }),
    ]);
  }

  static async findOne(id: string) {
    return await prisma.action.findUnique({
      where: { id },
      include: {
        place: true,
      },
    });
  }

  // The action for its overview page, with how its donations went.
  static async findOverview(id: string) {
    const action = await prisma.action.findUnique({
      where: { id },
      include: { place: true },
    });
    if (!action) {
      return null;
    }
    const donations = await prisma.donation.findMany({
      where: { actionId: id },
      select: {
        denied: true,
        denyReason: true,
        donor: { select: { bloodType: true } },
      },
    });
    return { action, summary: summarizeActionDonations(donations) };
  }

  static async create(
    data: Prisma.ActionUncheckedCreateInput
  ): Promise<Action> {
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

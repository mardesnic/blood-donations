import { prisma } from '@/db';
import { Donation, Prisma } from '@/generated/prisma/client';
import { ConflictError } from '@/lib/api';
import { refreshActionStats, refreshDonorStats } from '../donors/stats';

export default class DonationService {
  static async find(
    donorId: string,
    actionId: string,
    take: number,
    skip: number,
    sortField: keyof Donation | 'donor' = 'donationDate',
    sort: 'asc' | 'desc' = 'desc'
  ) {
    let whereCondition: Prisma.DonationWhereInput = {};
    if (donorId) {
      whereCondition = { donorId };
    }

    if (actionId) {
      whereCondition = { actionId };
    }

    // Determine the orderBy condition
    const orderByCondition =
      sortField === 'donor'
        ? { donor: { fullName: sort } } // Sort by donor name
        : { [sortField]: sort }; // Sort by other fields

    return Promise.all([
      prisma.donation.findMany({
        take,
        skip,
        orderBy: orderByCondition,
        include: {
          donor: true,
          action: true,
        },
        where: whereCondition,
      }),
      prisma.donation.count({
        where: whereCondition,
      }),
    ]);
  }

  static async findOne(id: string) {
    return await prisma.donation.findUnique({
      where: { id },
      include: {
        donor: true,
        action: true,
      },
    });
  }

  // Each change refreshes the totals of every donor and action it touches,
  // in the same transaction.
  static async create(
    data: Prisma.DonationUncheckedCreateInput
  ): Promise<Donation> {
    if (!data.denied) {
      data.denyReason = null;
    }
    return prisma.$transaction(async (tx) => {
      const donation = await tx.donation.create({ data });
      await refreshDonorStats(tx, donation.donorId);
      await refreshActionStats(tx, donation.actionId);
      return donation;
    });
  }

  static async update(id: string, data: Partial<Donation>) {
    if (!data.denied) {
      data.denyReason = null;
    }
    return prisma.$transaction(async (tx) => {
      const before = await tx.donation.findUniqueOrThrow({ where: { id } });
      // The donor is fixed once saved (see the edit form).
      if (data.donorId && data.donorId !== before.donorId) {
        throw new ConflictError(
          'A donation cannot be moved to another donor.',
          'DONOR_LOCKED'
        );
      }
      const donation = await tx.donation.update({ where: { id }, data });
      for (const donorId of Array.from(
        new Set([before.donorId, donation.donorId])
      )) {
        await refreshDonorStats(tx, donorId);
      }
      for (const actionId of Array.from(
        new Set([before.actionId, donation.actionId])
      )) {
        await refreshActionStats(tx, actionId);
      }
      return donation;
    });
  }

  static async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      const donation = await tx.donation.delete({ where: { id } });
      await refreshDonorStats(tx, donation.donorId);
      await refreshActionStats(tx, donation.actionId);
      return donation;
    });
  }
}

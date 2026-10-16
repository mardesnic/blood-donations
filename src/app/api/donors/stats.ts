import { Prisma } from '@prisma/client';
import { computeDonorStats } from '@/lib/donorStats';

type Tx = Prisma.TransactionClient;

// Recalculates a donor's totals from the starting values and the recorded
// successful (not denied) donations.
export async function refreshDonorStats(tx: Tx, donorId: string) {
  const donor = await tx.donor.findUnique({
    where: { id: donorId },
    select: { initialDonationCount: true, initialLastDonation: true },
  });
  if (!donor) {
    return;
  }
  const recorded = await tx.donation.aggregate({
    where: { donorId, denied: false },
    _count: { _all: true },
    _max: { donationDate: true },
  });
  await tx.donor.update({
    where: { id: donorId },
    data: computeDonorStats(
      donor.initialDonationCount,
      donor.initialLastDonation,
      recorded._count._all,
      recorded._max.donationDate
    ),
  });
}

export async function refreshActionStats(
  tx: Tx,
  actionId: string | null | undefined
) {
  if (!actionId) {
    return;
  }
  const donationCount = await tx.donation.count({
    where: { actionId, denied: false },
  });
  await tx.action.updateMany({
    where: { id: actionId },
    data: { donationCount },
  });
}

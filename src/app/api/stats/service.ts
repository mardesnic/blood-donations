import { prisma } from '@/db';
import { APP_TIME_ZONE, appDayStart, parseDay, toAppDay } from '@/lib/dates';
import { eligibleNowWhere } from '@/lib/donorFilters';
import { BLOOD_TYPES } from '@/lib/const';
import {
  fillMonths,
  MonthRow,
  monthKeys,
  yearToDatePeriods,
} from '@/lib/overviewStats';

const BLOOD_TYPE_ORDER = Object.keys(BLOOD_TYPES);

export type Overview = Awaited<ReturnType<typeof StatsService.overview>>;

export default class StatsService {
  // Everything the overview page shows, for today in the app's time zone.
  static async overview() {
    const now = new Date();
    const today = toAppDay(now) as Date;
    const { thisYear, lastYear } = yearToDatePeriods(today);
    const months = monthKeys(today);
    const monthsFrom = appDayStart(parseDay(`${months[0]}-01`) as Date);
    const inThisYear = { gte: thisYear.from, lt: thisYear.to };
    const eligible = eligibleNowWhere(today);

    const [
      successfulThisYear,
      deniedThisYear,
      successfulLastYear,
      activeDonors,
      eligibleDonors,
      newDonors,
      monthRows,
      activeByBloodType,
      eligibleByBloodType,
      denyReasons,
      upcomingActions,
      recentActions,
    ] = await Promise.all([
      prisma.donation.count({
        where: { denied: false, donationDate: inThisYear },
      }),
      prisma.donation.count({
        where: { denied: true, donationDate: inThisYear },
      }),
      prisma.donation.count({
        where: {
          denied: false,
          donationDate: { gte: lastYear.from, lt: lastYear.to },
        },
      }),
      prisma.donor.count({ where: { active: true } }),
      prisma.donor.count({ where: eligible }),
      prisma.donor.count({ where: { createdAt: inThisYear } }),
      // Dates are stored as UTC; months are counted in the app's time zone.
      prisma.$queryRaw<MonthRow[]>`
        SELECT
          to_char(("donationDate" AT TIME ZONE 'UTC') AT TIME ZONE ${APP_TIME_ZONE}, 'YYYY-MM') AS month,
          denied,
          count(*)::int AS count
        FROM "Donation"
        WHERE "donationDate" >= ${monthsFrom}
        GROUP BY 1, 2`,
      prisma.donor.groupBy({
        by: ['bloodType'],
        where: { active: true },
        _count: { _all: true },
      }),
      prisma.donor.groupBy({
        by: ['bloodType'],
        where: eligible,
        _count: { _all: true },
      }),
      prisma.donation.groupBy({
        by: ['denyReason'],
        where: { denied: true, donationDate: inThisYear },
        _count: { _all: true },
      }),
      prisma.action.findMany({
        where: { startDateTime: { gte: now } },
        orderBy: { startDateTime: 'asc' },
        take: 3,
        include: { place: { select: { title: true } } },
      }),
      prisma.action.findMany({
        where: { startDateTime: { lt: now } },
        orderBy: { startDateTime: 'desc' },
        take: 3,
        include: {
          place: { select: { title: true } },
          _count: { select: { donations: { where: { denied: true } } } },
        },
      }),
    ]);

    const eligibleCounts = new Map(
      eligibleByBloodType.map((row) => [row.bloodType, row._count._all])
    );
    const bloodTypes = activeByBloodType
      .map((row) => ({
        bloodType: row.bloodType,
        active: row._count._all,
        eligible: eligibleCounts.get(row.bloodType) ?? 0,
      }))
      // The usual order, unknown last.
      .sort((a, b) => rank(a.bloodType) - rank(b.bloodType));

    return {
      successfulThisYear,
      deniedThisYear,
      successfulLastYear,
      activeDonors,
      eligibleDonors,
      newDonors,
      months: fillMonths(monthRows, months),
      bloodTypes,
      denyReasons: denyReasons
        .map((row) => ({ reason: row.denyReason, count: row._count._all }))
        .sort((a, b) => b.count - a.count),
      upcomingActions: upcomingActions.map((action) => ({
        id: action.id,
        title: action.title,
        place: action.place?.title ?? null,
        startDateTime: action.startDateTime,
        endDateTime: action.endDateTime,
      })),
      recentActions: recentActions.map((action) => ({
        id: action.id,
        title: action.title,
        place: action.place?.title ?? null,
        startDateTime: action.startDateTime,
        endDateTime: action.endDateTime,
        successful: action.donationCount,
        denied: action._count.donations,
      })),
    };
  }
}

function rank(bloodType: string | null) {
  return bloodType === null
    ? BLOOD_TYPE_ORDER.length
    : BLOOD_TYPE_ORDER.indexOf(bloodType);
}

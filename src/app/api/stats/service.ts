import { prisma } from '@/db';
import {
  addDays,
  APP_TIME_ZONE,
  appDayStart,
  parseDay,
  toAppDay,
} from '@/lib/dates';
import { buildReport, Report, ReportPeriod } from '@/lib/reports';
import { eligibleNowWhere } from '@/lib/donorFilters';
import { BLOOD_TYPES } from '@/lib/const';
import { ONE_BEFORE_MILESTONE } from '@/lib/milestones';
import {
  fillMonths,
  MonthRow,
  monthKeys,
  yearToDatePeriods,
} from '@/lib/overviewStats';

const BLOOD_TYPE_ORDER = Object.keys(BLOOD_TYPES);

// Donors listed on the overview as close to a milestone.
const NEAR_MILESTONE_SHOWN = 8;

export type Overview = Awaited<ReturnType<typeof StatsService.overview>>;

export default class StatsService {
  // Everything a report needs for the period (whole days in the app's time
  // zone, both ends included).
  static async report(period: ReportPeriod): Promise<Report> {
    const range = {
      gte: appDayStart(period.from),
      lt: appDayStart(addDays(period.to, 1)),
    };
    const [donations, newDonors, actions, milestoneDonors] = await Promise.all([
      prisma.donation.findMany({
        where: { donationDate: range },
        select: {
          donationDate: true,
          denied: true,
          denyReason: true,
          actionId: true,
          donor: {
            select: {
              id: true,
              gender: true,
              bloodType: true,
              dob: true,
              initialDonationCount: true,
            },
          },
        },
      }),
      prisma.donor.count({ where: { createdAt: range } }),
      prisma.action.findMany({
        where: { startDateTime: range },
        include: { place: { select: { title: true } } },
      }),
      prisma.donor.findMany({
        where: {
          OR: [
            { donations: { some: { denied: false, donationDate: range } } },
            {
              initialLastDonation: { gte: period.from, lte: period.to },
            },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          bloodType: true,
          initialDonationCount: true,
          initialLastDonation: true,
          donations: {
            where: { denied: false },
            select: { donationDate: true },
          },
        },
      }),
    ]);
    const donorIds = [
      ...new Set(donations.filter((d) => !d.denied).map((d) => d.donor.id)),
    ];
    const [firstDonations, actionCounts] = await Promise.all([
      prisma.donation.groupBy({
        by: ['donorId'],
        where: { denied: false, donorId: { in: donorIds } },
        _min: { donationDate: true },
      }),
      // All of each action's donations, whatever their date.
      prisma.donation.groupBy({
        by: ['actionId', 'denied'],
        where: { actionId: { in: actions.map((a) => a.id) } },
        _count: { _all: true },
      }),
    ]);
    const actionCount = (id: string, denied: boolean) =>
      actionCounts.find((c) => c.actionId === id && c.denied === denied)?._count
        ._all ?? 0;
    return buildReport({
      period,
      donations,
      firstDonations: new Map(
        firstDonations.map((row) => [
          row.donorId,
          row._min.donationDate as Date,
        ])
      ),
      newDonors,
      milestoneDonors: milestoneDonors.map(({ donations: list, ...donor }) => ({
        ...donor,
        successfulDonationDates: list.map((d) => d.donationDate),
      })),
      actions: actions.map((action) => ({
        id: action.id,
        title: action.title,
        place: action.place?.title ?? null,
        startDateTime: action.startDateTime,
        endDateTime: action.endDateTime,
        successful: actionCount(action.id, false),
        denied: actionCount(action.id, true),
      })),
    });
  }

  // Everything the overview page shows, for today in the app's time zone.
  static async overview() {
    const now = new Date();
    const today = toAppDay(now) as Date;
    const { thisYear, lastYear } = yearToDatePeriods(today);
    const months = monthKeys(today);
    const monthsFrom = appDayStart(parseDay(`${months[0]}-01`) as Date);
    const inThisYear = { gte: thisYear.from, lt: thisYear.to };
    const eligible = eligibleNowWhere(today);
    // Can donate now, and the next donation reaches a milestone.
    const nearMilestone = {
      AND: [eligible, { donationCount: { in: ONE_BEFORE_MILESTONE } }],
    };

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
      nearMilestoneDonors,
      nearMilestoneCount,
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
      prisma.donor.findMany({
        where: nearMilestone,
        orderBy: [
          { donationCount: 'desc' },
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
        take: NEAR_MILESTONE_SHOWN,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          bloodType: true,
          donationCount: true,
        },
      }),
      prisma.donor.count({ where: nearMilestone }),
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
      nearMilestone: {
        donors: nearMilestoneDonors.map((donor) => ({
          ...donor,
          milestone: donor.donationCount + 1,
        })),
        count: nearMilestoneCount,
      },
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

import { actionTimesText } from '@/components/ActionTimes';
import { BLOOD_TYPES } from '@/lib/const';
import { formatDay } from '@/lib/dates';
import { getDisplayName } from '@/lib/utils';
import { Report } from '@/lib/reports';

type Translate = (
  key: string,
  values?: Record<string, string | number>
) => string;

export const REPORT_TABLES = [
  'totals',
  'months',
  'actions',
  'bloodTypes',
  'genderAge',
  'denyReasons',
  'milestones',
] as const;
export type ReportTableKey = (typeof REPORT_TABLES)[number];

export interface ReportTable {
  key: ReportTableKey;
  title: string;
  columns: string[];
  // Columns after the first hold numbers (right-aligned on the page).
  numeric: boolean[];
  rows: (string | number)[][];
  // Nothing to show for the period (the page says so instead of a table).
  empty: boolean;
}

// Tables that list every month or age group whatever the period, so they are
// empty when all their counts are 0.
const ZERO_MEANS_EMPTY: ReportTableKey[] = ['months', 'genderAge'];

// No rows, or only zeros in a table that always has rows. The totals are
// never empty: for them 0 is the answer.
function isEmptyTable(table: Omit<ReportTable, 'empty'>): boolean {
  if (table.key === 'totals') {
    return false;
  }
  if (ZERO_MEANS_EMPTY.includes(table.key)) {
    return table.rows.every((row) =>
      row.every((cell) => typeof cell !== 'number' || cell === 0)
    );
  }
  return !table.rows.length;
}

// The report's tables in the user's language, shared by the page and the
// Excel export so both always show the same thing.
export function reportTables(
  report: Report,
  t: Translate,
  locale: string
): ReportTable[] {
  const month = (key: string) => {
    const [year, number] = key.split('-').map(Number);
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, number - 1, 1)));
  };
  const unknown = t('common.unknown');
  const { totals } = report;
  const tables: Omit<ReportTable, 'empty'>[] = [
    {
      key: 'totals',
      title: t('reports.totals'),
      columns: [t('reports.measure'), t('reports.value')],
      numeric: [false, true],
      rows: [
        [t('reports.successful'), totals.successful],
        [t('reports.denied'), totals.denied],
        [t('reports.attempts'), totals.attempts],
        [
          t('reports.denialRate'),
          totals.denialRate === null ? '—' : `${totals.denialRate}%`,
        ],
        [t('reports.uniqueDonors'), totals.uniqueDonors],
        [t('reports.firstTime'), totals.firstTimeDonors],
        [t('reports.newDonors'), totals.newDonors],
        [t('reports.actionsHeld'), totals.actions],
      ],
    },
    {
      key: 'months',
      title: t('reports.months'),
      columns: [
        t('reports.month'),
        t('reports.successful'),
        t('reports.denied'),
      ],
      numeric: [false, true, true],
      rows: report.months.map((m) => [month(m.month), m.successful, m.denied]),
    },
    {
      key: 'actions',
      title: t('reports.actions'),
      columns: [
        t('reports.action'),
        t('reports.time'),
        t('fields.place'),
        t('reports.successful'),
        t('reports.denied'),
      ],
      numeric: [false, false, false, true, true],
      rows: [
        ...report.actions.map((a) => [
          a.title,
          actionTimesText(a.startDateTime, a.endDateTime),
          a.place ?? '',
          a.successful,
          a.denied,
        ]),
        ...(report.withoutAction.successful || report.withoutAction.denied
          ? [
              [
                t('reports.withoutAction'),
                '',
                '',
                report.withoutAction.successful,
                report.withoutAction.denied,
              ],
            ]
          : []),
      ],
    },
    {
      key: 'bloodTypes',
      title: t('reports.bloodTypes'),
      columns: [t('fields.bloodType'), t('reports.successful')],
      numeric: [false, true],
      rows: report.bloodTypes.map((b) => [
        b.bloodType ? BLOOD_TYPES[b.bloodType] || b.bloodType : unknown,
        b.count,
      ]),
    },
    {
      key: 'genderAge',
      title: t('reports.genderAge'),
      columns: [
        t('reports.ageGroup'),
        t('genders.MALE'),
        t('genders.FEMALE'),
        t('reports.total'),
      ],
      numeric: [false, true, true, true],
      rows: report.genderAge.map((g) => [
        g.group === 'other'
          ? t('reports.otherAge')
          : g.group === 'unknown'
            ? unknown
            : g.group,
        g.male,
        g.female,
        g.total,
      ]),
    },
    {
      key: 'denyReasons',
      title: t('reports.denyReasons'),
      columns: [t('fields.reason'), t('reports.count')],
      numeric: [false, true],
      rows: report.denyReasons.map((r) => [
        r.reason ? t(`denyReasons.${r.reason}`) : unknown,
        r.count,
      ]),
    },
    {
      key: 'milestones',
      title: t('milestones.reportTitle'),
      columns: [
        t('milestones.date'),
        t('fields.donor'),
        t('fields.bloodType'),
        t('milestones.label'),
      ],
      numeric: [false, false, false, true],
      rows: report.milestones.map((m) => [
        formatDay(m.date),
        getDisplayName([m.lastName, m.firstName]),
        m.bloodType ? BLOOD_TYPES[m.bloodType] || m.bloodType : unknown,
        m.milestone,
      ]),
    },
  ];
  return tables.map((table) => ({ ...table, empty: isEmptyTable(table) }));
}

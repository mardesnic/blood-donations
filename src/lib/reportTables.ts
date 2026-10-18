import { actionTimesText } from '@/components/ActionTimes';
import { BLOOD_TYPES } from '@/lib/const';
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
] as const;
export type ReportTableKey = (typeof REPORT_TABLES)[number];

export interface ReportTable {
  key: ReportTableKey;
  title: string;
  columns: string[];
  // Columns after the first hold numbers (right-aligned on the page).
  numeric: boolean[];
  rows: (string | number)[][];
}

// The report's tables in the user's language, shared by the page and the
// CSV export so both always show the same thing.
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
  return [
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
  ];
}

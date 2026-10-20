import {
  BloodType,
  CommunicationType,
  DenyReasonType,
} from '@/generated/prisma/browser';
import { BLOOD_TYPES } from '@/lib/const';
import { addDays, appDayStart, formatDay, toAppDay } from '@/lib/dates';
import { formatContactDay } from '@/lib/callList';
import { getDisplayName } from '@/lib/utils';

// The two sheets of a blood drive: who is expected (to tick off on paper at
// the drive) and how it went (the donations recorded for it).
export const DRIVE_SHEETS = ['expected', 'results'] as const;
export type DriveSheetKey = (typeof DRIVE_SHEETS)[number];

export function parseDriveSheet(
  value: string | string[] | null | undefined,
  fallback: DriveSheetKey
): DriveSheetKey {
  const first = Array.isArray(value) ? value[0] : value;
  return DRIVE_SHEETS.find((key) => key === first) ?? fallback;
}

// Donors contacted (from the call list) this many days before the drive
// starts, up to its end, are expected.
export const EXPECTED_CONTACT_DAYS = 30;

// Empty rows at the end of the printed expected sheet, for walk-ins.
export const BLANK_ROWS = 10;

export function expectedContactWindow(
  start: Date,
  end: Date
): { from: Date; to: Date } {
  const startDay = toAppDay(start) as Date;
  return {
    from: appDayStart(addDays(startDay, -EXPECTED_CONTACT_DAYS)),
    to: end,
  };
}

interface SheetDonor {
  firstName: string;
  lastName: string;
  bloodType: BloodType | null;
  oib: string | null;
}

export interface ExpectedDonor extends SheetDonor {
  dob: Date | null;
  phone: string | null;
  // Their latest contact in the window.
  contact: {
    type: CommunicationType;
    createdAt: Date;
    note: string | null;
  } | null;
}

export interface DriveResult {
  donor: SheetDonor;
  denied: boolean;
  denyReason: DenyReasonType | null;
  note: string | null;
}

export interface DriveSheet {
  key: DriveSheetKey;
  title: string;
  columns: string[];
  rows: string[][];
}

type Translate = (
  key: string,
  values?: Record<string, string | number>
) => string;

const byName = (a: SheetDonor, b: SheetDonor) =>
  a.lastName.localeCompare(b.lastName, 'hr') ||
  a.firstName.localeCompare(b.firstName, 'hr');

const name = (donor: SheetDonor) =>
  getDisplayName([donor.lastName, donor.firstName]);

const bloodType = (donor: SheetDonor) =>
  donor.bloodType ? BLOOD_TYPES[donor.bloodType] : '';

// A sheet in the user's language, shared by the print page and the CSV
// export. Rows are numbered and sorted by last name.
export function driveSheet(
  key: DriveSheetKey,
  data:
    | {
        expected?: ExpectedDonor[] | null;
        results?: DriveResult[] | null;
      }
    | null
    | undefined,
  t: Translate
): DriveSheet {
  if (key === 'expected') {
    return {
      key,
      title: t('driveSheets.expected'),
      columns: [
        '#',
        t('driveSheets.name'),
        t('fields.bloodType'),
        t('fields.dob'),
        t('fields.oib'),
        t('fields.phone'),
        t('driveSheets.contacted'),
        t('driveSheets.donated'),
        t('driveSheets.deniedReason'),
      ],
      rows: [...(data?.expected || [])].sort(byName).map((donor, index) => [
        String(index + 1),
        name(donor),
        bloodType(donor),
        formatDay(donor.dob),
        donor.oib || '',
        donor.phone || '',
        donor.contact
          ? [
              t('contacts.summary', {
                type: t(`contacts.types.${donor.contact.type}`),
                date: formatContactDay(donor.contact.createdAt),
              }),
              donor.contact.note,
            ]
              .filter(Boolean)
              .join(' — ')
          : '',
        '',
        '',
      ]),
    };
  }
  return {
    key,
    title: t('driveSheets.results'),
    columns: [
      '#',
      t('driveSheets.name'),
      t('fields.bloodType'),
      t('fields.oib'),
      t('driveSheets.result'),
      t('fields.note'),
    ],
    rows: [...(data?.results || [])]
      .sort((a, b) => byName(a.donor, b.donor))
      .map((donation, index) => [
        String(index + 1),
        name(donation.donor),
        bloodType(donation.donor),
        donation.donor.oib || '',
        donation.denied
          ? [
              t('driveSheets.resultDenied'),
              donation.denyReason && t(`denyReasons.${donation.denyReason}`),
            ]
              .filter(Boolean)
              .join(': ')
          : t('driveSheets.resultSuccessful'),
        donation.note || '',
      ]),
  };
}

// A file-name-safe version of a title: "Akcija Čakovec" -> "akcija-cakovec".
export function fileSlug(text: string | null | undefined): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

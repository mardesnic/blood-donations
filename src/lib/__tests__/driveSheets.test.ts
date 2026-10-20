import { describe, expect, it } from 'vitest';
import {
  driveSheet,
  DriveResult,
  ExpectedDonor,
  expectedContactWindow,
  fileSlug,
  parseDriveSheet,
} from '@/lib/driveSheets';

// Returns the key, with any values, so the tests don't need the messages.
const t = (key: string, values?: Record<string, string | number>) =>
  values ? `${key}(${Object.values(values).join(',')})` : key;

const donor = (overrides: Partial<ExpectedDonor>): ExpectedDonor => ({
  firstName: 'Ana',
  lastName: 'Horvat',
  bloodType: 'A_POSITIVE',
  oib: '12345678903',
  dob: new Date('1990-05-01T00:00:00.000Z'),
  phone: '091 111 2222',
  contact: null,
  ...overrides,
});

describe('parseDriveSheet', () => {
  it('falls back for null, undefined, empty and unknown input', () => {
    for (const value of [null, undefined, '', 'nope', []]) {
      expect(parseDriveSheet(value, 'results')).toBe('results');
    }
  });

  it('takes a known sheet, or the first of repeated values', () => {
    expect(parseDriveSheet('expected', 'results')).toBe('expected');
    expect(parseDriveSheet(['results', 'expected'], 'expected')).toBe(
      'results'
    );
  });
});

describe('expectedContactWindow', () => {
  it('starts at midnight in Zagreb, 30 days before the drive day', () => {
    const start = new Date('2026-10-24T07:00:00.000Z');
    const end = new Date('2026-10-24T12:00:00.000Z');
    expect(expectedContactWindow(start, end)).toEqual({
      // 24 September starts at 22:00 UTC the day before (summer time).
      from: new Date('2026-09-23T22:00:00.000Z'),
      to: end,
    });
  });
});

describe('driveSheet', () => {
  it('has headers and no rows for null, undefined and empty data', () => {
    for (const data of [null, undefined, {}, { expected: [], results: [] }]) {
      for (const key of ['expected', 'results'] as const) {
        const sheet = driveSheet(key, data, t);
        expect(sheet.key).toBe(key);
        expect(sheet.columns.length).toBeGreaterThan(0);
        expect(sheet.rows).toEqual([]);
      }
    }
  });

  it('numbers expected donors by last name, with the contact and blank boxes', () => {
    const sheet = driveSheet(
      'expected',
      {
        expected: [
          donor({
            firstName: 'Ivo',
            lastName: 'Šimić',
            bloodType: null,
            dob: null,
            oib: null,
            phone: null,
          }),
          donor({
            contact: {
              type: 'CALL',
              createdAt: new Date('2026-10-18T21:30:00.000Z'),
              note: 'Dolazi u petak',
            },
          }),
        ],
      },
      t
    );
    expect(sheet.rows).toEqual([
      [
        '1',
        'Horvat Ana',
        'A+',
        '01.05.1990.',
        '12345678903',
        '091 111 2222',
        'contacts.summary(contacts.types.CALL,18.10.2026.) — Dolazi u petak',
        '',
        '',
      ],
      ['2', 'Šimić Ivo', '', '', '', '', '', '', ''],
    ]);
    expect(sheet.rows[0]).toHaveLength(sheet.columns.length);
  });

  it('lists results with the deny reason', () => {
    const results: DriveResult[] = [
      {
        donor: donor({ lastName: 'Kovač' }),
        denied: true,
        denyReason: 'ONE_MONTH',
        note: null,
      },
      {
        donor: donor({}),
        denied: false,
        denyReason: null,
        note: 'Prvi put',
      },
      {
        donor: donor({ lastName: 'Zorić' }),
        denied: true,
        denyReason: null,
        note: null,
      },
    ];
    const sheet = driveSheet('results', { results }, t);
    expect(sheet.rows.map((row) => row[4])).toEqual([
      'driveSheets.resultSuccessful',
      'driveSheets.resultDenied: denyReasons.ONE_MONTH',
      'driveSheets.resultDenied',
    ]);
    expect(sheet.rows[0][5]).toBe('Prvi put');
    expect(sheet.rows[0]).toHaveLength(sheet.columns.length);
  });
});

describe('fileSlug', () => {
  it('is empty for null, undefined and empty input', () => {
    expect(fileSlug(null)).toBe('');
    expect(fileSlug(undefined)).toBe('');
    expect(fileSlug('')).toBe('');
  });

  it('drops accents and punctuation', () => {
    expect(fileSlug('Akcija: Čakovec, Đurđevac!')).toBe(
      'akcija-cakovec-durdevac'
    );
  });
});

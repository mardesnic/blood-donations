import { describe, expect, it } from 'vitest';
import readXlsxFile from 'read-excel-file/node';
import { excelDateTime, sheetName, toXlsx } from '@/lib/excel';

const read = async (file: Buffer) => (await readXlsxFile(file))[0];

describe('toXlsx', () => {
  it('writes an empty sheet for null, undefined and empty input', async () => {
    for (const file of [
      await toXlsx(null, null),
      await toXlsx(undefined, undefined),
      await toXlsx([], []),
    ]) {
      const sheet = await read(file);
      expect(sheet.sheet).toBe('Sheet1');
      expect(sheet.data.flat().filter((cell) => cell !== null)).toEqual([]);
    }
  });

  it('writes the header row even without rows', async () => {
    const sheet = await read(await toXlsx(['#', 'Ime'], [], 'Darivatelji'));
    expect(sheet).toEqual({ sheet: 'Darivatelji', data: [['#', 'Ime']] });
  });

  it('keeps numbers, calendar dates and moments as Excel values', async () => {
    const sheet = await read(
      await toXlsx(
        ['#', 'Ime', 'Rođen', 'Upisan', 'Napomena'],
        [
          [
            1,
            'Horvat, Ana',
            new Date('1990-05-01T00:00:00.000Z'),
            // 23:30 in Zagreb.
            excelDateTime('2026-10-18T21:30:00.000Z'),
            null,
          ],
          [2, 'Šimić Ivo', new Date('nope'), excelDateTime(null), ''],
        ]
      )
    );
    expect(sheet.data.slice(1)).toEqual([
      [
        1,
        'Horvat, Ana',
        new Date('1990-05-01T00:00:00.000Z'),
        new Date('2026-10-18T23:30:00.000Z'),
        null,
      ],
      [2, 'Šimić Ivo', null, null, null],
    ]);
  });
});

describe('sheetName', () => {
  it('falls back for null, undefined and empty input', () => {
    expect(sheetName(null)).toBe('Sheet1');
    expect(sheetName(undefined)).toBe('Sheet1');
    expect(sheetName('')).toBe('Sheet1');
    expect(sheetName(' / ')).toBe('Sheet1');
  });

  it('drops characters Excel rejects and keeps it to 31', () => {
    expect(sheetName('Akcija: 24/10')).toBe('Akcija  24 10');
    expect(sheetName('Očekivani darivatelji na akciji u Čakovcu')).toBe(
      'Očekivani darivatelji na akciji'
    );
  });
});

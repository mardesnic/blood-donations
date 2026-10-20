import writeXlsxFile, { type Cell } from 'write-excel-file/node';
import { toAppWallClock } from '@/lib/dates';

export const XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// A moment (e.g. when a record was saved), shown with its date and time in
// the app's time zone. A plain Date is a calendar date (UTC midnight).
export interface ExcelDateTime {
  dateTime: Date | string | null | undefined;
}

export type ExcelValue = string | number | Date | ExcelDateTime | null;

export function excelDateTime(
  moment: Date | string | null | undefined
): ExcelDateTime {
  return { dateTime: moment };
}

// Excel's own formats, matching DATE_FORMAT and DATE_TIME_FORMAT.
const DAY_FORMAT = 'dd.mm.yyyy.';
const DATE_TIME_FORMAT = 'dd.mm.yyyy. hh:mm';

const MIN_WIDTH = 6;
const MAX_WIDTH = 50;

// Excel rejects sheet names over 31 characters or with any of : \ / ? * [ ].
const MAX_SHEET_NAME = 31;

export function sheetName(title: string | null | undefined): string {
  return (
    (title || '')
      .replace(/[:\\/?*[\]]/g, ' ')
      .trim()
      .slice(0, MAX_SHEET_NAME)
      .trim() || 'Sheet1'
  );
}

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

function toCell(value: ExcelValue | undefined): Cell {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (value instanceof Date) {
    return isValidDate(value)
      ? { value, type: Date, format: DAY_FORMAT }
      : null;
  }
  if (typeof value === 'object') {
    const wallClock = toAppWallClock(value.dateTime);
    return wallClock
      ? { value: wallClock, type: Date, format: DATE_TIME_FORMAT }
      : null;
  }
  return value;
}

// How many characters a value takes up, for the column width.
function textLength(value: ExcelValue | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (value instanceof Date) {
    return DAY_FORMAT.length;
  }
  if (typeof value === 'object') {
    return DATE_TIME_FORMAT.length;
  }
  return Math.max(
    ...String(value)
      .split('\n')
      .map((line) => line.length)
  );
}

// One sheet as an .xlsx file: a bold header row that stays in view while
// scrolling, numbers and dates as real Excel values, and columns wide enough
// for their contents.
export async function toXlsx(
  columns: string[] | null | undefined,
  rows: ExcelValue[][] | null | undefined,
  title?: string | null
): Promise<Buffer> {
  const header = columns || [];
  const body = rows || [];
  const width = Math.max(header.length, ...body.map((row) => row.length));
  const widths = Array.from({ length: width }, (_, index) =>
    Math.min(
      MAX_WIDTH,
      Math.max(
        MIN_WIDTH,
        textLength(header[index]),
        ...body.map((row) => textLength(row[index]))
      ) + 2
    )
  );
  const data: Cell[][] = [
    ...(header.length
      ? [header.map((value) => ({ value, fontWeight: 'bold' as const }))]
      : []),
    ...body.map((row) => row.map(toCell)),
  ];
  return writeXlsxFile(data.length ? data : [[null]], {
    sheet: sheetName(title),
    columns: widths.map((value) => ({ width: value })),
    stickyRowsCount: header.length ? 1 : 0,
  }).toBuffer();
}

// The file as a download: fileName without the .xlsx extension.
export function xlsxResponseInit(fileName: string): ResponseInit {
  return {
    status: 200,
    headers: {
      'Content-Type': XLSX_CONTENT_TYPE,
      'Content-Disposition': `attachment; filename=${fileName}.xlsx`,
    },
  };
}

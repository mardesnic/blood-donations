import { NextRequest, NextResponse } from 'next/server';
import { getLocale, getTranslations } from 'next-intl/server';
import StatsService from '@/app/api/stats/service';
import { withAuth } from '@/lib/api';
import { toXlsx, xlsxResponseInit } from '@/lib/excel';
import { toAppDay, toDayString } from '@/lib/dates';
import { fileSlug } from '@/lib/driveSheets';
import { parseReportPeriod } from '@/lib/reports';
import {
  REPORT_TABLES,
  reportTables,
  ReportTableKey,
} from '@/lib/reportTables';

// One report table as an Excel file: /api/reports/export?from=&to=&table=months
export const GET = withAuth(async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const key = params.get('table') as ReportTableKey;
  if (!REPORT_TABLES.includes(key)) {
    return NextResponse.json({ message: 'Unknown table.' }, { status: 400 });
  }
  const period = parseReportPeriod(
    params.get('from'),
    params.get('to'),
    toAppDay(new Date()) as Date
  );
  const t = await getTranslations();
  const report = await StatsService.report(period);
  const table = reportTables(report, t, await getLocale()).find(
    (item) => item.key === key
  )!;

  // e.g. izvjestaj-po-mjesecima-2026-01-01-2026-12-31.xlsx
  const fileName = `${t('reports.fileName')}-${fileSlug(table.title)}-${toDayString(period.from)}-${toDayString(period.to)}`;
  return new NextResponse(
    new Uint8Array(await toXlsx(table.columns, table.rows, table.title)),
    xlsxResponseInit(fileName)
  );
});

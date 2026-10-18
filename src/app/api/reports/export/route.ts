import { NextRequest, NextResponse } from 'next/server';
import { getLocale, getTranslations } from 'next-intl/server';
import { format } from 'fast-csv';
import StatsService from '@/app/api/stats/service';
import { withAuth } from '@/lib/api';
import { toAppDay, toDayString } from '@/lib/dates';
import { parseReportPeriod } from '@/lib/reports';
import {
  REPORT_TABLES,
  reportTables,
  ReportTableKey,
} from '@/lib/reportTables';

// One report table as CSV: /api/reports/export?from=&to=&table=months
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

  const csv = await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    // Headers even for an empty table, so the file isn't blank.
    const stream = format({ headers: table.columns, alwaysWriteHeaders: true });
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () =>
      resolve(
        Buffer.concat(chunks as unknown as Uint8Array[]).toString('utf-8')
      )
    );
    table.rows.forEach((row) => stream.write(row));
    stream.end();
  });

  // e.g. izvjestaj-po-mjesecima-2026-01-01-2026-12-31.csv
  const slug = table.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const fileName = `${t('reports.fileName')}-${slug}-${toDayString(period.from)}-${toDayString(period.to)}.csv`;

  // The byte-order mark makes Excel read the file as UTF-8.
  return new NextResponse(`\uFEFF${csv}`, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=${fileName}`,
    },
  });
});

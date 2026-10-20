import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import ActionService from '../../service';
import { withAuth } from '@/lib/api';
import { toCsv } from '@/lib/csv';
import { toDayString } from '@/lib/dates';
import { driveSheet, fileSlug, parseDriveSheet } from '@/lib/driveSheets';

// A drive's sheet as CSV: /api/actions/[id]/export?sheet=expected|results
// (results by default).
export const GET = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const data = await ActionService.sheetData(id);
    if (!data) {
      return NextResponse.json({ message: 'Not found.' }, { status: 404 });
    }
    const t = await getTranslations();
    const sheet = driveSheet(
      parseDriveSheet(req.nextUrl.searchParams.get('sheet'), 'results'),
      data,
      t
    );
    // e.g. akcija-gradska-akcija-2026-10-24-ocekivani-darivatelji.csv
    const fileName = [
      t('driveSheets.fileName'),
      fileSlug(data.action.title),
      toDayString(data.action.startDateTime),
      fileSlug(sheet.title),
    ]
      .filter(Boolean)
      .join('-');
    return new NextResponse(await toCsv(sheet.columns, sheet.rows), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=${fileName}.csv`,
      },
    });
  }
);

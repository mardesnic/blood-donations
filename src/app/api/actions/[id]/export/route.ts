import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import ActionService from '../../service';
import { withAuth } from '@/lib/api';
import { toDayString } from '@/lib/dates';
import { driveSheet, fileSlug, parseDriveSheet } from '@/lib/driveSheets';
import { toXlsx, xlsxResponseInit } from '@/lib/excel';

// A drive's sheet as an Excel file: /api/actions/[id]/export?sheet=expected|results
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
    // e.g. akcija-gradska-akcija-2026-10-24-ocekivani-darivatelji.xlsx
    const fileName = [
      t('driveSheets.fileName'),
      fileSlug(data.action.title),
      toDayString(data.action.startDateTime),
      fileSlug(sheet.title),
    ]
      .filter(Boolean)
      .join('-');
    return new NextResponse(
      new Uint8Array(await toXlsx(sheet.columns, sheet.rows, sheet.title)),
      xlsxResponseInit(fileName)
    );
  }
);

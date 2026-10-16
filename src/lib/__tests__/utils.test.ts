import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import { GridFilterModel } from '@mui/x-data-grid';
import { generateExportDownloadLink } from '@/lib/utils';

const params = (url: string) => new URL(url, 'http://localhost').searchParams;

describe('generateExportDownloadLink', () => {
  it('handles empty, null and undefined models', () => {
    for (const model of [{ items: [] }, null, undefined]) {
      const query = params(
        generateExportDownloadLink(
          '/api/donors/export',
          '',
          model as unknown as GridFilterModel,
          []
        )
      );
      expect(query.getAll('filter')).toEqual([]);
      expect(query.get('search')).toBe('');
    }
  });

  it('sends every filter, like the donors list does', () => {
    const query = params(
      generateExportDownloadLink(
        '/api/donors/export',
        'ana',
        {
          items: [
            { field: 'gender', operator: 'is', value: 'FEMALE' },
            {
              field: 'bloodType',
              operator: 'isAnyOf',
              value: ['A_POSITIVE', 'O_NEGATIVE'],
            },
            { field: 'dob', operator: 'is', value: dayjs('1990-05-01') },
          ],
        },
        [{ field: 'fullName', sort: 'asc' }]
      )
    );
    expect(query.get('search')).toBe('ana');
    expect(query.getAll('filter')).toEqual([
      'gender|is|FEMALE',
      'bloodType|isAnyOf|A_POSITIVE,O_NEGATIVE',
      'dob|is|1990-05-01T00:00:00.000Z',
    ]);
    expect(query.get('sort')).toBe('fullName|asc');
  });
});

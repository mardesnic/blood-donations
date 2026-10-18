import { describe, expect, it } from 'vitest';
import { GridFilterModel } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import {
  activeFilters,
  clearFilters,
  donorListFromSearchParams,
  donorListToSearchParams,
  filterModelFromSearchParams,
  filterModelToSearchParams,
  getFilterValue,
  setFilter,
} from '@/lib/donorFilterModel';

const model: GridFilterModel = {
  items: [
    { field: 'gender', operator: 'is', value: 'FEMALE' },
    { field: 'bloodType', operator: 'isAnyOf', value: [] },
  ],
  quickFilterValues: ['ana'],
};

describe('donor filter model', () => {
  it('handles null, undefined and empty models', () => {
    for (const empty of [null, undefined, {} as GridFilterModel]) {
      expect(getFilterValue(empty, 'gender')).toBeUndefined();
      expect(activeFilters(empty)).toEqual([]);
      expect(clearFilters(empty).items).toEqual([]);
      expect(setFilter(empty, 'city', 'contains', 'Zag').items).toEqual([
        { field: 'city', operator: 'contains', value: 'Zag' },
      ]);
    }
  });

  it('replaces a field and removes it when the value is empty', () => {
    const male = setFilter(model, 'gender', 'is', 'MALE');
    expect(getFilterValue(male, 'gender')).toBe('MALE');
    expect(male.items.filter((i) => i.field === 'gender')).toHaveLength(1);
    for (const empty of ['', null, undefined, []]) {
      expect(
        getFilterValue(setFilter(model, 'gender', 'is', empty), 'gender')
      ).toBeUndefined();
    }
  });

  it('keeps the search text', () => {
    expect(setFilter(model, 'city', 'contains', 'x').quickFilterValues).toEqual(
      ['ana']
    );
    expect(clearFilters(model)).toEqual({
      items: [],
      quickFilterValues: ['ana'],
    });
  });

  it('keeps both ends of a range on the same field', () => {
    let range = setFilter(null, 'age', '>=', 25);
    range = setFilter(range, 'age', '<=', 40);
    expect(getFilterValue(range, 'age', '>=')).toBe(25);
    expect(getFilterValue(range, 'age', '<=')).toBe(40);
    range = setFilter(range, 'age', '>=', '');
    expect(range.items).toEqual([{ field: 'age', operator: '<=', value: 40 }]);
  });

  it('counts only filters with a value', () => {
    expect(activeFilters(model).map((i) => i.field)).toEqual(['gender']);
  });
});

describe('filters in the URL', () => {
  it('handles null, undefined and empty input', () => {
    for (const empty of [null, undefined, { items: [] }]) {
      expect(filterModelToSearchParams(empty).toString()).toBe('');
    }
    for (const empty of [null, undefined, '', []]) {
      expect(filterModelFromSearchParams(empty, empty)).toEqual({
        items: [],
        quickFilterValues: [],
      });
    }
  });

  it('round-trips every kind of filter and the search', () => {
    const model: GridFilterModel = {
      items: [
        { field: 'eligible', operator: 'is', value: 'NOW' },
        {
          field: 'bloodType',
          operator: 'isAnyOf',
          value: ['A_POSITIVE', 'O_NEGATIVE'],
        },
        { field: 'city', operator: 'contains', value: 'Zag' },
        { field: 'age', operator: '>=', value: '30' },
        { field: 'age', operator: '<=', value: '50' },
        {
          field: 'lastDonation',
          operator: 'onOrAfter',
          value: dayjs('2026-01-01'),
        },
      ],
      quickFilterValues: ['ana'],
    };
    const params = filterModelToSearchParams(model);
    expect(params.getAll('filter')).toEqual([
      'eligible|is|NOW',
      'bloodType|isAnyOf|A_POSITIVE,O_NEGATIVE',
      'city|contains|Zag',
      'age|>=|30',
      'age|<=|50',
      'lastDonation|onOrAfter|2026-01-01',
    ]);
    const back = filterModelFromSearchParams(
      params.getAll('filter'),
      params.get('search')
    );
    expect(back.quickFilterValues).toEqual(['ana']);
    expect(back.items.slice(0, 5)).toEqual(model.items.slice(0, 5));
    expect(dayjs.isDayjs(back.items[5].value)).toBe(true);
    expect((back.items[5].value as dayjs.Dayjs).format('YYYY-MM-DD')).toBe(
      '2026-01-01'
    );
  });

  it('drops unknown fields, bad days, duplicates and empty values', () => {
    const model = filterModelFromSearchParams(
      [
        'oib|equals|123',
        'lastDonation|onOrAfter|2026-02-31',
        'lastDonation|onOrBefore|tomorrow',
        'gender|is|FEMALE',
        'gender|is|MALE',
        'city|contains|',
        'nonsense',
      ],
      '  '
    );
    expect(model).toEqual({
      items: [{ field: 'gender', operator: 'is', value: 'FEMALE' }],
      quickFilterValues: [],
    });
  });
});

describe('donors list state in the URL', () => {
  it('uses the defaults for null, undefined and empty input', () => {
    for (const empty of [null, undefined, new URLSearchParams()]) {
      expect(donorListFromSearchParams(empty)).toEqual({
        filterModel: { items: [], quickFilterValues: [] },
        sortModel: [{ field: 'fullName', sort: 'asc' }],
        paginationModel: { page: 0, pageSize: 10 },
      });
    }
    for (const empty of [null, undefined, {}]) {
      expect(donorListToSearchParams(empty).toString()).toBe('');
    }
  });

  it('leaves the defaults out of the URL', () => {
    expect(
      donorListToSearchParams({
        sortModel: [{ field: 'fullName', sort: 'asc' }],
        paginationModel: { page: 0, pageSize: 10 },
      }).toString()
    ).toBe('');
  });

  it('round-trips sort, page and page size with the filters', () => {
    const state = {
      filterModel: {
        items: [{ field: 'gender', operator: 'is', value: 'MALE' }],
        quickFilterValues: ['ana'],
      },
      sortModel: [{ field: 'lastDonation', sort: 'desc' as const }],
      paginationModel: { page: 2, pageSize: 50 },
    };
    const params = donorListToSearchParams(state);
    expect(params.get('sort')).toBe('lastDonation|desc');
    expect(params.get('page')).toBe('3');
    expect(donorListFromSearchParams(params)).toEqual(state);
  });

  it('ignores unknown sort fields and bad page numbers', () => {
    const state = donorListFromSearchParams(
      new URLSearchParams('sort=password|asc&page=-4&pageSize=7')
    );
    expect(state.sortModel).toEqual([{ field: 'fullName', sort: 'asc' }]);
    expect(state.paginationModel).toEqual({ page: 0, pageSize: 10 });
    expect(
      donorListFromSearchParams(new URLSearchParams('sort=dob|sideways'))
        .sortModel
    ).toEqual([{ field: 'fullName', sort: 'asc' }]);
  });
});

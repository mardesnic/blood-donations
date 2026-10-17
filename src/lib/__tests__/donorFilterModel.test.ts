import { describe, expect, it } from 'vitest';
import { GridFilterModel } from '@mui/x-data-grid';
import {
  activeFilters,
  clearFilters,
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

  it('counts only filters with a value', () => {
    expect(activeFilters(model).map((i) => i.field)).toEqual(['gender']);
  });
});

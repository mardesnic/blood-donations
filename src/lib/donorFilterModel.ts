import { GridFilterItem, GridFilterModel } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { parseDay } from '@/lib/dates';

// The donor filters live in a DataGrid filter model, one item per field and
// operator (a range has a "from" and a "to" item for the same field). These
// helpers read and change it without touching the search text.

type Model = GridFilterModel | null | undefined;

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

const matches = (item: GridFilterItem, field: string, operator?: string) =>
  item.field === field && (!operator || item.operator === operator);

// The field's value; with an operator, only that end of a range.
export function getFilterValue(
  model: Model,
  field: string,
  operator?: string
): unknown {
  return model?.items?.find((item) => matches(item, field, operator))?.value;
}

// Sets the filter for this field and operator, or removes it when the value
// is empty.
export function setFilter(
  model: Model,
  field: string,
  operator: string,
  value: unknown
): GridFilterModel {
  const items = (model?.items || []).filter(
    (item) => !matches(item, field, operator)
  );
  if (!isEmpty(value)) {
    items.push({ field, operator, value });
  }
  return { ...model, items };
}

// Removes every filter but keeps the search text.
export function clearFilters(model: Model): GridFilterModel {
  return { ...model, items: [] };
}

// The filters that actually narrow the list.
export function activeFilters(model: Model): GridFilterItem[] {
  return (model?.items || []).filter((item) => !isEmpty(item.value));
}

// Parses "field|operator|value"; the value may itself contain "|".
export function parseFilterString(filter: string | null | undefined): {
  field: string;
  operator: string;
  value: string;
} | null {
  if (!filter) {
    return null;
  }
  const [field, operator, ...rest] = filter.split('|');
  const value = rest.join('|');
  if (!field || !operator || !value) {
    return null;
  }
  return { field, operator, value };
}

// How each donor filter is written in the page URL. Other fields are left
// out of it.
const URL_FIELDS: Record<string, 'text' | 'list' | 'day'> = {
  eligible: 'text',
  bloodType: 'list',
  gender: 'text',
  active: 'text',
  city: 'text',
  donationCount: 'text',
  age: 'text',
  lastDonation: 'day',
};
const URL_DAY = 'YYYY-MM-DD';

// The search text and filters as URL parameters, in the same
// "field|operator|value" format the donors API takes.
export function filterModelToSearchParams(model: Model): URLSearchParams {
  const params = new URLSearchParams();
  const search = (model?.quickFilterValues || []).join(' ').trim();
  if (search) {
    params.set('search', search);
  }
  for (const { field, operator, value } of activeFilters(model)) {
    let text: string;
    switch (URL_FIELDS[field]) {
      case 'list':
        text = (Array.isArray(value) ? value : [value]).join(',');
        break;
      case 'day': {
        const day = dayjs(value);
        if (!day.isValid()) {
          continue;
        }
        text = day.format(URL_DAY);
        break;
      }
      case 'text':
        text = String(value).trim();
        break;
      default:
        continue;
    }
    if (text) {
      params.append('filter', `${field}|${operator}|${text}`);
    }
  }
  return params;
}

// The filter model for URL parameters written by filterModelToSearchParams.
// Anything unknown or malformed is dropped.
export function filterModelFromSearchParams(
  filters: string | string[] | null | undefined,
  search: string | string[] | null | undefined
): GridFilterModel {
  const items: GridFilterItem[] = [];
  for (const filter of ([] as string[]).concat(filters ?? [])) {
    const parsed = parseFilterString(filter);
    if (!parsed || !URL_FIELDS[parsed.field]) {
      continue;
    }
    const { field, operator, value } = parsed;
    if (items.some((i) => i.field === field && i.operator === operator)) {
      continue;
    }
    switch (URL_FIELDS[field]) {
      case 'list':
        items.push({
          field,
          operator,
          value: value.split(',').filter(Boolean),
        });
        break;
      case 'day': {
        // A real calendar day (not 2026-02-31), as a local date for the picker.
        if (value.length === URL_DAY.length && parseDay(value)) {
          items.push({ field, operator, value: dayjs(value) });
        }
        break;
      }
      default:
        items.push({ field, operator, value });
    }
  }
  const text = ([] as string[])
    .concat(search ?? [])
    .join(' ')
    .trim();
  return { items, quickFilterValues: text ? [text] : [] };
}

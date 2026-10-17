import { GridFilterItem, GridFilterModel } from '@mui/x-data-grid';

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

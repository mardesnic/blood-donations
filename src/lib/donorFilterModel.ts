import { GridFilterItem, GridFilterModel } from '@mui/x-data-grid';

// The donor filters live in a DataGrid filter model, one item per field.
// These helpers read and change it without touching the search text.

type Model = GridFilterModel | null | undefined;

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

export function getFilterValue(model: Model, field: string): unknown {
  return model?.items?.find((item) => item.field === field)?.value;
}

// Sets the field's filter, or removes it when the value is empty.
export function setFilter(
  model: Model,
  field: string,
  operator: string,
  value: unknown
): GridFilterModel {
  const items = (model?.items || []).filter((item) => item.field !== field);
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

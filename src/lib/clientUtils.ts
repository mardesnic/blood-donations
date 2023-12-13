'use client';

import {
  GridColType,
  getGridDateOperators,
  getGridNumericOperators,
  getGridSingleSelectOperators,
  getGridStringOperators,
} from '@mui/x-data-grid';
import {
  ENABLED_GRID_DATE_OPERATORS,
  ENABLED_GRID_NUMERIC_OPERATORS,
  ENABLED_GRID_SINGLE_SELECT_OPERATORS,
  ENABLED_GRID_STRING_OPERATORS,
} from './const';

export function getEnabledGridFilterOperators(
  colType: GridColType | undefined
) {
  switch (colType) {
    case 'number':
      return getGridNumericOperators().filter((operator) =>
        ENABLED_GRID_NUMERIC_OPERATORS.includes(operator.value)
      );
    case 'date':
      return getGridDateOperators().filter((operator) =>
        ENABLED_GRID_DATE_OPERATORS.includes(operator.value)
      );
    case 'singleSelect':
      return getGridSingleSelectOperators().filter((operator) =>
        ENABLED_GRID_SINGLE_SELECT_OPERATORS.includes(operator.value)
      );
    case 'string':
    default:
      return getGridStringOperators().filter((operator) =>
        ENABLED_GRID_STRING_OPERATORS.includes(operator.value)
      );
  }
}

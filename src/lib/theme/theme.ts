import {
  BreakpointsOptions,
  createTheme,
  TypographyVariantsOptions,
} from '@mui/material/styles';
import { Inter } from 'next/font/google';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import { PAGE_SIZE } from '../const';

const breakpoints: BreakpointsOptions = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

// A variable font, so every weight comes from one file. Its Latin Extended
// part (č, ć, đ, š, ž) loads when a page needs it.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

// Digits of equal width, so counts line up in right-aligned table columns.
// Only there: Inter also widens hyphens with it, so "0-" or a phone number
// would look spaced out.
const tabularNumbers = { fontVariantNumeric: 'tabular-nums' } as const;

const typography: TypographyVariantsOptions = {
  fontSize: 16,
  fontFamily: inter.style.fontFamily,
  h1: {
    fontSize: 24,
    fontWeight: 700,
    marginBlockEnd: 12,
  },
  h3: {
    fontSize: 16,
    fontWeight: 700,
  },
  button: {
    fontSize: 16,
  },
};

export const theme = createTheme({
  breakpoints,
  spacing: 8,
  typography,
  palette: {
    primary: {
      main: '#EB4B62',
    },
    secondary: {
      main: '#1D2A43',
    },
    success: {
      main: '#01BBAA',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained',
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        margin: 'normal',
        slotProps: {
          inputLabel: { shrink: true },
        },
      },
    },
    // Date pickers render their own field component, which doesn't
    // inherit the MuiTextField defaults above.
    MuiPickersTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        margin: 'normal',
        slotProps: {
          inputLabel: { shrink: true },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        alignRight: tabularNumbers,
      },
    },
    MuiDialog: {
      defaultProps: {
        keepMounted: true,
      },
    },
    // On phones dialog buttons stack full width, the main action on top.
    MuiDialogActions: {
      styleOverrides: {
        root: {
          [`@media (max-width:${breakpoints.values!.sm - 0.05}px)`]: {
            flexDirection: 'column-reverse',
            alignItems: 'stretch',
            gap: 8,
            '& > :not(style) ~ :not(style)': { marginLeft: 0 },
          },
        },
      },
    },
    MuiDataGrid: {
      defaultProps: {
        disableColumnFilter: true,
        disableColumnSelector: true,
        disableDensitySelector: true,
        disableRowSelectionOnClick: true,
        hideFooterSelectedRowCount: true,
        autoHeight: true,
        pageSizeOptions: [PAGE_SIZE, 50, 100],
        initialState: {
          pagination: {
            paginationModel: { pageSize: PAGE_SIZE, page: 0 },
          },
        },
      },
      styleOverrides: {
        root: {
          '& .MuiDataGrid-cell--textRight': tabularNumbers,
          'input[type=search]': { minWidth: 205 },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiTablePagination-root': {
            padding: '0 16px 0 0',
          },
          // 24px inside the table's left and right edges. Rows also hold
          // offset and filler cells, so match the first and last real
          // columns rather than the first and last children.
          '& .MuiDataGrid-cell[aria-colindex="1"]': {
            paddingLeft: '24px',
            boxSizing: 'border-box',
          },
          '& .MuiDataGrid-cell:has(+ .MuiDataGrid-cellEmpty)': {
            paddingRight: '24px',
            boxSizing: 'border-box',
          },
          '& .MuiDataGrid-columnHeader[aria-colindex="1"]': {
            paddingLeft: '24px',
          },
          '& .MuiDataGrid-columnHeader--last': {
            paddingRight: '24px',
          },
          '& .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700,
            fontSize: '16px',
            lineHeight: '24px',
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
        },
      },
    },
  },
});

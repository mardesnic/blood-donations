import { BreakpointsOptions, createTheme } from '@mui/material/styles';
import { TypographyOptions } from '@mui/material/styles/createTypography';
import { Open_Sans } from 'next/font/google';
import type {} from '@mui/x-data-grid/themeAugmentation';
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

const openSans = Open_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const typography: TypographyOptions = {
  fontSize: 16,
  fontFamily: openSans.style.fontFamily,
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
        InputLabelProps: { shrink: true },
        fullWidth: true,
        margin: 'normal',
      },
    },
    MuiDialog: {
      defaultProps: {
        keepMounted: true,
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
          '& .MuiDataGrid-cell:nth-child(1)': {
            padding: '0 0 0 24px',
            boxSizing: 'border-box',
          },
          '& .MuiDataGrid-cell:nth-last-child(1)': {
            padding: '0 24px 0 0',
            boxSizing: 'border-box',
          },
          '& .MuiDataGrid-columnHeader:nth-child(1)': {
            padding: '0 0 0 24px',
          },
          '& .MuiDataGrid-columnHeader:nth-last-child(1)': {
            padding: '0 24px 0 0',
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

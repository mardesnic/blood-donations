import { createTheme } from '@mui/material/styles';

const primary = '#fff';

const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

export const theme = createTheme({
  breakpoints,
  spacing: 8,
  typography: {
    fontFamily: 'Roboto',
    body1: {
      fontSize: 14,
    },
    h1: {
      fontSize: 22,
    },
    h2: {
      fontSize: 20,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*::-webkit-scrollbar': {
          width: '0.4em',
        },
        '*::-webkit-scrollbar-track': {
          boxShadow: 'none',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: primary,
        },
      },
    },
  },
});

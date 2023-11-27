import { BreakpointsOptions, createTheme } from '@mui/material/styles';
import { TypographyOptions } from '@mui/material/styles/createTypography';
import { Roboto } from 'next/font/google';

const breakpoints: BreakpointsOptions = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const typography: TypographyOptions = {
  fontFamily: roboto.style.fontFamily,
  body1: {
    fontSize: 14,
    fontWeight: 400,
  },
  h1: {
    fontSize: 22,
    fontWeight: 700,
  },
  h2: {
    fontSize: 20,
    fontWeight: 500,
  },
  h3: {
    fontSize: 18,
    fontWeight: 500,
  },
};

export const theme = createTheme({
  breakpoints,
  spacing: 8,
  typography,
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        size: 'large',
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        InputLabelProps: { shrink: true },
      },
    },
  },
});

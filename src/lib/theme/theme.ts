import { createTheme } from '@mui/material/styles';

const primary = '#fff';
const secondary = '#333';

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
    // palette: {
    //     // mode: 'dark',
    //     primary: {
    //         main: primary,
    //     },
    //     secondary: {
    //         main: secondary,
    //     },
    // },
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
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
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
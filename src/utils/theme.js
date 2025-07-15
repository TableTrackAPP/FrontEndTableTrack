// src/utils/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#006A42',
            light: '#D7FEC9',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#00C1B4',
            dark: '#008577',
            contrastText: '#ffffff',
        },
        warning: {
            main: '#FFB347',
            dark: '#FF9900',
            contrastText: '#ffffff',
        },
        background: {
            default: '#F5F5F5',
        },
    },
    typography: {
        fontFamily: ['"Roboto"', '"Helvetica"', 'Arial', 'sans-serif'].join(','),
        h1: {
            fontWeight: 700,
            fontSize: '2.2rem',
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 12,
    },
});

export default theme;

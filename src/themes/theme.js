import { extendTheme } from '@mui/joy/styles';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#f0f7ff',
          100: '#c2e0ff',
          200: '#99ccf3',
          300: '#66b2ff',
          400: '#3399ff',
          500: '#007fff',
          600: '#0072e5',
          700: '#0059b2',
          800: '#004c99',
          900: '#003a75',
        },
        background: {
          body: '#f5f7fa',
          surface: '#ffffff',
          level1: '#f3f6f9',
          level2: '#ebeff3',
          level3: '#e3e8ef',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          50: '#1a2027',
          100: '#263238',
          200: '#2e3c43',
          300: '#364954',
          400: '#3e5663',
          500: '#4a6572',
          600: '#5c7d8a',
          700: '#7295a3',
          800: '#96b1bd',
          900: '#d0dfe6',
        },
        background: {
          body: '#121212',
          surface: '#1e1e1e',
          level1: '#2a2a2a',
          level2: '#333333',
          level3: '#3d3d3d',
        },
        text: {
          primary: '#f5f5f5',
          secondary: '#bdbdbd',
        },
      },
    },
  },
  fontFamily: {
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    JoyCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: theme.vars.shadow.sm,
          transition: 'box-shadow 0.3s, transform 0.2s',
          '&:hover': {
            boxShadow: theme.vars.shadow.md,
            transform: 'translateY(-2px)',
          },
        }),
      },
    },
    JoySheet: {
      styleOverrides: {
        root: ({ theme }) => ({
          [theme.getColorSchemeSelector('dark')]: {
            '--joy-palette-background-level1': theme.vars.palette.background.level1,
          },
        }),
      },
    },
  },
});

export default theme;
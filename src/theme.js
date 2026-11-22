import { createTheme } from '@mui/material/styles';

const tacticalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8ea77b', contrastText: '#111611' },
    secondary: { main: '#d1a66b' },
    background: { default: '#11151a', paper: '#1a211d' },
    text: { primary: '#e8eee9', secondary: '#9eaaa2' },
    success: { main: '#82c58e' },
    warning: { main: '#d1a66b' },
    error: { main: '#c66b63' }
  },
  typography: {
    fontFamily: '"IBM Plex Mono", "Roboto Condensed", monospace',
    button: { fontWeight: 600, letterSpacing: '0.06em' }
  },
  shape: { borderRadius: 3 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true },
      styleOverrides: { root: { textTransform: 'none' } }
    },
    MuiPaper: { defaultProps: { square: true, elevation: 0 } }
  }
});

export default tacticalTheme;

import { createRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App.jsx';
import tacticalTheme from './theme.js';

const insertionPoint = document.querySelector('meta[name="emotion-insertion-point"]');
const muiCache = createCache({ key: 'mui', insertionPoint });
const screen = document.body.dataset.screen || 'home';

document.title = {
  home: 'S.Q.L. — Início',
  game: 'S.Q.L. — Controle de Acesso',
  practice: 'S.Q.L. — Prática SQL'
}[screen] || 'S.Q.L.';

createRoot(document.getElementById('root')).render(
  <CacheProvider value={muiCache}>
    <ThemeProvider theme={tacticalTheme}>
      <CssBaseline />
      <App screen={screen} />
    </ThemeProvider>
  </CacheProvider>
);

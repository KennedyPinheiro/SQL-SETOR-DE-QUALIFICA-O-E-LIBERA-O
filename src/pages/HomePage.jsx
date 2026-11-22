import { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import HomeHelpDialog from '../components/HomeHelpDialog.jsx';
import SettingsDialog from '../components/SettingsDialog.jsx';
import { loadScripts } from '../legacy/loadScript.js';

const settingsKey = 'sql-settings';
const defaultSettings = {
  sound: true,
  volume: 50,
  music: true,
  musicVolume: 25,
  animations: true,
  leaves: true
};

const modes = {
  classico: {
    title: <>ESSE NÃO É<br /><em>DOS NOSSOS.</em></>,
    description: 'Investigue visitantes, cruze documentos com registros e decida quem pode entrar.',
    hint: 'O terminal SQL é sua principal ferramenta de investigação.'
  },
  falha: {
    title: <>SEM TERMINAL.<br /><em>SEM MARGEM.</em></>,
    description: 'O terminal está indisponível. Use a inspeção e os recursos do quartel para decidir.',
    hint: 'O evento de falha permanece ativo durante todos os turnos.'
  },
  practice: {
    title: <>DOMINE O SQL.<br /><em>NO SEU RITMO.</em></>,
    description: 'Explore tabelas, importe seus dados e pratique consultas SQL sem pressão.',
    hint: 'Use o terminal livre para conhecer comandos e relações entre tabelas.'
  }
};

const modeCards = [
  {
    id: 'classico',
    tag: 'PROTOCOLO DE ACESSO',
    title: 'CLÁSSICO',
    description: 'Investigue visitantes com SQL, faça perguntas e decida se autoriza, nega ou encaminha.'
  },
  {
    id: 'falha',
    tag: 'CONTINGÊNCIA',
    title: 'FALHA DO SISTEMA',
    description: 'O terminal fica indisponível em todos os turnos. Decida com inspeção, declaração e recursos do quartel.'
  },
  {
    id: 'practice',
    tag: 'AMBIENTE DE TREINO',
    title: 'PRÁTICA SQL',
    description: 'Explore as cinco tabelas e treine consultas em um terminal livre, sem visitantes ou pressão.'
  }
];

const difficultyCards = [
  { id: 'facil', label: 'FÁCIL', lives: '♥ ♥ ♥ ♥ ♥', classic: '5 vidas · 5 consultas · meta 1', failure: '5 vidas' },
  { id: 'normal', label: 'NORMAL', lives: '♥ ♥ ♥', classic: '3 vidas · 4 consultas · meta 2', failure: '3 vidas' },
  { id: 'dificil', label: 'DIFÍCIL', lives: '♥', classic: '1 vida · 4 consultas · meta 3', failure: '1 vida' }
];

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey) || '{}');
    return Object.fromEntries(Object.entries(defaultSettings).map(([key, fallback]) => {
      const value = saved[key];
      if (typeof fallback === 'boolean') return [key, typeof value === 'boolean' ? value : fallback];
      const numeric = Number(value);
      return [key, Number.isFinite(numeric) ? Math.min(100, Math.max(0, numeric)) : fallback];
    }));
  } catch {
    return { ...defaultSettings };
  }
}

function getInitialSelection() {
  const params = new URLSearchParams(window.location.search);
  const requestedMode = params.get('mode');
  const mode = modes[requestedMode] ? requestedMode : 'classico';
  const legacyDifficulty = ['facil', 'normal', 'dificil'].includes(requestedMode) ? requestedMode : null;
  const difficulty = ['facil', 'normal', 'dificil'].includes(params.get('difficulty'))
    ? params.get('difficulty')
    : legacyDifficulty || 'normal';
  return { mode, difficulty };
}

export default function HomePage() {
  const initial = getInitialSelection();
  const [mode, setMode] = useState(initial.mode);
  const [difficulty, setDifficulty] = useState(initial.difficulty);
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(readSettings);
  const [starting, setStarting] = useState(false);
  const settingsRef = useRef(settings);
  const startTimeoutRef = useRef(null);

  settingsRef.current = settings;

  useEffect(() => {
    const animationsEnabled = settingsRef.current.animations && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const screen = document.querySelector('.start-screen');
    if (screen && animationsEnabled) screen.classList.add('home-boot');
    const introTimeout = window.setTimeout(() => screen?.classList.remove('home-boot'), 1200);

    window.getSqlSettings = () => ({ ...settingsRef.current });
    window.openSettingsModal = () => setSettingsOpen(true);
    window.closeSettingsModal = () => setSettingsOpen(false);

    let loadedScripts = [];
    loadScripts(['js/sounds.js', 'js/ambient.js', 'js/leaves.js'])
      .then(scripts => { loadedScripts = scripts; })
      .catch(error => console.error('Falha ao iniciar os efeitos da interface.', error));

    return () => {
      window.clearTimeout(introTimeout);
      window.clearTimeout(startTimeoutRef.current);
      loadedScripts.forEach(script => script.remove());
      delete window.openSettingsModal;
      delete window.closeSettingsModal;
      delete window.getSqlSettings;
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(settingsKey, JSON.stringify(settings)); } catch { /* Preferências continuam nesta sessão. */ }
    document.body.classList.toggle('reduce-motion', !settings.animations);
    window.dispatchEvent(new CustomEvent('sql-settings-changed', { detail: { ...settings } }));
  }, [settings]);

  const needsDifficulty = mode === 'classico' || mode === 'falha';
  const currentDifficulty = difficultyCards.find(item => item.id === difficulty) || difficultyCards[1];

  function chooseMode(nextMode) {
    setMode(nextMode);
    setDifficultyOpen(false);
  }

  function updateSetting(key, value) {
    setSettings(current => ({ ...current, [key]: value }));
  }

  function startSelectedMode() {
    if (starting) return;
    setStarting(true);
    const destination = mode === 'practice'
      ? 'practice.html'
      : `game.html?mode=${mode}&difficulty=${difficulty}`;
    const animationsEnabled = settingsRef.current.animations && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animationsEnabled) {
      window.location.href = destination;
      return;
    }
    document.querySelector('.start-screen')?.classList.add('is-shutting-down');
    startTimeoutRef.current = window.setTimeout(() => { window.location.href = destination; }, 650);
  }

  return (
    <>
      <Box component="div" className={`start-screen${starting ? ' is-starting' : ''}`}>
        <div className="home-radar" aria-hidden="true"><span className="home-radar-sweep" /><span className="home-radar-center" /></div>
        <div className="home-scanline" aria-hidden="true" />
        <Box component="header" className="start-top">
          <div className="start-brand"><img src="Emblema SQL_ Setor de Liberação.png" alt="SQL" /></div>
          <div className="start-org"><strong>SETOR DE QUALIFICAÇÃO E LIBERAÇÃO</strong><small>SEGURANÇA DE QUARTEL | CONTROLE DE ACESSO</small></div>
          <div className="start-header-actions">
            <div className="start-online"><span className="live-dot" />SISTEMA ONLINE</div>
            <IconButton className="settings-trigger help-trigger" onClick={() => setHelpOpen(true)} aria-label="Abrir ajuda" title="Ajuda">?</IconButton>
            <IconButton className="settings-trigger" onClick={() => setSettingsOpen(true)} aria-label="Abrir configurações" title="Configurações">⚙</IconButton>
          </div>
        </Box>

        <Box component="main" className="start-content">
          <h1 id="home-headline">{modes[mode].title}</h1>
          <p id="start-description" className="start-description">{modes[mode].description}</p>
          <div className="start-divider" />
          <h2>SELECIONE O MODO DE JOGO</h2>
          <div className="mode-options">
            {modeCards.map(card => (
              <Button
                key={card.id}
                className={`mode-card${mode === card.id ? ' selected' : ''}`}
                aria-pressed={mode === card.id}
                onClick={() => chooseMode(card.id)}
                data-hover-sound="hover"
                data-sound="select"
              >
                <span className="mode-tag">{card.tag}</span><strong>{card.title}</strong><small>{card.description}</small>
              </Button>
            ))}
          </div>

          {needsDifficulty && (
            <>
              <Button
                id="difficulty-trigger"
                className="difficulty-trigger"
                aria-expanded={difficultyOpen}
                aria-controls="difficulty-selector"
                onClick={() => setDifficultyOpen(open => !open)}
                data-hover-sound="hover"
              >
                <span>DIFICULDADE: {currentDifficulty.label}</span><span className="difficulty-trigger-chevron" aria-hidden="true">▾</span>
              </Button>
              {difficultyOpen && (
                <section id="difficulty-selector" className="difficulty-selector" aria-labelledby="difficulty-heading">
                  <h3 id="difficulty-heading">DIFICULDADE {mode === 'falha' ? 'FALHA DO SISTEMA' : 'CLÁSSICA'}</h3>
                  <div className="difficulty-options">
                    {difficultyCards.map(card => (
                      <Button
                        key={card.id}
                        className={`difficulty-card${difficulty === card.id ? ' selected' : ''}`}
                        aria-pressed={difficulty === card.id}
                        onClick={() => setDifficulty(card.id)}
                      >
                        <strong>{card.label}</strong><span>{card.lives}</span><small>{mode === 'falha' ? card.failure : card.classic}</small>
                      </Button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          <div className="start-actions">
            <Button className="button button-green start-button" id="start-game" onClick={startSelectedMode} disabled={starting}>
              {mode === 'practice' ? 'INICIAR PRÁTICA →' : 'INICIAR TURNO →'}
            </Button>
            <span id="start-mode-hint">{modes[mode].hint}</span>
          </div>
        </Box>

        <Box component="footer" className="start-footer"><span>S.Q.L. TERMINAL | BUILD 0.9.1</span><span>ACESSO RESTRITO</span></Box>
      </Box>

      <HomeHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={updateSetting}
        onReset={() => setSettings({ ...defaultSettings })}
      />
    </>
  );
}

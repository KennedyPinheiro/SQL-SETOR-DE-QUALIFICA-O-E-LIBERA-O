const gameState = {
  mode: "normal",
  modeConfig: {
    facil: { lives: 5, queries: 5, required: 1, impostorChance: 0.28, label: "FÁCIL" },
    normal: { lives: 3, queries: 4, required: 2, impostorChance: 0.45, label: "NORMAL" },
    dificil: { lives: 1, queries: 4, required: 3, impostorChance: 0.62, label: "DIFÍCIL" }
  },
  score: 0,
  lives: 3,
  maxLives: 3,
  turn: 1,
  queriesRemaining: 4,
  successfulQueries: 0,
  requiredQueries: 2,
  usedQueries: new Set(),
  currentVisitor: null,
  realNeighbor: null,
  isImpostor: false,
  visitorCase: null,
  impostorReason: "",
  neighborAlreadyInside: false,
  gameOver: false,
  selectedApartment: null,
  decisionLocked: false
};

/* Cronômetro de decisão obrigatória */
const DECISION_TIME = 10;
let decisionTimerRemaining = 0;
let decisionTimerRunning = false;
let explosionTimeoutId = null;
/* ========================================
   ESTADO GLOBAL — S.Q.L.
======================================== */

/* ========================================
   CONFIGURAÇÕES E PROGRESSO DA PARTIDA
======================================== */

const gameState = {
    /* Dificuldade */

    mode: "normal",

    modeConfig: {
        facil: {
            lives: 5,
            queries: 5,
            required: 1,
            impostorChance: 0.28,
            label: "FÁCIL"
        },

        normal: {
            lives: 3,
            queries: 4,
            required: 2,
            impostorChance: 0.45,
            label: "NORMAL"
        },

        dificil: {
            lives: 1,
            queries: 4,
            required: 3,
            impostorChance: 0.62,
            label: "DIFÍCIL"
        }
    },

    /* Pontuação e integridade */

    score: 0,
    lives: 3,
    maxLives: 3,
    turn: 1,

    /* Investigação SQL */

    queriesRemaining: 4,
    successfulQueries: 0,
    requiredQueries: 2,
    usedQueries: new Set(),

    /* Sistema de suspeita */

    suspicion: 0,
    discoveredEvidence: new Set(),
    /* Visitante atual */

    currentVisitor: null,
    realNeighbor: null,
    lastVisitorId: null,
    isImpostor: false,
    visitorCase: null,
    impostorReason: "",
    visitorFlaws: [],
    neighborAlreadyInside: false,

    // Eventos aleatórios
    activeEvent: null,
    eventData: null,
    eventTurnsRemaining: 0,
    eventHistory: [],
    eventEffects: {
        extraVerification: false,
        priorityVisitor: false,
        restrictedQueries: false,
        alteredAuthorization: false
    },

    /* Controle da partida */

    gameOver: false,
    decisionLocked: false,

    /* Interface */

    selectedApartment: null
};


/* ========================================
   CRONÔMETRO DE DECISÃO
======================================== */

const DECISION_TIME = 10;

let decisionTimerRemaining = 0;
let decisionTimerRunning = false;
let explosionTimeoutId = null;

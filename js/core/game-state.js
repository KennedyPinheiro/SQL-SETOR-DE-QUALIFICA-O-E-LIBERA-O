/* ========================================
   ESTADO GLOBAL — S.Q.L.
======================================== */

/* ========================================
   CONFIGURAÇÕES E PROGRESSO DA PARTIDA
======================================== */

const gameState = {

    gameMode: "classico",
    mode: "normal",

    failureModeLives: {
        facil: 5,
        normal: 3,
        dificil: 1
    },

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
    requiresReferral: false,
    referralReason: "",
    visitorCase: null,
    impostorReason: "",
    visitorFlaws: [],
    askedVisitorQuestions: new Set(),
    visitorForgotDocument: false,
    neighborAlreadyInside: false,

    // Eventos aleatórios
    activeEvent: null,
    eventData: null,
    eventTurnsRemaining: 0,
    priorityTimerRemaining: 15,
    priorityTimerRunning: false,
    priorityTimerId: null,
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

function getActiveModeConfig() {
    const config = gameState.modeConfig[gameState.mode];
    if (!config) return null;

    if (gameState.gameMode === "falha") {
        return {
            ...config,
            lives: gameState.failureModeLives[gameState.mode],
            impostorChance: 0.45
        };
    }

    return config;
}


/* ========================================
   CRONÔMETRO DE DECISÃO
======================================== */

const DECISION_TIME = 10;

let decisionTimerRemaining = 0;
let decisionTimerRunning = false;
let explosionTimeoutId = null;

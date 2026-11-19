/* ========================================
   CONTROLE PRINCIPAL — S.Q.L.
======================================== */

/* ========================================
   FLUXO DE TURNOS
======================================== */

function nextTurn() {
  if (gameState.gameOver) return;

  gameState.queriesRemaining =
    gameState.modeConfig[gameState.mode].queries;

  gameState.requiredQueries =
    gameState.modeConfig[gameState.mode].required;

  gameState.successfulQueries = 0;
  gameState.usedQueries = new Set();
  gameState.decisionLocked = false;

  updateSqlProgress();
  stopDecisionTimer();

  document.getElementById("btn-call").disabled = false;

  updateQueriesHUD();

  document.getElementById("intercom-result").textContent =
    "Canal disponível. Nenhuma chamada realizada.";

  document.getElementById("intercom-destination").textContent =
    "ALOJ. ---";

  document.getElementById("sql-result-area").innerHTML =
    '<p class="empty-result">Nenhuma consulta executada nesta inspeção.</p>';

  document.getElementById("result-status").textContent =
    "AGUARDANDO COMANDO";

  document.getElementById("btn-approve").disabled = true;
  document.getElementById("btn-deny").disabled = true;

  generateVisitor();

  renderVisitorUI();
  updateHUD();

  animateElement(
    document.querySelector(".visitor-panel"),
    "is-changing",
    650
  );

  animateElement(
    document.querySelector(".identity-card"),
    "is-revealing",
    500
  );
}

/* ========================================
   SELEÇÃO DE DIFICULDADE
======================================== */

function selectMode(mode) {
  if (gameState.modeConfig[mode]) {
    gameState.mode = mode;
  }
}

/* ========================================
   INICIALIZAÇÃO DA PARTIDA
======================================== */

function startGame() {
  const config = gameState.modeConfig[gameState.mode];

  gameState.lives = config.lives;
  gameState.maxLives = config.lives;
  gameState.queriesRemaining = config.queries;
  gameState.requiredQueries = config.required;

  gameState.successfulQueries = 0;
  gameState.usedQueries = new Set();
  gameState.decisionLocked = false;

  stopDecisionTimer();

  updateSqlProgress();

  setupDatabase();

  updateHUD();

  nextTurn();
}

/* ========================================
   EVENTOS DO JOGO
======================================== */

/* Executar consulta com Ctrl + Enter */

document.getElementById("sql-input").addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    runPlayerQuery();
  }
});

/* Fechar modal de edifício ao clicar fora */

document.getElementById("building-modal").addEventListener("click", e => {
  if (e.target.id === "building-modal") {
    closeBuildingModal();
  }
});

/* Fechar modal de regras ao clicar fora */

document.getElementById("rules-modal").addEventListener("click", e => {
  if (e.target.id === "rules-modal") {
    closeRulesModal();
  }
});

/* Fechar modal de menu ao clicar fora */

document.getElementById("menu-modal").addEventListener("click", e => {
  if (e.target.id === "menu-modal") {
    closeMenuModal();
  }
});

/* Tecla ESC */

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;

  if (document.getElementById("rules-modal").classList.contains("open")) {
    closeRulesModal();
  } else if (
    document.getElementById("menu-modal").classList.contains("open")
  ) {
    closeMenuModal();
  } else {
    closeBuildingModal();
  }
});

/* ========================================
   BOOT DO JOGO
======================================== */

const params = new URLSearchParams(window.location.search);
const requestedMode = params.get("mode");

selectMode(
  gameState.modeConfig[requestedMode]
    ? requestedMode
    : "normal"
);

startGame();

/* ========================================
   ANIMAÇÃO INICIAL
======================================== */

if (animationsEnabled()) {
  document.body.classList.add("game-boot");

  setTimeout(() => {
    document.body.classList.remove("game-boot");
  }, 1200);
}

/* ========================================
   ABERTURA DAS REGRAS
======================================== */

openRulesModal(true);

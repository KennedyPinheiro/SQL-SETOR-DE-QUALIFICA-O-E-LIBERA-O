/* ========================================
   HUD — S.Q.L.
   Interface de informações da partida
======================================== */


/* ========================================
   ATUALIZAÇÃO GERAL
======================================== */

function updateHUD() {
  const day = document.getElementById("hud-day");
  const score = document.getElementById("hud-score");
  const lives = document.getElementById("hud-lives");

  if (day) {
    day.textContent =
      `TURNO ${String(gameState.turn).padStart(2, "0")}`;
  }

  if (score) {
    score.textContent =
      String(gameState.score).padStart(4, "0");
  }

  if (lives) {
    lives.textContent = Array.from(
      { length: gameState.maxLives },
      (_, i) => i < gameState.lives ? "♥" : "♡"
    ).join(" ");
  }
}


/* ========================================
   CONSULTAS DISPONÍVEIS
======================================== */

function updateQueriesHUD() {
  const queriesLeft =
    document.getElementById("queries-left");

  if (queriesLeft) {
    queriesLeft.textContent =
      `${gameState.queriesRemaining} CONSULTAS RESTANTES`;
  }

  updateSqlButton();
}


/* ========================================
   PROGRESSO DA INVESTIGAÇÃO SQL
======================================== */

function updateSqlProgress() {
  const progress =
    document.getElementById("sql-progress");

  if (progress) {
    progress.textContent =
      `${gameState.successfulQueries} / ${gameState.requiredQueries} CONSULTAS`;
  }

  const objective =
    document.getElementById("sql-objective-text");

  if (objective) {
    objective.textContent =
      gameState.queriesRemaining <= 0
        ? "CONSULTAS ESGOTADAS: nenhuma consulta resta. Decida agora se autoriza ou nega a entrada!"
        : `Modo ${gameState.modeConfig[gameState.mode].label}: execute consultas SQL diferentes e compare os dados oficiais antes de decidir.`;
  }

  /* ========================================
     LIBERAÇÃO DA DECISÃO
  ======================================== */

  const ready =
    gameState.queriesRemaining <= 0 ||
    gameState.successfulQueries >= gameState.requiredQueries;

  const locked =
    gameState.decisionLocked ||
    gameState.gameOver;

  const approve =
    document.getElementById("btn-approve");

  const deny =
    document.getElementById("btn-deny");

  if (approve) {
    approve.disabled = !ready || locked;
  }

  if (deny) {
    deny.disabled = !ready || locked;
  }

  updateSqlButton();
}


/* ========================================
   CONTROLE DO BOTÃO SQL
======================================== */

function updateSqlButton() {
  const executeButton =
    document.getElementById("btn-exec-sql");

  if (!executeButton) return;

  executeButton.disabled =
    gameState.queriesRemaining <= 0 ||
    gameState.decisionLocked ||
    gameState.gameOver;
}
/* ========================================
   HUD — S.Q.L.
   Interface de informações da partida
======================================== */

/* ========================================
   ATUALIZAÇÃO GERAL
======================================== */

function updateHUD() {
  document.getElementById("hud-day").textContent =
    `TURNO ${String(gameState.turn).padStart(2, "0")}`;

  document.getElementById("hud-score").textContent =
    String(gameState.score).padStart(4, "0");

  document.getElementById("hud-lives").textContent =
    Array.from(
      { length: gameState.maxLives },
      (_, i) => i < gameState.lives ? "♥" : "♡"
    ).join(" ");
}

/* ========================================
   CONSULTAS DISPONÍVEIS
======================================== */

function updateQueriesHUD() {
  document.getElementById("queries-left").textContent =
    `${gameState.queriesRemaining} CONSULTAS RESTANTES`;

  const executeButton = document.getElementById("btn-exec-sql");

  if (executeButton) {
    executeButton.disabled =
      gameState.queriesRemaining <= 0 ||
      gameState.decisionLocked ||
      gameState.gameOver;
  }
}

/* ========================================
   PROGRESSO DA INVESTIGAÇÃO SQL
======================================== */

function updateSqlProgress() {
  const el = document.getElementById("sql-progress");

  if (el) {
    el.textContent =
      `${gameState.successfulQueries} / ${gameState.requiredQueries} CONSULTAS`;
  }

  const objective = document.getElementById("sql-objective-text");

  if (objective) {
    objective.textContent = gameState.queriesRemaining <= 0
      ? "CONSULTAS ESGOTADAS: nenhuma consulta resta. Decida agora se autoriza ou nega a entrada!"
      : `Modo ${gameState.modeConfig[gameState.mode].label}: execute consultas SQL diferentes e compare os dados oficiais antes de decidir.`;
  }

  const ready =
    gameState.queriesRemaining <= 0 ||
    gameState.successfulQueries >= gameState.requiredQueries;

  const approve = document.getElementById("btn-approve");
  const deny = document.getElementById("btn-deny");

  if (approve && !gameState.decisionLocked) {
    approve.disabled = !ready;
  }

  if (deny && !gameState.decisionLocked) {
    deny.disabled = !ready;
  }
}

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
    queriesLeft.textContent = gameState.gameMode === "falha"
      ? "SQL BLOQUEADO NESTE MODO"
      : `${gameState.queriesRemaining} CONSULTAS RESTANTES`;
  }

  updateSqlButton();
}


/* ========================================
   PROGRESSO DA INVESTIGAÇÃO SQL
======================================== */

function updateSqlProgress() {
  const modeFailure = gameState.gameMode === "falha";
  const required = Math.max(1, Number(gameState.requiredQueries) || 1);
  const completed = Math.min(
    required,
    Math.max(0, Number(gameState.successfulQueries) || 0)
  );
  const progress =
    document.getElementById("sql-progress");

  if (progress) {
    progress.textContent = modeFailure
      ? "SQL BLOQUEADO • MODO FALHA"
      : `${completed} / ${required} PESQUISAS DIRECIONADAS`;
  }

  const progressTrack = document.getElementById("sql-progress-track");
  const progressFill = document.getElementById("sql-progress-fill");

  if (progressTrack) {
    progressTrack.setAttribute("aria-valuemin", "0");
    progressTrack.setAttribute("aria-valuemax", String(required));
    progressTrack.setAttribute("aria-valuenow", modeFailure ? "0" : String(completed));
    progressTrack.setAttribute("aria-valuetext", modeFailure
      ? "Consultas SQL bloqueadas no modo Falha do Sistema"
      : `${completed} de ${required} pesquisas direcionadas em fontes diferentes`);
  }

  if (progressFill) {
    progressFill.style.width = modeFailure ? "0%" : `${(completed / required) * 100}%`;
  }

  const objective =
    document.getElementById("sql-objective-text");

  if (objective) {
    objective.textContent = modeFailure
      ? "FALHA DO SISTEMA ATIVA EM TODOS OS TURNOS: use identidade, declaração, perguntas e arquivo do efetivo para decidir."
      : gameState.queriesRemaining <= 0
        ? "CONSULTAS ESGOTADAS: decida se autoriza, nega ou encaminha. A barra mede pesquisas; evidências ficam no painel de suspeita."
        : `Modo ${getActiveModeConfig().label}: filtre por documento, nome ou alojamento. A barra conta pesquisas em fontes diferentes; evidências SQL aparecem no painel de suspeita.`;
  }

  /* ========================================
     LIBERAÇÃO DA DECISÃO
  ======================================== */

  const ready =
    modeFailure ||
    gameState.queriesRemaining <= 0 ||
    gameState.successfulQueries >= gameState.requiredQueries;

  const locked =
    gameState.decisionLocked ||
    gameState.gameOver;

  const approve =
    document.getElementById("btn-approve");

  const deny =
    document.getElementById("btn-deny");
  const refer =
    document.getElementById("btn-refer");

  if (approve) {
    approve.disabled = !ready || locked;
  }

  if (deny) {
    deny.disabled = !ready || locked;
  }
  if (refer) {
    refer.disabled = !ready || locked;
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
    gameState.gameMode === "falha" ||
    gameState.activeEvent === "system_failure" ||
    gameState.queriesRemaining <= 0 ||
    gameState.decisionLocked ||
    gameState.gameOver;
}

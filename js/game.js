/* ========================================
   CONTROLE PRINCIPAL — S.Q.L.
======================================== */


/* ========================================
   FLUXO DE TURNOS
======================================== */

function nextTurn() {
  if (gameState.gameOver) return;

  updateEventDuration();

  const config = gameState.modeConfig[gameState.mode];

  /* Cancela chamada pendente do interfone */

  cancelIntercomCall();

  /* Reinicia os dados da investigação */
  gameState.queriesRemaining = config.queries;
  gameState.requiredQueries = config.required;

  /* Mantém a exigência durante a Inspeção Surpresa */
  if (gameState.activeEvent === "surprise_inspection") {
    gameState.queriesRemaining++;
    gameState.requiredQueries++;
  }

  gameState.successfulQueries = 0;
  gameState.usedQueries = new Set();
  gameState.decisionLocked = false;

  /* Reinicia cronômetro */

  stopDecisionTimer();

  /* Atualiza controles */

  const callButton = document.getElementById("btn-call");
  const intercomResult = document.getElementById("intercom-result");
  const destination = document.getElementById("intercom-destination");
  const resultArea = document.getElementById("sql-result-area");
  const resultStatus = document.getElementById("result-status");
  const approveButton = document.getElementById("btn-approve");
  const denyButton = document.getElementById("btn-deny");

  if (callButton) callButton.disabled = false;

  if (intercomResult) {
    intercomResult.textContent =
      "Canal disponível. Nenhuma chamada realizada.";
  }

  if (destination) {
    destination.textContent = "ALOJ. ---";
  }

  if (resultArea) {
    resultArea.innerHTML = `
      <p class="empty-result">
        Nenhuma consulta executada nesta inspeção.
      </p>
    `;
  }

  if (resultStatus) {
    resultStatus.textContent = "AGUARDANDO COMANDO";
  }

  // Estado dos botões de decisão
  // Estado dos botões de decisão
  // Estado inicial dos botões de decisão
  if (approveButton) {
    approveButton.disabled = true;
  }

  if (denyButton) {
    denyButton.disabled = true;
  }
  /* Atualiza HUD */

  updateQueriesHUD();
  updateSqlProgress();

  /* Gera visitante */

  generateVisitor();

  /* Sorteia evento aleatório */

  triggerRandomEvent();
  
  if (gameState.activeEvent === "priority_visitor") {
    startPriorityTimer();
  }

  // Mantém os botões liberados durante a Falha no Sistema
  if (gameState.activeEvent === "system_failure") {
    if (approveButton) approveButton.disabled = false;
    if (denyButton) denyButton.disabled = false;
  }


  /* Atualiza interface */

  renderVisitorUI();
  updateHUD();

  /* Animações de entrada */

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

  /* Limpa temporizadores pendentes */

  clearPendingTimers();
  cancelIntercomCall();
  stopDecisionTimer();

  /* Reinicia estado geral */

  gameState.score = 0;
  gameState.lives = config.lives;
  gameState.maxLives = config.lives;
  gameState.turn = 1;

  gameState.queriesRemaining = config.queries;
  gameState.requiredQueries = config.required;

  gameState.successfulQueries = 0;
  gameState.usedQueries = new Set();

  gameState.currentVisitor = null;
  gameState.realNeighbor = null;
  gameState.isImpostor = false;
  gameState.visitorCase = null;
  gameState.impostorReason = "";
  gameState.neighborAlreadyInside = false;

  gameState.gameOver = false;
  gameState.decisionLocked = false;
  gameState.selectedApartment = null;

  /* Prepara banco de dados */

  setupDatabase();

  /* Atualiza interface */

  updateHUD();
  updateQueriesHUD();
  updateSqlProgress();

  /* Inicia primeiro turno */

  nextTurn();
}


/* ========================================
   EVENTOS DO JOGO
======================================== */


/* ========================================
   EXECUTAR SQL COM CTRL + ENTER
======================================== */

const sqlInput = document.getElementById("sql-input");

if (sqlInput) {
  sqlInput.addEventListener("keydown", event => {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      runPlayerQuery();
    }
  });
}


/* ========================================
   FECHAMENTO DE MODAIS
======================================== */

function registerModalOutsideClick(modalId, closeFunction) {
  const modal = document.getElementById(modalId);

  if (!modal) return;

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeFunction();
    }
  });
}


registerModalOutsideClick(
  "building-modal",
  closeBuildingModal
);

registerModalOutsideClick(
  "rules-modal",
  closeRulesModal
);

registerModalOutsideClick(
  "menu-modal",
  closeMenuModal
);


/* ========================================
   TECLA ESCAPE
======================================== */

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;

  const rulesModal = document.getElementById("rules-modal");
  const menuModal = document.getElementById("menu-modal");
  const buildingModal = document.getElementById("building-modal");

  /* Prioridade: regras */

  if (rulesModal?.classList.contains("open")) {
    closeRulesModal();
    return;
  }

  /* Menu */

  if (menuModal?.classList.contains("open")) {
    closeMenuModal();
    return;
  }

  /* Prédio */

  if (buildingModal?.classList.contains("open")) {
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

/* Inicializa partida */

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
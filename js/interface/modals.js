/* ========================================
   MODAIS — S.Q.L.
======================================== */

let rulesReturnFocus = null;
let rulesFromMenu = false;
let menuReturnFocus = null;


/* ========================================
   MODAL DE REGRAS
======================================== */

function openRulesModal(isIntro = false, fromMenu = false) {
  const cfg = getActiveModeConfig();

  const plural = (n, one, many) =>
    `${n} ${n === 1 ? one : many}`;

  const rulesMode = document.getElementById("rules-mode");
  const failureMode = gameState.gameMode === "falha";

  if (rulesMode) {
    rulesMode.innerHTML = failureMode
      ? `
          <span class="rules-mode-name">FALHA DO SISTEMA • ${cfg.label}</span>
          <span><b>${plural(cfg.lives, "vida", "vidas")}</b></span>
          <span>SQL bloqueado em todos os turnos</span>
          <span>A dificuldade altera somente as vidas</span>
        `
      : `
          <span class="rules-mode-name">CLÁSSICO • ${cfg.label}</span>
          <span><b>${plural(cfg.lives, "vida", "vidas")}</b></span>
          <span><b>${plural(cfg.queries, "consulta", "consultas")}</b> por solicitante</span>
          <span><b>${plural(cfg.required, "consulta válida", "consultas válidas")}</b> para decidir</span>
        `;
  }

  const rulesIntro = document.getElementById("rules-intro");
  if (rulesIntro) {
    rulesIntro.innerHTML = failureMode
      ? "A falha no sistema permanece ativa durante toda a partida. Inspecione o visitante e use os recursos disponíveis para decidir sem SQL."
      : "Você controla o acesso ao quartel. Em cada turno, investigue o solicitante e decida se deve <b>autorizar</b>, <b>negar a entrada</b> ou <b>encaminhar o caso</b>.";
  }

  document.querySelectorAll("[data-rule-classic]").forEach(rule => {
    rule.hidden = failureMode;
  });
  const failureRule = document.getElementById("rule-failure-mode");
  if (failureRule) failureRule.hidden = !failureMode;

  rulesFromMenu = fromMenu === true;

  const closeButton = document.getElementById("btn-rules-close");

  if (closeButton) {
    closeButton.textContent =
      isIntro
        ? "COMEÇAR TURNO"
        : rulesFromMenu
          ? "VOLTAR AO MENU"
          : "VOLTAR AO JOGO";
  }

  rulesReturnFocus = rulesFromMenu
    ? null
    : document.activeElement;

  const modal = document.getElementById("rules-modal");

  if (!modal) return;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  const rulesBody = modal.querySelector(".rules-body");

  if (rulesBody) {
    rulesBody.scrollTop = 0;
  }

  if (closeButton) {
    closeButton.focus();
  }
}


function closeRulesModal() {
  const modal = document.getElementById("rules-modal");

  if (!modal || !modal.classList.contains("open")) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  /* Retorno ao menu */

  if (rulesFromMenu) {
    rulesFromMenu = false;

    openMenuModal(true);

    return;
  }

  /* Retorno ao elemento anterior */

  if (rulesReturnFocus && rulesReturnFocus.focus) {
    rulesReturnFocus.focus();
  }

  rulesReturnFocus = null;
}


/* ========================================
   MODAL DO MENU
======================================== */

function openMenuModal(keepFocusOrigin = false) {
  if (!keepFocusOrigin) {
    menuReturnFocus = document.activeElement;
  }

  const modal = document.getElementById("menu-modal");

  if (!modal) return;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  const resumeButton = document.getElementById("btn-menu-resume");

  if (resumeButton) {
    resumeButton.focus();
  }
}


function closeMenuModal() {
  const modal = document.getElementById("menu-modal");

  if (!modal || !modal.classList.contains("open")) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  const target =
    menuReturnFocus ||
    document.getElementById("btn-menu");

  if (target && target.focus) {
    target.focus();
  }

  menuReturnFocus = null;
}


/* ========================================
   NAVEGAÇÃO MENU / REGRAS
======================================== */

function openRulesFromMenu() {
  const menu = document.getElementById("menu-modal");

  if (menu) {
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
  }

  openRulesModal(false, true);
}


function exitToHome() {
  window.location.href = "index.html";
}


/* ========================================
   GAME OVER
======================================== */

function showGameOver(message) {
  const messageElement =
    document.getElementById("gameover-message");

  const scoreElement =
    document.getElementById("final-score");

  const modal =
    document.getElementById("gameover-modal");

  if (!modal) return;

  if (messageElement) {
    messageElement.textContent =
      message ||
      "O comando dispensou você do posto após sucessivas falhas de identificação.";
  }

  if (scoreElement) {
    scoreElement.textContent =
      `PONTUAÇÃO FINAL: ${gameState.score}`;
  }

  modal.classList.add("open");
  modal.classList.add("defeat");
  modal.setAttribute("aria-hidden", "false");
}


/* ========================================
   REINICIALIZAÇÃO DA PARTIDA
======================================== */

function restartGame() {
  /* Limpa temporizadores */

  clearPendingTimers();
  stopDecisionTimer();

  if (explosionTimeoutId) {
    clearTimeout(explosionTimeoutId);
    explosionTimeoutId = null;
  }

  /* Remove efeitos de explosão */

  document.body.classList.remove("exploding");

  const overlay =
    document.getElementById("explosion-overlay");

  if (overlay) {
    overlay.classList.remove("boom");
  }

  /* Fecha todos os modais */

  const modalIds = [
    "gameover-modal",
    "menu-modal",
    "rules-modal",
    "building-modal"
  ];

  modalIds.forEach(id => {
    const modal = document.getElementById(id);

    if (!modal) return;

    modal.classList.remove("open");
    modal.classList.remove("defeat");
    modal.setAttribute("aria-hidden", "true");
  });

  /* Reseta controles de foco */

  rulesFromMenu = false;
  rulesReturnFocus = null;
  menuReturnFocus = null;

  /* Limpa notificações */

  const toast = document.getElementById("toast-message");

  if (toast) {
    toast.classList.remove("show");
  }

  /* Reseta seleção de alojamento */

  gameState.selectedApartment = null;

  /* Reinicia o jogo */

  startGame();

  /* Recupera o foco */

  const menuButton = document.getElementById("btn-menu");

  if (menuButton) {
    menuButton.focus();
  }
}

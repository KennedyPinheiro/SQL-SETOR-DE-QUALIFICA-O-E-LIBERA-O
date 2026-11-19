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
  const cfg = gameState.modeConfig[gameState.mode];

  const plural = (n, one, many) =>
    `${n} ${n === 1 ? one : many}`;

  document.getElementById("rules-mode").innerHTML = `
    <span class="rules-mode-name">MODO ${cfg.label}</span>
    <span><b>${plural(cfg.lives, "vida", "vidas")}</b></span>
    <span><b>${plural(cfg.queries, "consulta", "consultas")}</b> por solicitante</span>
    <span><b>${plural(cfg.required, "consulta válida", "consultas válidas")}</b> para decidir</span>`;

  rulesFromMenu = fromMenu === true;

  document.getElementById("btn-rules-close").textContent =
    isIntro === true
      ? "COMEÇAR TURNO"
      : rulesFromMenu
        ? "VOLTAR AO MENU"
        : "VOLTAR AO JOGO";

  rulesReturnFocus = rulesFromMenu ? null : document.activeElement;

  const modal = document.getElementById("rules-modal");

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  modal.querySelector(".rules-body").scrollTop = 0;

  document.getElementById("btn-rules-close").focus();
}

function closeRulesModal() {
  const modal = document.getElementById("rules-modal");

  if (!modal.classList.contains("open")) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  if (rulesFromMenu) {
    rulesFromMenu = false;
    openMenuModal(true);
    return;
  }

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

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  document.getElementById("btn-menu-resume").focus();
}

function closeMenuModal() {
  const modal = document.getElementById("menu-modal");

  if (!modal.classList.contains("open")) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  const target = menuReturnFocus || document.getElementById("btn-menu");

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

  menu.classList.remove("open");
  menu.setAttribute("aria-hidden", "true");

  openRulesModal(false, true);
}

function exitToHome() {
  window.location.href = "index.html";
}

/* ========================================
   GAME OVER
======================================== */

function showGameOver(message) {
  document.getElementById("gameover-message").textContent =
    message || "O comando dispensou você do posto após sucessivas falhas de identificação.";

  document.getElementById("final-score").textContent =
    `PONTUAÇÃO FINAL: ${gameState.score}`;

  const modal = document.getElementById("gameover-modal");

  modal.classList.add("open");
  modal.classList.add("defeat");
  modal.setAttribute("aria-hidden", "false");
}

/* ========================================
   REINICIALIZAÇÃO DA PARTIDA
======================================== */

function restartGame() {
  clearPendingTimers();
  stopDecisionTimer();

  if (explosionTimeoutId) {
    clearTimeout(explosionTimeoutId);
    explosionTimeoutId = null;
  }

  document.body.classList.remove("exploding");

  const overlay = document.getElementById("explosion-overlay");

  if (overlay) {
    overlay.classList.remove("boom");
  }

  [
    "gameover-modal",
    "menu-modal",
    "rules-modal",
    "building-modal"
  ].forEach(id => {
    const modal = document.getElementById(id);

    modal.classList.remove("open");
    modal.classList.remove("defeat");
    modal.setAttribute("aria-hidden", "true");
  });

  rulesFromMenu = false;
  rulesReturnFocus = null;
  menuReturnFocus = null;

  document.getElementById("toast-message").classList.remove("show");

  gameState.selectedApartment = null;

  startGame();

  document.getElementById("btn-menu").focus();
}

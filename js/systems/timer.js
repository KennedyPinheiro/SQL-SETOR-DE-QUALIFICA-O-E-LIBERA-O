/* ========================================
   SISTEMA DE CRONÔMETRO — S.Q.L.
======================================== */

/* ========================================
   INICIAR CRONÔMETRO
======================================== */

function startDecisionTimer() {
  if (
    gameState.gameOver ||
    gameState.decisionLocked ||
    decisionTimerRunning
  ) return;

  decisionTimerRunning = true;
  decisionTimerRemaining = DECISION_TIME;

  updateDecisionTimerUI();

  const tick = () => {
    if (!decisionTimerRunning) return;

    decisionTimerRemaining--;

    if (decisionTimerRemaining <= 0) {
      triggerExplosion();
      return;
    }

    updateDecisionTimerUI();

    later(tick, 1000);
  };

  later(tick, 1000);
}

/* ========================================
   PARAR CRONÔMETRO
======================================== */

function stopDecisionTimer() {
  decisionTimerRunning = false;

  const el = document.getElementById("decision-timer");

  if (el) {
    el.hidden = true;
    el.classList.remove("urgent");
  }
}

/* ========================================
   ATUALIZA INTERFACE DO CRONÔMETRO
======================================== */

function updateDecisionTimerUI() {
  const el = document.getElementById("decision-timer");

  if (!el) return;

  el.hidden = false;

  el.textContent = `⏱ ${decisionTimerRemaining}s PARA DECIDIR`;

  el.classList.toggle(
    "urgent",
    decisionTimerRemaining <= 3
  );
}

/* ========================================
   EXPLOSÃO — TEMPO ESGOTADO
======================================== */

function triggerExplosion() {
  if (gameState.gameOver || gameState.decisionLocked) return;

  decisionTimerRunning = false;
  gameState.decisionLocked = true;

  document.getElementById("btn-approve").disabled = true;
  document.getElementById("btn-deny").disabled = true;

  const overlay = document.getElementById("explosion-overlay");

  if (overlay) {
    const flash = document.createElement("div");

    flash.className = "flash-white";

    document.body.appendChild(flash);

    setTimeout(() => flash.remove(), 400);

    overlay.classList.add("boom");

    setTimeout(() => overlay.classList.remove("boom"), 1100);
  }

  document.body.classList.add("exploding");

  if (explosionTimeoutId) {
    clearTimeout(explosionTimeoutId);
  }

  explosionTimeoutId = setTimeout(() => {
    document.body.classList.remove("exploding");

    showGameOver(
      "A pressão do portão explodiu: você não tomou uma decisão a tempo."
    );
  }, 950);
}

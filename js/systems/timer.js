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
   ATUALIZAR INTERFACE DO CRONÔMETRO
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

    const approveButton = document.getElementById("btn-approve");
    const denyButton = document.getElementById("btn-deny");

    if (approveButton) approveButton.disabled = true;
    if (denyButton) denyButton.disabled = true;

    const overlay = document.getElementById("explosion-overlay");

    if (overlay) {
        const flash = document.createElement("div");

        flash.className = "flash-white";

        document.body.appendChild(flash);

        later(() => flash.remove(), 400);

        overlay.classList.add("boom");

        later(() => {
            overlay.classList.remove("boom");
        }, 1100);
    }

    document.body.classList.add("exploding");

    if (explosionTimeoutId) {
        clearTimeout(explosionTimeoutId);
    }

    explosionTimeoutId = later(() => {
        document.body.classList.remove("exploding");

        explosionTimeoutId = null;

        showGameOver(
            "A pressão do portão explodiu: você não tomou uma decisão a tempo."
        );
    }, 950);
}
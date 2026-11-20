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
}/* ========================================
   CRONÔMETRO — VISITANTE PRIORITÁRIO
======================================== */

function startPriorityTimer() {
    stopPriorityTimer();

    if (
        gameState.gameOver ||
        gameState.activeEvent !== "priority_visitor"
    ) return;

    gameState.priorityTimerRemaining = 15;
    gameState.priorityTimerRunning = true;

    let timer = document.getElementById("priority-timer");

    if (!timer) {
        timer = document.createElement("div");
        timer.id = "priority-timer";
        timer.className = "priority-timer";
        document.body.appendChild(timer);
    }

    timer.hidden = false;

    updatePriorityTimerUI();

    gameState.priorityTimerId = setInterval(() => {
        if (!gameState.priorityTimerRunning) return;

        gameState.priorityTimerRemaining--;

        updatePriorityTimerUI();

        if (gameState.priorityTimerRemaining <= 0) {
            stopPriorityTimer();
            triggerPriorityTimeout();
        }
    }, 1000);
}


/* ========================================
   ATUALIZAR CRONÔMETRO PRIORITÁRIO
======================================== */

function updatePriorityTimerUI() {
    const timer = document.getElementById("priority-timer");

    if (!timer) return;

    timer.textContent =
        `VISITANTE PRIORITÁRIO — ${gameState.priorityTimerRemaining}s`;

    timer.classList.toggle(
        "urgent",
        gameState.priorityTimerRemaining <= 5
    );
}


/* ========================================
   PARAR CRONÔMETRO PRIORITÁRIO
======================================== */

function stopPriorityTimer() {
    gameState.priorityTimerRunning = false;

    if (gameState.priorityTimerId) {
        clearInterval(gameState.priorityTimerId);
        gameState.priorityTimerId = null;
    }

    const timer = document.getElementById("priority-timer");

    if (timer) {
        timer.hidden = true;
        timer.classList.remove("urgent");
    }
}
/* ========================================
   TEMPO ESGOTADO — VISITANTE PRIORITÁRIO
======================================== */

function triggerPriorityTimeout() {
    if (gameState.gameOver || gameState.decisionLocked) return;

    gameState.decisionLocked = true;

    stopDecisionTimer();

    gameState.lives--;
    gameState.turn++;

    const approveButton = document.getElementById("btn-approve");
    const denyButton = document.getElementById("btn-deny");

    if (approveButton) approveButton.disabled = true;
    if (denyButton) denyButton.disabled = true;

    toastMessage(
        "PRAZO ESGOTADO! Você demorou para atender o visitante prioritário. -1 VIDA.",
        false
    );

    updateHUD();

    if (gameState.lives <= 0) {
        gameState.gameOver = true;

        later(() => {
            showGameOver(
                "Você perdeu todas as vidas por não atender os visitantes prioritários a tempo."
            );
        }, 1400);

        return;
    }

    later(() => {
        const toast = document.getElementById("toast-message");

        if (toast) toast.classList.remove("show");

        nextTurn();
    }, 2300);
}
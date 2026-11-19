/* ========================================
   SISTEMA DE DECISÃO — S.Q.L.
======================================== */


/* ========================================
   TOMADA DE DECISÃO
======================================== */

function makeDecision(approved) {
  if (gameState.gameOver || gameState.decisionLocked) return;

  gameState.decisionLocked = true;

  stopDecisionTimer();

  const toast = document.getElementById("toast-message");

  /* ========================================
     MILITAR LEGÍTIMO AUTORIZADO
  ======================================== */

  if (approved && !gameState.isImpostor) {
    const basePoints = 100;
    let investigationBonus = 0;

    if (gameState.suspicion === 0) {
      investigationBonus = 50;
    } else if (gameState.suspicion <= 20) {
      investigationBonus = 25;
    }
    const totalPoints = basePoints + investigationBonus;

    gameState.score += totalPoints;

    toastMessage(
      "MILITAR LEGÍTIMO AUTORIZADO. " +
      `+${basePoints} PONTOS` +
      (investigationBonus > 0
        ? ` +${investigationBonus} BÔNUS DE VERIFICAÇÃO`
        : ""),
      true
    );
    alasql(
      "UPDATE logs_portao SET status_atual = 'Dentro do quartel' WHERE id_doc = ?",
      [gameState.realNeighbor.id_doc]
    );
  }

  /* ========================================
    INFILTRADO IDENTIFICADO
  ======================================== */

  else if (!approved && gameState.isImpostor) {
    const basePoints = 150;
    let investigationBonus = 0;

    if (gameState.suspicion >= 80) {
      investigationBonus = 100;
    } else if (gameState.suspicion >= 60) {
      investigationBonus = 75;
    } else if (gameState.suspicion >= 40) {
      investigationBonus = 50;
    } else if (gameState.suspicion >= 20) {
      investigationBonus = 25;
    }

    const totalPoints = basePoints + investigationBonus;
    gameState.score += totalPoints;

    /* Feedback */

    toastMessage(
      "INFILTRADO IDENTIFICADO. " +
      gameState.impostorReason +
      ` +${basePoints} PONTOS` +
      (investigationBonus > 0
        ? ` +${investigationBonus} BÔNUS DE INVESTIGAÇÃO`
        : ""),
      true
    );
  }

  /* ========================================
     DECISÃO INCORRETA
  ======================================== */

  else {
    gameState.lives--;

    toastMessage(
      approved
        ? `FALHA: UM INFILTRADO ENTROU. ${gameState.impostorReason}`
        : "ERRO: VOCÊ NEGOU A ENTRADA DE UM MILITAR LEGÍTIMO.",
      false
    );
  }

  /* ========================================
     AVANÇO DO TURNO
  ======================================== */

  gameState.turn++;

  /* ========================================
     INVESTIGAÇÃO INCOMPLETA
  ======================================== */

  if (gameState.successfulQueries < gameState.requiredQueries) {
    toast.textContent +=
      " | INVESTIGAÇÃO INCOMPLETA: mínimo de consultas válidas não atingido.";
  }

  /* ========================================
     ATUALIZA HUD
  ======================================== */

  updateHUD();

  /* ========================================
     ANIMAÇÕES
  ======================================== */

  animateElement(
    document.getElementById("hud-score"),
    "is-updating",
    450
  );

  if (gameState.lives < gameState.maxLives) {
    animateElement(
      document.getElementById("hud-lives"),
      "is-damaged",
      500
    );
  }

  animateElement(
    document.querySelector(".decision-panel"),
    "is-feedback",
    450
  );

  /* ========================================
     BLOQUEIO DOS BOTÕES
  ======================================== */

  document.getElementById("btn-approve").disabled = true;
  document.getElementById("btn-deny").disabled = true;

  /* ========================================
     GAME OVER
  ======================================== */

  if (gameState.lives <= 0) {
    gameState.gameOver = true;

    later(() => {
      showGameOver(
        "Você perdeu todas as vidas. O setor de segurança foi comprometido."
      );
    }, 1400);

    return;
  }

  /* ========================================
     PRÓXIMO TURNO
  ======================================== */

  later(() => {
    toast.classList.remove("show");
    nextTurn();
  }, 2300);
}


/* ========================================
   SISTEMA DE NOTIFICAÇÕES
======================================== */

function toastMessage(message, success) {
  const toast = document.getElementById("toast-message");

  if (!toast) return;

  toast.textContent = message;

  toast.style.borderColor = success
    ? "#4caf50"
    : "#c7655e";

  toast.style.color = success
    ? "#4caf50"
    : "#c7655e";

  toast.classList.add("show");
}
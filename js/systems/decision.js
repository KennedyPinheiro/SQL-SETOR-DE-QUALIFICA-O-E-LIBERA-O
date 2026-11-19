/* ========================================
   SISTEMA DE DECISÃO — S.Q.L.
======================================== */

/* ========================================
   NOTIFICAÇÕES
======================================== */

function toastMessage(message, success) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;

  toast.className = "toast " + (success ? "success" : "error");

  toast.classList.add("show");

  later(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* ========================================
   TOMADA DE DECISÃO
======================================== */

function makeDecision(approved) {
  if (
    gameState.gameOver ||
    gameState.decisionLocked ||
    !gameState.currentVisitor
  ) return;

  gameState.decisionLocked = true;

  stopDecisionTimer();

  const correct = gameState.isImpostor
    ? !approved
    : approved;

  /* ========================================
     DECISÃO CORRETA
  ======================================== */

  if (correct) {
    if (gameState.isImpostor) {
      gameState.score += 150;

      toastMessage(
        "IMPOSTOR IDENTIFICADO! +150 PONTOS",
        true
      );
    } else {
      gameState.score += 100;

      toastMessage(
        "ENTRADA AUTORIZADA! +100 PONTOS",
        true
      );

      if (approved) {
        alasql(
          "UPDATE logs_portao SET status_atual = 'Dentro do quartel' WHERE id_doc = ?",
          [gameState.currentVisitor.id_doc]
        );
      }
    }
  }

  /* ========================================
     DECISÃO INCORRETA
  ======================================== */

  else {
    gameState.lives--;

    if (gameState.isImpostor && approved) {
      toastMessage(
        "IMPOSTOR LIBERADO! FALHA DE SEGURANÇA.",
        false
      );
    } else {
      toastMessage(
        "RESIDENTE LEGÍTIMO NEGADO! ERRO DE IDENTIFICAÇÃO.",
        false
      );
    }

    animateElement(
      document.querySelector(".visitor-panel"),
      "is-shaking",
      500
    );
  }

  /* ========================================
     INVESTIGAÇÃO INCOMPLETA
  ======================================== */

  if (
    gameState.successfulQueries <
    gameState.requiredQueries
  ) {
    toastMessage(
      "INVESTIGAÇÃO INCOMPLETA! DECISÃO PRECIPITADA.",
      false
    );
  }

  /* ========================================
     ATUALIZA INTERFACE
  ======================================== */

  updateHUD();

  document.getElementById("btn-approve").disabled = true;
  document.getElementById("btn-deny").disabled = true;

  /* ========================================
     FIM DE JOGO
  ======================================== */

  if (gameState.lives <= 0) {
    later(() => {
      showGameOver(
        "Você perdeu todas as vidas. O setor de segurança foi comprometido."
      );
    }, 1200);

    return;
  }

  /* ========================================
     PRÓXIMO TURNO
  ======================================== */

  later(() => {
    nextTurn();
  }, 2300);
}

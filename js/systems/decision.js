  /* ========================================
    SISTEMA DE DECISÃO — S.Q.L.
  ======================================== */


  /* ========================================
    TOMADA DE DECISÃO
  ======================================== */

  function getExpectedInvestigationEvidence() {
    const visitorFlaws = gameState.visitorFlaws || [];

    if (visitorFlaws.length) return visitorFlaws;

    const sqlCaseEvidence = {
      invalid_authorizer: ["invalid_authorizer"],
      unauthorized_sector: ["unauthorized_sector"],
      suspicious_time: ["suspicious_time"],
      cross_reference: ["cross_reference"],
      multiple_inconsistencies: [
        "invalid_authorizer",
        "unauthorized_sector",
        "suspicious_time"
      ]
    };

    return sqlCaseEvidence[gameState.investigationCase] ||
      (gameState.visitorCase ? [gameState.visitorCase] : []);
  }

  function getInvestigationCompletionBonus() {
    const expectedEvidence = getExpectedInvestigationEvidence();

    return expectedEvidence.length > 0 && expectedEvidence.every(
      evidence => gameState.discoveredEvidence.has(evidence)
    )
      ? 100
      : 0;
  }

  function getSuspicionInvestigationBonus() {
    if (gameState.suspicion >= 80) return 100;
    if (gameState.suspicion >= 60) return 75;
    if (gameState.suspicion >= 40) return 50;
    if (gameState.suspicion >= 20) return 25;
    return 0;
  }

  function makeDecision(decision) {
    if (gameState.gameOver || gameState.decisionLocked) return;

    if (![true, false, "refer"].includes(decision)) return;

    gameState.decisionLocked = true;
    if (typeof renderInterrogationUI === "function") renderInterrogationUI();

    stopDecisionTimer();
    stopPriorityTimer();

    const toast = document.getElementById("toast-message");

    /* ========================================
      MILITAR LEGÍTIMO AUTORIZADO
    ======================================== */

    if (decision === "refer" && gameState.requiresReferral) {
      const basePoints = 100;
      const investigationBonus = getSuspicionInvestigationBonus();
      const completeInvestigationBonus = getInvestigationCompletionBonus();
      const totalPoints =
        basePoints + investigationBonus + completeInvestigationBonus;

      gameState.score += totalPoints;

      toastMessage(
        "IRREGULARIDADE CADASTRAL ENCAMINHADA AO COMANDO. " +
        `+${basePoints} PONTOS` +
        (investigationBonus > 0
          ? ` +${investigationBonus} BÔNUS DE INVESTIGAÇÃO`
          : "") +
        (completeInvestigationBonus > 0
          ? ` +${completeInvestigationBonus} BÔNUS POR INVESTIGAÇÃO COMPLETA`
          : ""),
        true
      );
    }

    else if (decision === true && !gameState.isImpostor && !gameState.requiresReferral) {
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

    else if (decision === false && gameState.isImpostor && !gameState.requiresReferral) {
      const basePoints = 150;
      const investigationBonus = getSuspicionInvestigationBonus();
      const completeInvestigationBonus = getInvestigationCompletionBonus();

      const totalPoints =
        basePoints +
        investigationBonus +
        completeInvestigationBonus;

      gameState.score += totalPoints;

      /* Feedback */

      toastMessage(
        "INFILTRADO IDENTIFICADO. " +
        gameState.impostorReason +
        ` +${basePoints} PONTOS` +
        (investigationBonus > 0
          ? ` +${investigationBonus} BÔNUS DE INVESTIGAÇÃO`
          : "") +
        (completeInvestigationBonus > 0
          ? ` +${completeInvestigationBonus} BÔNUS POR INVESTIGAÇÃO COMPLETA`
          : ""),
        true
      );
    }

    /* ========================================
      DECISÃO INCORRETA
    ======================================== */

    else {
      gameState.lives--;

      let errorMessage;

      if (gameState.requiresReferral) {
        errorMessage =
          `ERRO: A AUTORIZAÇÃO TEM IRREGULARIDADES E DEVERIA SER ENCAMINHADA. ${gameState.referralReason}`;
      } else if (decision === "refer") {
        errorMessage = gameState.isImpostor
          ? `ENCAMINHAMENTO INDEVIDO: suspeita de infiltração exige negar a entrada. ${gameState.impostorReason}`
          : "ENCAMINHAMENTO INDEVIDO: não há irregularidade que exija revisão do comando.";
      } else if (decision === true) {
        errorMessage = `FALHA: UM INFILTRADO ENTROU. ${gameState.impostorReason}`;
      } else {
        errorMessage = "ERRO: VOCÊ NEGOU A ENTRADA DE UM MILITAR LEGÍTIMO.";
      }

      toastMessage(errorMessage, false);
    }

    /* ========================================
      AVANÇO DO TURNO
    ======================================== */

    gameState.turn++;

    /* ========================================
      INVESTIGAÇÃO INCOMPLETA
    ======================================== */

    if (
      gameState.gameMode !== "falha" &&
      gameState.successfulQueries < gameState.requiredQueries
    ) {
      gameState.score = Math.max(0, gameState.score - 50);

      toast.textContent +=
        " | INVESTIGAÇÃO INCOMPLETA: -50 PONTOS.";
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

    const systemFailureActive =
      gameState.activeEvent === "system_failure";

    document.getElementById("btn-approve").disabled =
      !systemFailureActive;

    document.getElementById("btn-deny").disabled =
      !systemFailureActive;
    document.getElementById("btn-refer").disabled =
      !systemFailureActive;

    /* ========================================
      GAME OVER
    ======================================== */

    if (gameState.lives <= 0) {
      gameState.gameOver = true;

      window.playSound?.("defeat");

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

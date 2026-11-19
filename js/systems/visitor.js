/* ========================================
   SISTEMA DE VISITANTES — S.Q.L.
======================================== */

/* ========================================
   GERAÇÃO DE VISITANTE
======================================== */

function generateVisitor() {
  const residents = alasql("SELECT * FROM militares");

  const base = residents[
    Math.floor(Math.random() * residents.length)
  ];

  const auth = alasql(
    "SELECT autorizado FROM lista_hoje WHERE id_doc = ?",
    [base.id_doc]
  )[0];

  const log = alasql(
    "SELECT status_atual FROM logs_portao WHERE id_doc = ?",
    [base.id_doc]
  )[0];

  gameState.realNeighbor = { ...base };
  gameState.currentVisitor = { ...base };

  gameState.isImpostor = false;
  gameState.impostorReason = "";
  gameState.visitorCase = "legitimate";

  gameState.neighborAlreadyInside =
    log.status_atual === "Dentro do quartel";

  /* ========================================
     CASOS PRIORITÁRIOS
  ======================================== */

  if (gameState.neighborAlreadyInside) {
    gameState.isImpostor = true;
    gameState.visitorCase = "duplicate_inside";

    gameState.impostorReason =
      "Este residente já consta como dentro do quartel.";

    return;
  }

  if (auth.autorizado === "Nao") {
    gameState.isImpostor = true;
    gameState.visitorCase = "unauthorized";

    gameState.impostorReason =
      "O residente não possui autorização para entrar hoje.";

    return;
  }

  /* ========================================
     CHANCE DE IMPOSTOR
  ======================================== */

  const config = gameState.modeConfig[gameState.mode];

  if (Math.random() < config.impostorChance) {
    gameState.isImpostor = true;

    const flaws = [
      "forged_document",
      "wrong_apartment",
      "physical_anomaly",
      "hat_mismatch",
      "glasses_mismatch"
    ];

    const flaw = flaws[
      Math.floor(Math.random() * flaws.length)
    ];

    gameState.visitorCase = flaw;

    /* ========================================
       APLICA IRREGULARIDADE
    ======================================== */

    switch (flaw) {
      case "forged_document":
        gameState.currentVisitor.id_doc = "9999-XX";

        gameState.impostorReason =
          "Documento falsificado.";

        break;

      case "wrong_apartment":
        gameState.currentVisitor.alojamento = "404";

        gameState.impostorReason =
          "Alojamento incompatível com o registro.";

        break;

      case "physical_anomaly":
        gameState.currentVisitor.pele = "Esverdeada";

        gameState.impostorReason =
          "Anomalia física detectada.";

        break;

      case "hat_mismatch":
        gameState.currentVisitor.quepe =
          gameState.currentVisitor.quepe === "Sim"
            ? "Nao"
            : "Sim";

        gameState.impostorReason =
          "Inconsistência no uso do quepe.";

        break;

      case "glasses_mismatch":
        gameState.currentVisitor.oculos =
          gameState.currentVisitor.oculos === "Sim"
            ? "Nao"
            : "Sim";

        gameState.impostorReason =
          "Inconsistência na característica dos óculos.";

        break;
    }
  }
}

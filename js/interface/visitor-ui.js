/* ========================================
   INTERFACE DO VISITANTE — S.Q.L.
======================================== */


/* ========================================
   RENDERIZAÇÃO DOS DADOS
======================================== */

function renderVisitorUI() {
  const v = gameState.currentVisitor;

  if (!v) return;

  const presentedId = document.getElementById("presented-id");

  if (presentedId) {
    presentedId.innerHTML = `
      <div>
        <small>NOME COMPLETO</small>
        <strong>${escapeHTML(v.nome)}</strong>
      </div>

      <div>
        <small>DOCUMENTO</small>
        <strong>${escapeHTML(v.id_doc)}</strong>
      </div>

      <div>
        <small>ALOJAMENTO</small>
        <strong>${escapeHTML(v.alojamento)}</strong>
      </div>

      <div>
        <small>PATENTE</small>
        <strong>${escapeHTML(v.patente)}</strong>
      </div>
    `;
  }

  /* ========================================
     CAMPO DE CONSULTA SQL
  ======================================== */

  const sqlInput = document.getElementById("sql-input");

  if (sqlInput) {
    sqlInput.value = "";

    sqlInput.placeholder =
      "-- Investigue o cadastro deste solicitante.\n" +
      "-- Exemplo: SELECT * FROM militares;";
  }

  /* ========================================
     RETRATO
  ======================================== */

  renderPortrait(v);

  /* ========================================
     FALA DO VISITANTE
  ======================================== */

  const speechLines = [
    "Boa tarde, sentinela. Preciso entrar no quartel, pode liberar?",
    "Soldado, esqueci meu crachá. Pode abrir o portão para mim?",
    "Sirvo aqui há anos. Está tudo certo com meu cadastro?",
    "Está frio aqui fora. Podemos agilizar a entrada?"
  ];

  const speech = document.getElementById("visitor-speech");

  if (speech) {
    speech.textContent =
      speechLines[Math.floor(Math.random() * speechLines.length)];
  }

  /* ========================================
     DESTINO DO INTERFONE
  ======================================== */

  const destination = document.getElementById("intercom-destination");

  if (destination) {
    destination.textContent = `ALOJ. ${v.alojamento}`;
  }
}


/* ========================================
   RENDERIZAÇÃO DO RETRATO
======================================== */

function renderPortrait(v) {
  if (!v) return;

  const avatar = document.getElementById("visitor-avatar");

  if (!avatar) return;

  /* 
     Mantém a aparência base do militar verdadeiro.
     As características visuais do visitante são
     aplicadas sobre esse retrato.
  */

  const base = gameState.realNeighbor || v;

  const look = PORTRAIT_LOOKS[base.id_doc];

  avatar.innerHTML = buildPortrait({
    look,
    hat: v.quepe === "Sim",
    glasses: v.oculos === "Sim",
    green: v.pele === "Esverdeada"
  });
}
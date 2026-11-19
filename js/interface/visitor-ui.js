/* ========================================
   INTERFACE DO VISITANTE — S.Q.L.
======================================== */

function renderVisitorUI() {
  const v = gameState.currentVisitor;

  document.getElementById("presented-id").innerHTML = `
    <div><small>NOME COMPLETO</small><strong>${escapeHTML(v.nome)}</strong></div>
    <div><small>DOCUMENTO</small><strong>${escapeHTML(v.id_doc)}</strong></div>
    <div><small>ALOJAMENTO</small><strong>${escapeHTML(v.alojamento)}</strong></div>
    <div><small>PATENTE</small><strong>${escapeHTML(v.patente)}</strong></div>`;

  document.getElementById("sql-input").value = "";

  document.getElementById("sql-input").placeholder =
    "-- Investigue o cadastro deste solicitante.\n-- Exemplo: SELECT * FROM militares;";

  renderPortrait(v);

  document.getElementById("visitor-speech").textContent = [
    "Boa tarde, sentinela. Preciso entrar no quartel, pode liberar?",
    "Soldado, esqueci meu crachá. Pode abrir o portão para mim?",
    "Sirvo aqui há anos. Está tudo certo com meu cadastro?",
    "Está frio aqui fora. Podemos agilizar a entrada?"
  ][Math.floor(Math.random() * 4)];

  document.getElementById("intercom-destination").textContent =
    `ALOJ. ${v.alojamento}`;
}

/* ========================================
   RENDERIZAÇÃO DO RETRATO
======================================== */

function renderPortrait(v) {
  const base = gameState.realNeighbor || v;
  const look = PORTRAIT_LOOKS[base.id_doc];

  document.getElementById("visitor-avatar").innerHTML = buildPortrait({
    look,
    hat: v.quepe === "Sim",
    glasses: v.oculos === "Sim",
    green: v.pele === "Esverdeada"
  });
}

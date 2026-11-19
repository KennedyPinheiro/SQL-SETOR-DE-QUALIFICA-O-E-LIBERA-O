const gameState = {
  mode: "normal",
  modeConfig: {
    facil: { lives: 5, queries: 5, required: 1, impostorChance: 0.28, label: "FÁCIL" },
    normal: { lives: 3, queries: 4, required: 2, impostorChance: 0.45, label: "NORMAL" },
    dificil: { lives: 1, queries: 4, required: 3, impostorChance: 0.62, label: "DIFÍCIL" }
  },
  score: 0, lives: 3, maxLives: 3, turn: 1, queriesRemaining: 4, successfulQueries: 0, requiredQueries: 2, usedQueries: new Set(),
  currentVisitor: null,
  realNeighbor: null,
  isImpostor: false,
  visitorCase: null,
  impostorReason: "",
  neighborAlreadyInside: false,
  gameOver: false,
  selectedApartment: null, decisionLocked: false
};

/* Cronômetro de decisão obrigatória (segundos) */
const DECISION_TIME = 10;
let decisionTimerRemaining = 0;
let decisionTimerRunning = false;
let explosionTimeoutId = null;

function startDecisionTimer() {
  if (gameState.gameOver || gameState.decisionLocked || decisionTimerRunning) return;
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
function stopDecisionTimer() {
  decisionTimerRunning = false;
  const el = document.getElementById("decision-timer");
  if (el) { el.hidden = true; el.classList.remove("urgent"); }
}
function updateDecisionTimerUI() {
  const el = document.getElementById("decision-timer");
  if (!el) return;
  el.hidden = false;
  el.textContent = `⏱ ${decisionTimerRemaining}s PARA DECIDIR`;
  el.classList.toggle("urgent", decisionTimerRemaining <= 3);
}
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
  if (explosionTimeoutId) clearTimeout(explosionTimeoutId);
  explosionTimeoutId = setTimeout(() => {
    document.body.classList.remove("exploding");
    showGameOver("A pressão do portão explodiu: você não tomou uma decisão a tempo.");
  }, 950);
}

const seedResidents = [
  { id_doc: "8841-FM", nome: "Francis Mosses", alojamento: "101", patente: "Soldado", quepe: "Sim", oculos: "Nao", pele: "Normal" },
  { id_doc: "3920-AR", nome: "Ana Rudboys", alojamento: "204", patente: "Cabo", quepe: "Nao", oculos: "Sim", pele: "Normal" },
  { id_doc: "7719-WA", nome: "W. Afton", alojamento: "302", patente: "Capitão", quepe: "Sim", oculos: "Sim", pele: "Normal" },
  { id_doc: "5510-ML", nome: "Mia Lin", alojamento: "105", patente: "Tenente", quepe: "Nao", oculos: "Nao", pele: "Normal" },
  { id_doc: "6102-CR", nome: "Carlos Rocha", alojamento: "401", patente: "Sargento", quepe: "Sim", oculos: "Nao", pele: "Normal" },
  { id_doc: "9034-EB", nome: "Elena Vance", alojamento: "202", patente: "Major", quepe: "Nao", oculos: "Sim", pele: "Normal" },
  { id_doc: "2280-JS", nome: "Jonas Silva", alojamento: "303", patente: "Soldado", quepe: "Nao", oculos: "Nao", pele: "Normal" },
  { id_doc: "4491-PT", nome: "Paula Torres", alojamento: "104", patente: "Cabo", quepe: "Sim", oculos: "Sim", pele: "Normal" },
  { id_doc: "7355-RK", nome: "Ravi Kumar", alojamento: "203", patente: "Subtenente", quepe: "Nao", oculos: "Sim", pele: "Normal" },
  { id_doc: "1802-LM", nome: "Lia Martins", alojamento: "301", patente: "Tenente", quepe: "Nao", oculos: "Nao", pele: "Normal" }
];

let pendingTimers = new Set();
function animationsEnabled() {
  if (document.body.classList.contains("reduce-motion")) return false;

  const settings = typeof getSqlSettings === "function"
    ? getSqlSettings()
    : null;

  return settings ? settings.animations !== false : true;
}

function animateElement(element, className, duration = 600) {
  if (!element || !animationsEnabled()) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
}
function later(fn, ms) {
  const id = setTimeout(() => { pendingTimers.delete(id); fn(); }, ms);
  pendingTimers.add(id);
}
function clearPendingTimers() {
  pendingTimers.forEach(clearTimeout);
  pendingTimers.clear();
}

function setupDatabase() {
  ["militares", "lista_hoje", "logs_portao"].forEach(t => alasql(`DROP TABLE IF EXISTS ${t}`));
  alasql(`CREATE TABLE militares (id_doc STRING, nome STRING, alojamento STRING, patente STRING, quepe STRING, oculos STRING, pele STRING)`);
  alasql(`CREATE TABLE lista_hoje (id_doc STRING, autorizado STRING)`);
  alasql(`CREATE TABLE logs_portao (id_doc STRING, status_atual STRING)`);
  seedResidents.forEach((r, i) => {
    alasql("INSERT INTO militares VALUES (?,?,?,?,?,?,?)", [r.id_doc, r.nome, r.alojamento, r.patente, r.quepe, r.oculos, r.pele]);
    alasql("INSERT INTO lista_hoje VALUES (?,?)", [r.id_doc, i === 4 ? "Nao" : "Sim"]);
    alasql("INSERT INTO logs_portao VALUES (?,?)", [r.id_doc, i === 5 ? "Dentro do quartel" : "Fora do quartel"]);
  });
}

function nextTurn() {
  if (gameState.gameOver) return;
  gameState.queriesRemaining = gameState.modeConfig[gameState.mode].queries;
  gameState.requiredQueries = gameState.modeConfig[gameState.mode].required;
  gameState.successfulQueries = 0;
  gameState.usedQueries = new Set();
  gameState.decisionLocked = false;
  updateSqlProgress();
  stopDecisionTimer();
  document.getElementById("btn-call").disabled = false;
  updateQueriesHUD();
  document.getElementById("intercom-result").textContent = "Canal disponível. Nenhuma chamada realizada.";
  document.getElementById("intercom-destination").textContent = "ALOJ. ---";
  document.getElementById("sql-result-area").innerHTML = '<p class="empty-result">Nenhuma consulta executada nesta inspeção.</p>';
  document.getElementById("result-status").textContent = "AGUARDANDO COMANDO";
  document.getElementById("btn-approve").disabled = true;
  document.getElementById("btn-deny").disabled = true;

  const residents = alasql("SELECT * FROM militares");
  const base = residents[Math.floor(Math.random() * residents.length)];

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

  // CASO 1 — O militar verdadeiro já está dentro do quartel.
  if (gameState.neighborAlreadyInside) {
    gameState.isImpostor = true;
    gameState.visitorCase = "duplicate_inside";

    gameState.impostorReason =
      "O registro do portão indica que o militar verdadeiro já está dentro do quartel.";
  }

  // CASO 2 — Militar sem autorização para entrar.
  else if (auth.autorizado === "Nao") {
    gameState.isImpostor = true;
    gameState.visitorCase = "unauthorized";

    gameState.impostorReason =
      "O militar não consta como autorizado na lista de hoje.";
  }

  // CASO 3 — Possível identidade falsificada.
  else if (
    Math.random() < gameState.modeConfig[gameState.mode].impostorChance
  ) {
    gameState.isImpostor = true;

    const flaws = [
      {
        type: "forged_document",
        apply: () => {
          gameState.currentVisitor.id_doc = "9999-XX";
          gameState.impostorReason =
            "Número de identificação falsificado.";
        }
      },
      {
        type: "wrong_apartment",
        apply: () => {
          gameState.currentVisitor.alojamento = "404";
          gameState.impostorReason =
            "Alojamento divergente do cadastro oficial.";
        }
      },
      {
        type: "physical_anomaly",
        apply: () => {
          gameState.currentVisitor.pele = "Esverdeada";
          gameState.impostorReason =
            "Anomalia física: coloração da pele divergente.";
        }
      },
      {
        type: "hat_mismatch",
        apply: () => {
          gameState.currentVisitor.quepe =
            base.quepe === "Sim" ? "Nao" : "Sim";

          gameState.impostorReason =
            "Aparência divergente: uso de quepe.";
        }
      },
      {
        type: "glasses_mismatch",
        apply: () => {
          gameState.currentVisitor.oculos =
            base.oculos === "Sim" ? "Nao" : "Sim";

          gameState.impostorReason =
            "Aparência divergente: uso de óculos.";
        }
      }
    ];

    const flaw = flaws[Math.floor(Math.random() * flaws.length)];

    flaw.apply();
    gameState.visitorCase = flaw.type;
  }
  renderVisitorUI();
  updateHUD();
}

function renderVisitorUI() {
  const v = gameState.currentVisitor;
  document.getElementById("presented-id").innerHTML = `
    <div><small>NOME COMPLETO</small><strong>${escapeHTML(v.nome)}</strong></div>
    <div><small>DOCUMENTO</small><strong>${escapeHTML(v.id_doc)}</strong></div>
    <div><small>ALOJAMENTO</small><strong>${escapeHTML(v.alojamento)}</strong></div>
    <div><small>PATENTE</small><strong>${escapeHTML(v.patente)}</strong></div>`;
  document.getElementById("sql-input").value = "";
  document.getElementById("sql-input").placeholder = "-- Investigue o cadastro deste solicitante.\n-- Exemplo: SELECT * FROM militares;";
  renderPortrait(v);
  document.getElementById("visitor-speech").textContent = [
    "Boa tarde, sentinela. Preciso entrar no quartel, pode liberar?",
    "Soldado, esqueci meu crachá. Pode abrir o portão para mim?",
    "Sirvo aqui há anos. Está tudo certo com meu cadastro?",
    "Está frio aqui fora. Podemos agilizar a entrada?"
  ][Math.floor(Math.random() * 4)];
  document.getElementById("intercom-destination").textContent = `ALOJ. ${v.alojamento}`;
}

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
animateElement(
  document.querySelector(".visitor-panel"),
  "is-changing",
  650
);

animateElement(
  document.querySelector(".identity-card"),
  "is-revealing",
  500
);

let rulesReturnFocus = null;
let rulesFromMenu = false;
let menuReturnFocus = null;

function openRulesModal(isIntro = false, fromMenu = false) {
  const cfg = gameState.modeConfig[gameState.mode];
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  document.getElementById("rules-mode").innerHTML = `
    <span class="rules-mode-name">MODO ${cfg.label}</span>
    <span><b>${plural(cfg.lives, "vida", "vidas")}</b></span>
    <span><b>${plural(cfg.queries, "consulta", "consultas")}</b> por solicitante</span>
    <span><b>${plural(cfg.required, "consulta válida", "consultas válidas")}</b> para decidir</span>`;
  rulesFromMenu = fromMenu === true;
  document.getElementById("btn-rules-close").textContent = isIntro === true ? "COMEÇAR TURNO" : rulesFromMenu ? "VOLTAR AO MENU" : "VOLTAR AO JOGO";
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
  if (rulesReturnFocus && rulesReturnFocus.focus) rulesReturnFocus.focus();
  rulesReturnFocus = null;
}

function openMenuModal(keepFocusOrigin = false) {
  if (!keepFocusOrigin) menuReturnFocus = document.activeElement;
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
  if (target && target.focus) target.focus();
  menuReturnFocus = null;
}
function openRulesFromMenu() {
  const menu = document.getElementById("menu-modal");
  menu.classList.remove("open");
  menu.setAttribute("aria-hidden", "true");
  openRulesModal(false, true);
}
function exitToHome() {
  window.location.href = "index.html";
}

function runPlayerQuery() {
  if (gameState.gameOver || gameState.decisionLocked) return;
  const area = document.getElementById("sql-result-area");
  animateElement(
    document.querySelector(".terminal-card"),
    "is-ready",
    550
  );
  if (gameState.queriesRemaining <= 0) {
    showSqlMessage("Limite de consultas atingido para este solicitante.", "warning");
    return;
  }
  const rawQuery = document.getElementById("sql-input").value.trim();
  if (!rawQuery) return;

  const query = rawQuery
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();

  if (!query) return;

  if (!/^SELECT\b/i.test(query) || /;[\s\S]*\S/.test(query.replace(/;\s*$/, ""))) {
    showSqlMessage("ACESSO NEGADO: somente uma instrução SELECT é permitida por execução.", "error");
    return;
  }
  if (!/\b(militares|lista_hoje|logs_portao)\b/i.test(query)) {
    showSqlMessage("Investigue uma das tabelas do sistema: militares, lista_hoje ou logs_portao.", "warning");
    return;
  }

  try {
    const normalizedQuery = query.replace(/\s+/g, " ").replace(/;$/, "").trim().toLowerCase();
    const data = alasql(query);
    gameState.queriesRemaining--;

    if (Array.isArray(data) && data.length > 0 && !gameState.usedQueries.has(normalizedQuery)) {
      gameState.usedQueries.add(normalizedQuery);
      gameState.successfulQueries++;
    }

    updateQueriesHUD();
    updateSqlProgress();
    if (gameState.queriesRemaining <= 0) startDecisionTimer();
    document.getElementById("result-status").textContent = "CONSULTA CONCLUÍDA";

    if (!Array.isArray(data) || data.length === 0) {
      area.innerHTML = '<div class="sql-message">Consulta executada. Nenhum registro encontrado. Ela não conta para o objetivo da investigação.</div>';
      animateElement(area, "is-updating", 400);
      return;
    }

    const headers = Object.keys(data[0]);
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    headers.forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.forEach(row => {
      const tr = document.createElement("tr");
      headers.forEach(h => {
        const td = document.createElement("td");
        td.textContent = row[h] ?? "NULL";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    area.replaceChildren(table);
    animateElement(area, "is-updating", 400);
  } catch (error) {
    document.getElementById("result-status").textContent = "ERRO NA CONSULTA";
    showSqlMessage(`Erro SQL: ${error.message}`, "error");
  }
}

function showSqlMessage(message, type) {
  const area = document.getElementById("sql-result-area");
  area.innerHTML = "";
  const box = document.createElement("div");
  box.className = "sql-message";
  box.style.borderLeftColor = type === "error" ? "#c7655e" : "#d7a85c";
  box.textContent = message;
  area.appendChild(box);
  document.getElementById("result-status").textContent = type === "error" ? "ERRO" : "AVISO";
}

function callApartment() {
  if (gameState.gameOver || gameState.decisionLocked) return;
  const alojamento = gameState.currentVisitor.alojamento;
  const result = document.getElementById("intercom-result");
  result.textContent = `Chamando alojamento ${alojamento}...`;
  document.getElementById("btn-call").disabled = true;
  later(() => {
    if (gameState.neighborAlreadyInside) {
      result.innerHTML = '<strong class="status-bad">"Eu já estou dentro do quartel! Quem está aí no portão?!"</strong>';
   } else if (gameState.visitorCase === "wrong_apartment") {
      result.innerHTML = '<strong class="status-bad">Quem atendeu o rádio afirma que não conhece o solicitante.</strong>';
    } else {
      result.textContent = "Ninguém atendeu. Não foi possível confirmar a identidade.";
    }
    document.getElementById("btn-call").disabled = false;
  }, 650);
}

function insertTemplate(type) {
  const templates = {
    militares: "-- Listar militares cadastrados\nSELECT * FROM militares;",
    join: "-- Relacionar militares, autorizações e registros\nSELECT m.nome, m.alojamento, l.autorizado, p.status_atual\nFROM militares m\nJOIN lista_hoje l ON m.id_doc = l.id_doc\nJOIN logs_portao p ON m.id_doc = p.id_doc;",
    logs: "-- Consultar todos os registros do portão\nSELECT * FROM logs_portao;",
    autorizacao: "-- Encontrar militares sem autorização\nSELECT m.nome, m.alojamento, l.autorizado\nFROM militares m\nJOIN lista_hoje l ON m.id_doc = l.id_doc\nWHERE l.autorizado = 'Nao';"
  };
  document.getElementById("sql-input").value = templates[type] || "";
  document.getElementById("sql-input").focus();
}

function makeDecision(approved) {
  if (gameState.gameOver || gameState.decisionLocked) return;

  gameState.decisionLocked = true;
  stopDecisionTimer();
  const toast = document.getElementById("toast-message");
  if (approved && !gameState.isImpostor) {
    gameState.score += 100;
    toastMessage("MILITAR LEGÍTIMO AUTORIZADO. +100 PONTOS", true);
    alasql("UPDATE logs_portao SET status_atual = 'Dentro do quartel' WHERE id_doc = ?", [gameState.realNeighbor.id_doc]);
  } else if (!approved && gameState.isImpostor) {
    gameState.score += 150;
    toastMessage(`INFILTRADO IDENTIFICADO. ${gameState.impostorReason} +150 PONTOS`, true);
  } else {
    gameState.lives--;
    toastMessage(approved ? `FALHA: UM INFILTRADO ENTROU. ${gameState.impostorReason}` : "ERRO: VOCÊ NEGOU A ENTRADA DE UM MILITAR LEGÍTIMO.", false);
  }
  gameState.turn++;
  if (gameState.successfulQueries < gameState.requiredQueries) {
    toast.textContent += " | INVESTIGAÇÃO INCOMPLETA: mínimo de consultas válidas não atingido.";
  }
  updateHUD();
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
  document.getElementById("btn-approve").disabled = true;
  document.getElementById("btn-deny").disabled = true;
  if (gameState.lives <= 0) {
    gameState.gameOver = true;
    later(showGameOver, 1400);
  } else {
    later(() => { toast.classList.remove("show"); nextTurn(); }, 2300);
  }
}

function toastMessage(message, success) {
  const toast = document.getElementById("toast-message");
  toast.textContent = message;
  toast.style.borderColor = success ? "#658d70" : "#c7655e";
  toast.style.color = success ? "#d7ead9" : "#f0b0a8";
  toast.classList.add("show");
}
function updateHUD() {
  document.getElementById("hud-day").textContent = `TURNO ${String(gameState.turn).padStart(2, "0")}`;
  document.getElementById("hud-score").textContent = String(gameState.score).padStart(4, "0");
  document.getElementById("hud-lives").textContent = Array.from({ length: gameState.maxLives }, (_, i) => i < gameState.lives ? "♥" : "♡").join(" ");
}
function updateQueriesHUD() {
  document.getElementById("queries-left").textContent =
    `${gameState.queriesRemaining} CONSULTAS RESTANTES`;

  const executeButton = document.getElementById("btn-exec-sql");

  if (executeButton) {
    executeButton.disabled =
      gameState.queriesRemaining <= 0 ||
      gameState.decisionLocked ||
      gameState.gameOver;
  }
}
function openBuildingModal() {
  renderBuilding();
  const modal = document.getElementById("building-modal");
  modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
}
function closeBuildingModal() {
  const modal = document.getElementById("building-modal");
  modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true");
}
function renderBuilding() {
  const grid = document.getElementById("building-grid");
  grid.innerHTML = "";
  for (let floor = 4; floor >= 1; floor--) {
    const label = document.createElement("div");
    label.className = "floor-name";
    label.textContent = `PAV. ${floor}`;
    grid.appendChild(label);
    const units = document.createElement("div");
    units.className = "floor-units";
    for (let number = 1; number <= 4; number++) {
      const alojamento = `${floor}0${number}`;
      const resident = alasql("SELECT * FROM militares WHERE alojamento = ?", [alojamento])[0];
      const button = document.createElement("button");
      button.className = "apt-unit" + (resident ? "" : " vacant") + (gameState.selectedApartment === alojamento ? " selected" : "");
      button.innerHTML = `<strong>${alojamento}</strong><small>${resident ? "CADASTRADO" : "SEM REGISTRO"}</small>`;
      button.onclick = () => selectApartment(alojamento);
      units.appendChild(button);
    }
    grid.appendChild(units);
  }
  if (gameState.selectedApartment) selectApartment(gameState.selectedApartment, false);
}
function selectApartment(alojamento, rerender = true) {
  gameState.selectedApartment = alojamento;
  if (rerender) renderBuilding();
  const resident = alasql("SELECT * FROM militares WHERE alojamento = ?", [alojamento])[0];
  const details = document.getElementById("apartment-details");
  if (!resident) {
    details.innerHTML = `<div class="details-placeholder"><span>!</span><strong>ALOJAMENTO ${alojamento} SEM CADASTRO</strong><small>Não há militar registrado neste alojamento.</small></div>`;
    return;
  }
  const auth = alasql("SELECT autorizado FROM lista_hoje WHERE id_doc = ?", [resident.id_doc])[0];
  const log = alasql("SELECT status_atual FROM logs_portao WHERE id_doc = ?", [resident.id_doc])[0];
  details.innerHTML = `
    <div class="resident-detail">
      <h3>▰ ${escapeHTML(resident.nome)} <span style="color:#82938a;font-weight:400">/ ALOJ. ${alojamento}</span></h3>
      <div>DOCUMENTO: <b>${escapeHTML(resident.id_doc)}</b></div>
      <div>PATENTE: <b>${escapeHTML(resident.patente)}</b></div>
      <div>QUEPE: <b>${resident.quepe}</b> · ÓCULOS: <b>${resident.oculos}</b></div>
      <div>AUTORIZAÇÃO: <b class="${auth.autorizado === "Sim" ? "status-good" : "status-bad"}">${auth.autorizado === "Sim" ? "AUTORIZADO" : "NÃO AUTORIZADO"}</b></div>
      <div>PORTÃO: <b>${log.status_atual === "Dentro do quartel" ? "DENTRO DO QUARTEL" : "FORA DO QUARTEL"}</b></div>
    </div>`;
}
function selectMode(mode) {
  if (gameState.modeConfig[mode]) gameState.mode = mode;
}
function startGame() {
  const config = gameState.modeConfig[gameState.mode];
  gameState.lives = config.lives; gameState.maxLives = config.lives; gameState.queriesRemaining = config.queries; gameState.requiredQueries = config.required;
  gameState.successfulQueries = 0;
  gameState.usedQueries = new Set();
  gameState.decisionLocked = false;
  stopDecisionTimer();

  updateSqlProgress(); setupDatabase();
  updateHUD(); nextTurn();
}
function updateSqlProgress() {
  const el = document.getElementById("sql-progress");
  if (el) el.textContent = `${gameState.successfulQueries} / ${gameState.requiredQueries} CONSULTAS`;
  const objective = document.getElementById("sql-objective-text");
  if (objective) objective.textContent = gameState.queriesRemaining <= 0
    ? "CONSULTAS ESGOTADAS: nenhuma consulta resta. Decida agora se autoriza ou nega a entrada!"
    : `Modo ${gameState.modeConfig[gameState.mode].label}: execute consultas SQL diferentes e compare os dados oficiais antes de decidir.`;
  const ready = gameState.queriesRemaining <= 0 || gameState.successfulQueries >= gameState.requiredQueries;
  const approve = document.getElementById("btn-approve");
  const deny = document.getElementById("btn-deny");
  if (approve && !gameState.decisionLocked) approve.disabled = !ready;
  if (deny && !gameState.decisionLocked) deny.disabled = !ready;
}

function showGameOver(message) {
  document.getElementById("gameover-message").textContent = message || "O comando dispensou você do posto após sucessivas falhas de identificação.";
  document.getElementById("final-score").textContent = `PONTUAÇÃO FINAL: ${gameState.score}`;
  document.getElementById("gameover-modal").classList.add("open");
  const modal = document.getElementById("gameover-modal");

  modal.classList.add("open");
  modal.classList.add("defeat");
  modal.setAttribute("aria-hidden", "false");
}
function restartGame() {
  clearPendingTimers();
  stopDecisionTimer();
  if (explosionTimeoutId) { clearTimeout(explosionTimeoutId); explosionTimeoutId = null; }
  document.body.classList.remove("exploding");
  const overlay = document.getElementById("explosion-overlay");
  if (overlay) overlay.classList.remove("boom");
  ["gameover-modal", "menu-modal", "rules-modal", "building-modal"].forEach(id => {
    const m = document.getElementById(id);

    m.classList.remove("open");
    m.classList.remove("defeat");
    m.setAttribute("aria-hidden", "true");
  });
  rulesFromMenu = false; rulesReturnFocus = null; menuReturnFocus = null;
  document.getElementById("toast-message").classList.remove("show");
  gameState.selectedApartment = null;
  startGame();
  document.getElementById("btn-menu").focus();
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

document.getElementById("sql-input").addEventListener("keydown", e => { if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); runPlayerQuery(); } });
document.getElementById("building-modal").addEventListener("click", e => { if (e.target.id === "building-modal") closeBuildingModal(); });
document.getElementById("rules-modal").addEventListener("click", e => { if (e.target.id === "rules-modal") closeRulesModal(); });
document.getElementById("menu-modal").addEventListener("click", e => { if (e.target.id === "menu-modal") closeMenuModal(); });
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (document.getElementById("rules-modal").classList.contains("open")) closeRulesModal();
  else if (document.getElementById("menu-modal").classList.contains("open")) closeMenuModal();
  else closeBuildingModal();
});

const params = new URLSearchParams(window.location.search);
const requestedMode = params.get("mode");
selectMode(gameState.modeConfig[requestedMode] ? requestedMode : "normal");
startGame();

if (animationsEnabled()) {
  document.body.classList.add("game-boot");

  setTimeout(() => {
    document.body.classList.remove("game-boot");
  }, 1200);
}

openRulesModal(true);
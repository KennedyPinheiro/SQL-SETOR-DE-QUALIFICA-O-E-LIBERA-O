/* ========================================
   SISTEMA SQL — S.Q.L.
======================================== */


/* ========================================
   MENSAGENS SQL
======================================== */

function showSqlMessage(message, type = "error") {
  const resultArea = document.getElementById("sql-result-area");
  const status = document.getElementById("result-status");

  if (!resultArea) return;

  resultArea.innerHTML = "";

  const messageElement = document.createElement("div");

  messageElement.className = `sql-message ${type}`;
  messageElement.textContent = message;

  resultArea.appendChild(messageElement);

  if (status) {
    status.textContent = type === "error" ? "ERRO" : "AVISO";
  }
}


/* ========================================
   CONSULTA RELACIONADA AO SOLICITANTE
======================================== */

function getVisitorQueryProgressKey(query) {
  const visitor = gameState.currentVisitor;

  if (!visitor) return null;

  const allowedTables = new Set([
    "militares",
    "lista_hoje",
    "logs_portao",
    "autorizacoes",
    "movimentacoes"
  ]);
  const tables = [...new Set(
    Array.from(query.matchAll(/\b(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)\b/gi), match =>
      match[1].toLowerCase()
    ).filter(table => allowedTables.has(table))
  )].sort();

  if (!tables.length) return null;

  const whereClause = query.match(
    /\bWHERE\b([\s\S]*?)(?:\bGROUP\s+BY\b|\bORDER\s+BY\b|\bLIMIT\b|;|$)/i
  )?.[1];

  if (!whereClause || /\bOR\b|\bNOT\b|\bUNION\b/i.test(whereClause)) return null;

  const targetFields = [
    ...(!gameState.visitorForgotDocument
      ? [
          { field: "id_doc", value: visitor.id_doc },
          { field: "nome", value: visitor.nome }
        ]
      : []),
    { field: "alojamento", value: visitor.alojamento }
  ].filter(target => target.value !== null && target.value !== undefined);

  const hasTargetFilter = targetFields.some(({ field, value }) => {
    const escapedValue = String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const fieldExpression = `(?:\\b[a-z_][a-z0-9_]*\\.)?\\b${field}\\b`;
    const literalExpression = `(?:'${escapedValue}'|"${escapedValue}")`;

    return new RegExp(
      `${fieldExpression}\\s*=\\s*${literalExpression}|${literalExpression}\\s*=\\s*${fieldExpression}`,
      "i"
    ).test(whereClause);
  });

  if (!hasTargetFilter) return null;

  // A combinação de tabelas define uma fonte de investigação já consultada.
  // Trocar projeção, caixa ou espaços não cria progresso adicional.
  return tables.join("+");
}


/* ========================================
   EXECUÇÃO DE CONSULTAS
======================================== */

function runPlayerQuery() {
  if (gameState.gameOver || gameState.decisionLocked) return;

  if (gameState.activeEvent === "system_failure") {
    showSqlMessage(
      "SISTEMA FORA DO AR: consultas temporariamente indisponíveis.",
      "error"
    );

    return;
  }

  if (gameState.queriesRemaining <= 0) {
    showSqlMessage(
      "Limite de consultas atingido. Tome uma decisão.",
      "error"
    );

    return;
  }

  const input = document.getElementById("sql-input");
  const resultArea = document.getElementById("sql-result-area");
  const status = document.getElementById("result-status");

  if (!input || !resultArea) return;

  const query = input.value.trim();

  if (!query) {
    showSqlMessage("Digite uma consulta SQL.", "error");
    return;
  }


  /* ========================================
     ANIMAÇÃO DO TERMINAL
  ======================================== */

  animateElement(
    document.querySelector(".terminal-card"),
    "is-ready",
    550
  );


  /* ========================================
     LIMPEZA DA CONSULTA
  ======================================== */

  const normalized = query
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();

  if (!normalized) {
    showSqlMessage("Digite uma consulta SQL válida.", "error");
    return;
  }


  /* ========================================
     VALIDAÇÃO SQL
  ======================================== */

  const hasInvalidSyntax =
    !/^SELECT\b/i.test(normalized) ||
    /;[\s\S]*\S/.test(normalized.replace(/;\s*$/, ""));

  if (hasInvalidSyntax) {
    showSqlMessage(
      "Apenas consultas SELECT são permitidas. Execute uma consulta por vez.",
      "error"
    );

    return;
  }

  const tableRegex = /\b(militares|lista_hoje|logs_portao|autorizacoes|movimentacoes)\b/i;

  if (!tableRegex.test(normalized)) {
    showSqlMessage(
      "A consulta precisa acessar uma tabela válida do sistema.",
      "error"
    );

    return;
  }


  /* ========================================
     EXECUÇÃO SQL
  ======================================== */

  let result;

  try {
    result = alasql(normalized);
  } catch (error) {
    showSqlMessage(
      `Erro SQL: ${error.message}`,
      "error"
    );

    return;
  }
  /* ========================================
     CONSUMO DE CONSULTAS
  ======================================== */

  gameState.queriesRemaining--;


  /* ========================================
     IDENTIFICAÇÃO DE CONSULTAS VÁLIDAS
  ======================================== */

  const hasResults =
    Array.isArray(result) &&
    result.length > 0;

  /* ========================================
     CONTROLE DE CONSULTAS REPETIDAS
  ======================================== */

  const progressKey = getVisitorQueryProgressKey(normalized);
  const isRepeatedInvestigation =
    progressKey !== null && gameState.usedQueries.has(progressKey);
  let progressStatus = "CONSULTA EXECUTADA • SEM PROGRESSO";

  if (progressKey && !isRepeatedInvestigation) {
    gameState.successfulQueries++;
    gameState.usedQueries.add(progressKey);
    progressStatus = "INVESTIGAÇÃO DIRECIONADA • PROGRESSO REGISTRADO";
  } else if (isRepeatedInvestigation) {
    progressStatus = "FONTE JÁ INVESTIGADA • SEM PROGRESSO ADICIONAL";
  }
  /* ========================================
     ANÁLISE DE EVIDÊNCIAS
  ======================================== */

  /* Resultados vazios também podem revelar divergências, como um documento
     apresentado que não existe no cadastro militar. */
  analyzeQueryEvidence(normalized, result);

  /* ========================================
     ATUALIZA HUD E PROGRESSO
  ======================================== */

  updateQueriesHUD();
  updateSqlProgress();


  /* ========================================
     CRONÔMETRO DE DECISÃO
  ======================================== */

  if (gameState.queriesRemaining <= 0) {
    startDecisionTimer();
  }


  /* ========================================
     STATUS DA CONSULTA
  ======================================== */

  if (status) {
    status.textContent = progressStatus;
  }


  /* ========================================
     RESULTADOS
  ======================================== */

  resultArea.innerHTML = "";

  if (!hasResults) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "empty-result";

    emptyMessage.textContent =
      "Consulta executada, mas nenhum registro foi encontrado.";

    resultArea.appendChild(emptyMessage);

    return;
  }


  /* ========================================
     CONSTRUÇÃO DA TABELA
  ======================================== */

  const columns = Object.keys(result[0]);

  const wrapper = document.createElement("div");
  wrapper.className = "sql-result-table-wrapper";

  const table = document.createElement("table");
  table.className = "sql-result-table";


  /* Cabeçalho */

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  columns.forEach(column => {
    const th = document.createElement("th");

    th.textContent = column;

    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);


  /* Corpo */

  const tbody = document.createElement("tbody");

  result.forEach(row => {
    const tr = document.createElement("tr");

    columns.forEach(column => {
      const td = document.createElement("td");

      const value = row[column];

      td.textContent =
        value === null || value === undefined
          ? ""
          : String(value);

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  wrapper.appendChild(table);
  resultArea.appendChild(wrapper);


  /* ========================================
     ANIMAÇÃO DOS RESULTADOS
  ======================================== */

  animateElement(
    resultArea,
    "is-updating",
    450
  );
}


/* ========================================
   TEMPLATES SQL
======================================== */

function insertTemplate(type) {
  const input = document.getElementById("sql-input");

  if (!input) return;

  const visitor = gameState.currentVisitor;
  if (!visitor) return;

  const visitorId = gameState.visitorForgotDocument
    ? ""
    : String(visitor.id_doc || "").replace(/'/g, "''");
  const visitorApartment = String(visitor.alojamento || "").replace(/'/g, "''");
  const visitorFilter = alias => visitorId
    ? `${alias}.id_doc = '${visitorId}'`
    : `${alias}.alojamento = '${visitorApartment}'`;

  const templates = {

    militares: `-- Consultar o cadastro correspondente ao solicitante
SELECT m.* FROM militares m
WHERE ${visitorFilter("m")};`,

    join: `-- Relacionar os registros correspondentes ao solicitante
SELECT m.nome, m.alojamento, l.autorizado, p.status_atual
FROM militares m
JOIN lista_hoje l ON m.id_doc = l.id_doc
JOIN logs_portao p ON m.id_doc = p.id_doc
WHERE ${visitorFilter("m")};`,

    logs: `-- Consultar o registro do solicitante no portão
SELECT p.id_doc, p.status_atual
FROM logs_portao p
JOIN militares m ON m.id_doc = p.id_doc
WHERE ${visitorFilter("m")};`,

    lista: `-- Consultar a autorização do solicitante na lista de hoje
SELECT l.id_doc, l.autorizado
FROM lista_hoje l
JOIN militares m ON m.id_doc = l.id_doc
WHERE ${visitorFilter("m")};`,

    autorizacao: `-- Consultar a autorização registrada para o solicitante
SELECT a.id_doc, a.responsavel, a.horario, a.setor, a.motivo
FROM autorizacoes a
JOIN militares m ON m.id_doc = a.id_doc
WHERE ${visitorFilter("m")};`,

    movimentacoes: `-- Consultar movimentações do militar
SELECT p.id_doc, p.local, p.horario, p.atividade
FROM movimentacoes p
JOIN militares m ON m.id_doc = p.id_doc
WHERE ${visitorFilter("m")};`,

    cruzamento: `-- Cruzar autorização com a movimentação do responsável
SELECT a.id_doc AS visitante, a.responsavel,
       a.horario AS horario_autorizacao, a.setor,
       m.id_doc AS militar_movimentacao,
       m.horario AS horario_movimentacao, m.local, m.atividade
FROM autorizacoes a
JOIN movimentacoes m
  ON m.id_doc = a.responsavel
 AND m.horario = a.horario
JOIN militares s ON s.id_doc = a.id_doc
WHERE ${visitorFilter("s")};`

  };

  if (!templates[type]) return;

  input.value = templates[type];

  input.focus();
}

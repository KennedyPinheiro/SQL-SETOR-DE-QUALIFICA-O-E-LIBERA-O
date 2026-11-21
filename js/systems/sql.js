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

  const normalizedQuery = normalized
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  const hasResults =
    Array.isArray(result) &&
    result.length > 0;

  /* ========================================
     CONTROLE DE CONSULTAS REPETIDAS
  ======================================== */

  const isRepeatedQuery =
    gameState.usedQueries.has(normalizedQuery);

  const isNewValidQuery =
    hasResults && !isRepeatedQuery;

  /* Registra consulta válida inédita */

  if (isNewValidQuery) {
    gameState.successfulQueries++;
    gameState.usedQueries.add(normalizedQuery);
  }

  /* Informa quando uma consulta foi repetida */

  if (isRepeatedQuery) {
    showSqlMessage(
      "CONSULTA REPETIDA: você já executou essa pesquisa. Nenhum progresso adicional foi contabilizado.",
      "notice"
    );
  }
  /* ========================================
     ANÁLISE DE EVIDÊNCIAS
  ======================================== */

  /* Somente consultas com resultados são analisadas */

  if (hasResults) {
    analyzeQueryEvidence(normalized, result);
  }

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
    status.textContent = "CONSULTA CONCLUÍDA";
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

  const templates = {

    militares: `-- Listar militares cadastrados
SELECT * FROM militares;`,

    join: `-- Relacionar militares, autorizações e registros
SELECT m.nome, m.alojamento, l.autorizado, p.status_atual
FROM militares m
JOIN lista_hoje l ON m.id_doc = l.id_doc
JOIN logs_portao p ON m.id_doc = p.id_doc;`,

    logs: `-- Consultar todos os registros do portão
SELECT * FROM logs_portao;`,

    autorizacao: `-- Encontrar militares sem autorização
SELECT m.nome, m.alojamento, l.autorizado
FROM militares m
JOIN lista_hoje l ON m.id_doc = l.id_doc
WHERE l.autorizado = 'Nao';`

  };

  if (!templates[type]) return;

  input.value = templates[type];

  input.focus();
}
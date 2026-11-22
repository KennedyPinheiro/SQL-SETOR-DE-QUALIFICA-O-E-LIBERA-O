const practiceSchemas = {
  pessoal: {
    columns: ["matricula", "nome", "patente", "setor", "alojamento", "situacao"],
    description: "Equipe e lotação"
  },
  equipamentos: {
    columns: ["id_equipamento", "nome", "tipo", "setor", "condicao"],
    description: "Equipamentos do quartel"
  },
  ordens_servico: {
    columns: ["id_ordem", "matricula", "id_equipamento", "abertura", "prioridade", "status"],
    description: "Manutenção e responsáveis"
  },
  suprimentos: {
    columns: ["id_item", "item", "categoria", "quantidade", "estoque_minimo", "setor"],
    description: "Estoque e níveis mínimos"
  },
  movimentacoes_suprimentos: {
    columns: ["id_movimentacao", "id_item", "matricula", "tipo", "quantidade", "data"],
    description: "Entradas e retiradas"
  }
};

const practiceSeedData = {
  pessoal: [
    ["P-001", "Helena Duarte", "Capitã", "Logística", "201", "Ativo"],
    ["P-002", "Caio Mendes", "Sargento", "Manutenção", "302", "Ativo"],
    ["P-003", "Joana Reis", "Tenente", "Suprimentos", "203", "Ativo"],
    ["P-004", "Ícaro Lima", "Cabo", "Manutenção", "105", "Ativo"],
    ["P-005", "Luiza Freitas", "Major", "Comando", "401", "Ativo"],
    ["P-006", "Diego Costa", "Soldado", "Logística", "104", "Ativo"],
    ["P-007", "Samira Nunes", "Sargento", "Saúde", "303", "Ativo"],
    ["P-008", "Bruno Alves", "Cabo", "Suprimentos", "202", "Afastado"]
  ],
  equipamentos: [
    ["EQ-101", "Caminhão leve", "Transporte", "Logística", "Operacional"],
    ["EQ-102", "Gerador móvel", "Energia", "Manutenção", "Em reparo"],
    ["EQ-103", "Rádio portátil", "Comunicação", "Comando", "Operacional"],
    ["EQ-104", "Ambulância", "Transporte", "Saúde", "Operacional"],
    ["EQ-105", "Empilhadeira", "Carga", "Suprimentos", "Inspeção"],
    ["EQ-106", "Bomba d'água", "Infraestrutura", "Manutenção", "Operacional"],
    ["EQ-107", "Refrigerador médico", "Saúde", "Saúde", "Em reparo"]
  ],
  ordens_servico: [
    ["OS-2401", "P-002", "EQ-102", "2026-10-03", "Alta", "Aberta"],
    ["OS-2402", "P-004", "EQ-105", "2026-10-04", "Média", "Em análise"],
    ["OS-2403", "P-002", "EQ-107", "2026-10-05", "Alta", "Aberta"],
    ["OS-2404", "P-006", "EQ-101", "2026-10-06", "Baixa", "Concluída"],
    ["OS-2405", "P-004", "EQ-106", "2026-10-07", "Média", "Concluída"],
    ["OS-2406", "P-002", "EQ-103", "2026-10-08", "Baixa", "Aberta"],
    ["OS-2407", "P-007", "EQ-104", "2026-10-09", "Alta", "Concluída"],
    ["OS-2408", "P-003", "EQ-105", "2026-10-10", "Média", "Aberta"]
  ],
  suprimentos: [
    ["SUP-01", "Kit de primeiros socorros", "Saúde", 12, 8, "Enfermaria"],
    ["SUP-02", "Filtro de combustível", "Veículos", 4, 6, "Garagem"],
    ["SUP-03", "Bateria de rádio", "Comunicação", 18, 10, "Depósito A"],
    ["SUP-04", "Luva de proteção", "Segurança", 7, 12, "Depósito B"],
    ["SUP-05", "Lâmpada de sinalização", "Infraestrutura", 15, 8, "Depósito B"],
    ["SUP-06", "Óleo lubrificante", "Manutenção", 9, 10, "Garagem"],
    ["SUP-07", "Máscara descartável", "Saúde", 40, 20, "Enfermaria"],
    ["SUP-08", "Cabo de aço", "Manutenção", 3, 5, "Depósito A"]
  ],
  movimentacoes_suprimentos: [
    ["MOV-501", "SUP-01", "P-007", "Saída", 4, "2026-10-11"],
    ["MOV-502", "SUP-02", "P-006", "Saída", 2, "2026-10-11"],
    ["MOV-503", "SUP-03", "P-003", "Entrada", 10, "2026-10-12"],
    ["MOV-504", "SUP-04", "P-008", "Saída", 5, "2026-10-12"],
    ["MOV-505", "SUP-05", "P-001", "Entrada", 8, "2026-10-13"],
    ["MOV-506", "SUP-06", "P-002", "Saída", 3, "2026-10-13"],
    ["MOV-507", "SUP-07", "P-007", "Saída", 12, "2026-10-14"],
    ["MOV-508", "SUP-08", "P-003", "Saída", 4, "2026-10-14"],
    ["MOV-509", "SUP-02", "P-006", "Entrada", 6, "2026-10-15"],
    ["MOV-510", "SUP-01", "P-007", "Entrada", 6, "2026-10-15"],
    ["MOV-511", "SUP-04", "P-003", "Saída", 2, "2026-10-16"],
    ["MOV-512", "SUP-06", "P-002", "Entrada", 10, "2026-10-16"]
  ]
};

const practiceTemplates = {
  join: `SELECT p.nome, p.patente, os.id_ordem, e.nome AS equipamento, os.status
FROM pessoal p
JOIN ordens_servico os ON os.matricula = p.matricula
JOIN equipamentos e ON e.id_equipamento = os.id_equipamento
ORDER BY p.nome;`,
  group: `SELECT categoria, COUNT(*) AS quantidade
FROM suprimentos
GROUP BY categoria
ORDER BY quantidade DESC;`
};

let practiceQueryCount = 0;
const practiceHistoryStorageKey = "sql-game-practice-sql-history-v1";
const legacyPracticeHistoryStorageKey = "sql-game-practice-select-history-v1";
const practiceHistoryLimit = 50;
let practiceHistoryStorageAvailable = true;
let practiceHistory = loadPracticeHistory();
const practiceTableGroups = new Map();

function applyPracticeHoverSound(element) {
  if (element) element.dataset.hoverSound ||= "hover";
  return element;
}

function loadPracticeHistory() {
  try {
    const currentValue = localStorage.getItem(practiceHistoryStorageKey);
    const isLegacyHistory = currentValue === null;
    const stored = JSON.parse(currentValue ?? localStorage.getItem(legacyPracticeHistoryStorageKey) ?? "[]");
    const history = Array.isArray(stored)
      ? stored.filter(item => item && typeof item.query === "string" && typeof item.timestamp === "number").slice(0, practiceHistoryLimit)
      : [];
    if (isLegacyHistory && history.length) {
      localStorage.setItem(practiceHistoryStorageKey, JSON.stringify(history));
    }
    return history;
  } catch {
    practiceHistoryStorageAvailable = false;
    return [];
  }
}

function savePracticeHistory() {
  try {
    localStorage.setItem(practiceHistoryStorageKey, JSON.stringify(practiceHistory));
    practiceHistoryStorageAvailable = true;
  } catch {
    practiceHistoryStorageAvailable = false;
  }
}

function renderPracticeHistory() {
  const list = document.getElementById("practice-history-list");
  if (!list) return;
  const hint = document.getElementById("practice-history-hint");
  if (hint) {
    hint.textContent = practiceHistoryStorageAvailable
      ? "Todas as instruções SQL executadas ficam salvas neste navegador. Selecione uma para trazê-la de volta ao editor."
      : "O navegador bloqueou o localStorage; o histórico desta sessão não sobreviverá ao recarregamento.";
  }
  list.replaceChildren();

  if (!practiceHistory.length) {
    const empty = document.createElement("p");
    empty.className = "practice-empty";
    empty.textContent = "Nenhuma instrução salva ainda.";
    list.appendChild(empty);
    return;
  }

  practiceHistory.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "practice-history-item";
    applyPracticeHoverSound(button);
    button.setAttribute("aria-label", `Carregar instrução SQL executada em ${new Date(item.timestamp).toLocaleString("pt-BR")}`);
    const time = document.createElement("time");
    time.dateTime = new Date(item.timestamp).toISOString();
    time.textContent = new Date(item.timestamp).toLocaleString("pt-BR");
    const query = document.createElement("code");
    query.textContent = item.query;
    button.append(time, query);
    button.addEventListener("click", () => {
      const editor = document.getElementById("practice-query");
      editor.value = item.query;
      editor.focus();
      document.getElementById("practice-result-status").textContent = "SQL DO HISTÓRICO";
      document.getElementById("practice-result-meta").textContent = "Instrução carregada no editor; execute para rodá-la novamente.";
    });
    list.appendChild(button);
  });
}

function addPracticeHistory(query) {
  practiceHistory.unshift({ query, timestamp: Date.now() });
  practiceHistory = practiceHistory.slice(0, practiceHistoryLimit);
  savePracticeHistory();
  renderPracticeHistory();
}

function renderPracticeTables() {
  const container = document.getElementById("practice-tables");
  if (!container) return;

  container.replaceChildren();
  const tables = Object.entries(alasql.tables || {})
    .filter(([name, info]) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) && Array.isArray(info?.data))
    .map(([name, info]) => {
      const schema = practiceSchemas[name];
      const storedColumns = Array.isArray(info.columns) ? info.columns : [];
      const columns = schema?.columns || storedColumns
        .map(column => typeof column === "string" ? column : column.columnid || column.name)
        .filter(Boolean);
      const rowColumns = info.data[0] ? Object.keys(info.data[0]) : [];
      return {
        name,
        description: schema?.description || "Tabela criada nesta sessão",
        columns: columns.length ? columns : rowColumns,
        rows: info.data.length
      };
    });

  const databases = new Map();
  tables.forEach(table => {
    const databaseName = practiceTableGroups.get(table.name)
      || (practiceSchemas[table.name] ? "Banco de Logística" : "Banco da Sessão SQL");
    if (!databases.has(databaseName)) databases.set(databaseName, []);
    databases.get(databaseName).push(table);
  });

  [...databases.entries()].sort(([nameA], [nameB]) => {
    if (nameA === "Banco de Logística") return -1;
    if (nameB === "Banco de Logística") return 1;
    return nameA.localeCompare(nameB, "pt-BR");
  }).forEach(([databaseName, databaseTables]) => {
    const database = document.createElement("details");
    database.className = "practice-database-accordion";
    database.open = true;
    const databaseSummary = document.createElement("summary");
    databaseSummary.dataset.sound = "select";
    applyPracticeHoverSound(databaseSummary);
    const databaseTitle = document.createElement("strong");
    databaseTitle.textContent = databaseName;
    const databaseCount = document.createElement("span");
    databaseCount.textContent = `${databaseTables.length} TABELAS`;
    databaseSummary.append(databaseTitle, databaseCount);
    database.appendChild(databaseSummary);

    const tableList = document.createElement("div");
    tableList.className = "practice-database-tables";
    databaseTables.forEach(({ name, description, columns, rows }) => {
      const tableDetails = document.createElement("details");
      tableDetails.className = "practice-table-accordion";
      const tableSummary = document.createElement("summary");
      tableSummary.dataset.sound = "select";
      applyPracticeHoverSound(tableSummary);
      const tableTitle = document.createElement("strong");
      tableTitle.textContent = name;
      const tableCount = document.createElement("span");
      tableCount.textContent = `${rows} REG.`;
      tableSummary.append(tableTitle, tableCount);
      tableDetails.appendChild(tableSummary);

      const tableContent = document.createElement("div");
      tableContent.className = "practice-table-content";
      const tableDescription = document.createElement("small");
      tableDescription.className = "practice-table-description";
      tableDescription.textContent = description;
      tableContent.appendChild(tableDescription);

      const queryButton = document.createElement("button");
      queryButton.type = "button";
      queryButton.className = "practice-table-query-button";
      applyPracticeHoverSound(queryButton);
      queryButton.textContent = "CONSULTAR TABELA";
      queryButton.addEventListener("click", () => {
        const input = document.getElementById("practice-query");
        input.value = `SELECT *\nFROM ${name}\nLIMIT 20;`;
        input.focus();
      });
      tableContent.appendChild(queryButton);

      const columnList = document.createElement("ul");
      columnList.className = "practice-column-list";
      columns.forEach(column => {
        const item = document.createElement("li");
        const columnButton = document.createElement("button");
        columnButton.type = "button";
        applyPracticeHoverSound(columnButton);
        columnButton.textContent = column;
        columnButton.title = `Consultar a coluna ${column}`;
        columnButton.addEventListener("click", () => {
          const input = document.getElementById("practice-query");
          input.value = `SELECT ${column}\nFROM ${name}\nLIMIT 20;`;
          input.focus();
        });
        item.appendChild(columnButton);
        columnList.appendChild(item);
      });
      tableContent.appendChild(columnList);
      tableDetails.appendChild(tableContent);
      tableList.appendChild(tableDetails);
    });

    database.appendChild(tableList);
    container.appendChild(database);
  });

  const countLabel = `${tables.length} TABELAS`;
  document.getElementById("practice-table-count").textContent = countLabel;
  document.getElementById("practice-live-table-count").textContent = countLabel;
}

function setupPracticeDatabase() {
  Object.entries(alasql.tables || {}).forEach(([table, info]) => {
    if (Array.isArray(info?.data)) {
      const safeName = table.replace(/]/g, "]]");
      alasql(`DROP TABLE IF EXISTS [${safeName}]`);
    }
  });

  alasql("CREATE TABLE pessoal (matricula STRING, nome STRING, patente STRING, setor STRING, alojamento STRING, situacao STRING)");
  alasql("CREATE TABLE equipamentos (id_equipamento STRING, nome STRING, tipo STRING, setor STRING, condicao STRING)");
  alasql("CREATE TABLE ordens_servico (id_ordem STRING, matricula STRING, id_equipamento STRING, abertura STRING, prioridade STRING, status STRING)");
  alasql("CREATE TABLE suprimentos (id_item STRING, item STRING, categoria STRING, quantidade INT, estoque_minimo INT, setor STRING)");
  alasql("CREATE TABLE movimentacoes_suprimentos (id_movimentacao STRING, id_item STRING, matricula STRING, tipo STRING, quantidade INT, data STRING)");

  Object.entries(practiceSeedData).forEach(([table, rows]) => {
    const placeholders = rows[0].map(() => "?").join(", ");
    rows.forEach(row => {
      alasql(`INSERT INTO ${table} VALUES (${placeholders})`, row);
    });
  });
  practiceTableGroups.clear();
  Object.keys(practiceSchemas).forEach(table => practiceTableGroups.set(table, "Banco de Logística"));
}

function setPracticeMessage(message, status = "AVISO", isError = false) {
  const results = document.getElementById("practice-results");
  const resultStatus = document.getElementById("practice-result-status");
  const resultMeta = document.getElementById("practice-result-meta");

  results.replaceChildren();
  const text = document.createElement("p");
  text.className = isError ? "practice-error" : "practice-empty";
  text.textContent = message;
  results.appendChild(text);
  resultStatus.textContent = status;
  resultMeta.textContent = `${practiceQueryCount} consultas executadas nesta sessão`;
}

function renderPracticeResults(rows) {
  const results = document.getElementById("practice-results");
  results.replaceChildren();

  if (!Array.isArray(rows) || rows.length === 0) {
    const empty = document.createElement("p");
    empty.className = "practice-empty";
    empty.textContent = "Consulta executada. Nenhum registro encontrado.";
    results.appendChild(empty);
    return;
  }

  const columns = Object.keys(rows[0]);
  const table = document.createElement("table");
  table.className = "practice-result-table";
  const thead = document.createElement("thead");
  const header = document.createElement("tr");

  columns.forEach(column => {
    const cell = document.createElement("th");
    cell.textContent = column;
    header.appendChild(cell);
  });
  thead.appendChild(header);

  const tbody = document.createElement("tbody");
  rows.forEach(row => {
    const tr = document.createElement("tr");
    columns.forEach(column => {
      const td = document.createElement("td");
      td.textContent = row[column] === null || row[column] === undefined
        ? ""
        : String(row[column]);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.append(thead, tbody);
  results.appendChild(table);
}

function splitSqlStatements(script) {
  const statements = [];
  let current = "";
  let quote = null;
  let lineComment = false;
  let blockComment = false;

  for (let i = 0; i < script.length; i++) {
    const char = script[i];
    const next = script[i + 1];

    if (lineComment) {
      if (char === "\n") {
        lineComment = false;
        current += "\n";
      }
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        i++;
        current += " ";
      }
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote) {
        if (next === quote) {
          current += next;
          i++;
        } else {
          quote = null;
        }
      } else if (char === "\\" && next) {
        current += next;
        i++;
      }
      continue;
    }
    if (char === "-" && next === "-") {
      lineComment = true;
      i++;
      current += " ";
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      i++;
      current += " ";
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      current += char;
      continue;
    }
    if (char === ";") {
      if (current.trim()) statements.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) statements.push(current.trim());
  return statements;
}

function runPracticeQuery() {
  showPracticeResults();
  const input = document.getElementById("practice-query");
  const status = document.getElementById("practice-result-status");
  const resultMeta = document.getElementById("practice-result-meta");
  const statements = splitSqlStatements(input.value);

  if (!statements.length) {
    setPracticeMessage("Digite uma instrução SQL para começar.");
    return;
  }

  let lastTabularResult = null;
  for (let i = 0; i < statements.length; i++) {
    try {
      const result = alasql(statements[i]);
      if (Array.isArray(result) && result.every(row => row && typeof row === "object" && !Array.isArray(row))) {
        lastTabularResult = result;
      }
      addPracticeHistory(statements[i]);
    } catch (error) {
      practiceQueryCount++;
      renderPracticeTables();
      setPracticeMessage(`Erro na instrução ${i + 1} de ${statements.length}: ${error.message}`, "ERRO SQL", true);
      resultMeta.textContent = `${i} de ${statements.length} instruções concluídas antes do erro · ${practiceQueryCount} execuções nesta sessão`;
      return;
    }
  }

  practiceQueryCount++;
  renderPracticeTables();
  if (lastTabularResult) {
    renderPracticeResults(lastTabularResult);
  } else {
    setPracticeMessage("Instruções executadas. Nenhuma delas retornou uma tabela de resultados.", "SCRIPT CONCLUÍDO");
  }
  status.textContent = statements.length > 1 ? "SCRIPT CONCLUÍDO" : "CONSULTA CONCLUÍDA";
  const rowCount = lastTabularResult?.length ?? 0;
  resultMeta.textContent = `${statements.length} instrução(ões) executada(s) · ${rowCount} registros na última saída · ${practiceQueryCount} execuções nesta sessão`;
}

setupPracticeDatabase();
renderPracticeTables();
renderPracticeHistory();

document.getElementById("practice-history-clear")?.addEventListener("click", () => {
  practiceHistory = [];
  savePracticeHistory();
  renderPracticeHistory();
});

document.getElementById("practice-run")?.addEventListener("click", runPracticeQuery);
document.getElementById("practice-query")?.addEventListener("keydown", event => {
  if (event.ctrlKey && event.key === "Enter") {
    event.preventDefault();
    runPracticeQuery();
  }
});

const practiceMain = document.querySelector(".practice-main");
const practiceResizeHandle = document.getElementById("practice-resize-handle");
const practiceResultsToggle = document.getElementById("practice-results-toggle");
const practiceMenuTrigger = document.getElementById("practice-menu-trigger");
const practiceMenuModal = document.getElementById("practice-menu-modal");
const practiceHelpModal = document.getElementById("practice-help-modal");

function openPracticeMenu() {
  if (!practiceMenuModal) return;
  practiceMenuModal.classList.add("open");
  practiceMenuModal.setAttribute("aria-hidden", "false");
  practiceMenuModal.querySelector("[data-practice-menu-close]")?.focus();
}

function closePracticeMenu(restoreFocus = true) {
  if (!practiceMenuModal) return;
  practiceMenuModal.classList.remove("open");
  practiceMenuModal.setAttribute("aria-hidden", "true");
  if (restoreFocus) practiceMenuTrigger?.focus();
}

function openPracticeHelp() {
  closePracticeMenu(false);
  if (!practiceHelpModal) return;
  practiceHelpModal.classList.add("open");
  practiceHelpModal.setAttribute("aria-hidden", "false");
  practiceHelpModal.querySelector("[data-practice-help-close]")?.focus();
}

function closePracticeHelp() {
  if (!practiceHelpModal) return;
  practiceHelpModal.classList.remove("open");
  practiceHelpModal.setAttribute("aria-hidden", "true");
  practiceMenuTrigger?.focus();
}

practiceMenuTrigger?.addEventListener("click", openPracticeMenu);
practiceMenuModal?.addEventListener("click", event => {
  if (event.target === practiceMenuModal || event.target.closest("[data-practice-menu-close]")) {
    closePracticeMenu();
  }
});
document.getElementById("practice-menu-return")?.addEventListener("click", () => closePracticeMenu());
practiceHelpModal?.addEventListener("click", event => {
  if (event.target === practiceHelpModal || event.target.closest("[data-practice-help-close]")) {
    closePracticeHelp();
  }
});
document.getElementById("practice-open-settings")?.addEventListener("click", () => {
  closePracticeMenu(false);
  practiceMenuTrigger?.focus();
  window.openSettingsModal?.();
});
document.getElementById("practice-open-help")?.addEventListener("click", openPracticeHelp);
document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (practiceHelpModal?.classList.contains("open")) closePracticeHelp();
  else if (practiceMenuModal?.classList.contains("open")) closePracticeMenu();
});

practiceResultsToggle?.addEventListener("click", () => {
  const isCollapsed = practiceMain.classList.toggle("results-collapsed");
  practiceResultsToggle.setAttribute("aria-expanded", String(!isCollapsed));
  practiceResultsToggle.textContent = isCollapsed ? "MOSTRAR RESULTADOS" : "OCULTAR RESULTADOS";
  practiceResultsToggle.title = isCollapsed
    ? "Reabrir o painel de resultados"
    : "Ocultar o painel de resultados";
});

function showPracticeResults() {
  if (!practiceMain?.classList.contains("results-collapsed")) return;
  practiceMain.classList.remove("results-collapsed");
  practiceResultsToggle?.setAttribute("aria-expanded", "true");
  if (practiceResultsToggle) {
    practiceResultsToggle.textContent = "OCULTAR RESULTADOS";
    practiceResultsToggle.title = "Ocultar o painel de resultados";
  }
}

function setPracticeEditorHeight(height) {
  if (!practiceMain || !practiceResizeHandle) return;
  const minEditorHeight = practiceMain.clientWidth <= 760 ? 320 : 280;
  const minResultsHeight = practiceMain.clientWidth <= 760 ? 300 : 260;
  const mainStyles = getComputedStyle(practiceMain);
  const verticalPadding = Number.parseFloat(mainStyles.paddingTop) + Number.parseFloat(mainStyles.paddingBottom);
  const availableHeight = practiceMain.clientHeight - verticalPadding;
  const maxEditorHeight = Math.max(minEditorHeight, availableHeight - 12 - minResultsHeight);
  const editorHeight = Math.max(minEditorHeight, Math.min(height, maxEditorHeight));
  practiceMain.style.setProperty("--practice-editor-height", `${editorHeight}px`);
  practiceResizeHandle.setAttribute("aria-valuemin", String(minEditorHeight));
  practiceResizeHandle.setAttribute("aria-valuemax", String(maxEditorHeight));
  practiceResizeHandle.setAttribute("aria-valuenow", String(Math.round(editorHeight)));
}

setPracticeEditorHeight(360);

practiceResizeHandle?.addEventListener("pointerdown", event => {
  if (!practiceMain) return;
  event.preventDefault();
  practiceResizeHandle.setPointerCapture(event.pointerId);
  document.body.classList.add("is-resizing");
  setPracticeEditorHeight(event.clientY - practiceMain.getBoundingClientRect().top);
});

practiceResizeHandle?.addEventListener("pointermove", event => {
  if (practiceResizeHandle.hasPointerCapture(event.pointerId) && practiceMain) {
    setPracticeEditorHeight(event.clientY - practiceMain.getBoundingClientRect().top);
  }
});

function stopPracticeResize(event) {
  if (practiceResizeHandle?.hasPointerCapture(event.pointerId)) {
    practiceResizeHandle.releasePointerCapture(event.pointerId);
  }
  document.body.classList.remove("is-resizing");
}

practiceResizeHandle?.addEventListener("pointerup", stopPracticeResize);
practiceResizeHandle?.addEventListener("pointercancel", stopPracticeResize);
practiceResizeHandle?.addEventListener("keydown", event => {
  if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key) || !practiceMain) return;
  event.preventDefault();
  const currentHeight = Number.parseFloat(getComputedStyle(practiceMain).gridTemplateRows.split(" ")[0]) || 360;
  if (event.key === "Home") setPracticeEditorHeight(280);
  else if (event.key === "End") setPracticeEditorHeight(practiceMain.clientHeight);
  else setPracticeEditorHeight(currentHeight + (event.key === "ArrowUp" ? -24 : 24));
});

document.querySelectorAll("[data-practice-template]").forEach(button => {
  button.addEventListener("click", () => {
    const type = button.dataset.practiceTemplate;
    const input = document.getElementById("practice-query");
    if (type === "clear") {
      input.value = "";
    } else if (type === "reset-db") {
      setupPracticeDatabase();
      renderPracticeTables();
      setPracticeMessage("Banco restaurado com as cinco tabelas e dados originais do treino.", "BANCO RESTAURADO");
    } else {
      input.value = practiceTemplates[type] || "";
    }
    input.focus();
  });
});

document.getElementById("practice-import-button")?.addEventListener("click", () => {
  document.getElementById("practice-import-file")?.click();
});

document.getElementById("practice-import-file")?.addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  const input = document.getElementById("practice-query");
  try {
    input.value = await file.text();
    input.focus();
    document.getElementById("practice-result-status").textContent = "SCRIPT IMPORTADO";
    document.getElementById("practice-result-meta").textContent = `${file.name} carregado · revise e pressione EXECUTAR para rodar`;
  } catch (error) {
    setPracticeMessage(`Não foi possível ler o arquivo: ${error.message}`, "FALHA NA IMPORTAÇÃO", true);
  } finally {
    event.target.value = "";
  }
});

function parseDelimitedRows(text, delimiter) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"' && value === "") {
      quoted = true;
    } else if (char === delimiter) {
      row.push(value);
      value = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(value);
      if (row.some(cell => cell.trim() !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some(cell => cell.trim() !== "")) rows.push(row);
  return rows;
}

function detectDelimitedFile(text) {
  const candidates = [",", ";", "\t"];
  let quoted = false;
  const counts = Object.fromEntries(candidates.map(delimiter => [delimiter, 0]));
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') {
      if (quoted && text[i + 1] === '"') i++;
      else quoted = !quoted;
    } else if (!quoted && (text[i] === "\n" || text[i] === "\r")) {
      break;
    } else if (!quoted && candidates.includes(text[i])) {
      counts[text[i]]++;
    }
  }
  return candidates.reduce((best, candidate) => counts[candidate] > counts[best] ? candidate : best, candidates[0]);
}

function sanitizePracticeIdentifier(value, fallback) {
  const identifier = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return /^[a-z_]/.test(identifier) ? identifier : `${fallback}_${identifier || "campo"}`;
}

function uniquePracticeTableName(value) {
  const baseName = sanitizePracticeIdentifier(value.replace(/\.[^.]+$/, ""), "tabela").slice(0, 48) || "tabela_importada";
  let tableName = baseName;
  let suffix = 2;
  while (alasql.tables?.[tableName]) {
    tableName = `${baseName.slice(0, 43)}_${suffix++}`;
  }
  return tableName;
}

function importRowsAsPracticeTable(requestedName, headers, records, databaseName) {
  if (!Array.isArray(headers) || !headers.length) throw new Error("O arquivo não contém cabeçalhos de colunas.");
  if (!Array.isArray(records)) throw new Error("Os registros do arquivo não estão em uma lista válida.");

  const usedColumns = new Set();
  const columns = headers.map((header, index) => {
    const base = sanitizePracticeIdentifier(header, `coluna_${index + 1}`).slice(0, 48);
    let column = base || `coluna_${index + 1}`;
    let suffix = 2;
    while (usedColumns.has(column)) column = `${base.slice(0, 43)}_${suffix++}`;
    usedColumns.add(column);
    return column;
  });
  const tableName = uniquePracticeTableName(requestedName);
  const dataTypes = headers.map((_, columnIndex) => {
    const values = records.map(record => Array.isArray(record) ? record[columnIndex] : record?.[headers[columnIndex]])
      .filter(value => value !== null && value !== undefined && value !== "");
    if (values.length && values.every(value => typeof value === "number")) return "NUMBER";
    if (values.length && values.every(value => typeof value === "boolean")) return "BOOLEAN";
    return "STRING";
  });

  const quoteIdentifier = name => `[${name.replace(/]/g, "]]")}]`;
  const createColumns = columns.map((column, index) => `${quoteIdentifier(column)} ${dataTypes[index]}`).join(", ");
  alasql(`CREATE TABLE ${quoteIdentifier(tableName)} (${createColumns})`);
  try {
    const placeholders = columns.map(() => "?").join(", ");
    records.forEach(record => {
      const values = headers.map((header, index) => {
        const value = Array.isArray(record) ? record[index] : record?.[header];
        if (value === undefined || value === null) return null;
        return typeof value === "object" ? JSON.stringify(value) : value;
      });
      alasql(`INSERT INTO ${quoteIdentifier(tableName)} VALUES (${placeholders})`, values);
    });
  } catch (error) {
    alasql(`DROP TABLE IF EXISTS ${quoteIdentifier(tableName)}`);
    throw error;
  }

  practiceTableGroups.set(tableName, databaseName || "Banco importado");
  return { tableName, rows: records.length, columns };
}

function parseJsonImport(fileName, data, databaseName) {
  const tables = [];
  if (Array.isArray(data)) {
    if (!data.length || !data.every(record => record && typeof record === "object" && !Array.isArray(record))) {
      throw new Error("O JSON deve ser uma lista não vazia de objetos.");
    }
    const headers = [...new Set(data.flatMap(record => Object.keys(record)))];
    tables.push(importRowsAsPracticeTable(fileName, headers, data, databaseName));
    return tables;
  }

  if (data && typeof data === "object") {
    if (Array.isArray(data.data) && data.data.length && data.data.every(record => record && typeof record === "object" && !Array.isArray(record))) {
      const headers = [...new Set(data.data.flatMap(record => Object.keys(record)))];
      tables.push(importRowsAsPracticeTable(data.table || fileName, headers, data.data, databaseName));
      return tables;
    }
    const collections = Object.entries(data).filter(([, value]) => Array.isArray(value));
    if (collections.length) {
      collections.forEach(([name, records]) => {
        if (!records.length || !records.every(record => record && typeof record === "object" && !Array.isArray(record))) return;
        const headers = [...new Set(records.flatMap(record => Object.keys(record)))];
        tables.push(importRowsAsPracticeTable(name, headers, records, databaseName));
      });
      if (tables.length) return tables;
    }
    const headers = Object.keys(data);
    if (headers.length) {
      tables.push(importRowsAsPracticeTable(fileName, headers, [data], databaseName));
      return tables;
    }
  }
  throw new Error("Formato JSON não reconhecido. Use uma lista de objetos ou um objeto com listas de registros.");
}

async function importPracticeDataFile(file) {
  if (file.size > 10 * 1024 * 1024) throw new Error("O arquivo excede o limite de 10 MB.");
  const text = (await file.text()).replace(/^\uFEFF/, "");
  const extension = file.name.split(".").pop().toLowerCase();
  const databaseName = file.name.replace(/\.[^.]+$/, "") || "Banco importado";
  if (extension === "json") return parseJsonImport(file.name, JSON.parse(text), databaseName);
  if (!["csv", "tsv"].includes(extension)) throw new Error("Formato não suportado. Importe arquivos CSV, TSV ou JSON.");

  const delimiter = extension === "tsv" ? "\t" : detectDelimitedFile(text);
  const rows = parseDelimitedRows(text, delimiter);
  if (rows.length < 1) throw new Error("O arquivo está vazio.");
  const headers = rows[0].map((header, index) => header.trim() || `coluna_${index + 1}`);
  const records = rows.slice(1).map(row => headers.map((_, index) => row[index] ?? ""));
  return [importRowsAsPracticeTable(file.name, headers, records, databaseName)];
}

document.getElementById("practice-import-data-button")?.addEventListener("click", () => {
  document.getElementById("practice-import-data-file")?.click();
});

document.getElementById("practice-import-data-file")?.addEventListener("change", async event => {
  const files = [...(event.target.files || [])];
  if (!files.length) return;
  const imported = [];
  try {
    for (const file of files) imported.push(...await importPracticeDataFile(file));
    renderPracticeTables();
    const description = imported.map(table => `${table.tableName}: ${table.rows} registros`).join(" · ");
    document.getElementById("practice-result-status").textContent = "BANCO IMPORTADO";
    document.getElementById("practice-result-meta").textContent = description;
    document.getElementById("practice-results").replaceChildren();
    const message = document.createElement("p");
    message.className = "practice-empty";
    message.textContent = `Banco importado. Consulte as tabelas ${imported.map(table => table.tableName).join(", ")} no editor SQL.`;
    document.getElementById("practice-results").appendChild(message);
  } catch (error) {
    renderPracticeTables();
    setPracticeMessage(`Falha ao importar o banco: ${error.message}`, "ERRO NA IMPORTAÇÃO", true);
  } finally {
    event.target.value = "";
  }
});

document.getElementById("practice-export-button")?.addEventListener("click", () => {
  const content = document.getElementById("practice-query")?.value || "";
  if (!content.trim()) {
    setPracticeMessage("O editor está vazio. Escreva um script SQL antes de exportar.", "NADA PARA EXPORTAR");
    return;
  }
  const blob = new Blob([content], { type: "application/sql;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pratica-logistica.sql";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  document.getElementById("practice-result-status").textContent = "SCRIPT EXPORTADO";
  document.getElementById("practice-result-meta").textContent = "Editor salvo como pratica-logistica.sql";
});

document.querySelectorAll("button:not([data-hover-sound])").forEach(applyPracticeHoverSound);

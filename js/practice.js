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

function renderPracticeTables() {
  const container = document.getElementById("practice-tables");
  if (!container) return;

  container.replaceChildren();
  const tables = Object.entries(alasql.tables || {})
    .filter(([name, info]) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) && Array.isArray(info?.data))
    .map(([name, info]) => {
      const schema = practiceSchemas[name];
      const columns = schema?.columns || (info.columns || [])
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

  tables.forEach(({ name, description, columns, rows }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "practice-table-button";
    button.setAttribute("aria-label", `Consultar ${name}, ${rows} registros`);
    button.innerHTML = `<strong>${name}</strong><small>${description}<br>${columns.join(" · ") || "Sem colunas"}<br>${rows} REGISTROS</small>`;
    button.addEventListener("click", () => {
      const input = document.getElementById("practice-query");
      input.value = `SELECT *\nFROM ${name}\nLIMIT 20;`;
      input.focus();
    });
    container.appendChild(button);
  });

  const countLabel = `${tables.length} TABELAS`;
  document.getElementById("practice-table-count").textContent = countLabel;
  document.getElementById("practice-live-table-count").textContent = countLabel;
}

function setupPracticeDatabase() {
  Object.entries(alasql.tables || {}).forEach(([table, info]) => {
    if (Array.isArray(info?.data)) {
      const safeName = table.replace(/]/g, "]]" );
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
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      i++;
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

document.getElementById("practice-run")?.addEventListener("click", runPracticeQuery);
document.getElementById("practice-query")?.addEventListener("keydown", event => {
  if (event.ctrlKey && event.key === "Enter") {
    event.preventDefault();
    runPracticeQuery();
  }
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
  link.click();
  URL.revokeObjectURL(url);
  document.getElementById("practice-result-status").textContent = "SCRIPT EXPORTADO";
  document.getElementById("practice-result-meta").textContent = "Editor salvo como pratica-logistica.sql";
});

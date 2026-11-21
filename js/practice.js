const practiceSchemas = {
  militares: ["id_doc", "nome", "alojamento", "patente", "quepe", "oculos", "pele"],
  lista_hoje: ["id_doc", "autorizado"],
  logs_portao: ["id_doc", "status_atual"],
  autorizacoes: ["id_doc", "responsavel", "horario", "setor", "motivo"],
  movimentacoes: ["id_doc", "local", "horario", "atividade"]
};

const practiceTemplates = {
  join: `SELECT m.nome, m.patente, l.autorizado, p.status_atual
FROM militares m
JOIN lista_hoje l ON l.id_doc = m.id_doc
JOIN logs_portao p ON p.id_doc = m.id_doc
ORDER BY m.nome;`,
  group: `SELECT patente, COUNT(*) AS quantidade
FROM militares
GROUP BY patente
ORDER BY quantidade DESC;`
};

let practiceQueryCount = 0;

function renderPracticeTables() {
  const container = document.getElementById("practice-tables");
  if (!container) return;

  container.replaceChildren();
  Object.entries(practiceSchemas).forEach(([table, columns]) => {
    const rows = alasql(`SELECT COUNT(*) AS total FROM ${table}`)[0]?.total ?? 0;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "practice-table-button";
    button.innerHTML = `<strong>${table}</strong><small>${columns.join(" · ")}<br>${rows} REGISTROS</small>`;
    button.addEventListener("click", () => {
      const input = document.getElementById("practice-query");
      input.value = `SELECT *\nFROM ${table}\nLIMIT 20;`;
      input.focus();
    });
    container.appendChild(button);
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

function runPracticeQuery() {
  const input = document.getElementById("practice-query");
  const status = document.getElementById("practice-result-status");
  const resultMeta = document.getElementById("practice-result-meta");
  const normalized = input.value
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();

  if (!normalized) {
    setPracticeMessage("Digite uma consulta SELECT para começar.");
    return;
  }

  if (!/^SELECT\b/i.test(normalized) || /;[\s\S]*\S/.test(normalized.replace(/;\s*$/, ""))) {
    setPracticeMessage("O modo de prática aceita uma consulta SELECT por execução.", "CONSULTA NÃO EXECUTADA", true);
    return;
  }

  let rows;
  try {
    rows = alasql(normalized);
  } catch (error) {
    setPracticeMessage(`Erro SQL: ${error.message}`, "ERRO SQL", true);
    return;
  }

  practiceQueryCount++;
  renderPracticeResults(rows);
  status.textContent = "CONSULTA CONCLUÍDA";
  resultMeta.textContent = `${Array.isArray(rows) ? rows.length : 0} registros retornados · ${practiceQueryCount} consultas executadas`;
}

setupDatabase();
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
    } else {
      input.value = practiceTemplates[type] || "";
    }
    input.focus();
  });
});

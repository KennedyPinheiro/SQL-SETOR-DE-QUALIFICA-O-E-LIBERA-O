/* ========================================
   INTERFACE DO VISITANTE — S.Q.L.
======================================== */


/* ========================================
   RENDERIZAÇÃO DOS DADOS
======================================== */

function renderVisitorUI() {
  const v = gameState.currentVisitor;

  if (!v) return;

  const speechLines = [
    { text: "Boa tarde, sentinela. Preciso entrar no quartel, pode liberar?" },
    { text: "Soldado, esqueci meu documento. Posso confirmar meus dados para entrar?", withoutDocument: true },
    { text: "Estou sem minha identidade militar hoje. Pode consultar meu cadastro?", withoutDocument: true },
    { text: "Sirvo aqui há anos. Está tudo certo com meu cadastro?" },
    { text: "Está frio aqui fora. Podemos agilizar a entrada?" }
  ];
  const availableSpeechLines = gameState.visitorFlaws?.includes("forged_document")
    ? speechLines.filter(line => !line.withoutDocument)
    : speechLines;
  const declaration = availableSpeechLines[
    Math.floor(Math.random() * availableSpeechLines.length)
  ];
  gameState.visitorForgotDocument = declaration.withoutDocument === true;

  const identityCard = document.getElementById("identity-card");
  const missingDocument = document.getElementById("missing-document");
  if (identityCard) identityCard.hidden = gameState.visitorForgotDocument;
  if (missingDocument) missingDocument.hidden = !gameState.visitorForgotDocument;

  /* ========================================
     IDENTIFICAÇÃO DO VISITANTE
  ======================================== */

  const presentedId = document.getElementById("presented-id");

  if (presentedId) {
    presentedId.innerHTML = gameState.visitorForgotDocument ? "" : `
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

    sqlInput.placeholder = gameState.gameMode === "falha"
      ? "SQL bloqueado durante a falha do sistema."
      : "-- Investigue o cadastro deste solicitante.\n" +
        "-- Exemplo: SELECT * FROM militares;";
  }


  /* ========================================
     RETRATO
  ======================================== */

  renderPortrait(v);


  /* ========================================
     FALA DO VISITANTE
  ======================================== */

  const speech = document.getElementById("visitor-speech");

  if (speech) {
    speech.textContent = declaration.text;
  }


  /* ========================================
     DESTINO DO INTERFONE
  ======================================== */

  const destination =
    document.getElementById("intercom-destination");

  if (destination) {
    destination.textContent = `ALOJ. ${v.alojamento}`;
  }

  renderInterrogationUI();
}


/* ========================================
   PERGUNTAS AO SOLICITANTE
======================================== */

const visitorQuestionLabels = {
  document: "Documento",
  apartment: "Alojamento",
  appearance: "Aparência",
  authorization: "Autorização"
};

function renderInterrogationUI() {
  const asked = gameState.askedVisitorQuestions || new Set();
  const remaining = document.getElementById("questions-remaining");

  document.querySelectorAll("[data-question]").forEach(button => {
    button.disabled = asked.has(button.dataset.question) || gameState.decisionLocked || gameState.gameOver;
    button.classList.toggle("is-asked", asked.has(button.dataset.question));
  });

  if (remaining) {
    const count = Object.keys(visitorQuestionLabels).length - asked.size;
    remaining.textContent = `${count} ${count === 1 ? "PERGUNTA" : "PERGUNTAS"}`;
  }
}

function chooseVisitorLine(lines) {
  return lines[Math.floor(Math.random() * lines.length)];
}

function askVisitorQuestion(questionKey) {
  if (gameState.gameOver || gameState.decisionLocked || !gameState.currentVisitor) return;

  const asked = gameState.askedVisitorQuestions || new Set();
  if (asked.has(questionKey) || !visitorQuestionLabels[questionKey]) return;

  asked.add(questionKey);
  gameState.askedVisitorQuestions = asked;

  const visitor = gameState.currentVisitor;
  const real = gameState.realNeighbor || visitor;
  const declaration = document.getElementById("visitor-speech");
  const answerLines = [];

  if (questionKey === "document") {
    const mismatch = String(visitor.id_doc) !== String(real.id_doc);
    if (gameState.visitorForgotDocument) {
      answerLines.push(
        "“Como eu disse, estou sem o documento hoje. Posso passar meus dados para você consultar.”",
        "“Deixei a identidade no alojamento. Não consigo mostrar agora.”",
        "“Não trouxe o documento. Achei que meu nome no cadastro seria suficiente.”"
      );
    } else if (mismatch) {
      answerLines.push(
        `“Meu documento é ${visitor.id_doc}. Está tudo certo, pode conferir.”`,
        `“O número é ${visitor.id_doc}; acabei de apresentar para você.”`,
        `“Não sei por que está perguntando. Meu registro é ${visitor.id_doc}.”`
      );
    } else {
      answerLines.push(
        `“Meu documento é ${visitor.id_doc}. Está aqui comigo.”`,
        `“Claro, pode anotar: ${visitor.id_doc}.”`,
        `“É ${visitor.id_doc}. O mesmo número de sempre.”`
      );
    }
  }

  if (questionKey === "apartment") {
    const mismatch = String(visitor.alojamento) !== String(real.alojamento);
    if (mismatch) {
      answerLines.push(
        `“Meu alojamento é o ${visitor.alojamento}. Sempre foi esse.”`,
        `“Anote aí: ${visitor.alojamento}. Deve estar no sistema.”`,
        `“Eu moro no ${visitor.alojamento}; não entendi a dúvida.”`
      );
    } else {
      answerLines.push(
        `“Meu alojamento é o ${visitor.alojamento}.”`,
        `“${visitor.alojamento}. Pode confirmar no cadastro.”`,
        `“Moro no ${visitor.alojamento}, no mesmo lugar de sempre.”`
      );
    }
  }

  if (questionKey === "appearance") {
    const skinMismatch = visitor.pele !== real.pele;

    const appearance = [
      visitor.quepe === "Sim" ? "estou usando quepe" : "estou sem quepe",
      visitor.oculos === "Sim" ? "estou usando óculos" : "estou sem óculos"
    ].join(" e ");

    answerLines.push(
      `“${appearance}. Minha aparência está normal.”`,
      `“Olhe para mim: ${appearance}.”`,
      `“Hoje ${appearance}. É só isso que precisa saber?”`
    );

    if (skinMismatch) {
      answerLines.push("“A minha aparência não tem nada de estranho.”");
    }
  }

  if (questionKey === "authorization") {
    const record = alasql(
      "SELECT responsavel, horario, setor FROM autorizacoes WHERE id_doc = ?",
      [real.id_doc]
    )[0];
    const audit = typeof investigateVisitor === "function"
      ? investigateVisitor(real.id_doc)
      : null;

    const authorization = record
      ? `${record.responsavel}, às ${record.horario}, pelo setor ${record.setor}`
      : "Não sei informar quem autorizou";

    const irregular = audit?.suspicious === true;
    answerLines.push(...(irregular ? [
      `“A autorização está em nome de ${authorization}. Foi o que me informaram.”`,
      `“Só sei que consta ${authorization}. Não tenho mais detalhes.”`,
      `“Está no sistema: ${authorization}. Pode verificar.”`
    ] : [
      `“${authorization}. A autorização foi confirmada.”`,
      `“O responsável foi ${authorization}.”`,
      `“Está tudo certo: ${authorization}.”`
    ]));
  }

  if (declaration) {
    declaration.textContent = chooseVisitorLine(answerLines);
  }

  renderInterrogationUI();
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

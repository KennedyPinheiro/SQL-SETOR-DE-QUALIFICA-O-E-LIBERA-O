/* ========================================
   PRÉDIO E INTERFONE — S.Q.L.
======================================== */

/* ========================================
   INTERFONE
======================================== */

function callApartment() {
  if (gameState.gameOver || gameState.decisionLocked) return;

  const alojamento = gameState.currentVisitor.alojamento;
  const result = document.getElementById("intercom-result");

  result.textContent = `Chamando alojamento ${alojamento}...`;

  document.getElementById("btn-call").disabled = true;

  later(() => {
    if (gameState.neighborAlreadyInside) {
      result.innerHTML =
        '<strong class="status-bad">"Eu já estou dentro do quartel! Quem está aí no portão?!"</strong>';

    } else if (gameState.visitorCase === "wrong_apartment") {
      result.innerHTML =
        '<strong class="status-bad">Quem atendeu o rádio afirma que não conhece o solicitante.</strong>';

    } else {
      result.textContent =
        "Ninguém atendeu. Não foi possível confirmar a identidade.";
    }

    document.getElementById("btn-call").disabled = false;
  }, 650);
}

/* ========================================
   MODAL DO PRÉDIO
======================================== */

function openBuildingModal() {
  renderBuilding();

  const modal = document.getElementById("building-modal");

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeBuildingModal() {
  const modal = document.getElementById("building-modal");

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

/* ========================================
   RENDERIZAÇÃO DO PRÉDIO
======================================== */

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

      const resident = alasql(
        "SELECT * FROM militares WHERE alojamento = ?",
        [alojamento]
      )[0];

      const button = document.createElement("button");

      button.className =
        "apt-unit" +
        (resident ? "" : " vacant") +
        (gameState.selectedApartment === alojamento ? " selected" : "");

      button.innerHTML = `
        <strong>${alojamento}</strong>
        <small>${resident ? "CADASTRADO" : "SEM REGISTRO"}</small>
      `;

      button.onclick = () => selectApartment(alojamento);

      units.appendChild(button);
    }

    grid.appendChild(units);
  }

  if (gameState.selectedApartment) {
    selectApartment(gameState.selectedApartment, false);
  }
}

/* ========================================
   SELEÇÃO DE ALOJAMENTO
======================================== */

function selectApartment(alojamento, rerender = true) {
  gameState.selectedApartment = alojamento;

  if (rerender) {
    renderBuilding();
  }

  const resident = alasql(
    "SELECT * FROM militares WHERE alojamento = ?",
    [alojamento]
  )[0];

  const details = document.getElementById("apartment-details");

  if (!resident) {
    details.innerHTML = `
      <div class="details-placeholder">
        <span>!</span>
        <strong>ALOJAMENTO ${alojamento} SEM CADASTRO</strong>
        <small>Não há militar registrado neste alojamento.</small>
      </div>
    `;
    return;
  }

  const auth = alasql(
    "SELECT autorizado FROM lista_hoje WHERE id_doc = ?",
    [resident.id_doc]
  )[0];

  const log = alasql(
    "SELECT status_atual FROM logs_portao WHERE id_doc = ?",
    [resident.id_doc]
  )[0];

  details.innerHTML = `
    <div class="resident-detail">
      <h3>
        ▰ ${escapeHTML(resident.nome)}
        <span style="color:#82938a;font-weight:400">
          / ALOJ. ${alojamento}
        </span>
      </h3>

      <div>DOCUMENTO: <b>${escapeHTML(resident.id_doc)}</b></div>

      <div>PATENTE: <b>${escapeHTML(resident.patente)}</b></div>

      <div>
        QUEPE: <b>${resident.quepe}</b>
        · ÓCULOS: <b>${resident.oculos}</b>
      </div>

      <div>
        AUTORIZAÇÃO:
        <b class="${auth.autorizado === "Sim" ? "status-good" : "status-bad"}">
          ${auth.autorizado === "Sim" ? "AUTORIZADO" : "NÃO AUTORIZADO"}
        </b>
      </div>

      <div>
        PORTÃO:
        <b>
          ${log.status_atual === "Dentro do quartel"
            ? "DENTRO DO QUARTEL"
            : "FORA DO QUARTEL"}
        </b>
      </div>
    </div>
  `;
}

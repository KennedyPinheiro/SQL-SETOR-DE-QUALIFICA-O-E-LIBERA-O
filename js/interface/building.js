/* ========================================
   PRÉDIO E INTERFONE — S.Q.L.
======================================== */


/* ========================================
   INTERFONE
======================================== */

let intercomTimer = null;

function callApartment() {
  if (gameState.gameOver || gameState.decisionLocked) return;

  const visitor = gameState.currentVisitor;

  if (!visitor || intercomTimer !== null) return;

  const alojamento = visitor.alojamento;

  const result = document.getElementById("intercom-result");
  const button = document.getElementById("btn-call");
  const panel = document.querySelector(".intercom-card");

  if (!result || !button) return;

  result.textContent = `Chamando alojamento ${alojamento}...`;
  panel?.classList.add("is-transmitting");
  panel?.setAttribute("aria-busy", "true");

  button.disabled = true;

  intercomTimer = later(() => {
    intercomTimer = null;
    panel?.classList.remove("is-transmitting");
    panel?.removeAttribute("aria-busy");

    if (gameState.gameOver || gameState.decisionLocked) return;

    if (gameState.neighborAlreadyInside) {
      result.innerHTML = `
        <strong class="status-bad">
          "Eu já estou dentro do quartel! Quem está aí no portão?!"
        </strong>
      `;

    } else if (gameState.visitorCase === "wrong_apartment") {
      result.innerHTML = `
        <strong class="status-bad">
          Quem atendeu o rádio afirma que não conhece o solicitante.
        </strong>
      `;

    } else {
      result.textContent =
        "Ninguém atendeu. Não foi possível confirmar a identidade.";
    }

    button.disabled =
      gameState.gameOver ||
      gameState.decisionLocked;

  }, 650);
}


/* ========================================
   CANCELAMENTO DO INTERFONE
======================================== */

function cancelIntercomCall() {
  const panel = document.querySelector(".intercom-card");

  if (intercomTimer !== null) {
    clearTimeout(intercomTimer);

    pendingTimers.delete(intercomTimer);

    intercomTimer = null;
  }

  panel?.classList.remove("is-transmitting");
  panel?.removeAttribute("aria-busy");
}


/* ========================================
   MODAL DO PRÉDIO
======================================== */

function openBuildingModal() {
  renderBuilding();

  const modal = document.getElementById("building-modal");

  if (!modal) return;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}


function closeBuildingModal() {
  const modal = document.getElementById("building-modal");

  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}


/* ========================================
   RENDERIZAÇÃO DO PRÉDIO
======================================== */

function renderBuilding() {
  const grid = document.getElementById("building-grid");

  if (!grid) return;

  grid.innerHTML = "";

  for (let floor = 4; floor >= 1; floor--) {

    /* Identificação do pavimento */

    const label = document.createElement("div");

    label.className = "floor-name";
    label.textContent = `PAV. ${floor}`;

    grid.appendChild(label);


    /* Unidades do pavimento */

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
        (gameState.selectedApartment === alojamento
          ? " selected"
          : "");

      const apartmentNumber = document.createElement("strong");

      apartmentNumber.textContent = alojamento;

      const apartmentStatus = document.createElement("small");

      apartmentStatus.textContent =
        resident ? "CADASTRADO" : "SEM REGISTRO";

      button.appendChild(apartmentNumber);
      button.appendChild(apartmentStatus);

      button.onclick = () => selectApartment(alojamento);

      units.appendChild(button);
    }

    grid.appendChild(units);
  }


  /* Recupera detalhes do apartamento selecionado */

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
    return;
  }

  const details = document.getElementById("apartment-details");

  if (!details) return;

  const resident = alasql(
    "SELECT * FROM militares WHERE alojamento = ?",
    [alojamento]
  )[0];


  /* ========================================
     ALOJAMENTO SEM CADASTRO
  ======================================== */

  if (!resident) {
    details.innerHTML = `
      <div class="details-placeholder">
        <span>!</span>
        <strong>ALOJAMENTO ${escapeHTML(alojamento)} SEM CADASTRO</strong>
        <small>Não há militar registrado neste alojamento.</small>
      </div>
    `;

    return;
  }


  /* ========================================
     CONSULTA DOS REGISTROS
  ======================================== */

  const auth = alasql(
    "SELECT autorizado FROM lista_hoje WHERE id_doc = ?",
    [resident.id_doc]
  )[0];

  const log = alasql(
    "SELECT status_atual FROM logs_portao WHERE id_doc = ?",
    [resident.id_doc]
  )[0];

  const authorized = auth && auth.autorizado === "Sim";

  const inside = log && log.status_atual === "Dentro do quartel";


  /* ========================================
     DETALHES DO MORADOR
  ======================================== */

  details.innerHTML = `
    <div class="resident-detail">

      <h3>
        ▰ ${escapeHTML(resident.nome)}
        <span style="color:#82938a;font-weight:400">
          / ALOJ. ${escapeHTML(alojamento)}
        </span>
      </h3>

      <div>
        DOCUMENTO:
        <b>${escapeHTML(resident.id_doc)}</b>
      </div>

      <div>
        PATENTE:
        <b>${escapeHTML(resident.patente)}</b>
      </div>

      <div>
        QUEPE:
        <b>${escapeHTML(resident.quepe)}</b>
        · ÓCULOS:
        <b>${escapeHTML(resident.oculos)}</b>
      </div>

      <div>
        AUTORIZAÇÃO:
        <b class="${authorized ? "status-good" : "status-bad"}">
          ${authorized ? "AUTORIZADO" : "NÃO AUTORIZADO"}
        </b>
      </div>

      <div>
        PORTÃO:
        <b>
          ${inside ? "DENTRO DO QUARTEL" : "FORA DO QUARTEL"}
        </b>
      </div>

    </div>
  `;
}

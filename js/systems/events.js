/* ========================================
   SISTEMA DE EVENTOS ALEATÓRIOS — S.Q.L.
======================================== */

/* Chance de ocorrer um evento por turno */

const EVENT_CHANCE = 0.35;

/* Catálogo de eventos */

const RANDOM_EVENTS = [
    {
        id: "security_alert",
        title: "ALERTA DE SEGURANÇA",
        description: "O nível de segurança foi elevado. Redobre a atenção."
    },
    {
        id: "system_failure",
        title: "FALHA NO SISTEMA",
        description: "O terminal apresentou instabilidade. Consultas SQL limitadas."
    },
    {
        id: "surprise_inspection",
        title: "INSPEÇÃO SURPRESA",
        description: "Uma verificação adicional será exigida neste atendimento."
    },
    {
        id: "command_order",
        title: "ORDEM DO COMANDO",
        description: "Uma nova determinação alterou temporariamente as regras de autorização."
    },
    {
        id: "priority_visitor",
        title: "VISITANTE PRIORITÁRIO",
        description: "Este visitante exige atendimento prioritário. O tempo é limitado."
    }
];
/* ========================================
   SORTEIO DE EVENTOS
======================================== */
function triggerRandomEvent() {
    // Não substitui um evento que ainda está ativo
    if (gameState.activeEvent) {
        return;
    }

    // Limpa dados de eventos anteriores
    gameState.activeEvent = null;
    gameState.eventData = null;
    gameState.eventTurnsRemaining = 0;

    // Remove efeitos visuais anteriores
    document.body.classList.remove("system-failure", "security-alert");

    // Restaura o terminal SQL
    const sqlInput = document.getElementById("sql-input");

    if (sqlInput) {
        sqlInput.disabled = false;
        sqlInput.placeholder = "Digite sua consulta SQL...";
    }

    // Remove notificação anterior
    const previous = document.getElementById("event-notification");

    if (previous) previous.remove();

    // Chance de ocorrência
    if (Math.random() >= EVENT_CHANCE) {
        return;
    }

    // Sorteia um evento aleatório
    const index = Math.floor(
        Math.random() * RANDOM_EVENTS.length
    );

    const selectedEvent = RANDOM_EVENTS[index];


    if (!selectedEvent) return;

    // Registra o evento
    gameState.activeEvent = selectedEvent.id;
    gameState.eventData = { ...selectedEvent };

    // Sorteia duração entre 2 e 4 turnos
    gameState.eventTurnsRemaining = Math.floor(
        Math.random() * 3
    ) + 2;



    // Ativa os efeitos específicos
    if (selectedEvent.id === "system_failure") {
        activateSystemFailure();

    } else if (selectedEvent.id === "security_alert") {
        activateSecurityAlert();

    } else if (selectedEvent.id === "surprise_inspection") {
        activateSurpriseInspection();

    } else {
        showEventNotification(selectedEvent);
    }
}

/* ========================================
   EXIBIÇÃO DO EVENTO
======================================== */

function showEventNotification(event) {
    if (!event) return;

    const notification = document.createElement("div");

    notification.id = "event-notification";
    notification.className = "event-notification";

    notification.innerHTML = `
        <strong>${event.title}</strong>
        <p>${event.description}</p>
    `;

    const previous = document.getElementById(
        "event-notification"
    );

    if (previous) previous.remove();

    document.body.appendChild(notification);

    later(() => {
        notification.classList.add("visible");
    }, 50);

    later(() => {
        notification.classList.remove("visible");

        later(() => notification.remove(), 400);
    }, 3000);
}/* ========================================
   EFEITO: FALHA NO SISTEMA
======================================== */

function activateSystemFailure() {
    document.body.classList.add("system-failure");

    const approveButton = document.getElementById("btn-approve");
    const denyButton = document.getElementById("btn-deny");

    if (approveButton) {
        approveButton.disabled = false;
    }

    if (denyButton) {
        denyButton.disabled = false;
    }

    showEventNotification({
        title: "FALHA NO SISTEMA",
        description: "Terminal temporariamente indisponível."
    });

}

function activateSecurityAlert() {
    document.body.classList.add("security-alert");

    showEventNotification({
        title: "ALERTA DE SEGURANÇA",
        description: "Protocolo de segurança elevado. Informações de suspeita temporariamente restritas."
    });

}
/* ========================================
   INSPEÇÃO SURPRESA
======================================== */

function activateSurpriseInspection() {
    gameState.requiredQueries++;
    gameState.queriesRemaining++;

    updateQueriesHUD();
    updateSqlProgress();

    showEventNotification({
        title: "INSPEÇÃO SURPRESA",
        description: "O comando exige uma verificação adicional. Execute uma consulta SQL válida antes de tomar sua decisão."
    });

    console.log("[EVENTO] Inspeção Surpresa ativada. Uma consulta adicional foi exigida.");
}
/* ========================================
   CONTROLE DE DURAÇÃO DOS EVENTOS
======================================== */
function updateEventDuration() {
    if (!gameState.activeEvent) return;

    gameState.eventTurnsRemaining--;

    console.log(
        `[EVENTO] ${gameState.activeEvent} — ${gameState.eventTurnsRemaining} turnos restantes.`
    );

    if (gameState.eventTurnsRemaining > 0) {
        return;
    }

    const finishedEvent = gameState.activeEvent;

    gameState.activeEvent = null;
    gameState.eventData = null;
    gameState.eventTurnsRemaining = 0;

    // Remove efeitos visuais
    document.body.classList.remove(
        "system-failure",
        "security-alert"
    );

    // Restaura o terminal SQL
    const sqlInput = document.getElementById("sql-input");

    if (sqlInput) {
        sqlInput.disabled = false;
        sqlInput.placeholder = "Digite sua consulta SQL...";
    }


}

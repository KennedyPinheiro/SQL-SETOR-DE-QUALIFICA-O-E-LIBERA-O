/* ========================================
   SISTEMA DE EVENTOS ALEATÓRIOS — S.Q.L.
======================================== */

/* Chance de ocorrer um evento por turno */

const EVENT_CHANCE = 1.5;

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
    // Limpa o evento anterior
    gameState.activeEvent = null;
    gameState.eventData = null;

    // Remove efeitos do evento anterior
    document.body.classList.remove("system-failure");
    // Restaura o terminal SQL
    const sqlInput = document.getElementById("sql-input");

    if (sqlInput) {
        sqlInput.disabled = false;
        sqlInput.placeholder = "Digite sua consulta SQL...";
    }

    // Remove notificações anteriores
    const previous = document.getElementById(
        "event-notification"
    );

    if (previous) previous.remove();

    // Verifica a chance de ocorrência
    if (Math.random() >= EVENT_CHANCE) {
        return;
    }

    // Sorteia um evento
    const index = Math.floor(
        Math.random() * RANDOM_EVENTS.length
    );

    const selectedEvent = RANDOM_EVENTS[index];

    gameState.activeEvent = selectedEvent.id;
    gameState.eventData = { ...selectedEvent };
    // Ativa os efeitos específicos do evento
    if (selectedEvent.id === "system_failure") {
        activateSystemFailure();
    }

    // Exibe a notificação na tela
    showEventNotification(selectedEvent);

    console.log(`[EVENTO] ${selectedEvent.title}`);
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

    if (approveButton) approveButton.disabled = false;
    if (denyButton) denyButton.disabled = false;

    showEventNotification({
        title: "FALHA NO SISTEMA",
        description: "Terminal temporariamente indisponível."
    });
}
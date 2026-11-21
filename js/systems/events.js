/* ========================================
   SISTEMA DE EVENTOS ALEATÓRIOS — S.Q.L.
======================================== */

/* Chance de ocorrer um evento por turno */

const EVENT_CHANCE = 0.35;

/* Catálogo de eventos */

const RANDOM_EVENTS = [
    {
        id: "security_alert",
        icon: "⚠",
        title: "ALERTA DE SEGURANÇA",
        description: "O nível de segurança foi elevado. Redobre a atenção."
    },
    {
        id: "system_failure",
        icon: "⌁",
        title: "FALHA NO SISTEMA",
        description: "Falha temporária: consultas SQL indisponíveis. Você ainda pode decidir o destino do visitante."
    },
    {
        id: "surprise_inspection",
        icon: "◎",
        title: "INSPEÇÃO SURPRESA",
        description: "Faça uma consulta direcionada adicional ao visitante, usando uma fonte de dados ainda não investigada."
    },
    {
        id: "command_order",
        icon: "▤",
        title: "ORDEM DO COMANDO",
        description: "O comando destacou o painel de decisão para chamar atenção aos procedimentos. As regras de autorização continuam as mesmas."
    },
    {
        id: "priority_visitor",
        icon: "!",
        title: "VISITANTE PRIORITÁRIO",
        description: "Este visitante exige atendimento prioritário. O tempo é limitado."
    }
];

function eventVisualClass(eventId) {
    return `event-${String(eventId).replace(/_/g, "-")}`;
}

function clearEventEffects() {
    document.body.classList.remove(
        "system-failure",
        "security-alert",
        ...RANDOM_EVENTS.map(event => eventVisualClass(event.id))
    );

    if (typeof stopPriorityTimer === "function") {
        stopPriorityTimer();
    }

    document.getElementById("event-notification")?.remove();
}
/* ========================================
   SORTEIO DE EVENTOS
======================================== */
function triggerRandomEvent() {
    if (gameState.gameMode === "falha") return;

    // Não substitui um evento que ainda está ativo
    if (gameState.activeEvent) {
        return;
    }

    // Limpa dados de eventos anteriores
    gameState.activeEvent = null;
    gameState.eventData = null;
    gameState.eventTurnsRemaining = 0;

    // Remove efeitos visuais anteriores
    clearEventEffects();

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

    document.body.classList.add(eventVisualClass(selectedEvent.id));



    // Ativa os efeitos específicos
    if (selectedEvent.id === "system_failure") {
        activateSystemFailure();

    } else if (selectedEvent.id === "security_alert") {
        activateSecurityAlert();

    } else if (selectedEvent.id === "surprise_inspection") {
        activateSurpriseInspection();

    } else if (selectedEvent.id === "priority_visitor") {
        activatePriorityVisitor();

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
    if (event.id) {
        notification.classList.add(`event-notification-${String(event.id).replace(/_/g, "-")}`);
    }

    const mark = document.createElement("span");
    mark.className = "event-notification-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = event.icon || "!";

    const message = document.createElement("div");
    message.className = "event-notification-copy";

    const title = document.createElement("strong");
    title.textContent = event.title;

    const description = document.createElement("p");
    description.textContent = event.description;

    message.append(title, description);
    notification.append(mark, message);

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
    }, 4500);
}/* ========================================
   EFEITO: FALHA NO SISTEMA
======================================== */

function activateSystemFailure() {
    document.body.classList.add("system-failure");

    const sqlInput = document.getElementById("sql-input");
    const executeButton = document.getElementById("btn-exec-sql");

    if (sqlInput) {
        sqlInput.disabled = true;
        sqlInput.placeholder = "SQL bloqueado durante a falha do sistema.";
    }
    if (executeButton) {
        executeButton.disabled = true;
    }

    const approveButton = document.getElementById("btn-approve");
    const denyButton = document.getElementById("btn-deny");
    const referButton = document.getElementById("btn-refer");

    if (approveButton) {
        approveButton.disabled = false;
    }

    if (denyButton) {
        denyButton.disabled = false;
    }
    if (referButton) {
        referButton.disabled = false;
    }

    showEventNotification({
        ...gameState.eventData,
        description: "Consultas SQL temporariamente indisponíveis. Você ainda pode autorizar, negar ou encaminhar o caso."
    });

}

function activateSecurityAlert() {
    document.body.classList.add("security-alert");

    showEventNotification({
        ...gameState.eventData,
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
        ...gameState.eventData,
        description: "O comando exige mais uma consulta direcionada ao visitante, em uma fonte de dados ainda não investigada."
    });
}
/* ========================================
   EVENTO — VISITANTE PRIORITÁRIO
======================================== */

function activatePriorityVisitor() {
    showEventNotification({
        ...gameState.eventData,
        description: "Este visitante exige atendimento prioritário. Você tem 15 segundos para tomar uma decisão."
    });

   
}
/* ========================================
   CONTROLE DE DURAÇÃO DOS EVENTOS
======================================== */
function updateEventDuration() {
    if (gameState.gameMode === "falha") return;

    if (!gameState.activeEvent) return;

    gameState.eventTurnsRemaining--;

    
    if (gameState.eventTurnsRemaining > 0) {
        return;
    }
    const finishedEvent = gameState.activeEvent;

    if (finishedEvent === "priority_visitor") {
        stopPriorityTimer();
    }

    document.body.classList.remove(eventVisualClass(finishedEvent));

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

    if (typeof updateSqlButton === "function") updateSqlButton();


}

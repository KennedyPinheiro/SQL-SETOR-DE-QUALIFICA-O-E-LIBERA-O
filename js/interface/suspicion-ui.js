/* ========================================
   INTERFACE DE SUSPEITA — S.Q.L.
======================================== */

/* ========================================
   ATUALIZAÇÃO DO PAINEL
======================================== */

function updateSuspicionUI() {
    const scoreElement = document.getElementById("suspicion-score");
    const barElement = document.getElementById("suspicion-bar");
    const levelElement = document.getElementById("suspicion-level");
    const evidenceContainer = document.getElementById("suspicion-evidence-list");

    if (!scoreElement || !barElement || !levelElement || !evidenceContainer) {
        return;
    }

    const score = Math.min(100, Math.max(0, gameState.suspicion));
    const level = getSuspicionLevel();

    /* Pontuação */

    scoreElement.textContent = `${score} / 100`;

    /* Barra */

    barElement.style.width = `${score}%`;
    // Efeito visual na barra de suspeita
    barElement.classList.remove("suspicion-bar-update");
    void barElement.offsetWidth;
    barElement.classList.add("suspicion-bar-update");

    later(() => {
        barElement.classList.remove("suspicion-bar-update");
    }, 400);

    /* Nível */

    levelElement.textContent = level.label;
    levelElement.className = `suspicion-level ${level.level}`;
    /* ========================================
   ALERTAS SONOROS
======================================== */

    if (level.level !== lastSuspicionAlertLevel) {

        if (
            level.level === "high" ||
            level.level === "critical"
        ) {
            if (typeof playSuspicionAlert === "function") {
                playSuspicionAlert(level.level);
            }
        }

        lastSuspicionAlertLevel = level.level;
    }
    /* ========================================
       ALERTA DE SUSPEITA CRÍTICA
    ======================================== */

    const panel = document.getElementById("suspicion-panel");

    if (panel) {
        panel.classList.toggle(
            "critical-alert",
            level.level === "critical"
        );
    }
    /* Cor da barra */

    const suspicionColors = {
        low: "#91a66b",
        attention: "#d4a44c",
        suspicious: "#e28a49",
        high: "#e4654f",
        critical: "#ff4b4b"
    };

    barElement.style.backgroundColor = suspicionColors[level.level] || suspicionColors.low;

    /* Evidências */

    renderSuspicionEvidence();
}

/* ========================================
   RENDERIZAÇÃO DAS EVIDÊNCIAS
======================================== */

function renderSuspicionEvidence() {
    const container = document.getElementById("suspicion-evidence-list");

    if (!container) return;

    const discovered = Array.from(gameState.discoveredEvidence);

    /* Nenhuma evidência */

    if (discovered.length === 0) {
        container.innerHTML = `
      <div class="suspicion-empty">
        Nenhuma evidência identificada.
      </div>
    `;

        return;
    }

    /* Lista de evidências */

    container.innerHTML = "";

    discovered.forEach(key => {
        const evidence = suspicionEvidence[key];

        if (!evidence) return;

        const item = document.createElement("div");
        item.className = "suspicion-evidence-item";

        const icon = document.createElement("div");
        icon.className = "suspicion-evidence-icon";
        icon.textContent = "✓";

        const label = document.createElement("span");
        label.textContent = evidence.label;

        const points = document.createElement("small");
        points.textContent = `+${evidence.points}`;

        item.append(icon, label, points);

        container.appendChild(item);
    });
}

/* ========================================
   CONTROLE DE ALERTAS SONOROS
======================================== */

let lastSuspicionAlertLevel = "low";
/* ========================================
   ANIMAÇÃO DE SUSPEITA
======================================== */

function animateSuspicion() {
    const panel = document.getElementById("suspicion-panel");

    if (!panel || !animationsEnabled()) return;

    panel.classList.remove("suspicion-update");

    void panel.offsetWidth;

    panel.classList.add("suspicion-update");

    later(() => {
        panel.classList.remove("suspicion-update");
    }, 500);
}
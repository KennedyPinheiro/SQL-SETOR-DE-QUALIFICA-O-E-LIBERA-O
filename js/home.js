/* ========================================
 *  HOME — S.Q.L.
 * ======================================== */

const modes = {
    classico: { label: "CLÁSSICO" },
    falha: { label: "FALHA DO SISTEMA" },
    practice: { label: "PRÁTICA SQL" }
};

const difficultyDetails = {
    classico: {
        facil: "5 vidas · 5 consultas · meta 1",
        normal: "3 vidas · 4 consultas · meta 2",
        dificil: "1 vida · 4 consultas · meta 3"
    },
    falha: {
        facil: "5 vidas",
        normal: "3 vidas",
        dificil: "1 vida"
    }
};

let selectedMode = "classico";
let selectedDifficulty = "normal";
let startingGame = false;

const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-game");
const difficultySelector = document.getElementById("difficulty-selector");

function getHomeSettings() {
    return window.getSqlSettings?.() ?? {
        animations: true
    };
}

function animationsEnabled() {
    return getHomeSettings().animations !== false &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* Inicialização da interface */
if (startScreen && animationsEnabled()) {
    startScreen.classList.add("home-boot");
}

/* Seleção de dificuldade */
function selectMode(mode) {
    if (!modes[mode]) return;

    selectedMode = mode;

    const headline = document.getElementById("home-headline");
    if (headline) {
        headline.innerHTML = mode === "practice"
            ? "DOMINE O SQL.<br><em>NO SEU RITMO.</em>"
            : mode === "falha"
                ? "SEM TERMINAL.<br><em>SEM MARGEM.</em>"
                : "ESSE NÃO É<br><em>DOS NOSSOS.</em>";
    }

    document.querySelectorAll(".mode-card").forEach(card => {
        const active = card.dataset.mode === mode;

        card.classList.toggle("selected", active);
        card.setAttribute("aria-pressed", String(active));
    });

    const needsDifficulty = mode === "classico" || mode === "falha";
    if (difficultySelector) difficultySelector.hidden = !needsDifficulty;

    const difficultyHeading = document.getElementById("difficulty-heading");
    if (difficultyHeading) {
        difficultyHeading.textContent = mode === "falha"
            ? "DIFICULDADE • DEFINIDA PELAS VIDAS"
            : "DIFICULDADE CLÁSSICA";
    }

    document.querySelectorAll(".difficulty-card").forEach(card => {
        const difficulty = card.dataset.difficulty;
        const detail = difficultyDetails[mode]?.[difficulty];
        const small = card.querySelector("small");

        card.hidden = !needsDifficulty;
        if (small && detail) small.textContent = detail;
    });

    if (startButton) {
        startButton.textContent = mode === "practice"
            ? "ABRIR TREINO SQL →"
            : mode === "falha"
                ? "INICIAR CONTINGÊNCIA →"
                : "INICIAR TURNO →";
    }

    const hint = document.getElementById("start-mode-hint");
    if (hint) {
        hint.textContent = mode === "practice"
            ? "Consulte livremente as tabelas do quartel."
            : mode === "falha"
                ? "O terminal ficará bloqueado durante toda a partida."
                : "O terminal SQL é sua principal ferramenta de investigação.";
    }
}

function selectDifficulty(difficulty) {
    if (!difficultyDetails.classico[difficulty]) return;

    selectedDifficulty = difficulty;
    document.querySelectorAll(".difficulty-card").forEach(card => {
        const active = card.dataset.difficulty === difficulty;
        card.classList.toggle("selected", active);
        card.setAttribute("aria-pressed", String(active));
    });
}

/* Inicialização da partida */
function startGame() {
    if (startingGame) return;

    startingGame = true;

    if (startButton) {
        startButton.disabled = true;
    }

    const destination = selectedMode === "practice"
        ? "practice.html"
        : `game.html?mode=${selectedMode}&difficulty=${selectedDifficulty}`;

    if (!startScreen || !animationsEnabled()) {
        window.location.href = destination;
        return;
    }

    startScreen.classList.add("is-shutting-down");

    setTimeout(() => {
        window.location.href = destination;
    }, 650);
}

/* Eventos dos cartões */
document.querySelectorAll(".mode-card").forEach(card => {
    card.addEventListener("click", () => {
        selectMode(card.dataset.mode);
    });
});

document.querySelectorAll(".difficulty-card").forEach(card => {
    card.addEventListener("click", () => {
        selectDifficulty(card.dataset.difficulty);
    });
});

/* Recupera dificuldade da URL */
const initialParams = new URLSearchParams(window.location.search);
const initialMode = initialParams.get("mode");
const initialDifficulty = initialParams.get("difficulty");

if (modes[initialMode]) {
    selectMode(initialMode);
    if (initialDifficulty) selectDifficulty(initialDifficulty);
} else if (difficultyDetails.classico[initialMode]) {
    // Compatibilidade com URLs antigas da tela de dificuldade.
    selectMode("classico");
    selectDifficulty(initialMode);
} else {
    selectMode("classico");
    selectDifficulty("normal");
}

/* Botão de iniciar */
startButton?.addEventListener("click", startGame);

/* ========================================
 *  MODAL DE AJUDA
 * ======================================== */

function openHomeHelpModal() {
    const modal = document.getElementById('home-help-modal');

    if (!modal) return;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeHomeHelpModal() {
    const modal = document.getElementById('home-help-modal');

    if (!modal) return;

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}

/* Fechar ao clicar fora do conteúdo */
document.getElementById('home-help-modal')?.addEventListener('click', (event) => {
    if (event.target.id === 'home-help-modal') {
        closeHomeHelpModal();
    }
});

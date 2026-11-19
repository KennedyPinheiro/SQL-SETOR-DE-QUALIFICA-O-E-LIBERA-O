/* ========================================
 *  HOME — S.Q.L.
 * ======================================== */

const modes = {
    facil: { label: "FÁCIL" },
    normal: { label: "NORMAL" },
    dificil: { label: "DIFÍCIL" }
};

let selectedMode = "normal";
let startingGame = false;

const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-game");

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

    document.querySelectorAll(".mode-card").forEach(card => {
        const active = card.dataset.mode === mode;

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

    const destination = `game.html?mode=${selectedMode}`;

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

/* Recupera dificuldade da URL */
const initialMode = new URLSearchParams(
    window.location.search
).get("mode");

selectMode(modes[initialMode] ? initialMode : "normal");

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
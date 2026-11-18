const modes = {
  facil: { label: "FÁCIL" },
  normal: { label: "NORMAL" },
  dificil: { label: "DIFÍCIL" }
};
let selectedMode = "normal";
function selectMode(mode) {
  if (!modes[mode]) return;
  selectedMode = mode;
  document.querySelectorAll(".mode-card").forEach(card => {
    const active = card.dataset.mode === mode;
    card.classList.toggle("selected", active);
    card.setAttribute("aria-pressed", String(active));
  });
}
function startGame() {
  window.location.href = `game.html?mode=${selectedMode}`;
}
document.querySelectorAll(".mode-card").forEach(card => {
  card.addEventListener("click", () => selectMode(card.dataset.mode));
});
const initialMode = new URLSearchParams(window.location.search).get("mode");
selectMode(modes[initialMode] ? initialMode : "normal");

document.getElementById("start-game").addEventListener("click", startGame);

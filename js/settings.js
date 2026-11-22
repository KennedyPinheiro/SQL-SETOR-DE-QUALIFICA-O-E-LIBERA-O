(() => {
  const STORAGE_KEY = "sql-settings";
  const DEFAULTS = Object.freeze({
    sound: true,
    volume: 50,
    music: true,
    musicVolume: 25,
    animations: true,
    leaves: true
  });
  let returnFocus = null;
  let returnToMenu = false;

  function readSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        sound: typeof saved.sound === "boolean" ? saved.sound : DEFAULTS.sound,
        volume: Number.isFinite(Number(saved.volume)) ? Math.min(100, Math.max(0, Number(saved.volume))) : DEFAULTS.volume,
        music: typeof saved.music === "boolean" ? saved.music : DEFAULTS.music,
        musicVolume: Number.isFinite(Number(saved.musicVolume))
          ? Math.min(100, Math.max(0, Number(saved.musicVolume)))
          : DEFAULTS.musicVolume,
        animations: typeof saved.animations === "boolean" ? saved.animations : DEFAULTS.animations,
        leaves: typeof saved.leaves === "boolean" ? saved.leaves : DEFAULTS.leaves
      };
    } catch { return { ...DEFAULTS }; }
  }

  let settings = readSettings();
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Não foi possível salvar as configurações.", error);
    }

    applySettings();

    window.dispatchEvent(new CustomEvent("sql-settings-changed", {
      detail: { ...settings }
    }));
  }
  function applySettings() {
    document.body.classList.toggle("reduce-motion", !settings.animations);
    const sound = document.getElementById("setting-sound");
    const volume = document.getElementById("setting-volume");
    const volumeValue = document.getElementById("setting-volume-value");
    const music = document.getElementById("setting-music");
    const musicVolume = document.getElementById("setting-music-volume");
    const musicVolumeValue = document.getElementById("setting-music-volume-value");
    const animations = document.getElementById("setting-animations");
    const leaves = document.getElementById("setting-leaves");
    if (sound) sound.checked = settings.sound;
    if (volume) volume.value = String(settings.volume);
    if (volumeValue) volumeValue.value = `${settings.volume}%`;
    if (music) music.checked = settings.music;
    if (musicVolume) musicVolume.value = String(settings.musicVolume);
    if (musicVolumeValue) {
      musicVolumeValue.value = `${settings.musicVolume}%`;
    }
    if (animations) animations.checked = settings.animations;
    if (leaves) leaves.checked = settings.leaves;
  }
  function openSettingsModal() {
    const modal = document.getElementById("settings-modal");
    if (!modal) return;
    returnFocus = document.activeElement;
    applySettings();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    const close = modal.querySelector("[data-settings-close]");
    if (close) close.focus();
  }
  function closeSettingsModal() {
    const modal = document.getElementById("settings-modal");
    if (!modal || !modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (returnToMenu && typeof window.openMenuModal === "function") {
      returnToMenu = false;
      window.openMenuModal(true);
      return;
    }
    if (returnFocus && typeof returnFocus.focus === "function") returnFocus.focus();
    returnFocus = null;
  }
  function openSettingsFromMenu() {
    const menu = document.getElementById("menu-modal");
    if (menu) { menu.classList.remove("open"); menu.setAttribute("aria-hidden", "true"); returnToMenu = true; }
    openSettingsModal();
  }

  function initializeSettingsInterface() {
    const modal = document.getElementById("settings-modal");
    if (!modal || modal.dataset.settingsInitialized === "true") return;
    modal.dataset.settingsInitialized = "true";
    applySettings();
    modal.addEventListener("click", event => {
      if (event.target === modal || event.target.closest("[data-settings-close]")) closeSettingsModal();
    });
    document.getElementById("setting-sound")?.addEventListener("change", event => { settings.sound = event.target.checked; persist(); });
    document.getElementById("setting-volume")?.addEventListener("input", event => { settings.volume = Number(event.target.value); persist(); });
    document.getElementById("setting-music")?.addEventListener("change", event => { settings.music = event.target.checked; persist(); });
    document.getElementById("setting-music-volume")?.addEventListener("input", event => {
      settings.musicVolume = Number(event.target.value);
      persist();
    });
    document.getElementById("setting-animations")?.addEventListener("change", event => { settings.animations = event.target.checked; persist(); });
    document.getElementById("setting-leaves")?.addEventListener("change", event => { settings.leaves = event.target.checked; persist(); });
    document.getElementById("settings-reset")?.addEventListener("click", () => { settings = { ...DEFAULTS }; persist(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && modal.classList.contains("open")) closeSettingsModal(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSettingsInterface, { once: true });
  } else {
    initializeSettingsInterface();
  }

  window.openSettingsModal = openSettingsModal;
  window.closeSettingsModal = closeSettingsModal;
  window.openSettingsFromMenu = openSettingsFromMenu;
  window.getSqlSettings = () => ({ ...settings });
})();

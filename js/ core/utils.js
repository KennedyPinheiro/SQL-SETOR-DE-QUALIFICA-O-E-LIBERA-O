/* ========================================
   UTILITÁRIOS — S.Q.L.
======================================== */

/* Timers pendentes */
let pendingTimers = new Set();

/* ========================================
   CONFIGURAÇÕES DE ANIMAÇÃO
======================================== */

function animationsEnabled() {
  if (document.body.classList.contains("reduce-motion")) return false;

  const settings = typeof getSqlSettings === "function"
    ? getSqlSettings()
    : null;

  return settings ? settings.animations !== false : true;
}

/* ========================================
   ANIMAÇÃO DE ELEMENTOS
======================================== */

function animateElement(element, className, duration = 600) {
  if (!element || !animationsEnabled()) return;

  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);

  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
}

/* ========================================
   GERENCIAMENTO DE TIMERS
======================================== */

function later(fn, ms) {
  const id = setTimeout(() => {
    pendingTimers.delete(id);
    fn();
  }, ms);

  pendingTimers.add(id);
}

function clearPendingTimers() {
  pendingTimers.forEach(clearTimeout);
  pendingTimers.clear();
}

/* ========================================
   SEGURANÇA — HTML
======================================== */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}
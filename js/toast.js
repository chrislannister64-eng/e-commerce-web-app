// ── TOAST ─────────────────────────────────────────────
(function () {
  if (!document.getElementById("toast-container")) {
    const el = document.createElement("div");
    el.id = "toast-container";
    document.body.appendChild(el);
  }
})();

window.showToast = function (message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("show")));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2800);
};

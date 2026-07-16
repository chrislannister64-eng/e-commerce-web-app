// ── THEME ─────────────────────────────────────────────
(function () {
  const saved = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
})();

window.toggleTheme = function () {
  const html    = document.documentElement;
  const current = html.getAttribute("data-theme");
  const next    = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateToggleButtons(next);
};

function updateToggleButtons(theme) {
  document.querySelectorAll("#theme-toggle").forEach(btn => {
    btn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("theme") || "light";
  updateToggleButtons(theme);
});

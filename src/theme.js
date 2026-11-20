// Se ejecuta antes de pintar el popup para evitar parpadeos: tema guardado o el del sistema.
(function () {
  let t = null;
  try { t = localStorage.getItem("theme"); } catch (_) {}
  if (t !== "light" && t !== "dark") {
    t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.dataset.theme = t;
})();

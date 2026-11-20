const $ = (id) => document.getElementById(id);
const input = $("code");
const msg = $("msg");
const clearBtn = $("clear");
const directBox = $("direct");

function show(text, kind = "") {
  msg.className = kind;
  msg.textContent = text;
}

function syncClear() {
  clearBtn.hidden = !input.value;
}

function save() {
  browser.storage.local.set({ code: input.value }).catch(() => {});
}

function getCode() {
  const code = parseCode(input.value);
  if (!code) show("Escribe un código numérico, por ejemplo 12345.", "err");
  return code;
}

// Recupera el último código y la opción de abrir directo.
browser.storage.local.get(["code", "direct"]).then(({ code, direct }) => {
  if (code) input.value = code;
  directBox.checked = !!direct;
  syncClear();
  input.focus();
  input.select();
}).catch(() => input.focus());

directBox.addEventListener("change", () => {
  browser.storage.local.set({ direct: directBox.checked }).catch(() => {});
});

// Modo claro / oscuro (theme.js aplica el tema inicial).
$("theme").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (_) {}
});

// Si pegas una URL completa, deja solo el código.
input.addEventListener("input", () => {
  const code = parseCode(input.value);
  if (code && input.value !== code) input.value = code;
  syncClear();
  save();
  show("");
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  syncClear();
  save();
  show("");
  input.focus();
});

// Abrir: por el acortador (aftv.news redirige) o, si la opción está activa, directo al destino.
$("f").addEventListener("submit", async (e) => {
  e.preventDefault();
  const code = getCode();
  if (!code) return;
  let url = BASE + code;
  if (directBox.checked) {
    $("go").disabled = $("peek").disabled = true;
    show("Resolviendo destino…");
    try {
      const { destination } = await resolveDestination(code);
      if (destination) url = destination; // si no se encuentra, se abre el acortador
    } catch (_) {}
    $("go").disabled = $("peek").disabled = false;
  }
  await browser.tabs.create({ url });
  window.close();
});

// Ver destino: muestra la URL final sin abrirla.
$("peek").addEventListener("click", async () => {
  const code = getCode();
  if (!code) return;
  show("Consultando…");
  try {
    const { status, destination } = await resolveDestination(code);
    if (!destination) {
      show(`No encontré el destino en la página del acortador (HTTP ${status}). El código puede no existir o estar desactivado.`, "err");
      return;
    }
    msg.className = "ok";
    msg.textContent = "";
    const host = document.createElement("strong");
    host.textContent = new URL(destination).hostname;
    const full = document.createElement("code");
    full.textContent = destination;
    const note = document.createElement("small");
    note.textContent = "Las URLs acortadas son públicas: revisa que confíes en el destino.";
    msg.append("Destino final: ", host, full, note);
  } catch (_) {
    show("No se pudo consultar el acortador. Revisa tu conexión.", "err");
  }
});

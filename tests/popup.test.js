// Pruebas del popup con jsdom y APIs de la extensión simuladas.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const DEST = "https://www.mediafire.com/file/r9manv3hi3e50bg/Xuper-Tv-NF-4.99.20-ModByNF.apk/file";
const PAGE = fs.readFileSync(path.join(__dirname, "fixtures", "go-redirect.html"), "utf8");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const store = { code: "8493022", direct: true };
const opened = [];
let dom, w, d;

before(async () => {
  dom = await JSDOM.fromFile(path.join(__dirname, "..", "src", "popup.html"), {
    runScripts: "dangerously",
    resources: "usable",
    beforeParse(win) {
      win.browser = {
        storage: { local: { get: async () => ({ ...store }), set: async (o) => { Object.assign(store, o); } } },
        tabs: { create: async (o) => { opened.push(o.url); } }
      };
      win.fetch = async () => ({ status: 200, text: async () => PAGE });
      win.close = () => {};
    }
  });
  w = dom.window;
  d = w.document;
  await new Promise((r) => w.addEventListener("load", r));
  await wait(50);
});
after(() => w.close());

const $ = (id) => d.getElementById(id);
const submit = () => $("f").dispatchEvent(new w.Event("submit", { cancelable: true, bubbles: true }));

test("restaura el último código y la opción de abrir directo", () => {
  assert.equal($("code").value, "8493022");
  assert.equal($("direct").checked, true);
  assert.equal($("clear").hidden, false);
});

test("el rótulo superior es el esperado", () => {
  assert.equal($("code").labels[0].textContent, "Código o Short URL de AFTVnews (Downloader)");
});

test("con la opción activa, Abrir va directo al destino final", async () => {
  submit();
  await wait(80);
  assert.equal(opened.at(-1), DEST);
});

test("sin la opción, Abrir usa el acortador y se guarda la preferencia", async () => {
  $("direct").checked = false;
  $("direct").dispatchEvent(new w.Event("change"));
  await wait(20);
  assert.equal(store.direct, false);
  submit();
  await wait(50);
  assert.equal(opened.at(-1), "https://aftv.news/8493022");
});

test("el botón de tema alterna claro/oscuro", () => {
  const before = d.documentElement.dataset.theme;
  assert.ok(["light", "dark"].includes(before));
  $("theme").click();
  assert.notEqual(d.documentElement.dataset.theme, before);
});

test("pegar una URL completa deja solo el código y se guarda", async () => {
  $("code").value = "https://aftv.news/777";
  $("code").dispatchEvent(new w.Event("input"));
  assert.equal($("code").value, "777");
  assert.equal(store.code, "777");
});

test("Ver destino muestra la URL final completa", async () => {
  $("peek").click();
  await wait(80);
  assert.equal(d.querySelector("#msg code").textContent, DEST);
});

test("un código no válido muestra un error y no abre nada", async () => {
  const n = opened.length;
  $("code").value = "abc";
  submit();
  await wait(20);
  assert.equal(opened.length, n);
  assert.match($("msg").textContent, /código numérico/);
});

test("la X borra el campo, se oculta y guarda el vacío", async () => {
  $("code").value = "123";
  $("code").dispatchEvent(new w.Event("input"));
  $("clear").click();
  await wait(20);
  assert.equal($("code").value, "");
  assert.equal($("clear").hidden, true);
  assert.equal(store.code, "");
});

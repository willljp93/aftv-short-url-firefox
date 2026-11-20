// Pruebas de shared.js y extract.js (parseo de códigos y extracción del destino final).
const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const read = (...p) => fs.readFileSync(path.join(__dirname, ...p), "utf8");
const src = (f) => read("..", "src", f);

// Los scripts de la extensión son scripts clásicos (comparten ámbito global): se evalúan juntos.
const { window } = new JSDOM("", { runScripts: "outside-only" });
window.eval(
  `${src("shared.js")}\n${src("extract.js")}\n` +
  "window.api = { BASE, parseCode, extractDestination, resolveDestination };"
);
const { BASE, parseCode, extractDestination, resolveDestination } = window.api;
after(() => window.close());

const DEST = "https://www.mediafire.com/file/r9manv3hi3e50bg/Xuper-Tv-NF-4.99.20-ModByNF.apk/file";

test("parseCode acepta código, aftv.news y go.aftvnews.com", () => {
  for (const [input, code] of [
    ["12345", "12345"],
    ["  8493022 ", "8493022"],
    ["aftv.news/12345", "12345"],
    ["https://aftv.news/12345/", "12345"],
    ["http://go.aftvnews.com/987", "987"]
  ]) assert.equal(parseCode(input), code, input);
});

test("parseCode rechaza entradas no válidas", () => {
  for (const input of ["", "abc", "12a", "https://evil.example/123", "aftv.news/", null, undefined])
    assert.equal(parseCode(input), null, String(input));
});

test("BASE apunta a aftv.news", () => {
  assert.equal(BASE, "https://aftv.news/");
});

test("extrae el destino de la página real (fixture)", () => {
  assert.equal(extractDestination(read("fixtures", "go-redirect.html")), DEST);
});

test("extrae el destino desde <meta http-equiv=refresh>", () => {
  assert.equal(extractDestination(`<head><meta http-equiv="Refresh" content="4; url=${DEST}"></head>`), DEST);
});

test("extrae el destino desde un data-attribute", () => {
  assert.equal(extractDestination(`<body><div data-url="${DEST}"></div></body>`), DEST);
});

test("extrae el destino desde JavaScript en línea", () => {
  const esc = DEST.replace(/\//g, "\\/");
  assert.equal(extractDestination(`<body><script>window.location.href = "${esc}";</script></body>`), DEST);
});

test("extrae el destino desde el texto visible, ignorando scripts", () => {
  const html = `<body><span>${DEST}</span><script>var a="https://www.google-analytics.com/a"</script></body>`;
  assert.equal(extractDestination(html), DEST);
});

test("devuelve null si solo hay enlaces propios o no hay URL", () => {
  assert.equal(extractDestination('<body><a href="https://go.aftvnews.com">HOME</a></body>'), null);
  assert.equal(extractDestination("<body>Not found</body>"), null);
});

test("ignora esquemas no http(s)", () => {
  assert.equal(extractDestination('<body><a href="javascript:alert(1)">javascript:alert(1)</a></body>'), null);
});

test("resolveDestination usa BASE + código y devuelve el destino", async () => {
  let requested;
  window.fetch = async (url) => {
    requested = url;
    return { status: 200, text: async () => read("fixtures", "go-redirect.html") };
  };
  const res = await resolveDestination("8493022");
  assert.equal(requested, "https://aftv.news/8493022");
  assert.deepEqual({ status: res.status, destination: res.destination }, { status: 200, destination: DEST });
});

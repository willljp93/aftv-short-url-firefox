// Busca en el HTML de go.aftvnews.com/<código> la URL final (la página intermedia "Redirecting in 4 seconds to:").
const OWN_HOSTS = /(^|\.)(aftvnews\.com|aftv\.news)$/i;

function isExternal(u) {
  try {
    const x = new URL(u);
    return /^https?:$/.test(x.protocol) && !OWN_HOSTS.test(x.hostname);
  } catch (_) {
    return false;
  }
}

function cleanUrl(u) {
  return u.replace(/\\\//g, "/").replace(/[)\].,;'"]+$/, "");
}

function extractDestination(html) {
  const doc = new DOMParser().parseFromString(html, "text/html"); // no ejecuta scripts ni carga recursos

  // 1. <meta http-equiv="refresh" content="4; url=...">
  const meta = doc.querySelector('meta[http-equiv="refresh" i]');
  const mm = meta && /url\s*=\s*['"]?([^'"\s]+)/i.exec(meta.getAttribute("content") || "");
  if (mm && isExternal(cleanUrl(mm[1]))) return cleanUrl(mm[1]);

  // 2. enlace cuyo texto visible es la URL (el enlace naranja)
  for (const a of doc.querySelectorAll("a[href]")) {
    const t = a.textContent.trim();
    if (/^https?:\/\//i.test(t) && isExternal(t)) return cleanUrl(t);
  }

  // 3. atributos data-* típicos
  for (const el of doc.querySelectorAll("[data-url],[data-href],[data-redirect],[data-target]")) {
    for (const n of ["data-url", "data-href", "data-redirect", "data-target"]) {
      const v = el.getAttribute(n);
      if (v && isExternal(v)) return cleanUrl(v);
    }
  }

  // 4. JavaScript en línea: location = "https://..."
  for (const s of doc.querySelectorAll("script:not([src])")) {
    const j = /location(?:\.href|\.assign\(|\.replace\()?\s*=?\s*\(?\s*["'](https?:[^"']+)["']/i.exec(s.textContent);
    if (j && isExternal(cleanUrl(j[1]))) return cleanUrl(j[1]);
  }

  // 5. primera URL externa en el texto visible
  doc.querySelectorAll("script,style,noscript").forEach((n) => n.remove());
  const text = (doc.body && doc.body.textContent) || "";
  for (const x of text.matchAll(/https?:\/\/[^\s"'<>]+/g)) {
    const c = cleanUrl(x[0]);
    if (isExternal(c)) return c;
  }
  return null;
}

// Descarga la página intermedia del acortador y devuelve { status, destination } sin abrir el destino.
async function resolveDestination(code) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(BASE + code, {
      cache: "no-store",
      credentials: "omit",
      redirect: "follow",
      signal: ctrl.signal
    });
    const html = await res.text();
    return { status: res.status, destination: extractDestination(html) };
  } finally {
    clearTimeout(timer);
  }
}

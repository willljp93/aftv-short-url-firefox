// Acepta "12345", "aftv.news/12345", "https://aftv.news/12345" o "go.aftvnews.com/12345".
const BASE = "https://aftv.news/";

function parseCode(input) {
  const m = String(input || "")
    .trim()
    .match(/^(?:(?:https?:\/\/)?(?:aftv\.news|go\.aftvnews\.com)\/)?(\d{1,12})\/?$/i);
  return m ? m[1] : null;
}

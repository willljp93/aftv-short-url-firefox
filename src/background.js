// Barra de direcciones: escribe "aftv 12345" y pulsa Enter.
browser.omnibox.setDefaultSuggestion({
  description: "Abrir código de AFTVnews (ej.: aftv 12345)"
});

browser.omnibox.onInputEntered.addListener(async (text, disposition) => {
  const code = parseCode(text);
  if (!code) return;
  let url = BASE + code;
  try {
    const { direct } = await browser.storage.local.get("direct");
    if (direct) {
      const { destination } = await resolveDestination(code);
      if (destination) url = destination;
    }
  } catch (_) {}
  if (disposition === "currentTab") {
    browser.tabs.update({ url });
  } else {
    browser.tabs.create({ url, active: disposition !== "newBackgroundTab" });
  }
});

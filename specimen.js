const state = {
  fonts: [],
  visible: [],
  pinned: new Set(JSON.parse(localStorage.getItem("type-lab:pinned") || "[]")),
  favorites: new Set(JSON.parse(localStorage.getItem("type-lab:favorites") || "[]")),
  axisValues: {},
  project: null,
  customText: "",
  view: "specimens",
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeFamily = (family) => JSON.stringify(family || "serif");
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
})[character]);
const categoryNames = {
  "editorial-literary": "Editorial / literary",
  "ui-body": "UI / body",
  "technical-system": "Technical / system",
  experimental: "Experimental",
  "archival-institutional": "Archival / institutional",
  "early-digital-internet": "Early digital / internet",
  "display-atmospheric": "Display / atmospheric",
  vernacular: "Vernacular",
  wildcards: "Wildcards",
};

const controls = {
  search: $("#search"), category: $("#category-filter"), foundry: $("#foundry-filter"),
  license: $("#license-filter"), format: $("#format-filter"), type: $("#type-filter"),
  size: $("#size"), line: $("#line-height"), tracking: $("#tracking"), weight: $("#weight"),
  uppercase: $("#uppercase"), lowercase: $("#lowercase"), italic: $("#italic"),
  ligatures: $("#ligatures"), dark: $("#dark-context"), pinnedOnly: $("#pinned-only"),
  foreground: $("#foreground"), background: $("#background"), custom: $("#custom-text"),
};

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json();
}

async function init() {
  try {
    const metadata = await loadJson("metadata.json");
    const presetFiles = ["projects/default.json", "projects/example-project.json"];
    const presets = await Promise.all(presetFiles.map(loadJson));
    state.fonts = metadata.fonts || [];
    validateMetadata(state.fonts);
    installFontFaces(state.fonts);
    setupOptions(metadata.categories || [], state.fonts, presets);
    await setProject(presets[0]);
    bindEvents(presets);
    applyFilters();
  } catch (error) {
    showNotice(`Could not load the lab data. ${error.message}`);
  }
}

function validateMetadata(fonts) {
  const ids = new Set();
  for (const font of fonts) {
    if (!font.id || ids.has(font.id)) throw new Error(`Font records require unique ids (${font.id || "missing"}).`);
    ids.add(font.id);
    if (!font.familyName || !font.sourceUrl || !Array.isArray(font.categories)) {
      throw new Error(`Incomplete font record: ${font.id}`);
    }
    if (!font.binaryDownloaded || !font.localFontPath) throw new Error(`Type Lab only accepts local font files: ${font.id}`);
  }
}

function installFontFaces(fonts) {
  const style = document.createElement("style");
  style.dataset.localFonts = "";
  style.textContent = fonts.filter((font) => font.binaryDownloaded && font.localFontPath).map((font) => {
    const format = font.localFontPath.endsWith(".woff2") ? "woff2" : font.localFontPath.endsWith(".woff") ? "woff" : font.localFontPath.endsWith(".ttf") ? "truetype" : "opentype";
    const weight = font.variableFont && font.variableAxes?.find((axis) => axis.tag === "wght")
      ? `${font.variableAxes.find((axis) => axis.tag === "wght").min} ${font.variableAxes.find((axis) => axis.tag === "wght").max}`
      : font.cssWeight || 400;
    return `@font-face{font-family:${escapeFamily(font.familyName)};src:url(${JSON.stringify(font.localFontPath)}) format(${JSON.stringify(format)});font-style:${font.cssStyle || "normal"};font-weight:${weight};font-display:swap;}`;
  }).join("\n");
  document.head.append(style);
}

function setupOptions(categories, fonts, presets) {
  for (const category of categories) $("#category-filter").add(new Option(categoryNames[category] || category, category));
  const foundries = [...new Set(fonts.map((font) => font.foundry).filter(Boolean))].sort();
  for (const foundry of foundries) $("#foundry-filter").add(new Option(foundry, foundry));
  const licenses = [...new Set(fonts.map((font) => font.licenseStatus).filter(Boolean))].sort();
  for (const license of licenses) $("#license-filter").add(new Option(license, license));
  for (const preset of presets) $("#project-select").add(new Option(preset.projectName, preset.id));
}

async function setProject(project) {
  state.project = project;
  const palette = project.palette;
  controls.foreground.value = palette.foreground;
  controls.background.value = palette.background;
  document.documentElement.style.setProperty("--fg", palette.foreground);
  document.documentElement.style.setProperty("--bg", palette.background);
  document.documentElement.style.setProperty("--panel", palette.panel);
  document.documentElement.style.setProperty("--accent", palette.accent);
  applyFilters();
}

function bindEvents(presets) {
  for (const control of [controls.search, controls.category, controls.foundry, controls.license, controls.format, controls.type, controls.pinnedOnly]) {
    control.addEventListener("input", applyFilters);
  }
  $("#project-select").addEventListener("change", (event) => setProject(presets.find((preset) => preset.id === event.target.value)));
  for (const control of [controls.size, controls.line, controls.tracking, controls.weight, controls.uppercase, controls.lowercase, controls.italic, controls.ligatures]) {
    control.addEventListener("input", applyTypographyControls);
  }
  controls.uppercase.addEventListener("change", () => { if (controls.uppercase.checked) controls.lowercase.checked = false; applyTypographyControls(); });
  controls.lowercase.addEventListener("change", () => { if (controls.lowercase.checked) controls.uppercase.checked = false; applyTypographyControls(); });
  controls.dark.addEventListener("change", toggleContext);
  controls.foreground.addEventListener("input", applyColors);
  controls.background.addEventListener("input", applyColors);
  $("#apply-custom").addEventListener("click", () => { state.customText = controls.custom.value.trim(); renderAll(); });
  $("#clear-custom").addEventListener("click", () => { controls.custom.value = ""; state.customText = ""; renderAll(); });
  $("#unpin-all").addEventListener("click", unpinAll);
  $("#print-view").addEventListener("click", () => window.print());
  $$(".view-tabs [data-view]").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  $("#component-font").addEventListener("change", renderComponents);
  document.addEventListener("keydown", keyboardControls);
}

function keyboardControls(event) {
  if (event.target.matches("input, textarea, select")) return;
  if (event.key === "/") { event.preventDefault(); controls.search.focus(); }
  if (event.key.toLowerCase() === "p") { controls.pinnedOnly.checked = !controls.pinnedOnly.checked; applyFilters(); }
  if (event.key.toLowerCase() === "d") { controls.dark.checked = !controls.dark.checked; toggleContext(); }
}

function applyFilters() {
  const query = controls.search.value.trim().toLowerCase();
  state.visible = state.fonts.filter((font) => {
    const haystack = [font.fontName, font.familyName, font.designer, font.foundry, font.description, font.notes, font.reasonsInteresting, font.discoveredVia?.name, ...(font.useCases || [])].join(" ").toLowerCase();
    return (!query || haystack.includes(query))
      && (!controls.category.value || font.categories.includes(controls.category.value))
      && (!controls.foundry.value || font.foundry === controls.foundry.value)
      && (!controls.license.value || font.licenseStatus === controls.license.value)
      && (!controls.format.value || (controls.format.value === "variable") === Boolean(font.variableFont))
      && (!controls.type.value || font.type === controls.type.value)
      && (!controls.pinnedOnly.checked || state.pinned.has(font.id));
  });
  renderAll();
}

function renderAll() {
  renderStats();
  renderFontGrid();
  renderFavorites();
  renderComparison();
  renderComponentFontOptions();
  renderComponents();
  renderAxisControls();
  applyTypographyControls();
}

function renderStats() {
  $("#candidate-count").textContent = state.fonts.length;
  $("#pinned-count").textContent = state.pinned.size;
  $("#visible-count").textContent = state.visible.length;
}

function fontStyle(font) {
  const axes = state.axisValues[font.id] || {};
  const variation = Object.entries(axes).map(([tag, value]) => `"${tag}" ${value}`).join(", ");
  return `font-family:${escapeFamily(font.familyName)}, serif;font-weight:${controls.weight.value};${variation ? `font-variation-settings:${variation};` : ""}`;
}

function renderFontGrid() {
  const grid = $("#font-grid");
  grid.replaceChildren();
  if (!state.visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = state.fonts.length
      ? `<div><strong>No matches.</strong><p>Change the filters or leave pinned-only mode.</p></div>`
      : `<div><strong>Ready for the first research pass.</strong><p>Add verified candidates to <code>metadata.json</code>. Legally testable binaries belong in <code>fonts/</code>; restricted candidates remain reference-only.</p></div>`;
    grid.append(empty);
    return;
  }
  state.visible.forEach((font, index) => grid.append(createFontCard(font, index)));
}

function createFontCard(font, index) {
  const card = $("#font-card-template").content.firstElementChild.cloneNode(true);
  card.dataset.fontId = font.id;
  card.classList.toggle("is-pinned", state.pinned.has(font.id));
  card.style.cssText = fontStyle(font);
  $(".font-index", card).textContent = String(index + 1).padStart(2, "0");
  $(".font-title", card).textContent = font.fontName;
  $(".font-credit", card).textContent = [font.designer, font.foundry].filter(Boolean).join(" / ");
  const pin = $(".pin-button", card);
  pin.setAttribute("aria-pressed", String(state.pinned.has(font.id)));
  pin.textContent = state.pinned.has(font.id) ? "Pinned" : "Pin";
  pin.addEventListener("click", () => togglePin(font.id));
  const favorite = $(".favorite-button", card);
  const isFavorite = state.favorites.has(font.id);
  favorite.setAttribute("aria-pressed", String(isFavorite));
  favorite.setAttribute("aria-label", isFavorite ? "Remove from favorites" : "Add to favorites");
  favorite.addEventListener("click", () => toggleFavorite(font.id));
  const tags = $(".tag-row", card);
  [...font.categories, font.type, ...(font.variableFont ? ["variable"] : [])].filter(Boolean).forEach((tag) => {
    const span = document.createElement("span");
    span.className = `tag ${tag === "variable" ? "variable" : ""}`;
    span.textContent = categoryNames[tag] || tag;
    tags.append(span);
  });
  const permissionClass = font.commercialUseStatus === "permitted" && font.webUseStatus === "permitted" ? "ok" : "warn";
  $(".license-row", card).innerHTML = `<span class="${permissionClass}">${escapeHtml(font.licenseStatus || "unclear")}</span> · ${escapeHtml(font.licenseName || "License not confirmed")} · local binary`;
  $(".font-description", card).textContent = font.description || font.reasonsInteresting || "";
  renderSizeRows($(".size-specimens", card));
  renderFunctionalBlocks($(".functional-specimens", card));
  renderFontMeta($(".font-meta", card), font);
  return card;
}

function sample(key) { return escapeHtml(state.customText || state.project.sampleStrings[key]); }

function renderSizeRows(container) {
  for (const size of state.project.defaultFontSizes) {
    const row = document.createElement("div");
    row.className = "size-row";
    row.innerHTML = `<span class="size-label">${size}px</span><span class="size-text specimen-content" style="font-size:${size}px">${sample(size >= 48 ? "display" : size >= 24 ? "heading" : "body")}</span>`;
    container.append(row);
  }
}

function renderFunctionalBlocks(container) {
  const blocks = [
    ["Uppercase / lowercase", "Aa Bb Cc Dd Ee Ff Gg — THE ARCHIVE / the archive", "large"],
    ["Numerals / punctuation / symbols", "0123456789  $ € £ ¥  @ # % & * + = ? ! [ ] { } ( )", ""],
    ["Interface", `${sample("status")} ${state.project.mockLabels.button}`, ""],
    ["Data / metadata", `${sample("data")} · ${sample("technical")}`, ""],
    ["Body", sample("body"), ""],
    ["Web / identity", "archive.example/index?record=047 · @USER-00481 · 2026-08-21 03:18:44 UTC", ""],
  ];
  for (const [label, text, className] of blocks) {
    const block = document.createElement("div");
    block.className = "functional-block";
    block.innerHTML = `<p class="functional-label">${label}</p><p class="functional-text specimen-content ${className}">${text}</p>`;
    container.append(block);
  }
}

function renderFontMeta(container, font) {
  const weights = (font.availableWeights || []).join(", ") || "not recorded";
  const styles = (font.availableStyles || []).join(", ") || "not recorded";
  const formats = (font.availableFormats || []).join(", ") || "not recorded";
  const axes = (font.variableAxes || []).map((axis) => `${axis.tag} ${axis.min}–${axis.max}`).join(", ") || "none";
  container.innerHTML = `<span>WEIGHTS ${escapeHtml(weights)}</span><span>STYLES ${escapeHtml(styles)} · ITALIC ${escapeHtml(font.italicAvailability ?? "unknown")}</span><span>FORMATS ${escapeHtml(formats)} · AXES ${escapeHtml(axes)}</span><span>LANGUAGES ${escapeHtml(font.languageSupport || "not recorded")}</span><span>FEATURES ${escapeHtml((font.openTypeFeatures || []).join(", ") || "not recorded")}</span>`;
  const link = document.createElement("a");
  link.href = font.sourceUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = `Official source ↗`;
  container.append(link);
  if (font.discoveredVia) {
    const via = document.createElement("a");
    via.href = font.discoveredVia.url;
    via.target = "_blank";
    via.rel = "noreferrer";
    via.textContent = `Via ${font.discoveredVia.name} ↗`;
    container.append(via);
  }
}

function togglePin(id) {
  if (state.pinned.has(id)) state.pinned.delete(id);
  else state.pinned.add(id);
  localStorage.setItem("type-lab:pinned", JSON.stringify([...state.pinned]));
  if (controls.pinnedOnly.checked) applyFilters(); else renderAll();
}

function unpinAll() {
  state.pinned.clear();
  localStorage.setItem("type-lab:pinned", "[]");
  if (controls.pinnedOnly.checked) applyFilters(); else renderAll();
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  localStorage.setItem("type-lab:favorites", JSON.stringify([...state.favorites]));
  renderAll();
}

function renderFavorites() {
  const grid = $("#favorites-grid");
  if (!grid) return;
  grid.replaceChildren();
  const fonts = state.fonts.filter((font) => state.favorites.has(font.id));
  if (!fonts.length) {
    grid.innerHTML = `<div class="empty-state"><div><strong>No favorites.</strong><p>Use the star on a font to save it here.</p></div></div>`;
    return;
  }
  fonts.forEach((font, index) => grid.append(createFontCard(font, index)));
}

function renderComparison() {
  const fonts = state.fonts.filter((font) => state.pinned.has(font.id));
  const grid = $("#comparison-grid");
  grid.replaceChildren();
  $("#unpin-all").disabled = !fonts.length;
  grid.style.setProperty("--compare-count", Math.max(1, Math.min(fonts.length, 4)));
  if (!fonts.length) {
    grid.innerHTML = `<div class="empty-state"><div><strong>Nothing pinned.</strong><p>Pin candidates from the specimen view to compare them here.</p></div></div>`;
    return;
  }
  fonts.forEach((font) => {
    const column = document.createElement("article");
    column.className = "compare-column";
    column.style.cssText = fontStyle(font);
    column.innerHTML = `<header><h2>${escapeHtml(font.fontName)}</h2><p>${escapeHtml(font.foundry || font.designer || "")}</p></header>`;
    const lines = [
      ["DISPLAY / 64", sample("display"), 64], ["HEADING / 32", sample("heading"), 32],
      ["BODY / 15", sample("body"), 15], ["INTERFACE / 12", sample("status"), 12],
      ["DATA", sample("data"), 15], ["TECHNICAL", sample("technical"), 15],
    ];
    lines.forEach(([label, text, size]) => {
      const line = document.createElement("div");
      line.className = "compare-line specimen-content";
      line.style.fontSize = `${size}px`;
      line.innerHTML = `<small>${label}</small>${text}`;
      column.append(line);
    });
    const controlled = document.createElement("div");
    controlled.className = "compare-line specimen-content user-controlled";
    controlled.innerHTML = `<small>CONTROLLED SPECIMEN</small>${state.customText || sample("heading")}`;
    column.append(controlled);
    grid.append(column);
  });
}

function renderComponentFontOptions() {
  const select = $("#component-font");
  const previous = select.value;
  select.replaceChildren(new Option("Interface fallback", ""));
  const candidates = state.fonts.filter((font) => state.pinned.has(font.id));
  (candidates.length ? candidates : state.visible).forEach((font) => select.add(new Option(font.fontName, font.id)));
  if ([...select.options].some((option) => option.value === previous)) select.value = previous;
}

function renderComponents() {
  const selected = state.fonts.find((font) => font.id === $("#component-font").value);
  document.documentElement.style.setProperty("--preview-family", selected ? escapeFamily(selected.familyName) : '"Arial Narrow", Arial, sans-serif');
  const rawStrings = state.project?.sampleStrings;
  const s = rawStrings && Object.fromEntries(Object.entries(rawStrings).map(([key, value]) => [key, escapeHtml(value)]));
  if (!s) return;
  const label = Object.fromEntries(Object.entries(state.project.mockLabels).map(([key, value]) => [key, escapeHtml(value)]));
  const mocks = [
    ["Navigation bar", `<div class="mock-nav"><b>${label.nav.split("  ")[0]}</b><span>${label.nav.split("  ").slice(1).join("　")}</span></div>`],
    ["Sidebar navigation", `<div class="mock-sidebar"><nav><span>INDEX</span><span>STATUS</span><span>RECORDS</span></nav><div><h3>${s.heading}</h3><p>${s.body}</p></div></div>`],
    ["Social / feed post", `<p class="feed-meta">@USER-00481 · 03:18 UTC</p><h3>${s.heading}</h3><p>${s.body}</p>`],
    ["Profile header", `<div class="profile-mark"></div><h3>USER-00481</h3><p>${s.status}</p>`],
    ["Notification item", `<div class="notification"><i></i><div><p>${s.heading}</p><p class="notification-meta">Last updated 03:18 UTC.</p></div></div><div class="notification"><i></i><div><p>${label.offline}</p><p class="notification-meta">VOICE 047</p></div></div>`],
    ["Message thread", `<p class="message-meta">VOICE 047 · 03:18</p><div class="message">${s.status}</div><div class="message reply">No action is required.</div>`],
    ["Settings panel", `<h3>Settings</h3><div class="setting"><span>Notifications</span><input type="checkbox" checked></div><div class="setting"><span>Archive state</span><b>ACTIVE</b></div><div class="setting"><span>Index interval</span><b>15 MIN</b></div>`],
    ["Analytics / data panel", `<p>${s.data}</p><div class="data-grid"><div><small>ACTIVE</small><b>047</b></div><div><small>BLOCK</small><b>318</b></div><div><small>RATE</small><b>8.4</b></div></div>`],
    ["Article / editorial header", `<p class="editorial-kicker">Filed 2026-08-21</p><h3>${s.display}</h3><hr class="editorial-rule"><p>${s.body}</p>`],
    ["Media-library card", `<div class="media-thumb">VOICE 047</div><h3>archive_0047_final.wav</h3><p>03:18 · WAV · 48 kHz</p>`],
    ["Collectible / artifact card", `<div class="artifact-number">047</div><h3>${s.heading}</h3><p>Accession 2026.31891332</p>`],
    ["Technical / system-status panel", `<p><span class="status-led"></span>${label.offline}</p><h3>${s.technical}</h3><p>${s.status}</p>`],
    ["Marketing hero", `<div class="hero"><h3>${s.display}</h3><div><p>${s.body}</p><button>${label.button}</button></div></div>`],
    ["Small mobile UI preview", `<div class="mobile-shell"><header>03:18　USER-00481</header><div class="mobile-row"><b>${s.heading}</b><p>${s.status}</p></div><div class="mobile-row">${s.data}</div><button>${label.button}</button></div>`],
  ];
  const grid = $("#component-grid");
  grid.replaceChildren();
  mocks.forEach(([name, content]) => {
    const article = document.createElement("article");
    article.className = "mock specimen-content";
    article.innerHTML = `<p class="mock-label">${name}</p>${content}`;
    grid.append(article);
  });
}

function renderAxisControls() {
  const font = state.fonts.find((candidate) => state.pinned.has(candidate.id) && candidate.variableFont)
    || state.visible.find((candidate) => candidate.variableFont);
  const section = $("#axis-controls");
  const list = $("#axis-list");
  list.replaceChildren();
  section.hidden = !font?.variableAxes?.length;
  if (!font?.variableAxes?.length) return;
  if (!state.axisValues[font.id]) state.axisValues[font.id] = {};
  font.variableAxes.forEach((axis) => {
    const value = state.axisValues[font.id][axis.tag] ?? axis.default;
    state.axisValues[font.id][axis.tag] = value;
    const label = document.createElement("label");
    label.className = "axis-control";
    label.innerHTML = `${axis.name || axis.tag} <span>${axis.tag} ${value}</span><input type="range" min="${axis.min}" max="${axis.max}" step="${axis.step || 1}" value="${value}">`;
    $("input", label).addEventListener("input", (event) => {
      state.axisValues[font.id][axis.tag] = Number(event.target.value);
      $("span", label).textContent = `${axis.tag} ${event.target.value}`;
      renderFontGrid(); renderComparison();
    });
    list.append(label);
  });
}

function applyTypographyControls() {
  document.documentElement.style.setProperty("--specimen-size", `${controls.size.value}px`);
  document.documentElement.style.setProperty("--specimen-leading", controls.line.value);
  document.documentElement.style.setProperty("--specimen-tracking", `${controls.tracking.value}em`);
  $("#size-value").textContent = `${controls.size.value}px`;
  $("#line-value").textContent = controls.line.value;
  $("#tracking-value").textContent = `${controls.tracking.value}em`;
  document.body.classList.toggle("transformed", controls.uppercase.checked || controls.lowercase.checked);
  document.body.classList.toggle("lower", controls.lowercase.checked);
  document.body.classList.toggle("italicized", controls.italic.checked);
  document.body.classList.toggle("no-ligatures", !controls.ligatures.checked);
  $$(".font-card, .compare-column").forEach((element) => {
    element.style.fontWeight = controls.weight.value;
    element.style.fontStyle = controls.italic.checked ? "italic" : "normal";
  });
}

function applyColors() {
  document.documentElement.style.setProperty("--fg", controls.foreground.value);
  document.documentElement.style.setProperty("--bg", controls.background.value);
}

function toggleContext() {
  const foreground = controls.foreground.value;
  controls.foreground.value = controls.background.value;
  controls.background.value = foreground;
  applyColors();
}

function switchView(view) {
  state.view = view;
  $$(".view-tabs [data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  $$(".view").forEach((section) => section.classList.remove("active"));
  $(`#${view}-view`).classList.add("active");
}

function showNotice(message) {
  const notice = $("#notice");
  notice.textContent = message;
  notice.classList.add("active");
}

init();

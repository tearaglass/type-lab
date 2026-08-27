import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const read = (name) => readFile(new URL(name, import.meta.url), "utf8");

test("ships the isolated lab structure", async () => {
  const [html, css, js, metadata, preset] = await Promise.all([
    read("specimen.html"), read("specimen.css"), read("specimen.js"), read("metadata.json"), read("projects/default.json"),
  ]);
  assert.match(html, /Typography Research Lab/);
  assert.match(html, /Pinned comparison/);
  assert.match(html, /Unpin all/);
  assert.match(html, /Mock components/);
  assert.match(css, /@media print/);
  assert.match(js, /localStorage\.setItem\("type-lab:pinned"/);
  assert.match(js, /font-variation-settings/);
  assert.match(js, /Type Lab only accepts local font files/);
  assert.match(js, /state\.pinned\.clear\(\)/);
  assert.ok(JSON.parse(metadata).fonts.length >= 320);
  assert.equal(JSON.parse(preset).defaultFontSizes.join(","), "12,15,18,24,32,48,64");
});

test("catalog contains only local specimens", async () => {
  const metadata = JSON.parse(await read("metadata.json"));
  assert.ok(metadata.fonts.every((font) => font.binaryDownloaded && font.localFontPath));
  assert.ok(metadata.fonts.some((font) => font.sourceSite === "Velvetyne Type Foundry"));
  assert.ok(metadata.fonts.some((font) => font.fontName === "Caveat"));
  assert.ok(metadata.fonts.some((font) => font.fontName === "Great Vibes"));
});

test("research pass is heterogeneous and keeps restricted binaries out", async () => {
  const metadata = JSON.parse(await read("metadata.json"));
  const ids = new Set(metadata.fonts.map((font) => font.id));
  assert.equal(ids.size, metadata.fonts.length);

  for (const category of metadata.categories) {
    assert.ok(metadata.fonts.some((font) => font.categories.includes(category)), `missing candidate for ${category}`);
  }

  for (const font of metadata.fonts) {
    assert.ok(font.sourceUrl.startsWith("https://"));
    assert.ok(font.licenseName);
    assert.ok(font.licenseUrl);
    assert.equal(font.binaryDownloaded, true);
    assert.ok(font.localFontPath);
    assert.ok(["free-open-source", "free-restricted", "personal-use-only"].includes(font.licenseStatus));
    await access(new URL(font.localFontPath, import.meta.url));
  }
});

test("includes all requested research categories and mock contexts", async () => {
  const metadata = JSON.parse(await read("metadata.json"));
  const js = await read("specimen.js");
  assert.equal(metadata.categories.length, 9);
  for (const category of ["editorial-literary", "ui-body", "technical-system", "experimental", "archival-institutional", "early-digital-internet", "display-atmospheric", "vernacular", "wildcards"]) {
    assert.ok(metadata.categories.includes(category));
  }
  for (const context of ["Navigation bar", "Sidebar navigation", "Social / feed post", "Profile header", "Notification item", "Message thread", "Settings panel", "Analytics / data panel", "Article / editorial header", "Media-library card", "Collectible / artifact card", "Technical / system-status panel", "Marketing hero", "Small mobile UI preview"]) {
    assert.match(js, new RegExp(context.replace(/\//g, "\\$&")));
  }
});

test("metadata schema requires provenance and licensing fields", async () => {
  const schema = JSON.parse(await read("metadata.schema.json"));
  const required = schema.properties.fonts.items.required;
  for (const field of ["sourceUrl", "licenseName", "licenseUrl", "commercialUseStatus", "webUseStatus", "binaryDownloaded", "localFontPath", "reasonsInteresting"]) {
    assert.ok(required.includes(field));
  }
});

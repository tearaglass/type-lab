import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL(".", import.meta.url);
const metadataUrl = new URL("metadata.json", root);
const backupUrl = new URL("backups/metadata.before-90-open-fonts-2026-08-26.json", root);
const catalog = JSON.parse(await readFile(metadataUrl, "utf8"));
const existingFamilies = new Set(catalog.fonts.map((font) => font.familyName.toLowerCase()));
const today = new Date().toISOString().slice(0, 10);

await mkdir(new URL("backups/", root), { recursive: true });
try {
  await access(backupUrl);
} catch {
  await copyFile(metadataUrl, backupUrl);
}

const googleMetadata = await fetch("https://fonts.google.com/metadata/fonts").then((response) => {
  if (!response.ok) throw new Error(`Could not load Google Fonts metadata: ${response.status}`);
  return response.json();
});

const categoryRank = { Handwriting: 0, Display: 1, Serif: 2, "Sans Serif": 3, Monospace: 4 };
const candidates = googleMetadata.familyMetadataList
  .filter((font) => font.isOpenSource && font.subsets.includes("latin") && !existingFamilies.has(font.family.toLowerCase()))
  .sort((a, b) => (categoryRank[a.category] ?? 5) - (categoryRank[b.category] ?? 5) || a.defaultSort - b.defaultSort)
  .slice(0, 90);

if (candidates.length !== 90) throw new Error(`Only found ${candidates.length} new openly licensed Google Fonts.`);

for (const font of candidates) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family).replace(/%20/g, "+")}:wght@400`;
  const css = await fetch(cssUrl, { headers: { "User-Agent": "Mozilla/5.0" } }).then((response) => {
    if (!response.ok) throw new Error(`Could not read ${font.family} CSS: ${response.status}`);
    return response.text();
  });
  const sourceUrl = css.match(/url\((https:\/\/[^)]+\.(?:woff2|ttf))\)/)?.[1];
  if (!sourceUrl) throw new Error(`Could not find a local webfont file for ${font.family}`);

  const extension = sourceUrl.endsWith(".woff2") ? "woff2" : "ttf";
  const slug = font.family.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const relativePath = `fonts/google/${slug}/${slug}-regular.${extension}`;
  const targetDir = new URL(`fonts/google/${slug}/`, root);
  await mkdir(targetDir, { recursive: true });
  const binary = await fetch(sourceUrl).then((response) => {
    if (!response.ok) throw new Error(`Could not download ${font.family}: ${response.status}`);
    return response.arrayBuffer();
  });
  await writeFile(new URL(`${slug}-regular.${extension}`, targetDir), Buffer.from(binary));

  catalog.fonts.push({
    id: `google-${slug}`,
    fontName: font.family,
    familyName: font.family,
    designer: font.designers?.join(", ") || null,
    foundry: "Google Fonts",
    sourceSite: "Google Fonts",
    sourceUrl: `https://fonts.google.com/specimen/${encodeURIComponent(font.family).replace(/%20/g, "+")}`,
    categories: font.category === "Handwriting" ? ["display-atmospheric", "vernacular"] : font.category === "Display" ? ["display-atmospheric", "experimental"] : font.category === "Serif" ? ["editorial-literary"] : ["ui-body"],
    type: font.category === "Serif" ? "serif" : font.category === "Monospace" ? "mono" : font.category === "Display" || font.category === "Handwriting" ? "display" : "sans",
    description: "",
    useCases: [],
    availableWeights: ["Regular"],
    availableStyles: ["Roman"],
    italicAvailability: false,
    variableFont: false,
    variableAxes: [],
    openTypeFeatures: [],
    availableFormats: [extension.toUpperCase()],
    languageSupport: font.subsets.join(", "),
    licenseName: "SIL Open Font License 1.1",
    licenseUrl: "https://openfontlicense.org/",
    licenseStatus: "free-open-source",
    commercialUseStatus: "permitted",
    webUseStatus: "permitted",
    permissions: { desktop: "permitted", web: "permitted", app: "permitted", commercial: "permitted", redistribution: "with-license" },
    binaryDownloaded: true,
    localFontPath: relativePath,
    price: null,
    notes: "",
    reasonsInteresting: "",
    researchDate: today,
    cssWeight: 400,
  });
  existingFamilies.add(font.family.toLowerCase());
}

catalog.lastUpdated = today;
catalog.researchPass = 7;
await writeFile(metadataUrl, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Added ${candidates.length} local Google Fonts; catalog now has ${catalog.fonts.length} local specimens.`);

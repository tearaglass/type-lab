import fs from "node:fs/promises";

const root = new URL(".", import.meta.url);
const metadataPath = new URL("metadata.json", root);
const catalog = JSON.parse(await fs.readFile(metadataPath, "utf8"));
const googleMetadata = await fetch("https://fonts.google.com/metadata/fonts").then((response) => response.json());
const candidates = googleMetadata.familyMetadataList
  .filter((font) => font.isOpenSource && font.subsets.includes("latin"))
  .sort((a, b) => a.defaultSort - b.defaultSort)
  .slice(0, 80);

const existingNames = new Set(catalog.fonts.map((font) => font.familyName.toLowerCase()));
const categories = ["ui-body", "editorial-literary", "technical-system", "experimental", "archival-institutional", "vernacular"];
const today = new Date().toISOString().slice(0, 10);

for (const [index, font] of candidates.entries()) {
  if (existingNames.has(font.family.toLowerCase())) continue;
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family).replace(/%20/g, "+")}:wght@400`;
  const css = await fetch(cssUrl, { headers: { "User-Agent": "Mozilla/5.0" } }).then((response) => response.text());
  const match = css.match(/url\((https:\/\/[^)]+\.(?:woff2|ttf))\)/);
  if (!match) continue;
  const slug = font.family.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const extension = match[1].endsWith(".woff2") ? "woff2" : "ttf";
  const relativePath = `fonts/google/${slug}/${slug}-regular.${extension}`;
  const target = new URL(relativePath, root);
  await fs.mkdir(new URL(`fonts/google/${slug}/`, root), { recursive: true });
  const binary = await fetch(match[1]).then((response) => response.arrayBuffer());
  await fs.writeFile(target, Buffer.from(binary));
  const category = categories[index % categories.length];
  catalog.fonts.push({
    id: `google-${slug}`,
    fontName: font.family,
    familyName: font.family,
    designer: font.designers?.join(", ") || null,
    foundry: "Google Fonts",
    sourceSite: "Google Fonts",
    sourceUrl: `https://fonts.google.com/specimen/${encodeURIComponent(font.family).replace(/%20/g, "+")}`,
    categories: [category],
    type: font.category === "Serif" ? "serif" : font.category === "Monospace" ? "mono" : font.category === "Display" ? "display" : "sans",
    description: `${font.family} is a locally bundled open-source family selected for breadth in the type lab.`,
    useCases: [category.replace(/-/g, " ")],
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
    notes: "Imported as one local Regular webfont cut from Google Fonts.",
    reasonsInteresting: "Adds a distinct open-source family to the lab’s broader comparison field.",
    researchDate: today,
    cssWeight: 400,
  });
  existingNames.add(font.family.toLowerCase());
}

catalog.lastUpdated = today;
catalog.researchPass = 4;
await fs.writeFile(metadataPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Added ${catalog.fonts.filter((font) => font.sourceSite === "Google Fonts").length} Google Fonts records total.`);

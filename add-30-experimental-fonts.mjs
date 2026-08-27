import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL(".", import.meta.url);
const metadataUrl = new URL("metadata.json", root);
const backupUrl = new URL("backups/metadata.before-30-experimental-fonts-2026-08-26.json", root);
const catalog = JSON.parse(await readFile(metadataUrl, "utf8"));
const today = new Date().toISOString().slice(0, 10);
const existingFamilies = new Set(catalog.fonts.map((font) => font.familyName.toLowerCase()));

await mkdir(new URL("backups/", root), { recursive: true });
try {
  await access(backupUrl);
} catch {
  await copyFile(metadataUrl, backupUrl);
}

const openPermissions = { desktop: "permitted", web: "permitted", app: "permitted", commercial: "permitted", redistribution: "with-license" };
const collletttivoCuts = [
  ["Aujournuit Airy", "fonts/collletttivo/aujournuit/Aujournuit-Airy.woff2"],
  ["Aujournuit Condensed", "fonts/collletttivo/aujournuit/Aujournuit-Condensed.woff2"],
  ["Aujournuit Densed", "fonts/collletttivo/aujournuit/Aujournuit-Densed.woff2"],
  ["Aujournuit Wide", "fonts/collletttivo/aujournuit/Aujournuit-Wide.woff2"],
  ["Halibut Condensed", "fonts/collletttivo/halibut/Halibut-CondensedRegular.woff2"],
  ["Halibut Condensed Thin", "fonts/collletttivo/halibut/Halibut-CondensedThin.woff2"],
  ["Halibut Expanded", "fonts/collletttivo/halibut/Halibut-ExpandedRegular.woff2"],
  ["Halibut Expanded Thin", "fonts/collletttivo/halibut/Halibut-ExpandedThin.woff2"],
  ["Ribes Black", "fonts/collletttivo/ribes/Ribes-Black.woff2"],
  ["Ortica Angular Bold", "fonts/collletttivo/ortica/OrticaAngular-Bold.woff2"],
];

for (const [fontName, localFontPath] of collletttivoCuts) {
  catalog.fonts.push({
    id: `collletttivo-${fontName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    fontName,
    familyName: fontName,
    designer: null,
    foundry: "Collletttivo",
    sourceSite: "Collletttivo",
    sourceUrl: "https://www.collletttivo.it/",
    categories: ["experimental", "display-atmospheric"],
    type: "display",
    description: "",
    useCases: [],
    availableWeights: ["Repository cut"],
    availableStyles: ["Repository cut"],
    italicAvailability: false,
    variableFont: false,
    variableAxes: [],
    openTypeFeatures: [],
    availableFormats: ["WOFF2"],
    languageSupport: "Latin",
    licenseName: "SIL Open Font License 1.1",
    licenseUrl: "https://openfontlicense.org/",
    licenseStatus: "free-open-source",
    commercialUseStatus: "permitted",
    webUseStatus: "permitted",
    permissions: openPermissions,
    binaryDownloaded: true,
    localFontPath,
    price: null,
    notes: "",
    reasonsInteresting: "",
    researchDate: today,
    cssWeight: 400,
  });
  existingFamilies.add(fontName.toLowerCase());
}

const metadata = await fetch("https://fonts.google.com/metadata/fonts").then((response) => {
  if (!response.ok) throw new Error(`Could not load Google Fonts metadata: ${response.status}`);
  return response.json();
});
const googleCandidates = metadata.familyMetadataList
  .filter((font) => font.isOpenSource && font.category === "Display" && font.subsets.includes("latin") && !existingFamilies.has(font.family.toLowerCase()))
  .sort((a, b) => a.defaultSort - b.defaultSort)
  .slice(0, 20);

if (googleCandidates.length !== 20) throw new Error(`Only found ${googleCandidates.length} new experimental display families.`);
for (const font of googleCandidates) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family).replace(/%20/g, "+")}:wght@400`, { headers: { "User-Agent": "Mozilla/5.0" } }).then((response) => response.text());
  const sourceUrl = css.match(/url\((https:\/\/[^)]+\.(?:woff2|ttf))\)/)?.[1];
  if (!sourceUrl) throw new Error(`Could not find a local webfont file for ${font.family}`);
  const extension = sourceUrl.endsWith(".woff2") ? "woff2" : "ttf";
  const slug = font.family.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const localFontPath = `fonts/google/${slug}/${slug}-regular.${extension}`;
  const targetDir = new URL(`fonts/google/${slug}/`, root);
  await mkdir(targetDir, { recursive: true });
  const binary = await fetch(sourceUrl).then((response) => response.arrayBuffer());
  await writeFile(new URL(`${slug}-regular.${extension}`, targetDir), Buffer.from(binary));
  catalog.fonts.push({
    id: `google-${slug}`,
    fontName: font.family,
    familyName: font.family,
    designer: font.designers?.join(", ") || null,
    foundry: "Google Fonts",
    sourceSite: "Google Fonts",
    sourceUrl: `https://fonts.google.com/specimen/${encodeURIComponent(font.family).replace(/%20/g, "+")}`,
    categories: ["experimental", "display-atmospheric"],
    type: "display",
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
    permissions: openPermissions,
    binaryDownloaded: true,
    localFontPath,
    price: null,
    notes: "",
    reasonsInteresting: "",
    researchDate: today,
    cssWeight: 400,
  });
}

catalog.lastUpdated = today;
catalog.researchPass = 8;
await writeFile(metadataUrl, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Added ${collletttivoCuts.length} Collletttivo cuts and ${googleCandidates.length} experimental Google Fonts.`);

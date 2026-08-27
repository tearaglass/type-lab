import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL(".", import.meta.url);
const metadataUrl = new URL("metadata.json", root);
const backupDir = new URL("backups/", root);
const catalog = JSON.parse(await readFile(metadataUrl, "utf8"));
const today = new Date().toISOString().slice(0, 10);

await mkdir(backupDir, { recursive: true });
await copyFile(metadataUrl, new URL(`metadata.before-local-only-${today}.json`, backupDir));

// These are openly licensed Google Fonts, selected specifically to make the
// previously missing handwriting/script territory directly testable offline.
const handwritingFamilies = [
  "Allura",
  "Caveat",
  "Great Vibes",
  "Meow Script",
  "Mrs Saint Delafield",
  "Oleo Script",
  "Pacifico",
  "Sacramento",
  "WindSong",
  "Yellowtail",
];

const existingNames = new Set(catalog.fonts.map((font) => font.familyName.toLowerCase()));
for (const familyName of handwritingFamilies) {
  if (existingNames.has(familyName.toLowerCase())) continue;
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(familyName).replace(/%20/g, "+")}:wght@400`;
  const css = await fetch(cssUrl, { headers: { "User-Agent": "Mozilla/5.0" } }).then((response) => {
    if (!response.ok) throw new Error(`Could not read ${familyName} CSS: ${response.status}`);
    return response.text();
  });
  const url = css.match(/url\((https:\/\/[^)]+\.(?:woff2|ttf))\)/)?.[1];
  if (!url) throw new Error(`Could not find a font file for ${familyName}`);
  const extension = url.endsWith(".woff2") ? "woff2" : "ttf";
  const slug = familyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const relativePath = `fonts/google/${slug}/${slug}-regular.${extension}`;
  const targetDir = new URL(`fonts/google/${slug}/`, root);
  await mkdir(targetDir, { recursive: true });
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download ${familyName}: ${response.status}`);
  await writeFile(new URL(`${slug}-regular.${extension}`, targetDir), Buffer.from(await response.arrayBuffer()));
  catalog.fonts.push({
    id: `google-${slug}`,
    fontName: familyName,
    familyName,
    designer: null,
    foundry: "Google Fonts",
    sourceSite: "Google Fonts",
    sourceUrl: `https://fonts.google.com/specimen/${encodeURIComponent(familyName).replace(/%20/g, "+")}`,
    categories: ["display-atmospheric", "vernacular"],
    type: "other",
    description: "A locally bundled script or handwriting specimen for direct comparison in the lab.",
    useCases: ["titles", "notes", "signatures", "handwritten labels"],
    availableWeights: ["Regular"],
    availableStyles: ["Roman"],
    italicAvailability: false,
    variableFont: false,
    variableAxes: [],
    openTypeFeatures: [],
    availableFormats: [extension.toUpperCase()],
    languageSupport: "Latin",
    licenseName: "SIL Open Font License 1.1",
    licenseUrl: "https://openfontlicense.org/",
    licenseStatus: "free-open-source",
    commercialUseStatus: "permitted",
    webUseStatus: "permitted",
    permissions: { desktop: "permitted", web: "permitted", app: "permitted", commercial: "permitted", redistribution: "with-license" },
    binaryDownloaded: true,
    localFontPath: relativePath,
    price: null,
    notes: "Imported as a local Regular webfont cut from Google Fonts.",
    reasonsInteresting: "Fills the lab's script and handwriting gap with a locally viewable, openly licensed file.",
    researchDate: today,
    cssWeight: 400,
  });
  existingNames.add(familyName.toLowerCase());
}

const removed = catalog.fonts.filter((font) => !font.binaryDownloaded);
catalog.fonts = catalog.fonts.filter((font) => font.binaryDownloaded && font.localFontPath);
catalog.lastUpdated = today;
catalog.researchPass = 6;
await writeFile(metadataUrl, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Kept ${catalog.fonts.length} local specimens; removed ${removed.length} reference-only records.`);

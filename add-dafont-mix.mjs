import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, writeFile, copyFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = new URL(".", import.meta.url);
const metadataUrl = new URL("metadata.json", root);
const catalog = JSON.parse(await readFile(metadataUrl, "utf8"));
const today = new Date().toISOString().slice(0, 10);
const backupUrl = new URL("backups/metadata.before-dafont-mix-2026-08-26.json", root);
const selections = [
  ["Famous Logos", "famous-logos", "free-open-source", "100% Free", "logos"],
  ["Clothing Logos TFB", "clothing-logos-tfb", "free-open-source", "100% Free", "logos"],
  ["Scary Social Media", "scary-social-media", "personal-use-only", "Free for personal use", "logos"],
  ["Dunker", "dunker", "personal-use-only", "Free for personal use", "graffiti"],
  ["Most Wasted", "mostwasted", "free-open-source", "100% Free", "graffiti"],
  ["A Dripping Marker", "a-dripping-marker", "free-open-source", "100% Free", "graffiti"],
  ["Don Graffiti", "don-graffiti", "free-open-source", "100% Free", "graffiti"],
  ["Muro SP", "muro-sp", "free-open-source", "100% Free", "graffiti"],
  ["Throw-up Font", "throw-up-font", "free-open-source", "100% Free", "graffiti"],
  ["Marola", "marola", "free-open-source", "100% Free", "distorted"],
  ["Impacted", "impacted-hr", "free-open-source", "100% Free", "distorted"],
  ["Acidic", "acidic", "free-open-source", "100% Free", "distorted"],
  ["Positions", "positions", "free-open-source", "100% Free", "distorted"],
  ["Drunk Fonts", "drunk-fonts", "free-open-source", "100% Free", "distorted"],
  ["Dot Matrix", "dot-matrix", "free-open-source", "100% Free", "lcd"],
  ["Ledlight", "ledlight", "personal-use-only", "Free for personal use", "lcd"],
  ["Digital 7", "digital-7", "personal-use-only", "Free for personal use", "lcd"],
  ["Arcade", "arcade-ya", "free-open-source", "100% Free", "lcd"],
  ["Kiwi Soda", "kiwisoda", "free-open-source", "Public domain / GPL / OFL", "bitmap"],
  ["VCR OSD Mono", "vcr-osd-mono", "free-open-source", "100% Free", "bitmap"],
  ["Pixel Operator", "pixel-operator", "free-open-source", "Public domain / GPL / OFL", "bitmap"],
  ["Dogica", "dogica", "free-open-source", "Public domain / GPL / OFL", "bitmap"],
  ["Eight-Bit Exposition", "eight-bit-exposition", "free-open-source", "100% Free", "bitmap"],
  ["Old London", "old-london", "free-open-source", "100% Free", "medieval"],
  ["Cloister Black", "cloister-black", "free-open-source", "100% Free", "medieval"],
  ["Chomsky", "chomsky", "free-open-source", "Public domain / GPL / OFL", "medieval"],
  ["Blackletter", "blackletter-ds", "free-open-source", "100% Free", "medieval"],
  ["Ruritania", "ruritania", "free-open-source", "100% Free", "medieval"],
  ["Morris Roman", "morris-roman", "free-open-source", "100% Free", "celtic"],
  ["Carolingia", "carolingia", "free-open-source", "100% Free", "celtic"],
  ["Celtica", "celtica", "free-open-source", "Public domain / GPL / OFL", "celtic"],
];

await mkdir(new URL("backups/", root), { recursive: true });
try {
  await access(backupUrl);
} catch {
  await copyFile(metadataUrl, backupUrl);
}

const openPermissions = { desktop: "permitted", web: "permitted", app: "permitted", commercial: "permitted", redistribution: "review-package" };
const personalPermissions = { desktop: "personal-use-only", web: "personal-use-only", app: "permission-required", commercial: "prohibited", redistribution: "review-package" };
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

for (const [fontName, pageSlug, licenseStatus, licenseName, category] of selections) {
  const pageUrl = `https://www.dafont.com/${pageSlug}.font`;
  const page = await fetch(pageUrl).then((response) => {
    if (!response.ok) throw new Error(`Could not load ${fontName}: ${response.status}`);
    return response.text();
  });
  const downloadId = page.match(/href="\/\/dl\.dafont\.com\/dl\/\?f=([^"&]+)/)?.[1];
  if (!downloadId) throw new Error(`Could not find ${fontName}'s direct download.`);

  const workspace = await mkdtemp(join(tmpdir(), "type-lab-dafont-"));
  const archivePath = join(workspace, "font.zip");
  const archive = await fetch(`https://dl.dafont.com/dl/?f=${downloadId}`).then((response) => {
    if (!response.ok) throw new Error(`Could not download ${fontName}: ${response.status}`);
    return response.arrayBuffer();
  });
  await writeFile(archivePath, Buffer.from(archive));
  await run("/usr/bin/unzip", ["-qq", archivePath, "-d", workspace]);
  const archiveFiles = await walk(workspace);
  const extracted = archiveFiles.filter((file) => /\.(woff2?|ttf|otf)$/i.test(file));
  if (!extracted.length) throw new Error(`${fontName} did not include a usable web font file.`);

  const slug = pageSlug.replace(/[^a-z0-9]+/g, "-");
  const targetDir = new URL(`fonts/dafont/${slug}/`, root);
  await mkdir(targetDir, { recursive: true });
  const fontFile = extracted[0];
  const outputFileName = basename(fontFile);
  const targetFont = new URL(outputFileName, targetDir);
  try {
    await access(targetFont);
  } catch {
    await copyFile(fontFile, targetFont);
  }
  for (const file of archiveFiles) {
    if (!/\.(txt|md|pdf)$/i.test(file)) continue;
    const targetFile = new URL(basename(file), targetDir);
    try {
      await access(targetFile);
    } catch {
      await copyFile(file, targetFile);
    }
  }
  const localFontPath = `fonts/dafont/${slug}/${outputFileName}`;
  catalog.fonts.push({
    id: `dafont-${slug}`,
    fontName,
    familyName: fontName,
    designer: null,
    foundry: null,
    sourceSite: "DaFont",
    sourceUrl: pageUrl,
    categories: ["experimental", category === "bitmap" || category === "lcd" ? "early-digital-internet" : "display-atmospheric"],
    type: category === "bitmap" || category === "lcd" ? "mono" : "display",
    description: "",
    useCases: [],
    availableWeights: ["Package cut"],
    availableStyles: ["Package cut"],
    italicAvailability: false,
    variableFont: false,
    variableAxes: [],
    openTypeFeatures: [],
    availableFormats: [outputFileName.split(".").pop().toUpperCase()],
    languageSupport: "Package-specific",
    licenseName,
    licenseUrl: pageUrl,
    licenseStatus: licenseStatus === "free-open-source" && licenseName === "100% Free" ? "free-restricted" : licenseStatus,
    commercialUseStatus: licenseStatus === "personal-use-only" ? "prohibited" : "review-package",
    webUseStatus: licenseStatus === "personal-use-only" ? "personal-use-only" : "review-package",
    permissions: licenseStatus === "personal-use-only" ? personalPermissions : openPermissions,
    binaryDownloaded: true,
    localFontPath,
    price: null,
    notes: /logos/.test(category) ? "Glyph artwork may depict third-party marks; font availability does not grant trademark rights." : "",
    reasonsInteresting: "",
    researchDate: today,
    cssWeight: 400,
  });
}

catalog.lastUpdated = today;
catalog.researchPass = 9;
await writeFile(metadataUrl, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Added ${selections.length} local DaFont packages.`);

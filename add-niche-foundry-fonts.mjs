import { execFile } from "node:child_process";
import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = new URL(".", import.meta.url);
const metadataUrl = new URL("metadata.json", root);
const sourcesUrl = new URL("preferred-font-sources.json", root);
const date = "2026-08-28";

const openPermissions = {
  desktop: "permitted",
  web: "permitted",
  app: "permitted",
  commercial: "permitted",
  redistribution: "with-license",
};

const ofl = {
  licenseName: "SIL Open Font License 1.1",
  licenseUrl: "https://openfontlicense.org/open-font-license-official-text/",
};

const wtfpl = {
  licenseName: "WTFPL 2.0",
  licenseUrl: "https://www.wtfpl.net/",
};

const fonderieArchive = "https://fonderie.download/downloads/FD_allthefonts.zip";

const entries = [
  {
    id: "niche-fd-4-fromages",
    fontName: "4 Fromages",
    foundry: "fonderie.download",
    sourceSite: "fonderie.download",
    sourceUrl: "https://fonderie.download/4fromages.html",
    ...wtfpl,
    categories: ["experimental", "display-atmospheric", "wildcards"],
    type: "display",
    availableWeights: ["Regular"],
    availableStyles: ["Regular"],
    italicAvailability: false,
    archiveUrl: fonderieArchive,
    sourceFolder: "/FD_4fromages/",
    include: (path) => /\.(woff2?|txt)$/i.test(path),
    primary: /4-Fromages-Regular\.woff2$/i,
    target: "fonderie-download/4-fromages",
  },
  {
    id: "niche-fd-beast",
    fontName: "Beast",
    foundry: "fonderie.download",
    sourceSite: "fonderie.download",
    sourceUrl: "https://fonderie.download/beast.html",
    ...wtfpl,
    categories: ["experimental", "display-atmospheric", "wildcards"],
    type: "display",
    availableWeights: ["Regular"],
    availableStyles: ["Regular"],
    italicAvailability: false,
    archiveUrl: fonderieArchive,
    sourceFolder: "/FD_Beast/",
    include: (path) => /\.(woff2?|txt)$/i.test(path),
    primary: /Beast-Regular\.woff2$/i,
    target: "fonderie-download/beast",
  },
  {
    id: "niche-fd-credible",
    fontName: "Crédible",
    foundry: "fonderie.download",
    sourceSite: "fonderie.download",
    sourceUrl: "https://fonderie.download/credible.html",
    ...wtfpl,
    categories: ["experimental", "display-atmospheric", "vernacular"],
    type: "display",
    availableWeights: ["Regular"],
    availableStyles: ["Regular", "Stylistic sets"],
    italicAvailability: false,
    archiveUrl: fonderieArchive,
    sourceFolder: "/FD_Crédible/",
    include: (path) => /\.(woff2?|txt)$/i.test(path),
    primary: /Crédible-Regular\.woff$/i,
    target: "fonderie-download/credible",
  },
  {
    id: "niche-fd-garamondt",
    fontName: "Garamon(d/t)",
    familyName: "Garamondt",
    foundry: "fonderie.download",
    sourceSite: "fonderie.download",
    sourceUrl: "https://fonderie.download/garamondt.html",
    ...wtfpl,
    categories: ["editorial-literary", "archival-institutional", "experimental"],
    type: "serif",
    availableWeights: ["Regular"],
    availableStyles: ["Regular", "Italic"],
    italicAvailability: true,
    archiveUrl: fonderieArchive,
    sourceFolder: "/FD_Garamon(d-t)/",
    include: (path) => /\.(woff2?|txt)$/i.test(path),
    primary: /Garamondt-Regular\.woff$/i,
    target: "fonderie-download/garamondt",
  },
  {
    id: "niche-fd-quarantype",
    fontName: "Quarantype",
    foundry: "fonderie.download",
    sourceSite: "fonderie.download",
    sourceUrl: "https://fonderie.download/quarantype.html",
    ...wtfpl,
    categories: ["experimental", "display-atmospheric", "wildcards"],
    type: "display",
    availableWeights: ["Regular"],
    availableStyles: ["Regular", "Oblique"],
    italicAvailability: true,
    archiveUrl: fonderieArchive,
    sourceFolder: "/FD_Quarantype/",
    include: (path) => /\.(woff2?|txt)$/i.test(path),
    primary: /Quarantype-Regular\.woff2$/i,
    target: "fonderie-download/quarantype",
  },
  {
    id: "niche-fd-tribalium-neue",
    fontName: "Tribalium Neue",
    foundry: "fonderie.download",
    sourceSite: "fonderie.download",
    sourceUrl: "https://fonderie.download/tribaliumneue.html",
    ...wtfpl,
    categories: ["experimental", "display-atmospheric", "wildcards"],
    type: "display",
    availableWeights: ["Regular"],
    availableStyles: ["Regular", "Poster"],
    italicAvailability: false,
    archiveUrl: fonderieArchive,
    sourceFolder: "/FD_Tribalium_Neue/",
    include: (path) => /\.(woff2?|txt)$/i.test(path),
    primary: /TribaliumNeue-Regular\.woff$/i,
    target: "fonderie-download/tribalium-neue",
  },
  {
    id: "niche-fd-zara",
    fontName: "Zara",
    foundry: "fonderie.download",
    sourceSite: "fonderie.download",
    sourceUrl: "https://fonderie.download/zara.html",
    ...wtfpl,
    categories: ["experimental", "display-atmospheric", "wildcards"],
    type: "display",
    availableWeights: ["Regular"],
    availableStyles: ["Regular", "Oblique"],
    italicAvailability: true,
    archiveUrl: fonderieArchive,
    sourceFolder: "/FD_Zara/",
    include: (path) => /\.(woff2?|txt)$/i.test(path),
    primary: /Zara-Regular\.woff$/i,
    target: "fonderie-download/zara",
  },
  {
    id: "niche-republish-barber",
    fontName: "Barber",
    designer: "Giang Nguyen, Minh Nguyen",
    foundry: "Republish / Behalf Studio",
    sourceSite: "Republish",
    sourceUrl: "https://republi.sh/",
    ...ofl,
    categories: ["vernacular", "display-atmospheric", "archival-institutional"],
    type: "display",
    availableWeights: ["Regular"],
    availableStyles: ["Complete", "Fill", "Outline", "Right", "Shadow"],
    italicAvailability: false,
    archiveUrl: "https://republi.sh/wp-content/uploads/2020/05/Barber-v2.0-1.zip",
    include: (path) => /\.woff2$/i.test(path) || /Barber-specimen.*\.pdf$/i.test(path),
    primary: /Barber-Complete\.woff2$/i,
    target: "republish/barber",
    languageSupport: "Basic Latin and Vietnamese",
  },
  {
    id: "niche-republish-danh-da",
    fontName: "Đanh Đá",
    familyName: "Danh Da",
    designer: "Giang Nguyen",
    foundry: "Republish / Behalf Studio",
    sourceSite: "Republish",
    sourceUrl: "https://republi.sh/",
    ...ofl,
    categories: ["vernacular", "display-atmospheric", "archival-institutional"],
    type: "display",
    availableWeights: ["Bold"],
    availableStyles: ["Bold"],
    italicAvailability: false,
    archiveUrl: "https://republi.sh/wp-content/uploads/2020/05/Danhda-v2.0-1.zip",
    include: (path) => /\.woff2$/i.test(path) || /DanhDa-specimen.*\.pdf$/i.test(path),
    primary: /DanhDa-Bold\.woff2$/i,
    target: "republish/danh-da",
    languageSupport: "Basic Latin and Vietnamese",
    cssWeight: 700,
  },
  {
    id: "niche-anrt-chaumont-script",
    fontName: "Chaumont Script",
    designer: "Timothée Gouraud, Alexandre Bassi",
    foundry: "Atelier National de Recherche Typographique",
    sourceSite: "ANRT Fonts",
    sourceUrl: "https://anrt-nancy.fr/fr/fonts/",
    ...ofl,
    categories: ["vernacular", "archival-institutional", "display-atmospheric"],
    type: "display",
    availableWeights: ["Regular"],
    availableStyles: ["Regular"],
    italicAvailability: false,
    archiveUrl: "https://anrt-nancy.fr/media/pages/fonts/chaumont-script/7259f0f03f-1678381500/chaumont_script.zip",
    include: standardPackageFiles,
    primary: /ChaumontScript-Regular\.woff2$/i,
    target: "anrt/chaumont-script",
  },
  ...goticoEntries(),
  {
    id: "niche-bbb-unormative-fraktur",
    fontName: "Unormative Fraktur",
    designer: "Léna Salabert-Triby, Laura Conant",
    foundry: "Bye Bye Binary",
    sourceSite: "Bye Bye Binary",
    sourceUrl: "https://gitlab.com/bye-bye-binary/unormative-fraktur",
    ...ofl,
    categories: ["experimental", "vernacular", "archival-institutional"],
    type: "display",
    availableWeights: ["Regular"],
    availableStyles: ["Regular", "SVG"],
    italicAvailability: false,
    archiveUrl: "https://gitlab.com/bye-bye-binary/unormative-fraktur/-/archive/main/unormative-fraktur-main.zip",
    include: (path) => /UnormativeFraktur(?:-SVG)?\.woff2$/i.test(path) || /(?:OFL|README)\.(?:txt|md)$/i.test(path),
    primary: /UnormativeFraktur\.woff2$/i,
    target: "bye-bye-binary/unormative-fraktur",
  },
  {
    id: "niche-indestructible-mfek-sans",
    fontName: "MFEK Sans",
    designer: "Owen Earl",
    foundry: "indestructible type*",
    sourceSite: "indestructible type*",
    sourceUrl: "https://github.com/indestructible-type/MFEK-Sans",
    ...ofl,
    categories: ["vernacular", "experimental", "display-atmospheric"],
    type: "sans",
    availableWeights: ["Thin", "ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold", "Black"],
    availableStyles: ["Upright", "Italic", "Rounded", "Ultra Condensed", "Extra Condensed", "Condensed", "Semi Condensed"],
    italicAvailability: true,
    variableFont: true,
    variableAxes: [
      { tag: "TRMA", name: "Rounded", min: 0, default: 0, max: 1000, step: 1 },
      { tag: "wght", name: "Weight", min: 100, default: 400, max: 900, step: 1 },
      { tag: "wdth", name: "Width", min: 50, default: 100, max: 100, step: 1 },
    ],
    cssWeight: "100 900",
    archiveUrl: "https://github.com/indestructible-type/MFEK-Sans/archive/refs/heads/main.zip",
    include: (path) => /MFEK-Sans\[TRMA,wght,wdth\]\.woff2$/i.test(path) || /(?:OFL\.txt|LICENSE\.md|README\.md)$/i.test(path),
    primary: /MFEK-Sans\[TRMA,wght,wdth\]\.woff2$/i,
    target: "indestructible-type/mfek-sans",
  },
  {
    id: "niche-indestructible-cooper",
    fontName: "Cooper*",
    familyName: "Cooper",
    designer: "Owen Earl",
    foundry: "indestructible type*",
    sourceSite: "indestructible type*",
    sourceUrl: "https://github.com/indestructible-type/Cooper",
    ...ofl,
    categories: ["editorial-literary", "vernacular", "display-atmospheric"],
    type: "serif",
    availableWeights: ["Regular", "Medium", "SemiBold", "Bold", "ExtraBold", "Black"],
    availableStyles: ["Upright", "Italic"],
    italicAvailability: true,
    variableFont: true,
    variableAxes: [{ tag: "wght", name: "Weight", min: 400, default: 400, max: 900, step: 1 }],
    cssWeight: "400 900",
    archiveUrl: "https://github.com/indestructible-type/Cooper/archive/refs/heads/main.zip",
    include: (path) => /webfonts\/Cooper\[wght\]\.woff2$/i.test(path) || /(?:OFL\.txt|LICENSE\.md|README\.md)$/i.test(path),
    primary: /Cooper\[wght\]\.woff2$/i,
    target: "indestructible-type/cooper",
  },
  {
    id: "niche-indestructible-drafting-mono",
    fontName: "Drafting* Mono",
    familyName: "Drafting Mono",
    designer: "Owen Earl",
    foundry: "indestructible type*",
    sourceSite: "indestructible type*",
    sourceUrl: "https://github.com/indestructible-type/Drafting",
    ...ofl,
    categories: ["technical-system", "early-digital-internet", "ui-body"],
    type: "mono",
    availableWeights: ["Thin", "ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold"],
    availableStyles: ["Upright", "Italic"],
    italicAvailability: true,
    variableFont: true,
    variableAxes: [{ tag: "wght", name: "Weight", min: 100, default: 400, max: 700, step: 1 }],
    cssWeight: "100 700",
    archiveUrl: "https://github.com/indestructible-type/Drafting/archive/refs/heads/main.zip",
    include: (path) => /variable\/Drafting\[wght\]\.ttf$/i.test(path) || /(?:OFL\.txt|README\.md)$/i.test(path),
    primary: /Drafting\[wght\]\.ttf$/i,
    target: "indestructible-type/drafting-mono",
  },
  {
    id: "niche-indestructible-gnomon",
    fontName: "Gnomon*",
    familyName: "Gnomon",
    designer: "Owen Earl",
    foundry: "indestructible type*",
    sourceSite: "indestructible type*",
    sourceUrl: "https://github.com/indestructible-type/Gnomon",
    ...ofl,
    categories: ["experimental", "display-atmospheric", "archival-institutional"],
    type: "display",
    availableWeights: ["Variable"],
    availableStyles: ["Web", "Simple"],
    italicAvailability: false,
    variableFont: true,
    variableAxes: [
      { tag: "TOTD", name: "Time of Day", min: 0, default: 750, max: 1000, step: 1 },
      { tag: "DIST", name: "Shadow Distance", min: 0, default: 333.33, max: 1000, step: 1 },
    ],
    cssWeight: 400,
    archiveUrl: "https://github.com/indestructible-type/Gnomon/archive/refs/heads/master.zip",
    include: (path) => /Gnomon\*-Web\.ttf$/i.test(path) || /(?:LICENSE\.md|README\.md|FONTLOG\.txt)$/i.test(path),
    primary: /Gnomon\*-Web\.ttf$/i,
    target: "indestructible-type/gnomon",
  },
];

function standardPackageFiles(path) {
  return /\.(?:woff2|otf|txt)$/i.test(path);
}

function goticoEntries() {
  const common = {
    designer: "Rafaël Ribas, Alexis Faudot, Jérôme Knebusch, and workshop participants",
    foundry: "Atelier National de Recherche Typographique",
    sourceSite: "ANRT Fonts",
    sourceUrl: "https://anrt-nancy.fr/fr/fonts/",
    ...ofl,
    categories: ["archival-institutional", "editorial-literary", "experimental"],
    type: "serif",
    availableWeights: ["Regular"],
    availableStyles: ["Historical reconstruction"],
    italicAvailability: false,
    include: standardPackageFiles,
  };

  const rows = [
    ["durandus-118g", "Durandus Gotico-Antiqua 118G", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/0d198ed659-1678381500/gotico-antiqua_durandus-118g.zip"],
    ["subiaco-120r", "Subiaco Proto-Roman 120R", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/c3eb075c42-1678381560/gotico-antiqua_sweynheim-pannartz-120r.zip"],
    ["sweynheim-pannartz-115r", "Sweynheim & Pannartz Proto-Roman 115R", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/1eb0e9fc41-1678381560/gotico-antiqua_sweynheim-pannartz-115r.zip"],
    ["spira-110r", "Spira Proto-Roman 110R", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/10a7f06f11-1678381500/gotico-antiqua_spira-110r.zip"],
    ["rot-102r", "Rot Proto-Roman 102R", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/95c21c313b-1678381500/gotico-antiqua_rot-102r.zip"],
    ["r-bizarre-103r", "Rusch R-Bizarre Proto-Roman 103R", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/8d5addb4f8-1678381500/gotico-antiqua_r-bizarre-103r.zip"],
    ["rusch-100g", "Rusch Gotico-Antiqua 100G", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/0b9237368a-1678381500/gotico-antiqua_rusch-100g.zip"],
    ["soufflet-vert-106r", "Soufflet Vert Hybrid 106R", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/becd45c481-1678381500/gotico-antiqua_soufflet-vert-106r.zip"],
    ["parix-111r", "Parix Hybrid 111R", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/23369f227f-1678381500/gotico-antiqua_parix-111r.zip"],
    ["zainer-96g", "Zainer Gotico-Antiqua 96G", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/41176b1583-1678381560/gotico-antiqua_zainer-96g.zip"],
    ["zainer-initials", "Zainer Initials 45MM", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/ada76d5805-1678381560/gotico-antiqua_zainer-initials.zip"],
    ["ptolemy", "Ptolemy Great-Primer 18", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/b6041b6798-1678381500/gotico-antiqua_ptolemy.zip"],
    ["jessen-cicero-12", "Jessen Cicero 12", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/1d094e4f1c-1678381560/gotico-antiqua_jessen-cicero-12.zip"],
    ["jessen-mittel-14", "Jessen Mittel 14", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/0944f51447-1678381560/gotico-antiqua_jessen-mittel-14.zip"],
    ["hamlet-cicero-12", "Hamlet Cicero 12", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/2135df3c7c-1678381560/gotico-antiqua_hamlet-cicero-12.zip"],
    ["hamlet-tertia-18", "Hamlet Tertia 18", "https://anrt-nancy.fr/media/pages/fonts/gotico-antiqua/027c895867-1678381500/gotico-antiqua_hamlet-tertia-18.zip"],
  ];

  return rows.map(([slug, fontName, archiveUrl]) => ({
    ...common,
    id: `niche-anrt-${slug}`,
    fontName,
    archiveUrl,
    primary: /\.woff2$/i,
    target: `anrt/gotico-antiqua/${slug}`,
  }));
}

function safeFilename(filename) {
  const extension = extname(filename).toLowerCase();
  const stem = basename(filename, extname(filename))
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\*/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${stem}${extension}`;
}

async function allFiles(directory) {
  const results = [];
  for (const name of await readdir(directory)) {
    if (name === "__MACOSX" || name.startsWith("._")) continue;
    const path = join(directory, name);
    const info = await stat(path);
    if (info.isDirectory()) results.push(...await allFiles(path));
    else results.push(path);
  }
  return results;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const catalog = JSON.parse(await readFile(metadataUrl, "utf8"));
const preferredSources = JSON.parse(await readFile(sourcesUrl, "utf8"));
const existingIds = new Set(catalog.fonts.map((font) => font.id));
const pending = entries.filter((entry) => !existingIds.has(entry.id));

if (!pending.length) {
  console.log("All niche-foundry records are already present.");
  process.exit(0);
}

await mkdir(new URL("backups/", root), { recursive: true });
const metadataBackup = new URL(`backups/metadata.before-niche-foundries-${date}.json`, root);
const sourcesBackup = new URL(`backups/preferred-font-sources.before-niche-foundries-${date}.json`, root);
if (!await exists(metadataBackup)) await copyFile(metadataUrl, metadataBackup);
if (!await exists(sourcesBackup)) await copyFile(sourcesUrl, sourcesBackup);

const temporaryRoot = await mkdtemp(join(tmpdir(), "type-lab-niche-"));
const archiveCache = new Map();
const createdTargets = [];
let archiveNumber = 0;

function extractArchive(url) {
  if (archiveCache.has(url)) return archiveCache.get(url);
  const number = ++archiveNumber;
  const task = (async () => {
    const archivePath = join(temporaryRoot, `archive-${number}.zip`);
    const extractedPath = join(temporaryRoot, `archive-${number}`);
    await run("curl", ["-sSL", "--fail", "--max-time", "180", url, "-o", archivePath]);
    await mkdir(extractedPath);
    await run("unzip", ["-q", archivePath, "-d", extractedPath]);
    return extractedPath;
  })();
  archiveCache.set(url, task);
  return task;
}

try {
  const archiveUrls = [...new Set(pending.map((entry) => entry.archiveUrl))];
  for (let index = 0; index < archiveUrls.length; index += 4) {
    await Promise.all(archiveUrls.slice(index, index + 4).map(extractArchive));
  }

  for (const entry of pending) {
    const outputUrl = new URL(`fonts/${entry.target}/`, root);
    if (await exists(outputUrl)) throw new Error(`Refusing to overwrite existing folder: fonts/${entry.target}`);
    await mkdir(outputUrl, { recursive: true });
    createdTargets.push(outputUrl);

    const extractedPath = await extractArchive(entry.archiveUrl);
    const candidates = (await allFiles(extractedPath)).filter((path) => {
      const normalized = path.replaceAll("\\", "/");
      return (!entry.sourceFolder || normalized.includes(entry.sourceFolder)) && entry.include(normalized);
    });
    if (!candidates.length) throw new Error(`No package files found for ${entry.fontName}`);

    const primarySource = candidates.find((path) => entry.primary.test(path));
    if (!primarySource) throw new Error(`No primary font found for ${entry.fontName}`);

    const copiedNames = new Map();
    for (const sourcePath of candidates) {
      const targetName = safeFilename(sourcePath);
      if (copiedNames.has(targetName)) continue;
      await copyFile(sourcePath, new URL(targetName, outputUrl));
      copiedNames.set(targetName, sourcePath);
    }

    const primaryName = safeFilename(primarySource);
    const formats = [...new Set(candidates
      .map((path) => extname(path).slice(1).toUpperCase())
      .filter((extension) => ["WOFF2", "WOFF", "OTF", "TTF"].includes(extension)))];

    catalog.fonts.push({
      id: entry.id,
      fontName: entry.fontName,
      familyName: entry.familyName || entry.fontName,
      designer: entry.designer ?? null,
      foundry: entry.foundry,
      sourceSite: entry.sourceSite,
      sourceUrl: entry.sourceUrl,
      categories: entry.categories,
      type: entry.type,
      description: "",
      useCases: [],
      availableWeights: entry.availableWeights,
      availableStyles: entry.availableStyles,
      italicAvailability: entry.italicAvailability,
      variableFont: entry.variableFont || false,
      variableAxes: entry.variableAxes || [],
      openTypeFeatures: [],
      availableFormats: formats,
      languageSupport: entry.languageSupport || "Latin",
      licenseName: entry.licenseName,
      licenseUrl: entry.licenseUrl,
      licenseStatus: "free-open-source",
      commercialUseStatus: "permitted",
      webUseStatus: "permitted",
      permissions: openPermissions,
      binaryDownloaded: true,
      localFontPath: `fonts/${entry.target}/${primaryName}`,
      price: null,
      notes: "",
      reasonsInteresting: "",
      researchDate: date,
      cssWeight: entry.cssWeight || (entry.variableFont ? "100 900" : 400),
    });
  }

  const newSources = [
    "https://fonderie.download/",
    "https://republi.sh/",
    "https://deathoftypography.com/",
    "https://anrt-nancy.fr/fr/fonts/",
    "https://typotheque.byebyebinary.space/",
    "https://indestructibletype.com/",
  ];
  const sourceSet = new Set(preferredSources.sources);
  for (const source of newSources) sourceSet.add(source);
  preferredSources.sources = [...sourceSet];
  await writeFile(sourcesUrl, `${JSON.stringify(preferredSources, null, 2)}\n`);

  catalog.lastUpdated = date;
  catalog.researchPass = Math.max(catalog.researchPass || 0, 10);
  await writeFile(metadataUrl, `${JSON.stringify(catalog, null, 2)}\n`);

  console.log(`Added ${pending.length} niche-foundry families.`);
} catch (error) {
  for (const target of createdTargets.reverse()) {
    await rm(target, { recursive: true, force: true });
  }
  throw error;
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

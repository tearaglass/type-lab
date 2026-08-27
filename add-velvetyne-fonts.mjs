import fs from "node:fs/promises";

const root = new URL(".", import.meta.url);
const metadataPath = new URL("metadata.json", root);
const catalog = JSON.parse(await fs.readFile(metadataPath, "utf8"));
const headers = { "User-Agent": "type-lab-local-import" };
const repos = await fetch("https://api.github.com/orgs/velvetyne/repos?per_page=100", { headers }).then((r) => r.json());
const existingPaths = new Set(catalog.fonts.map((font) => font.localFontPath).filter(Boolean));
const existingNames = new Set(catalog.fonts.map((font) => font.familyName.toLowerCase()));
const files = [];

for (const repo of repos.filter((repo) => !repo.fork)) {
  const tree = await fetch(`https://api.github.com/repos/velvetyne/${repo.name}/git/trees/${repo.default_branch}?recursive=1`, { headers }).then((r) => r.ok ? r.json() : null);
  if (!tree?.tree) continue;
  const fontFiles = tree.tree.filter((file) => file.type === "blob" && /\.(woff2?|ttf|otf)$/i.test(file.path));
  const hasLicense = tree.tree.some((file) => file.type === "blob" && /(^|\/)(license|ofl|copyright)/i.test(file.path));
  if (!hasLicense) continue;
  for (const file of fontFiles) files.push({ repo, file });
}

for (const { repo, file } of files) {
  if (catalog.fonts.filter((font) => font.sourceSite === "Velvetyne Type Foundry").length >= 50) break;
  const fileName = file.path.split("/").pop();
  const stem = fileName.replace(/\.(woff2?|ttf|otf)$/i, "");
  const slug = `${repo.name}-${stem}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const relativePath = `fonts/velvetyne-imports/${slug}/${fileName}`;
  if (existingPaths.has(relativePath)) continue;
  const familyName = stem.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  if (existingNames.has(familyName.toLowerCase())) continue;
  const targetDir = new URL(`fonts/velvetyne-imports/${slug}/`, root);
  await fs.mkdir(targetDir, { recursive: true });
  const binary = await fetch(`https://raw.githubusercontent.com/velvetyne/${repo.name}/${repo.default_branch}/${file.path}`, { headers }).then((r) => r.arrayBuffer());
  await fs.writeFile(new URL(fileName, targetDir), Buffer.from(binary));
  const extension = fileName.split(".").pop().toLowerCase();
  catalog.fonts.push({
    id: `velvetyne-${slug}`,
    fontName: familyName,
    familyName,
    designer: null,
    foundry: "Velvetyne Type Foundry",
    sourceSite: "Velvetyne Type Foundry",
    sourceUrl: `https://github.com/velvetyne/${repo.name}`,
    categories: ["experimental", "display-atmospheric"],
    type: "display",
    description: `${familyName} is an independently published libre type specimen from Velvetyne’s public repository.` ,
    useCases: ["titles", "posters", "type experiments"],
    availableWeights: ["Repository cut"],
    availableStyles: ["Roman"],
    italicAvailability: /italic|oblique/i.test(fileName),
    variableFont: /variable|vf/i.test(fileName),
    variableAxes: [],
    openTypeFeatures: [],
    availableFormats: [extension.toUpperCase()],
    languageSupport: "Repository metadata not normalized",
    licenseName: "SIL Open Font License 1.1",
    licenseUrl: "https://openfontlicense.org/",
    licenseStatus: "free-open-source",
    commercialUseStatus: "permitted",
    webUseStatus: "permitted",
    permissions: { desktop: "permitted", web: "permitted", app: "permitted", commercial: "permitted", redistribution: "with-license" },
    binaryDownloaded: true,
    localFontPath: relativePath,
    price: null,
    notes: `Imported from the ${repo.name} repository; keep the repository license with future redistribution.`,
    reasonsInteresting: "Adds a niche independent-foundry specimen with a visible source trail.",
    researchDate: new Date().toISOString().slice(0, 10),
    cssWeight: 400,
  });
  existingPaths.add(relativePath);
  existingNames.add(familyName.toLowerCase());
}

catalog.lastUpdated = new Date().toISOString().slice(0, 10);
catalog.researchPass = 5;
await fs.writeFile(metadataPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Added ${catalog.fonts.filter((font) => font.sourceSite === "Velvetyne Type Foundry").length} Velvetyne records total.`);

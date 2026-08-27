import { readFile, writeFile } from "node:fs/promises";

const metadataUrl = new URL("metadata.json", import.meta.url);
const catalog = JSON.parse(await readFile(metadataUrl, "utf8"));
let updated = 0;

for (const font of catalog.fonts) {
  if (font.sourceSite !== "DaFont" || font.licenseName !== "100% Free") continue;
  font.licenseStatus = "free-restricted";
  font.commercialUseStatus = "review-package";
  font.webUseStatus = "review-package";
  font.permissions = { desktop: "permitted", web: "review-package", app: "review-package", commercial: "review-package", redistribution: "review-package" };
  updated += 1;
}

await writeFile(metadataUrl, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Marked ${updated} DaFont “100% Free” records as package-terms-to-review.`);

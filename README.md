# Typography research lab

A local, metadata-driven workspace for researching, classifying, testing, pinning, and comparing typefaces without changing any production project.

The Type Lab contains only explicitly licensed local specimens for live browser testing. Paid, restricted, and unresolved references are kept out of the active catalog so every card is a real local font file.

## Run

From the parent project:

```sh
npm run lab
```

Open `http://127.0.0.1:3004`.

Pins are saved in browser `localStorage`. Candidate metadata and project presets remain plain JSON files that can be reviewed, versioned, or moved between machines.

## Files

- `specimen.html` — standalone interface and accessible controls
- `specimen.css` — visual system, responsive layout, mock components, print view
- `specimen.js` — metadata loading, filtering, pinning, comparison, axes, presets
- `metadata.json` — research database
- `fonts/` — legally testable local binaries and required license files
- `projects/` — reusable project presets
- `screenshots/` — manual or automated visual-review output
- `metadata.schema.json` — validation shape for font records
- `reports/` — dated research summaries, licensing issues, and suggested systems
- `preferred-font-sources.json` — preferred independent foundries and source pool for future additions
- `add-velvetyne-fonts.mjs` — reproducible niche-source import for the Velvetyne batch
- `build-research-pass-01.mjs` — readable source data used to regenerate pass 01
- `build-research-pass-02.mjs` — additive source data for pass 02 and its discovery-directory provenance
- `build-research-pass-03.mjs` — additive Collletttivo, OSP, Insular, and Gaelic research data

## Add a research candidate

Add one object to `metadata.json` using every field below. Keep unavailable information explicit with `null`, `[]`, or `"unknown"` rather than guessing.

```json
{
  "id": "stable-kebab-case-id",
  "fontName": "Published font name",
  "familyName": "CSS family name",
  "designer": "Designer or null",
  "foundry": "Foundry/project or null",
  "sourceSite": "Official source name",
  "sourceUrl": "https://official.example/font",
  "categories": ["experimental", "display-atmospheric"],
  "type": "display",
  "description": "Short visual and structural description.",
  "useCases": ["titles", "posters"],
  "availableWeights": ["Regular"],
  "availableStyles": ["Roman"],
  "italicAvailability": false,
  "variableFont": true,
  "variableAxes": [{ "tag": "wght", "name": "Weight", "min": 100, "default": 400, "max": 900, "step": 1 }],
  "openTypeFeatures": ["ss01"],
  "availableFormats": ["WOFF2"],
  "languageSupport": "Latin Extended",
  "licenseName": "SIL Open Font License 1.1",
  "licenseUrl": "https://openfontlicense.org/",
  "licenseStatus": "free-open-source",
  "commercialUseStatus": "permitted",
  "webUseStatus": "permitted",
  "permissions": { "desktop": "permitted", "web": "permitted", "app": "review-license", "commercial": "permitted", "redistribution": "with-license" },
  "binaryDownloaded": false,
  "localFontPath": null,
  "price": null,
  "notes": "Research notes.",
  "reasonsInteresting": "Why this adds a distinct capability to the collection.",
  "researchDate": "YYYY-MM-DD"
}
```

Allowed category values are listed in `metadata.json`. `type` is one of `serif`, `sans`, `mono`, `display`, or `other`. Suggested license statuses are `free-open-source`, `free-restricted`, `paid`, `trial-only`, `personal-use-only`, `restricted`, and `unclear`.

If a family has separate static files, create one metadata record per testable face when CSS weight/style mapping differs. Use a shared `familyName` and distinct IDs. If a single variable file contains multiple axes, record the axis ranges from the actual font metadata and use one record.

## Local font policy

Do not add a binary until its license explicitly permits the intended local/web test. Prefer WOFF2. Preserve license and attribution files. A paid or restricted candidate can still be fully documented, pinned, filtered, and linked without being downloaded.

When a binary is approved:

1. Put it in `fonts/` without renaming an existing file.
2. Preserve its license file beside it when required.
3. Set `binaryDownloaded` to `true`.
4. Set `localFontPath`, for example `fonts/family-variable.woff2`.
5. Record the format, CSS weight/style, permission differences, and actual variable axes.

The interface requires every catalog record to include a downloaded local font path.

The fourth pass adds up to 80 open-source Google Fonts as local WOFF2 specimens for breadth. Future curated research should prioritize the preferred source pool in `preferred-font-sources.json`.

## Project presets

Duplicate `projects/example-project.json`, give it a unique `id`, and add its filename to the `presetFiles` list near the top of `specimen.js`. Presets can change sample strings, neutral mock labels, palette, specimen sizes, preferred categories, notes, and shortlisted families. Generic defaults always remain available.

## Visual review

Use the pinned comparison and mock-component views for review. `Print view` isolates the active surface for saving as PDF or capturing with a browser screenshot tool. Store captures in `screenshots/` using project, date, and family names in the filename.

## Research-pass checklist

1. Inspect every supplied source and its official licensing material.
2. Select a heterogeneous 30–50 candidate set unless the requested pass is narrower.
3. Remove redundant families that occupy effectively the same role.
4. Record complete metadata and restrictions without guessing.
5. Download only explicitly permitted test files and preserve licenses.
6. Validate with `npm run test:lab`.
7. Review specimens, mock contexts, variable axes, and pinned comparisons.
8. Report strongest candidates by category, licensing problems, purchase candidates, discard candidates, and 2–3-family systems worth testing.

## Known limits

- Project preset discovery is an explicit list in `specimen.js` because a static browser cannot enumerate a local directory.
- Screenshot capture uses the browser print/capture workflow and does not add a heavy automation dependency.
- Axis sliders depend on verified `variableAxes` metadata. They do not assume standard ranges.

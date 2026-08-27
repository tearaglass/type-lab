import { readFile, writeFile } from "node:fs/promises";

const date = "2026-08-22";
const metadataUrl = new URL("metadata.json", import.meta.url);
const metadata = JSON.parse(await readFile(metadataUrl, "utf8"));

const openPermissions = {
  desktop: "permitted",
  web: "permitted",
  app: "permitted",
  commercial: "permitted",
  redistribution: "with-license",
};

const restrictedPermissions = {
  desktop: "restricted-by-language-and-commercial-context",
  web: "restricted-by-language-and-commercial-context",
  app: "permission-required",
  commercial: "permission-required-for-non-Celtic-language-material",
  redistribution: "prohibited-without-permission",
};

function font(record) {
  return {
    id: record.id,
    fontName: record.name,
    familyName: record.family || record.name,
    designer: record.designer ?? null,
    foundry: record.foundry ?? null,
    sourceSite: record.sourceSite,
    sourceUrl: record.url,
    discoveredVia: record.via ?? null,
    categories: record.categories,
    type: record.type,
    description: record.description,
    useCases: record.useCases || [],
    availableWeights: record.weights || [],
    availableStyles: record.styles || [],
    italicAvailability: record.italic ?? false,
    variableFont: record.variable || false,
    variableAxes: record.axes || [],
    openTypeFeatures: record.features || [],
    availableFormats: record.formats || [],
    languageSupport: record.languages ?? "Latin",
    licenseName: record.licenseName,
    licenseUrl: record.licenseUrl,
    licenseStatus: record.licenseStatus,
    commercialUseStatus: record.commercial,
    webUseStatus: record.web,
    permissions: record.permissions,
    binaryDownloaded: record.binary || false,
    localFontPath: record.path || null,
    price: record.price ?? null,
    notes: record.notes || "",
    reasonsInteresting: record.interesting,
    researchDate: date,
    ...(record.cssWeight ? { cssWeight: record.cssWeight } : {}),
    ...(record.cssStyle ? { cssStyle: record.cssStyle } : {}),
  };
}

const typolibres = { name: "typolibres", url: "https://typolibres.joanajost.fr/" };
const ofl = {
  licenseName: "SIL Open Font License 1.1",
  licenseUrl: "https://openfontlicense.org/open-font-license-official-text/",
  licenseStatus: "free-open-source",
  commercial: "permitted",
  web: "permitted",
  permissions: openPermissions,
};

const clt = (record) => font({
  ...ofl,
  foundry: "Collletttivo",
  sourceSite: "Collletttivo",
  url: `https://www.collletttivo.it/typefaces/${record.slug}`,
  via: typolibres,
  formats: ["WOFF2", "WOFF", "OTF", "source files"],
  binary: true,
  languages: "Latin",
  ...record,
});

const osp = (record) => font({
  foundry: "Open Source Publishing",
  sourceSite: "OSP Foundry",
  url: `https://osp.kitchen/foundry/${record.slug}/`,
  via: typolibres,
  languages: "Latin",
  ...record,
});

const pass03 = [
  clt({ id: "p03-clt-sinistre", slug: "sinistre", name: "Sinistre", designer: "Jules Durand", categories: ["editorial-literary", "archival-institutional", "display-atmospheric", "experimental"], type: "serif", description: "A contemporary Insular family combining uncial minuscule, Roman proportion, Fraktur edge, Gaelic stone carving, and Book of Kells references.", useCases: ["Celtic-language titles", "historical exhibitions", "book covers", "ceremonial display"], weights: ["Regular", "Bold", "Dark"], styles: ["Static", "Variable"], variable: true, axes: [{ tag: "wght", name: "Weight", min: 400, default: 400, max: 900, step: 1 }], path: "fonts/collletttivo/sinistre/SinistreVF.woff2", interesting: "It is the strongest Celtic candidate when the project needs historical signal without souvenir-shop decoration." }),
  font({ ...ofl, id: "p03-cianan-ur", name: "Cianán Ùr", designer: "Feòrag NicBhrìde", foundry: "Feòrag", sourceSite: "Feòrag", url: "https://www.feorag.com/freestuff/cianan-ur.html", via: typolibres, categories: ["archival-institutional", "editorial-literary", "vernacular", "display-atmospheric"], type: "serif", description: "An Insular text face based on letterforms familiar from older Irish printing, with a less theatrical and more documentary voice.", useCases: ["Irish and Gaelic text", "historical captions", "archive labels", "literary headings"], weights: ["Regular"], styles: ["Regular"], formats: ["OTF", "TTF"], languages: "Irish, Scottish Gaelic, and Latin-script languages", binary: true, path: "fonts/cianan-ur/Cianan-ur-Regular.otf", interesting: "It gives the lab an actual reading-oriented Insular form, not just a Celtic display accent." }),

  clt({ id: "p03-clt-aujournuit", slug: "aujournuit", name: "Aujournuit", designer: "Teo Gaudet", categories: ["experimental", "display-atmospheric", "vernacular"], type: "display", description: "A runny calligraphic display system that stretches from airy and condensed to dense and wide constructions.", useCases: ["expressive titles", "music packaging", "motion typography"], weights: ["Regular"], styles: ["Airy", "Condensed", "Densed", "Regular", "Wide", "Variable"], variable: true, axes: [{ tag: "wdth", name: "Width", min: 50, default: 100, max: 150, step: 1 }], path: "fonts/collletttivo/aujournuit/Aujournuit-VariableVF.woff2", interesting: "Its width interpolation changes texture and gesture, not just line length." }),
  clt({ id: "p03-clt-sprat", slug: "sprat", name: "Sprat", designer: "Ethan Nakache", categories: ["editorial-literary", "experimental", "display-atmospheric"], type: "serif", description: "A sharp serif system spanning condensed, regular, and extended widths from thin to black.", useCases: ["editorial systems", "responsive titles", "posters"], weights: ["Thin", "Light", "Regular", "Medium", "Bold", "Black"], styles: ["Condensed", "Regular", "Extended", "Variable"], variable: true, axes: [{ tag: "wght", name: "Weight", min: 100, default: 400, max: 900, step: 1 }, { tag: "wdth", name: "Width", min: 75, default: 100, max: 125, step: 1 }], path: "fonts/collletttivo/sprat/SpratVF.woff2", interesting: "The width-and-weight matrix makes an unusually characterful but usable editorial system." }),
  clt({ id: "p03-clt-mazius", slug: "mazius-display", name: "Mazius Display", designer: "Alberto Casagrande", categories: ["editorial-literary", "display-atmospheric"], type: "serif", description: "A high-contrast display serif with an extra-italic construction that feels written, unstable, and formal at once.", useCases: ["book covers", "article openers", "cinematic titles"], weights: ["Regular", "Bold"], styles: ["Roman", "Extra Italic"], italic: true, path: "fonts/collletttivo/mazius-display/MaziusDisplay-Regular.woff2", interesting: "Its extra italic is a useful atmospheric counterpoint to conventional editorial italics." }),
  clt({ id: "p03-clt-ortica", slug: "ortica", name: "Ortica", designer: "Ben Bovani", categories: ["editorial-literary", "experimental", "display-atmospheric"], type: "serif", description: "A thorny high-contrast serif split into angular and linear constructions.", useCases: ["poetry", "cultural publishing", "severe titles"], weights: ["Light", "Regular", "Bold"], styles: ["Angular", "Linear"], path: "fonts/collletttivo/ortica/OrticaLinear-Regular.woff2", interesting: "The paired constructions let the same sharp voice move between brittle and more readable settings." }),
  clt({ id: "p03-clt-sneaky-times", slug: "sneaky-times", name: "Sneaky Times", designer: "Jules Durand", categories: ["editorial-literary", "vernacular", "wildcards"], type: "serif", description: "A Times-derived serif disrupted by covertly altered joins and proportions.", useCases: ["interventions", "editorial experiments", "institutional parody"], weights: ["Regular"], styles: ["Regular"], path: "fonts/collletttivo/sneaky-times/Sneaky-Times.woff2", interesting: "It is useful for testing how much structural wrongness can hide inside a familiar reading texture." }),
  clt({ id: "p03-clt-coconat", slug: "coconat", name: "Coconat", designer: "Sara Lavazza", categories: ["editorial-literary", "display-atmospheric", "vernacular"], type: "serif", description: "A soft, heavy display serif with calligraphic bulges and generous dark shapes.", useCases: ["magazine titles", "packaging", "warm cultural identities"], weights: ["Regular", "Demi", "Bold"], styles: ["Upright"], path: "fonts/collletttivo/coconat/Coconat-Regular.woff2", interesting: "It supplies tactile warmth without leaning on polished luxury-serif conventions." }),
  clt({ id: "p03-clt-messapia", slug: "messapia", name: "Messapia", designer: "Luca Marsano", categories: ["archival-institutional", "vernacular", "display-atmospheric"], type: "serif", description: "A display family influenced by southern Italian inscriptional and vernacular forms.", useCases: ["regional identities", "exhibition titles", "signage"], weights: ["Regular", "Bold"], styles: ["Upright"], path: "fonts/collletttivo/messapia/Messapia-Regular.woff2", interesting: "Its geographic reference feels specific and constructed rather than vaguely classical." }),
  clt({ id: "p03-clt-ribes", slug: "ribes", name: "Ribes", designer: "Luigi Gorlero", categories: ["display-atmospheric", "experimental", "wildcards"], type: "display", description: "A compact display family with dense joins and eccentric organic silhouettes.", useCases: ["short titles", "labels", "music artwork"], weights: ["Light", "Regular", "Black"], styles: ["Upright"], path: "fonts/collletttivo/ribes/Ribes-Regular.woff2", interesting: "It occupies a useful zone between botanical, mechanical, and deliberately awkward." }),
  clt({ id: "p03-clt-halibut", slug: "halibut", name: "Halibut", designer: "Matteo Maggi", categories: ["experimental", "display-atmospheric", "early-digital-internet"], type: "display", description: "A width-driven display system with thin and regular cuts across condensed, normal, and expanded forms.", useCases: ["responsive titles", "interface interruptions", "posters"], weights: ["Thin", "Regular"], styles: ["Condensed", "Regular", "Expanded"], variable: true, axes: [], path: "fonts/collletttivo/halibut/Halibut-Regular.woff2", interesting: "Its exaggerated width states are blunt enough to expose layout behavior immediately." }),
  clt({ id: "p03-clt-necto-mono", slug: "necto-mono", name: "Necto Mono", designer: "Marco Condello", categories: ["technical-system", "early-digital-internet", "ui-body"], type: "mono", description: "A sparse monospaced face with a dry terminal and early-computer plainness.", useCases: ["filenames", "status panels", "captions", "code"], weights: ["Regular"], styles: ["Upright"], path: "fonts/collletttivo/necto-mono/NectoMono-Regular.woff2", interesting: "It gives the lab a practical mono whose oddness comes from drawing, not screen effects." }),
  clt({ id: "p03-clt-absans", slug: "absans", name: "Absans", designer: "Valerio Monopoli", categories: ["ui-body", "technical-system", "experimental"], type: "sans", description: "A stripped single-weight sans with abrupt, economical forms and visible construction decisions.", useCases: ["labels", "small interfaces", "documentation"], weights: ["Regular"], styles: ["Upright"], path: "fonts/collletttivo/absans/Absans-Regular.woff2", interesting: "It is quiet enough for utility text but refuses the anonymous neutrality of a standard UI sans." }),
  clt({ id: "p03-clt-apfel-grotezk", slug: "apfel-grotezk", name: "Apfel Grotezk", designer: "Luigi Gorlero", categories: ["ui-body", "technical-system", "vernacular"], type: "sans", description: "A deliberately rough grotesk with five weights and blunt commercial-print energy.", useCases: ["navigation", "posters", "feeds", "labels"], weights: ["Regular", "Mittel", "Satt", "Fett", "Brukt"], styles: ["Upright"], path: "fonts/collletttivo/apfel-grotezk/ApfelGrotezk-Regular.woff2", interesting: "It can carry interface structure while keeping a visibly human, non-startup texture." }),
  clt({ id: "p03-clt-mattone", slug: "mattone", name: "Mattone", designer: "Nunzio Mazzaferro", categories: ["ui-body", "display-atmospheric", "vernacular"], type: "sans", description: "A very wide sans with loud rounded curves, redrawn to survive smaller text sizes.", useCases: ["navigation", "headings", "packaging", "short body copy"], weights: ["Regular", "Bold", "Black"], styles: ["Upright"], path: "fonts/collletttivo/mattone/Mattone-Regular.woff2", interesting: "Its extreme width is functional enough to test beyond posters, which makes it a useful layout stressor." }),
  clt({ id: "p03-clt-ronzino", slug: "ronzino", name: "Ronzino", designer: "Luigi Gorlero and Nunzio Mazzaferro", categories: ["ui-body", "technical-system", "vernacular"], type: "sans", description: "A six-style reinterpretation of Arial that keeps office-software familiarity while shifting its construction and tone.", useCases: ["interfaces", "documents", "institutional systems"], weights: ["Regular", "Medium", "Bold"], styles: ["Roman", "Oblique"], italic: true, path: "fonts/collletttivo/ronzino/Ronzino-Regular.woff2", interesting: "It turns the most ordinary system-font reference into a consciously redrawn vernacular tool." }),

  osp({ ...ofl, id: "p03-osp-belgica", slug: "belgica-belgika", name: "Belgica Belgika", designer: "Open Source Publishing collaborators", categories: ["archival-institutional", "experimental", "vernacular"], type: "display", description: "A deliberately collective Belgian typographic system preserved in several numbered states.", useCases: ["collective publications", "institutional display", "posters"], weights: ["5th", "8th", "16th", "40th"], styles: ["Numbered iterations"], formats: ["WOFF", "TTF", "source files"], binary: true, path: "fonts/osp/belgica-belgika/belgika-16th-webfont.woff", interesting: "Its identity is procedural and collaborative, making iteration itself part of the family." }),
  osp({ ...ofl, id: "p03-osp-fluxisch-else", slug: "fluxisch-else", name: "Fluxisch Else", designer: "Pierre Huyghebaert, Pierre Marchand, Delphine Platteeuw, and Gregoire Vigneron", categories: ["archival-institutional", "vernacular", "experimental"], type: "sans", description: "A scanned and reconstructed Univers Else descendant whose irregularities retain the pressure of its production process.", useCases: ["cultural publishing", "documents", "institutional graphics"], weights: ["Light", "Regular", "Bold"], styles: ["Upright"], formats: ["WOFF", "OTF", "source files"], binary: true, path: "fonts/osp/fluxisch-else/FluxischElse-Regular.woff", interesting: "It makes reproduction history visible without applying a fake damage filter." }),
  osp({ ...ofl, id: "p03-osp-libertinage", slug: "libertinage", name: "Libertinage", designer: "OSP, after Linux Libertine", categories: ["editorial-literary", "experimental", "wildcards"], type: "serif", description: "Twenty-seven remixed Linux Libertine variations created by copying, substituting, and rotating glyph parts for the FLOSS+Art book.", useCases: ["section systems", "editorial interventions", "generative publishing"], weights: ["Regular"], styles: ["Full", "A–Z variants"], formats: ["TTF", "source files"], binary: true, path: "fonts/osp/libertinage/Libertinage.ttf", interesting: "It treats a type family as an editorial indexing mechanism rather than a ladder of weights." }),
  osp({ id: "p03-osp-notcourier", slug: "notcouriersans", name: "NotCourierSans", designer: "Open Source Publishing collaborators", categories: ["technical-system", "early-digital-internet", "ui-body"], type: "mono", description: "A reinterpretation of Nimbus Mono with Cyrillic expansion and private-use ornamental glyphs from OSP workshops.", useCases: ["code", "records", "system panels", "workshop publications"], weights: ["Regular", "Bold"], styles: ["Upright"], features: ["ornaments"], formats: ["WOFF", "TTF", "OTF"], licenseName: "GNU GPL v2 with font embedding exception", licenseUrl: "https://osp.kitchen/foundry/notcouriersans/tree/master/COPYING", licenseStatus: "free-open-source", commercial: "permitted", web: "permitted", permissions: openPermissions, binary: true, path: "fonts/osp/notcouriersans/NotCourierSans.woff", languages: "Latin and Cyrillic", interesting: "It is a real open-computing artifact with useful system texture and a documented lineage." }),
  osp({ ...ofl, id: "p03-osp-din", slug: "osp-din", name: "OSP-DIN", designer: "Open Source Publishing collaborators", categories: ["technical-system", "archival-institutional", "vernacular"], type: "sans", description: "A libre engineering and signage study that includes the OSP-DIN and DIN-Eden constructions.", useCases: ["signage", "technical labels", "status panels"], weights: ["Regular"], styles: ["OSP-DIN", "DIN-Eden"], formats: ["WOFF", "OTF", "source files"], binary: true, path: "fonts/osp/osp-din/OSP-DIN.woff", languages: "Basic Latin with partial extended coverage", interesting: "It brings norm-lettering logic into the lab through an actual collaborative reconstruction." }),

  osp({ ...ofl, id: "p03-osp-reglo", slug: "reglo", name: "Reglo", designer: "Sébastien Sanfilippo", categories: ["display-atmospheric", "vernacular", "technical-system"], type: "sans", description: "A compact heavy geometric display face from OSP's early libre foundry work.", useCases: ["labels", "posters", "short navigation"], weights: ["Bold"], styles: ["Upright"], formats: ["WOFF", "TTF", "source files"], notes: "Reference-only: the repository states OFL in FONTLOG but does not bundle the full license text with the binary package.", interesting: "Its small file and blunt geometry make it an appealing early-web display artifact." }),
  osp({ ...ofl, id: "p03-osp-erbarre", slug: "erbarre", name: "Erbarre", designer: "Open Source Publishing collaborators", categories: ["vernacular", "archival-institutional", "display-atmospheric"], type: "sans", description: "A traced revival with upright and oblique forms that retains visible source-material tension.", useCases: ["signage", "historical display", "regional graphics"], weights: ["Regular", "Bold"], styles: ["Upright", "Oblique"], italic: true, formats: ["WOFF", "OTF", "source files"], notes: "Reference-only: OFL is asserted in source metadata, but the downloaded repository lacks a complete license file.", interesting: "Its tracing process creates material irregularity instead of simulated distress." }),
  osp({ ...ofl, id: "p03-osp-sans-guilt", slug: "sans-guilt", name: "Sans Guilt", designer: "OSP workshop participants", categories: ["experimental", "vernacular", "wildcards"], type: "sans", description: "Three workshop-built sans fonts produced through Gimp, Fonzie, and FontForge at the Royal College of Art.", useCases: ["workshop publishing", "posters", "experimental interfaces"], styles: ["Three workshop variants"], formats: ["font package", "source files"], notes: "Reference-only: the current archive endpoint did not yield a verifiable package during this pass.", interesting: "It documents collective tool use and imperfect translation as the typeface's actual construction method." }),
  osp({ id: "p03-osp-logisoso", slug: "logisoso", name: "Logisoso", designer: "Mathieu Gabiot", categories: ["technical-system", "experimental", "early-digital-internet"], type: "sans", description: "A libre OSP project with a software-like, diagrammatic construction and explicitly copyleft distribution.", useCases: ["system diagrams", "technical titles", "experimental publishing"], formats: ["source files"], licenseName: "GNU GPL v2 with font embedding exception", licenseUrl: "https://osp.kitchen/foundry/logisoso/tree/master/COPYING.txt", licenseStatus: "free-open-source", commercial: "permitted", web: "permitted", permissions: openPermissions, notes: "Reference-only: the inspected repository currently contains the license but no usable compiled font binary.", interesting: "Its incompleteness is informative for studying fonts as maintained software rather than finished products." }),
  osp({ ...ofl, id: "p03-osp-le-patin-helvete", slug: "le-patin-helvete", name: "Le Patin Helvète", designer: "Open Source Publishing collaborators", categories: ["vernacular", "experimental", "wildcards"], type: "sans", description: "A playful Swiss-derived family assembled through collaborative transformations rather than neutralist refinement.", useCases: ["posters", "workshop matter", "unsettled institutional graphics"], formats: ["font files", "source files"], notes: "Reference-only pending package-level license and binary inspection.", interesting: "It turns a familiar national-modernist reference into a rough collective object." }),
  osp({ ...ofl, id: "p03-osp-cowboy-henk", slug: "cowboy-henk", name: "Cowboy Henk", designer: "Open Source Publishing collaborators", categories: ["vernacular", "display-atmospheric", "wildcards"], type: "display", description: "A large unruly display family developed around the Belgian comics character Cowboy Henk.", useCases: ["comics", "posters", "characterful title systems"], formats: ["font files", "source files"], notes: "Reference-only pending package-level license and binary inspection.", interesting: "It offers genuine regional comic vernacular rather than a generalized novelty-comic style." }),

  font({ id: "p03-gaelchlo-glanchlo", name: "Glanchló GC", designer: "Vincent Morley", foundry: "Gaelchló", sourceSite: "Gaelchló", url: "https://www.gaelchlo.com/glangc.html", categories: ["archival-institutional", "editorial-literary", "vernacular"], type: "serif", description: "A modern Gaelic text type influenced by nineteenth-century Petrie faces and Colm Ó Lochlainn's Colum Cille.", useCases: ["Irish-language books", "Gaelic documents", "historical exhibitions"], weights: ["Regular", "Bold"], styles: ["Roman", "Italic"], italic: true, features: ["small caps", "Insular r and s alternates"], formats: ["WOFF2", "OTF"], languages: "Celtic languages and Latin", licenseName: "Gaelchló custom restricted license", licenseUrl: "https://www.gaelchlo.com/glangc.html", licenseStatus: "restricted", commercial: "free for Celtic-language material; permission required for commercial non-Celtic material", web: "same language-and-commercial restrictions; redistribution prohibited", permissions: restrictedPermissions, notes: "The official ZIP was inspected but not retained: its terms prohibit redistribution without prior permission.", interesting: "It is the most historically grounded Gaelic text reference in this pass, but unsuitable for bundling." }),
  font({ id: "p03-gaelchlo-bunchlo", name: "Bunchló Nua GC", designer: "Vincent Morley", foundry: "Gaelchló", sourceSite: "Gaelchló", url: "https://www.gaelchlo.com/clonna1.html", categories: ["archival-institutional", "editorial-literary", "vernacular"], type: "serif", description: "A broad Gaelic book face recently rebuilt in OpenType and WOFF2 formats.", useCases: ["Irish-language publishing", "catalogues", "historical interpretation"], styles: ["Regular"], formats: ["WOFF2", "OTF"], languages: "Celtic languages and Latin", licenseName: "Gaelchló custom restricted license", licenseUrl: "https://www.gaelchlo.com/clonna1.html", licenseStatus: "restricted", commercial: "confirm with Gaelchló", web: "confirm with Gaelchló; redistribution not assumed", permissions: restrictedPermissions, notes: "Reference-only until this family's exact package terms are separately inspected and permission is clear.", interesting: "It expands the Gaelic shortlist beyond headline uncials toward actual book typography." }),
  font({ id: "p03-gaelchlo-saorchlo", name: "Saorchló GC", designer: "Vincent Morley", foundry: "Gaelchló", sourceSite: "Gaelchló", url: "https://www.gaelchlo.com/clonna1.html", categories: ["vernacular", "display-atmospheric", "archival-institutional"], type: "display", description: "A distinct member of Gaelchló's Unicode Gaelic catalogue with a freer display voice.", useCases: ["Gaelic headings", "cultural posters", "regional display"], styles: ["Regular"], formats: ["WOFF2", "OTF"], languages: "Celtic languages and Latin", licenseName: "Gaelchló custom restricted license", licenseUrl: "https://www.gaelchlo.com/clonna1.html", licenseStatus: "restricted", commercial: "confirm with Gaelchló", web: "confirm with Gaelchló; redistribution not assumed", permissions: restrictedPermissions, notes: "Reference-only; no binary is bundled because redistribution permission was not established.", interesting: "It keeps the Celtic research from collapsing into one standardized historical voice." }),
];

const retained = metadata.fonts.filter((entry) => !entry.id.startsWith("p03-"));
const output = { ...metadata, lastUpdated: date, researchPass: 3, fonts: [...retained, ...pass03] };
await writeFile(metadataUrl, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${pass03.length} pass-03 records; ${output.fonts.length} total candidates.`);

import { writeFile } from "node:fs/promises";

const date = "2026-08-21";
const categories = [
  "editorial-literary", "ui-body", "technical-system", "experimental",
  "archival-institutional", "early-digital-internet", "display-atmospheric",
  "vernacular", "wildcards",
];

const openPermissions = { desktop: "permitted", web: "permitted", app: "permitted", commercial: "permitted", redistribution: "with-license" };
const referencePermissions = { desktop: "purchase-required", web: "purchase-or-separate-license-required", app: "separate-license-required", commercial: "purchase-required", redistribution: "prohibited" };

function font(record) {
  return {
    id: record.id,
    fontName: record.name,
    familyName: record.family || record.name,
    designer: record.designer ?? null,
    foundry: record.foundry ?? null,
    sourceSite: record.sourceSite,
    sourceUrl: record.url,
    categories: record.categories,
    type: record.type,
    description: record.description,
    useCases: record.useCases || [],
    availableWeights: record.weights || [],
    availableStyles: record.styles || [],
    italicAvailability: record.italic ?? "unknown",
    variableFont: record.variable || false,
    variableAxes: record.axes || [],
    openTypeFeatures: record.features || [],
    availableFormats: record.formats || [],
    languageSupport: record.languages ?? null,
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

const futureLicense = {
  sourceSite: "Future Fonts",
  licenseName: "Foundry-specific Future Fonts EULA",
  licenseUrl: "https://www.futurefonts.com/terms",
  licenseStatus: "paid",
  commercial: "permitted-after-purchase",
  web: "review-foundry-eula",
  permissions: referencePermissions,
  formats: ["OTF", "trial files when offered"],
};

const velvetyneLicense = {
  sourceSite: "Velvetyne Type Foundry",
  licenseName: "SIL Open Font License 1.1",
  licenseUrl: "https://openfontlicense.org/open-font-license-official-text/",
  licenseStatus: "free-open-source",
  commercial: "permitted",
  web: "permitted",
  permissions: openPermissions,
  formats: ["OTF", "WOFF", "WOFF2", "source files"],
};

const uncutLicense = {
  sourceSite: "UNCUT.wtf",
  foundry: "Various; catalogued by UNCUT.wtf",
  licenseName: "SIL Open Font License 1.1",
  licenseUrl: "https://openfontlicense.org/open-font-license-official-text/",
  licenseStatus: "free-open-source",
  commercial: "permitted",
  web: "permitted",
  permissions: openPermissions,
  formats: ["varies by upstream project"],
  notes: "UNCUT advises confirming questions with the original creator; binary not retained during this pass.",
};

const tmtLicense = {
  sourceSite: "Too Much Type",
  designer: "Gabriel Drozdov",
  foundry: "Too Much Type / No Replica",
  licenseName: "SIL Open Font License 1.1",
  licenseUrl: "https://openfontlicense.org/open-font-license-official-text/",
  licenseStatus: "free-open-source",
  commercial: "permitted",
  web: "permitted",
  permissions: openPermissions,
  formats: ["WOFF2", "WOFF", "TTF", "OTF", "source files"],
};

const pointLicense = {
  sourceSite: "Point Type",
  designer: "Sean Fermoyle",
  foundry: "Point Type Foundry",
  licenseName: "Point Type / Fontdue license; exact terms not publicly surfaced",
  licenseUrl: "https://www.point-type.com/contact",
  licenseStatus: "paid",
  commercial: "purchase-required",
  web: "purchase-and-license-review-required",
  permissions: referencePermissions,
  formats: [],
  notes: "Reference only until the checkout license text and intended use are reviewed.",
};

const entravauxPermissions = { desktop: "permitted", web: "unclear-conflicting-clauses", app: "stated-permitted-but-review-required", commercial: "permitted-except-trials", redistribution: "prohibited" };
const entravauxLicense = {
  sourceSite: "En Travaux",
  foundry: "En Travaux",
  licenseName: "ENTX End User Licence Agreement (2025)",
  licenseUrl: "https://entravaux.framer.website/licensing",
  licenseStatus: "restricted",
  commercial: "permitted-except-trials",
  web: "unclear-conflicting-eula-clauses",
  permissions: entravauxPermissions,
  formats: [],
  notes: "The EULA broadly grants web/app use but separately prohibits Internet font serving without consent. Kept reference-only pending clarification.",
};

const psyopsLicense = {
  sourceSite: "PSY/OPS",
  foundry: "PSY/OPS Type Foundry",
  licenseName: "PSY/OPS Unified Font License Agreement v1.0",
  licenseUrl: "https://www.psyops.com/licensing/",
  licenseStatus: "paid",
  commercial: "permitted-after-purchase",
  web: "permitted-with-web-license",
  permissions: referencePermissions,
  formats: [],
};

const cc0License = {
  sourceSite: "Typodermic Fonts",
  designer: "Ray Larabie",
  foundry: "Typodermic Fonts",
  licenseName: "CC0 1.0 Universal / public domain dedication",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  licenseStatus: "public-domain",
  commercial: "permitted",
  web: "permitted",
  permissions: { desktop: "permitted", web: "permitted", app: "permitted", commercial: "permitted", redistribution: "permitted" },
  formats: ["OTF", "webfonts", "source files"],
  notes: "Typodermic states that the public-domain package includes webfonts and source files; binary not retained during this pass.",
};

const fonts = [
  // Future Fonts — paid/reference candidates.
  font({ ...futureLicense, id: "ff-biblio", name: "Biblio", designer: "Namrata Goyal", foundry: "Namrata Goyal", url: "https://www.futurefonts.com/namrata-goyal/biblio", categories: ["archival-institutional", "ui-body"], type: "sans", description: "A narrow geo-humanist signage family begun for the Royal Academy of Art library in The Hague.", useCases: ["library signage", "indexes", "compact navigation", "captions"], styles: ["Upright Signage"], italic: "planned", features: ["alternates", "icons"], languages: "Basic and Extended Latin", price: "$80+", interesting: "It brings a real institutional origin and space-saving proportions without falling into generic wayfinding minimalism." }),
  font({ ...futureLicense, id: "ff-future-mono", name: "The Future Mono", designer: "Kris Sowersby", foundry: "Klim Type Foundry", url: "https://www.futurefonts.com/klim/the-future-mono", categories: ["technical-system", "early-digital-internet", "ui-body"], type: "mono", description: "A typewriter thought experiment: Futura translated through a Japanese typewriter sensibility.", useCases: ["code", "labels", "technical captions", "interfaces"], styles: ["Regular"], features: ["monospace", "alternates"], languages: "Extended Latin", price: "$420+", interesting: "A disciplined mono with a historical counterfactual behind it; calmer than most retro-computer faces." }),
  font({ ...futureLicense, id: "ff-md-io", name: "MD IO", designer: "Mass-Driver", foundry: "Mass-Driver", url: "https://www.futurefonts.com/mass-driver/io", categories: ["technical-system", "ui-body"], type: "mono", description: "A screen-first monospace with generous x-height, ink traps, and deliberately distinct glyph constructions.", useCases: ["code", "data panels", "wallet strings", "documentation"], styles: ["Roman", "Italic"], italic: true, features: ["monospace", "italic"], languages: "Basic Latin, Extended Latin, Vietnamese", price: "$550+", interesting: "One of the strongest functional candidates: small-size legibility and unmistakable large-size technical texture coexist." }),
  font({ ...futureLicense, id: "ff-txt25", name: "TXT25 / NaN Tragedy", designer: "Phantom Foundry", foundry: "Phantom Foundry / NaN", url: "https://www.futurefonts.com/phantom-foundry/txt25", categories: ["editorial-literary", "ui-body", "experimental"], type: "serif", description: "A body-text family that inserts exaggerated axes and unbalanced exit strokes into an otherwise even reading texture.", useCases: ["editorial text", "essays", "cultural websites"], variable: true, axes: [], features: ["variable"], languages: "Basic and Extended Latin", price: "$99+; completed family moved to NaN", notes: "Completed and now sold by NaN as NaN Tragedy. Future Fonts page retained for provenance.", interesting: "A rare candidate that makes unconventional form survive at body size instead of retreating to display use." }),
  font({ ...futureLicense, id: "ff-digestive", name: "Digestive", designer: "Studio Triple", foundry: "Studio Triple", url: "https://www.futurefonts.com/studiotriple/digestive", categories: ["experimental", "display-atmospheric", "wildcards"], type: "display", description: "An Art Nouveau/Gothic collision shaped by seaweed, anatomy, viscera, and long pasta.", useCases: ["titles", "music artwork", "cinematic graphics"], styles: ["Regular"], features: ["alternates"], languages: "Basic and Extended Latin", price: "$129+", interesting: "Its attraction/repulsion balance is unusually specific; it can make organic atmosphere without relying on a texture filter." }),
  font({ ...futureLicense, id: "ff-dunkel-sans", name: "Dunkel Sans 둥켈산스", designer: "Minjoo Ham 함민주", foundry: "Minjoo Ham 함민주", url: "https://www.futurefonts.com/minjoo-ham/dunkel-sans", categories: ["display-atmospheric", "vernacular", "experimental"], type: "display", description: "An extremely black Hangul/Latin display family developed from hand-drawn Korean movie-poster lettering of the 1950s.", useCases: ["posters", "signage", "dense titles"], variable: true, axes: [], features: ["variable"], languages: "Hangul, Basic Latin, Extended Latin", price: "$269+", interesting: "It adds a non-Latin, genuinely vernacular source and tests how far counters can close before display text stops functioning." }),
  font({ ...futureLicense, id: "ff-mara-des-bois", name: "Mara des Bois", designer: "A+", foundry: "A+", url: "https://www.futurefonts.com/aplus/mara-des-bois", categories: ["editorial-literary", "display-atmospheric", "archival-institutional"], type: "serif", description: "An inscriptional Roman and Art Nouveau serif with triangular details and linocut warmth.", useCases: ["book covers", "cultural editorial", "menus", "museum matter"], variable: true, axes: [], features: ["variable", "alternates"], languages: "Basic Latin", price: "$95+", interesting: "Its historical references resolve into warmth rather than nostalgia, useful for literary systems needing ceremony without preciousness." }),
  font({ ...futureLicense, id: "ff-cedar", name: "Cedar", designer: "Jesse Ragan with Vanna Vu", foundry: "XYZ Type", url: "https://www.futurefonts.com/xyz-type/cedar", categories: ["editorial-literary", "display-atmospheric", "experimental"], type: "serif", description: "Calligraphic structures wrapped in rudimentary vectors, producing hand-carved tactility through deliberately digital geometry.", useCases: ["titles", "objects", "inscriptional graphics"], variable: true, axes: [], styles: ["Roman", "Italic"], italic: true, features: ["variable", "italic"], languages: "Basic Latin", price: "$85+", interesting: "It creates material presence structurally, not through distressing or faux-age effects." }),
  font({ ...futureLicense, id: "ff-messer", name: "Messer", designer: "Inga Plönnigs", foundry: "Inga Plönnigs", url: "https://www.futurefonts.com/inga-plonnigs/messer", categories: ["editorial-literary", "archival-institutional"], type: "serif", description: "A sharpened interpretation of Emil Rudolf Weiß’s 1928 Weiss Antiqua, including its inverted S gesture.", useCases: ["books", "essays", "museum text", "literary websites"], styles: ["Roman", "Italic"], italic: true, features: ["alternates", "italic"], languages: "Basic and Extended Latin", price: "$149+", interesting: "A credible text face with a strange recurring structural motif; archival without behaving like a neutral revival." }),
  font({ ...futureLicense, id: "ff-gooper-deck", name: "Gooper Deck", designer: "Very Cool Studio", foundry: "Very Cool Studio", url: "https://www.futurefonts.com/very-cool-studio/gooper-deck", categories: ["editorial-literary", "display-atmospheric", "wildcards"], type: "serif", description: "A swashy, fat-faced oldstyle serif optical cut intended for roughly 24–40 point settings.", useCases: ["section titles", "pull quotes", "covers", "packaging"], styles: ["Roman", "Italic"], italic: true, features: ["optical variants", "alternates", "icons"], languages: "Basic Latin", price: "$64+", interesting: "It is almost useful by design: strong for testing how much goop an editorial hierarchy can absorb before readability collapses." }),

  // Velvetyne — libre/open-source candidates.
  font({ ...velvetyneLicense, id: "vtf-compagnon", name: "Compagnon", designer: "Juliette Duhé, Léa Pradine, Valentin Papon, Chloé Lozano, Sébastien Riollier", foundry: "Velvetyne Type Foundry", url: "https://velvetyne.fr/fonts/compagnon/", categories: ["editorial-literary", "technical-system", "archival-institutional"], type: "mono", description: "Five deliberately distinct styles assembled from different periods of typewriter history.", useCases: ["editorial systems", "records", "captions", "correspondence"], weights: ["Light", "Roman", "Medium", "Bold"], styles: ["Light", "Light Italic", "Roman", "Medium", "Bold"], italic: true, languages: "Latin", binary: true, path: "fonts/velvetyne/compagnon/Compagnon-Roman.woff2", cssWeight: 400, interesting: "It behaves like a small historical ensemble rather than a smooth weight family, excellent for documentary hierarchy." }),
  font({ ...velvetyneLicense, id: "vtf-avara", name: "Avara", designer: "Raphaël Bastide with Wei Huang, Lucas Le Bihan, Walid Bouchouchi, Jérémy Landes", foundry: "Velvetyne Type Foundry", url: "https://velvetyne.fr/fonts/avara/", categories: ["editorial-literary", "experimental"], type: "serif", description: "A curveless transitional serif whose nodes sit on a rough square grid built to make collaboration easier.", useCases: ["editorial display", "publishing", "posters"], weights: ["Bold", "Black"], styles: ["Bold", "Black", "Bold Italic"], italic: true, languages: "Latin", notes: "OFL confirmed on the publisher page. Binary not retained because the current source archive did not include its license text.", interesting: "Its grid constraint remains visible without turning the type into a one-note novelty." }),
  font({ ...velvetyneLicense, id: "vtf-bianzhidai", name: "BianZhiDai", designer: "Xiaoyuan Gao / notyourtypefoundry", foundry: "Velvetyne Type Foundry", sourceSite: "Velvetyne Type Foundry", url: "https://velvetyne.fr/fonts/bianzhidai/", categories: ["early-digital-internet", "vernacular", "experimental"], type: "display", description: "A modular family informed by ASCII shading characters and Chinese woven-plastic bags, with many layered and color styles.", useCases: ["large titles", "layered color typography", "visual systems"], styles: ["Base", "Cube", "Stitches", "Ring", "Pearl", "Bubble", "Messy", "Messier", "Brush", "Cloud", "COLR styles"], languages: "Latin", licenseName: "Free To Use BUT Be Nice License 1.1", licenseUrl: "https://github.com/sdfggvfvj/bianzhidai-2.0/blob/main/LICENSE.md", licenseStatus: "free-restricted", commercial: "permitted-with-credit", web: "permitted-with-credit", permissions: { desktop: "permitted-with-credit", web: "permitted-with-credit", app: "review-license", commercial: "permitted-with-credit", redistribution: "review-license-and-credit" }, notes: "The upstream license changed on 2026-02-26. Older OFL downloads remain OFL; current downloads require designer and publisher credit.", interesting: "It connects early-digital pattern logic to a material vernacular source and can be stacked as an actual modular system." }),
  font({ ...velvetyneLicense, id: "vtf-fungal", name: "Fungal", designer: "Raphaël Bastide and Jérémy Landes", foundry: "Velvetyne Type Foundry", url: "https://velvetyne.fr/fonts/fungal/", categories: ["experimental", "early-digital-internet", "wildcards"], type: "sans", description: "A libre variable fork of DejaVu Sans whose growth and thickness axes treat contamination as collaborative form-making.", useCases: ["kinetic titles", "generative typography", "networked projects"], variable: true, axes: [{ tag: "GROW", name: "Growth", min: 0, default: 0, max: 1000, step: 1 }, { tag: "THCK", name: "Thickness", min: 0, default: 500, max: 1000, step: 1 }], languages: "Latin, Greek, Armenian, Georgian, Cyrillic", interesting: "The growth model is conceptually meaningful and the unusually broad script support makes the experiment more than a Latin demo." }),
  font({ ...velvetyneLicense, id: "vtf-degheest", name: "Degheest", designer: "Ange Degheest with Camille Depalle, Eugénie Bidaut, Luna Delabre, Mandy Elbé, May Jolivet, Oriane Charvieux, Benjamin Gomez, Justine Herbel", foundry: "Velvetyne Type Foundry", url: "https://velvetyne.fr/fonts/degheest/", categories: ["archival-institutional", "vernacular", "early-digital-internet", "wildcards"], type: "other", description: "A multi-family revival and reinterpretation of Ange Degheest’s type work, spanning monoline, geometric, serif, color, and variable forms.", useCases: ["archive projects", "identity systems", "historical remixes"], styles: ["Abordage", "Basalte", "Director", "Equateur", "FT88", "Latitude", "Louise"], variable: true, axes: [], languages: "Latin", interesting: "It is an archive one can operate rather than a single revival, with unusually wide internal stylistic disagreement." }),
  font({ ...velvetyneLicense, id: "vtf-pilowlava", name: "Pilowlava", designer: "Anton Moglia and Jérémy Landes", foundry: "Velvetyne Type Foundry", url: "https://velvetyne.fr/fonts/pilowlava/", categories: ["experimental", "display-atmospheric"], type: "display", description: "A soft, inflated variable display face that interpolates between restrained and swollen letterforms.", useCases: ["kinetic titles", "music visuals", "soft sculptural display"], variable: true, axes: [], languages: "Latin", notes: "Variable behavior is confirmed by the publisher; exact axis metadata awaits inspection of a licensed current binary.", interesting: "It offers physical transformation without glow, noise, or other decorative effects; the deformation is the lettering itself." }),
  font({ ...velvetyneLicense, id: "vtf-steps-mono", name: "Steps Mono", designer: "Jean-Baptiste Morizot and Raphaël Bastide", foundry: "Velvetyne Type Foundry", url: "https://velvetyne.fr/fonts/steps-mono/", categories: ["technical-system", "archival-institutional", "early-digital-internet"], type: "mono", description: "A collaborative condensed, curveless monospace created for Étapes magazine.", useCases: ["metadata", "technical panels", "captions", "dense lists"], weights: ["Thin", "Mono"], styles: ["Thin", "Mono"], languages: "Latin", interesting: "Its narrow curveless construction is severe but readable enough for actual record systems." }),
  font({ ...velvetyneLicense, id: "vtf-vg5000", name: "VG5000", designer: "Justin Bihan", foundry: "Velvetyne Type Foundry", url: "https://velvetyne.fr/fonts/vg5000/", categories: ["early-digital-internet", "technical-system"], type: "mono", description: "A bitmap-derived family based on the Thomson VG5000 home computer and its limited character environment.", useCases: ["software UI references", "low-resolution labels", "media graphics"], weights: ["Regular"], styles: ["Regular"], languages: "Latin", interesting: "It carries a specific obsolete-computer lineage rather than generic pixel-font nostalgia." }),
  font({ ...velvetyneLicense, id: "vtf-terminal-grotesque", name: "Terminal Grotesque", designer: "Raphaël Bastide with Jérémy Landes", foundry: "Velvetyne Type Foundry", url: "https://velvetyne.fr/fonts/terminal-grotesque/", categories: ["technical-system", "early-digital-internet", "experimental"], type: "sans", description: "A raw terminal-era grotesque with awkward construction and intentionally uneven informational texture.", useCases: ["display terminals", "posters", "broadcast labels"], weights: ["Regular"], styles: ["Regular"], languages: "Latin", interesting: "A useful anti-neutral system face: crude enough to carry pressure, structured enough to remain legible." }),
  font({ ...velvetyneLicense, id: "vtf-karrik", name: "Karrik", designer: "Jean-Baptiste Morizot and Lucas Le Bihan", foundry: "Velvetyne Type Foundry", url: "https://velvetyne.fr/fonts/karrik/", categories: ["ui-body", "vernacular", "experimental"], type: "sans", description: "A blunt, irregular sans whose spacing and silhouettes resist the smoothness of contemporary grotesks.", useCases: ["interfaces with character", "posters", "navigation", "short text"], weights: ["Regular", "Italic"], styles: ["Regular", "Italic"], italic: true, languages: "Latin", interesting: "It can carry ordinary interface strings while keeping visible seams and eccentric proportions." }),
  font({ ...velvetyneLicense, id: "vtf-cirrus-cumulus", name: "CirrusCumulus", designer: "Clara Sambot", foundry: "Velvetyne Type Foundry", url: "https://velvetyne.fr/fonts/cirruscumulus/", categories: ["display-atmospheric", "wildcards"], type: "display", description: "An all-cap cloudlike display alphabet made from restrained, rounded masses and weather-symbol logic.", useCases: ["titles", "weather or environmental graphics", "ornamental labels"], weights: ["Regular"], styles: ["Regular"], languages: "Latin", interesting: "Atmosphere comes from construction and silhouette, making it useful for soft uncanny work without visual effects." }),

  // UNCUT — open-font excavation.
  font({ ...uncutLicense, id: "uncut-maname", name: "Maname", designer: "Mooniak", url: "https://uncut.wtf/serif/maname/", categories: ["editorial-literary", "vernacular"], type: "serif", description: "A single-cut serif from Sri Lankan type studio Mooniak, useful as a regional counterweight to European editorial references.", useCases: ["editorial display", "cultural publishing"], weights: ["Regular"], styles: ["Regular"], languages: "Not recorded", interesting: "A compact way to diversify provenance while retaining plausible editorial use." }),
  font({ ...uncutLicense, id: "uncut-minipax", name: "Minipax", designer: "Raphaël Ronot", url: "https://uncut.wtf/serif/minipax/", categories: ["editorial-literary", "archival-institutional"], type: "serif", description: "A four-cut serif with literary and institutional severity.", useCases: ["essays", "book matter", "archive headings"], weights: ["4 cuts"], styles: ["4 cuts"], languages: "Not recorded", interesting: "It offers a quieter open-source editorial anchor among the pass’s louder faces." }),
  font({ ...uncutLicense, id: "uncut-whois", name: "Whois", designer: "Raphaël Bastide", url: "https://uncut.wtf/monospace/whois/", categories: ["technical-system", "early-digital-internet"], type: "mono", description: "A one-cut monospace whose name and context align naturally with network identity and registry data.", useCases: ["URLs", "usernames", "records", "network tools"], weights: ["Regular"], styles: ["Regular"], languages: "Not recorded", interesting: "A focused network-administrative voice with less developer-tool polish than mainstream coding fonts." }),
  font({ ...uncutLicense, id: "uncut-queering", name: "Queering", designer: "Adam Naccarato", url: "https://uncut.wtf/display/queering/", categories: ["experimental", "display-atmospheric", "wildcards"], type: "display", description: "A five-cut variable display family built for expressive transformation.", useCases: ["posters", "kinetic titles", "identity experiments"], weights: ["5 cuts"], styles: ["5 cuts including variable"], variable: true, axes: [], languages: "Not recorded", interesting: "A useful social and formal wildcard whose variable behavior deserves direct axis inspection in a later download pass." }),
  font({ ...uncutLicense, id: "uncut-utara", name: "Utara", designer: "Deni Anggara and Fadhl Haqq", url: "https://uncut.wtf/display/utara/", categories: ["vernacular", "display-atmospheric", "experimental"], type: "display", description: "An Indonesian-designed five-cut variable display family with strong regional and ornamental potential.", useCases: ["titles", "posters", "regional cultural work"], weights: ["5 cuts"], styles: ["5 cuts including variable"], variable: true, axes: [], languages: "Not recorded", interesting: "It broadens both geographic provenance and display construction beyond the familiar European indie circuit." }),
  font({ ...uncutLicense, id: "uncut-haskoy", name: "Hasköy", designer: "Ertekin Erdin", url: "https://uncut.wtf/sans-serif/haskoy/", categories: ["ui-body", "technical-system"], type: "sans", description: "A sixteen-cut variable sans with enough range for sustained interface and documentation testing.", useCases: ["apps", "dashboards", "documentation", "social feeds"], weights: ["16 cuts"], styles: ["16 cuts including variable"], variable: true, axes: [], languages: "Not recorded", interesting: "A practical UI control candidate from an independent source, included to keep the lab grounded in sustained readability." }),

  // Too Much Type — downloadable OFL experiments.
  font({ ...tmtLicense, id: "tmt-caffeine", name: "Caffeine", url: "https://toomuchtype.com/", categories: ["experimental", "display-atmospheric"], type: "display", description: "A variable drawing-like family with independent Scribble and Scrabble axes.", useCases: ["kinetic titles", "handmade digital graphics", "interactive lettering"], styles: ["Regular", "Scribble", "Scrabble", "Scrobble"], variable: true, axes: [{ tag: "SCRI", name: "Scribble", min: 0, default: 0, max: 100, step: 1 }, { tag: "SCRA", name: "Scrabble", min: 0, default: 0, max: 100, step: 1 }], languages: "Latin", binary: true, path: "fonts/too-much-type/caffeine/TMT-CaffeineVF.woff2", interesting: "Two independent roughness systems let the letterforms change behavior instead of merely adding a distressed surface." }),
  font({ ...tmtLicense, id: "tmt-mini-mochi", name: "Mini Mochi", url: "https://toomuchtype.com/fonts/mini-mochi/", categories: ["experimental", "display-atmospheric", "wildcards"], type: "display", description: "A cube-like display alphabet whose stretch, flavor, and slice axes mutate counterforms and switch curves into straight lines.", useCases: ["interactive titles", "motion systems", "small playful artifacts"], styles: ["Variable"], variable: true, axes: [{ tag: "STCH", name: "Stretch", min: 0, default: 50, max: 100, step: 1 }, { tag: "FLAV", name: "Flavor", min: 0, default: 0, max: 100, step: 1 }, { tag: "SLCE", name: "Slice", min: 0, default: 0, max: 100, step: 1 }], languages: "Uppercase Latin and numerals", binary: true, path: "fonts/too-much-type/mini-mochi/TMT-MiniMochiVF.woff2", interesting: "Three legible conceptual axes make it an unusually good test object for interactive and generative typography." }),
  font({ ...tmtLicense, id: "tmt-music-box", name: "Music Box", url: "https://toomuchtype.com/fonts/music-box/", categories: ["experimental", "wildcards"], type: "display", description: "A variable alphabet connecting counter shape to musical amplitude and frequency.", useCases: ["music visuals", "audio-reactive typography", "kinetic labels"], styles: ["Variable"], variable: true, axes: [{ tag: "FREQ", name: "Frequency", min: -100, default: 0, max: 100, step: 1 }, { tag: "AMPL", name: "Amplitude", min: 0, default: 50, max: 100, step: 1 }], languages: "Uppercase Latin and numerals", binary: true, path: "fonts/too-much-type/music-box/TMT-MusicBoxVF.woff2", interesting: "The axes map cleanly to sound concepts, making it immediately relevant to browser music systems and performance visuals." }),
  font({ ...tmtLicense, id: "tmt-powerpack", name: "PowerPack", url: "https://toomuchtype.com/", categories: ["experimental", "early-digital-internet", "wildcards"], type: "display", description: "A variable display family controlled by Charge and Power axes, like a typographic device state.", useCases: ["status graphics", "game-like interfaces", "animated titles"], styles: ["Variable"], variable: true, axes: [{ tag: "CHRG", name: "Charge", min: 0, default: 0, max: 100, step: 1 }, { tag: "POWR", name: "Power", min: 0, default: 0, max: 100, step: 1 }], languages: "Latin and numerals", binary: true, path: "fonts/too-much-type/powerpack/TMT-PowerPackVF.woff2", interesting: "The axis model communicates a visible system state, a better reason to animate than ambient motion." }),
  font({ ...tmtLicense, id: "tmt-limkin", name: "Limkin", url: "https://toomuchtype.com/", categories: ["ui-body", "editorial-literary", "experimental"], type: "sans", description: "A broad variable superfamily interpolating weight and the presence of serif/flare construction.", useCases: ["responsive identities", "editorial systems", "interfaces"], weights: ["100–900"], styles: ["Sans", "Flare", "Serif"], variable: true, axes: [{ tag: "wght", name: "Weight", min: 100, default: 500, max: 900, step: 1 }, { tag: "SRFF", name: "Serif", min: 0, default: 0, max: 100, step: 1 }], languages: "Extended Latin and Greek symbols", licenseName: "Site-declared open source; current archive lacks a license file", licenseUrl: "https://toomuchtype.com/", licenseStatus: "unclear", commercial: "review-required", web: "review-required", permissions: { desktop: "review-required", web: "review-required", app: "review-required", commercial: "review-required", redistribution: "do-not-redistribute" }, formats: ["WOFF2", "WOFF", "OTF", "variable TTF"], notes: "The archive was inspected but not retained because it contained no license file. Ask the designer to confirm the exact license before local bundling.", interesting: "Its serif axis makes it a potential one-family transition system, but it stays quarantined until the license is explicit." }),

  // Point Type — paid/reference candidates.
  font({ ...pointLicense, id: "point-ohseeour", name: "OhSeeOur", url: "https://www.point-type.com/fonts/ohseeour", categories: ["technical-system", "archival-institutional", "vernacular"], type: "mono", description: "A historical systems-based monospaced stencil reframed for legible contemporary flyers.", useCases: ["labels", "signage", "flyers", "system panels"], interesting: "It connects stencil logistics, monospacing, and vernacular nightlife material without military cosplay." }),
  font({ ...pointLicense, id: "point-digiwooca", name: "Digiwooca", url: "https://www.point-type.com/fonts/digiwooca", categories: ["technical-system", "vernacular", "experimental"], type: "display", description: "Pixel-camouflage and U.S. military utility forms pushed toward an unexpectedly organic alphabet.", useCases: ["posters", "artifact labels", "display systems"], interesting: "The tension between tactical construction and improvised organic shape gives it more range than a standard stencil face." }),
  font({ ...pointLicense, id: "point-dgtl25", name: "DGTL25", url: "https://www.point-type.com/fonts/dgtl25", categories: ["early-digital-internet", "technical-system", "display-atmospheric"], type: "display", description: "A contemporary digital display family from Point Type’s systems-oriented catalog.", useCases: ["digital signage", "titles", "data graphics"], interesting: "A useful paid comparison against the lab’s genuinely historical bitmap and console-derived open fonts." }),
  font({ ...pointLicense, id: "point-chicagoland", name: "Chicagoland", url: "https://www.point-type.com/fonts/chicagoland", categories: ["vernacular", "archival-institutional"], type: "display", description: "A regional display family from a foundry produced by the Chicago Graphic Design Club.", useCases: ["regional editorial", "signage", "civic graphics"], interesting: "It adds explicit regional provenance and a local-design-club context to the collection." }),

  // En Travaux — restricted/reference candidates because of EULA conflict.
  font({ ...entravauxLicense, id: "entx-peix", name: "Péix Variable", designer: "Audrey Aujoulat and ENTX Team", url: "https://entravaux.gumroad.com/l/Peix", categories: ["experimental", "display-atmospheric"], type: "display", description: "A free variable family with more than ten styles and four axes.", useCases: ["kinetic display", "identity experiments", "titles"], styles: ["10+ styles"], variable: true, axes: [], price: "Free", interesting: "Four axes make it one of the pass’s densest variable systems, but its web use needs clarification before local embedding." }),
  font({ ...entravauxLicense, id: "entx-airbag", name: "Airbag Variable", designer: "Jérémy Fiévet and ENTX Team", url: "https://entravaux.gumroad.com/", categories: ["experimental", "display-atmospheric"], type: "display", description: "A variable display family sold by style with an accompanying italic.", useCases: ["titles", "posters", "motion"], styles: ["Variable", "Italic"], italic: true, variable: true, axes: [], price: "€20 minimum", interesting: "Its inflation-oriented premise is worth comparing directly with Pilowlava’s softer open-source deformation." }),
  font({ ...entravauxLicense, id: "entx-peridia", name: "Péridia", designer: "Alec Vivier-Reynaud and ENTX Team", url: "https://entravaux.gumroad.com/l/peridia", categories: ["editorial-literary", "display-atmospheric"], type: "serif", description: "A two-style Light and Regular family with a free trial and paid full license.", useCases: ["editorial display", "covers", "titles"], weights: ["Light", "Regular"], styles: ["Light", "Regular"], licenseStatus: "trial-only", commercial: "paid-license-required", price: "€20; free trial", interesting: "A restrained counterpoint to the more theatrical serifs, potentially useful for elegant systems if the full license proves worthwhile." }),
  font({ ...entravauxLicense, id: "entx-cloitre", name: "Cloître Display", designer: "Dorian Delavault", url: "https://entravaux.gumroad.com/", categories: ["archival-institutional", "display-atmospheric"], type: "display", description: "A free display family in Regular and Rounded styles with cloistered, inscriptional associations.", useCases: ["titles", "institutional graphics", "cultural programs"], styles: ["Regular", "Rounded"], price: "Free", interesting: "The paired hard/rounded cuts could build a small institutional hierarchy without adding another generic sans." }),

  // PSY/OPS — paid/reference candidates.
  font({ ...psyopsLicense, id: "psyops-motorix", name: "Motorix", designer: "Monica Maccaux with RXC", url: "https://www.psyops.com/", categories: ["experimental", "early-digital-internet", "wildcards"], type: "display", description: "A six-font experimental system that self-randomizes its forms.", useCases: ["generative typography", "titles", "interactive media"], styles: ["6 fonts"], price: "$24+", interesting: "Randomization is built into the type system rather than simulated with a visual effect, making it a serious generative candidate." }),
  font({ ...psyopsLicense, id: "psyops-eidetic-neo", name: "Eidetic Neo", designer: "RXC for Emigre", url: "https://www.psyops.com/", categories: ["editorial-literary", "early-digital-internet"], type: "serif", description: "A seven-font postmodern transitional serif associated with Emigre’s digital-era typographic culture.", useCases: ["editorial systems", "cultural publishing", "titles"], styles: ["7 fonts"], price: "$39+", interesting: "It links serious editorial structure to the desktop-publishing era without resorting to bitmap pastiche." }),
  font({ ...psyopsLicense, id: "psyops-goosebreak", name: "Goosebreak", designer: "André Simard", url: "https://www.psyops.com/", categories: ["archival-institutional", "wildcards"], type: "other", description: "A twelve-font Canadian Aboriginal Syllabics type system.", useCases: ["multiscript research", "cultural and language projects"], styles: ["12 fonts"], languages: "Canadian Aboriginal Syllabics", price: "$19+", interesting: "It exposes the lab to a writing system and design problem radically outside Latin-centric brand typography." }),

  // Typodermic public-domain archive.
  font({ ...cc0License, id: "typo-1980-portable", name: "1980 Portable", url: "https://typodermicfonts.com/public-domain/", categories: ["early-digital-internet", "technical-system"], type: "display", description: "A 1998 homage to the bitmap lettering that visually defined the 1980s.", useCases: ["old software UI", "low-resolution titles", "media graphics"], styles: ["Regular"], languages: "Latin", interesting: "Specific bitmap-era construction from a designer working close to the period, not a contemporary retro filter." }),
  font({ ...cc0License, id: "typo-betsy-flanagan", name: "Betsy Flanagan", url: "https://typodermicfonts.com/public-domain/", categories: ["archival-institutional", "technical-system", "early-digital-internet"], type: "display", description: "A 1998 utilitarian family modeled on keyboard-cap diagrams in software manuals.", useCases: ["instructions", "key labels", "technical diagrams", "button systems"], styles: ["Regular"], languages: "Latin", interesting: "A direct bridge between manual illustration, hardware labeling, and interface components." }),
  font({ ...cc0License, id: "typo-fake-receipt", name: "Fake Receipt", url: "https://typodermicfonts.com/public-domain/", categories: ["vernacular", "early-digital-internet", "archival-institutional"], type: "mono", description: "A rough, slightly misaligned low-resolution cash-register receipt face built from overlapping ellipses.", useCases: ["transaction records", "tickets", "ephemera", "timestamps"], styles: ["Regular"], languages: "Latin", interesting: "A rare transactional vernacular reference whose imperfections come from a construction method, not a damage texture." }),
  font({ ...cc0License, id: "typo-karma", name: "Karma", url: "https://typodermicfonts.com/public-domain/", categories: ["early-digital-internet", "technical-system"], type: "mono", description: "A 1998 attempt to capture bitmap fonts generated by adjusting Windows console settings in the 1990s.", useCases: ["terminal text", "software mockups", "system labels"], styles: ["Regular"], languages: "Latin", interesting: "Its source is an actual configurable console environment, useful for pre-Web-2.0 system research." }),
  font({ ...cc0License, id: "typo-minisystem", name: "Minisystem", url: "https://typodermicfonts.com/public-domain/", categories: ["early-digital-internet", "technical-system", "vernacular"], type: "display", description: "A segmented display family based on fluorescent readouts in 1990s Technics audio systems.", useCases: ["audio interfaces", "status readouts", "equipment labels"], styles: ["Regular"], languages: "Latin", interesting: "Its consumer-electronics origin makes it immediately useful for music tools and device-like browser interfaces." }),
  font({ ...cc0License, id: "typo-trs-million", name: "TRS-Million", url: "https://typodermicfonts.com/public-domain/", categories: ["early-digital-internet", "experimental"], type: "display", description: "A coarse segmented LED clock alphabet with a separate sparkle layer of randomized switched pixels.", useCases: ["time displays", "animated status graphics", "layered titles"], styles: ["Base", "Sparkle layer"], languages: "Latin and numerals", interesting: "Layering and randomized pixels create meaningful state variation while remaining tied to an actual display technology." }),
];

const output = { schemaVersion: 1, lastUpdated: date, researchPass: 1, categories, fonts };
await writeFile(new URL("metadata.json", import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${fonts.length} researched font records.`);

import { readFile, readdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const DESIGN_COMPONENTS_IMPORT = '@import "./components.css";';
const DESIGN_STYLEX_IMPORT = '@import "../dist/stylex.css";';
const GALLERY_LAYER_CONFLICT_SENTINEL = "data-design-kit-stylex-";
const LOCAL_LAYER_PRELUDE =
  "@layer components.hraness-design-kit.legacy, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3;";
const PORTFOLIO_LAYER_PRELUDE =
  "@layer components.hraness-ui.legacy, components.hraness-ui.priority1, components.hraness-ui.priority2, components.hraness-ui.priority3, components.hraness-design-kit.legacy, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3;";
const TOP_LEVEL_LAYER_PRELUDE = "@layer base, components;";
const UI_COMPONENTS_IMPORT = '@import "@hraness/ui/components.css";';
const UI_STYLEX_IMPORT = '@import "@hraness/ui/stylex.css";';

const DESIGN_STYLEX_LAYERS = [
  "components.hraness-design-kit.priority1",
  "components.hraness-design-kit.priority2",
  "components.hraness-design-kit.priority3",
] as const;
const UI_LEGACY_LAYERS = [
  "components.hraness-ui.legacy.base",
  "components.hraness-ui.legacy",
] as const;
const UI_STYLEX_LAYERS = [
  "components.hraness-ui.priority1",
  "components.hraness-ui.priority2",
  "components.hraness-ui.priority3",
] as const;

function requireMatch(source: string, pattern: RegExp, description: string): void {
  if (!pattern.test(source)) {
    throw new Error(`StyleX artifact is missing ${description}`);
  }
}

function forbid(source: string, pattern: RegExp, description: string): void {
  if (pattern.test(source)) {
    throw new Error(`StyleX artifact unexpectedly contains ${description}`);
  }
}

function topLevelStatements(source: string, description: string): string[] {
  const statements: string[] = [];
  let blockDepth = 0;
  let escaped = false;
  let start = -1;
  let stringQuote: '"' | "'" | undefined;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];
    if (character === undefined) continue;

    if (stringQuote !== undefined) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === stringQuote) {
        stringQuote = undefined;
      }
      continue;
    }

    if (character === "/" && nextCharacter === "*") {
      const commentEnd = source.indexOf("*/", index + 2);
      if (commentEnd < 0) {
        throw new Error(`${description} contains an unterminated comment`);
      }
      index = commentEnd + 1;
      continue;
    }

    if (start < 0) {
      if (/\s/u.test(character)) continue;
      start = index;
    }

    if (character === '"' || character === "'") {
      stringQuote = character;
      continue;
    }

    if (character === "{") {
      blockDepth += 1;
      continue;
    }
    if (character === "}") {
      blockDepth -= 1;
      if (blockDepth < 0) {
        throw new Error(`${description} contains an unmatched closing brace`);
      }
      if (blockDepth === 0 && start >= 0) {
        statements.push(source.slice(start, index + 1).trim());
        start = -1;
      }
      continue;
    }
    if (character === ";" && blockDepth === 0 && start >= 0) {
      statements.push(source.slice(start, index + 1).trim());
      start = -1;
    }
  }

  if (stringQuote !== undefined || blockDepth !== 0) {
    throw new Error(`${description} contains an unterminated CSS construct`);
  }
  if (start >= 0 && source.slice(start).trim().length > 0) {
    throw new Error(`${description} contains an unterminated top-level statement`);
  }
  return statements;
}

function requireOnlyLayerBlocks(
  source: string,
  allowedLayers: ReadonlySet<string>,
  description: string,
): string[] {
  const statements = topLevelStatements(source, description);
  if (statements.length === 0) {
    throw new Error(`${description} must contain a named layer block`);
  }

  return statements.map((statement) => {
    const layer = statement.match(/^@layer\s+([A-Za-z0-9_.-]+)\s*\{/u)?.[1];
    if (layer === undefined || !allowedLayers.has(layer)) {
      throw new Error(
        `${description} contains top-level content outside its allowed named layers`,
      );
    }
    return layer;
  });
}

function requireGeneratedLayerContract(
  source: string,
  allowedLayers: readonly string[],
  description: string,
  requiredLayers: readonly string[] = allowedLayers,
): void {
  const layers = requireOnlyLayerBlocks(
    source,
    new Set(allowedLayers),
    description,
  );
  for (const layer of requiredLayers) {
    if (!layers.includes(layer)) {
      throw new Error(`${description} must declare ${layer}`);
    }
  }
}

function requireLocalComponentsContract(source: string): void {
  const statements = topLevelStatements(source, "src/components.css");
  const legacyLayer = statements[2]?.match(
    /^@layer\s+(components\.hraness-design-kit\.legacy)\s*\{/u,
  )?.[1];
  if (statements.length !== 3
    || statements[0] !== LOCAL_LAYER_PRELUDE
    || statements[1] !== DESIGN_STYLEX_IMPORT
    || legacyLayer !== "components.hraness-design-kit.legacy") {
    throw new Error(
      "src/components.css must contain the exact local layer prelude, one StyleX import, and one legacy layer block with no bare or unlayered rules",
    );
  }
}

function requireAggregateContract(source: string): void {
  const expectedStatements = [
    TOP_LEVEL_LAYER_PRELUDE,
    PORTFOLIO_LAYER_PRELUDE,
    '@import "./tokens.css";',
    '@import "./reset.css";',
    '@import "./typography.css";',
    '@import "./syntax-highlighting.css";',
    '@import "./effects.css";',
    UI_COMPONENTS_IMPORT,
    UI_STYLEX_IMPORT,
    DESIGN_COMPONENTS_IMPORT,
    '@import "./appearance-menu.css";',
    '@import "./charts.css";',
    '@import "./jelly.css";',
    '@import "./plain-site.css";',
    '@import "./plain-publication.css";',
    '@import "./design-gallery.css";',
  ];
  const statements = topLevelStatements(source, "src/styles.css");
  if (statements.length !== expectedStatements.length
    || statements.some((statement, index) => statement !== expectedStatements[index])) {
    throw new Error(
      "src/styles.css must contain the exact base < components and UI legacy < UI priority1/2/3 < design-kit legacy < design-kit priority1/2/3 preludes before its ordered imports",
    );
  }
}

function replaceExactlyOnce(
  source: string,
  target: string,
  replacement: string,
  description: string,
): string {
  const firstIndex = source.indexOf(target);
  const lastIndex = source.lastIndexOf(target);
  if (firstIndex < 0 || firstIndex !== lastIndex) {
    throw new Error(
      `Cannot build the ${description} mutation because its target occurs ${firstIndex < 0 ? "zero" : "more than one"} times`,
    );
  }
  return `${source.slice(0, firstIndex)}${replacement}${source.slice(firstIndex + target.length)}`;
}

function requireMutationRejected(description: string, validate: () => void): void {
  try {
    validate();
  } catch {
    return;
  }
  throw new Error(`StyleX artifact validators accepted the ${description} mutation`);
}

function requireMutationNegativeContracts(
  designCompiledCss: string,
  uiCompiledCss: string,
  localComponents: string,
  aggregateStylesheet: string,
): number {
  const localLegacyLayer = "@layer components.hraness-design-kit.legacy {";
  const invertedLocalPrelude =
    "@layer components.hraness-design-kit.legacy, components.hraness-design-kit.priority2, components.hraness-design-kit.priority1, components.hraness-design-kit.priority3;";
  const invertedPortfolioPrelude =
    "@layer components.hraness-ui.legacy, components.hraness-ui.priority1, components.hraness-ui.priority2, components.hraness-design-kit.legacy, components.hraness-ui.priority3, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3;";
  const localMutations = [
    [
      "direct-parent local legacy restoration",
      replaceExactlyOnce(
        localComponents,
        localLegacyLayer,
        "@layer components {",
        "direct-parent local legacy restoration",
      ),
    ],
    [
      "wrong local legacy layer",
      replaceExactlyOnce(
        localComponents,
        localLegacyLayer,
        "@layer components.hraness-ui.legacy {",
        "wrong local legacy layer",
      ),
    ],
    [
      "unlayered local handwritten rule",
      `${localComponents}\n.hraness-design-unlayered-mutation { color: red; }\n`,
    ],
    [
      "missing local StyleX import",
      replaceExactlyOnce(
        localComponents,
        `${DESIGN_STYLEX_IMPORT}\n`,
        "",
        "missing local StyleX import",
      ),
    ],
    [
      "duplicate local StyleX import",
      replaceExactlyOnce(
        localComponents,
        DESIGN_STYLEX_IMPORT,
        `${DESIGN_STYLEX_IMPORT}\n${DESIGN_STYLEX_IMPORT}`,
        "duplicate local StyleX import",
      ),
    ],
    [
      "inverted local layer prelude",
      replaceExactlyOnce(
        localComponents,
        LOCAL_LAYER_PRELUDE,
        invertedLocalPrelude,
        "inverted local layer prelude",
      ),
    ],
    [
      "missing local layer prelude",
      replaceExactlyOnce(
        localComponents,
        `${LOCAL_LAYER_PRELUDE}\n`,
        "",
        "missing local layer prelude",
      ),
    ],
  ] as const;

  const aggregateMutations = [
    [
      "aggregate UI/design-kit priority inversion",
      replaceExactlyOnce(
        aggregateStylesheet,
        PORTFOLIO_LAYER_PRELUDE,
        invertedPortfolioPrelude,
        "aggregate UI/design-kit priority inversion",
      ),
    ],
    [
      "aggregate base/components inversion",
      replaceExactlyOnce(
        aggregateStylesheet,
        TOP_LEVEL_LAYER_PRELUDE,
        "@layer components, base;",
        "aggregate base/components inversion",
      ),
    ],
    [
      "missing aggregate UI StyleX import",
      replaceExactlyOnce(
        aggregateStylesheet,
        `${UI_STYLEX_IMPORT}\n`,
        "",
        "missing aggregate UI StyleX import",
      ),
    ],
    [
      "duplicate aggregate UI StyleX import",
      replaceExactlyOnce(
        aggregateStylesheet,
        UI_STYLEX_IMPORT,
        `${UI_STYLEX_IMPORT}\n${UI_STYLEX_IMPORT}`,
        "duplicate aggregate UI StyleX import",
      ),
    ],
  ] as const;

  const generatedMutations = [
    [
      "unlayered generated design-kit rule",
      () => requireGeneratedLayerContract(
        `${designCompiledCss}\n.x-design-unlayered-mutation { color: red; }\n`,
        DESIGN_STYLEX_LAYERS,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "undeclared generated design-kit priority layer",
      () => requireGeneratedLayerContract(
        `${designCompiledCss}\n@layer components.hraness-design-kit.priority4 { .x-design-priority4-mutation { color: red; } }\n`,
        DESIGN_STYLEX_LAYERS,
        "mutated dist/stylex.css",
      ),
    ],
    [
      "unlayered generated UI rule",
      () => requireGeneratedLayerContract(
        `${uiCompiledCss}\n.x-ui-unlayered-mutation { color: red; }\n`,
        UI_STYLEX_LAYERS,
        "mutated @hraness/ui stylex.css",
      ),
    ],
    [
      "undeclared generated UI priority layer",
      () => requireGeneratedLayerContract(
        `${uiCompiledCss}\n@layer components.hraness-ui.priority4 { .x-ui-priority4-mutation { color: red; } }\n`,
        UI_STYLEX_LAYERS,
        "mutated @hraness/ui stylex.css",
      ),
    ],
  ] as const;

  for (const [description, mutation] of localMutations) {
    requireMutationRejected(
      description,
      () => requireLocalComponentsContract(mutation),
    );
  }
  for (const [description, mutation] of aggregateMutations) {
    requireMutationRejected(
      description,
      () => requireAggregateContract(mutation),
    );
  }
  for (const [description, validate] of generatedMutations) {
    requireMutationRejected(description, validate);
  }

  return localMutations.length + aggregateMutations.length + generatedMutations.length;
}

async function JavaScriptBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return JavaScriptBelow(path);
    return entry.name.endsWith(".js") ? [path] : [];
  }));
  return nested.flat();
}

const repository = process.cwd();
const dist = resolve(repository, "dist");
const javaScriptPaths = await JavaScriptBelow(dist);
const javaScriptSources = new Map(await Promise.all(
  javaScriptPaths.map(async (path) => [path, await readFile(path, "utf8")] as const),
));
const [
  compiledCss,
  orderedStylesheet,
  legacyComponents,
  uiLegacyComponents,
  uiCompiledCss,
] = await Promise.all([
  readFile(resolve(dist, "stylex.css"), "utf8"),
  readFile(resolve(repository, "src/styles.css"), "utf8"),
  readFile(resolve(repository, "src/components.css"), "utf8"),
  readFile(resolve(repository, "node_modules/@hraness/ui/src/components.css"), "utf8"),
  readFile(resolve(repository, "node_modules/@hraness/ui/dist/stylex.css"), "utf8"),
]);
const compiledJavaScript = [...javaScriptSources.values()].join("\n");

if (compiledCss.trim().length === 0) {
  throw new Error("dist/stylex.css is empty");
}

requireMatch(
  compiledCss,
  /@layer components\.hraness-design-kit\.priority1\s*\{/u,
  "the package-owned priority1 layer",
);
requireMatch(
  compiledCss,
  /@layer components\.hraness-design-kit\.priority3\s*\{/u,
  "the package-owned priority3 layer",
);
requireMatch(
  compiledCss,
  /@layer components\.hraness-design-kit\.priority2\s*\{/u,
  "the package-owned priority2 layer",
);
const noticeDeclarations: readonly (readonly [RegExp, string])[] = [
  [/align-items:\s*center;/u, "root align-items"],
  [/background-color:\s*(?:#ffcc33|#fc3);/u, "root background-color"],
  [/border-bottom-color:\s*#5c1906;/u, "root border-block-end color"],
  [/border-bottom-style:\s*solid;/u, "root border-block-end style"],
  [/border-bottom-width:\s*2px;/u, "root border-block-end width"],
  [/box-shadow:\s*0\s+3px\s+12px\s+#24140059;/u, "root box-shadow"],
  [/color:\s*#241400;/u, "root color"],
  [/display:\s*flex;/u, "root display"],
  [/flex-wrap:\s*wrap;/u, "root flex-wrap"],
  [/font-family:\s*var\(--font-text,\s*system-ui,\s*sans-serif\);/u, "root font-family"],
  [/font-size:\s*var\(--text-label,\s*0?\.875rem\);/u, "root font-size"],
  [/gap:\s*var\(--space-1,\s*0?\.25rem\)\s+var\(--space-3,\s*0?\.75rem\);/u, "root gap"],
  [/top:\s*0;/u, "root logical block-start inset"],
  [/justify-content:\s*center;/u, "root justify-content"],
  [/line-height:\s*1\.35;/u, "root line-height"],
  [/min-height:\s*3rem;/u, "root min-height"],
  [/padding-block:\s*max\(var\(--space-2,\s*0?\.5rem\),\s*env\(safe-area-inset-top\)\);/u, "root padding-block"],
  [/padding-inline:\s*max\(var\(--space-4,\s*1rem\),\s*env\(safe-area-inset-left\)\)\s+max\(var\(--space-4,\s*1rem\),\s*env\(safe-area-inset-right\)\);/u, "root padding-inline"],
  [/position:\s*sticky;/u, "root position"],
  [/text-align:\s*center;/u, "root text-align"],
  [/width:\s*100%;/u, "root width"],
  [/z-index:\s*calc\(var\(--z-tooltip,\s*3000\)\s*\+\s*1\);/u, "root z-index"],
  [/font-weight:\s*var\(--font-weight-bold,\s*700\);/u, "emphasis font-weight"],
  [/letter-spacing:\s*0?\.04em;/u, "emphasis letter-spacing"],
  [/text-transform:\s*uppercase;/u, "emphasis text-transform"],
];
for (const [pattern, description] of noticeDeclarations) {
  requireMatch(compiledCss, pattern, `the notice ${description} declaration`);
}
requireMatch(
  compiledJavaScript,
  /from\s*["']react\/jsx-runtime["']/u,
  "the production React JSX runtime",
);
requireMatch(
  compiledJavaScript,
  /from\s*["']@stylexjs\/stylex["']/u,
  "the static StyleX props runtime",
);
requireMatch(
  compiledJavaScript,
  /querySelector\(["']\.hraness-design-jelly-surface["']\)/u,
  "the no-surface Jelly runtime guard",
);

const jellyTokenArtifacts = [...javaScriptSources]
  .filter(([, source]) => source.includes("data-jelly-tokens"));
if (jellyTokenArtifacts.length !== 1) {
  throw new Error(
    `expected one isolated Jelly vendor artifact, found ${jellyTokenArtifacts.length}`,
  );
}
const jellyTokenArtifact = jellyTokenArtifacts[0];
if (jellyTokenArtifact === undefined) {
  throw new Error("the isolated Jelly vendor artifact is missing");
}
const [jellyTokenPath] = jellyTokenArtifact;
const jellyTokenFile = basename(jellyTokenPath);
const escapedJellyTokenFile = jellyTokenFile.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
const staticJellyImport = new RegExp(
  `(?:from\\s*|import\\s*)["'][^"']*${escapedJellyTokenFile}["']`,
  "u",
);
for (const [path, source] of javaScriptSources) {
  if (path !== jellyTokenPath && staticJellyImport.test(source)) {
    throw new Error(`Jelly's vendor stylesheet became statically reachable from ${path}`);
  }
}
const reactEntry = javaScriptSources.get(resolve(dist, "react/index.js"));
if (reactEntry === undefined) throw new Error("dist/react/index.js is missing");
requireMatch(
  reactEntry,
  new RegExp(`import\\(["'][^"']*${escapedJellyTokenFile}["']\\)`, "u"),
  "a dynamic-only Jelly vendor import",
);

forbid(compiledJavaScript, /react\/jsx-dev-runtime/u, "the development React JSX runtime");
forbid(
  compiledJavaScript,
  /stylex\.create|stylexCreate|Unexpected ['"]stylex\.create/u,
  "an uncompiled StyleX authoring call",
);
forbid(
  compiledJavaScript,
  /stylex-inject|stylexInject|data-stylex|stylesheet-group/u,
  "runtime CSS injection",
);
forbid(
  legacyComponents,
  /\.hraness-design-production-data-preview-notice(?:\s|\{|:)/u,
  "the migrated notice's legacy selector",
);
requireGeneratedLayerContract(
  compiledCss,
  DESIGN_STYLEX_LAYERS,
  "dist/stylex.css",
);
requireGeneratedLayerContract(
  uiLegacyComponents,
  UI_LEGACY_LAYERS,
  "the pinned @hraness/ui components.css",
);
requireGeneratedLayerContract(
  uiCompiledCss,
  UI_STYLEX_LAYERS,
  "the pinned @hraness/ui stylex.css",
);
requireMatch(
  uiCompiledCss,
  /@layer components\.hraness-ui\.priority3\s*\{[\s\S]*?padding-top:\s*var\(--space-5,\s*1\.25rem\);/u,
  "the pinned @hraness/ui QuietSite priority3 padding declaration",
);
requireLocalComponentsContract(legacyComponents);
requireAggregateContract(orderedStylesheet);
const rejectedMutationCount = requireMutationNegativeContracts(
  compiledCss,
  uiCompiledCss,
  legacyComponents,
  orderedStylesheet,
);
forbid(
  `${compiledJavaScript}\n${compiledCss}\n${legacyComponents}\n${orderedStylesheet}`,
  new RegExp(GALLERY_LAYER_CONFLICT_SENTINEL, "u"),
  "the gallery-only cross-package layer sentinel in package output",
);

console.log(
  `StyleX package artifacts match the compiler contract and reject ${String(rejectedMutationCount)} malformed layer mutations`,
);

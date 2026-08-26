import { readFile, readdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

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
const [compiledCss, orderedStylesheet, legacyComponents] = await Promise.all([
  readFile(resolve(dist, "stylex.css"), "utf8"),
  readFile(resolve(repository, "src/styles.css"), "utf8"),
  readFile(resolve(repository, "src/components.css"), "utf8"),
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

const stylexImport = '@import "../dist/stylex.css";';
const aggregateImports = orderedStylesheet
  .split("\n")
  .filter((line) => line.trim() === stylexImport);
if (aggregateImports.length !== 0) {
  throw new Error("src/styles.css must reach dist/stylex.css only through components.css");
}
const componentImports = legacyComponents
  .split("\n")
  .filter((line) => line.trim() === stylexImport);
if (componentImports.length !== 1 || !legacyComponents.startsWith(`${stylexImport}\n`)) {
  throw new Error("src/components.css must import dist/stylex.css exactly once before its legacy recipes");
}

const uiComponentsIndex = orderedStylesheet.indexOf('@import "@hraness/ui/components.css";');
const legacyComponentsIndex = orderedStylesheet.indexOf('@import "./components.css";');
const appearanceIndex = orderedStylesheet.indexOf('@import "./appearance-menu.css";');
if ((orderedStylesheet.match(/@import "@hraness\/ui\/components\.css";/gu) ?? []).length !== 1
  || (orderedStylesheet.match(/@import "\.\/components\.css";/gu) ?? []).length !== 1
  || (orderedStylesheet.match(/@import "\.\/appearance-menu\.css";/gu) ?? []).length !== 1) {
  throw new Error("src/styles.css must compose each component-order boundary exactly once");
}
if (!(uiComponentsIndex < legacyComponentsIndex
  && legacyComponentsIndex < appearanceIndex)) {
  throw new Error(
    "src/styles.css must place the component entry after UI components and before appearance compositions",
  );
}

console.log("StyleX package artifacts match the compiler contract");

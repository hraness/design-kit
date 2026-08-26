import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function run(command: string[], cwd: string): Promise<void> {
  const child = Bun.spawn(command, { cwd, stdout: "inherit", stderr: "inherit" });
  const exitCode = await child.exited;
  if (exitCode !== 0) {
    throw new Error(`Command failed (${String(exitCode)}): ${command.join(" ")}`);
  }
}

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  }));
  return nested.flat();
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function stringField(value: Record<string, unknown>, key: string, label: string): string {
  const field = value[key];
  if (typeof field !== "string" || field.length === 0) {
    throw new TypeError(`${label}.${key} must be a non-empty string.`);
  }
  return field;
}

const noticeDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [/align-items:\s*center/u, "align-items"],
  [/background-color:\s*(?:#ffcc33|#fc3)/u, "background-color"],
  [/border-bottom-color:\s*#5c1906/u, "border-block-end color"],
  [/border-bottom-style:\s*solid/u, "border-block-end style"],
  [/border-bottom-width:\s*2px/u, "border-block-end width"],
  [/box-shadow:\s*0\s+3px\s+12px\s+#24140059/u, "box-shadow"],
  [/color:\s*#241400/u, "color"],
  [/display:\s*flex/u, "display"],
  [/flex-wrap:\s*wrap/u, "flex-wrap"],
  [/font-family:\s*var\(--font-text,\s*system-ui,\s*sans-serif\)/u, "font-family"],
  [/font-size:\s*var\(--text-label,\s*0?\.875rem\)/u, "font-size"],
  [/gap:\s*var\(--space-1,\s*0?\.25rem\)\s+var\(--space-3,\s*0?\.75rem\)/u, "gap"],
  [/top:\s*0/u, "logical block-start inset"],
  [/justify-content:\s*center/u, "justify-content"],
  [/line-height:\s*1\.35/u, "line-height"],
  [/min-height:\s*3rem/u, "min-height"],
  [/padding-block:\s*max\(var\(--space-2,\s*0?\.5rem\),\s*env\(safe-area-inset-top\)\)/u, "padding-block"],
  [/padding-inline:\s*max\(var\(--space-4,\s*1rem\),\s*env\(safe-area-inset-left\)\)\s+max\(var\(--space-4,\s*1rem\),\s*env\(safe-area-inset-right\)\)/u, "padding-inline"],
  [/position:\s*sticky/u, "position"],
  [/text-align:\s*center/u, "text-align"],
  [/width:\s*100%/u, "width"],
  [/z-index:\s*calc\(var\(--z-tooltip,\s*3000\)\s*\+\s*1\)/u, "z-index"],
  [/font-weight:\s*var\(--font-weight-bold,\s*700\)/u, "emphasis font-weight"],
  [/letter-spacing:\s*0?\.04em/u, "emphasis letter-spacing"],
  [/text-transform:\s*uppercase/u, "emphasis text-transform"],
];

const ditherDeclarationPatterns: readonly (readonly [RegExp, string])[] = [
  [/--hraness-design-dither-size:\s*3px/u, "fine density variable"],
  [/--hraness-design-dither-size:\s*7px/u, "coarse density variable"],
  [
    /background-image:\s*radial-gradient\(color-mix\(in oklch,\s*currentColor 18%,\s*transparent\)\s*0?\.75px,\s*transparent\s*0?\.75px\)/u,
    "radial texture",
  ],
  [
    /background-size:\s*var\(--hraness-design-dither-size,\s*4px\)\s+var\(--hraness-design-dither-size,\s*4px\)/u,
    "public density-variable texture size",
  ],
  [/@media\s*\(forced-colors:\s*active\)/u, "forced-colors override"],
];

function requireNoticePresentation(css: string, label: string): void {
  if (!css.includes("@layer components.hraness-design-kit.priority")) {
    throw new Error(`${label} lost the package-owned StyleX layer.`);
  }
  for (const [pattern, declaration] of noticeDeclarationPatterns) {
    if (!pattern.test(css)) {
      throw new Error(`${label} lost the migrated notice ${declaration} declaration.`);
    }
  }
}

function requireDitherPresentation(css: string, label: string): void {
  for (const layer of ["priority1", "priority2", "priority3", "priority4"]) {
    if (!css.includes(`@layer components.hraness-design-kit.${layer}`)) {
      throw new Error(`${label} lost the package-owned ${layer} StyleX layer.`);
    }
  }
  for (const [pattern, declaration] of ditherDeclarationPatterns) {
    if (!pattern.test(css)) {
      throw new Error(`${label} lost the migrated DitherSurface ${declaration} declaration.`);
    }
  }
}

function requireAtomicSelectorsExactlyOnce(
  css: string,
  classNames: readonly string[],
  label: string,
): void {
  for (const className of new Set(classNames)) {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const count = css.match(new RegExp(`\\.${escaped}\\s*(?:\\{|,)`, "gu"))?.length ?? 0;
    if (count !== 1) {
      throw new Error(`${label} contains ${String(count)} selectors for notice atomic class ${className}.`);
    }
  }
}

function requireAtomicSelectorsPresent(
  css: string,
  classNames: readonly string[],
  label: string,
): void {
  for (const className of new Set(classNames)) {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const count = css.match(new RegExp(`\\.${escaped}\\s*(?:\\{|,)`, "gu"))?.length ?? 0;
    if (count < 1) {
      throw new Error(`${label} does not contain rendered atomic class ${className}.`);
    }
  }
}

function requireLayerBlockExactlyOnce(
  css: string,
  layerName: string,
  label: string,
): void {
  const escaped = layerName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const count = css.match(new RegExp(`@layer\\s+${escaped}\\s*\\{`, "gu"))?.length ?? 0;
  if (count !== 1) {
    throw new Error(`${label} contains ${String(count)} ${layerName} blocks instead of one.`);
  }
}

const repository = process.cwd();
const rootManifest = record(
  await Bun.file(join(repository, "package.json")).json() as unknown,
  "package.json",
);
const rootDevDependencies = record(
  rootManifest.devDependencies,
  "package.json devDependencies",
);
const rootDependencies = record(
  rootManifest.dependencies,
  "package.json dependencies",
);
const rootPeerDependencies = record(
  rootManifest.peerDependencies,
  "package.json peerDependencies",
);
const uiDevelopmentSpecifier = stringField(
  rootDevDependencies,
  "@hraness/ui",
  "package.json devDependencies",
);
const immutableUiRelease = /^github:hraness\/ui#v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u;
const reviewedUiCommit = /^github:hraness\/ui#[0-9a-f]{40}$/u;
if (!immutableUiRelease.test(uiDevelopmentSpecifier)
  && !reviewedUiCommit.test(uiDevelopmentSpecifier)) {
  throw new Error(
    "The @hraness/ui development dependency must use an exact immutable release tag or full reviewed commit.",
  );
}
if (process.argv.includes("--publication")) {
  if (!immutableUiRelease.test(uiDevelopmentSpecifier)) {
    throw new Error(
      "Publication is blocked while @hraness/ui uses a full-commit development candidate; replace it with the reviewed immutable release tag.",
    );
  }
  console.log("Publication dependency gate passed an immutable @hraness/ui release tag");
  process.exit(0);
}
const uiPeerRange = stringField(
  rootPeerDependencies,
  "@hraness/ui",
  "package.json peerDependencies",
);
if (stringField(rootDependencies, "@stylexjs/stylex", "package.json dependencies") !== "0.19.0") {
  throw new Error("The StyleX authoring/runtime dependency must be pinned to 0.19.0.");
}
if (stringField(rootDevDependencies, "@stylexjs/unplugin", "package.json devDependencies") !== "0.19.0") {
  throw new Error("The StyleX compiler adapter must be pinned to 0.19.0.");
}
if (stringField(rootDevDependencies, "unplugin", "package.json devDependencies") !== "2.3.11") {
  throw new Error("The StyleX compiler family must pin unplugin 2.3.11.");
}
const uiInstallSource = process.env.HRANESS_UI_PACKAGE
  ?? uiDevelopmentSpecifier;
const work = await mkdtemp(join(tmpdir(), "hraness-design-kit-smoke-"));

try {
  const archive = join(work, "package.tgz");
  const consumer = join(work, "consumer");
  const neutralConsumer = join(work, "consumer-neutral");
  const unpacked = join(work, "unpacked");
  await mkdir(consumer);
  await mkdir(neutralConsumer);
  await mkdir(unpacked);
  await run([
    process.execPath,
    "pm",
    "pack",
    "--filename",
    archive,
    "--ignore-scripts",
    "--quiet",
  ], repository);
  await run(["tar", "-xzf", archive, "-C", unpacked], repository);
  const packedRoot = join(unpacked, "package");
  const packedPackageJsonPath = join(packedRoot, "package.json");
  const packedPackageJson = await Bun.file(packedPackageJsonPath).json();
  const packedStylexCss = await Bun.file(join(packedRoot, "dist/stylex.css")).text();
  const packedComponentsCss = await Bun.file(join(packedRoot, "src/components.css")).text();
  const packedStylesCss = await Bun.file(join(packedRoot, "src/styles.css")).text();
  const stylexImport = '@import "../dist/stylex.css";';
  const componentStylexImports = packedComponentsCss
    .split("\n")
    .filter((line) => line.trim() === stylexImport);
  const aggregateStylexImports = packedStylesCss
    .split("\n")
    .filter((line) => line.trim() === stylexImport);
  const localLayerPrelude = "@layer components.hraness-design-kit.legacy, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3, components.hraness-design-kit.priority4;";
  const portfolioLayerPrelude = "@layer components.hraness-ui.legacy, components.hraness-ui.priority1, components.hraness-ui.priority2, components.hraness-ui.priority3, components.hraness-design-kit.legacy, components.hraness-design-kit.priority1, components.hraness-design-kit.priority2, components.hraness-design-kit.priority3, components.hraness-design-kit.priority4;";
  if (componentStylexImports.length !== 1
    || !packedComponentsCss.startsWith(`${localLayerPrelude}\n${stylexImport}\n`)) {
    throw new Error("Packed components.css does not freeze the local layers and deliver dist/stylex.css exactly once before legacy recipes.");
  }
  if (aggregateStylexImports.length !== 0) {
    throw new Error("Packed styles.css imports dist/stylex.css separately from components.css.");
  }
  if ((packedStylesCss.match(/@import "\.\/components\.css";/gu) ?? []).length !== 1) {
    throw new Error("Packed styles.css does not compose the narrow component entry exactly once.");
  }
  if (!packedStylesCss.startsWith(`@layer base, components;\n${portfolioLayerPrelude}\n`)
    || (packedStylesCss.match(/@import "@hraness\/ui\/components\.css";/gu) ?? []).length !== 1
    || (packedStylesCss.match(/@import "@hraness\/ui\/stylex\.css";/gu) ?? []).length !== 1) {
    throw new Error("Packed styles.css does not freeze and compose the exact cross-package component layer contract.");
  }
  requireNoticePresentation(packedStylexCss, "Packed stylex.css");
  requireDitherPresentation(packedStylexCss, "Packed stylex.css");
  if (/\.hraness-design-dither-surface\s*(?:\{|\[|,)/u.test(packedComponentsCss)) {
    throw new Error("Packed components.css retained the migrated legacy DitherSurface recipe.");
  }
  if (packedPackageJson.dependencies?.["@hraness/ui"] !== undefined) {
    throw new Error("Packed package nests @hraness/ui as a runtime dependency.");
  }
  if (packedPackageJson.peerDependencies?.["@hraness/ui"] !== uiPeerRange) {
    throw new Error(`Packed package does not declare the ${uiPeerRange} @hraness/ui peer.`);
  }
  if (packedPackageJson.peerDependenciesMeta?.["@hraness/ui"]?.optional !== true) {
    throw new Error("Packed package does not keep the entry-specific @hraness/ui peer optional at installation.");
  }
  if (packedPackageJson.devDependencies?.["@hraness/ui"] !== uiDevelopmentSpecifier) {
    throw new Error("Packed package does not retain the exact @hraness/ui development pin.");
  }
  if (packedPackageJson.dependencies?.["@stylexjs/stylex"] !== "0.19.0") {
    throw new Error("Packed package lost the exact StyleX runtime dependency.");
  }
  if (
    packedPackageJson.devDependencies?.["@stylexjs/unplugin"] !== "0.19.0"
    || packedPackageJson.devDependencies?.unplugin !== "2.3.11"
  ) {
    throw new Error("Packed package lost the exact StyleX 0.19.0/unplugin 2.3.11 compiler family.");
  }
  await writeFile(
    join(neutralConsumer, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  await run([
    process.execPath,
    "add",
    archive,
    "typescript@^6.0.3",
    "--ignore-scripts",
  ], neutralConsumer);
  if (
    await Bun.file(
      join(neutralConsumer, "node_modules", "@hraness", "ui", "package.json"),
    ).exists()
  ) {
    throw new Error("The framework-neutral consumer installed the optional @hraness/ui peer.");
  }
  await run([
    "node",
    "--input-type=module",
    "-e",
    "await Promise.all([import('@hraness/design-kit'), import('@hraness/design-kit/browser'), import('@hraness/design-kit/syntax-highlighting')])",
  ], neutralConsumer);
  await writeFile(
    join(neutralConsumer, "index.ts"),
    [
      'import * as core from "@hraness/design-kit";',
      'import * as syntax from "@hraness/design-kit/syntax-highlighting";',
      "void [core, syntax];",
      "",
    ].join("\n"),
  );
  for (const mode of ["Bundler", "NodeNext"] as const) {
    await writeFile(
      join(neutralConsumer, `tsconfig.${mode.toLowerCase()}.json`),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          lib: ["ES2023"],
          module: mode === "Bundler" ? "Preserve" : "NodeNext",
          moduleResolution: mode,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2023",
        },
        include: ["index.ts"],
      }, null, 2),
    );
    await run([
      process.execPath,
      "x",
      "tsc",
      "-p",
      `./tsconfig.${mode.toLowerCase()}.json`,
    ], neutralConsumer);
  }
  await writeFile(
    join(neutralConsumer, "browser.ts"),
    [
      'import { defaultDesignTheme, installAppearanceMenus, type AppearanceMenuOptions } from "@hraness/design-kit/browser";',
      "const options = null as AppearanceMenuOptions | null;",
      "void [defaultDesignTheme, installAppearanceMenus, options];",
      "",
    ].join("\n"),
  );
  for (const mode of ["Bundler", "NodeNext"] as const) {
    await writeFile(
      join(neutralConsumer, `tsconfig.browser-${mode.toLowerCase()}.json`),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          lib: ["ES2023", "DOM", "DOM.Iterable"],
          module: mode === "Bundler" ? "Preserve" : "NodeNext",
          moduleResolution: mode,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2023",
        },
        include: ["browser.ts"],
      }, null, 2),
    );
    await run([
      process.execPath,
      "x",
      "tsc",
      "-p",
      `./tsconfig.browser-${mode.toLowerCase()}.json`,
    ], neutralConsumer);
  }
  await writeFile(
    join(consumer, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  await run([
    process.execPath,
    "add",
    uiInstallSource,
    "@hugeicons/core-free-icons@^4.2.2",
    "@types/bun@^1.3.14",
    "@types/react@^19.2.14",
    "@types/react-dom@^19.2.3",
    "react@19.2.3",
    "react-dom@19.2.3",
    "typescript@^6.0.3",
    "vite@8.1.5",
    "--ignore-scripts",
  ], consumer);
  await run([process.execPath, "add", archive, "--ignore-scripts"], consumer);
  await run([
    "node",
    "--input-type=module",
    "-e",
    "await Promise.all([import('@hraness/design-kit'), import('@hraness/design-kit/react'), import('@hraness/design-kit/react/server'), import('@hraness/design-kit/syntax-highlighting')])",
  ], consumer);
  await writeFile(
    join(consumer, "global-error.mjs"),
    [
      'import { GlobalErrorDocument } from "@hraness/design-kit/react";',
      'import { createElement } from "react";',
      'import { renderToStaticMarkup } from "react-dom/server";',
      'const props = { darkColor: "#101419", error: new Error("Smoke"), lightColor: "#f4efe7", reset() {} };',
      "const system = renderToStaticMarkup(createElement(GlobalErrorDocument, props));",
      'if (!system.includes(\'content="light dark" name="color-scheme"\')) throw new Error("Packed global-error is not System-first.");',
      'if (!system.includes(\'content="#f4efe7" media="(prefers-color-scheme: light)" name="theme-color"\')) throw new Error("Packed global-error is missing custom Light metadata.");',
      'if (!system.includes(\'content="#101419" media="(prefers-color-scheme: dark)" name="theme-color"\')) throw new Error("Packed global-error is missing custom Dark metadata.");',
      'if ((system.match(/name="theme-color"/gu) ?? []).length !== 2) throw new Error("Packed System global-error does not expose two adaptive theme colors.");',
      'if (system.includes("hraness-design-theme-toggle") || system.includes("data-hraness-appearance-menu")) throw new Error("Packed global-error exposes an appearance selector.");',
      'const fixed = renderToStaticMarkup(createElement(GlobalErrorDocument, { ...props, theme: "dark" }));',
      'if (!fixed.includes(\'content="dark" name="color-scheme"\')) throw new Error("Packed fixed global-error has the wrong color scheme.");',
      'if (!fixed.includes(\'content="#101419" name="theme-color"\') || fixed.includes("prefers-color-scheme")) throw new Error("Packed fixed global-error metadata is not exact.");',
      "",
    ].join("\n"),
  );
  await run(["node", "./global-error.mjs"], consumer);
  await writeFile(
    join(consumer, "stylex-notice.mjs"),
    [
      'import { readFile, writeFile } from "node:fs/promises";',
      'import { Search01Icon } from "@hugeicons/core-free-icons";',
      'import { Icon, QuietSiteFooter } from "@hraness/ui";',
      'import { DitherSurface, ProductionDataPreviewNotice } from "@hraness/design-kit/react";',
      'import { createElement } from "react";',
      'import { renderToStaticMarkup } from "react-dom/server";',
      'const stylexUrl = import.meta.resolve("@hraness/design-kit/stylex.css");',
      'if (new URL(stylexUrl).protocol !== "file:") throw new Error("Packed stylex.css is not a file export.");',
      'const stylexCss = await readFile(new URL(stylexUrl), "utf8");',
      'if (!stylexCss.includes("@layer components.hraness-design-kit.priority")) throw new Error("Packed stylex.css lost its package layer.");',
      'if (!stylexCss.includes("position: sticky") || !stylexCss.includes("text-transform: uppercase")) throw new Error("Packed stylex.css lost the notice declarations.");',
      'for (const layer of ["priority1", "priority2", "priority3", "priority4"]) { if (!stylexCss.includes(`@layer components.hraness-design-kit.${layer}`)) throw new Error(`Packed stylex.css lost design-kit ${layer}.`); }',
      'if (!stylexCss.includes("--hraness-design-dither-size: 3px") || !stylexCss.includes("--hraness-design-dither-size: 7px") || !stylexCss.includes("background-size: var(--hraness-design-dither-size, 4px) var(--hraness-design-dither-size, 4px)") || !stylexCss.includes("@media (forced-colors: active)")) throw new Error("Packed stylex.css lost the DitherSurface declarations.");',
      'const componentsCss = await readFile(new URL(import.meta.resolve("@hraness/design-kit/components.css")), "utf8");',
      'if (componentsCss.includes(".hraness-design-production-data-preview-notice")) throw new Error("Legacy CSS still declares the migrated notice.");',
      'if (componentsCss.includes(".hraness-design-dither-surface")) throw new Error("Legacy CSS still declares the migrated DitherSurface.");',
      'if (componentsCss.split("\\n").filter((line) => line.trim() === `@import "../dist/stylex.css";`).length !== 1) throw new Error("Packed components.css lost its single StyleX import.");',
      'const uiStylexCss = await readFile(new URL(import.meta.resolve("@hraness/ui/stylex.css")), "utf8");',
      'const uiPriority3Marker = "@layer components.hraness-ui.priority3";',
      'const uiPriority3Index = uiStylexCss.indexOf(uiPriority3Marker);',
      'if (uiPriority3Index < 0) throw new Error("Packed UI stylex.css lost its emitted priority3 layer.");',
      'const uiPriority3Css = uiStylexCss.slice(uiPriority3Index);',
      'const html = renderToStaticMarkup(createElement(ProductionDataPreviewNotice, { surfaceOrigin: "https://preview.example.test" }));',
      'const aside = /<aside[^>]*class="([^"]+)"/u.exec(html)?.[1]?.split(" ").filter(Boolean);',
      'const strong = /<strong[^>]*class="([^"]+)"/u.exec(html)?.[1]?.split(" ").filter(Boolean);',
      'if (aside === undefined || !aside.includes("hraness-design-production-data-preview-notice") || aside.length < 2) throw new Error("Packed notice lost its stable and atomic classes.");',
      'if (strong === undefined || strong.length === 0) throw new Error("Packed notice emphasis lost its atomic classes.");',
      'if (html.includes("style=")) throw new Error("Packed notice emitted inline presentation.");',
      'const iconHtml = renderToStaticMarkup(createElement(Icon, { icon: Search01Icon }));',
      'const icon = /<svg[^>]*class="([^"]+)"/u.exec(iconHtml)?.[1]?.split(" ").filter((name) => name !== "hraness-icon" && name.length > 0);',
      'if (icon === undefined || icon.length === 0 || iconHtml.includes("style=")) throw new Error("Packed UI Icon lost extracted StyleX classes.");',
      'for (const className of new Set(icon)) { const escaped = className.replace(/[.*+?^${}()|[\\]\\\\]/gu, "\\\\$&"); const count = uiStylexCss.match(new RegExp(`\\\\.${escaped}\\\\s*(?:\\\\{|,)`, "gu"))?.length ?? 0; if (count !== 1) throw new Error(`Packed UI stylex.css contains ${String(count)} selectors for rendered Icon class ${className}.`); }',
      'const footerHtml = renderToStaticMarkup(createElement(QuietSiteFooter, null, "UI priority3 canary"));',
      'const footer = /<footer[^>]*class="([^"]+)"/u.exec(footerHtml)?.[1]?.split(" ").filter((name) => name !== "hraness-quiet-site-footer" && name.length > 0);',
      'if (footer === undefined || footer.length === 0 || footerHtml.includes("style=")) throw new Error("Packed UI QuietSiteFooter lost extracted StyleX classes.");',
      'const uiPriority3 = footer.filter((className) => uiPriority3Css.includes(`.${className} {`));',
      'if (uiPriority3.length === 0) throw new Error("Packed UI QuietSiteFooter exposes no class from the emitted priority3 layer.");',
      'for (const className of new Set(uiPriority3)) { const count = uiStylexCss.split(`.${className} {`).length - 1; if (count !== 1) throw new Error(`Packed UI stylex.css contains ${String(count)} selectors for rendered priority3 class ${className}.`); }',
      'const ditherMarkup = Object.fromEntries(["coarse", "fine", "medium"].map((density) => [density, renderToStaticMarkup(createElement(DitherSurface, { as: "article", density, tone: "secondary" }, density))]));',
      'for (const [density, markup] of Object.entries(ditherMarkup)) { if (!markup.includes(`data-density="${density}"`) || !markup.includes("hraness-themed-surface") || !markup.includes("hraness-design-dither-surface") || !markup.includes(`data-slot="themed-surface"`) || markup.includes("style=")) throw new Error(`Packed DitherSurface lost its ${density} semantic or extracted presentation contract.`); }',
      'const dither = /<article[^>]*class="([^"]+)"/u.exec(ditherMarkup.coarse)?.[1]?.split(" ").filter((name) => name !== "hraness-themed-surface" && name !== "hraness-design-dither-surface" && name.length > 0 && stylexCss.includes(`.${name} {`));',
      'if (dither === undefined || dither.length < 3) throw new Error("Packed coarse DitherSurface exposes fewer than three design-kit atomic classes.");',
      'for (const className of new Set(dither)) { const count = stylexCss.split(`.${className} {`).length - 1; if (count !== 1) throw new Error(`Packed design-kit stylex.css contains ${String(count)} selectors for rendered DitherSurface class ${className}.`); }',
      'const callerMarkup = renderToStaticMarkup(createElement(DitherSurface, { density: "fine", style: { "--hraness-design-dither-size": "11px", backgroundImage: "none", backgroundSize: "11px 11px" } }));',
      'if (!callerMarkup.includes("--hraness-design-dither-size:11px") || !callerMarkup.includes("background-image:none") || !callerMarkup.includes("background-size:11px 11px")) throw new Error("Packed DitherSurface lost caller-last native presentation.");',
      'await writeFile(new URL("./notice-classes.json", import.meta.url), JSON.stringify({ aside, dither, icon, strong, uiPriority3 }));',
      "",
    ].join("\n"),
  );
  await run(["node", "./stylex-notice.mjs"], consumer);

  const installed = join(consumer, "node_modules/@hraness/design-kit");
  for (const path of [
    "dist/browser/index.js",
    "dist/stylex.css",
    "src/appearance-menu.css",
    "src/components.css",
    "src/styles.css",
    "src/react/production-data-preview-notice.stylex.ts",
    "src/react/surfaces.stylex.ts",
    "src/fonts/geist-mono/GeistMono[wght].woff2",
    "vendor/evilcharts/LICENSE",
    "vendor/jelly-ui/LICENSE",
  ]) {
    if (!(await Bun.file(join(installed, path)).exists())) {
      throw new Error(`Packed package is missing ${path}`);
    }
  }
  const packedFiles = await filesBelow(installed);
  if (packedFiles.some((path) => path.includes(".test."))) {
    throw new Error("Packed package contains test sources");
  }
  const clientBundle = await Bun.file(
    join(installed, "dist", "react", "index.js"),
  ).text();
  const clientDirectives = clientBundle.match(/^"use client";\r?$/gmu) ?? [];
  if (
    !clientBundle.startsWith('"use client";\n')
    || clientDirectives.length !== 1
  ) {
    throw new Error(
      "Packed React entry must have one leading use-client directive and no interior directives.",
    );
  }
  const packedJavaScript = (await Promise.all(
    packedFiles
      .filter((path) => path.endsWith(".js"))
      .map(async (path) => Bun.file(path).text()),
  )).join("\n");
  if (/stylex\.create|stylexCreate|Unexpected ["']stylex\.create/u.test(packedJavaScript)) {
    throw new Error("Packed JavaScript contains an uncompiled StyleX authoring call.");
  }
  if (/stylex-inject|stylexInject|data-stylex|stylesheet-group/u.test(packedJavaScript)) {
    throw new Error("Packed JavaScript contains StyleX runtime injection.");
  }
  const browserBundle = await Bun.file(
    join(installed, "dist", "browser", "index.js"),
  ).text();
  if (!browserBundle.includes("installAppearanceMenus")) {
    throw new Error("Packed browser entry does not expose the appearance installer.");
  }
  if (
    /(?:from\s*|import\s*)["'](?:next-themes|react(?:-dom|-aria-components)?)(?:\/[^"']*)?["']/u
      .test(browserBundle)
  ) {
    throw new Error("Packed browser entry imports a React runtime dependency.");
  }

  await writeFile(
    join(consumer, "index.ts"),
    [
      'import * as core from "@hraness/design-kit";',
      'import * as react from "@hraness/design-kit/react";',
      'import * as serverReact from "@hraness/design-kit/react/server";',
      "void [core, react, serverReact];",
      "",
    ].join("\n"),
  );
  for (const mode of ["Bundler", "NodeNext"] as const) {
    await writeFile(
      join(consumer, `tsconfig.${mode.toLowerCase()}.json`),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          jsx: "react-jsx",
          lib: ["ES2023", "DOM", "DOM.Iterable"],
          module: mode === "Bundler" ? "Preserve" : "NodeNext",
          moduleResolution: mode,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2023",
        },
        include: ["index.ts"],
      }, null, 2),
    );
    await run([
      process.execPath,
      "x",
      "tsc",
      "-p",
      `./tsconfig.${mode.toLowerCase()}.json`,
    ], consumer);
  }

  await mkdir(join(consumer, "src"));
  await writeFile(
    join(consumer, "index.html"),
    '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
  );
  await writeFile(
    join(consumer, "src/main.tsx"),
    [
      'import { createElement } from "react";',
      'import { Fragment } from "react";',
      'import { createRoot } from "react-dom/client";',
      'import { Search01Icon } from "@hugeicons/core-free-icons";',
      'import { Icon } from "@hraness/ui";',
      'import "@hraness/design-kit/styles.css";',
      'import { DitherSurface, JellySurface, ProductionDataPreviewNotice } from "@hraness/design-kit/react";',
      'const target = document.getElementById("root");',
      'if (target === null) throw new Error("Missing root");',
      'createRoot(target).render(createElement(Fragment, null, createElement(ProductionDataPreviewNotice, { surfaceOrigin: "https://preview.example.test" }), createElement(DitherSurface, { density: "coarse" }, "Dither"), createElement(Icon, { icon: Search01Icon }), createElement(JellySurface, { interaction: "press" }, createElement("button", { type: "button" }, "Run"))));',
      "",
    ].join("\n"),
  );
  await run([process.execPath, "x", "vite", "build"], consumer);
  const builtFiles = await filesBelow(join(consumer, "dist"));
  if (!builtFiles.some((path) => path.endsWith(".css"))) {
    throw new Error("Packed Vite consumer emitted no design stylesheet.");
  }
  if (builtFiles.filter((path) => path.endsWith(".js")).length < 2) {
    throw new Error("Packed Vite consumer did not preserve the dynamic Jelly chunk.");
  }
  const builtCss = (await Promise.all(
    builtFiles
      .filter((path) => path.endsWith(".css"))
      .map(async (path) => Bun.file(path).text()),
  )).join("\n");
  const noticeClasses = await Bun.file(join(consumer, "notice-classes.json")).json() as {
    readonly aside: readonly string[];
    readonly dither: readonly string[];
    readonly icon: readonly string[];
    readonly strong: readonly string[];
    readonly uiPriority3: readonly string[];
  };
  const generatedNoticeClasses = [...noticeClasses.aside, ...noticeClasses.strong]
    .filter((name) => name !== "hraness-design-production-data-preview-notice");
  if (generatedNoticeClasses.length === 0) {
    throw new Error("Packed notice exposes no generated StyleX classes to the Vite oracle.");
  }
  requireAtomicSelectorsPresent(builtCss, generatedNoticeClasses, "Packed aggregate Vite CSS");
  requireAtomicSelectorsPresent(builtCss, noticeClasses.dither, "Packed aggregate Vite CSS");
  requireAtomicSelectorsPresent(builtCss, noticeClasses.icon, "Packed aggregate Vite CSS");
  requireAtomicSelectorsPresent(builtCss, noticeClasses.uiPriority3, "Packed aggregate Vite CSS");
  for (const layerName of [
    "components.hraness-ui.priority1",
    "components.hraness-ui.priority2",
    "components.hraness-ui.priority3",
    "components.hraness-design-kit.priority1",
    "components.hraness-design-kit.priority2",
    "components.hraness-design-kit.priority3",
    "components.hraness-design-kit.priority4",
  ]) {
    requireLayerBlockExactlyOnce(builtCss, layerName, "Packed aggregate Vite CSS");
  }
  requireNoticePresentation(builtCss, "Packed aggregate Vite CSS");
  requireDitherPresentation(builtCss, "Packed aggregate Vite CSS");
  if (/\.hraness-design-production-data-preview-notice\s*(?:\{|,)/u.test(builtCss)) {
    throw new Error("Packed aggregate Vite CSS retained the migrated legacy notice recipe.");
  }
  if (/\.hraness-design-dither-surface\s*(?:\{|\[|,)/u.test(builtCss)) {
    throw new Error("Packed aggregate Vite CSS retained the migrated legacy DitherSurface recipe.");
  }

  await writeFile(
    join(consumer, "src/main.tsx"),
    [
      'import { createElement } from "react";',
      'import { createRoot } from "react-dom/client";',
      'import "@hraness/design-kit/components.css";',
      'import { DitherSurface, ProductionDataPreviewNotice } from "@hraness/design-kit/react";',
      'const target = document.getElementById("root");',
      'if (target === null) throw new Error("Missing root");',
      'createRoot(target).render(createElement("div", null, createElement(ProductionDataPreviewNotice, { surfaceOrigin: "https://preview.example.test" }), createElement(DitherSurface, { density: "coarse" }, "Dither")));',
      "",
    ].join("\n"),
  );
  await run([
    process.execPath,
    "x",
    "vite",
    "build",
    "--outDir",
    "dist-components",
    "--emptyOutDir",
  ], consumer);
  const narrowBuiltFiles = await filesBelow(join(consumer, "dist-components"));
  const narrowBuiltCss = (await Promise.all(
    narrowBuiltFiles
      .filter((path) => path.endsWith(".css"))
      .map(async (path) => Bun.file(path).text()),
  )).join("\n");
  if (narrowBuiltCss.length === 0) {
    throw new Error("Packed narrow components.css Vite consumer emitted no stylesheet.");
  }
  requireAtomicSelectorsExactlyOnce(
    narrowBuiltCss,
    generatedNoticeClasses,
    "Packed narrow components.css Vite CSS",
  );
  requireAtomicSelectorsExactlyOnce(
    narrowBuiltCss,
    noticeClasses.dither,
    "Packed narrow components.css Vite CSS",
  );
  requireNoticePresentation(narrowBuiltCss, "Packed narrow components.css Vite CSS");
  requireDitherPresentation(narrowBuiltCss, "Packed narrow components.css Vite CSS");
  if (/\.hraness-design-production-data-preview-notice\s*(?:\{|,)/u.test(narrowBuiltCss)) {
    throw new Error("Packed narrow components.css Vite CSS retained the migrated legacy notice recipe.");
  }
  if (/\.hraness-design-dither-surface\s*(?:\{|\[|,)/u.test(narrowBuiltCss)) {
    throw new Error("Packed narrow components.css Vite CSS retained the migrated legacy DitherSurface recipe.");
  }

  const react18Consumer = join(work, "consumer-react18");
  await mkdir(react18Consumer);
  await writeFile(
    join(react18Consumer, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  await run([
    process.execPath,
    "add",
    uiInstallSource,
    "@types/react@18.3.28",
    "@types/react-dom@18.3.7",
    "react@18.3.1",
    "react-dom@18.3.1",
    "typescript@^6.0.3",
    "--ignore-scripts",
  ], react18Consumer);
  await run([
    process.execPath,
    "add",
    archive,
    "--ignore-scripts",
  ], react18Consumer);
  await run([
    "node",
    "--input-type=module",
    "-e",
    "await Promise.all([import('@hraness/design-kit'), import('@hraness/design-kit/react'), import('@hraness/design-kit/react/server'), import('@hraness/design-kit/syntax-highlighting')])",
  ], react18Consumer);
  await writeFile(
    join(react18Consumer, "notice-react18.mjs"),
    [
      'import { DitherSurface, ProductionDataPreviewNotice } from "@hraness/design-kit/react";',
      'import { createElement } from "react";',
      'import { renderToStaticMarkup } from "react-dom/server";',
      'const html = renderToStaticMarkup(createElement(ProductionDataPreviewNotice, { surfaceOrigin: "https://preview.example.test" }));',
      'const asideClasses = /<aside[^>]*class="([^"]+)"/u.exec(html)?.[1]?.split(" ").filter(Boolean);',
      'const strongClasses = /<strong[^>]*class="([^"]+)"/u.exec(html)?.[1]?.split(" ").filter(Boolean);',
      'if (asideClasses === undefined || !asideClasses.includes("hraness-design-production-data-preview-notice") || asideClasses.length < 2) throw new Error("React 18 packed notice lost stable or atomic classes.");',
      'if (strongClasses === undefined || strongClasses.length === 0) throw new Error("React 18 packed notice emphasis lost atomic classes.");',
      'if (!html.includes(\'role="alert"\') || !html.includes(\'aria-label="Production data preview warning"\')) throw new Error("React 18 packed notice lost alert semantics.");',
      'if (html.includes("style=")) throw new Error("React 18 packed notice emitted inline presentation.");',
      'for (const density of ["coarse", "fine", "medium"]) { const dither = renderToStaticMarkup(createElement(DitherSurface, { as: "article", density, tone: "secondary" }, density)); if (!dither.includes(`data-density="${density}"`) || !dither.includes("hraness-themed-surface") || !dither.includes("hraness-design-dither-surface") || !dither.includes(`data-slot="themed-surface"`) || dither.includes("style=")) throw new Error(`React 18 packed DitherSurface lost its ${density} semantic or extracted presentation contract.`); }',
      'const callerDither = renderToStaticMarkup(createElement(DitherSurface, { density: "fine", style: { "--hraness-design-dither-size": "11px", backgroundImage: "none", backgroundSize: "11px 11px" } }));',
      'if (!callerDither.includes("--hraness-design-dither-size:11px") || !callerDither.includes("background-image:none") || !callerDither.includes("background-size:11px 11px")) throw new Error("React 18 packed DitherSurface lost caller-last native presentation.");',
      "",
    ].join("\n"),
  );
  await run(["node", "./notice-react18.mjs"], react18Consumer);
  await writeFile(
    join(react18Consumer, "index.ts"),
    [
      'import * as clientReact from "@hraness/design-kit/react";',
      'import * as serverReact from "@hraness/design-kit/react/server";',
      "void [clientReact, serverReact];",
      "",
    ].join("\n"),
  );
  for (const mode of ["Bundler", "NodeNext"] as const) {
    await writeFile(
      join(react18Consumer, `tsconfig.${mode.toLowerCase()}.json`),
      JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          jsx: "react-jsx",
          lib: ["ES2023", "DOM", "DOM.Iterable"],
          module: mode === "Bundler" ? "Preserve" : "NodeNext",
          moduleResolution: mode,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "ES2023",
        },
        include: ["index.ts"],
      }, null, 2),
    );
    await run([
      process.execPath,
      "x",
      "tsc",
      "-p",
      `./tsconfig.${mode.toLowerCase()}.json`,
    ], react18Consumer);
  }
} finally {
  await rm(work, { recursive: true, force: true });
}

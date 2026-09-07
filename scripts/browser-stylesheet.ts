import assert from "node:assert/strict";
import { readFile, realpath, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, isAbsolute, relative, resolve } from "node:path";

import { compilerContract } from "@hraness/ui/stylex-build";
import { bundleAsync, transform } from "lightningcss";

import { projectCssOkColorSource, type ProjectedCssColorSource } from "./browser-css-parity.js";

type NativeOracleProjectionReceipt = Omit<ProjectedCssColorSource, "projectedCss"> & Readonly<{ url: string }>;

async function browserStylesheetAssets(filename: string, root: string, projectColors: boolean) {
  const realRoot = await realpath(root);
  const nativePrefix = projectColors ? "/projected-native-oracle/" : "/native-oracle/";
  const assets = new Map<string, Readonly<{ body: Buffer; contentType: string }>>();
  const identities = new Map<string, Readonly<{ path: string; type: "font" | "stylesheet" }>>();
  const projections: NativeOracleProjectionReceipt[] = [];
  let totalBytes = 0;
  const visit = async (file: string, url: URL, type: "font" | "stylesheet"): Promise<void> => {
    const path = await realpath(file);
    const logical = relative(realRoot, path);
    assert(logical.length > 0 && !logical.startsWith("..") && !isAbsolute(logical), "Native oracle asset leaves the repository");
    assert.equal(url.origin, "https://oracle.invalid", "Native oracle asset names an external origin");
    assert.equal(url.search + url.hash, "", "Native oracle asset contains a query or fragment");
    assert(url.pathname.startsWith(nativePrefix), "Native oracle URL leaves its reserved namespace");
    const prior = identities.get(url.pathname);
    if (prior !== undefined) {
      assert.equal(prior.path, path, "Native oracle URL resolves to conflicting files");
      assert.equal(prior.type, type, "Native oracle URL changes asset type");
      return;
    }
    assert(identities.size < 256, "Native oracle exceeds its asset bound");
    identities.set(url.pathname, { path, type });
    const information = await stat(path);
    assert(information.isFile() && information.size <= 4 * 1024 * 1024, "Native oracle asset must be a bounded ordinary file");
    const body = await readFile(path);
    if (type === "font") {
      totalBytes += body.byteLength;
      assert(totalBytes <= 32 * 1024 * 1024, "Native oracle exceeds its total byte bound");
      assert(path.endsWith(".woff2"), "Native oracle URL must resolve to a WOFF2 font");
      const font = relative(resolve(realRoot, "src/fonts"), path);
      assert(!font.startsWith("..") && !isAbsolute(font), "Native oracle font leaves the registered boundary");
      assets.set(url.pathname, { body, contentType: "font/woff2" });
      return;
    }
    assert(path.endsWith(".css"), "Native oracle import must resolve to CSS");
    let served = body;
    if (projectColors) {
      const source = body.toString("utf8");
      assert(Buffer.from(source).equals(body), "Native oracle stylesheet must be exact UTF-8");
      const projection = projectCssOkColorSource(source);
      served = Buffer.from(projection.projectedCss);
      projections.push({
        creatorSha256: projection.creatorSha256,
        projectedSha256: projection.projectedSha256,
        projections: projection.projections,
        sourceSha256: projection.sourceSha256,
        url: url.pathname,
      });
    }
    assert(served.byteLength <= 4 * 1024 * 1024, "Native oracle projected stylesheet exceeds its file bound");
    totalBytes += Math.max(body.byteLength, served.byteLength);
    assert(totalBytes <= 32 * 1024 * 1024, "Native oracle exceeds its total byte bound");
    // Parse only to enumerate dependencies. Never serve the reserialized code:
    // Lightning CSS can collapse distinct prefixed/unprefixed declarations.
    const parsed = transform({ filename: path, code: body, analyzeDependencies: true, minify: false });
    assert.equal(parsed.warnings.length, 0, "Native oracle CSS has parser warnings");
    assets.set(url.pathname, { body: served, contentType: "text/css" });
    for (const dependency of parsed.dependencies ?? []) {
      assert(dependency.type === "import" || dependency.type === "url", "Native oracle has an unsupported dependency type");
      const specifier = dependency.url;
      assert(!/^(?:[a-z][a-z\d+.-]*:|\/)/iu.test(specifier), "Native oracle requires relative or package-local assets");
      const target = dependency.type === "import" && specifier.startsWith("@")
        ? createRequire(path).resolve(specifier)
        : resolve(dirname(path), specifier);
      await visit(target, new URL(specifier, url), dependency.type === "import" ? "stylesheet" : "font");
    }
  };
  const entryPath = await realpath(filename);
  const entryLogical = relative(realRoot, entryPath);
  assert(entryLogical.length > 0 && !entryLogical.startsWith("..") && !isAbsolute(entryLogical), "Native oracle entry leaves the repository");
  const entryHref = nativePrefix + entryLogical.split("/").map(encodeURIComponent).join("/");
  await visit(entryPath, new URL(entryHref, "https://oracle.invalid"), "stylesheet");
  return { assets, entryHref, projections: projections.sort((left, right) => left.url.localeCompare(right.url)) };
}

/** Native imports preserve the oracle's exact declaration order and aliases. */
export async function nativeBrowserStylesheetAssets(filename: string, root: string) {
  return browserStylesheetAssets(filename, root, false);
}

/** Preserve original CSS bytes except exact pinned-compiler numeric color spans. */
export async function projectedNativeBrowserStylesheetAssets(filename: string, root: string) {
  return browserStylesheetAssets(filename, root, true);
}

/** Read first declarations from Lightning CSS's non-minified top-level output. */
export function browserStylesheetLayerOrder(css: string): readonly string[] {
  return [...new Set([...css.matchAll(/^@layer\s+([^;{]+)[;{]/gmu)]
    .flatMap((match) => (match[1] ?? "").split(",").map((name) => name.trim())))];
}

/**
 * Distinguish structural layer-order declarations from rules that actually
 * populate a package's compiled component-priority layers.
 */
export function browserStylesheetHasComponentPriorityRules(
  css: string,
  packageNames: readonly string[],
): boolean {
  const packages = new Set(packageNames);
  const layerStack: string[][] = [];
  let hasPriorityRules = false;

  transform({
    filename: "browser-stylesheet-priority-audit.css",
    code: Buffer.from(css),
    minify: false,
    visitor: {
      Rule(rule) {
        if (rule.type === "layer-block") {
          const parent = layerStack.at(-1) ?? [];
          layerStack.push([...parent, ...(rule.value.name ?? [])]);
          return;
        }
        if (rule.type === "layer-statement") return;
        const layer = layerStack.at(-1);
        if (layer?.[0] === "components" && packages.has(layer[1] ?? "")
          && (layer[2] ?? "").startsWith("priority")) {
          hasPriorityRules = true;
        }
      },
      RuleExit(rule) {
        if (rule.type === "layer-block") layerStack.pop();
      },
    },
  });
  assert.equal(layerStack.length, 0, "Browser CSS layer traversal did not settle");
  return hasPriorityRules;
}

/** Browser fixtures use the same native CSS targets as the shipped atoms. */
export async function bundleBrowserStylesheet(filename: string, root: string): Promise<string> {
  const result = await bundleAsync({
    filename,
    analyzeDependencies: true,
    minify: false,
    targets: compilerContract.css.targets,
    resolver: {
      read: (file) => readFile(file, "utf8"),
      resolve: (specifier, from) => specifier.startsWith(".") || isAbsolute(specifier)
        ? resolve(dirname(from), specifier)
        : createRequire(from).resolve(specifier),
    },
  });
  assert.equal(result.warnings.length, 0, "Browser CSS has compiler warnings");
  let css = Buffer.from(result.code).toString("utf8");
  for (const dependency of result.dependencies ?? []) {
    assert.equal(dependency.type, "url", "Browser CSS retained an unresolved import");
    if (dependency.type !== "url") throw new Error("Unexpected browser CSS dependency");
    const asset = resolve(dirname(dependency.loc.filePath), dependency.url);
    const font = relative(resolve(root, "src/fonts"), asset);
    assert(!font.startsWith("..") && !isAbsolute(font) && font.endsWith(".woff2"),
      "Browser CSS referenced an unregistered font asset");
    assert((await readFile(asset)).byteLength > 0, "Browser CSS referenced an empty font");
    // Lightning CSS emits quoted placeholders. Encode each URL segment, retaining
    // the public font directory contract used by the loopback fixture server.
    const url = `/fonts/${font.split("/").map(encodeURIComponent).join("/")}`;
    assert(css.includes(dependency.placeholder), "Browser CSS lost an asset placeholder");
    css = css.replaceAll(dependency.placeholder, url);
  }
  return css;
}

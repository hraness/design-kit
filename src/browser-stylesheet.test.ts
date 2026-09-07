import { expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import {
  browserStylesheetHasComponentPriorityRules,
  browserStylesheetLayerOrder,
  bundleBrowserStylesheet,
  nativeBrowserStylesheetAssets,
  projectedNativeBrowserStylesheetAssets,
} from "../scripts/browser-stylesheet.js";
import { projectCompilerColor } from "../scripts/browser-css-parity.js";

test("browser CSS layer order retains empty ranks and rejects reordered or missing declarations", () => {
  const expected = ["base", "components.a", "components.b"];
  expect(browserStylesheetLayerOrder("@layer base, components.a, components.b;\n@layer components.b {}"))
    .toEqual(expected);
  expect(browserStylesheetLayerOrder("@layer base {}\n@layer components.a;\n@layer components.b {}"))
    .toEqual(expected);
  expect(browserStylesheetLayerOrder("@layer base {}\n@layer components.b {}\n@layer components.a;"))
    .not.toEqual(expected);
  expect(browserStylesheetLayerOrder("@layer base {}\n@layer components.b {}"))
    .not.toEqual(expected);
});

test("browser CSS priority audit permits declarations but rejects populated priority layers", () => {
  const packages = ["hraness-ui", "hraness-design-kit"];
  expect(browserStylesheetHasComponentPriorityRules(`
    @layer base, components;
    @layer components.hraness-ui.priority1, components.hraness-ui.priority2,
      components.hraness-design-kit.priority1;
    @layer components.hraness-ui.priority2 {}
    @layer components.hraness-design-kit.legacy { .legacy { color: red; } }
  `, packages)).toBeFalse();
  expect(browserStylesheetHasComponentPriorityRules(`
    @layer components.hraness-ui.priority2 { .compiled-atom { color: red; } }
  `, packages)).toBeTrue();
  expect(browserStylesheetHasComponentPriorityRules(`
    @layer components {
      @layer hraness-design-kit {
        @layer priority6 { @media (forced-colors: active) { .compiled-atom { display: none; } } }
      }
    }
  `, packages)).toBeTrue();
  expect(browserStylesheetHasComponentPriorityRules(`
    @layer components.hraness-ui.priority3 {
      @layer { .compiled-atom { padding-inline: 1rem; } }
    }
  `, packages)).toBeTrue();
});

test("browser CSS preserves native logical properties and resolves imported font assets", async () => {
  const root = await mkdtemp(join(tmpdir(), "design-browser-css-"));
  try {
    await mkdir(join(root, "src/fonts/test"), { recursive: true });
    await writeFile(join(root, "src/fonts/test/font[weight].woff2"), "fixture-font");
    await writeFile(join(root, "src/fonts.css"), '@font-face{font-family:test;src:url("./fonts/test/font[weight].woff2")}');
    await writeFile(join(root, "entry.css"), `@layer components;
      @import "./src/fonts.css";
      @layer components { .notice { inset-block-start:0; border-block-end:2px solid red; } }
      @layer components { .canary { color:blue; } }`);
    const css = await bundleBrowserStylesheet(join(root, "entry.css"), root);
    expect(css).toContain("inset-block-start: 0");
    expect(css).toContain("border-block-end: 2px solid red");
    expect(css).not.toMatch(/(?:^|[;{])\s*(?:top|border-bottom):/u);
    expect(css).toContain("/fonts/test/font%5Bweight%5D.woff2");
    expect(css).not.toContain("@import");
    expect(css.match(/@layer components\s*\{/gu)).toHaveLength(1);
    expect(css).toContain(".notice");
    expect(css).toContain(".canary");
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("browser CSS rejects assets outside the registered font boundary", async () => {
  const root = await mkdtemp(join(tmpdir(), "design-browser-css-reject-"));
  try {
    await writeFile(join(root, "entry.css"), '.x { background-image:url("./outside.woff2"); }');
    await expect(bundleBrowserStylesheet(join(root, "entry.css"), root)).rejects.toThrow("unregistered font");
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("native browser oracle serves original aliases and imports without CSS reserialization", async () => {
  const root = await mkdtemp(join(tmpdir(), "design-native-css-"));
  const outside = `${root}.outside.css`;
  try {
    const token = "oklch(0.55 0.21 262)";
    const source = `.probe{color:${token};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}`;
    await mkdir(join(root, "gallery"), { recursive: true });
    await mkdir(join(root, "src/fonts/test"), { recursive: true });
    await writeFile(join(root, "gallery/entry.css"), '@import "../src/imported.css";');
    await writeFile(join(root, "src/imported.css"), source);
    const native = await nativeBrowserStylesheetAssets(join(root, "gallery/entry.css"), root);
    expect(native.entryHref).toBe("/native-oracle/gallery/entry.css");
    expect(native.assets.size).toBe(2);
    expect(native.assets.has("/src/imported.css")).toBeFalse();
    expect(native.assets.has("/styles.css")).toBeFalse();
    expect(native.assets.has("/fixture.css")).toBeFalse();
    expect(native.assets.get("/native-oracle/src/imported.css")?.body.toString()).toBe(source);
    expect(native.assets.get(native.entryHref)?.body.toString()).toBe('@import "../src/imported.css";');
    expect(native.projections).toEqual([]);

    const compiler = projectCompilerColor(token);
    expect(compiler).not.toBeNull();
    if (compiler === null) throw new Error("Missing projected native fixture token");
    const projected = await projectedNativeBrowserStylesheetAssets(join(root, "gallery/entry.css"), root);
    expect(projected.entryHref).toBe("/projected-native-oracle/gallery/entry.css");
    expect(projected.assets.get("/projected-native-oracle/src/imported.css")?.body.toString())
      .toBe(source.replace(token, compiler.projected));
    expect(projected.assets.get(projected.entryHref)?.body.toString()).toBe('@import "../src/imported.css";');
    expect(projected.projections.map(({ url, projections }) => ({
      url, tokens: projections.map(({ original, projected }) => [original, projected]),
    }))).toEqual([
      { url: "/projected-native-oracle/gallery/entry.css", tokens: [] },
      { url: "/projected-native-oracle/src/imported.css", tokens: [[token, compiler.projected]] },
    ]);

    await writeFile(join(root, "gallery/entry.css"), '@import "../styles.css";@import "../fixture.css";');
    await writeFile(join(root, "styles.css"), source);
    await writeFile(join(root, "fixture.css"), source);
    const reserved = await nativeBrowserStylesheetAssets(join(root, "gallery/entry.css"), root);
    expect(reserved.assets.has("/styles.css")).toBeFalse();
    expect(reserved.assets.has("/fixture.css")).toBeFalse();
    expect(reserved.assets.get("/native-oracle/styles.css")?.body.toString()).toBe(source);
    expect(reserved.assets.get("/native-oracle/fixture.css")?.body.toString()).toBe(source);

    await writeFile(outside, source);
    await writeFile(join(root, "gallery/entry.css"), `@import "../../${basename(outside)}";`);
    await expect(nativeBrowserStylesheetAssets(join(root, "gallery/entry.css"), root)).rejects.toThrow("leaves the repository");

    await writeFile(join(root, "gallery/entry.css"), '@import "https://outside.invalid/styles.css";');
    await expect(nativeBrowserStylesheetAssets(join(root, "gallery/entry.css"), root)).rejects.toThrow("relative or package-local");

    await writeFile(join(root, "gallery/entry.css"), '@import "../src/fonts/test/font.woff2";');
    await writeFile(join(root, "src/fonts/test/font.woff2"), "fixture-font");
    await expect(nativeBrowserStylesheetAssets(join(root, "gallery/entry.css"), root)).rejects.toThrow("import must resolve to CSS");

    await writeFile(join(root, "gallery/entry.css"), '.x{background-image:url("../src/imported.css")}');
    await expect(nativeBrowserStylesheetAssets(join(root, "gallery/entry.css"), root)).rejects.toThrow("URL must resolve to a WOFF2 font");

    await writeFile(join(root, "gallery/entry.css"), '.x{background-image:url("../src/fonts/test/font.woff2")}');
    const font = await nativeBrowserStylesheetAssets(join(root, "gallery/entry.css"), root);
    expect(font.assets.get("/native-oracle/src/fonts/test/font.woff2")?.body.toString()).toBe("fixture-font");
    expect(font.assets.get("/native-oracle/src/fonts/test/font.woff2")?.contentType).toBe("font/woff2");
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { force: true });
  }
});

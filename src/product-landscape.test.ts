import { expect, test } from "bun:test";
import { transform } from "lightningcss";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("./product-landscape.css", import.meta.url), "utf8");
const styles = await readFile(new URL("./styles.css", import.meta.url), "utf8");
const foundation = await readFile(new URL("./compiler-foundation.css", import.meta.url), "utf8");
const guide = await readFile(new URL("../LANDSCAPE.md", import.meta.url), "utf8");
const manifest = await Bun.file(new URL("../package.json", import.meta.url)).json() as { exports: Record<string, string>; files: string[] };

const pageHost = 'body:is([data-hraness-landscape="page"], :has([data-hraness-landscape="page"])):not(:has([data-hraness-landscape="off"]))';
const containedHost = '[data-hraness-landscape="contained"]';
const rules = (source: string) => source.replace(/\/\*[\s\S]*?\*\//gu, "");

test("the landscape stays one self-contained unlayered rule set", () => {
  const body = rules(css).trim();
  expect(body.endsWith("}")).toBe(true);
  // Unlayered on purpose: the ruleset opts a page into the drawing, so it must
  // outrank the kit's own unlayered site skins (plain-site, plain-publication)
  // that repaint the page colour, as well as layered component atoms.
  expect(rules(css)).not.toMatch(/@layer/u);
  expect(css).not.toMatch(/@import|url\(|!important|animation:|transition:|position:\s*fixed/u);
  expect(() => transform({ code: Buffer.from(css), filename: "product-landscape.css", minify: true })).not.toThrow();
});

test("every rule targets a landscape host, so pages without one are untouched", () => {
  const selectors = [...rules(css).matchAll(/(?<=^|[{};])\s*([^{};]+?)\s*(?=\{)/gu)]
    .map(([, selector]) => selector ?? "")
    .filter((selector) => !selector.startsWith("@"));
  expect(selectors.length).toBeGreaterThan(8);
  for (const selector of selectors) {
    expect(selector).toContain(pageHost);
    expect(selector).toContain(containedHost);
  }
});

test("the layer tiles a luminance mask down the page and hides in forced colors and print", () => {
  expect(css).toContain("mask-repeat: repeat-y;");
  expect(css).toContain("-webkit-mask-repeat: repeat-y;");
  expect(css).toContain("mask-size: 100% auto;");
  expect(css).toContain("mask-mode: luminance;");
  expect(css).toContain("-webkit-mask-source-type: luminance;");
  expect(css).not.toContain("no-repeat");
  // Without a configured image the mask is transparent, so no ink slab paints.
  expect(css.match(/var\(--hraness-landscape-image, linear-gradient\(transparent, transparent\)\)/gu)?.length).toBe(4);
  expect(css).toContain("var(--hraness-landscape-image-narrow, var(--hraness-landscape-image, linear-gradient(transparent, transparent)))");
  expect(css).toMatch(/@media \(forced-colors: active\), print \{[\s\S]*?::before \{\s*display: none;/u);
  expect(css).toMatch(/@media \(max-width: 48rem\)/u);
});

test("frosted cards use the sticky header material with separate alias queries and opaque fallbacks", () => {
  expect(css).toMatch(/@supports \(-webkit-backdrop-filter: blur\(1px\)\) \{[\s\S]*?-webkit-backdrop-filter: blur\(14px\) saturate\(1\.4\);/u);
  expect(css).toMatch(/@supports \(backdrop-filter: blur\(1px\)\) \{[\s\S]*?\n\s*backdrop-filter: blur\(14px\) saturate\(1\.4\);/u);
  expect(css.match(/color-mix\(in srgb, var\(--_hraness-landscape-glass-base\) 82%, transparent\)/gu)?.length).toBe(2);
  expect(css).toMatch(/@media \(prefers-reduced-transparency: reduce\), \(forced-colors: active\) \{[\s\S]*?backdrop-filter: none;/u);
  for (const hook of ["clear", "solid", "glass"]) expect(css).toContain(`[data-hraness-landscape-surface="${hook}"]`);
});

test("the stylesheet ships, is exported, is part of both complete entries, and is documented", () => {
  expect(manifest.exports["./product-landscape.css"]).toBe("./src/product-landscape.css");
  expect(manifest.files).toContain("src/product-landscape.css");
  expect(manifest.files).toContain("LANDSCAPE.md");
  expect(styles).toContain('@import "./product-landscape.css";');
  expect(foundation).toContain('@import "./product-landscape.css";');
  for (const property of [
    "--hraness-landscape-image",
    "--hraness-landscape-image-narrow",
    "--hraness-landscape-opacity",
    "--hraness-landscape-opacity-narrow",
    "--hraness-landscape-strength",
    "--hraness-landscape-ink",
    "--hraness-landscape-radius",
    "--hraness-landscape-solid",
    "--hraness-landscape-glass",
  ]) {
    expect(css).toContain(property);
    expect(guide).toContain(property);
  }
});

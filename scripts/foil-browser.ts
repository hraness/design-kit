import assert from "node:assert/strict";
import { access, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "playwright-core";
import type * as Source from "../src/react/server.js";
// @ts-expect-error The built graph intentionally has no colocated declarations.
import * as built from "../dist/react/server.js";

const { FoilMark, MarketingSiteHeader } = built as typeof Source;
const mark = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#257ec9" fill-rule="evenodd" d="M12 1a11 11 0 1 1 0 22 11 11 0 0 1 0-22Zm0 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"/></svg>');
const markup = renderToStaticMarkup(createElement("main", null,
  createElement(MarketingSiteHeader, { brand: "Relay", brandMark: mark, links: [], sticky: false }),
  createElement("p", null, "Metallic marks keep their original silhouette."),
  createElement("div", { className: "samples" }, ...[20, 24, 44].map((size) => createElement(FoilMark, { src: mark, size, key: size }))),
));
const [atoms, raw, siblingAtoms] = await Promise.all([
  readFile(new URL("../dist/stylex.css", import.meta.url), "utf8"),
  readFile(new URL("../src/product-marketing.css", import.meta.url), "utf8"),
  readFile(new URL(import.meta.resolve("@hraness/ui/stylex.css")), "utf8"),
]);
// Declaration hashes legitimately repeat across independently layered packages.
// Reproduce the generic hidden atom emitted by a later footer without importing
// product code or depending on one generated class name.
const hiddenAtom = siblingAtoms.match(/\.[A-Za-z0-9_-]+\s*\{\s*display:\s*none;?\s*\}/u)?.[0];
assert(hiddenAtom, "The sibling fixture must contain its emitted display:none atom");
const laterAtoms = `@layer components.foil-regression-sibling.priority3{${hiddenAtom}}`;
const base = `body{margin:0;padding:32px;background:var(--background);color:var(--foreground);font:16px system-ui}body[data-theme=light]{color-scheme:light;--foreground:#211d1b;--background:#fbf6f2}body[data-theme=dark]{color-scheme:dark;--foreground:#f2eee9;--background:#171412}.samples{display:flex;align-items:center;gap:24px}.hraness-marketing-header__inner{padding:0}.hraness-marketing-header__brand{font-size:24px}`;
let executablePath: string | undefined;
for (const candidate of [process.env.CHROMIUM_EXECUTABLE_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", chromium.executablePath(), "/usr/bin/chromium"]) {
  if (candidate === undefined) continue;
  try { await access(candidate); executablePath = candidate; break; } catch { /* Try the next installed browser. */ }
}
assert(executablePath, "No installed Chromium executable.");
const browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
const output = process.env.FOIL_SCREENSHOT_DIR ?? join(tmpdir(), "hraness-foil-browser");
await mkdir(output, { recursive: true });
try {
  for (const route of ["compiled", "raw", "compiled-with-later-atoms", "raw-with-later-atoms"] as const) {
  for (const theme of ["light", "dark"] as const) {
    for (const width of [390, 900]) {
      const page = await browser.newPage({ viewport: { width, height: 280 }, colorScheme: theme, reducedMotion: "reduce" });
      await page.setContent(`<html><head><style>${route.startsWith("compiled") ? atoms : raw.replace(/^@import[^;]+;/u, "")}\n${route.endsWith("later-atoms") ? laterAtoms : ""}\n${base}</style></head><body data-theme="${theme}">${markup}</body></html>`);
      await page.locator("img").evaluateAll((images) => Promise.all(images.map((image) => (image as HTMLImageElement).decode())));
      const evidence = await page.locator(".hraness-foil-mark").evaluateAll((marks) => marks.map((element) => {
        const paint = element.querySelector(".hraness-foil-mark__paint");
        const image = element.querySelector("img");
        if (!paint || !image) throw new Error("Missing mark layers");
        return { width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height, requested: Number(image.getAttribute("width")), paint: getComputedStyle(paint).backgroundImage, mask: getComputedStyle(paint).maskImage, display: getComputedStyle(paint).display };
      }));
      for (const observed of evidence) {
        assert.equal(observed.width, observed.requested, "Mark keeps its requested width");
        assert.equal(observed.height, observed.requested, "Mark keeps its requested height");
        assert.equal(observed.display, "block");
        assert(observed.mask.startsWith("url("));
        assert(observed.paint.includes("conic-gradient") && observed.paint.includes("linear-gradient"));
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: join(output, `${route}-${theme}-${width}.png`) });
      await page.emulateMedia({ forcedColors: "active" });
      for (const display of await page.locator(".hraness-foil-mark__paint").evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).display))) assert.equal(display, "none");
      assert.notEqual(await page.locator(".hraness-marketing-header__brand").evaluate((node) => getComputedStyle(node).webkitTextFillColor), "rgba(0, 0, 0, 0)");
      await page.emulateMedia({ forcedColors: "none" });
      // CSP can reject the inline source property: the inert paint becomes
      // fully transparent and the original image remains visible underneath.
      await page.locator(".hraness-foil-mark__paint").evaluateAll((nodes) => nodes.forEach((node) => node.removeAttribute("style")));
      for (const mask of await page.locator(".hraness-foil-mark__paint").evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).maskImage))) assert(mask.includes("rgba(0, 0, 0, 0)"));
      await page.close();
    }
  }
  }
  console.log(`Foil browser proof passed: light/dark, desktop/mobile, static reduced motion, forced colors, mask fallback, later-package atom collision. Screenshots: ${output}`);
} finally {
  await browser.close();
}

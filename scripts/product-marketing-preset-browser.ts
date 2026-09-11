import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { chromium } from "playwright-core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transform } from "lightningcss";
import { readStylexPackageManifest, serializeStylexRuleUnionV1 } from "@hraness/ui/stylex-build";
import type * as Marketing from "../src/react/product-marketing.js";
import { ProductMarketingPresetFixture } from "../gallery/product-marketing-preset-fixture.js";
import { bundleBrowserStylesheet } from "./browser-stylesheet.js";

const root = resolve(import.meta.dir, "..");
const output = await mkdtemp(join(tmpdir(), "marketing-preset-browser-"));
const api: typeof Marketing = await import(join(root, "dist/react/server.js"));
const html = renderToStaticMarkup(createElement(ProductMarketingPresetFixture, { api }));
assert.doesNotMatch(html, /style=|<script|<style/iu);
const rawHtml = html.replace(/class="([^"]*)"/gu, (_match, value: string) => `class="${value.split(/\s+/u).filter((name) => name.startsWith("hraness-marketing-") || name.startsWith("fixture-")).join(" ")}"`);
assert.notEqual(rawHtml, html, "Fixture must use compiled components");
const [raw, standalone, foundation, kit, ui, preset] = await Promise.all([
  bundleBrowserStylesheet(join(root, "gallery/product-marketing-static.css"), root),
  bundleBrowserStylesheet(join(root, "src/styles.css"), root),
  bundleBrowserStylesheet(join(root, "src/compiler-foundation.css"), root),
  readStylexPackageManifest(join(root, "dist/stylex-manifest.json"), root),
  readStylexPackageManifest(join(root, "node_modules/@hraness/ui/dist/stylex-manifest.json"), join(root, "node_modules/@hraness/ui")),
  readFile(join(root, "src/product-marketing-preset.css"), "utf8"),
]);
const optimized = transform({ filename: "product-marketing-preset.css", code: Buffer.from(preset), minify: true }).code.toString();
assert(optimized.includes(";backdrop-filter:"), "Optimized preset lost native blur");
const compiled = foundation + "\n" + serializeStylexRuleUnionV1([...ui.rules, ...kit.rules], [ui.standaloneSerializer, kit.standaloneSerializer]);
const styles = { raw: raw + "\n" + optimized, standalone: standalone + "\n" + optimized, compiler: compiled + "\n" + optimized };
const failures: string[] = [];
const fixtureCss = 'body{margin:0}.fixture-quiet-header{position:sticky;top:0;padding:12px 20px;z-index:50}.fixture-product-heading{font:600 19px/1.3 system-ui}.hraness-marketing-page{--hraness-site-accent:rgb(22,90,61)}';
const server = Bun.serve({ hostname: "127.0.0.1", port: 0, async fetch(request) {
  const url = new URL(request.url);
  if (url.pathname === "/styles.css") {
    const mode = url.searchParams.get("mode") as keyof typeof styles;
    return new Response(styles[mode] ?? "", { headers: { "content-type": "text/css" } });
  }
  if (url.pathname === "/fixture.css") return new Response(fixtureCss, { headers: { "content-type": "text/css" } });
  if (url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/marketing-assets/")) {
    const path = resolve(root, "src", decodeURIComponent(url.pathname.slice(1)));
    const logical = relative(join(root, "src"), path);
    if (logical.startsWith("..") || isAbsolute(logical) || !/\.(woff2|svg)$/u.test(logical)) return new Response("Not found", { status: 404 });
    return new Response(await readFile(path), { headers: { "content-type": path.endsWith(".woff2") ? "font/woff2" : "image/svg+xml" } });
  }
  const mode = url.searchParams.get("mode") ?? "raw";
  const theme = url.searchParams.get("theme") === "dark" ? "dark" : "light";
  return new Response(`<!doctype html><html lang="en" data-theme="${theme}" class="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Marketing presets</title><link rel="stylesheet" href="/styles.css?mode=${mode}"><link rel="stylesheet" href="/fixture.css"></head><body>${mode === "raw" ? rawHtml : html}</body></html>`, { headers: { "content-type": "text/html", "content-security-policy": "default-src 'none'; style-src 'self'; style-src-attr 'none'; font-src 'self'; img-src 'self'; base-uri 'none'" } });
} });
let executablePath: string | undefined;
for (const candidate of [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"]) {
  if (candidate === undefined) continue;
  try { await access(candidate); executablePath = candidate; break; } catch { /* next installed browser */ }
}
assert(executablePath, "A local Chromium executable is required");
const browser = await chromium.launch({ executablePath, headless: true, args: process.platform === "linux" ? ["--no-sandbox"] : [] });
const receipts: unknown[] = [];
try {
  for (const width of [320, 800, 1280]) for (const theme of ["light", "dark"]) {
    let reference: unknown;
    for (const mode of ["raw", "standalone", "compiler"] as const) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, colorScheme: theme as "light" | "dark" });
      page.on("pageerror", (error) => failures.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
      page.on("response", (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
      try {
        await page.goto(`http://${server.hostname}:${server.port}/?mode=${mode}&theme=${theme}`, { waitUntil: "networkidle" });
        await page.evaluate(async () => { await document.fonts.ready; });
        const proof = await page.evaluate(() => {
          const required = (selector: string) => { const node = document.querySelector(selector); if (!(node instanceof HTMLElement)) throw new Error(`Missing ${selector}`); return node; };
          const metrics = (selector: string) => { const node = required(selector), style = getComputedStyle(node); return { font: style.fontFamily, size: style.fontSize, weight: style.fontWeight, leading: style.lineHeight, tracking: style.letterSpacing, padding: style.paddingInlineStart, width: node.getBoundingClientRect().width }; };
          const field = required('.hraness-marketing-page[data-hraness-marketing-preset="editorial"] > .hraness-marketing-field');
          return {
            hero: metrics("#editorial-title"), section: metrics("#section-title"), install: metrics("#install-title"), minimal: metrics("#minimal-title"), product: metrics(".fixture-product-heading"),
            heroContainer: metrics('.hraness-marketing-field > .hraness-marketing-hero'),
            background: getComputedStyle(field).backgroundImage,
            minimalBackground: getComputedStyle(required('[data-hraness-marketing-preset="minimal"] > .hraness-marketing-field')).backgroundImage,
            blur: getComputedStyle(required(".fixture-quiet-header")).backdropFilter,
            headerPosition: getComputedStyle(required(".fixture-quiet-header")).position,
            actionHeight: required(".hraness-marketing-action").getBoundingClientRect().height,
            actionBackground: getComputedStyle(required(".hraness-marketing-action")).backgroundColor,
            label: getComputedStyle(required(".hraness-marketing-hero__eyebrow")).display,
            fontLoaded: document.fonts.check('400 40px "Instrument Serif"'),
            overflow: document.documentElement.scrollWidth > window.innerWidth,
            overlay: getComputedStyle(field, "::before").content,
          };
        });
        assert(proof.fontLoaded && proof.hero.font.includes("Instrument Serif"));
        assert.equal(proof.hero.weight, "400");
        assert(!proof.minimal.font.includes("Instrument Serif"));
        assert.equal(proof.product.size, "19px");
        assert.equal(proof.minimalBackground, "none");
        assert(proof.background.includes("grain.svg") && proof.background.includes("cells.svg") && proof.background.includes("gradient"));
        assert.equal(proof.blur, "blur(14px) saturate(1.4)");
        assert.equal(proof.headerPosition, "sticky");
        assert.equal(proof.actionHeight, 42);
        assert.equal(proof.actionBackground, "rgb(22, 90, 61)");
        assert.equal(proof.label, "none");
        assert.equal(proof.overflow, false);
        assert.equal(proof.overlay, "none");
        const { background: _background, ...comparable } = proof; // Different origin ports are not geometry or typography.
        void _background;
        if (reference === undefined) reference = comparable;
        else assert.deepEqual(comparable, reference, `${mode} differs from raw preset at ${width}/${theme}`);
        receipts.push({ mode, width, theme, ...proof });
        if (mode === "compiler" && width === 1280) await page.screenshot({ path: join(output, `${theme}.png`), fullPage: true });
        await page.emulateMedia({ forcedColors: "active" });
        assert.equal(await page.locator('.hraness-marketing-page[data-hraness-marketing-preset="editorial"] > .hraness-marketing-field').evaluate((node) => getComputedStyle(node).backgroundImage), "none");
        assert.equal(await page.locator(".fixture-quiet-header").evaluate((node) => getComputedStyle(node).backdropFilter), "none");
      } finally { await page.close(); }
    }
  }
  assert.deepEqual(failures, []);
  await writeFile(join(output, "receipt.json"), JSON.stringify({ sourceSha256: createHash("sha256").update(preset).digest("hex"), cases: receipts }, null, 2));
  console.log(`Marketing preset parity verified: ${receipts.length} cases; ${output}`);
} finally { await browser.close(); server.stop(true); }

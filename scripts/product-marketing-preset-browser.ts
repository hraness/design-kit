import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { chromium, type Page } from "playwright-core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transform } from "lightningcss";
import { readStylexPackageManifest, serializeStylexRuleUnionV1 } from "@hraness/ui/stylex-build";
import type * as Marketing from "../src/react/product-marketing.js";
import { ProductMarketingPresetFixture } from "../gallery/product-marketing-preset-fixture.js";
import { bundleBrowserStylesheet } from "./browser-stylesheet.js";
import { requireHeaderPaint, withTransparencyPreference } from "./browser-transparency.js";
import { builtDesignKit } from "./built-root.js";

const root = resolve(import.meta.dir, "..");
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)).join(", ")})`;
const headerSelectors = [".fixture-quiet-header", ".fixture-standalone-header"];
async function patternPaint(page: Page) {
  return page.evaluate(() => {
    const field = document.querySelector('.hraness-marketing-page[data-hraness-marketing-preset="editorial"] > .hraness-marketing-field');
    if (!(field instanceof HTMLElement)) throw new Error("Missing opening field");
    const original = field.getAttribute("data-hraness-pattern");
    const paints = ["cells", "weave", "contour", "mesh", "none"].map((pattern) => {
      field.setAttribute("data-hraness-pattern", pattern);
      const style = getComputedStyle(field);
      return { pattern, image: style.backgroundImage, size: style.backgroundSize };
    });
    if (original === null) field.removeAttribute("data-hraness-pattern");
    else field.setAttribute("data-hraness-pattern", original);
    return paints;
  });
}

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
const explicitInk = '--hraness-site-accent-ink:rgb(255,255,255);';
const fixtureCss = `body{margin:0}.fixture-quiet-header,.fixture-standalone-header{position:sticky;top:0;padding:12px 20px;z-index:50}.fixture-product-heading{font:600 19px/1.3 system-ui}.hraness-marketing-page{--hraness-site-accent:rgb(22,90,61);${explicitInk}}`;
const server = Bun.serve({ hostname: "127.0.0.1", port: 0, async fetch(request) {
  const url = new URL(request.url);
  if (url.pathname === "/styles.css") {
    const mode = url.searchParams.get("mode") as keyof typeof styles;
    return new Response(styles[mode] ?? "", { headers: { "content-type": "text/css" } });
  }
  if (url.pathname === "/fixture.css") return new Response(url.searchParams.get("ink") === "palette" ? fixtureCss.replace(explicitInk, "") : fixtureCss, { headers: { "content-type": "text/css" } });
  if (url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/marketing-assets/")) {
    const path = resolve(root, "src", decodeURIComponent(url.pathname.slice(1)));
    const logical = relative(join(root, "src"), path);
    if (logical.startsWith("..") || isAbsolute(logical) || !/\.(woff2|svg)$/u.test(logical)) return new Response("Not found", { status: 404 });
    return new Response(await readFile(path), { headers: { "content-type": path.endsWith(".woff2") ? "font/woff2" : "image/svg+xml" } });
  }
  const mode = url.searchParams.get("mode") ?? "raw";
  const theme = url.searchParams.get("theme") === "dark" ? "dark" : "light";
  const ink = url.searchParams.get("ink") === "palette" ? "palette" : "explicit";
  return new Response(`<!doctype html><html lang="en" data-theme="${theme}" class="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Marketing presets</title><link rel="stylesheet" href="/styles.css?mode=${mode}"><link rel="stylesheet" href="/fixture.css?ink=${ink}"></head><body>${mode === "raw" ? rawHtml : html}</body></html>`, { headers: { "content-type": "text/html", "content-security-policy": "default-src 'none'; style-src 'self'; style-src-attr 'none'; font-src 'self'; img-src 'self'; base-uri 'none'" } });
} });
let executablePath: string | undefined;
for (const candidate of [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"]) {
  if (candidate === undefined) continue;
  try { await access(candidate); executablePath = candidate; break; } catch { /* next installed browser */ }
}
assert(executablePath, "A local Chromium executable is required");
const browser = await chromium.launch({ executablePath, headless: true, args: process.platform === "linux" ? ["--no-sandbox"] : [] });
const receipts: unknown[] = [];
const missingInkControls: unknown[] = [];
try {
  for (const width of [320, 800, 1280]) for (const theme of ["light", "dark"] as const) {
    let reference: unknown;
    for (const mode of ["raw", "standalone", "compiler"] as const) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, colorScheme: theme as "light" | "dark" });
      page.on("pageerror", (error) => failures.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
      page.on("response", (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
      try {
        await page.goto(`http://${server.hostname}:${server.port}/?mode=${mode}&theme=${theme}`, { waitUntil: "networkidle" });
        await withTransparencyPreference(page, "no-preference", async (selectTransparency) => {
          await page.evaluate(async () => { await document.fonts.ready; });
          await requireHeaderPaint(page, headerSelectors.map((selector) => ({ selector })), "blur(14px) saturate(1.4)");
          const proof = await page.evaluate(() => {
            const required = (selector: string) => { const node = document.querySelector(selector); if (!(node instanceof HTMLElement)) throw new Error(`Missing ${selector}`); return node; };
            const metrics = (selector: string) => { const node = required(selector), style = getComputedStyle(node); return { font: style.fontFamily, size: style.fontSize, weight: style.fontWeight, leading: style.lineHeight, tracking: style.letterSpacing, padding: style.paddingInlineStart, width: node.getBoundingClientRect().width }; };
            const field = required('.hraness-marketing-page[data-hraness-marketing-preset="editorial"] > .hraness-marketing-field');
            return {
              cta: metrics("#editorial-cta-title"), minimalCta: metrics("#minimal-cta-title"),
              hero: metrics("#editorial-title"), section: metrics("#section-title"), install: metrics("#install-title"), minimal: metrics("#minimal-title"), product: metrics(".fixture-product-heading"),
              fieldTrustMuted: getComputedStyle(required(".hraness-marketing-trust-item__detail")).color,
              fieldHeroMuted: getComputedStyle(required(".hraness-marketing-hero__summary")).color,
              heroContainer: metrics('.hraness-marketing-field > .hraness-marketing-hero'),
              background: getComputedStyle(field).backgroundImage,
              minimalBackground: getComputedStyle(required('[data-hraness-marketing-preset="minimal"] > .hraness-marketing-field')).backgroundImage,
              blur: getComputedStyle(required(".fixture-quiet-header")).backdropFilter,
              standaloneBlur: getComputedStyle(required(".fixture-standalone-header")).backdropFilter,
              standaloneBackground: getComputedStyle(required(".fixture-standalone-header")).backgroundColor,
              headerPosition: getComputedStyle(required(".fixture-quiet-header")).position,
              actionHeight: required(".hraness-marketing-action").getBoundingClientRect().height,
              actionBackground: getComputedStyle(required(".hraness-marketing-action")).backgroundColor,
              primaryActions: [...document.querySelectorAll<HTMLElement>('.hraness-marketing-action[data-emphasis="primary"]')].map((node) => {
                const style = getComputedStyle(node);
                return { color: style.color, fill: style.webkitTextFillColor, background: style.backgroundColor, opacity: style.opacity };
              }),
              label: document.querySelector(".hraness-marketing-hero__eyebrow") === null ? "omitted" : getComputedStyle(required(".hraness-marketing-hero__eyebrow")).display,
              fontLoaded: document.fonts.check('400 40px "Instrument Serif"'),
              overflow: document.documentElement.scrollWidth > window.innerWidth,
              overlay: getComputedStyle(field, "::before").content,
            };
          });
          assert(proof.fontLoaded && proof.hero.font.includes("Instrument Serif"));
          assert.equal(proof.fieldTrustMuted, proof.fieldHeroMuted);
          assert.equal(proof.hero.weight, "400");
          assert(!proof.minimal.font.includes("Instrument Serif"));
          assert.equal(proof.product.size, "19px");
          assert.equal(proof.minimalBackground, "none");
          assert(proof.background.includes("grain.svg") && proof.background.includes("cells.svg") && proof.background.includes("gradient"));
          assert.equal(proof.blur, "blur(14px) saturate(1.4)");
          assert.equal(proof.standaloneBlur, "blur(14px) saturate(1.4)");
          assert.notEqual(proof.standaloneBackground, "rgba(0, 0, 0, 0)");
          assert.equal(proof.headerPosition, "sticky");
          assert.equal(proof.actionHeight, 36);
          assert.equal(proof.actionBackground, "rgb(22, 90, 61)");
          assert.deepEqual(proof.primaryActions, Array.from({ length: 4 }, () => ({ color: "rgb(255, 255, 255)", fill: "rgb(255, 255, 255)", background: "rgb(22, 90, 61)", opacity: "1" })), `${mode} primary action paint at ${width}/${theme}`);
          assert.equal(proof.label, "omitted");
          assert.equal(proof.overflow, false);
          assert.equal(proof.overlay, "none");
          const { background: _background, ...comparable } = proof; // Different origin ports are not geometry or typography.
          void _background;
          if (reference === undefined) reference = comparable;
          else assert.deepEqual(comparable, reference, `${mode} differs from raw preset at ${width}/${theme}`);
          if (mode !== "raw") {
            // Face tokens must re-resolve inside a preset scope, not keep :root's face.
            const tokenFaces = await page.evaluate(() => [
              '.hraness-marketing-page[data-hraness-marketing-preset="editorial"]',
              '.hraness-marketing-page[data-hraness-marketing-preset="minimal"]',
            ].map((scope) => {
              const host = document.querySelector(scope);
              if (!(host instanceof HTMLElement)) throw new Error(`Missing ${scope}`);
              const probe = (level: string) => {
                const node = document.createElement(level);
                node.textContent = "Probe";
                node.style.fontFamily = `var(--hraness-type-${level}-font)`;
                node.style.fontWeight = `var(--hraness-type-${level}-weight)`;
                host.append(node);
                const { fontFamily, fontWeight } = getComputedStyle(node);
                node.remove();
                return { font: fontFamily, weight: fontWeight };
              };
              return { h2: probe("h2"), h3: probe("h3") };
            }));
            const [editorial, minimal] = tokenFaces;
            assert(editorial?.h2.font.includes("Instrument Serif"), `${mode} editorial h2 token face: ${editorial?.h2.font}`);
            assert.equal(editorial?.h2.weight, "400", `${mode} editorial h2 token weight`);
            assert(!editorial?.h3.font.includes("Instrument Serif"), `${mode} editorial h3 token must use the text face`);
            assert(!minimal?.h2.font.includes("Instrument Serif"), `${mode} minimal h2 token face: ${minimal?.h2.font}`);
          }
          const patterns = await patternPaint(page);
          assert.equal(new Set(patterns.map(({ image }) => image)).size, 5, `${mode} must render five distinct patterns`);
          assert(patterns[0]?.image.includes("cells.svg"));
          assert(patterns[1]?.image.includes("repeating-conic-gradient"));
          assert(patterns[2]?.image.includes("repeating-radial-gradient"));
          assert(patterns[3]?.image.includes("radial-gradient"));
          assert.equal(patterns[4]?.image, "none");
          const quietRoot = await page.evaluate(() => {
            document.documentElement.setAttribute("data-hraness-pattern", "none");
            const field = document.querySelector('.hraness-marketing-page[data-hraness-marketing-preset="editorial"] > .hraness-marketing-field');
            if (!(field instanceof HTMLElement)) throw new Error("Missing opening field");
            const image = getComputedStyle(field).backgroundImage;
            document.documentElement.removeAttribute("data-hraness-pattern");
            return image;
          });
          assert.equal(quietRoot, "none", `${mode} quiet root must survive a nested preset`);
          receipts.push({ mode, width, theme, ...proof, patterns });
          if (mode === "compiler" && width === 1280) await page.screenshot({ path: join(output, `${theme}.png`), fullPage: true });
          await selectTransparency("reduce");
          assert((await patternPaint(page)).every(({ image }) => image === "none"), `${mode} patterns must flatten with reduced transparency`);
          await requireHeaderPaint(page, headerSelectors.map((selector) => ({
            selector, background: rgb(builtDesignKit.colors[theme].background),
          })), "none");
          await selectTransparency("no-preference");
          await requireHeaderPaint(page, headerSelectors.map((selector) => ({ selector })), "blur(14px) saturate(1.4)");
          await selectTransparency("no-preference", { forcedColors: "active" });
          assert((await patternPaint(page)).every(({ image }) => image === "none"), `${mode} patterns must flatten in forced colors`);
          await requireHeaderPaint(page, headerSelectors.map((selector) => ({ selector })), "none");
          assert.equal(await page.locator('.hraness-marketing-page[data-hraness-marketing-preset="editorial"] > .hraness-marketing-field').evaluate((node) => getComputedStyle(node).backgroundImage), "none");
          assert.equal(await page.locator(".fixture-quiet-header").evaluate((node) => getComputedStyle(node).backdropFilter), "none");
          assert.equal(await page.locator(".fixture-standalone-header").evaluate((node) => getComputedStyle(node).backdropFilter), "none");
        });
      } finally { await page.close(); }
    }
  }
  // Removing only the explicit ink must resolve the canonical palette pair's
  // foreground. Keep the green action paint and all four real actions intact,
  // and prove that this incomplete override cannot satisfy the white-ink proof.
  for (const theme of ["light", "dark"] as const) for (const mode of ["raw", "standalone", "compiler"] as const) {
    const page = await browser.newPage({ viewport: { width: 320, height: 1000 }, colorScheme: theme });
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
    page.on("response", (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    try {
      await page.goto(`http://${server.hostname}:${server.port}/?mode=${mode}&theme=${theme}&ink=palette`, { waitUntil: "networkidle" });
      const actions = await page.locator('.hraness-marketing-action[data-emphasis="primary"]').evaluateAll((nodes) => nodes.map((node) => {
        const style = getComputedStyle(node);
        return { color: style.color, fill: style.webkitTextFillColor, background: style.backgroundColor, opacity: style.opacity };
      }));
      const color = rgb(builtDesignKit.colors[theme].primaryForeground);
      const expected = Array.from({ length: 4 }, () => ({ color, fill: color, background: "rgb(22, 90, 61)", opacity: "1" }));
      assert.deepEqual(actions, expected, `${mode}/${theme} omitted ink must follow canonical primary foreground`);
      assert.notEqual(color, "rgb(255, 255, 255)", "Missing-ink control must distinguish the explicit white ink");
      assert.notDeepEqual(actions, Array.from({ length: 4 }, () => ({ color: "rgb(255, 255, 255)", fill: "rgb(255, 255, 255)", background: "rgb(22, 90, 61)", opacity: "1" })), `${mode}/${theme} incomplete pair cannot satisfy the explicit-pair proof`);
      missingInkControls.push({ mode, theme, actions });
    } finally { await page.close(); }
  }
  const coarse = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  try {
    await coarse.goto(`http://${server.hostname}:${server.port}/?mode=compiler`, { waitUntil: "networkidle" });
    assert.equal(await coarse.locator(".hraness-marketing-action").first().evaluate((node) => node.getBoundingClientRect().height), 48);
    await withTransparencyPreference(coarse, "no-preference", async (selectTransparency) => {
      await requireHeaderPaint(coarse, headerSelectors.map((selector) => ({ selector })), "blur(14px) saturate(1.4)");
      await selectTransparency("reduce");
      await requireHeaderPaint(coarse, headerSelectors.map((selector) => ({
        selector, background: rgb(builtDesignKit.colors.light.background),
      })), "none");
      assert.equal(await coarse.locator(".fixture-quiet-header").evaluate((node) => getComputedStyle(node).backdropFilter), "none");
      assert.equal(await coarse.locator(".fixture-standalone-header").evaluate((node) => getComputedStyle(node).backdropFilter), "none");
    });
  } finally { await coarse.close(); }
  assert.deepEqual(failures, []);
  await writeFile(join(output, "receipt.json"), JSON.stringify({ sourceSha256: createHash("sha256").update(preset).digest("hex"), cases: receipts, missingInkControls }, null, 2));
  console.log(`Marketing preset parity verified: ${receipts.length} cases and ${missingInkControls.length} missing-ink controls; ${output}`);
} finally { await browser.close(); server.stop(true); }

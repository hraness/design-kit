import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium, type Page } from "playwright-core";
import { bundleBrowserStylesheet } from "./browser-stylesheet.js";

const repository = resolve(import.meta.dir, "..");
async function executable(): Promise<string> {
  for (const path of [process.env.CHROMIUM_EXECUTABLE_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", chromium.executablePath(), "/usr/bin/chromium"]) {
    if (path === undefined) continue;
    try { await access(path); return path; } catch { /* Next installed browser. */ }
  }
  throw new Error("No Chromium executable available");
}

const { renderStatusPageHtml } = await import(join(repository, "dist/index.js"));
const bundle = await Bun.build({ entrypoints: [join(repository, "dist/browser/index.js")], format: "esm" });
assert(bundle.success, "The browser entry must bundle");
const output = bundle.outputs[0];
assert(output, "The browser bundle must emit one file");
const script = await output.text();
const [standalone, foundation] = await Promise.all([
  bundleBrowserStylesheet(join(repository, "src/styles.css"), repository),
  bundleBrowserStylesheet(join(repository, "src/compiler-foundation.css"), repository),
]);
const markup: string = renderStatusPageHtml({
  siteName: "Example",
  primaryAction: { href: "/start", label: "Start a library" },
  next: [
    { href: "/product", label: "How it works", description: "One line about the product." },
    { href: "/docs", label: "Docs", description: "Set it up in a few minutes." },
    { href: "/pricing", label: "Pricing" },
  ],
  routes: [{ href: "/docs/getting-started", label: "Getting started" }],
  agentIndexHref: "/llms.txt",
});
const documentFor = (css: string, palette: string, theme: string) => `<!doctype html><html lang="en" data-palette="${palette}" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Status page</title><style>${css}
body { margin: 0; background: var(--background); color: var(--foreground); }</style></head><body>${markup}
<script type="module">${script}
window.__statusDispose = attachStatusPage(document.querySelector(".hraness-status-page"));</script></body></html>`;

// Count animation frames so the gate can prove an idle page stops asking for them.
const frameCounter = `(() => { const raf = window.requestAnimationFrame.bind(window); window.__frames = 0;
  window.requestAnimationFrame = (callback) => { window.__frames++; return raf(callback); }; })();`;

const browser = await chromium.launch({ executablePath: await executable(), args: ["--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] });
async function open(css: string, options: { width?: number; palette?: string; theme?: string; reducedMotion?: "reduce" | "no-preference"; forcedColors?: "active" | "none" } = {}): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: options.width ?? 1280, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: options.reducedMotion ?? "no-preference", forcedColors: options.forcedColors ?? "none" });
  await page.addInitScript(frameCounter);
  const html = documentFor(css, options.palette ?? "gruvbox", options.theme ?? "dark");
  await page.route("**/*", (route) => new URL(route.request().url()).pathname.startsWith("/fonts/")
    ? route.fulfill({ status: 404, body: "" })
    : route.fulfill({ contentType: "text/html", body: html }));
  await page.goto("http://status.test/docs/getting-startd");
  assert.deepEqual(errors, [], "The status page must load without script errors");
  return page;
}
const field = (page: Page) => page.locator(".hraness-status-page").getAttribute("data-hraness-status-field");
const glyphVisibility = (page: Page) => page.locator(".hraness-status-page__glyph").evaluate((node) => getComputedStyle(node).visibility);
const frames = (page: Page) => page.evaluate(() => (window as unknown as { __frames: number }).__frames);
async function settled(page: Page): Promise<void> {
  // Wait until two samples 300ms apart report no new frames.
  for (let attempt = 0; attempt < 40; attempt++) {
    const before = await frames(page);
    await page.waitForTimeout(300);
    if (await frames(page) === before) return;
  }
  throw new Error("The dot field never settled");
}

try {
  for (const [name, css] of [["standalone", standalone], ["compiler", foundation]] as const) {
    const page = await open(css);
    await page.waitForFunction(() => document.querySelector(".hraness-status-page")?.getAttribute("data-hraness-status-field") === "live");
    assert.equal(await glyphVisibility(page), "hidden", `${name}: the live field replaces the text glyph`);
    assert.equal(await page.locator(".hraness-status-page__hint").isVisible(), true, `${name}: the closest page is offered`);
    assert.equal(await page.locator(".hraness-status-page__hint a").getAttribute("href"), "/docs/getting-started");
    assert.equal(await page.locator(".hraness-status-page__back").isVisible(), false, `${name}: Back stays hidden without a same-site referrer`);
    const [actionColor, titleColor] = await Promise.all([
      page.locator(".hraness-status-page__action").evaluate((node) => getComputedStyle(node).color),
      page.locator(".hraness-status-page__title").evaluate((node) => getComputedStyle(node).color),
    ]);
    assert.equal(actionColor, titleColor, `${name}: the primary action keeps the page ink on every surface`);
    await settled(page);
    const box = await page.locator(".hraness-status-page__code").boundingBox();
    assert(box, `${name}: the glyph box renders`);
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height / 2, { steps: 6 });
    const beforeWake = await frames(page);
    await page.waitForTimeout(120);
    assert((await frames(page)) > beforeWake, `${name}: the pointer wakes the field`);
    await page.mouse.move(2, 2);
    await page.mouse.click(2, 890);
    await settled(page);
    const idle = await frames(page);
    await page.waitForTimeout(600);
    assert.equal(await frames(page), idle, `${name}: an idle page requests no frames`);
    await page.evaluate(() => (window as unknown as { __statusDispose: () => void }).__statusDispose());
    assert.equal(await field(page), null, `${name}: cleanup restores the text glyph`);
    await page.close();
  }

  const phone = await open(standalone, { width: 390, palette: "paper", theme: "light" });
  await phone.waitForFunction(() => document.querySelector(".hraness-status-page")?.getAttribute("data-hraness-status-field") === "live");
  assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth), 390, "The phone layout has no horizontal scroll");
  await phone.close();

  const still = await open(standalone, { reducedMotion: "reduce" });
  await still.waitForFunction(() => document.querySelector(".hraness-status-page")?.getAttribute("data-hraness-status-field") === "live");
  const stillFrames = await frames(still);
  const stillBox = await still.locator(".hraness-status-page__code").boundingBox();
  assert(stillBox, "The reduced-motion glyph box renders");
  await still.mouse.move(stillBox.x + 10, stillBox.y + 10);
  await still.mouse.move(stillBox.x + stillBox.width / 2, stillBox.y + stillBox.height / 2, { steps: 6 });
  await still.mouse.down();
  await still.mouse.up();
  await still.waitForTimeout(400);
  assert.equal(await frames(still), stillFrames, "Reduced motion draws the settled glyph once and ignores the pointer");
  await still.close();

  const forced = await open(standalone, { forcedColors: "active" });
  await forced.waitForTimeout(400);
  assert.equal(await field(forced), null, "Forced colors keep the text glyph");
  assert.equal(await glyphVisibility(forced), "visible");
  await forced.close();
  console.log("Status page browser checks passed.");
} finally {
  await browser.close();
}

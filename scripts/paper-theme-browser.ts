import assert from "node:assert/strict";
import { access, mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
import { paletteColors } from "../src/palettes.js";

const root = resolve(import.meta.dir, "..");
const screenshotArgument = process.argv.indexOf("--screenshots");
const screenshotDirectory = screenshotArgument < 0 ? process.env.PAPER_THEME_SCREENSHOTS : process.argv[screenshotArgument + 1];
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)).join(", ")})`;
let executablePath: string | undefined;
for (const path of [process.env.CHROMIUM_EXECUTABLE_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium", chromium.executablePath(), "/usr/bin/chromium", "/usr/bin/chromium-browser"]) {
  if (path === undefined) continue;
  try { await access(path); executablePath = path; break; } catch { /* Try another installed browser. */ }
}
assert(executablePath, "No Chromium executable is available.");
const html = await readFile(resolve(root, "gallery/paper-theme.html"), "utf8");
const paper = await readFile(resolve(root, "src/paper-theme.css"), "utf8");
const fixture = await readFile(resolve(root, "gallery/paper-theme.css"), "utf8");
const fontCss = await readFile(resolve(root, "src/fonts.css"), "utf8");
const server = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch(request) {
  const path = new URL(request.url).pathname;
  const headers = { "content-security-policy": "default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'" };
  if (path === "/") return new Response(html, { headers: { ...headers, "content-type": "text/html" } });
  if (path === "/paper-theme.css") return new Response(paper, { headers: { "content-type": "text/css" } });
  if (path === "/fixture.css") return new Response(fixture, { headers: { "content-type": "text/css" } });
  if (path === "/fonts.css") return new Response(fontCss, { headers: { "content-type": "text/css" } });
  if (/^\/fonts\/(?:nebula-sans|geist-mono)\/[\w[\]-]+\.woff2$/u.test(path)) return new Response(Bun.file(resolve(root, `src${path}`)));
  return new Response("Not found", { status: 404 });
} });
const browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, colorScheme: "light", reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(server.url.href, { waitUntil: "networkidle" });
    assert(await page.evaluate(() => CSS.supports("color", "light-dark(white, black)")));
    const inspect = (selector: string) => page.locator(selector).evaluate((element) => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, foreground: style.color, scheme: style.colorScheme,
        measure: style.getPropertyValue("--hraness-marketing-measure").trim(),
        font: style.fontFamily, overflow: element.scrollWidth > element.clientWidth };
    });
    for (const [selector, mode] of [["#light", "light"], ["#dark", "dark"], ["#nested-dark", "dark"], ["#nested-light", "light"]] as const) {
      const style = await inspect(selector);
      assert.equal(style.background, rgb(paletteColors.paper[mode].background));
      assert.equal(style.foreground, rgb(paletteColors.paper[mode].foreground));
      assert.equal(style.overflow, false);
      assert(style.font.includes("Nebula Sans"));
    }
    assert.equal((await inspect("#unthemed")).background, "rgb(255, 255, 255)");
    assert.equal((await inspect("#chosen")).background, "rgb(40, 40, 40)");
    assert.equal((await inspect("#marketing-rhythm")).measure, "80rem");
    const chosen = await inspect("#chosen");
    await page.emulateMedia({ colorScheme: "dark" });
    assert.equal((await inspect("#light")).background, rgb(paletteColors.paper.light.background));
    assert.deepEqual(await inspect("#chosen"), chosen);
    // Older standalone themes use :root[data-theme] (specificity 0,2).
    // Verify actual document paint, including the legacy negative baseline.
    await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
    assert.equal((await inspect("body")).background, "rgb(251, 246, 242)");
    await page.evaluate(() => { document.documentElement.dataset.hranessTheme = "paper"; });
    for (const mode of ["light", "dark"] as const) {
      await page.evaluate((mode) => { document.documentElement.dataset.theme = mode; }, mode);
      assert.equal((await inspect("body")).background, rgb(paletteColors.paper[mode].background));
      assert.equal((await inspect("body")).foreground, rgb(paletteColors.paper[mode].foreground));
    }
    await page.evaluate(() => { document.documentElement.removeAttribute("data-theme"); });
    // A real top-level first visit follows the system; an explicit legacy
    // `system` attribute does too, without resetting any stored preference.
    await page.evaluate(() => { document.documentElement.dataset.hranessTheme = "paper"; });
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), "light dark");
    await page.evaluate(() => { document.documentElement.dataset.theme = "system"; });
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), "light dark");
    await page.evaluate(() => { document.documentElement.removeAttribute("data-hraness-theme"); document.documentElement.removeAttribute("data-theme"); });
    await page.emulateMedia({ colorScheme: "light" });
    await page.locator("#note").focus();
    assert.equal(await page.locator("#note").evaluate((element) => getComputedStyle(element).outlineWidth), "2px");
    await page.keyboard.type("Review tomorrow’s notes");
    assert.equal(await page.locator("#note").inputValue(), "Review tomorrow’s notes");
    await page.locator("summary").focus(); await page.keyboard.press("Enter");
    assert.equal(await page.locator("details").getAttribute("open"), "");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (screenshotDirectory) {
      await mkdir(screenshotDirectory, { recursive: true });
      await page.screenshot({ path: resolve(screenshotDirectory, `paper-${width}.png`), fullPage: true });
    }
    await page.emulateMedia({ forcedColors: "active" });
    const forced = await page.locator("#light").evaluate((element) => {
      const css = getComputedStyle(element); return [css.getPropertyValue("--background").trim(), css.getPropertyValue("--foreground").trim(), css.getPropertyValue("--focus").trim()];
    });
    assert.deepEqual(forced, ["Canvas", "CanvasText", "Highlight"]);
    await page.evaluate(() => { document.documentElement.dataset.hranessTheme = "paper"; document.documentElement.dataset.theme = "dark"; });
    assert.deepEqual(await page.locator("html").evaluate((element) => {
      const css = getComputedStyle(element); return [css.getPropertyValue("--background").trim(), css.getPropertyValue("--foreground").trim(), css.getPropertyValue("--focus").trim()];
    }), ["Canvas", "CanvasText", "Highlight"], "Legacy root rules must not override forced-color semantics.");
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Paper CSS verified: desktop/mobile, light/dark islands, named palette isolation, legacy root priority, system mode, semantic controls, and forced colors.");
} finally { await browser.close(); server.stop(true); }

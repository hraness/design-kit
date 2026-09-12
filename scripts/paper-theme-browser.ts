import assert from "node:assert/strict";
import { access, mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
import { transform } from "lightningcss";
import { paletteColors } from "../src/palettes.js";
import { requireHeaderPaint, withTransparencyPreference } from "./browser-transparency.js";

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
const optimizedPaper = transform({ filename: "paper-theme.css", code: Buffer.from(paper), minify: true }).code.toString();
// The v0.4.0 consumer declaration order loses the standard alias when optimized.
// Keep this negative baseline independent of the repaired source contract.
const legacyHeader = transform({ filename: "legacy-header.css", code: Buffer.from(`
@layer components.hraness-design-kit.legacy {
  .hraness-marketing-header {
    --hraness-marketing-background: var(--background);
    background: color-mix(in oklch, var(--hraness-marketing-background) 82%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    position: sticky; top: 0; z-index: 40; display: flex;
    min-height: 56px; align-items: center; justify-content: space-between;
    gap: 1rem; padding: .75rem 1rem; border-bottom: 1px solid var(--line);
  }
}`), minify: true }).code.toString();
const fallbackPaper = transform({ filename: "paper-no-backdrop.css", code: Buffer.from(paper), minify: true, visitor: {
  Rule(rule) { if (rule.type === "supports" && JSON.stringify(rule).includes("backdrop-filter")) return []; return undefined; },
} }).code.toString();
const fixture = await readFile(resolve(root, "gallery/paper-theme.css"), "utf8");
const fontCss = await readFile(resolve(root, "src/fonts.css"), "utf8");
const server = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch(request) {
  const path = new URL(request.url).pathname;
  const headers = { "content-security-policy": "default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'" };
  if (path === "/") return new Response(html, { headers: { ...headers, "content-type": "text/html" } });
  if (path === "/paper-theme.css") return new Response(optimizedPaper, { headers: { "content-type": "text/css" } });
  if (path === "/legacy-header.css") return new Response(legacyHeader, { headers: { "content-type": "text/css" } });
  if (path === "/paper-no-backdrop.css") return new Response(fallbackPaper, { headers: { "content-type": "text/css" } });
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
      assert.equal((await inspect(`${selector} > p a`)).foreground, rgb(paletteColors.paper[mode].primary));
    }
    assert.equal((await inspect("#unthemed")).background, "rgb(255, 255, 255)");
    assert.equal((await inspect("#chosen")).background, "rgb(40, 40, 40)");
    assert.equal((await inspect("#chosen-link")).foreground, "rgb(184, 187, 38)");
    assert.equal((await inspect("#marketing-rhythm")).measure, "80rem");
    const headerPaint = () => page.locator("#light-header-scroll header, #dark-header-scroll header").evaluateAll((headers) => headers.map((header) => {
      const css = getComputedStyle(header);
      return { background: css.backgroundColor, backdrop: css.backdropFilter, position: css.position };
    }));
    const headers = ["light", "dark"].map((mode) => ({ selector: `#${mode}-header-scroll header` }));
    const opaqueHeaders = (["light", "dark"] as const).map((mode) => ({
      selector: `#${mode}-header-scroll header`, background: rgb(paletteColors.paper[mode].background),
    }));
    await withTransparencyPreference(page, "no-preference", async (selectTransparency) => {
      // Demonstrate the optimizer failure without letting the host's opaque
      // accessibility preference satisfy the negative control accidentally.
      await page.locator('link[href="/paper-theme.css"]').evaluate((link) => { (link as HTMLLinkElement).disabled = true; });
      assert((await headerPaint()).every(({ backdrop }) => backdrop === "none"));
      await page.locator('link[href="/paper-theme.css"]').evaluate((link) => { (link as HTMLLinkElement).disabled = false; });
      // Re-enabling the link can return before its stylesheet affects paint.
      try {
        await requireHeaderPaint(page, headers, "blur(14px) saturate(1.4)");
      } catch (cause) {
        const diagnostics = await page.evaluate(() => {
          const link = document.querySelector<HTMLLinkElement>('link[href="/paper-theme.css"]');
          return {
            disabled: link?.disabled,
            stylesheetPresent: [...document.styleSheets].some((sheet) => sheet.href?.endsWith("/paper-theme.css")),
            headers: [...document.querySelectorAll("#light-header-scroll header, #dark-header-scroll header")].map((header) => {
              const css = getComputedStyle(header);
              return { region: header.parentElement?.id, background: css.backgroundColor, backdrop: css.backdropFilter, position: css.position };
            }),
          };
        }).catch((error: unknown) => ({ diagnosticError: error instanceof Error ? error.message : String(error) }));
        throw new Error(`Paper header paint did not return at viewport ${width}: ${JSON.stringify(diagnostics)}`, { cause });
      }
      assert((await headerPaint()).every(({ backdrop, position }) => backdrop === "blur(14px) saturate(1.4)" && position === "sticky"));
      await page.locator(".header-scroll").evaluateAll((regions) => { for (const region of regions) region.scrollTop = 110; });
      assert(await page.locator("#light-header-scroll").evaluate((region) => {
        const header = region.querySelector("header");
        if (header === null) throw new Error("The scrolling fixture lost its header.");
        return Math.abs(header.getBoundingClientRect().top - region.getBoundingClientRect().top - 1) < 1;
      }));
      await selectTransparency("reduce");
      await requireHeaderPaint(page, opaqueHeaders, "none");
      assert.deepEqual((await headerPaint()).map(({ background, backdrop }) => ({ background, backdrop })), [
        { background: rgb(paletteColors.paper.light.background), backdrop: "none" },
        { background: rgb(paletteColors.paper.dark.background), backdrop: "none" },
      ]);
      await selectTransparency("no-preference");
      // Removing only capability branches models an engine rejecting both
      // aliases. Keep no-preference active so accessibility cannot mask a bug.
      await page.locator('link[href="/paper-theme.css"]').evaluate((link) => { (link as HTMLLinkElement).href = "/paper-no-backdrop.css"; });
      await page.waitForFunction(() => [...document.styleSheets].some((sheet) => sheet.href?.endsWith("/paper-no-backdrop.css")));
      await requireHeaderPaint(page, opaqueHeaders, "none");
      assert.deepEqual((await headerPaint()).map(({ background, backdrop }) => ({ background, backdrop })), [
        { background: rgb(paletteColors.paper.light.background), backdrop: "none" },
        { background: rgb(paletteColors.paper.dark.background), backdrop: "none" },
      ]);
      await page.locator('link[href="/paper-no-backdrop.css"]').evaluate((link) => { (link as HTMLLinkElement).href = "/paper-theme.css"; });
      await page.waitForFunction(() => [...document.styleSheets].some((sheet) => sheet.href?.endsWith("/paper-theme.css")));
      await requireHeaderPaint(page, headers, "blur(14px) saturate(1.4)");
    });
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
      assert.equal((await inspect("#root-link")).foreground, rgb(paletteColors.paper[mode].primary));
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
    assert((await headerPaint()).every(({ backdrop }) => backdrop === "none"));
    const forced = await page.locator("#light").evaluate((element) => {
      const css = getComputedStyle(element); return [css.getPropertyValue("--background").trim(), css.getPropertyValue("--foreground").trim(), css.getPropertyValue("--focus").trim()];
    });
    assert.deepEqual(forced, ["Canvas", "CanvasText", "Highlight"]);
    for (const mode of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: mode });
      await page.evaluate((mode) => { document.documentElement.dataset.hranessTheme = "paper"; document.documentElement.dataset.theme = mode; }, mode);
      assert.deepEqual(await page.locator("html").evaluate((element) => {
        const css = getComputedStyle(element); return [css.getPropertyValue("--background").trim(), css.getPropertyValue("--foreground").trim(), css.getPropertyValue("--focus").trim(), css.getPropertyValue("--primary").trim()];
      }), ["Canvas", "CanvasText", "Highlight", "Highlight"], "Legacy root rules must not override forced-color semantics.");
      const systemLink = (await inspect("#system-link-reference")).foreground;
      for (const selector of ["#root-link", "#light-link", "#dark-link", "#nested-light-link", "#nested-dark-link"]) {
        const link = await page.locator(selector).evaluate((element) => ({
          color: getComputedStyle(element).color,
          adjustment: getComputedStyle(element).forcedColorAdjust,
          nativeLink: element instanceof HTMLAnchorElement && element.hasAttribute("href"),
        }));
        assert(link.nativeLink);
        assert.equal(link.adjustment, "auto");
        assert.equal(link.color, systemLink, `${selector} must paint LinkText in forced ${mode} colors.`);
      }
      assert.equal(await page.locator("#chosen").evaluate((element) => getComputedStyle(element).getPropertyValue("--plain-link").trim()), "#b8bb26", "A selected non-Paper palette retains its own link token.");
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Paper CSS verified: desktop/mobile, light/dark islands, named palette isolation, legacy root priority, system mode, semantic controls, optimized header blur, opaque capability fallback, reduced transparency, and forced colors.");
} finally { await browser.close(); server.stop(true); }

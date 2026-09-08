import assert from "node:assert/strict";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { chromium, type BrowserContext, type Page } from "playwright-core";
import { designPalettes, paletteColors } from "../src/palettes.js";

const storageKey = "hraness-design-palette-v1";
const work = await mkdtemp(join(tmpdir(), "hraness-palette-browser-"));
const errors: string[] = [];

function captureErrors(page: Page): void {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
}

async function executable(): Promise<string> {
  for (const path of [process.env.CHROMIUM_EXECUTABLE_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium", chromium.executablePath(), "/usr/bin/chromium", "/usr/bin/chromium-browser"]) {
    if (path === undefined) continue;
    try { await access(path); return path; } catch { /* Try the next installed browser. */ }
  }
  throw new Error("No Chromium executable is available.");
}

function rgb(hex: string): string {
  assert.match(hex, /^#[\da-f]{6}$/iu);
  return `rgb(${[1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)).join(", ")})`;
}

async function ready(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator('.hraness-design-palette-menu[data-ready="true"]').waitFor();
}

async function openMenu(page: Page): Promise<void> {
  const menu = page.locator("details.hraness-design-palette-menu");
  if (await menu.getAttribute("open") === null) await menu.locator("summary").click();
}

async function assertPalette(page: Page, palette: (typeof designPalettes)[number], mode: "light" | "dark"): Promise<void> {
  await page.waitForFunction(({ palette, mode }) => document.documentElement.dataset.palette === palette
    && document.documentElement.dataset.theme === mode
    && document.querySelector("[data-palette-portal]")?.getAttribute("data-theme") === mode
    && document.querySelector("[data-palette-state]")?.textContent?.startsWith(`${palette} /`), { palette, mode });
  const expected = paletteColors[palette][mode];
  const state = await page.evaluate(() => {
    const surface = document.querySelector("[data-palette-surface]");
    const portal = document.querySelector("[data-palette-portal]");
    const icon = document.querySelector("summary svg");
    if (surface === null || portal === null || icon === null) throw new Error("Missing palette fixture element.");
    const geometry = icon.getBoundingClientRect();
    const activeMeta = document.querySelectorAll('meta[name="theme-color"]:not([media])');
    return {
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      bodyText: getComputedStyle(document.body).color,
      surfaceBackground: getComputedStyle(surface).backgroundColor,
      portalBackground: getComputedStyle(portal).backgroundColor,
      portalText: getComputedStyle(portal).color,
      portalTheme: portal.getAttribute("data-theme"),
      inline: document.querySelectorAll("style, [style], script:not([src])").length,
      csp: Number(document.documentElement.dataset.cspViolations ?? "0"),
      metaCount: activeMeta.length,
      meta: activeMeta[0]?.getAttribute("content"),
      icon: [geometry.width, geometry.height],
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  assert.equal(state.bodyBackground, rgb(expected.background));
  assert.equal(state.bodyText, rgb(expected.foreground));
  assert.equal(state.surfaceBackground, rgb(expected.surface));
  assert.equal(state.portalBackground, rgb(expected.surface));
  assert.equal(state.portalText, rgb(expected.foreground));
  assert.equal(state.portalTheme, mode);
  assert.equal(state.inline, 0, "The strict-CSP path emitted inline delivery.");
  assert.equal(state.csp, 0, "A CSP violation occurred.");
  assert.equal(state.metaCount, 1, "Bootstrap adoption created duplicate theme-color owners.");
  assert.equal(state.meta, expected.background);
  assert.deepEqual(state.icon, [18, 18]);
  assert.equal(state.overflow, false);
}

async function isolatedPage(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  captureErrors(page);
  return page;
}

try {
  const appBuild = await Bun.build({
    entrypoints: ["gallery/palette-main.tsx"], outdir: work, naming: "[name].[ext]", format: "esm", target: "browser", minify: true,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
  });
  assert.equal(appBuild.success, true, appBuild.logs.map(String).join("\n"));
  const bootstrapBuild = await Bun.build({
    entrypoints: ["gallery/palette-bootstrap.ts"], outdir: work, naming: "[name].[ext]", format: "iife", target: "browser", minify: true,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
  });
  assert.equal(bootstrapBuild.success, true, bootstrapBuild.logs.map(String).join("\n"));
  await writeFile(join(work, "index.html"), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Palette verification</title><link rel="stylesheet" href="/palette-main.css"><script src="/palette-bootstrap.js"></script></head><body><div id="root"></div><script type="module" src="/palette-main.js"></script></body></html>');
  const server = Bun.serve({
    hostname: "127.0.0.1", port: 0,
    async fetch(request) {
      const pathname = new URL(request.url).pathname;
      if (pathname === "/favicon.ico") return new Response(null, { status: 204 });
      const name = pathname === "/" ? "index.html" : basename(pathname);
      const file = Bun.file(join(work, name));
      if (!(await file.exists())) return new Response("Not found", { status: 404 });
      return new Response(file, { headers: {
        "content-type": name.endsWith(".js") ? "text/javascript" : name.endsWith(".css") ? "text/css" : "text/html",
        "content-security-policy": "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'none'; base-uri 'none'",
      } });
    },
  });
  try {
    const browser = await chromium.launch({ executablePath: await executable(), headless: true, args: ["--no-sandbox"] });
    try {
      const origin = `http://127.0.0.1:${String(server.port)}`;
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "light" });
      const page = await isolatedPage(context);
      await ready(page, origin);
      assert.equal(await page.locator("html").getAttribute("data-bootstrap-palette"), "catppuccin");
      assert.equal(await page.locator("html").getAttribute("data-bootstrap-mode"), "dark");
      await assertPalette(page, "catppuccin", "dark");
      for (const palette of designPalettes) {
        for (const mode of ["light", "dark"] as const) {
          await openMenu(page);
          await page.locator(`input[type="radio"][value="${palette}"]`).check();
          await page.locator(`input[type="radio"][value="${mode}"]`).check();
          await assertPalette(page, palette, mode);
        }
      }
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("details").getAttribute("open"), null);
      assert.equal(await page.locator("summary").evaluate((element) => element === document.activeElement), true);
      await openMenu(page);
      await page.locator("#outside").click();
      assert.equal(await page.locator("details").getAttribute("open"), null);
      await openMenu(page);
      await page.locator('input[value="system"]').check();
      await page.emulateMedia({ colorScheme: "light" });
      await assertPalette(page, "tokyo-night", "light");
      await page.emulateMedia({ colorScheme: "dark" });
      await assertPalette(page, "tokyo-night", "dark");
      const second = await isolatedPage(context);
      await ready(second, origin);
      await openMenu(second);
      await second.locator('input[value="gruvbox"]').check();
      await second.locator('input[value="light"]').check();
      await assertPalette(page, "gruvbox", "light");
      await page.reload({ waitUntil: "networkidle" });
      await assertPalette(page, "gruvbox", "light");
      assert.equal(await page.locator("html").getAttribute("data-bootstrap-palette"), "gruvbox");
      await context.close();

      for (const scenario of ["malformed", "denied"] as const) {
        const isolated = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "light" });
        if (scenario === "malformed") await isolated.addInitScript((key) => { localStorage.setItem(key, '{"palette":"missing","mode":"light"}'); }, storageKey);
        const target = await isolatedPage(isolated);
        await ready(target, `${origin}/${scenario === "denied" ? "?denied" : ""}`);
        await assertPalette(target, "catppuccin", "dark");
        await openMenu(target);
        await target.locator('input[value="rose-pine"]').check();
        await target.locator('input[value="light"]').check();
        await assertPalette(target, "rose-pine", "light");
        await isolated.close();
      }
      const controlledContext = await browser.newContext({ colorScheme: "light" });
      const controlledPage = await isolatedPage(controlledContext);
      await ready(controlledPage, `${origin}/?controlled`);
      await openMenu(controlledPage);
      await controlledPage.locator('input[value="system"]').click();
      await controlledPage.locator('[data-palette-controlled-request]').filter({ hasText: "system" }).waitFor();
      await assertPalette(controlledPage, "catppuccin", "dark");
      assert.equal(await controlledPage.locator('input[value="light"]').isChecked(), true);
      assert.equal(await controlledPage.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null").mode, storageKey), "dark");
      await controlledContext.close();
      assert.deepEqual(errors, [], "Browser errors occurred.");
      console.log("Palette browser checks passed: eight variants, first paint, persistence, cross-tab/system changes, denied/malformed storage, native menu, portals, and strict CSP.");
    } finally { await browser.close(); }
  } finally { await server.stop(true); }
} finally { await rm(work, { recursive: true, force: true }); }

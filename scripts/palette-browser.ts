import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { readStylexPackageManifest, serializeStylexRuleUnionV1 } from "@hraness/ui/stylex-build";
import { chromium, type BrowserContext, type Page } from "playwright-core";
import { designPalettes, paletteColors } from "../src/palettes.js";
import { bundleBrowserStylesheet, nativeBrowserStylesheetAssets } from "./browser-stylesheet.js";

const storageKey = "hraness-design-palette-v1";
const repository = resolve(import.meta.dir, "..");
const work = await mkdtemp(join(tmpdir(), "hraness-palette-browser-"));
const errors: string[] = [];
const forcedRoutes = ["standalone", "standalone-full", "compiler-minimal", "compiler-full"] as const;
const plainRoutes = ["native-plain", "standalone-full", "compiler-full"] as const;
const plainRoles = ["background", "foreground", "link", "muted", "surface", "syntax-keyword", "syntax-string", "syntax-number", "syntax-name"] as const;
type Palette = (typeof designPalettes)[number];
type Mode = "light" | "dark";

function nestedPlainPalettes(palette: Palette): readonly [Palette, Palette] {
  const index = designPalettes.indexOf(palette);
  const nested = designPalettes[(index + 1) % designPalettes.length];
  const self = designPalettes[(index + 2) % designPalettes.length];
  assert(nested !== undefined && self !== undefined, "Plain palette fixture requires two nested palette families.");
  return [nested, self];
}

function plainHtml(stylesheets: readonly string[], palette: Palette, mode: Mode | "system"): string {
  const [nested, self] = nestedPlainPalettes(palette);
  const probes = `<div data-plain-probes aria-hidden="true">${plainRoles.map((role) => `<span data-plain-role="${role}"></span>`).join("")}</div>`;
  return `<!doctype html><html lang="en" data-palette="${palette}"${mode === "system" ? "" : ` data-theme="${mode}"`}><head><meta charset="utf-8"><title>Plain palette verification</title>${stylesheets.map((href) => `<link rel="stylesheet" href="${href}">`).join("")}</head><body class="plain-site">${probes}<main>Selected document palette<section data-palette="${nested}" data-theme="light"><article class="plain-site" data-plain-nested>${probes}Nested light document</article></section><section class="plain-site" data-palette="${self}" data-plain-self>${probes}Nested system document</section><div data-forced-reference>System colors</div></main></body></html>`;
}

async function assertPlainPalette(page: Page, palette: Palette, mode: Mode, systemMode: Mode, nestedOnly = false): Promise<void> {
  const [nested, self] = nestedPlainPalettes(palette);
  for (const [selector, expectedPalette, expectedMode] of [
    ["body.plain-site", palette, mode],
    ["[data-plain-nested]", nested, "light"],
    ["[data-plain-self]", self, systemMode],
  ] as const) {
    if (nestedOnly && selector === "body.plain-site") continue;
    const expected = paletteColors[expectedPalette][expectedMode];
    const actual = await page.locator(selector).evaluate((element) => {
      const css = getComputedStyle(element);
      return {
        background: css.backgroundColor, foreground: css.color,
        roles: [...element.querySelectorAll(":scope > [data-plain-probes] > [data-plain-role]")].map((probe) => getComputedStyle(probe).backgroundColor),
      };
    });
    assert.deepEqual(actual, {
      background: rgb(expected.background), foreground: rgb(expected.foreground),
      roles: [expected.background, expected.foreground, expected.primary, expected.muted, expected.surface, expected.warning, expected.success, expected.danger, expected.info].map(rgb),
    }, `${selector}: plain-site palette paint and semantic aliases (${palette}/${mode}/${systemMode})`);
  }
  if (!nestedOnly) assert.equal(await page.locator("html").evaluate((element) => getComputedStyle(element).backgroundColor), rgb(paletteColors[palette][mode].background), "Plain document canvas must match its body.");
}

async function assertForcedPlainPalette(page: Page): Promise<void> {
  const state = await page.evaluate(() => {
    const reference = document.querySelector("[data-forced-reference]");
    if (reference === null) throw new Error("Missing plain forced-color reference.");
    const paint = (element: Element) => {
      const css = getComputedStyle(element);
      return [css.backgroundColor, css.color];
    };
    return {
      forced: matchMedia("(forced-colors: active)").matches,
      reference: paint(reference),
      surfaces: [document.body, document.querySelector("[data-plain-nested]"), document.querySelector("[data-plain-self]")].map((element) => {
        if (element === null) throw new Error("Missing plain palette surface.");
        const css = getComputedStyle(element);
        return { paint: paint(element), roles: ["background", "foreground", "link", "muted", "surface"].map((role) => css.getPropertyValue(`--plain-${role}`).trim()), adjustment: css.forcedColorAdjust };
      }),
    };
  });
  assert.equal(state.forced, true);
  for (const surface of state.surfaces) {
    assert.deepEqual(surface.roles, ["Canvas", "CanvasText", "Highlight", "CanvasText", "Canvas"], "Plain aliases must retain forced semantic values, not merely browser-adjusted paint.");
    assert.deepEqual(surface.paint, state.reference);
    assert.equal(surface.adjustment, "auto");
  }
}

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

async function paletteSettled(page: Page, palette: (typeof designPalettes)[number], mode: "light" | "dark"): Promise<void> {
  await page.waitForFunction(({ palette, mode }) => document.documentElement.dataset.palette === palette
    && document.documentElement.dataset.theme === mode
    && document.querySelector("[data-palette-portal]")?.getAttribute("data-theme") === mode
    && document.querySelector("[data-palette-state]")?.textContent?.startsWith(`${palette} /`), { palette, mode });
}

async function assertPalette(page: Page, palette: (typeof designPalettes)[number], mode: "light" | "dark"): Promise<void> {
  await paletteSettled(page, palette, mode);
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

async function assertForcedPalette(page: Page): Promise<void> {
  const state = await page.evaluate(() => {
    const portal = document.querySelector("[data-palette-portal]");
    const surface = document.querySelector("[data-palette-surface]");
    const reference = document.querySelector("[data-forced-reference]");
    const button = document.querySelector("#outside");
    const referenceButton = document.querySelector("[data-forced-reference-button]");
    if (portal === null || surface === null || reference === null || button === null || referenceButton === null) {
      throw new Error("Missing forced-color fixture element.");
    }
    const roles = ["background", "foreground", "surface", "primary", "primary-foreground", "focus"];
    const inspect = (element: Element) => {
      const css = getComputedStyle(element);
      return {
        raw: roles.map((role) => css.getPropertyValue(`--hraness-palette-${role}`).trim()),
        product: roles.map((role) => css.getPropertyValue(`--${role}`).trim()),
        ui: ["background", "foreground", "primary", "primary-foreground", "ring"].map((role) => css.getPropertyValue(`--ui-${role}`).trim()),
        adjustment: css.forcedColorAdjust,
      };
    };
    const paint = (element: Element) => {
      const css = getComputedStyle(element);
      return [css.backgroundColor, css.color];
    };
    return {
      forced: matchMedia("(forced-colors: active)").matches,
      root: inspect(document.documentElement), portal: inspect(portal),
      islandHasOwnClass: portal.classList.contains("hraness-palette"),
      islandHasPaletteAttribute: portal.hasAttribute("data-palette"),
      body: paint(document.body), surface: paint(surface), island: paint(portal), reference: paint(reference),
      button: paint(button), referenceButton: paint(referenceButton),
      inline: document.querySelectorAll("style, [style], script:not([src])").length,
      csp: Number(document.documentElement.dataset.cspViolations ?? "0"),
    };
  });
  assert.equal(state.forced, true, "Forced-color checks require native media emulation.");
  for (const boundary of [state.root, state.portal]) {
    const expected = ["Canvas", "CanvasText", "Canvas", "Highlight", "HighlightText", "Highlight"];
    assert.deepEqual(boundary.raw, expected, "The compiled theme overrode forced semantic values.");
    assert.deepEqual(boundary.product, expected, "Product roles lost their forced semantic aliases.");
    assert.deepEqual(boundary.ui, ["Canvas", "CanvasText", "Highlight", "HighlightText", "Highlight"], "Portable control roles lost forced colors.");
    assert.equal(boundary.adjustment, "auto");
  }
  assert.equal(state.islandHasOwnClass, true);
  assert.equal(state.islandHasPaletteAttribute, false, "Portal coverage must not rely on a data-palette attribute.");
  for (const paint of [state.body, state.surface, state.island]) assert.deepEqual(paint, state.reference);
  assert.deepEqual(state.button, state.referenceButton);
  assert.equal(state.inline, 0);
  assert.equal(state.csp, 0);
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
  const html = (stylesheets: readonly string[]) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Palette verification</title>${stylesheets.map((href) => `<link rel="stylesheet" href="/${href}">`).join("")}<script src="/palette-bootstrap.js"></script></head><body><div id="root"></div><script type="module" src="/palette-main.js"></script></body></html>`;
  await writeFile(join(work, "index.html"), html(["palette-main.css"]));
  const [standalone, standaloneFull, minimal, full, designManifest, uiManifest, layout] = await Promise.all([
    bundleBrowserStylesheet(join(repository, "src/palettes.css"), repository),
    bundleBrowserStylesheet(join(repository, "src/styles.css"), repository),
    bundleBrowserStylesheet(join(repository, "src/compiler-palettes.css"), repository),
    bundleBrowserStylesheet(join(repository, "src/compiler-foundation.css"), repository),
    readStylexPackageManifest(join(repository, "dist/stylex-manifest.json"), repository),
    readStylexPackageManifest(join(repository, "node_modules/@hraness/ui/dist/stylex-manifest.json"), join(repository, "node_modules/@hraness/ui")),
    readFile(join(repository, "gallery/palette.css"), "utf8"),
  ]);
  // Use the actual finalizer serializer and both hash-verified package profiles.
  // The package smoke test separately proves collect/finalize emits this union.
  const union = serializeStylexRuleUnionV1([...uiManifest.rules, ...designManifest.rules],
    [uiManifest.standaloneSerializer, designManifest.standaloneSerializer]);
  await writeFile(join(work, "palette-union.css"), union);
  await writeFile(join(work, "palette-layout.css"), `${layout}\n[data-raw-island], [data-raw-system-island] { background-color: var(--background); color: var(--foreground); }\n${plainRoles.map((role) => `[data-plain-role="${role}"] { background-color: var(--plain-${role}); }`).join("\n")}\n`);
  const deliveries = { standalone, "standalone-full": standaloneFull, "compiler-minimal": minimal, "compiler-full": full };
  for (const route of forcedRoutes) {
    await writeFile(join(work, `${route}.css`), deliveries[route]);
    await writeFile(join(work, `${route}.html`), html([
      `${route}.css`, ...(route.startsWith("compiler-") ? ["palette-union.css"] : []), "palette-layout.css",
    ]));
  }
  // Exercise the real document grammar, not a body painted only by fixture CSS.
  // The native route serves exact source bytes and native relative imports;
  // standalone and compiler routes retain their complete production ordering.
  const [nativePlain, nativeBridge, plainCss] = await Promise.all([
    nativeBrowserStylesheetAssets(join(repository, "src/plain-site.css"), repository),
    nativeBrowserStylesheetAssets(join(repository, "src/palette-bridge.css"), repository),
    readFile(join(repository, "src/plain-site.css"), "utf8"),
  ]);
  const plainAssets = new Map([...nativePlain.assets, ...nativeBridge.assets]);
  for (const route of plainRoutes) {
    const stylesheets = route === "native-plain"
      ? [nativeBridge.entryHref, nativePlain.entryHref, "/palette-layout.css"]
      : [`/${route}.css`, ...(route === "compiler-full" ? ["/palette-union.css"] : []), "/palette-layout.css"];
    for (const palette of designPalettes) for (const mode of ["system", "light", "dark"] as const) {
      await writeFile(join(work, `plain-${route}-${palette}-${mode}.html`), plainHtml(stylesheets, palette, mode));
    }
  }
  // With no root palette, only the island's own boundary can override the
  // document's neutral dark rule. This independently covers the self selector.
  for (const palette of designPalettes) for (const preference of ["dark", "system"] as const) {
    const islands = plainHtml([nativeBridge.entryHref, nativePlain.entryHref, "/palette-layout.css"], palette, preference)
      .replace(`<html lang="en" data-palette="${palette}"`, '<html lang="en"')
      .replace('<body class="plain-site">', "<body>");
    await writeFile(join(work, `plain-islands-${palette}-${preference}.html`), islands);
  }
  const oldPlain = plainCss
    .replace("[data-palette][data-palette] .plain-site,", "[data-palette] .plain-site,")
    .replace(".plain-site[data-palette][data-palette] {", ".plain-site[data-palette] {");
  assert.notEqual(oldPlain, plainCss, "The plain-site negative control did not restore the old bridge selectors.");
  await writeFile(join(work, "plain-old.css"), oldPlain);
  for (const preference of ["dark", "system"] as const) {
    await writeFile(join(work, `plain-old-${preference}.html`), plainHtml([nativeBridge.entryHref, "/plain-old.css", "/palette-layout.css"], "tokyo-night", preference));
  }
  const nestedBridgeSelector = /(,\s+)\[data-palette\]\[data-palette\](\s*\{)/gu;
  assert.equal([...full.matchAll(nestedBridgeSelector)].length, 1, "The nested-palette negative control requires exactly one generic semantic bridge selector.");
  const oldNestedFull = full.replace(nestedBridgeSelector, "$1[data-palette]$2");
  await writeFile(join(work, "plain-old-nested.css"), oldNestedFull);
  await writeFile(join(work, "plain-old-nested.html"), plainHtml(["/plain-old-nested.css", "/palette-union.css", "/palette-layout.css"], "catppuccin", "light"));
  await writeFile(join(work, "legacy-paper.css"), await readFile(join(repository, "src/paper-theme.css"), "utf8"));
  // Static sites need system and explicit modes before, and without, JavaScript.
  for (const palette of designPalettes) for (const mode of ["system", "light", "dark"] as const) {
    await writeFile(join(work, `raw-${palette}-${mode}.html`), `<!doctype html><html lang="en" data-hraness-theme="paper" data-palette="${palette}"${mode === "system" ? "" : ` data-theme="${mode}"`}><head><meta charset="utf-8"><title>Static palette</title><link rel="stylesheet" href="/compiler-minimal.css"><link rel="stylesheet" href="/palette-layout.css"><link rel="stylesheet" href="/legacy-paper.css"></head><body><main data-palette-surface>Readable before JavaScript</main><section data-palette="tokyo-night" data-theme="dark" data-raw-island>Static nested palette</section><section data-palette="rose-pine" data-raw-system-island>System nested palette</section></body></html>`);
  }
  // Reproduce the former selectors without changing the real union or product
  // fixture. Native paint alone would hide this broken custom-property cascade.
  const oldMinimal = minimal.replaceAll(".hraness-palette.hraness-palette", ".hraness-palette");
  assert.notEqual(oldMinimal, minimal, "The negative control did not remove forced-selector specificity.");
  await writeFile(join(work, "compiler-old.css"), oldMinimal);
  await writeFile(join(work, "compiler-old.html"), html(["compiler-old.css", "palette-union.css", "palette-layout.css"]));
  const server = Bun.serve({
    hostname: "127.0.0.1", port: 0,
    async fetch(request) {
      const pathname = new URL(request.url).pathname;
      if (pathname === "/favicon.ico") return new Response(null, { status: 204 });
      const nativeAsset = plainAssets.get(pathname);
      if (nativeAsset !== undefined) return new Response(new Uint8Array(nativeAsset.body), { headers: { "content-type": nativeAsset.contentType } });
      if (pathname.startsWith("/fonts/")) {
        const fontRoot = join(repository, "src/fonts");
        const font = resolve(fontRoot, decodeURIComponent(pathname.slice("/fonts/".length)));
        const logical = relative(fontRoot, font);
        if (isAbsolute(logical) || logical.startsWith("..") || !font.endsWith(".woff2")) return new Response("Not found", { status: 404 });
        const file = Bun.file(font);
        return await file.exists() ? new Response(file, { headers: { "content-type": "font/woff2" } }) : new Response("Not found", { status: 404 });
      }
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
      const staticContext = await browser.newContext({ javaScriptEnabled: false });
      const staticPage = await isolatedPage(staticContext);
      for (const palette of designPalettes) for (const systemMode of ["light", "dark"] as const) {
        await staticPage.emulateMedia({ colorScheme: systemMode });
        for (const preference of ["system", "light", "dark"] as const) {
          await staticPage.goto(`${origin}/raw-${palette}-${preference}.html`);
          const expected = paletteColors[palette][preference === "system" ? systemMode : preference];
          const colors = await staticPage.evaluate(() => ({ background: getComputedStyle(document.body).backgroundColor, foreground: getComputedStyle(document.body).color }));
          assert.deepEqual(colors, { background: rgb(expected.background), foreground: rgb(expected.foreground) }, `${palette}/${preference}/${systemMode}: static palette`);
          for (const [selector, islandPalette, islandMode] of [
            ["[data-raw-island]", "tokyo-night", "dark"],
            ["[data-raw-system-island]", "rose-pine", systemMode],
          ] as const) {
            const islandExpected = paletteColors[islandPalette][islandMode];
            const island = await staticPage.locator(selector).evaluate((element) => {
              const css = getComputedStyle(element);
              return { background: css.backgroundColor, foreground: css.color, colorScheme: css.colorScheme };
            });
            assert.deepEqual(island, { background: rgb(islandExpected.background), foreground: rgb(islandExpected.foreground), colorScheme: selector === "[data-raw-system-island]" ? "light dark" : islandMode }, `${palette}/${preference}/${systemMode}: ${selector} owns its palette before JavaScript`);
          }
        }
      }
      await staticPage.emulateMedia({ forcedColors: "active" });
      await staticPage.goto(`${origin}/raw-gruvbox-system.html`);
      for (const selector of ["[data-raw-island]", "[data-raw-system-island]"]) {
        assert.deepEqual(await staticPage.locator(selector).evaluate((element) => {
          const css = getComputedStyle(element);
          return ["background", "foreground", "primary", "focus"].map((role) => css.getPropertyValue(`--hraness-palette-${role}`).trim());
        }), ["Canvas", "CanvasText", "Highlight", "Highlight"], `${selector}: classless nested palette must preserve forced-color semantic roles`);
      }
      await staticContext.close();
      const plainContext = await browser.newContext({ javaScriptEnabled: false });
      const plainPage = await isolatedPage(plainContext);
      for (const route of plainRoutes) {
        for (const palette of designPalettes) for (const systemMode of ["light", "dark"] as const) {
          await plainPage.emulateMedia({ colorScheme: systemMode, forcedColors: "none" });
          for (const preference of ["system", "light", "dark"] as const) {
            await plainPage.goto(`${origin}/plain-${route}-${palette}-${preference}.html`);
            await assertPlainPalette(plainPage, palette, preference === "system" ? systemMode : preference, systemMode);
          }
        }
        await plainPage.emulateMedia({ colorScheme: "dark", forcedColors: "active" });
        for (const palette of designPalettes) for (const preference of ["dark", "system"] as const) {
          await plainPage.goto(`${origin}/plain-${route}-${palette}-${preference}.html`);
          await assertForcedPlainPalette(plainPage);
        }
        console.log(`Plain palette checks passed: ${route}, all five palettes, body/nested boundaries, explicit/system light/dark and forced colors.`);
      }
      await plainPage.emulateMedia({ colorScheme: "dark", forcedColors: "none" });
      for (const palette of designPalettes) for (const preference of ["dark", "system"] as const) {
        await plainPage.goto(`${origin}/plain-islands-${palette}-${preference}.html`);
        await assertPlainPalette(plainPage, palette, "dark", "dark", true);
      }
      for (const preference of ["dark", "system"] as const) {
        await plainPage.goto(`${origin}/plain-old-${preference}.html`);
        await assert.rejects(assertPlainPalette(plainPage, "tokyo-night", "dark", "dark"), /plain-site palette paint and semantic aliases/u,
          `The original plain-site bridge must fail in ${preference} dark mode.`);
        assert.equal(await plainPage.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor), "rgb(21, 21, 21)", "The negative control must reproduce the reported neutral dark paint.");
      }
      await plainPage.goto(`${origin}/plain-old-nested.html`);
      await assert.rejects(assertPlainPalette(plainPage, "catppuccin", "light", "dark"), /\[data-plain-nested\]: plain-site palette paint and semantic aliases/u,
        "The original compiler island bridge must fail the nested palette assertion.");
      assert.equal(await plainPage.locator("[data-plain-nested]").evaluate((element) => getComputedStyle(element).backgroundColor), "rgb(251, 246, 242)", "The negative control must reproduce the legacy compiler island paint.");
      await plainContext.close();
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
      await page.locator('input[value="tokyo-night"]').check();
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

      for (const pointer of ["mouse", "touch"] as const) {
        const gestureContext = await browser.newContext({ viewport: { width: 320, height: 844 }, colorScheme: "light", hasTouch: pointer === "touch", isMobile: pointer === "touch" });
        const gesturePage = await isolatedPage(gestureContext);
        await ready(gesturePage, `${origin}/?focusable-ancestor`);
        const menu = gesturePage.locator("details.hraness-design-palette-menu");
        const summary = menu.locator("summary");
        await summary.focus();
        await gesturePage.keyboard.press("Enter");
        for (const value of ["gruvbox", "light"]) {
          const labelText = menu.locator(`input[value="${value}"] + span`);
          if (pointer === "touch") await labelText.tap();
          else await labelText.click();
          assert.equal(await menu.evaluate((element) => (element as HTMLDetailsElement).open), true, `${pointer}: native label activation must not dismiss its menu`);
          assert.equal(await menu.locator(`input[value="${value}"]`).isChecked(), true);
        }
        await assertPalette(gesturePage, "gruvbox", "light");
        await gesturePage.keyboard.press("Tab");
        assert.equal(await gesturePage.locator("#outside").evaluate((element) => element === document.activeElement), true);
        assert.equal(await menu.getAttribute("open"), null, "Tab outside must still dismiss the menu");
        await openMenu(gesturePage);
        await gesturePage.locator("#outside").click();
        assert.equal(await menu.getAttribute("open"), null, "An outside pointer must still dismiss the menu");
        await openMenu(gesturePage);
        await gesturePage.keyboard.press("Escape");
        assert.equal(await summary.evaluate((element) => element === document.activeElement), true);
        assert.equal(await menu.getAttribute("open"), null);
        await gesturePage.reload({ waitUntil: "networkidle" });
        await assertPalette(gesturePage, "gruvbox", "light");
        await gestureContext.close();
      }

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
      const forcedContext = await browser.newContext({ colorScheme: "dark", forcedColors: "active" });
      const forcedPage = await isolatedPage(forcedContext);
      for (const route of forcedRoutes) {
        await ready(forcedPage, `${origin}/${route}.html`);
        for (const palette of designPalettes) {
          for (const mode of ["light", "dark"] as const) {
            await openMenu(forcedPage);
            await forcedPage.locator(`input[value="${palette}"]`).check();
            await forcedPage.locator(`input[value="${mode}"]`).check();
            await paletteSettled(forcedPage, palette, mode);
            await assertForcedPalette(forcedPage);
          }
        }
      }
      await ready(forcedPage, `${origin}/compiler-old.html`);
      await assert.rejects(assertForcedPalette(forcedPage), /compiled theme overrode forced semantic values/u,
        "The original compiled cascade must fail the same forced-color assertion.");
      await forcedContext.close();
      assert.deepEqual(errors, [], "Browser errors occurred.");
      console.log(`Palette browser checks passed: ${String(designPalettes.length * 2)} variants, first paint, persistence, cross-tab/system changes, denied/malformed storage, native menu, portals, strict CSP, and forced colors across standalone and compiled foundations; 100 plain-site palette cases plus 30 forced-color cases and original-cascade negative controls for document, island and forced-color boundaries.`);
    } finally { await browser.close(); }
  } finally { await server.stop(true); }
} finally { await rm(work, { recursive: true, force: true }); }

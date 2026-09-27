// Retirement proof for hero backdrops, the hero light controller, and material
// patterns. Every delivery route must paint a flat hero with no decorative
// layer, no pointer-driven light, and no texture, whatever legacy markup or
// deprecated props a consumer still passes.
import assert from "node:assert/strict";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readStylexPackageManifest, serializeStylexRuleUnionV1 } from "@hraness/ui/stylex-build";
import { browserStylesheetHasComponentPriorityRules, bundleBrowserStylesheet } from "./browser-stylesheet.js";

const repository = resolve(import.meta.dir, "..");
const work = await mkdtemp(join(tmpdir(), "hraness-hero-retired-"));
async function executable(): Promise<string> {
  for (const path of [process.env.CHROMIUM_EXECUTABLE_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", chromium.executablePath(), "/usr/bin/chromium"]) {
    if (path === undefined) continue;
    try { await access(path); return path; } catch { /* Next installed browser. */ }
  }
  throw new Error("No Chromium executable available");
}
try {
  const api = await import(join(repository, "dist/react/server.js"));
  const { HeroBackdrop } = await import(join(repository, "dist/react/hero-backdrop.js"));
  const [standalone, raw, foundation, preset, designManifest, uiManifest] = await Promise.all([
    bundleBrowserStylesheet(join(repository, "src/styles.css"), repository),
    bundleBrowserStylesheet(join(repository, "gallery/product-marketing-static.css"), repository),
    bundleBrowserStylesheet(join(repository, "src/compiler-foundation.css"), repository),
    bundleBrowserStylesheet(join(repository, "src/product-marketing-preset.css"), repository),
    readStylexPackageManifest(join(repository, "dist/stylex-manifest.json"), repository),
    readStylexPackageManifest(join(repository, "node_modules/@hraness/ui/dist/stylex-manifest.json"), join(repository, "node_modules/@hraness/ui")),
  ]);
  assert(!browserStylesheetHasComponentPriorityRules(raw, ["hraness-ui", "hraness-design-kit"]), "Raw hero fixture imported compiled atoms");
  assert(!browserStylesheetHasComponentPriorityRules(foundation, ["hraness-ui", "hraness-design-kit"]), "Compiler foundation imported standalone atoms");
  const compiler = foundation + "\n" + serializeStylexRuleUnionV1(
    [...uiManifest.rules, ...designManifest.rules],
    [uiManifest.standaloneSerializer, designManifest.standaloneSerializer],
  );
  const artwork = createElement("span", { className: "artwork", "data-hraness-hero-item": "" });
  assert.equal(renderToStaticMarkup(createElement(HeroBackdrop, { seed: "retired" }, artwork)), "", "HeroBackdrop must render nothing");
  const hero = renderToStaticMarkup(createElement(api.ProductHero, {
    headingId: "hero-title", heading: "A calmer place to think", name: "Wordcell", eyebrow: "Your working library",
    summary: "A legible hero on the flat palette background.", actions: [{ href: "#after", label: "Explore the library" }],
    backdrop: artwork,
  }));
  assert(!/data-hraness-hero-backdrop|data-hraness-hero-item|class="artwork"/u.test(hero), "ProductHero must drop deprecated backdrop artwork");
  // Hand-authored pages may still ship the old raw hooks; they must not paint.
  const legacy = `<header class="hraness-marketing-hero" aria-labelledby="legacy-title"><div class="hraness-marketing-hero-backdrop" data-hraness-hero-backdrop="" aria-hidden="true"><div class="hraness-marketing-hero-backdrop__atmosphere" data-variation="east"></div><span class="hraness-marketing-hero-backdrop__light"></span><span class="artwork" data-hraness-hero-item=""></span></div><h2 id="legacy-title">Legacy hero markup</h2></header>`;
  const patterns = ["cells", "weave", "contour", "mesh", "none"] as const;
  const fields = patterns.map((pattern) => `<div class="hraness-marketing-field" data-hraness-marketing="field" data-hraness-pattern="${pattern}" data-pattern-sample="${pattern}"><p>${pattern}</p></div>`).join("");
  const walls = patterns.map((pattern) => `<div class="hraness-material-wall" data-hraness-material="lantern" data-hraness-pattern="${pattern}" data-wall-sample="${pattern}"><p>${pattern}</p></div>`).join("");
  const body = `<main data-hraness-marketing-preset="editorial">${hero}${legacy}${fields}</main>${walls}<a id="after" href="#hero-title">Back to the hero</a>`;
  const stylesheets = { raw, standalone, compiler } as const;
  const entry = join(work, "interaction.ts");
  await writeFile(entry, `import { attachHeroLight } from ${JSON.stringify(join(repository, "dist/browser/index.js"))};
    const frames = window.requestAnimationFrame.bind(window); let requested = 0;
    window.requestAnimationFrame = (callback) => { requested += 1; return frames(callback); };
    const disposers = [...document.querySelectorAll('.hraness-marketing-hero')].map((root) => attachHeroLight(root));
    for (const root of document.querySelectorAll('.hraness-marketing-hero')) for (const [x, y] of [[40, 40], [900, 200], [300, 500]]) root.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, pointerType: 'mouse', bubbles: true }));
    for (const dispose of disposers) { dispose(); dispose(); }
    document.documentElement.dataset.frames = String(requested);
    document.documentElement.dataset.ready = 'true';`);
  const build = await Bun.build({ entrypoints: [entry], outdir: work, target: "browser", format: "esm", minify: true });
  assert.equal(build.success, true, build.logs.map(String).join("\n"));
  const html = (delivery: keyof typeof stylesheets) => `<!doctype html><html lang="en" data-palette="gruvbox"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Retired hero</title><link rel="stylesheet" href="/${delivery}.css"></head><body>${body}<script type="module" src="/interaction.js"></script></body></html>`;
  const css = (delivery: keyof typeof stylesheets) => `@layer base, components;\n${stylesheets[delivery]}\n${preset}\nbody { margin:0; background:var(--background); color:var(--foreground); }\n.artwork { position:absolute; inset:10%; background:red; }`;
  const server = Bun.serve({ hostname: "127.0.0.1", port: 0, async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === "/favicon.ico") return new Response(null, { status: 204 });
    if (path.startsWith("/fonts/")) return new Response(Bun.file(join(repository, "src", path)), { headers: { "content-type": "font/woff2" } });
    if (path === "/interaction.js") return new Response(Bun.file(join(work, "interaction.js")), { headers: { "content-type": "text/javascript" } });
    const delivery = path.slice(1).replace(/\.css$/u, "");
    if (delivery === "raw" || delivery === "standalone" || delivery === "compiler") {
      return path.endsWith(".css")
        ? new Response(css(delivery), { headers: { "content-type": "text/css" } })
        : new Response(html(delivery), { headers: { "content-type": "text/html", "content-security-policy": "default-src 'none'; script-src 'self'; style-src 'self'; style-src-attr 'none'; font-src 'self'; img-src 'self' data:; base-uri 'none'" } });
    }
    return new Response("Not found", { status: 404 });
  } });
  try {
    const browser = await chromium.launch({ executablePath: await executable(), headless: true });
    try {
      let cases = 0;
      for (const delivery of ["raw", "standalone", "compiler"] as const) {
        for (const width of [390, 1280]) {
          const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width === 390 });
          const errors: string[] = [];
          try {
            const page = await context.newPage();
            page.on("pageerror", (error) => errors.push(error.message));
            page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
            await page.goto(`http://127.0.0.1:${server.port}/${delivery}`, { waitUntil: "networkidle" });
            await page.waitForFunction(() => document.documentElement.dataset.ready === "true");
            const observed = await page.evaluate(() => {
              const paint = (node: Element) => { const style = getComputedStyle(node); return { image: style.backgroundImage, filter: style.backdropFilter }; };
              return {
                frames: document.documentElement.dataset.frames,
                heroStyles: [...document.querySelectorAll(".hraness-marketing-hero")].map((node) => node.getAttribute("style")),
                itemStyles: [...document.querySelectorAll("[data-hraness-hero-item]")].map((node) => node.getAttribute("style")),
                heroes: [...document.querySelectorAll(".hraness-marketing-hero")].map(paint),
                legacyBackdrop: [...document.querySelectorAll(".hraness-marketing-hero-backdrop")].map((node) => ({ display: getComputedStyle(node).display, box: node.getBoundingClientRect().height })),
                fields: [...document.querySelectorAll("[data-pattern-sample]")].map(paint),
                walls: [...document.querySelectorAll("[data-wall-sample]")].map(paint),
                width: innerWidth, documentWidth: document.documentElement.scrollWidth,
              };
            });
            const label = `${delivery}/${String(width)}`;
            assert.equal(observed.frames, "0", `${label}: the retired controller must schedule no frames`);
            assert(observed.heroStyles.every((value) => value === null), `${label}: the retired controller must write no hero styles`);
            assert(observed.itemStyles.every((value) => value === null), `${label}: no proximity input may be written`);
            assert.equal(observed.heroes.length, 2, `${label}: React and legacy heroes`);
            for (const paint of observed.heroes) assert.deepEqual(paint, { image: "none", filter: "none" }, `${label}: flat hero paint`);
            assert.deepEqual(observed.legacyBackdrop, [{ display: "none", box: 0 }], `${label}: legacy backdrop hooks must not paint`);
            assert.equal(observed.fields.length, 5, `${label}: every pattern field sample`);
            for (const paint of observed.fields) assert.deepEqual(paint, { image: "none", filter: "none" }, `${label}: retired field pattern`);
            if (delivery !== "raw") for (const paint of observed.walls) assert.deepEqual(paint, { image: "none", filter: "none" }, `${label}: retired material wall pattern`);
            assert(observed.documentWidth <= observed.width, `${label}: horizontal overflow`);
            const action = page.getByRole("link", { name: "Explore the library" });
            await action.focus();
            assert(await action.evaluate((node) => document.activeElement === node), `${label}: meaningful action keeps focus`);
            cases += 1;
          } finally {
            await context.close();
            assert.deepEqual(errors, [], `${delivery}/${String(width)}: browser errors`);
          }
        }
      }
      assert.equal(cases, 6, "All delivery routes and widths must run");
      console.log("Retired hero checks passed: raw, standalone, and compiler delivery at phone and desktop widths paint flat heroes, hide legacy backdrop hooks, retire every pattern, and the hero light controller stays inert.");
    } finally { await browser.close(); }
  } finally { await server.stop(true); }
} finally { await rm(work, { recursive: true, force: true }); }

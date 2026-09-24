import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readStylexPackageManifest, serializeStylexRuleUnionV1 } from "@hraness/ui/stylex-build";
import { browserStylesheetHasComponentPriorityRules, bundleBrowserStylesheet } from "./browser-stylesheet.js";

const repository = resolve(import.meta.dir, "..");
const work = await mkdtemp(join(tmpdir(), "hraness-hero-light-"));
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
  const [standalone, raw, foundation, siblingAtoms, designManifest, uiManifest] = await Promise.all([
    bundleBrowserStylesheet(join(repository, "src/styles.css"), repository),
    bundleBrowserStylesheet(join(repository, "gallery/product-marketing-static.css"), repository),
    bundleBrowserStylesheet(join(repository, "src/compiler-foundation.css"), repository),
    readFile(new URL(import.meta.resolve("@hraness/ui/stylex.css")), "utf8"),
    readStylexPackageManifest(join(repository, "dist/stylex-manifest.json"), repository),
    readStylexPackageManifest(join(repository, "node_modules/@hraness/ui/dist/stylex-manifest.json"), join(repository, "node_modules/@hraness/ui")),
  ]);
  assert(!browserStylesheetHasComponentPriorityRules(raw, ["hraness-ui", "hraness-design-kit"]), "Raw hero fixture imported compiled atoms");
  assert(!browserStylesheetHasComponentPriorityRules(foundation, ["hraness-ui", "hraness-design-kit"]), "Compiler foundation imported standalone atoms");
  const compiler = foundation + "\n" + serializeStylexRuleUnionV1(
    [...uiManifest.rules, ...designManifest.rules],
    [uiManifest.standaloneSerializer, designManifest.standaloneSerializer],
  );
  // Like the FoilMark regression, use a real installed sibling declaration,
  // without depending on its generated name or adding a footer dependency.
  const opacityAtom = siblingAtoms.match(/\.([A-Za-z0-9_-]+)\s*\{\s*opacity:\s*1;?\s*\}/u);
  assert(opacityAtom?.[1], "The sibling fixture must contain its emitted opacity:1 atom");
  const siblingOpacity = `@layer components.hero-opacity-regression-sibling.priority4{${opacityAtom[0]}}`;
  const paintMarkup = renderToStaticMarkup(createElement("main", null,
    createElement(api.ProductHero, { headingId: "paint-title", heading: "Meaningful content stays visible", summary: "The default hero decoration respects native display preferences.", actions: [{ href: "#paint-after", label: "Continue reading" }] }),
    createElement("section", { className: "hraness-marketing-paint-direct", "aria-label": "Direct backdrop" }, createElement(HeroBackdrop, { seed: "paint-regression" })),
    createElement("a", { id: "paint-after", href: "#paint-title" }, "Return to the heading"),
  ));
  const rawPaintMarkup = paintMarkup.replace(/class="([^"]*)"/gu, (_match, value: string) =>
    `class="${value.split(/\s+/u).filter((token) => token.startsWith("hraness-marketing-")).join(" ")}"`);
  assert.notEqual(rawPaintMarkup, paintMarkup, "Raw hero fixture must remove generated atoms");
  // This old-recipe canary must fail to hide beneath a later generic atom.
  // It proves both layer orders are meaningful even after the real component
  // stops sharing its ordinary opacity declaration with unrelated packages.
  const oldRecipeControl = `@layer components.hero-opacity-regression-control.priority4 {
    .hero-opacity-old-recipe { opacity:1; }
    @media (forced-colors:active), (prefers-reduced-transparency:reduce) {
      .hero-opacity-old-recipe.hero-opacity-old-recipe { opacity:0; }
    }
  }`;
  const paintStyles = { raw, standalone, compiler };
  const paintDocuments = new Map<string, { html: string; css: string }>();
  for (const delivery of ["raw", "standalone", "compiler"] as const) {
    for (const order of ["before", "after"] as const) {
      const path = `/paint/${delivery}-${order}`;
      const css = `@layer base, components;\n${order === "before" ? siblingOpacity : ""}\n${paintStyles[delivery]}\n${oldRecipeControl}\n${order === "after" ? siblingOpacity : ""}\n
        body { margin:0; background:var(--background); color:var(--foreground); }
        .hraness-marketing-paint-direct { position:relative; isolation:isolate; min-block-size:10rem; }`;
      const html = `<!doctype html><html lang="en" data-palette="gruvbox"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hero paint</title><link rel="stylesheet" href="${path}.css"></head><body>${delivery === "raw" ? rawPaintMarkup : paintMarkup}<div aria-hidden="true" class="hero-opacity-old-recipe ${opacityAtom[1]}"></div></body></html>`;
      paintDocuments.set(path, { html, css });
    }
  }
  const markup = renderToStaticMarkup(createElement(api.ProductHero, {
    headingId: "hero-title", heading: "A calmer place to think", name: "Wordcell", eyebrow: "Your working library",
    summary: "A legible hero, quiet depth, and a light that follows your attention.",
    actions: [{ href: "#after", label: "Explore the library" }],
    backdrop: createElement("span", { className: "artwork", "data-hraness-hero-item": "" }),
  }));
  const entry = join(work, "interaction.ts");
  await writeFile(entry, `import { attachHeroLight } from ${JSON.stringify(join(repository, "dist/browser/index.js"))};
    const root = document.querySelector('.hraness-marketing-hero');
    const dispose = attachHeroLight(root);
    document.addEventListener('dispose-hero', dispose, {once: true});
    document.documentElement.dataset.ready = 'true';`);
  const build = await Bun.build({ entrypoints: [entry], outdir: work, target: "browser", format: "esm", minify: true });
  assert.equal(build.success, true, build.logs.map(String).join("\n"));
  await writeFile(join(work, "style.css"), standalone + `
    body { margin:0; background:var(--background); color:var(--foreground); }
    .hraness-marketing-hero { min-block-size:32rem; }
    .artwork { position:absolute; inset:10% 10% 10% 60%; border-radius:2rem; background:var(--primary-soft); }
    #after { margin:1rem; min-block-size:60rem; }`);
  const html = `<!doctype html><html lang="en" data-palette="gruvbox"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hero light</title><link rel="stylesheet" href="/style.css"></head><body><main data-hraness-marketing-preset="editorial" data-hraness-pattern="weave">${markup}</main><a id="after" href="#hero-title">Back to the hero</a><script type="module" src="/interaction.js"></script></body></html>`;
  const server = Bun.serve({ hostname: "127.0.0.1", port: 0, async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === "/favicon.ico") return new Response(null, { status: 204 });
    // Bundled fonts are not needed for the interaction contract.
    if (path.startsWith("/fonts/")) return new Response(Bun.file(join(repository, "src", path)));
    const paintDocument = paintDocuments.get(path.endsWith(".css") ? path.slice(0, -4) : path);
    if (paintDocument) return new Response(path.endsWith(".css") ? paintDocument.css : paintDocument.html, { headers: {
      "content-type": path.endsWith(".css") ? "text/css" : "text/html",
      "content-security-policy": "default-src 'none'; style-src 'self'; style-src-attr 'none'; font-src 'self'; img-src 'self' data:; base-uri 'none'",
    } });
    if (path === "/") return new Response(html, { headers: { "content-type": "text/html", "content-security-policy": "default-src 'none'; script-src 'self'; style-src 'self'; style-src-attr 'none'; font-src 'self'; img-src 'self' data:; base-uri 'none'" } });
    if (path === "/style.css" || path === "/interaction.js") return new Response(Bun.file(join(work, path.slice(1))));
    return new Response("Not found", { status: 404 });
  } });
  try {
    const browser = await chromium.launch({ executablePath: await executable(), headless: true });
    try {
      let paintCases = 0;
      for (const delivery of ["raw", "standalone", "compiler"] as const) {
        for (const order of ["before", "after"] as const) {
          const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
          const errors: string[] = [];
          try {
            const page = await context.newPage();
            page.on("pageerror", (error) => errors.push(error.message));
            const session = await context.newCDPSession(page);
            await page.goto(`http://127.0.0.1:${server.port}/paint/${delivery}-${order}`, { waitUntil: "networkidle" });
            await page.waitForFunction(() => document.fonts.status === "loaded", undefined, { timeout: 15_000 });
            let ordinaryBounds: { heading: number[]; action: number[] } | undefined;
            for (const mode of ["ordinary", "reduced-transparency", "forced"] as const) {
              // Explicit native preferences avoid inheriting the host's
              // reduced-transparency setting in the ordinary baseline.
              await session.send("Emulation.setEmulatedMedia", { features: [
                { name: "prefers-reduced-transparency", value: mode === "reduced-transparency" ? "reduce" : "no-preference" },
                { name: "forced-colors", value: mode === "forced" ? "active" : "none" },
              ] });
              const observed = await page.evaluate(() => {
                const oldRecipe = document.querySelector(".hero-opacity-old-recipe");
                if (!oldRecipe) throw new Error("Missing old-opacity collision control");
                const bounds = (selector: string) => {
                  const node = document.querySelector(selector);
                  if (!node) throw new Error(`Missing meaningful hero content: ${selector}`);
                  const box = node.getBoundingClientRect();
                  return [box.x + scrollX, box.y + scrollY, box.width, box.height];
                };
                return {
                reduced: matchMedia("(prefers-reduced-transparency: reduce)").matches,
                forced: matchMedia("(forced-colors: active)").matches,
                backdrops: [...document.querySelectorAll<HTMLElement>("[data-hraness-hero-backdrop]")].map((node) => ({
                  opacity: getComputedStyle(node).opacity, pointerEvents: getComputedStyle(node).pointerEvents,
                  hidden: node.getAttribute("aria-hidden"), inert: node.hasAttribute("inert"),
                  position: getComputedStyle(node).position, focusables: node.querySelectorAll("a,button,input,select,textarea,[tabindex]").length,
                })),
                oldRecipe: getComputedStyle(oldRecipe).opacity,
                width: innerWidth, documentWidth: document.documentElement.scrollWidth,
                contentBounds: { heading: bounds("#paint-title"), action: bounds('a[href="#paint-after"]') },
                };
              });
              const label = `${delivery}/${order}/${mode}`;
              assert.equal(observed.reduced, mode === "reduced-transparency", `${label}: native transparency preference`);
              assert.equal(observed.forced, mode === "forced", `${label}: native forced-colors preference`);
              assert.equal(observed.backdrops.length, 2, `${label}: direct and default ProductHero backdrops`);
              for (const backdrop of observed.backdrops) assert.deepEqual(backdrop, {
                opacity: mode === "ordinary" ? "1" : "0", pointerEvents: "none", hidden: "true", inert: true, position: "absolute", focusables: 0,
              }, `${label}: removable decoration`);
              assert.equal(observed.oldRecipe, mode === "ordinary" || order === "after" ? "1" : "0", `${label}: old generic-opacity negative control`);
              assert.equal(observed.width, 390, `${label}: requested viewport`);
              assert(observed.documentWidth <= observed.width, `${label}: horizontal overflow`);
              if (mode === "ordinary") ordinaryBounds = observed.contentBounds;
              else assert.deepEqual(observed.contentBounds, ordinaryBounds, `${label}: hiding decoration must preserve heading and action geometry`);
              const action = page.getByRole("link", { name: "Continue reading" });
              assert(await action.isVisible(), `${label}: meaningful action stays visible`);
              await action.focus();
              assert(await action.evaluate((node) => document.activeElement === node), `${label}: meaningful action keeps focus`);
              paintCases += 1;
            }
          } finally {
            await context.close();
            assert.deepEqual(errors, [], `${delivery}/${order}: browser errors`);
          }
        }
      }
      assert.equal(paintCases, 18, "All delivery, sibling-order and native paint modes must run");
      for (const mode of ["ordinary", "reduced", "touch", "forced", "no-js"] as const) {
        const context = await browser.newContext({ viewport: { width: mode === "touch" ? 390 : 1280, height: 900 }, hasTouch: mode === "touch", javaScriptEnabled: mode !== "no-js", reducedMotion: mode === "reduced" ? "reduce" : "no-preference", forcedColors: mode === "forced" ? "active" : "none" });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`http://127.0.0.1:${server.port}`, { waitUntil: "networkidle" });
        if (mode !== "no-js") await page.waitForFunction(() => document.documentElement.dataset.ready === "true");
        const hero = page.locator('.hraness-marketing-hero');
        const read = () => hero.evaluate((element) => element.style.getPropertyValue('--hraness-hero-light-x'));
        const action = page.getByRole('link', { name: 'Explore the library' });
        const before = await action.boundingBox();
        await hero.dispatchEvent('pointermove', { clientX: 1100, clientY: 180, pointerType: 'mouse' });
        if (mode === "ordinary") {
          await page.waitForFunction(() => Number.parseFloat(document.querySelector<HTMLElement>('.hraness-marketing-hero')?.style.getPropertyValue('--hraness-hero-light-x') ?? '') > 70);
          assert.deepEqual(await action.boundingBox(), before, "Decoration moved meaningful content");
          await page.emulateMedia({ reducedMotion: "reduce" });
          await page.waitForFunction(() => document.querySelector<HTMLElement>('.hraness-marketing-hero')?.style.getPropertyValue('--hraness-hero-light-x') === '');
          await page.emulateMedia({ reducedMotion: "no-preference" });
          await page.evaluate(() => document.dispatchEvent(new Event('dispose-hero')));
          await hero.dispatchEvent('pointermove', { clientX: 1100, clientY: 180, pointerType: 'mouse' });
        }
        assert.equal(await read(), '', `${mode}: inactive controller must restore CSS`);
        await action.focus();
        assert.equal(await action.evaluate((element) => element === document.activeElement), true);
        assert.equal(await page.locator('[data-hraness-hero-backdrop]').getAttribute('aria-hidden'), 'true');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${mode}: horizontal overflow`);
        assert.deepEqual(errors, [], `${mode}: browser errors`);
        await context.close();
      }
      console.log("Hero light browser checks passed: 18 raw/standalone/compiler backdrop cases with both sibling atom orders, native transparency/forced colors and collision controls; stationary content, live reduced-motion changes, coarse input, forced colors, no-JS content, keyboard access and disposal.");
    } finally { await browser.close(); }
  } finally { await server.stop(true); }
} finally { await rm(work, { recursive: true, force: true }); }

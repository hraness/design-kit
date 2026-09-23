import assert from "node:assert/strict";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { bundleBrowserStylesheet } from "./browser-stylesheet.js";

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
  await writeFile(join(work, "style.css"), await bundleBrowserStylesheet(join(repository, "src/styles.css"), repository) + `
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
    if (path === "/") return new Response(html, { headers: { "content-type": "text/html", "content-security-policy": "default-src 'none'; script-src 'self'; style-src 'self'; style-src-attr 'none'; font-src 'self'; img-src 'self' data:; base-uri 'none'" } });
    if (path === "/style.css" || path === "/interaction.js") return new Response(Bun.file(join(work, path.slice(1))));
    return new Response("Not found", { status: 404 });
  } });
  try {
    const browser = await chromium.launch({ executablePath: await executable(), headless: true });
    try {
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
      console.log("Hero light browser checks passed: stationary content, live reduced-motion changes, coarse input, forced colors, no-JS content, keyboard access and disposal.");
    } finally { await browser.close(); }
  } finally { await server.stop(true); }
} finally { await rm(work, { recursive: true, force: true }); }

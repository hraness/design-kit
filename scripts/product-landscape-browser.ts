import { provisionedBrowserExecutable, verificationBrowserLaunchOptions } from "./browser-executable.js";
// Browser proof for the product landscape. The complete, compiler-foundation,
// and standalone stylesheets are each checked for a page host that tiles the
// mask down the whole document, the narrow image, the off switch, an
// unconfigured host that paints nothing, a contained host, clear page
// wrappers, frosted cards with opaque fallbacks, solid rounded reading
// surfaces, print, and forced colors.
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { chromium, type Page } from "playwright-core";

import { bundleBrowserStylesheet } from "./browser-stylesheet.js";

const repository = resolve(import.meta.dir, "..");
const [standalone, foundation] = await Promise.all([
  bundleBrowserStylesheet(join(repository, "src/styles.css"), repository),
  bundleBrowserStylesheet(join(repository, "src/compiler-foundation.css"), repository),
]);
const grammarOnly = await Bun.file(join(repository, "src/product-landscape.css")).text();
assert(!/@import|url\(/u.test(grammarOnly), "product-landscape.css must stay self-contained");

const svg = (fill: string) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='400'%3E%3Crect width='100' height='400' fill='black'/%3E%3Crect width='100' height='30' fill='${fill}'/%3E%3C/svg%3E")`;
const wide = svg("white");
const narrow = svg("%23999999");
const images = `:root { --hraness-landscape-image: ${wide}; --hraness-landscape-image-narrow: ${narrow}; }`;
const marketing = `<main class="hraness-marketing-page" data-hraness-landscape="page" style="min-height: 3200px">
  <article class="hraness-marketing-card" id="card">Card</article>
  <section data-hraness-landscape-surface="solid" id="solid">Solid</section>
</main>`;
const publication = `<main class="plain-site plain-publication" data-hraness-landscape="page"><div class="plain-publication__article-body"><pre id="code">bun run check</pre></div>
  <aside class="plain-publication__callout" id="callout">Note</aside></main>`;

type Options = Readonly<{
  body?: string;
  css: string;
  forcedColors?: "active" | "none";
  head?: string;
  html?: string;
  media?: "screen" | "print";
  reducedTransparency?: boolean;
  width?: number;
}>;

const browser = await chromium.launch({ executablePath: await provisionedBrowserExecutable(), ...verificationBrowserLaunchOptions() });

async function open(options: Options): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: options.width ?? 1280, height: 720 } });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setEmulatedMedia", {
    media: options.media ?? "screen",
    features: [
      { name: "forced-colors", value: options.forcedColors ?? "none" },
      { name: "prefers-reduced-transparency", value: options.reducedTransparency === true ? "reduce" : "no-preference" },
    ],
  });
  const html = `<!doctype html><html lang="en" data-palette="gruvbox" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Landscape</title><style>${options.css}
body { margin: 0; background: var(--background, Canvas); color: var(--foreground, CanvasText); }
${options.head ?? images}</style></head><body${options.body ?? ""}>${options.html ?? marketing}</body></html>`;
  await page.route("**/*", (route) => new URL(route.request().url()).pathname.startsWith("/fonts/")
    ? route.fulfill({ status: 404, body: "" })
    : route.fulfill({ contentType: "text/html", body: html }));
  await page.goto("http://landscape.test/");
  await page.evaluate(() => document.fonts.ready);
  assert.deepEqual(errors, [], "The landscape page must load without script errors");
  return page;
}

const layer = (page: Page, selector = "body") => page.locator(selector).evaluate((host) => {
  const style = getComputedStyle(host, "::before");
  const box = host.getBoundingClientRect();
  return {
    content: style.content,
    display: style.display,
    height: Number.parseFloat(style.height),
    hostHeight: box.height,
    image: style.maskImage || style.getPropertyValue("-webkit-mask-image"),
    mode: style.maskMode || style.getPropertyValue("-webkit-mask-source-type"),
    opacity: style.opacity,
    pointer: style.pointerEvents,
    position: style.position,
    repeat: style.maskRepeat || style.getPropertyValue("-webkit-mask-repeat"),
    size: style.maskSize || style.getPropertyValue("-webkit-mask-size"),
    z: style.zIndex,
  };
});
const paint = (page: Page, selector: string) => page.locator(selector).evaluate((node) => {
  const style = getComputedStyle(node);
  return { backdrop: style.backdropFilter, background: style.backgroundColor, radius: style.borderTopLeftRadius };
});
const opaque = (color: string) => /^rgb\(/u.test(color) || /^rgba\(.*,\s*1\)$/u.test(color);

try {
  for (const [name, css] of [["standalone", standalone], ["compiler", foundation], ["grammar", grammarOnly]] as const) {
    const page = await open({ css });
    const drawn = await layer(page);
    assert.equal(drawn.content, '""', `${name}: a page host draws the layer`);
    assert.equal(drawn.position, "absolute", `${name}: the layer is positioned on the body`);
    assert(Math.abs(drawn.height - drawn.hostHeight) < 1 && drawn.height >= 3200, `${name}: the layer spans the whole document (${drawn.height} of ${drawn.hostHeight})`);
    assert.equal(drawn.repeat, "repeat-y", `${name}: the mask tiles down the page`);
    assert.match(drawn.size, /^100%( auto)?$/u, `${name}: each tile spans the page width`);
    assert.match(drawn.mode, /luminance/u, `${name}: the drawing is a luminance mask`);
    assert(drawn.image.includes("fill='white'"), `${name}: the wide image is used on wide screens`);
    assert.equal(drawn.opacity, "0.5", `${name}: the default opacity applies`);
    assert.equal(drawn.pointer, "none", `${name}: the layer never takes pointer input`);
    assert.equal(drawn.z, "-1", `${name}: the layer sits behind content`);
    assert.equal((await paint(page, "main")).background, "rgba(0, 0, 0, 0)", `${name}: the marketing page wrapper lets the drawing show`);
    if (name !== "grammar") {
      const card = await paint(page, "#card");
      assert.equal(card.backdrop, "blur(14px) saturate(1.4)", `${name}: cards over the drawing are frosted`);
      assert(!opaque(card.background), `${name}: frosted cards are translucent (${card.background})`);
    }
    const solid = await paint(page, "#solid");
    assert.equal(solid.radius, "12px", `${name}: solid product surfaces are rounded`);
    assert(opaque(solid.background), `${name}: solid product surfaces stay opaque (${solid.background})`);
    const withLayer = await page.screenshot({ clip: { x: 0, y: 0, width: 200, height: 200 } });
    await page.close();

    const off = await open({ css, html: `${marketing}<span data-hraness-landscape="off"></span>` });
    assert.equal((await layer(off)).content, "none", `${name}: the off switch removes the layer`);
    const withoutLayer = await off.screenshot({ clip: { x: 0, y: 0, width: 200, height: 200 } });
    assert(!withLayer.equals(withoutLayer), `${name}: the drawing actually paints`);
    if (name === "standalone") assert.notEqual((await paint(off, "main")).background, "rgba(0, 0, 0, 0)", `${name}: without a landscape the wrapper keeps its own paint`);
    await off.close();

    const phone = await open({ css, width: 390 });
    const small = await layer(phone);
    assert(small.image.includes("fill='%23999999'") || small.image.includes("fill='#999999'"), `${name}: phones use the narrow image`);
    assert.equal(small.opacity, "0.36", `${name}: phones use the narrow opacity`);
    assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0, `${name}: the layer never scrolls the page sideways`);
    await phone.close();

    const unconfigured = await open({ css, head: "" });
    const blank = await layer(unconfigured);
    assert.notEqual(blank.image, "none", `${name}: an unconfigured host masks its ink away instead of painting a slab`);
    await unconfigured.close();

    const contained = await open({ css, html: `<p>Before</p><section data-hraness-landscape="contained" id="section" style="height: 900px">Inside</section>` });
    const scoped = await layer(contained, "#section");
    assert.equal(scoped.content, '""', `${name}: a contained host draws its own layer`);
    assert(Math.abs(scoped.height - 900) < 1, `${name}: the contained layer matches its host`);
    assert.equal((await layer(contained)).content, "none", `${name}: a contained host leaves the body alone`);
    await contained.close();

    const reading = await open({ css, html: publication, width: 1024 });
    const code = await paint(reading, "#code");
    assert.equal(code.radius, "12px", `${name}: code blocks over the drawing are rounded`);
    assert(opaque(code.background), `${name}: code blocks over the drawing are opaque (${code.background})`);
    assert.equal((await paint(reading, "main")).background, "rgba(0, 0, 0, 0)", `${name}: the publication wrapper lets the drawing show`);
    await reading.close();

    const calm = await open({ css, reducedTransparency: true });
    const steady = await paint(calm, "#card");
    assert.equal(steady.backdrop, "none", `${name}: reduced transparency removes the blur`);
    if (name !== "grammar") assert(opaque(steady.background), `${name}: reduced transparency keeps cards opaque (${steady.background})`);
    await calm.close();

    for (const mode of [{ forcedColors: "active" as const }, { media: "print" as const }]) {
      const quiet = await open({ css, ...mode });
      assert.equal((await layer(quiet)).display, "none", `${name}: ${JSON.stringify(mode)} hides the drawing`);
      await quiet.close();
    }
  }
  console.log("Product landscape browser checks passed.");
} finally {
  await browser.close();
}

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
import { provisionedBrowserExecutable, verificationBrowserLaunchOptions } from "./browser-executable.js";

const root = resolve(import.meta.dir, "..");
const entries = ["site-shell", "plain-site", "product-marketing", "product-marketing-foundation", "syntax-highlighting"];
const stylesheets = new Map<string, string>(await Promise.all(entries.map(async (entry) => [
  `/src/${entry}.css`, await readFile(resolve(root, `src/${entry}.css`), "utf8"),
] as const)));
const shell = stylesheets.get("/src/site-shell.css");
assert(shell);
stylesheets.set("/src/site-shell-fallback.css", shell.replace(/\s*min-block-size: 100[sd]vh;/gu, ""));
const cases = [
  { entry: "site-shell", className: "hraness-site-shell" },
  { entry: "site-shell-fallback", className: "hraness-site-shell" },
  { entry: "plain-site", className: "plain-site" },
  { entry: "product-marketing", className: "hraness-marketing-page" },
  { entry: "product-marketing-foundation", className: "hraness-marketing-page" },
];
const server = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch(request) {
  const url = new URL(request.url);
  const css = stylesheets.get(url.pathname);
  if (css !== undefined) return new Response(css, { headers: { "content-type": "text/css" } });
  const entry = url.searchParams.get("entry") ?? "site-shell";
  const className = url.searchParams.get("class") ?? "";
  const wrapped = url.searchParams.has("wrapped");
  const long = url.searchParams.has("long");
  const grid = url.searchParams.has("grid");
  return new Response(`<!doctype html><html><head><link rel="stylesheet" href="/src/${entry}.css"><style>
    *{box-sizing:border-box}html,body{margin:0}header,footer{padding:20px}main{padding:24px}
    .content-grid{display:grid;grid-template-columns:80px minmax(0,1fr)}main{width:100%;max-width:900px;margin-inline:auto}header,footer{background:#eee}main{background:#fff}p{margin:0}main p{min-height:${long ? "1600" : "80"}px}
  </style></head><body class="${wrapped ? "" : className}">${wrapped ? `<div class="${className}">` : ""}
  <header data-hraness-marketing>Project</header>${grid ? '<div class="content-grid hraness-site-shell__content"><aside>Docs</aside>' : ""}<main data-hraness-marketing><p>Payment complete</p></main>${grid ? "</div>" : ""}<footer data-hraness-marketing id="product">Help and contact</footer><footer data-hraness-marketing id="network">By Hraness</footer>
  ${wrapped ? "</div>" : ""}</body></html>`, { headers: { "content-type": "text/html" } });
} });
const browser = await chromium.launch({ executablePath: await provisionedBrowserExecutable(), headless: true, ...verificationBrowserLaunchOptions() });
try {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    for (const test of cases) {
      for (const long of [false, true]) {
        const query = new URLSearchParams({ entry: test.entry, class: test.className });
        if (long) query.set("long", "");
        await page.goto(`${server.url}?${query}`);
        for (const height of [1000, 720]) {
          await page.setViewportSize({ width, height });
          const geometry = await page.evaluate(() => {
            const mainElement = document.querySelector("main");
            const firstElement = document.querySelector("#product");
            const lastElement = document.querySelector("#network");
            if (!mainElement || !firstElement || !lastElement) throw new Error("Missing shell landmark");
            const main = mainElement.getBoundingClientRect();
            const first = firstElement.getBoundingClientRect();
            const last = lastElement.getBoundingClientRect();
            return { mainBottom: main.bottom, firstTop: first.top, firstBottom: first.bottom,
              bottom: last.bottom, lastTop: last.top, overflow: document.documentElement.scrollWidth > innerWidth,
              position: getComputedStyle(lastElement).position };
          });
          const label = `${test.entry} ${width}x${height} ${long ? "long" : "short"}`;
          assert(!geometry.overflow, `${label}: horizontal overflow`);
          assert(geometry.firstTop >= geometry.mainBottom - 1, `${label}: footer overlaps content`);
          assert(Math.abs(geometry.firstBottom - geometry.lastTop) <= 1, `${label}: footer rows separated`);
          assert.equal(geometry.position, "static", `${label}: footer left document flow`);
          if (long) assert(geometry.bottom > height, `${label}: long content clipped`);
          else assert(Math.abs(geometry.bottom - height) <= 1, `${label}: footer above viewport bottom`);
        }
      }
    }
    // A framework wrapper can opt in without imposing layout on the body.
    await page.goto(`${server.url}?class=hraness-site-shell&wrapped`);
    assert.equal(await page.locator("body").evaluate((element) => getComputedStyle(element).display), "block");
    const wrappedFooter = await page.locator("#network").boundingBox();
    assert(wrappedFooter);
    assert(Math.abs(wrappedFooter.y + wrappedFooter.height - 720) <= 1);
    await page.goto(`${server.url}?class=hraness-site-shell&grid`);
    const gridFooter = await page.locator("#network").boundingBox();
    assert(gridFooter);
    assert(Math.abs(gridFooter.y + gridFooter.height - 720) <= 1, "Grid content must fill available height");
    assert.equal(await page.locator(".content-grid").evaluate((element) => getComputedStyle(element).display), "grid");
    // Embedded themes and unclassified application bodies retain their layout.
    for (const className of ["", "plain-site", "hraness-marketing-page"]) {
      const entry = className === "plain-site" ? "plain-site" : className === "hraness-marketing-page" ? "product-marketing" : "site-shell";
      await page.goto(`${server.url}?entry=${entry}&class=${className}&wrapped`);
      assert.equal(await page.locator("body > div").evaluate((element) => getComputedStyle(element).display), "block");
      const embeddedFooter = await page.locator("#network").boundingBox();
      assert(embeddedFooter && embeddedFooter.y < 500);
    }
    await page.close();
  }
  console.log("Site shell: short/long pages, phone/desktop resize, paired footers, framework wrapper, nested themes, and vh fallback passed.");
} finally {
  await browser.close();
  server.stop(true);
}

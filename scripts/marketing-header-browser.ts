import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "playwright-core";
import { provisionedBrowserExecutable, verificationBrowserLaunchOptions } from "./browser-executable.js";
import { bundleBrowserStylesheet } from "./browser-stylesheet.js";
import { inspectMarketingHeader } from "../src/browser/marketing-header.js";

const root = resolve(import.meta.dir, "..");
const api = await import(resolve(root, "dist/react/index.js"));
const serverApi = await import(resolve(root, "dist/react/server.js"));
const appearance = createElement(api.ThemeMenuButton, { "aria-label": "Appearance" });
const header = createElement(serverApi.MarketingSiteHeader, {
  brand: "Relay", brandLabel: "Relay home", brandMark: "/relay.svg",
  links: [{ href: "/docs", label: "Docs" }, { href: "/blog", label: "Blog" }],
  action: { href: "/#install", label: "Install" }, trailing: appearance,
});
const article = createElement("main", null, createElement("article", null,
  createElement("header", null, createElement("h1", null, "Decisions worth keeping")),
  createElement("p", null, "One product header connects the homepage, documentation, and articles.")));
const html = renderToStaticMarkup(createElement(api.DesignPaletteProvider, null,
  createElement("div", { "data-hraness-marketing-preset": "editorial" }, header, article)));
const css = await bundleBrowserStylesheet(resolve(root, "src/styles.css"), root)
  + "\n" + await bundleBrowserStylesheet(resolve(root, "dist/stylex.css"), root)
  + "\n" + await bundleBrowserStylesheet(resolve(root, "src/product-marketing-preset.css"), root)
  + "\nbody{margin:0}main{max-width:64rem;margin:auto;padding:2rem}";
const bundle = await Bun.build({ entrypoints: [resolve(root, "dist/browser/index.js")], target: "browser", format: "esm", write: false } as unknown as Parameters<typeof Bun.build>[0]);
assert.ok(bundle.success, "Published browser entry must bundle for the fixture");
assert.equal(bundle.outputs.length, 1, "Fixture requires one self-contained browser module");
const browserOutput = bundle.outputs[0];
assert.ok(browserOutput, "Fixture bundle must expose its browser module");
const browserModule = await browserOutput.text();
const server = Bun.serve({ hostname: "127.0.0.1", port: 0, async fetch(request) {
  const url = new URL(request.url);
  if (url.pathname === "/styles.css") return new Response(css, { headers: { "content-type": "text/css" } });
  if (url.pathname === "/enhance.js") return new Response('import {syncStickyOffset} from "/dist/browser/index.js"; const scope=document.querySelector("[data-hraness-marketing-preset]");scope.style.setProperty("--hraness-sticky-offset","90px","important"); window.stopOffset=syncStickyOffset();', { headers: { "content-type": "text/javascript" } });
  if (url.pathname === "/dist/browser/index.js") return new Response(browserModule, { headers: { "content-type": "text/javascript" } });
  if (url.pathname === "/relay.svg") return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="black" d="M4 4h24v24H4z"/></svg>', { headers: { "content-type": "image/svg+xml" } });
  if (url.pathname.startsWith("/fonts/")) {
    const path = resolve(root, "src", decodeURIComponent(url.pathname.slice(1)));
    const logical = relative(resolve(root, "src/fonts"), path);
    if (logical.startsWith("..") || isAbsolute(logical) || !path.endsWith(".woff2")) return new Response("Not found", { status: 404 });
    return new Response(await readFile(path), { headers: { "content-type": "font/woff2" } });
  }
  return new Response(`<!doctype html><html lang="en" data-theme="${url.searchParams.get("theme") === "dark" ? "dark" : "light"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shared article header</title><link rel="stylesheet" href="/styles.css"></head><body>${html}<script type="module" src="/enhance.js"></script></body></html>`, { headers: { "content-type": "text/html" } });
} });
let browser;
let scenes = 0;
try {
  const executablePath = await provisionedBrowserExecutable();
  browser = await chromium.launch({ executablePath, headless: true, ...verificationBrowserLaunchOptions() });
  for (const width of [320, 390, 768, 1440]) for (const theme of ["light", "dark"] as const) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: theme });
    try {
      page.on("pageerror", error => console.error(`fixture pageerror ${width}/${theme}: ${error.message}`));
      page.on("console", message => { if (message.type() === "error") console.error(`fixture console ${width}/${theme}: ${message.text()}`); });
      await page.goto(`http://${server.hostname}:${server.port}/?theme=${theme}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => typeof (window as unknown as { stopOffset?: unknown }).stopOffset === "function", undefined, { timeout: 10000 });
      const options = { brandName: "Relay", brandLabel: "Relay home", brandMark: "/relay.svg", stickyOffset: true };
      const inspection = await page.evaluate(inspectMarketingHeader, options);
      if (inspection.problems.length > 0) console.error(await page.locator("[data-hraness-appearance-menu] summary").evaluate(element => ({ html: element.outerHTML, ancestors: [...(function*(){for(let node: Element | null = element; node; node = node.parentElement) yield node;})()].map(node => ({ tag: node.tagName, class: node.className })).slice(0, 6), width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height, minWidth: getComputedStyle(element).minInlineSize, minHeight: getComputedStyle(element).minBlockSize, compactTarget: getComputedStyle(element).getPropertyValue("--interactive-target-compact"), headerTarget: getComputedStyle(element).getPropertyValue("--hraness-marketing-header-action-height") })));
      assert.deepEqual(inspection.problems, [], `${width}/${theme}`);
      const restoration = await page.evaluate(() => {
        (window as unknown as { stopOffset: () => void }).stopOffset();
        const scope = document.querySelector<HTMLElement>("[data-hraness-marketing-preset]");
        if (scope === null) throw new Error("Missing marketing preset scope.");
        return { value: scope.style.getPropertyValue("--hraness-sticky-offset"), priority: scope.style.getPropertyPriority("--hraness-sticky-offset") };
      });
      assert.deepEqual(restoration, { value: "90px", priority: "important" }, "Sticky teardown restores authored inline state");
      assert.ok((await page.evaluate(inspectMarketingHeader, options)).problems.includes("Sticky clearance does not match the measured product header."), "Unmeasured preset counterfactual must fail");
      await page.evaluate(async () => {
        // Reinstall the published browser helper without copying its implementation.
        const modulePath = "/dist/browser/index.js";
        const api = await import(modulePath);
        (window as unknown as { stopOffset: () => void }).stopOffset = api.syncStickyOffset();
      });
      const laterWrite = await page.evaluate(async () => {
        const scope = document.querySelector<HTMLElement>("[data-hraness-marketing-preset]");
        if (scope === null) throw new Error("Missing marketing preset scope.");
        const measured = scope.style.getPropertyValue("--hraness-sticky-offset");
        scope.style.setProperty("--hraness-sticky-offset", measured, "important");
        (window as unknown as { stopOffset: () => void }).stopOffset();
        const result = { value: scope.style.getPropertyValue("--hraness-sticky-offset"), measured, priority: scope.style.getPropertyPriority("--hraness-sticky-offset") };
        const modulePath = "/dist/browser/index.js";
        const api = await import(modulePath);
        (window as unknown as { stopOffset: () => void }).stopOffset = api.syncStickyOffset();
        return result;
      });
      assert.equal(laterWrite.value, laterWrite.measured, "Sticky teardown preserves a later matching-value write");
      assert.equal(laterWrite.priority, "important", "Sticky teardown preserves a later priority write");
      const caseStyle = await page.addStyleTag({ content: ".hraness-marketing-header__brand{text-transform:lowercase!important}" });
      assert.ok((await page.evaluate(inspectMarketingHeader, options)).problems.includes("The product wordmark changes canonical casing with CSS."), "CSS casing must not override the canonical wordmark");
      await caseStyle.evaluate(element => element.parentNode?.removeChild(element));
      await page.locator(".hraness-marketing-header__brand").evaluate(element => { if (element.lastChild) element.lastChild.textContent = "relay"; });
      assert.ok((await page.evaluate(inspectMarketingHeader, options)).problems.includes("The visible product wordmark does not match its canonical display name."), "A correct aria-label must not hide a lowercase wordmark");
      await page.locator(".hraness-marketing-header__brand").evaluate(element => { if (element.lastChild) element.lastChild.textContent = "Relay"; });
      assert.deepEqual((await page.evaluate(inspectMarketingHeader, options)).problems, [], "Restoring source casing restores the canonical header");
      await page.locator(".hraness-marketing-header__brand").evaluate(element => {
        const wordmark = document.createElement("span");
        wordmark.setAttribute("aria-hidden", "true");
        wordmark.setAttribute("data-wordmark-case-control", "");
        wordmark.textContent = "Relay";
        if (!element.lastChild) throw new Error("Missing wordmark text.");
        element.lastChild.replaceWith(wordmark);
      });
      assert.deepEqual((await page.evaluate(inspectMarketingHeader, options)).problems, [], "Aria-hidden wordmarks remain visually displayed");
      const wordmark = page.locator("[data-wordmark-case-control]");
      await wordmark.evaluate(element => { element.style.textTransform = "lowercase"; });
      assert.ok((await page.evaluate(inspectMarketingHeader, options)).problems.includes("The product wordmark changes canonical casing with CSS."), "Child wordmarks cannot bypass casing checks with aria-hidden");
      await wordmark.evaluate(element => { element.style.textTransform = "none"; });
      const parentCaseStyle = await page.addStyleTag({ content: ".hraness-marketing-header__brand{text-transform:lowercase!important}" });
      assert.deepEqual((await page.evaluate(inspectMarketingHeader, options)).problems, [], "Only the effective transform on rendered text controls its casing");
      await parentCaseStyle.evaluate(element => element.parentNode?.removeChild(element));
      await wordmark.evaluate(element => { element.style.display = "none"; });
      assert.ok((await page.evaluate(inspectMarketingHeader, options)).problems.includes("The rendered product wordmark is not visible with its canonical display name."), "A hidden canonical wordmark must not pass through the accessible label");
      await wordmark.evaluate(element => { element.style.display = ""; });
      assert.deepEqual((await page.evaluate(inspectMarketingHeader, options)).problems, [], "Restoring wordmark visibility restores the canonical header");
      const hiddenStyle = await page.addStyleTag({ content: "[data-hraness-appearance-menu]{opacity:0!important}" });
      assert.ok((await page.evaluate(inspectMarketingHeader, options)).problems.includes("The product appearance trigger is not visible."), "Hidden-appearance counterfactual must fail");
      await hiddenStyle.evaluate(element => element.parentNode?.removeChild(element));
      await page.addStyleTag({ content: ".hraness-marketing-header__inner{display:block!important}" });
      assert.ok((await page.evaluate(inspectMarketingHeader, options)).problems.includes("The shared product-header layout styles are missing."), "Missing-layout counterfactual must fail");
      await page.locator('header[data-hraness-marketing="header"]').evaluate(element => element.remove());
      assert.ok((await page.evaluate(inspectMarketingHeader, options)).problems.includes("Expected one product header; found 0."), "Missing-header counterfactual must fail");
      scenes++;
    } finally { await page.close(); }
  }
  console.log(`Verified ${scenes} article-header viewport/theme scenes, authored sticky-state restoration, and ${scenes * 8} wordmark-visibility/case/missing-header/layout/appearance/clearance counterfactuals; browser ${browser.version()}; executable ${executablePath}.`);
} finally {
  await browser?.close();
  server.stop(true);
}

import { provisionedBrowserExecutable, verificationBrowserArguments } from "./browser-executable.js";
// Browser proof for `@hraness/design-kit/mockups`. Every gallery fixture is
// rendered on the server from dist, served with `mockups.css` alone, and
// checked at phone and desktop widths under a light and a dark page: no
// horizontal overflow, every frame inside its column, one labelled image per
// root, no headings, and pinned themes that ignore the page scheme. The
// client shells are hydrated from dist to check the tabs keyboard model and
// that nothing animates before the first user change.
//
// Set MOCKUPS_SCREENSHOTS=<dir> to keep a full-page screenshot per case.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MockupsFixture } from "../gallery/mockups-fixture.js";
import type * as MockupsModule from "../src/mockups/index.js";

const repository = resolve(import.meta.dir, "..");
const work = await mkdtemp(join(tmpdir(), "hraness-mockups-"));
const screenshots = process.env.MOCKUPS_SCREENSHOTS;

const executable = provisionedBrowserExecutable;

try {
  const api = (await import(join(repository, "dist/mockups/index.js"))) as typeof MockupsModule;
  const fixture = renderToStaticMarkup(createElement(MockupsFixture, { api }));
  const stylesheet = await readFile(join(repository, "src/mockups.css"), "utf8");
  assert(!/@import|url\(/u.test(stylesheet), "mockups.css must stay self-contained");

  const build = await Bun.build({ entrypoints: [join(repository, "gallery/mockups-client-main.tsx")], outdir: work, naming: "client-entry.js", target: "browser", format: "esm", minify: true, define: { "process.env.NODE_ENV": '"production"' } });
  assert.equal(build.success, true, build.logs.map(String).join("\n"));

  const page = (scheme: "light" | "dark") => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mockups</title><link rel="stylesheet" href="/mockups.css"><link rel="stylesheet" href="/page-${scheme}.css"></head><body data-scheme="${scheme}">${fixture}<div id="showcase"></div><div id="steps"></div><script type="module" src="/client-entry.js"></script></body></html>`;
  const pageCss = (scheme: "light" | "dark") => `html { color-scheme: ${scheme}; } body { margin: 0; padding: 16px; background: Canvas; color: CanvasText; font: 16px system-ui, sans-serif; } [data-mockups-fixture] { display: grid; gap: 32px; } [data-mockups-fixture] section { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 24px; } figure { margin: 0; min-width: 0; } #showcase, #steps { margin-top: 32px; }`;
  const server = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch(request) {
    const url = new URL(request.url);
    const scheme = url.searchParams.get("scheme") === "dark" ? "dark" : "light";
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });
    if (url.pathname === "/mockups.css") return new Response(stylesheet, { headers: { "content-type": "text/css" } });
    if (url.pathname === "/page-light.css" || url.pathname === "/page-dark.css") return new Response(pageCss(url.pathname.includes("dark") ? "dark" : "light"), { headers: { "content-type": "text/css" } });
    if (url.pathname === "/client-entry.js") return new Response(Bun.file(join(work, "client-entry.js")), { headers: { "content-type": "text/javascript" } });
    if (url.pathname === "/") return new Response(page(scheme), { headers: { "content-type": "text/html" } });
    return new Response("Not found", { status: 404 });
  } });
  try {
    const browser = await chromium.launch({ args: verificationBrowserArguments(), executablePath: await executable(), headless: true });
    try {
      if (screenshots !== undefined) await mkdir(screenshots, { recursive: true });
      let cases = 0;
      const pinned: Record<string, readonly string[]> = {};
      for (const scheme of ["light", "dark"] as const) {
        for (const width of [375, 1280]) {
          const label = `${scheme}/${String(width)}`;
          const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: "reduce", hasTouch: width === 375 });
          const errors: string[] = [];
          try {
            const tab = await context.newPage();
            tab.on("pageerror", (error) => errors.push(error.message));
            tab.on("console", (message) => { if (message.type() === "error" || message.type() === "warning") errors.push(message.text()); });
            await tab.goto(`http://127.0.0.1:${String(server.port)}/?scheme=${scheme}`, { waitUntil: "networkidle" });
            await tab.waitForFunction(() => document.documentElement.dataset.ready === "true");
            const observed = await tab.evaluate(() => {
              const roots = [...document.querySelectorAll("[data-mockups-fixture] .hkm-root")];
              const figures = [...document.querySelectorAll("[data-hkm-fixture]")];
              return {
                viewport: document.documentElement.clientWidth,
                documentWidth: document.documentElement.scrollWidth,
                roots: roots.map((root) => ({
                  role: root.getAttribute("role"),
                  label: root.getAttribute("aria-label") ?? "",
                  nosnippet: root.hasAttribute("data-nosnippet"),
                  headings: root.querySelectorAll("h1,h2,h3,h4,h5,h6,[role=heading]").length,
                  focusable: root.querySelectorAll("a[href],button,input,select,textarea,[tabindex]").length,
                  theme: root.getAttribute("data-hkm-theme"),
                  background: getComputedStyle(root).backgroundColor,
                  scheme: getComputedStyle(root).colorScheme,
                })),
                overflowing: figures.filter((figure) => {
                  const box = figure.getBoundingClientRect();
                  const child = figure.firstElementChild?.getBoundingClientRect();
                  return child === undefined || child.right > box.right + 0.5 || child.left < box.left - 0.5 || child.width < 40 || child.height < 40;
                }).map((figure) => `${figure.getAttribute("data-hkm-fixture") ?? "?"}/${figure.closest("section")?.getAttribute("data-hkm-fixture-theme") ?? "?"}`),
                // Windows clip their content, so check the parts inside each root too.
                // Phone side buttons sit just outside the body by design.
                clipped: roots.flatMap((root) => {
                  const box = root.getBoundingClientRect();
                  return [...root.querySelectorAll("*:not(.hkm-device-button)")].filter((node) => {
                    const rect = node.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0 && getComputedStyle(node).visibility !== "hidden" && (rect.right > box.right + 0.5 || rect.left < box.left - 0.5);
                  }).slice(0, 1).map((node) => `${root.getAttribute("aria-label") ?? "?"}: .${[...node.classList].join(".") || node.tagName.toLowerCase()} "${(node.textContent ?? "").trim().slice(0, 24)}"`);
                }),
                transitions: [...document.querySelectorAll(".hkm-showcase *")].filter((node) => {
                  const style = getComputedStyle(node);
                  return style.animationName !== "none" && style.animationPlayState === "running";
                }).length,
              };
            });
            assert(observed.documentWidth <= observed.viewport, `${label}: horizontal overflow (${String(observed.documentWidth)} > ${String(observed.viewport)})`);
            assert.deepEqual(observed.overflowing, [], `${label}: frames must fit their column`);
            assert.deepEqual(observed.clipped, [], `${label}: content must fit inside each frame`);
            assert.equal(observed.roots.length, 22, `${label}: every fixture in both themes`);
            for (const root of observed.roots) {
              assert.equal(root.role, "img", `${label}: root role`);
              assert(root.label.length > 10, `${label}: root label`);
              assert(root.nosnippet, `${label}: data-nosnippet`);
              assert.equal(root.headings, 0, `${label}: ${root.label} has headings`);
              assert.equal(root.focusable, 0, `${label}: ${root.label} holds focusable content inside role=img`);
              assert.equal(root.scheme, root.theme, `${label}: ${root.label} pins its theme`);
            }
            const backgrounds = observed.roots.map((root) => `${String(root.theme)}:${root.background}`);
            if (pinned[String(width)] === undefined) pinned[String(width)] = backgrounds;
            else assert.deepEqual(backgrounds, pinned[String(width)], `${label}: pinned mockups must not follow the page scheme`);
            assert.equal(observed.transitions, 0, `${label}: no running animation under reduced motion`);

            // Tabs pattern: arrow keys move and select, the panel follows, the status is live.
            const firstTab = tab.locator("#showcase [role=tab]").first();
            await firstTab.focus();
            await tab.keyboard.press("ArrowRight");
            const tabState = await tab.evaluate(() => {
              const active = document.activeElement;
              const panel = document.querySelector("#showcase [role=tabpanel]");
              return {
                selected: active?.getAttribute("aria-selected"),
                text: active?.textContent,
                panelLabel: panel?.getAttribute("aria-labelledby") === active?.id,
                panelImg: panel?.querySelector("[role=img]")?.getAttribute("aria-label"),
                animated: panel?.hasAttribute("data-hkm-animated"),
              };
            });
            assert.equal(tabState.selected, "true", `${label}: arrow key selects the next tab`);
            assert.equal(tabState.text, "Terminal", `${label}: arrow key moves to the next tab`);
            assert(tabState.panelLabel, `${label}: panel is labelled by the selected tab`);
            assert.match(tabState.panelImg ?? "", /terminal/u, `${label}: panel shows the selected surface`);
            assert.equal(tabState.animated, false, `${label}: a surface change is a cut, not a transition`);
            const marked = tab.locator("#showcase [role=group] button", { hasText: "Marked" });
            await marked.click();
            assert.equal(await marked.getAttribute("aria-pressed"), "true", `${label}: mode button reports its state`);
            assert.equal(await tab.locator("#showcase [role=tabpanel]").getAttribute("data-hkm-animated"), "", `${label}: transitions turn on after the first mode change`);
            assert.equal(await tab.locator("#showcase [role=tabpanel]").getAttribute("data-hkm-from"), "plain", `${label}: the stage knows the previous mode`);
            assert.match(await tab.locator("#showcase .hkm-showcase-status").innerText(), /Showing marked/u, `${label}: the live status follows the mode`);
            await tab.getByRole("button", { name: "Next" }).click();
            assert.match(await tab.locator("#steps .hkm-showcase-status").innerText(), /Step 2 of 3/u, `${label}: Next advances the step`);

            if (screenshots !== undefined) await tab.screenshot({ path: join(screenshots, `mockups-${scheme}-${String(width)}.png`), fullPage: true });
            cases += 1;
          } finally {
            await context.close();
            assert.deepEqual(errors, [], `${label}: browser errors`);
          }
        }
      }
      assert.equal(cases, 4, "Both page schemes at both widths must run");
      console.log("Mockups browser checks passed: 11 frames in light and dark fit phone and desktop widths without clipped content, with mockups.css alone, render as labelled images without headings or focus stops, keep their pinned theme on light and dark pages, and the client shells follow the tabs keyboard model.");
    } finally { await browser.close(); }
  } finally { await server.stop(true); }
} finally { await rm(work, { recursive: true, force: true }); }

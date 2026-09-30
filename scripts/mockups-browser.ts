import { provisionedBrowserExecutable, verificationBrowserLaunchOptions } from "./browser-executable.js";
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
import { chromium, type Page } from "playwright-core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MockupsFixture } from "../gallery/mockups-fixture.js";
import { paletteContrast } from "../src/palette-color.js";
import { designPalettes, isDesignPalette, paletteColors, type DesignPalette } from "../src/palettes.js";
import type * as MockupsModule from "../src/mockups/index.js";

const repository = resolve(import.meta.dir, "..");
const work = await mkdtemp(join(tmpdir(), "hraness-mockups-"));
const screenshots = process.env.MOCKUPS_SCREENSHOTS;

const executable = provisionedBrowserExecutable;

function rgbHex(color: string): string {
  const values = color.match(/^rgb\((\d+), (\d+), (\d+)\)$/u);
  assert(values, `Expected an opaque sRGB color, received ${color}`);
  return `#${values.slice(1).map((channel) => Number(channel).toString(16).padStart(2, "0")).join("")}`;
}

async function assertControlContrast(tab: Page, label: string): Promise<void> {
  const samples = await tab.evaluate(() => {
    const selectors = [
      "[data-hkm-controls-fixture] .hkm-tab",
      "[data-hkm-controls-fixture] .hkm-segmented button",
      "[data-hkm-controls-fixture] .hkm-step-button",
      "[data-hkm-controls-fixture] [data-hkm-done] .hkm-step-number",
      ".hkm-root .hkm-popover-item[data-hkm-selected]",
      ".hkm-root .hkm-popover-item[data-hkm-selected] .hkm-popover-detail",
      ".hkm-root .hkm-work-mark",
    ];
    return [...document.querySelectorAll(selectors.join(","))].map((node) => {
      const style = getComputedStyle(node);
      let painted: Element | null = node;
      while (painted !== null && getComputedStyle(painted).backgroundColor === "rgba(0, 0, 0, 0)") painted = painted.parentElement;
      if (painted === null) throw new Error("The control has no opaque background.");
      return {
        name: `${node.closest("[data-hkm-theme]")?.getAttribute("data-hkm-theme") ?? "page"}/${[...node.classList].join(".") || node.tagName.toLowerCase()}/${node.textContent?.trim() ?? ""}`,
        color: style.color,
        background: getComputedStyle(painted).backgroundColor,
        opacity: style.opacity,
      };
    });
  });
  assert(samples.length >= 20, `${label}: control contrast samples are complete`);
  for (const sample of samples) {
    assert.equal(sample.opacity, "1", `${label}/${sample.name}: labels must not fade with their whole control`);
    const ratio = paletteContrast(rgbHex(sample.color), rgbHex(sample.background));
    assert(ratio >= 4.5, `${label}/${sample.name}: contrast is ${ratio.toFixed(2)}:1, below 4.5:1 (${sample.color} on ${sample.background})`);
  }
}

async function assertControlFocus(tab: Page, label: string): Promise<void> {
  const selected = tab.locator('[data-hkm-controls-fixture="dark"] .hkm-segmented button[aria-pressed="true"]:not(:disabled)');
  await selected.focus();
  await tab.keyboard.press("Tab");
  await tab.keyboard.press("Shift+Tab");
  const focus = await selected.evaluate((node) => {
    const style = getComputedStyle(node);
    return { visible: node.matches(":focus-visible"), color: style.outlineColor, width: style.outlineWidth, fill: style.backgroundColor };
  });
  assert(focus.visible, `${label}: a keyboard-selected segment keeps visible focus`);
  assert.equal(focus.width, "2px", `${label}: focus ring width`);
  assert(paletteContrast(rgbHex(focus.color), rgbHex(focus.fill)) >= 3, `${label}: the inset focus ring contrasts with the selected fill`);
}

async function assertForcedControlColors(tab: Page, label: string): Promise<void> {
  const forced = await tab.evaluate(() => {
    const paint = (node: Element) => {
      const style = getComputedStyle(node);
      return { color: style.color, background: style.backgroundColor };
    };
    const system = (node: Element, disabled = false) => {
      const scheme = node.closest("[data-hkm-theme]")?.getAttribute("data-hkm-theme") ?? document.body.dataset.scheme ?? "light";
      const probe = document.querySelector<HTMLElement>(`.hkm-system-${disabled ? "disabled" : "selection"}-probe`);
      if (probe === null) throw new Error("Missing forced-colors probe.");
      // Chromium reports "light dark" for forced descendants even though
      // Highlight resolves in the pinned ancestor's used color scheme.
      probe.style.colorScheme = scheme;
      return paint(probe);
    };
    const samples = (selector: string, disabled = false) => [...document.querySelectorAll(selector)].map((node) => ({ name: `${node.tagName}.${[...node.classList].join(".")}/${node.textContent?.trim() ?? ""}/${getComputedStyle(node).colorScheme}/${node.closest("[data-hkm-theme]")?.getAttribute("data-hkm-theme") ?? "page"}`, actual: paint(node), system: system(node, disabled) }));
    const selectors = [
      '[data-hkm-controls-fixture] .hkm-tab[aria-selected="true"]',
      '[data-hkm-controls-fixture] .hkm-segmented button[aria-pressed="true"]:not(:disabled)',
      "[data-hkm-controls-fixture] [data-hkm-done] .hkm-step-number",
      ".hkm-root .hkm-popover-item[data-hkm-selected]",
      ".hkm-root .hkm-work-mark",
    ];
    const focus = document.activeElement;
    if (focus === null || !focus.matches('.hkm-segmented button[aria-pressed="true"]:focus-visible')) throw new Error("Selected keyboard focus was lost in forced colors.");
    return {
      selected: samples(selectors.join(",")),
      disabled: samples('[data-hkm-controls-fixture] .hkm-segmented button[aria-pressed="true"]:disabled', true),
      details: [...document.querySelectorAll(".hkm-popover-item[data-hkm-selected] .hkm-popover-detail")].map((node) => ({ actual: getComputedStyle(node).color, system: system(node).color })),
      dots: [...document.querySelectorAll(".hkm-popover-item[data-hkm-selected] .hkm-popover-dot")].map((node) => ({ actual: getComputedStyle(node).backgroundColor, system: system(node).color })),
      focus: { actual: getComputedStyle(focus).outlineColor, system: system(focus).color },
    };
  });
  assert(forced.selected.length >= 10, `${label}: every filled selection is present`);
  for (const selected of forced.selected) {
    assert.notEqual(selected.system.color, selected.system.background, `${label}: the system selection colors differ`);
    assert.deepEqual(selected.actual, selected.system, `${label}/${selected.name}: selected labels use their own scheme's Highlight and HighlightText`);
  }
  for (const disabled of forced.disabled) assert.deepEqual(disabled.actual, disabled.system, `${label}: disabled selections use ButtonFace and GrayText`);
  for (const color of [...forced.details, ...forced.dots, forced.focus]) assert.equal(color.actual, color.system, `${label}: selected details, dots, and focus keep the system foreground`);
}

try {
  const api = (await import(join(repository, "dist/mockups/index.js"))) as typeof MockupsModule;
  const fixture = renderToStaticMarkup(createElement(MockupsFixture, { api }));
  const stylesheet = await readFile(join(repository, "src/mockups.css"), "utf8");
  const paletteStylesheet = await readFile(join(repository, "src/palette-system.css"), "utf8");
  const paletteBridge = (await readFile(join(repository, "src/palette-bridge.css"), "utf8")).replace('@import "./palette-system.css";', "");
  assert(!/@import|url\(/u.test(stylesheet), "mockups.css must stay self-contained");

  const build = await Bun.build({ entrypoints: [join(repository, "gallery/mockups-client-main.tsx")], outdir: work, naming: "client-entry.js", target: "browser", format: "esm", minify: true, define: { "process.env.NODE_ENV": '"production"' } });
  assert.equal(build.success, true, build.logs.map(String).join("\n"));

  const probes = ["light", "dark"].map((theme) => `<span class="hkm-system-selection-probe" data-hkm-theme="${theme}"></span><span class="hkm-system-disabled-probe" data-hkm-theme="${theme}"></span>`).join("");
  const page = (scheme: "light" | "dark", palette?: DesignPalette) => `<!doctype html><html lang="en"${palette === undefined ? "" : ` data-palette="${palette}" data-theme="${scheme}"`}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mockups</title><link rel="stylesheet" href="/mockups.css">${palette === undefined ? "" : '<link rel="stylesheet" href="/palette.css">'}<link rel="stylesheet" href="/page-${scheme}.css"></head><body data-scheme="${scheme}">${fixture}<div id="showcase"></div><div id="steps"></div>${probes}<script type="module" src="/client-entry.js"></script></body></html>`;
  const pageCss = (scheme: "light" | "dark") => `html { color-scheme: ${scheme}; } body { margin: 0; padding: 16px; background: Canvas; color: CanvasText; font: 16px system-ui, sans-serif; } [data-mockups-fixture] { display: grid; gap: 32px; } [data-mockups-fixture] section { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 24px; } figure { margin: 0; min-width: 0; } #showcase, #steps { margin-top: 32px; } .hkm-system-selection-probe, .hkm-system-disabled-probe { position: absolute; visibility: hidden; forced-color-adjust: none; } .hkm-system-selection-probe { color: HighlightText; background: Highlight; } .hkm-system-disabled-probe { color: GrayText; background: ButtonFace; } .hkm-system-selection-probe[data-hkm-theme="light"], .hkm-system-disabled-probe[data-hkm-theme="light"] { color-scheme: light; } .hkm-system-selection-probe[data-hkm-theme="dark"], .hkm-system-disabled-probe[data-hkm-theme="dark"] { color-scheme: dark; }`;
  const server = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch(request) {
    const url = new URL(request.url);
    const scheme = url.searchParams.get("scheme") === "dark" ? "dark" : "light";
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });
    if (url.pathname === "/mockups.css") return new Response(stylesheet, { headers: { "content-type": "text/css" } });
    if (url.pathname === "/palette.css") return new Response(`${paletteStylesheet}\n${paletteBridge}`, { headers: { "content-type": "text/css" } });
    if (url.pathname === "/page-light.css" || url.pathname === "/page-dark.css") return new Response(pageCss(url.pathname.includes("dark") ? "dark" : "light"), { headers: { "content-type": "text/css" } });
    if (url.pathname === "/client-entry.js") return new Response(Bun.file(join(work, "client-entry.js")), { headers: { "content-type": "text/javascript" } });
    if (url.pathname === "/") {
      const palette = url.searchParams.get("palette");
      return new Response(page(scheme, isDesignPalette(palette) ? palette : undefined), { headers: { "content-type": "text/html" } });
    }
    return new Response("Not found", { status: 404 });
  } });
  try {
    const browser = await chromium.launch({ ...verificationBrowserLaunchOptions(), executablePath: await executable(), headless: true });
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
            await assertControlContrast(tab, label);
            await assertControlFocus(tab, label);

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
            const initialStepHeight = await tab.locator("#steps .hkm-step-stage").evaluate((node) => node.getBoundingClientRect().height);
            await tab.locator("#steps").getByRole("button", { name: "Next" }).click();
            assert.match(await tab.locator("#steps .hkm-step-announcement").textContent() ?? "", /Step 2 of 3/u, `${label}: Next advances the accessible step announcement`);
            assert.equal(await tab.locator('#steps [role="tabpanel"]:not([aria-hidden="true"])').count(), 1, `${label}: one active panel`);
            assert.equal(await tab.locator('#steps [role="tabpanel"][inert]').count(), 2, `${label}: inactive panels stay inert`);
            const nextStepHeight = await tab.locator("#steps .hkm-step-stage").evaluate((node) => node.getBoundingClientRect().height);
            assert(Math.abs(initialStepHeight - nextStepHeight) < 1, `${label}: switching steps preserves the tallest-panel stage height`);
            await tab.locator("#steps").getByRole("button", { name: "Next" }).click();
            assert.match(await tab.locator("#steps .hkm-step-announcement").textContent() ?? "", /Step 3 of 3/u, `${label}: Next reaches the last step`);
            const lastStepHeight = await tab.locator("#steps .hkm-step-stage").evaluate((node) => node.getBoundingClientRect().height);
            assert(Math.abs(initialStepHeight - lastStepHeight) < 1, `${label}: the last step preserves the same stage height`);
            const folder = await tab.locator('#steps [role="tab"][aria-selected="true"]').evaluate((node) => ({ top: getComputedStyle(node).borderTopLeftRadius, bottom: getComputedStyle(node).borderBottomLeftRadius, shadow: getComputedStyle(node).boxShadow }));
            assert.equal(folder.top, "12px", `${label}: folder tab top corner`);
            assert.equal(folder.bottom, "0px", `${label}: folder tab joins the stage`);
            assert.equal(folder.shadow, "none", `${label}: folder tab has no inset underline`);

            if (screenshots !== undefined) await tab.screenshot({ path: join(screenshots, `mockups-${scheme}-${String(width)}.png`), fullPage: true });
            cases += 1;
          } finally {
            await context.close();
            assert.deepEqual(errors, [], `${label}: browser errors`);
          }
        }
      }
      assert.equal(cases, 4, "Both page schemes at both widths must run");
      let paletteCases = 0;
      for (const palette of designPalettes) {
        for (const mode of ["light", "dark"] as const) {
          const label = `${palette}/${mode}`;
          const context = await browser.newContext({ viewport: { width: 375, height: 900 }, colorScheme: mode === "light" ? "dark" : "light", reducedMotion: "reduce" });
          try {
            const tab = await context.newPage();
            await tab.goto(`http://127.0.0.1:${String(server.port)}/?palette=${palette}&scheme=${mode}`, { waitUntil: "networkidle" });
            await tab.waitForFunction(() => document.documentElement.dataset.ready === "true");
            await assertControlContrast(tab, label);
            await assertControlFocus(tab, label);
            const selected = await tab.locator('[data-hkm-controls-fixture="dark"] .hkm-segmented button[aria-pressed="true"]:not(:disabled)').evaluate((node) => {
              const style = getComputedStyle(node);
              return { color: style.color, background: style.backgroundColor };
            });
            assert.equal(rgbHex(selected.background), paletteColors[palette][mode].primary, `${label}: selected fill follows the palette`);
            assert.equal(rgbHex(selected.color), paletteColors[palette][mode].primaryForeground, `${label}: selected ink follows the matching foreground`);

            // A custom site accent is a pair; the selector must inherit both halves.
            await tab.evaluate(() => {
              document.body.style.setProperty("--hraness-site-accent", "#a6cbb7");
              document.body.style.setProperty("--hraness-site-accent-ink", "#173428");
            });
            await assertControlContrast(tab, `${label}/site-accent`);
            await assertControlFocus(tab, `${label}/site-accent`);
            const custom = await tab.locator('[data-hkm-controls-fixture="dark"] .hkm-segmented button[aria-pressed="true"]:not(:disabled)').evaluate((node) => ({ color: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor }));
            assert.equal(rgbHex(custom.background), "#a6cbb7", `${label}: custom accent fill`);
            assert.equal(rgbHex(custom.color), "#173428", `${label}: custom accent foreground`);

            await tab.emulateMedia({ forcedColors: "active" });
            await assertForcedControlColors(tab, label);
            paletteCases += 1;
          } finally { await context.close(); }
        }
      }
      assert.equal(paletteCases, designPalettes.length * 2, "Every supported palette and mode must run");
      console.log("Mockups browser checks passed: 11 frames fit phone and desktop in both themes; client tabs follow the keyboard model; selected, disabled, and completed controls meet 4.5:1 contrast with visible keyboard focus across standalone themes, all 5 palettes in both modes, and custom site accents; forced colors preserve system selection pairs.");
    } finally { await browser.close(); }
  } finally { await server.stop(true); }
} finally { await rm(work, { recursive: true, force: true }); }

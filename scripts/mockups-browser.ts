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
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium, type Page } from "playwright-core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MockupsFixture } from "../gallery/mockups-fixture.js";
import { inspectNestedFit } from "./mockups-nested-fit.js";
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
      ".hkm-showcase.hkm-steps .hkm-step-number",
      ".hkm-showcase.hkm-steps .hkm-step-hint",
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
      '.hkm-showcase.hkm-steps .hkm-tab[aria-selected="true"]',
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
  const page = (scheme: "light" | "dark", palette?: DesignPalette) => `<!doctype html><html lang="en"${palette === undefined ? "" : ` data-palette="${palette}" data-theme="${scheme}"`}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mockups</title><link rel="stylesheet" href="/mockups.css">${palette === undefined ? "" : '<link rel="stylesheet" href="/palette.css">'}<link rel="stylesheet" href="/page-${scheme}.css"></head><body data-scheme="${scheme}">${fixture}<div id="showcase"></div><div id="steps"></div><div id="fill-steps"></div><div id="fill-modes"></div><div id="fill-mixed"></div><div id="fill-mixed-modes"></div>${probes}<script type="module" src="/client-entry.js"></script></body></html>`;
  const pageCss = (scheme: "light" | "dark") => `html { color-scheme: ${scheme}; } body { margin: 0; padding: 16px; background: Canvas; color: CanvasText; font: 16px system-ui, sans-serif; } [data-mockups-fixture] { display: grid; gap: 32px; } [data-mockups-fixture] section { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 24px; } figure { margin: 0; min-width: 0; } #showcase, #steps, #fill-steps, #fill-modes, #fill-mixed, #fill-mixed-modes { margin-top: 32px; } @media (prefers-reduced-motion: reduce) { #fill-modes, #fill-modes *, #fill-steps, #fill-steps *, #fill-mixed, #fill-mixed *, #fill-mixed-modes, #fill-mixed-modes * { transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; } } .hkm-system-selection-probe, .hkm-system-disabled-probe { position: absolute; visibility: hidden; forced-color-adjust: none; } .hkm-system-selection-probe { color: HighlightText; background: Highlight; } .hkm-system-disabled-probe { color: GrayText; background: ButtonFace; } .hkm-system-selection-probe[data-hkm-theme="light"], .hkm-system-disabled-probe[data-hkm-theme="light"] { color-scheme: light; } .hkm-system-selection-probe[data-hkm-theme="dark"], .hkm-system-disabled-probe[data-hkm-theme="dark"] { color-scheme: dark; }`;
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
            const initialModeHeight = await tab.locator("#showcase [role=tabpanel]").evaluate((node) => node.getBoundingClientRect().height);
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
                panelImg: panel?.querySelector('.hkm-mode-surface:not([aria-hidden="true"]) [role=img]')?.getAttribute("aria-label"),
                animated: panel?.querySelector('.hkm-mode-surface:not([aria-hidden="true"])')?.hasAttribute("data-hkm-animated"),
              };
            });
            assert.equal(tabState.selected, "true", `${label}: arrow key selects the next tab`);
            assert.equal(tabState.text, "Terminal", `${label}: arrow key moves to the next tab`);
            assert(tabState.panelLabel, `${label}: panel is labelled by the selected tab`);
            assert.match(tabState.panelImg ?? "", /terminal/u, `${label}: panel shows the selected surface`);
            assert.equal(tabState.animated, false, `${label}: a surface change is a cut, not a transition`);
            const nextModeHeight = await tab.locator("#showcase [role=tabpanel]").evaluate((node) => node.getBoundingClientRect().height);
            assert(Math.abs(initialModeHeight - nextModeHeight) < 1, `${label}: switching surfaces preserves the tallest preview height`);
            assert.equal(await tab.locator('#showcase .hkm-mode-surface:not([aria-hidden="true"])').count(), 1, `${label}: one active surface`);
            assert.equal(await tab.locator('#showcase .hkm-mode-surface[inert]').count(), 1, `${label}: inactive surface stays inert`);
            const marked = tab.locator("#showcase [role=group] button", { hasText: "Marked" });
            await marked.click();
            assert.equal(await marked.getAttribute("aria-pressed"), "true", `${label}: mode button reports its state`);
            assert.equal(await tab.locator('#showcase .hkm-mode-surface:not([aria-hidden="true"])').getAttribute("data-hkm-animated"), "", `${label}: transitions turn on after the first mode change`);
            assert.equal(await tab.locator('#showcase .hkm-mode-surface:not([aria-hidden="true"])').getAttribute("data-hkm-from"), "plain", `${label}: the stage knows the previous mode`);
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
            const stepList = tab.locator('#steps [role="tablist"]');
            const verticalSteps = await stepList.getAttribute("aria-orientation") === "vertical";
            await tab.locator("#steps").getByRole("tab", { name: "Step 3", exact: true }).focus();
            await tab.keyboard.press(verticalSteps ? "ArrowRight" : "ArrowDown");
            assert.equal(await tab.locator('#steps [role="tab"][aria-selected="true"]').getAttribute("aria-label"), "Step 3", `${label}: perpendicular arrows retain page navigation`);
            await tab.keyboard.press("Home");
            assert.equal(await tab.locator('#steps [role="tab"][aria-selected="true"]').getAttribute("aria-label"), "Step 1", `${label}: Home selects the first step`);
            await tab.keyboard.press(verticalSteps ? "ArrowDown" : "ArrowRight");
            assert.equal(await tab.locator('#steps [role="tab"][aria-selected="true"]').getAttribute("aria-label"), "Step 2", `${label}: arrows follow the selector orientation`);
            await tab.keyboard.press("End");
            assert.equal(await tab.locator('#steps [role="tab"][aria-selected="true"]').getAttribute("aria-label"), "Step 3", `${label}: End selects the last step`);
            await tab.keyboard.press("Tab");
            assert(await tab.locator('#steps [role="tabpanel"][aria-hidden="false"]').evaluate((node) => node === document.activeElement), `${label}: keyboard focus reaches the selected preview`);
            for (const showcase of ["#showcase"]) {
              const folder = await tab.locator(`${showcase} [role="tab"][aria-selected="true"]`).evaluate((node) => {
                const panel = document.getElementById(node.getAttribute("aria-controls") ?? "");
                const frame = panel?.closest(".hkm-step-stage") ?? panel;
                return {
                  top: getComputedStyle(node).borderTopLeftRadius,
                  bottom: getComputedStyle(node).borderBottomLeftRadius,
                  shadow: getComputedStyle(node).boxShadow,
                  seam: frame === null ? null : node.getBoundingClientRect().bottom - frame.getBoundingClientRect().top,
                };
              });
              assert.equal(folder.top, "12px", `${label}/${showcase}: folder tab top corner`);
              assert.equal(folder.bottom, "0px", `${label}/${showcase}: folder tab joins the panel`);
              assert.equal(folder.shadow, "none", `${label}/${showcase}: folder tab has no inset underline`);
              assert(folder.seam !== null && Math.abs(folder.seam - 1) < 1, `${label}/${showcase}: tab shares its lower border with the panel`);
            }
            for (const surfaceTab of await tab.locator("#showcase [role=tab]").all()) {
              await surfaceTab.click();
              const surface = await tab.locator("#showcase [role=tabpanel]").evaluate((node) => {
                const active = node.querySelector('.hkm-mode-surface:not([aria-hidden="true"])');
                const window = active?.querySelector('.hkm-fit-inner > .hkm-root > .hkm-window');
                const style = window === null || window === undefined ? null : getComputedStyle(window);
                return { height: node.getBoundingClientRect().height, shadow: style?.boxShadow, radius: style?.borderTopLeftRadius };
              });
              assert(Math.abs(initialModeHeight - surface.height) < 1, `${label}: every surface preserves the tallest preview height`);
              assert.equal(surface.shadow, "none", `${label}: direct preview frame shares its panel border`);
              assert.equal(surface.radius, "0px", `${label}: direct preview frame shares its panel corners`);
            }
            assert.equal(await tab.locator("#showcase [role=tabpanel] .hkm-showcase-controls").count(), 1, `${label}: mode controls belong to the selected surface panel`);
            await tab.locator("#showcase [role=tab]").first().click();
            assert.equal(await marked.getAttribute("aria-pressed"), "true", `${label}: mode selection persists across surfaces`);

            if (screenshots !== undefined) await tab.screenshot({ path: join(screenshots, `mockups-${scheme}-${String(width)}.png`), fullPage: true });
            cases += 1;
          } finally {
            await context.close();
            assert.deepEqual(errors, [], `${label}: browser errors`);
          }
        }
      }
      assert.equal(cases, 4, "Both page schemes at both widths must run");
      const fillEvidence = [];
      for (const scheme of ["light", "dark"] as const) {
        for (const width of [320, 390, 768, 1440]) {
          const label = `fill/${scheme}/${width}`;
          const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: "reduce" });
          const errors: string[] = [];
          try {
            const tab = await context.newPage();
            tab.on("pageerror", (error) => errors.push(error.message));
            tab.on("console", (message) => { if (message.type() === "error" || message.type() === "warning") errors.push(message.text()); });
            await tab.goto(`http://127.0.0.1:${server.port}/?scheme=${scheme}`, { waitUntil: "networkidle" });
            await tab.waitForSelector("#fill-steps [data-hkm-fitted]");
            const observe = () => tab.locator("#fill-steps").evaluate((root) => {
              const stage = root.querySelector(".hkm-step-stage");
              const panel = root.querySelector('.hkm-step-panel[aria-hidden="false"]');
              const frame = panel?.querySelector(".hkm-window");
              const controls = root.querySelector(".hkm-step-controls");
              const list = root.querySelector('[role="tablist"]');
              const previous = root.querySelector('.hkm-step-button[aria-label="Back"]');
              const next = root.querySelector('.hkm-step-button[aria-label="Next"]');
              if (stage === null || panel === null || frame === null || frame === undefined || controls === null || list === null || previous === null || next === null) throw new Error("Missing fill frame or navigation");
              const inner = panel.querySelector(".hkm-fit-inner");
              if (inner === null) throw new Error("Missing fill content");
              return {
                height: stage.getBoundingClientRect().height, frameHeight: frame.getBoundingClientRect().height,
                width: stage.getBoundingClientRect().width, frameWidth: frame.getBoundingClientRect().width,
                walkthroughHeight: root.getBoundingClientRect().height,
                navigation: {
                  vertical: list.getAttribute("aria-orientation") === "vertical",
                  controls: controls.getBoundingClientRect().toJSON(), list: list.getBoundingClientRect().toJSON(),
                  previous: previous.getBoundingClientRect().toJSON(), next: next.getBoundingClientRect().toJSON(), stage: stage.getBoundingClientRect().toJSON(),
                  selected: list.querySelector('[aria-selected="true"]')?.getBoundingClientRect().toJSON(),
                  stageRadii: { startStart: getComputedStyle(stage).borderStartStartRadius, startEnd: getComputedStyle(stage).borderStartEndRadius, endStart: getComputedStyle(stage).borderEndStartRadius },
                  tabFonts: [...list.querySelectorAll(".hkm-step-label")].map((node) => getComputedStyle(node).fontSize),
                  numbers: [...list.querySelectorAll(".hkm-step-number")].map((node) => ({ border: getComputedStyle(node).borderTopWidth, radius: getComputedStyle(node).borderTopLeftRadius, background: getComputedStyle(node).backgroundColor })),
                  headers: [...stage.querySelectorAll(".hkm-title-bar,.hkm-browser-bar")].map((node) => ({ height: node.getBoundingClientRect().height, font: getComputedStyle(node).fontSize })),
                },
                rootFont: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
                scale: getComputedStyle(inner).transform,
                probes: root.querySelectorAll("[data-hkm-measuring]").length,
                terminals: [...root.querySelectorAll<HTMLElement>('[data-hkm-density="presentation"]')].map((body) => ({
                  font: Number.parseFloat(getComputedStyle(body).fontSize), height: body.clientHeight, scrollHeight: body.scrollHeight,
                  width: body.clientWidth, scrollWidth: body.scrollWidth,
                  wrappedRows: [...body.querySelectorAll<HTMLElement>(".hkm-terminal-line")].map((line) => Math.ceil((line.getBoundingClientRect().height - 0.5) / Number.parseFloat(getComputedStyle(line).lineHeight))),
                })),
              };
            });
            const initial = await observe();
            const navigation = initial.navigation;
            assert(Math.abs(navigation.previous.top - navigation.next.top) < 1, `${label}: both arrows share the top row`);
            assert(navigation.previous.height >= 44 && navigation.next.height >= 44, `${label}: navigation meets the touch target minimum`);
            assert(new Set(navigation.tabFonts).size === 1, `${label}: every label has the same font size`);
            assert(navigation.numbers.every((number) => number.border === "0px" && number.radius === "0px" && number.background === "rgba(0, 0, 0, 0)"), `${label}: step numbers are plain text`);
            assert(new Set(navigation.headers.map((header) => header.height)).size === 1 && new Set(navigation.headers.map((header) => header.font)).size === 1, `${label}: browser and terminal chrome have consistent sizes`);
            if (navigation.vertical) {
              assert(navigation.list.right <= navigation.stage.left + 1.5, `${label}: descriptive selector sits beside the preview`);
              assert(Math.abs(navigation.selected.right - (navigation.stage.left + 1)) < 1, `${label}: the selected step joins the preview's start edge`);
              assert(Math.abs(navigation.list.top - navigation.stage.top) < 1, `${label}: the stacked steps start flush with the preview's top edge`);
              assert(navigation.previous.top >= navigation.list.bottom, `${label}: arrows follow the stacked choices`);
              assert(navigation.list.bottom <= navigation.stage.bottom + 1, `${label}: the stacked steps never hang past the preview`);
              assert(navigation.stageRadii.startStart === "0px" && navigation.stageRadii.endStart !== "0px", `${label}: only the corner the steps meet is square`);
            } else {
              assert(navigation.previous.right <= navigation.list.left && navigation.list.right <= navigation.next.left, `${label}: arrows bracket the compact tab strip`);
              assert(navigation.next.bottom <= navigation.stage.top + 0.5, `${label}: compact navigation remains above the preview`);
              assert(Math.abs(navigation.selected.bottom - (navigation.stage.top + 1)) < 1, `${label}: the selected tab joins the preview's top edge`);
              assert(navigation.selected.left > navigation.stage.left + 12, `${label}: tabs start inside the preview's rounded corner`);
              assert(navigation.stageRadii.startStart !== "0px" && navigation.stageRadii.startEnd !== "0px", `${label}: the compact preview keeps both rounded top corners`);
            }
            await tab.locator("#fill-steps .hkm-step-stage").evaluate((node) => {
              let changes = 0;
              const observer = new MutationObserver((records) => { changes += records.length; });
              observer.observe(node, { attributes: true, attributeFilter: ["style", "data-hkm-fitted"] });
              Object.assign(node, { fittingMutations: () => { observer.disconnect(); return changes; } });
            });
            for (let step = 0; step < 3; step += 1) {
              if (step > 0) await tab.locator("#fill-steps").getByRole("button", { name: "Next" }).click();
              const actual = await observe();
              assert(Math.abs(actual.height - initial.height) < 1, `${label}: changing steps keeps the stage stable`);
              assert(Math.abs(actual.walkthroughHeight - initial.walkthroughHeight) < 1, `${label}: descriptions and navigation reserve stable space`);
              assert(Math.abs(actual.frameHeight - (actual.height - 2)) < 1, `${label}: active frame fills the stage`);
              assert(Math.abs(actual.frameWidth - (actual.width - 2)) < 1, `${label}: active frame fills available width`);
              assert.equal(actual.scale, "none", `${label}: presentation text never scales down`);
              assert.deepEqual(actual.terminals[0]?.wrappedRows, [1, 1, 1], `${label}: growing sparse type adds no wrapping`);
              assert.equal(actual.probes, 0, `${label}: measurement clone is removed`);
              for (const terminal of actual.terminals) {
                assert(terminal.font >= actual.rootFont, `${label}: type respects the rem floor`);
                assert(terminal.font <= actual.rootFont * 4, `${label}: type respects the presentation maximum`);
                assert(terminal.scrollHeight <= terminal.height + 1, `${label}: full terminal text fits vertically`);
                assert(terminal.scrollWidth <= terminal.width + 1, `${label}: full terminal text wraps horizontally`);
              }
              if (screenshots !== undefined) await tab.locator("#fill-steps").screenshot({ path: join(screenshots, `fill-${scheme}-${width}-${step}.png`) });
            }
            const fittingMutations = await tab.locator("#fill-steps .hkm-step-stage").evaluate((node) => (node as HTMLDivElement & { fittingMutations: () => number }).fittingMutations());
            assert.equal(fittingMutations, 0, `${label}: step animation does not refit the stage or repeat fitting observers`);
            fillEvidence.push({ label, ...initial, fittingMutations });
            fillEvidence.push(await inspectNestedFit(tab, label, screenshots));
            fillEvidence.push(await inspectNestedFit(tab, label, screenshots, "#fill-mixed-modes"));
            const [sparse, dense] = initial.terminals;
            assert(sparse !== undefined && dense !== undefined, `${label}: both terminal densities are covered`);
            assert.equal(sparse.font, dense.font, `${label}: every authored terminal uses one consistent type size`);
            await tab.waitForSelector("#fill-modes [data-hkm-fitted]");
            const observeMode = async (settle = true) => {
              // The owned copy measures synchronously; live authored transitions
              // settle at paint before geometry assertions read the actual frame.
              if (settle) await tab.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
              return tab.locator("#fill-modes").evaluate((root) => {
                const stage = root.querySelector<HTMLElement>(".hkm-mode-stage");
                const active = stage?.querySelector<HTMLElement>('.hkm-mode-surface:not([data-hkm-measurement]):not([aria-hidden="true"])');
                const frame = active?.querySelector<HTMLElement>(".hkm-window");
                if (stage === null || stage === undefined || active === null || active === undefined || frame === null || frame === undefined) throw new Error("Missing filled mode surface");
                const fixtures = [...stage.querySelectorAll<HTMLElement>("[data-hkm-measurement]")];
                const terminals = [...stage.querySelectorAll<HTMLElement>('[data-hkm-density="presentation"]')].filter((body) => body.closest("[data-hkm-measurement]") === null).map((body) => ({
                  font: Number.parseFloat(getComputedStyle(body).fontSize), height: body.clientHeight, width: body.clientWidth,
                  scrollHeight: body.scrollHeight, scrollWidth: body.scrollWidth,
                }));
                return {
                  height: stage.getBoundingClientRect().height, width: stage.getBoundingClientRect().width,
                  walkthroughHeight: root.getBoundingClientRect().height,
                  stageOffset: stage.getBoundingClientRect().top - root.getBoundingClientRect().top,
                  frameHeight: frame.getBoundingClientRect().height, frameWidth: frame.getBoundingClientRect().width,
                  terminals, rootFont: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
                  hiddenFixtures: fixtures.filter((fixture) => fixture.hidden && fixture.inert && getComputedStyle(fixture).display === "none").length,
                  fixtures: fixtures.length, probes: root.querySelectorAll("[data-hkm-measuring]").length,
                  stages: root.querySelectorAll(".hkm-mode-stage").length,
                  liveMotionOverrides: [...stage.querySelectorAll<HTMLElement>("*")].filter((node) => node.style.getPropertyPriority("transition") === "important" || node.style.getPropertyPriority("animation") === "important").length,
                  sentinels: stage.querySelectorAll("[data-hkm-font-sentinel]").length,
                  scales: [...stage.querySelectorAll<HTMLElement>(".hkm-fit-inner")].filter((inner) => inner.closest("[data-hkm-measurement]") === null).map((inner) => getComputedStyle(inner).transform),
                };
              });
            };
            const firstMode = await observeMode();
            assert.equal(await tab.locator("#fill-modes").getByRole("tab", { name: "Report", exact: true }).getAttribute("aria-selected"), "true", `${label}: start on the nonterminal surface`);
            await tab.locator("#fill-modes").getByRole("tab", { name: "Terminal", exact: true }).click();
            const firstTerminal = await observeMode();
            assert(firstTerminal.terminals.every((terminal) => terminal.font >= firstTerminal.rootFont && terminal.scrollHeight <= terminal.height + 1 && terminal.scrollWidth <= terminal.width + 1), `${label}: first terminal opening fits before any mode or option change`);
            assert(Math.abs(firstTerminal.height - firstMode.height) < 1, `${label}: first surface-only switch keeps the reserved height`);
            await tab.locator("#fill-modes").getByRole("tab", { name: "Report", exact: true }).click();
            await tab.setViewportSize({ width: width + 17, height: 900 });
            await tab.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
            await tab.setViewportSize({ width, height: 900 });
            await tab.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
            await tab.locator("#fill-modes").getByRole("tab", { name: "Terminal", exact: true }).click();
            const resizedTerminal = await observeMode();
            assert(Math.abs(resizedTerminal.height - firstMode.height) < 1 && resizedTerminal.terminals.every((terminal) => terminal.scrollHeight <= terminal.height + 1 && terminal.scrollWidth <= terminal.width + 1), `${label}: returning from the nonterminal surface after resize preserves complete text`);
            fillEvidence.push({ label: `mode-${label}/first-open-and-resize`, first: firstTerminal, resized: resizedTerminal });
            const modeStates = [];
            for (const mode of ["Short", "Long"]) for (const option of ["Normal", "Full"]) {
              await tab.locator("#fill-modes").getByRole("button", { name: mode, exact: true }).click();
              await tab.locator("#fill-modes").getByRole("button", { name: option, exact: true }).click();
              for (const surface of ["Terminal", "Report"]) {
                await tab.locator("#fill-modes").getByRole("tab", { name: surface, exact: true }).click();
                const actual = await observeMode();
                const stateLabel = `${label}/mode/${mode}/${option}/${surface}`;
                assert(Math.abs(actual.height - firstMode.height) < 1, `${stateLabel}: every authored choice keeps the same reserved height`);
                assert(Math.abs(actual.walkthroughHeight - firstMode.walkthroughHeight) < 1 && Math.abs(actual.stageOffset - firstMode.stageOffset) < 1, `${stateLabel}: descriptions reserve space without moving the preview`);
                assert(actual.height >= 280, `${stateLabel}: explicit height remains a minimum`);
                assert(Math.abs(actual.frameHeight - actual.height) < 1 && Math.abs(actual.frameWidth - actual.width) < 1, `${stateLabel}: selected frame fills the panel`);
                assert.equal(actual.fixtures, 8, `${stateLabel}: finite full-source combinations are reserved`);
                assert.equal(actual.hiddenFixtures, actual.fixtures, `${stateLabel}: measurement fixtures remain hidden and inert`);
                assert.equal(actual.probes, 0, `${stateLabel}: detached probes are removed`);
                assert.equal(actual.stages, 1, `${stateLabel}: the font-fitting copy is removed after measurement`);
                assert.equal(actual.liveMotionOverrides, 0, `${stateLabel}: measurement motion overrides never reach live surfaces`);
                assert.equal(actual.sentinels, 1, `${stateLabel}: selection changes keep exactly one owned font observer`);
                assert(actual.scales.every((scale) => scale === "none"), `${stateLabel}: readable content never scales down`);
                for (const terminal of actual.terminals) {
                  assert(terminal.font >= actual.rootFont && terminal.font <= actual.rootFont * 4, `${stateLabel}: type respects user size and the presentation ceiling`);
                  assert(terminal.scrollHeight <= terminal.height + 1 && terminal.scrollWidth <= terminal.width + 1, `${stateLabel}: complete source fits without clipping or horizontal overflow`);
                }
                modeStates.push({ mode, option, surface, ...actual });
                if (screenshots !== undefined && ((mode === "Short" && option === "Normal" && surface === "Terminal") || (mode === "Long" && option === "Full"))) await tab.locator("#fill-modes").screenshot({ path: join(screenshots, `mode-fill-${scheme}-${width}-${mode}-${option}-${surface}.png`) });
              }
            }
            fillEvidence.push({ label: `mode-${label}`, ...firstMode, states: modeStates });
            if (width === 390) {
              await tab.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
              await tab.waitForFunction(() => [...document.querySelectorAll<HTMLElement>('#fill-steps [data-hkm-density="presentation"]')].every((body) => Number.parseFloat(getComputedStyle(body).fontSize) >= 32 && body.scrollHeight <= body.clientHeight + 1));
              const zoomed = await observe();
              assert(zoomed.height >= initial.height, `${label}: larger user text can grow the natural stage`);
              assert.equal(zoomed.scale, "none");
              await tab.waitForFunction(() => [...document.querySelectorAll<HTMLElement>('#fill-modes [data-hkm-density="presentation"]')].filter((body) => body.closest("[data-hkm-measurement]") === null).every((body) => Number.parseFloat(getComputedStyle(body).fontSize) >= 32 && body.scrollHeight <= body.clientHeight + 1));
              await tab.locator("#fill-modes").getByRole("tab", { name: "Terminal", exact: true }).click();
              await tab.locator("#fill-modes").getByRole("button", { name: "Short", exact: true }).click();
              await tab.locator("#fill-modes").getByRole("button", { name: "Normal", exact: true }).click();
              const shortZoom = await observeMode();
              await tab.locator("#fill-modes").getByRole("button", { name: "Long", exact: true }).click();
              await tab.locator("#fill-modes").getByRole("button", { name: "Full", exact: true }).click();
              const immediateLongZoom = await observeMode(false);
              const longZoom = await observeMode();
              const stableLongZoom = await observeMode();
              assert.deepEqual(stableLongZoom, longZoom, `${label}: consecutive painted geometry snapshots stay stable`);
              assert(shortZoom.height >= firstMode.height, `${label}: text zoom can enlarge the complete choice reservation`);
              assert(Math.abs(shortZoom.height - longZoom.height) < 1, `${label}: shortest to longest mode at 200% keeps the same stage`);
              assert(longZoom.terminals.every((terminal) => terminal.font >= 32 && terminal.scrollHeight <= terminal.height + 1 && terminal.scrollWidth <= terminal.width + 1), `${label}: longest state preserves all text at 200%`);
              fillEvidence.push({ label: `mode-${label}/200%`, short: shortZoom, immediate: immediateLongZoom, long: longZoom, stable: stableLongZoom });
              if (screenshots !== undefined) await tab.locator("#fill-modes").screenshot({ path: join(screenshots, `mode-fill-${scheme}-${width}-zoom.png`) });
              await tab.evaluate(() => {
                document.documentElement.style.cssText = "font-size:100%;block-size:100vh;overflow:hidden";
                document.body.style.cssText = "block-size:100vh;box-sizing:border-box;overflow:hidden";
                for (const child of [...document.body.children]) if (child instanceof HTMLElement && child.id !== "fill-modes") child.style.display = "none";
                const fixture = document.getElementById("fill-modes");
                if (fixture === null) throw new Error("Missing fixed mode fixture");
                fixture.style.cssText = "max-block-size:100%;overflow:auto;margin:0";
              });
              await tab.locator("#fill-modes").getByRole("button", { name: "Short", exact: true }).click();
              await tab.locator("#fill-modes").getByRole("button", { name: "Normal", exact: true }).click();
              await tab.waitForFunction((height) => {
                const stage = document.querySelector("#fill-modes .hkm-mode-stage");
                return stage !== null && Math.abs(stage.getBoundingClientRect().height - height) < 1;
              }, firstMode.height);
              await tab.evaluate(async () => { await document.fonts.ready; await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); });
              const fixedEvent = await tab.evaluate(() => {
                const stage = document.querySelector("#fill-modes .hkm-mode-stage");
                if (stage === null) throw new Error("Missing fixed stage");
                const boxes = () => ({ root: document.documentElement.getBoundingClientRect().toJSON(), stage: stage.getBoundingClientRect().toJSON() });
                const before = boxes();
                document.documentElement.style.fontSize = "200%";
                return { before, synchronous: boxes() };
              });
              assert.equal(fixedEvent.before.root.width, fixedEvent.synchronous.root.width, `${label}: fixed root width cannot signal the font change`);
              assert.equal(fixedEvent.before.root.height, fixedEvent.synchronous.root.height, `${label}: fixed root height cannot signal the font change`);
              assert.equal(fixedEvent.before.stage.width, fixedEvent.synchronous.stage.width, `${label}: fixed stage width cannot signal the font change`);
              assert.equal(fixedEvent.before.stage.height, fixedEvent.synchronous.stage.height, `${label}: reserved stage height cannot signal the font change`);
              await tab.waitForFunction((height) => {
                const stage = document.querySelector("#fill-modes .hkm-mode-stage");
                return stage !== null && stage.getBoundingClientRect().height > height + 1;
              }, fixedEvent.before.stage.height);
              const fixedShort = await observeMode();
              await tab.locator("#fill-modes").getByRole("button", { name: "Long", exact: true }).click();
              await tab.locator("#fill-modes").getByRole("button", { name: "Full", exact: true }).click();
              const fixedLong = await observeMode();
              const stableFixedLong = await observeMode();
              assert.deepEqual(stableFixedLong, fixedLong, `${label}: fixed-shell painted geometry stays stable`);
              assert(Math.abs(fixedShort.height - fixedLong.height) < 1, `${label}: fixed-shell zoom preserves the complete choice maximum`);
              assert(fixedLong.terminals.every((terminal) => terminal.font >= 32 && terminal.scrollHeight <= terminal.height + 1 && terminal.scrollWidth <= terminal.width + 1), `${label}: rem sentinel refits all text in a fixed viewport shell`);
              fillEvidence.push({ label: `mode-${label}/fixed-root-200%`, fixedEvent, short: fixedShort, long: fixedLong, stable: stableFixedLong });
              const retainedStage = await tab.locator("#fill-modes .hkm-mode-stage").elementHandle();
              assert(retainedStage !== null, `${label}: retain the owned stage for cleanup inspection`);
              await tab.evaluate(() => window.dispatchEvent(new Event("mockups:unmount-mode-fill")));
              assert(await retainedStage.evaluate((node) => !node.hasAttribute("data-hkm-fitted") && node.querySelector("[data-hkm-font-sentinel]") === null && (node as HTMLElement).style.getPropertyValue("--hkm-showcase-fill-height") === ""), `${label}: unmount removes the owned sentinel and fitted style`);
              await retainedStage.dispose();
            }
          } finally {
            await context.close();
            assert.deepEqual(errors, [], `${label}: browser errors`);
          }
        }
      }
      if (screenshots !== undefined) await writeFile(join(screenshots, "fill-evidence.json"), JSON.stringify(fillEvidence, null, 2) + "\n");
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
            // Forced colors repaint through the authored 160ms color
            // transitions; wait two frames plus the longest transition before
            // sampling so the assertion reads the settled system pair.
            await tab.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
            await new Promise<void>((resolve) => setTimeout(resolve, 250));
            await assertForcedControlColors(tab, label);
            paletteCases += 1;
          } finally { await context.close(); }
        }
      }
      assert.equal(paletteCases, designPalettes.length * 2, "Every supported palette and mode must run");
      console.log("Mockups browser checks passed: 11 frames fit phone and desktop in both themes; client tabs follow the keyboard model; filled walkthroughs and all authored mode/option combinations fit sparse and dense content at four widths, retain stable frames, and honor 200% text zoom; selected, disabled, and completed controls meet 4.5:1 contrast with visible keyboard focus across standalone themes, all 5 palettes in both modes, and custom site accents; forced colors preserve system selection pairs.");
    } finally { await browser.close(); }
  } finally { await server.stop(true); }
} finally { await rm(work, { recursive: true, force: true }); }

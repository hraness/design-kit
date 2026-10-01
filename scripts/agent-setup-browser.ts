import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium, type BrowserContextOptions, type Page } from "playwright-core";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { AgentSetupFixture, agentSetupFixtureCommands, agentSetupFixturePrompt, type AgentSetupFixtureApi } from "../gallery/agent-setup-fixture.js";
import { paletteContrast } from "../src/palette-color.js";
import { designPalettes, type DesignPalette } from "../src/palettes.js";
import { provisionedBrowserExecutable, verificationBrowserLaunchOptions } from "./browser-executable.js";
import { bundleBrowserStylesheet } from "./browser-stylesheet.js";

const repository = resolve(import.meta.dir, "..");
const entryModule = join(repository, "dist/react/index.js");
const api = await import(entryModule) as AgentSetupFixtureApi;
const markup = renderToString(createElement(AgentSetupFixture, { api }));
const stylesheet = await bundleBrowserStylesheet(join(repository, "src/styles.css"), repository);
const workspace = await mkdtemp(join(repository, "node_modules", ".agent-setup-"));
let script: string;
try {
  const entry = join(workspace, "entry.js");
  await writeFile(entry, `import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import * as api from ${JSON.stringify(entryModule)};
import { AgentSetupFixture } from ${JSON.stringify(join(repository, "gallery/agent-setup-fixture.tsx"))};
hydrateRoot(document.getElementById("root"), createElement(AgentSetupFixture, { api, prompt: JSON.parse(document.getElementById("fixture-prompt").textContent) }));
requestAnimationFrame(() => requestAnimationFrame(() => { document.documentElement.dataset.ready = "true"; }));
`);
  const bundle = await Bun.build({ entrypoints: [entry], define: { "process.env.NODE_ENV": '"production"' }, format: "esm", minify: true, target: "browser" });
  assert(bundle.success, bundle.logs.map(String).join("\n"));
  const output = bundle.outputs[0];
  assert(output, "Agent setup browser fixture must emit one script.");
  script = await output.text();
} finally { await rm(workspace, { recursive: true, force: true }); }

const pageCss = "body { margin: 0; background: var(--background); color: var(--foreground); } main { display: grid; gap: 2rem; padding: 16px; max-inline-size: 72rem; margin-inline: auto; } .fixture-narrow { inline-size: min(100%, 20rem); } .fixture-solid { display: flex; flex-wrap: wrap; gap: 1rem; } .fixture-accent { --hraness-marketing-ink: var(--primary-foreground); --hraness-marketing-background: var(--primary); --hraness-marketing-surface: var(--primary); padding: 1rem; background: var(--primary); color: var(--primary-foreground); } .system-selection-probe { position: absolute; visibility: hidden; forced-color-adjust: none; color: HighlightText; background-color: Highlight; } .system-canvas-probe { position: absolute; visibility: hidden; forced-color-adjust: none; background-color: Canvas; }";
const documentFor = (palette: DesignPalette, theme: "light" | "dark", prompt: string) => `<!doctype html><html lang="en" data-palette="${palette}" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent setup</title><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/page.css"><script type="application/json" id="fixture-prompt">${JSON.stringify(prompt).replaceAll("<", "\\u003c")}</script><script type="module" src="/app.js"></script></head><body><div id="root">${prompt === agentSetupFixturePrompt ? markup : renderToString(createElement(AgentSetupFixture, { api, prompt }))}</div><span class="system-selection-probe"></span><span class="system-canvas-probe"></span></body></html>`;
const executable = await provisionedBrowserExecutable();
const browser = await chromium.launch({ ...verificationBrowserLaunchOptions(["--enable-automation"]), executablePath: executable });
const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = [];

function rgbHex(color: string): string {
  const match = color.match(/^rgb\((\d+), (\d+), (\d+)\)$/u);
  assert(match, `Expected opaque sRGB, received ${color}`);
  return `#${match.slice(1).map((channel) => Number(channel).toString(16).padStart(2, "0")).join("")}`;
}

function rgba(color: string): { channels: readonly [number, number, number]; alpha: number } {
  const match = color.match(/^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/u);
  assert(match, `Expected computed sRGB paint, received ${color}`);
  return { channels: [Number(match[1]), Number(match[2]), Number(match[3])], alpha: match[4] === undefined ? 1 : Number(match[4]) };
}

function paintedHex(color: string, background: string): string {
  const foreground = rgba(color);
  const base = rgba(background);
  assert.equal(base.alpha, 1, "Paint compositing starts from an opaque computed background.");
  return `#${foreground.channels.map((channel, index) => Math.round(channel * foreground.alpha + (base.channels[index] ?? 0) * (1 - foreground.alpha)).toString(16).padStart(2, "0")).join("")}`;
}

function backgroundPaint(colors: readonly string[], canvas: string): string {
  let background = canvas;
  for (const color of [...colors].reverse()) {
    const hex = paintedHex(color, background);
    background = `rgb(${Number.parseInt(hex.slice(1, 3), 16)}, ${Number.parseInt(hex.slice(3, 5), 16)}, ${Number.parseInt(hex.slice(5, 7), 16)})`;
  }
  return background;
}

async function open(palette: DesignPalette, theme: "light" | "dark", options: BrowserContextOptions = {}, prompt = agentSetupFixturePrompt): Promise<{ page: Page; problems: string[] }> {
  const context = await browser.newContext({ colorScheme: theme === "light" ? "dark" : "light", viewport: { width: 375, height: 900 }, reducedMotion: "reduce", ...options });
  contexts.push(context);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "https://agent-setup.test" });
  const page = await context.newPage();
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => { if ((message.type() === "error" || message.type() === "warning") && !message.text().startsWith("Failed to load resource")) problems.push(message.text()); });
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname;
    if (url.hostname === "agent.example") await route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Agent</title>" });
    else if (pathname === "/") await route.fulfill({ contentType: "text/html", body: documentFor(palette, theme, prompt) });
    else if (pathname === "/styles.css") await route.fulfill({ contentType: "text/css", body: stylesheet });
    else if (pathname === "/page.css") await route.fulfill({ contentType: "text/css", body: pageCss });
    else if (pathname === "/app.js") await route.fulfill({ contentType: "text/javascript", body: script });
    else if (pathname.startsWith("/fonts/")) await route.fulfill({ contentType: "font/woff2", body: await readFile(join(repository, "src", pathname)) });
    else await route.fulfill({ status: 204 });
  });
  await page.goto("https://agent-setup.test/", { waitUntil: "networkidle" });
  if (options.javaScriptEnabled !== false) await page.waitForFunction(() => document.documentElement.dataset.ready === "true");
  return { page, problems };
}

async function renderedState(page: Page, selector = "body"): Promise<void> {
  await page.locator(selector).evaluate(async (root) => {
    // Reduced-motion transitions can propagate inherited ink one SVG depth
    // per frame. Flush the actual styles before checking the transition state;
    // a blind frame delay can precede the first descendant style calculation.
    let previousPaint: string | null = null;
    let stableFrames = 0;
    let transitions: string[] = [];
    for (let frame = 0; frame < 60; frame += 1) {
      const paint = JSON.stringify([root, ...root.querySelectorAll("*")].map((node) => {
        const style = getComputedStyle(node);
        return [style.color, style.backgroundColor, style.fill, style.stroke, style.opacity, style.display, style.visibility, style.maskImage];
      }));
      transitions = root.getAnimations({ subtree: true })
        .filter((animation): animation is CSSTransition => animation instanceof CSSTransition && (animation.pending || animation.playState === "running"))
        .map((animation) => animation.transitionProperty);
      stableFrames = transitions.length === 0 && paint === previousPaint ? stableFrames + 1 : 0;
      // Settle on lifecycle and stable paint, never on the expected ink. A
      // persistent wrong color still reaches the strict assertions below.
      if (stableFrames >= 2) return;
      previousPaint = paint;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    throw new Error(`Rendered paint did not settle within 60 frames; active transitions: ${transitions.join(", ") || "none"}`);
  });
}

async function assertControlMark(page: Page, selector: string, label: string): Promise<void> {
  await renderedState(page, selector);
  const paint = await page.locator(selector).evaluate((tab) => {
    const mark = tab.querySelector(".hraness-provider-mark");
    if (mark === null) throw new Error("Missing control provider mark.");
    const glyph = mark.querySelector(".hraness-provider-mark__glyph");
    const monogram = mark.querySelector(".hraness-provider-mark__monogram");
    const glyphAncestors: { node: string; opacity: string }[] = [];
    const backgrounds: string[] = [];
    for (let ancestor: Element | null = tab; ancestor !== null; ancestor = ancestor.parentElement) backgrounds.push(getComputedStyle(ancestor).backgroundColor);
    const canvas = document.querySelector(".system-canvas-probe");
    if (canvas === null) throw new Error("Missing rendered Canvas probe.");
    for (let ancestor: Element | null = glyph; ancestor !== null; ancestor = ancestor.parentElement) {
      glyphAncestors.push({ node: ancestor.tagName, opacity: getComputedStyle(ancestor).opacity });
      if (ancestor === tab) break;
    }
    const glyphPaints = glyph === null ? [] : [...glyph.querySelectorAll("path,polygon,polyline,circle,ellipse,rect,line,use")].flatMap((shape) => {
      // Definition artwork is not directly painted in the selected glyph.
      if (shape.closest("defs,clipPath,mask,pattern,marker,symbol") !== null) return [];
      const style = getComputedStyle(shape);
      return [style.fill, style.stroke].filter((color) => color !== "none" && color !== "rgba(0, 0, 0, 0)");
    });
    return {
      color: getComputedStyle(tab).color,
      fill: getComputedStyle(tab).backgroundColor,
      forced: matchMedia("(forced-colors: active)").matches,
      backgrounds,
      canvas: getComputedStyle(canvas).backgroundColor,
      markColor: getComputedStyle(mark).color,
      glyphColor: glyph === null ? null : getComputedStyle(glyph).color,
      glyphFill: glyph === null ? null : getComputedStyle(glyph).fill,
      glyphPaints,
      glyphAncestors,
      monogramVisible: monogram !== null && getComputedStyle(monogram).display !== "none",
      monogramColor: monogram === null ? null : getComputedStyle(monogram).color,
    };
  });
  assert.equal(paint.markColor, paint.color, `${label}: control mark inherits its label ink`);
  assert(paint.glyphPaints.length > 0 || paint.monogramVisible, `${label}: control mark has visible glyph or monogram artwork`);
  for (const color of paint.glyphPaints) assert.equal(color, paint.color, `${label}: actual SVG artwork uses the paired foreground; ${JSON.stringify(paint)}`);
  if (paint.monogramVisible) assert.equal(paint.monogramColor, paint.color, `${label}: monogram inherits the paired foreground`);
  if (!paint.forced) assert.equal(rgba(paint.fill).alpha, 1, `${label}: authored neutral control pairs keep an opaque fill`);
  const background = backgroundPaint(paint.backgrounds, paint.canvas);
  assert(paletteContrast(paintedHex(paint.color, background), rgbHex(background)) >= 4.5, `${label}: control label remains readable against its actual composited fill`);
  for (const color of paint.glyphPaints) assert(paletteContrast(paintedHex(color, background), rgbHex(background)) >= 4.5, `${label}: rendered glyph remains readable against the actual fill`);
  if (paint.monogramVisible && paint.monogramColor !== null) assert(paletteContrast(paintedHex(paint.monogramColor, background), rgbHex(background)) >= 4.5, `${label}: visible fallback remains readable against the actual fill`);
}

async function assertSelectedMark(page: Page, root: string, label: string): Promise<void> {
  await assertControlMark(page, `${root} [role="tab"][aria-selected="true"]`, label);
}

async function assertControlStates(page: Page, label: string): Promise<void> {
  const selectors = await page.evaluate(() => {
    const selectors: string[] = [];
    for (const root of ["#commands", "#accent", "#mark-inheritance"]) {
      for (const tab of document.querySelectorAll(`${root} [role="tab"]`)) selectors.push(`${root} [role="tab"][data-agent="${tab.getAttribute("data-agent")}"]`);
    }
    for (const root of ["#prompt", "#narrow"]) {
      for (const target of document.querySelectorAll(`${root} [data-agent-target]`)) selectors.push(`${root} [data-agent-target="${target.getAttribute("data-agent-target")}"]`);
    }
    return selectors;
  });
  assert.equal(selectors.length, 18, `${label}: every tab and provider destination participates in the state matrix`);
  for (const selector of selectors) {
    const control = page.locator(selector);
    await page.mouse.move(0, 0);
    await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); });
    await assertControlMark(page, selector, `${label}/${selector}/default`);
    await control.hover();
    await assertControlMark(page, selector, `${label}/${selector}/hover`);
    await page.mouse.move(0, 0);
    await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); });
    await page.keyboard.press("ArrowRight");
    await control.focus();
    await assertControlMark(page, selector, `${label}/${selector}/focus`);
    const focused = await control.evaluate((element) => {
      const style = getComputedStyle(element);
      return { visible: element.matches(":focus-visible"), outline: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) };
    });
    assert(focused.visible && focused.outline !== "none" && focused.width >= 2, `${label}/${selector}: keyboard focus remains visible`);
  }
}

async function assertSolidMarks(page: Page, label: string): Promise<void> {
  await renderedState(page, "#solid-marks");
  const marks = await page.locator("#solid-marks .hraness-provider-mark").evaluateAll((nodes) => nodes.map((mark) => {
    const style = getComputedStyle(mark);
    const glyph = mark.querySelector(".hraness-provider-mark__glyph");
    const monogram = mark.querySelector(".hraness-provider-mark__monogram");
    const paints = glyph === null ? [] : [...glyph.querySelectorAll("path,polygon,polyline,circle,ellipse,rect,line,use")].flatMap((shape) => {
      if (shape.closest("defs,clipPath,mask,pattern,marker,symbol") !== null) return [];
      const shapeStyle = getComputedStyle(shape);
      return [{ color: shapeStyle.fill, opacity: shapeStyle.fillOpacity }, { color: shapeStyle.stroke, opacity: shapeStyle.strokeOpacity }]
        .filter(({ color }) => color !== "none" && color !== "rgba(0, 0, 0, 0)");
    });
    if (monogram !== null && getComputedStyle(monogram).display !== "none") paints.push({ color: getComputedStyle(monogram).color, opacity: getComputedStyle(monogram).opacity });
    return {
      name: mark.getAttribute("aria-label"),
      background: style.backgroundColor,
      image: style.backgroundImage,
      shadow: style.boxShadow,
      opacity: style.opacity,
      glyphOpacity: glyph === null ? "1" : getComputedStyle(glyph).opacity,
      paints,
    };
  }));
  assert.equal(marks.length, 9, `${label}: all messaging, runtime, brand, and midpoint fallback fixtures render`);
  for (const mark of marks) {
    assert.equal(mark.image, "none", `${label}/${mark.name}: solid foreground is paired to the actual opaque base fill`);
    assert.equal(mark.shadow, "none", `${label}/${mark.name}: solid paint has no shadow overlay`);
    assert.equal(mark.opacity, "1", `${label}/${mark.name}: solid marks stay opaque`);
    assert.equal(mark.glyphOpacity, "1", `${label}/${mark.name}: solid glyphs stay opaque`);
    assert(mark.paints.length > 0, `${label}/${mark.name}: solid marks have actual painted artwork or a visible monogram`);
    for (const paint of mark.paints) {
      assert.equal(paint.opacity, "1", `${label}/${mark.name}: visible artwork uses opaque ink`);
      assert(paletteContrast(rgbHex(paint.color), rgbHex(mark.background)) >= 4.5, `${label}/${mark.name}: actual solid glyph or monogram paint is readable against the rendered fill`);
    }
  }
}

try {
  const control = await browser.newBrowserCDPSession();
  try {
    const command: { arguments: string[] } = await control.send("Browser.getBrowserCommandLine");
    const disabled = command.arguments.filter((argument) => argument.startsWith("--disable-features="));
    assert.equal(command.arguments[0], executable, "Chromium actually runs the selected provisioned executable.");
    assert.equal(disabled.length, 1, "Chromium receives one physical disabled-features switch.");
    const features = new Set(disabled[0]?.slice("--disable-features=".length).split(","));
    assert(features.has("PaintHolding") && features.has("MacAppCodeSignClone"), "The physical launch switch disables paint holding and app cloning.");
    assert(command.arguments.includes("--mute-audio"), "The actual browser launch is muted.");
  } finally { await control.detach(); }
  let cases = 0;
  for (const palette of designPalettes) {
    for (const theme of ["light", "dark"] as const) {
      const label = `${palette}/${theme}`;
      const { page, problems } = await open(palette, theme);
      try {
        const paint = await page.evaluate(() => {
          const prompt = document.querySelector("#prompt [data-hraness-agent-setup-prompt]");
          const preview = document.querySelector("#prompt pre");
          const selected = document.querySelector('#commands [role="tab"][aria-selected="true"]');
          if (prompt === null || preview === null || selected === null) throw new Error("Missing agent setup fixture.");
          const selectedStyle = getComputedStyle(selected);
          const previewStyle = getComputedStyle(preview);
          return {
            viewport: document.documentElement.clientWidth,
            width: document.documentElement.scrollWidth,
            previewOverflow: previewStyle.overflowY,
            previewClipped: preview.scrollHeight > preview.clientHeight,
            previewMask: previewStyle.maskImage,
            color: selectedStyle.color,
            fill: selectedStyle.backgroundColor,
            accentSelections: [...document.querySelectorAll('#accent [role="tab"][aria-selected="true"]')].map((node) => ({ color: getComputedStyle(node).color, fill: getComputedStyle(node).backgroundColor })),
            touchTargets: [...prompt.querySelectorAll("button,a,summary")].map((node) => node.getBoundingClientRect().height),
          };
        });
        assert(paint.width <= paint.viewport, `${label}: page fits at phone width`);
        assert.equal(paint.previewOverflow, "hidden", `${label}: collapsed preview never scrolls`);
        assert(paint.previewClipped, `${label}: long prompt has a bounded preview`);
        assert.notEqual(paint.previewMask, "none", `${label}: preview fades before the end`);
        assert(paletteContrast(rgbHex(paint.color), rgbHex(paint.fill)) >= 4.5, `${label}: selected command keeps paired readable ink and fill`);
        for (const selected of paint.accentSelections) assert(paletteContrast(rgbHex(selected.color), rgbHex(selected.fill)) >= 4.5, `${label}: controls keep opaque neutral pairs inside an accent section`);
        assert(paint.touchTargets.every((height) => height >= 44), `${label}: prompt actions have 44px targets`);
        await assertSolidMarks(page, label);
        await assertControlStates(page, `${label}/normal`);

        // Copy keeps all lines and the final newline, even from a clipped preview.
        await page.locator("#prompt").getByRole("button", { name: "Copy setup prompt" }).click();
        await page.waitForFunction(() => document.querySelector("#prompt [data-copy-state]")?.getAttribute("data-copy-state") === "copied");
        assert.equal(await page.evaluate(() => navigator.clipboard.readText()), agentSetupFixturePrompt, `${label}: copy writes the complete exact prompt`);
        assert.equal(await page.locator("#prompt details").getAttribute("open"), null, `${label}: a successful preview copy leaves the disclosure closed`);
        await page.locator("#prompt summary").click();
        assert.equal(await page.locator("#prompt details pre").textContent(), agentSetupFixturePrompt, `${label}: native disclosure exposes the whole source`);

        await page.locator('#commands [role="tab"]').first().focus();
        for (const [key, expected] of [["ArrowRight", "codex"], ["End", "githubcopilot"], ["ArrowRight", "claude"], ["Home", "claude"]] as const) {
          await page.keyboard.press(key);
          assert.equal(await page.locator('#commands [aria-selected="true"]').getAttribute("data-agent"), expected, `${label}: ${key} selects ${expected}`);
          assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("data-agent")), expected, `${label}: tab focus follows selection`);
        }
        for (const root of ["#commands", "#accent", "#mark-inheritance"]) {
          for (const tab of await page.locator(`${root} [role="tab"]`).all()) {
            await tab.click();
            const agent = await tab.getAttribute("data-agent");
            await assertSelectedMark(page, root, `${label}/${agent}`);
          }
        }
        assert.equal(await page.locator('#commands [role="tab"]').count(), 5, `${label}: all five command labels fit the narrow fixture`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `${label}: long command labels do not widen the phone page`);
        await page.locator('#commands [role="tab"]').first().focus();
        await page.keyboard.press("End");
        await page.locator('#commands [role="tabpanel"]:not([hidden])').getByRole("button").click();
        await page.waitForFunction(() => document.querySelector('#commands [role="tabpanel"]:not([hidden]) button')?.getAttribute("data-copy-state") === "copied");
        assert.equal(await page.evaluate(() => navigator.clipboard.readText()), agentSetupFixtureCommands.at(-1)?.command, `${label}: configuration copy preserves the exact selected source`);
        assert.equal(await page.locator('#commands [role="tabpanel"]:not([hidden]) code').getAttribute("data-language"), "json", `${label}: configuration uses shared JSON highlighting`);

        await page.locator("#prompt summary").click();
        if (process.env.AGENT_SETUP_SCREENSHOTS !== undefined && palette === "gruvbox") {
          await mkdir(process.env.AGENT_SETUP_SCREENSHOTS, { recursive: true });
          await page.screenshot({ path: join(process.env.AGENT_SETUP_SCREENSHOTS, `agent-setup-${theme}-375.png`), fullPage: true });
        }

        await page.setViewportSize({ width: 1280, height: 900 });
        const layout = await page.evaluate(() => {
          const positions = (root: string) => {
            const frame = document.querySelector(`${root} .hraness-agent-setup__frame`)?.getBoundingClientRect();
            const rail = document.querySelector(`${root} aside`)?.getBoundingClientRect();
            if (frame === undefined || rail === undefined) throw new Error("Missing prompt layout.");
            return { side: rail.left >= frame.right, below: rail.top >= frame.bottom };
          };
          return { wide: positions("#prompt"), narrow: positions("#narrow"), below: positions("#below") };
        });
        assert(layout.below.below, `${label}: below placement keeps actions under a wide prompt`);
        assert(layout.wide.side, `${label}: target rail sits beside a wide prompt`);
        assert(layout.narrow.below, `${label}: target rail stacks in a narrow container on a wide screen`);
        if (process.env.AGENT_SETUP_SCREENSHOTS !== undefined && palette === "gruvbox") {
          await mkdir(process.env.AGENT_SETUP_SCREENSHOTS, { recursive: true });
          await page.screenshot({ path: join(process.env.AGENT_SETUP_SCREENSHOTS, `agent-setup-${theme}-1280.png`), fullPage: true });
        }

        for (const [width, columns] of [[1280, 3], [375, 2], [280, 1]] as const) {
          await page.setViewportSize({ width, height: 900 });
          const grid = await page.locator("#below aside ul").evaluate((list) => ({
            columns: getComputedStyle(list).gridTemplateColumns.split(" ").length,
            width: document.documentElement.scrollWidth,
            viewport: document.documentElement.clientWidth,
          }));
          assert.equal(grid.columns, columns, `${label}: below actions use ${columns} columns at ${width}px`);
          assert(grid.width <= grid.viewport, `${label}: below actions fit at ${width}px`);
        }
        await page.setViewportSize({ width: 1280, height: 900 });

        await page.emulateMedia({ forcedColors: "active" });
        await page.waitForFunction(() => document.querySelector("#narrow details")?.hasAttribute("open"));
        await renderedState(page);
        const forced = await page.evaluate(() => {
          const selected = document.querySelector('#commands [role="tab"][aria-selected="true"]');
          const probe = document.querySelector(".system-selection-probe");
          if (selected === null || probe === null) throw new Error("Missing forced-color selection.");
          const style = getComputedStyle(selected);
          const system = getComputedStyle(probe);
          return { color: style.color, fill: style.backgroundColor, systemColor: system.color, systemFill: system.backgroundColor, masks: [...document.querySelectorAll("pre")].map((pre) => getComputedStyle(pre).maskImage) };
        });
        assert.equal(forced.color, forced.systemColor, `${label}: forced selected label uses HighlightText`);
        assert.equal(forced.fill, forced.systemFill, `${label}: forced selected fill uses Highlight`);
        assert(forced.masks.every((mask) => mask === "none"), `${label}: forced colors remove fading`);
        const fullHeight = await page.locator("#narrow details").evaluate((details) => details.closest(".hraness-agent-setup__frame")?.getBoundingClientRect().height ?? 0);
        await page.locator("#narrow summary").click();
        await page.waitForFunction(() => !document.querySelector("#narrow details")?.hasAttribute("open"));
        assert.equal(await page.locator("#narrow details pre").isVisible(), false, `${label}: forced-color disclosure really collapses`);
        assert(await page.locator("#narrow .hraness-agent-setup__frame").evaluate((frame) => frame.getBoundingClientRect().height) < fullHeight, `${label}: collapsed forced-color prompt returns to its bounded preview`);
        await page.locator("#narrow summary").focus();
        await page.keyboard.press("Space");
        await page.waitForFunction(() => document.querySelector("#narrow details")?.hasAttribute("open"));
        assert.equal(await page.locator("#narrow details pre").textContent(), agentSetupFixturePrompt, `${label}: forced-color keyboard disclosure restores the selectable complete source`);
        for (const root of ["#commands", "#accent", "#mark-inheritance"]) {
          for (const tab of await page.locator(`${root} [role="tab"]`).all()) {
            await tab.click();
            await assertSelectedMark(page, root, `${label}/forced/${await tab.getAttribute("data-agent")}`);
          }
        }
        await assertControlStates(page, `${label}/forced`);
        assert.deepEqual(problems, [], `${label}: browser and hydration are clean`);
        cases += 1;
      } finally { await page.context().close(); }
    }
  }

  for (const source of [agentSetupFixturePrompt, agentSetupFixturePrompt.replace(/\n/gu, "\r\n")]) {
    const legacy = await open("paper", "light", {}, source);
    try {
      const destinations: string[] = [];
      await legacy.page.context().route("https://agent.example/**", async (route) => {
        destinations.push(route.request().url());
        await route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Agent</title>" });
      });
      await legacy.page.evaluate(() => {
        const read = navigator.clipboard.readText.bind(navigator.clipboard);
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: { readText: read, writeText: () => new Promise<void>((_resolve, reject) => {
          Object.defineProperty(window, "__denyModernCopy", { configurable: true, value: () => { reject(new Error("Use native legacy copying.")); } });
        }) } });
      });
      const popupPromise = legacy.page.waitForEvent("popup");
      await legacy.page.locator('#prompt [data-agent-target="chatgpt"]').click();
      const popup = await popupPromise;
      try {
        assert.equal(popup.url(), "about:blank", "Native legacy handoff waits in its isolated reservation.");
        assert.deepEqual(destinations, [], "No destination is requested while native copy is pending.");
        const destination = popup.waitForURL("https://agent.example/chatgpt");
        await legacy.page.evaluate(() => { (window as unknown as { __denyModernCopy(): void }).__denyModernCopy(); });
        await destination;
        await legacy.page.bringToFront();
        assert.equal(await legacy.page.evaluate(() => navigator.clipboard.readText()), source, "Native legacy copy-and-open preserves every original byte, including LF or CRLF final newline.");
        assert.equal(await legacy.page.locator("#prompt [data-copy-state]").first().getAttribute("data-copy-state"), "copied", "Native success precedes provider navigation.");
        assert.equal(await legacy.page.locator("[data-hraness-copy-buffer]").count(), 0, "Native copying removes its temporary textarea.");
        assert.equal(await legacy.page.evaluate(() => document.activeElement?.getAttribute("data-agent-target")), "chatgpt", "Native success restores the original destination focus.");
        assert.deepEqual(destinations, ["https://agent.example/chatgpt"]);
        assert.deepEqual(legacy.problems, []);
      } finally { if (!popup.isClosed()) await popup.close(); }
    } finally { await legacy.page.context().close(); }
  }

  const denied = await open("paper", "light");
  try {
    const destinations: string[] = [];
    await denied.page.context().route("https://agent.example/**", async (route) => {
      destinations.push(route.request().url());
      await route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Agent</title>" });
    });
    await denied.page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => new Promise<void>((_resolve, reject) => {
        Object.defineProperty(window, "__failAgentSetupCopy", { configurable: true, value: () => { reject(new Error("Clipboard denied.")); } });
      }) } });
      Object.defineProperty(document, "execCommand", { configurable: true, value: () => false });
    });
    const popupPromise = denied.page.waitForEvent("popup");
    await denied.page.locator('#prompt [data-agent-target="chatgpt"]').click();
    const popup = await popupPromise;
    try {
      assert.equal(popup.url(), "about:blank", "Copy-and-open reserves a blank tab while the copy is pending.");
      assert.equal(await popup.evaluate(() => window.opener), null, "The reservation loses its opener before clipboard work yields.");
      assert.deepEqual(destinations, [], "Pending clipboard work never opens the provider.");
      const closed = popup.waitForEvent("close");
      await denied.page.evaluate(() => { (window as unknown as { __failAgentSetupCopy(): void }).__failAgentSetupCopy(); });
      await closed;
      await denied.page.waitForFunction(() => document.querySelector("#prompt [data-copy-state]")?.getAttribute("data-copy-state") === "failed");
      assert(await denied.page.locator("#prompt details pre").isVisible(), "Copy failure exposes the complete prompt for manual copying.");
      const selected = await denied.page.evaluate(() => {
        const source = document.querySelector("#prompt details pre");
        const selection = window.getSelection();
        const range = selection?.rangeCount === 1 ? selection.getRangeAt(0) : null;
        if (source === null || range === null) throw new Error("Missing complete manual-copy selection.");
        const before = document.createRange();
        before.selectNodeContents(source);
        before.setEnd(range.startContainer, range.startOffset);
        const after = document.createRange();
        after.selectNodeContents(source);
        after.setStart(range.endContainer, range.endOffset);
        return {
          raw: range.cloneContents().textContent,
          source: source.textContent,
          contained: source.contains(range.startContainer) && source.contains(range.endContainer),
          before: before.cloneContents().textContent,
          after: after.cloneContents().textContent,
          renderedLength: selection?.toString().length,
        };
      });
      assert(selected.raw !== null, "Manual selection contains the complete source text.");
      assert.equal(selected.source, agentSetupFixturePrompt, "Copy failure exposes the full exact source including its final newline.");
      assert.equal(selected.raw, agentSetupFixturePrompt, "Copy failure selects the complete DOM source including its final newline.");
      assert(selected.contained && selected.before === "" && selected.after === "", "The selection endpoints cover the entire source and stay inside its pre.");
      if (selected.renderedLength !== selected.raw.length) console.log(`Manual selection: complete DOM range=${selected.raw.length} characters; rendered Selection text=${selected.renderedLength} characters.`);
      assert.match(await denied.page.locator('#prompt [role="status"]').textContent() ?? "", /^Copy failed\./u, "A provider link never reports copied when clipboard and fallback fail.");
      assert.equal(denied.page.url(), "https://agent-setup.test/", "Copy failure keeps the user on the setup page.");
      assert.deepEqual(destinations, [], "Denied clipboard access never requests the provider destination.");
      assert.equal(denied.page.context().pages().length, 1, "Copy failure closes the owned blank tab.");
      assert.deepEqual(denied.problems, []);
    } finally { if (!popup.isClosed()) await popup.close(); }
  } finally { await denied.page.context().close(); }

  const handoff = await open("paper", "light");
  try {
    await handoff.page.evaluate(() => {
      const write = navigator.clipboard.writeText.bind(navigator.clipboard);
      const read = navigator.clipboard.readText.bind(navigator.clipboard);
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { readText: read, writeText: (text: string) => {
        const writing = write(text);
        return new Promise<void>((resolve, reject) => {
          Object.defineProperty(window, "__completeAgentSetupCopy", { configurable: true, value: () => { void writing.then(resolve, reject); } });
        });
      } } });
    });
    const popupPromise = handoff.page.waitForEvent("popup");
    await handoff.page.locator('#prompt [data-agent-target="chatgpt"]').click();
    const popup = await popupPromise;
    try {
      assert.equal(popup.url(), "about:blank", "A successful handoff also waits for clipboard completion before provider navigation.");
      assert.equal(await popup.evaluate(() => window.opener), null, "Successful handoff reserves an isolated tab.");
      const destination = popup.waitForURL("https://agent.example/chatgpt");
      await handoff.page.evaluate(() => { (window as unknown as { __completeAgentSetupCopy(): void }).__completeAgentSetupCopy(); });
      await destination;
      await handoff.page.bringToFront();
      assert.equal(await handoff.page.evaluate(() => navigator.clipboard.readText()), agentSetupFixturePrompt, "The provider opens only after the complete exact prompt reaches the clipboard.");
      assert.equal(await handoff.page.locator("#prompt [data-copy-state]").first().getAttribute("data-copy-state"), "copied", "Successful handoff announces the copied prompt.");
      assert.deepEqual(handoff.problems, []);
    } finally { await popup.close(); }
  } finally { await handoff.page.context().close(); }

  const noScript = await open("paper", "light", { javaScriptEnabled: false });
  try {
    const commands = await noScript.page.locator('#commands [role="tabpanel"]').evaluateAll((panels) => panels.map((panel) => ({ display: getComputedStyle(panel).display, command: panel.querySelector("code")?.textContent })));
    assert(commands.every((command) => command.display !== "none"), "Every command is accessible without JavaScript.");
    assert.deepEqual(commands.map((command) => command.command), agentSetupFixtureCommands.map((command) => command.command));
    await noScript.page.locator("#prompt summary").click();
    assert(await noScript.page.locator("#prompt details pre").isVisible(), "The full prompt is expandable without JavaScript.");
    const popupPromise = noScript.page.waitForEvent("popup");
    await noScript.page.locator('#prompt [data-agent-target="chatgpt"]').click();
    const popup = await popupPromise;
    try { await popup.waitForURL("https://agent.example/chatgpt"); }
    finally { await popup.close(); }
    assert.deepEqual(noScript.problems, []);
  } finally { await noScript.page.context().close(); }
  assert.equal(cases, designPalettes.length * 2);
  console.log("Agent setup browser checks passed: physical pinned browser flags, exact prompt and command copy, copy-before-open success and failure, native disclosure and tab keyboard behavior, five-agent phone and container layouts, 44px actions, readable selected labels and actual glyphs across every palette and mode, forced colors, no-script access, and clean hydration.");
} finally {
  await Promise.allSettled(contexts.map((context) => context.close()));
  await browser.close();
}

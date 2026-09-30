import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium, type BrowserContextOptions, type Page } from "playwright-core";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { AgentSetupFixture, agentSetupFixtureCommands, agentSetupFixturePrompt } from "../gallery/agent-setup-fixture.js";
import type * as AgentSetup from "../src/react/agent-setup-prompt.js";
import { paletteContrast } from "../src/palette-color.js";
import { designPalettes, type DesignPalette } from "../src/palettes.js";
import { provisionedBrowserExecutable, verificationBrowserArguments } from "./browser-executable.js";
import { bundleBrowserStylesheet } from "./browser-stylesheet.js";

const repository = resolve(import.meta.dir, "..");
const entryModule = join(repository, "dist/react/index.js");
const api = await import(entryModule) as Pick<typeof AgentSetup, "AgentSetupPrompt" | "AgentCommandTabs">;
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
hydrateRoot(document.getElementById("root"), createElement(AgentSetupFixture, { api }));
requestAnimationFrame(() => requestAnimationFrame(() => { document.documentElement.dataset.ready = "true"; }));
`);
  const bundle = await Bun.build({ entrypoints: [entry], define: { "process.env.NODE_ENV": '"production"' }, format: "esm", minify: true, target: "browser" });
  assert(bundle.success, bundle.logs.map(String).join("\n"));
  const output = bundle.outputs[0];
  assert(output, "Agent setup browser fixture must emit one script.");
  script = await output.text();
} finally { await rm(workspace, { recursive: true, force: true }); }

const pageCss = "body { margin: 0; background: var(--background); color: var(--foreground); } main { display: grid; gap: 2rem; padding: 16px; max-inline-size: 72rem; margin-inline: auto; } .fixture-narrow { inline-size: min(100%, 20rem); } .fixture-accent { --hraness-marketing-ink: var(--primary-foreground); --hraness-marketing-background: var(--primary); --hraness-marketing-surface: var(--primary); padding: 1rem; background: var(--primary); color: var(--primary-foreground); } .system-selection-probe { position: absolute; visibility: hidden; forced-color-adjust: none; color: HighlightText; background-color: Highlight; }";
const documentFor = (palette: DesignPalette, theme: "light" | "dark") => `<!doctype html><html lang="en" data-palette="${palette}" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent setup</title><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/page.css"><script type="module" src="/app.js"></script></head><body><div id="root">${markup}</div><span class="system-selection-probe"></span></body></html>`;
const browser = await chromium.launch({ args: verificationBrowserArguments(), executablePath: await provisionedBrowserExecutable() });
const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = [];

function rgbHex(color: string): string {
  const match = color.match(/^rgb\((\d+), (\d+), (\d+)\)$/u);
  assert(match, `Expected opaque sRGB, received ${color}`);
  return `#${match.slice(1).map((channel) => Number(channel).toString(16).padStart(2, "0")).join("")}`;
}

async function open(palette: DesignPalette, theme: "light" | "dark", options: BrowserContextOptions = {}): Promise<{ page: Page; problems: string[] }> {
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
    else if (pathname === "/") await route.fulfill({ contentType: "text/html", body: documentFor(palette, theme) });
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

async function assertSelectedMark(page: Page, root: string, label: string): Promise<void> {
  const paint = await page.locator(`${root} [role="tab"][aria-selected="true"]`).evaluate((tab) => {
    const mark = tab.querySelector(".hraness-provider-mark");
    if (mark === null) throw new Error("Missing selected provider mark.");
    const glyph = mark.querySelector(".hraness-provider-mark__glyph");
    const monogram = mark.querySelector(".hraness-provider-mark__monogram");
    const glyphPaints = glyph === null ? [] : [...glyph.querySelectorAll("path,polygon,polyline,circle,ellipse,rect,line,use")].flatMap((shape) => {
      const style = getComputedStyle(shape);
      return [style.fill, style.stroke].filter((color) => color !== "none" && color !== "rgba(0, 0, 0, 0)");
    });
    return {
      color: getComputedStyle(tab).color,
      fill: getComputedStyle(tab).backgroundColor,
      markColor: getComputedStyle(mark).color,
      glyphPaints,
      monogramVisible: monogram !== null && getComputedStyle(monogram).display !== "none",
      monogramColor: monogram === null ? null : getComputedStyle(monogram).color,
    };
  });
  assert.equal(paint.markColor, paint.color, `${label}: selected mark inherits the selected label ink`);
  assert(paint.glyphPaints.length > 0 || paint.monogramVisible, `${label}: selected mark has visible glyph or monogram artwork`);
  for (const color of paint.glyphPaints) assert.equal(color, paint.color, `${label}: actual selected SVG artwork uses the paired foreground`);
  if (paint.monogramVisible) assert.equal(paint.monogramColor, paint.color, `${label}: selected monogram inherits the paired foreground`);
  if (await page.evaluate(() => !matchMedia("(forced-colors: active)").matches)) {
    assert(paletteContrast(rgbHex(paint.markColor), rgbHex(paint.fill)) >= 4.5, `${label}: selected mark remains readable against the actual tab fill`);
  }
}

try {
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
          return { wide: positions("#prompt"), narrow: positions("#narrow") };
        });
        assert(layout.wide.side, `${label}: target rail sits beside a wide prompt`);
        assert(layout.narrow.below, `${label}: target rail stacks in a narrow container on a wide screen`);
        if (process.env.AGENT_SETUP_SCREENSHOTS !== undefined && palette === "gruvbox") {
          await mkdir(process.env.AGENT_SETUP_SCREENSHOTS, { recursive: true });
          await page.screenshot({ path: join(process.env.AGENT_SETUP_SCREENSHOTS, `agent-setup-${theme}-1280.png`), fullPage: true });
        }

        await page.emulateMedia({ forcedColors: "active" });
        await page.waitForFunction(() => document.querySelector("#narrow details")?.hasAttribute("open"));
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
        assert.deepEqual(problems, [], `${label}: browser and hydration are clean`);
        cases += 1;
      } finally { await page.context().close(); }
    }
  }

  const denied = await open("paper", "light");
  try {
    await denied.page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Clipboard denied."); } } });
      Object.defineProperty(document, "execCommand", { configurable: true, value: () => false });
    });
    const popupPromise = denied.page.waitForEvent("popup");
    await denied.page.locator('#prompt [data-agent-target="chatgpt"]').click();
    const popup = await popupPromise;
    try {
      await denied.page.waitForFunction(() => document.querySelector("#prompt [data-copy-state]")?.getAttribute("data-copy-state") === "failed");
      assert(await denied.page.locator("#prompt details pre").isVisible(), "Copy failure exposes the complete prompt for manual copying.");
      assert.equal(await denied.page.evaluate(() => window.getSelection()?.toString()), agentSetupFixturePrompt, "Copy failure selects the full original prompt.");
      assert.match(await denied.page.locator('#prompt [role="status"]').textContent() ?? "", /^Copy failed\./u, "A provider link never reports copied when clipboard and fallback fail.");
      assert.deepEqual(denied.problems, []);
    } finally { await popup.close(); }
  } finally { await denied.page.context().close(); }

  const noScript = await open("paper", "light", { javaScriptEnabled: false });
  try {
    const commands = await noScript.page.locator('#commands [role="tabpanel"]').evaluateAll((panels) => panels.map((panel) => ({ display: getComputedStyle(panel).display, command: panel.querySelector("code")?.textContent })));
    assert(commands.every((command) => command.display !== "none"), "Every command is accessible without JavaScript.");
    assert.deepEqual(commands.map((command) => command.command), agentSetupFixtureCommands.map((command) => command.command));
    await noScript.page.locator("#prompt summary").click();
    assert(await noScript.page.locator("#prompt details pre").isVisible(), "The full prompt is expandable without JavaScript.");
    assert.deepEqual(noScript.problems, []);
  } finally { await noScript.page.context().close(); }
  assert.equal(cases, designPalettes.length * 2);
  console.log("Agent setup browser checks passed: exact prompt and command copy, native disclosure and tab keyboard behavior, five-agent phone and container layouts, 44px actions, readable selected labels and actual glyphs across every palette and mode, forced colors, no-script access, and clean hydration.");
} finally {
  await Promise.allSettled(contexts.map((context) => context.close()));
  await browser.close();
}

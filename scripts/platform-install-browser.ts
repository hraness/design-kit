import { provisionedBrowserExecutable, verificationBrowserArguments } from "./browser-executable.js";
// Browser gate for PlatformInstall: the built client entry hydrates under a
// strict content policy (no inline script or style), selects the visitor's
// operating system, moves between tabs with the keyboard, copies the exact
// command, keeps phone layouts free of page-level sideways scroll, and shows
// every command with JavaScript disabled. At 320 and 360px, including inside
// a padded card, all three tabs fit inside the tab row without sideways
// scrolling or truncated names.
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium, type BrowserContextOptions, type Page } from "playwright-core";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { bundleBrowserStylesheet } from "./browser-stylesheet.js";

const repository = resolve(import.meta.dir, "..");
const executable = provisionedBrowserExecutable;

const longCommand = "curl --proto '=https' --tlsv1.2 -fsSL https://relay.example/releases/download/v1.2.3/install.sh | sh -s -- --prefix \"$HOME/.local\" --no-modify-path";
const props = {
  id: "fixture",
  platforms: [
    { id: "macos", command: "brew install relay", shell: "Terminal", note: "Apple silicon", alternatives: [{ label: "npm", command: "npm install --global relay" }] },
    { id: "linux", command: longCommand, shell: "Terminal", note: "x86_64 and ARM64, glibc 2.34+" },
    { id: "windows", command: "irm https://relay.example/install.ps1 | iex", shell: "PowerShell" },
  ],
} as const;

const entryModule = join(repository, "dist/react/platform-install.js");
const { PlatformInstall } = await import(entryModule);
const markup = renderToString(createElement(PlatformInstall, props));
// Inside node_modules so the fixture entry resolves the installed React.
const workspace = await mkdtemp(join(repository, "node_modules", ".platform-install-"));
let script: string;
try {
  const entry = join(workspace, "entry.js");
  await writeFile(entry, `import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { PlatformInstall } from ${JSON.stringify(entryModule)};
hydrateRoot(document.getElementById("root"), createElement(PlatformInstall, ${JSON.stringify(props)}));
document.documentElement.dataset.hydrated = "";
`);
  const bundle = await Bun.build({
    entrypoints: [entry],
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    format: "esm",
    minify: true,
    target: "browser",
  });
  assert(bundle.success, `The client fixture must bundle: ${bundle.logs.join("\n")}`);
  const output = bundle.outputs[0];
  assert(output, "The client fixture must emit one file");
  script = await output.text();
} finally {
  await rm(workspace, { force: true, recursive: true });
}
const stylesheet = await bundleBrowserStylesheet(join(repository, "src/styles.css"), repository);
const policy = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'";
const documentFor = (theme: string) => `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Install</title><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/page.css"><script type="module" src="/app.js"></script></head><body><main><div id="root">${markup}</div></main></body></html>`;
const pageCss = "body { margin: 0; background: var(--background); color: var(--foreground); } main { padding: 16px; max-inline-size: 48rem; margin-inline: auto; } html[data-card] #root { padding: 16px; border: 1px solid; border-radius: 12px; }";

const browser = await chromium.launch({ args: verificationBrowserArguments(), executablePath: await executable() });
type OpenOptions = { width?: number; theme?: string; platform?: string; javaScriptEnabled?: boolean; colorScheme?: "light" | "dark"; card?: boolean };
async function open(options: OpenOptions = {}): Promise<Page> {
  const contextOptions: BrowserContextOptions = {
    colorScheme: options.colorScheme ?? "light",
    javaScriptEnabled: options.javaScriptEnabled ?? true,
    viewport: { width: options.width ?? 1024, height: 800 },
  };
  const context = await browser.newContext(contextOptions);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "https://install.test" });
  if (options.platform !== undefined) {
    await context.addInitScript((platform) => {
      Object.defineProperty(Navigator.prototype, "userAgentData", { configurable: true, get: () => ({ platform }) });
    }, options.platform);
  }
  const page = await context.newPage();
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  // Webfonts and the favicon are not served here; their 404s are expected.
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) problems.push(message.text());
  });
  (page as unknown as { problems: string[] }).problems = problems;
  const html = documentFor(options.theme ?? "light").replace("<html ", options.card === true ? "<html data-card ": "<html ");
  await page.route("**/*", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/") return route.fulfill({ contentType: "text/html", headers: { "content-security-policy": policy }, body: html });
    if (path === "/app.js") return route.fulfill({ contentType: "text/javascript", body: script });
    if (path === "/styles.css") return route.fulfill({ contentType: "text/css", body: stylesheet });
    if (path === "/page.css") return route.fulfill({ contentType: "text/css", body: pageCss });
    return route.fulfill({ status: 404, body: "" });
  });
  await page.goto("https://install.test/");
  if (contextOptions.javaScriptEnabled) await page.waitForSelector("html[data-hydrated]");
  return page;
}
const problemsOf = (page: Page) => (page as unknown as { problems: string[] }).problems;
const selected = (page: Page) => page.locator('[role="tab"][aria-selected="true"]').getAttribute("data-platform");

try {
  // Detection selects the visitor's platform after hydration.
  for (const [platform, expected] of [["Windows", "windows"], ["Linux", "linux"], ["macOS", "macos"], ["Android", "macos"]] as const) {
    const page = await open({ platform });
    await page.waitForFunction((value) => document.querySelector('[role="tab"][aria-selected="true"]')?.getAttribute("data-platform") === value, expected);
    const visible = await page.locator('[role="tabpanel"]:visible').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-platform")));
    assert.deepEqual(visible, [expected], `${platform}: only the detected panel shows`);
    assert.deepEqual(problemsOf(page), [], `${platform}: hydration runs under the strict policy without errors`);
    await page.context().close();
  }

  // Keyboard: roving focus with arrows, Home, and End.
  {
    const page = await open({ platform: "macOS" });
    await page.locator('[role="tab"][aria-selected="true"]').focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await selected(page), "linux");
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("data-platform")), "linux", "focus follows selection");
    await page.keyboard.press("End");
    assert.equal(await selected(page), "windows");
    await page.keyboard.press("ArrowRight");
    assert.equal(await selected(page), "macos", "arrows wrap");
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement?.closest('[role="tabpanel"]')?.getAttribute("data-platform")), "macos", "Tab leaves the tab row for the selected panel");

    // Copy writes the exact command and announces it.
    await page.locator('[data-platform="macos"] .hraness-platform-install__copy').first().click();
    await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent === "Copied the macOS install command.");
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "brew install relay");
    assert.match(await page.locator('[data-platform="macos"] .hraness-platform-install__copy').first().innerText(), /Copied/u);
    await page.locator('[data-platform="macos"] .hraness-platform-install__copy').nth(1).click();
    await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent === "Copied the macOS npm command.");
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "npm install --global relay");
    await page.waitForFunction(() => document.querySelector('[role="status"]')?.textContent === "", undefined, { timeout: 4000 });
    assert.deepEqual(problemsOf(page), []);
    await page.context().close();
  }

  // Phone width: no page-level sideways scroll; long commands scroll inside their box.
  for (const colorScheme of ["light", "dark"] as const) {
    const page = await open({ platform: "Linux", width: 360, colorScheme, theme: colorScheme });
    const layout = await page.evaluate(() => {
      const pre = document.querySelector('[role="tabpanel"][data-platform="linux"] pre');
      const root = document.querySelector("[data-hraness-platform-install]");
      return {
        page: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        root: root?.getBoundingClientRect().right ?? Infinity,
        preScroll: pre?.scrollWidth ?? 0,
        preClient: pre?.clientWidth ?? 0,
        preOverflow: pre === null ? "" : getComputedStyle(pre).overflowX,
        ink: root === null ? "" : getComputedStyle(root).color,
        tabBackground: getComputedStyle(document.querySelector('[role="tab"][aria-selected="true"]') as Element).backgroundColor,
      };
    });
    assert(layout.page <= layout.viewport, `${colorScheme}: the page must not scroll sideways (${layout.page} > ${layout.viewport})`);
    assert(layout.root <= layout.viewport, `${colorScheme}: the component stays inside the viewport`);
    assert(layout.preScroll > layout.preClient, `${colorScheme}: the long command scrolls inside its box`);
    assert.equal(layout.preOverflow, "auto");
    if (process.env.PLATFORM_INSTALL_SCREENSHOTS !== undefined) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(process.env.PLATFORM_INSTALL_SCREENSHOTS, `platform-install-360-${colorScheme}.png`), fullPage: true });
    }
    await page.context().close();
  }

  // Narrow columns: every tab sits fully inside the tab row, the row does not
  // scroll sideways, and no platform name is truncated, in light and dark,
  // directly in the page gutter and inside a padded card.
  for (const width of [320, 360] as const) {
    for (const colorScheme of ["light", "dark"] as const) {
      for (const card of [false, true]) {
        const page = await open({ platform: "Windows", width, colorScheme, theme: colorScheme, card });
        const layout = await page.evaluate(() => {
          const tablist = document.querySelector('[role="tablist"]') as HTMLElement;
          const row = tablist.getBoundingClientRect();
          return {
            page: document.documentElement.scrollWidth,
            viewport: window.innerWidth,
            row: { left: row.left, right: row.right, top: row.top, bottom: row.bottom },
            rowScroll: tablist.scrollWidth,
            rowClient: tablist.clientWidth,
            tabs: [...tablist.querySelectorAll('[role="tab"]')].map((tab) => {
              const box = tab.getBoundingClientRect();
              const label = tab.querySelector(".hraness-platform-install__tab-label") as HTMLElement;
              return {
                platform: tab.getAttribute("data-platform"),
                left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width,
                labelScroll: label.scrollWidth, labelClient: label.clientWidth,
                // The mark is drawn from the component's shared symbol.
                mark: (tab.querySelector("svg use") as SVGGraphicsElement | null)?.getBBox().width ?? 0,
              };
            }),
          };
        });
        const where = `${width}px ${colorScheme}${card ? " card" : ""}`;
        assert(layout.page <= layout.viewport, `${where}: the page must not scroll sideways`);
        assert.deepEqual(layout.tabs.map((tab) => tab.platform), ["macos", "linux", "windows"], `${where}: three tabs`);
        assert(layout.rowScroll <= layout.rowClient, `${where}: the tab row must not scroll sideways (${layout.rowScroll} > ${layout.rowClient})`);
        for (const tab of layout.tabs) {
          assert(tab.width > 0, `${where}: the ${tab.platform} tab renders`);
          assert(tab.mark > 0, `${where}: the ${tab.platform} mark draws from its symbol`);
          assert(tab.left >= layout.row.left - 0.5 && tab.right <= layout.row.right + 0.5 && tab.top >= layout.row.top - 0.5 && tab.bottom <= layout.row.bottom + 0.5,
            `${where}: the ${tab.platform} tab sits inside the tab row (${JSON.stringify(tab)} in ${JSON.stringify(layout.row)})`);
          assert(tab.labelScroll <= tab.labelClient, `${where}: the ${tab.platform} name is not truncated (${tab.labelScroll} > ${tab.labelClient})`);
        }
        assert.equal(await selected(page), "windows", `${where}: the detected Windows tab is selected`);
        if (process.env.PLATFORM_INSTALL_SCREENSHOTS !== undefined) {
          await page.waitForTimeout(300);
          await page.screenshot({ path: join(process.env.PLATFORM_INSTALL_SCREENSHOTS, `platform-install-${width}-${colorScheme}${card ? "-card" : ""}.png`) });
        }
        assert.deepEqual(problemsOf(page), [], `${where}: no errors`);
        await page.context().close();
      }
    }
  }

  // Without JavaScript: tabs and copy buttons hide; every panel shows under its label.
  {
    const page = await open({ javaScriptEnabled: false });
    const state = await page.evaluate(() => ({
      tablist: getComputedStyle(document.querySelector('[role="tablist"]') as Element).display,
      panels: [...document.querySelectorAll('[role="tabpanel"]')].map((node) => getComputedStyle(node).display),
      labels: [...document.querySelectorAll(".hraness-platform-install__panel-label")].map((node) => getComputedStyle(node).display),
      copies: [...document.querySelectorAll(".hraness-platform-install__copy")].map((node) => getComputedStyle(node).display),
    }));
    assert.equal(state.tablist, "none", "no-script: the tab row hides");
    assert.deepEqual(state.panels, ["block", "block", "block"], "no-script: every panel shows");
    assert.deepEqual(state.labels, ["flex", "flex", "flex"], "no-script: each panel names its platform");
    assert(state.copies.every((display) => display === "none"), "no-script: copy buttons hide");
    if (process.env.PLATFORM_INSTALL_SCREENSHOTS !== undefined) {
      await page.screenshot({ path: join(process.env.PLATFORM_INSTALL_SCREENSHOTS, "platform-install-noscript.png"), fullPage: true });
    }
    await page.context().close();
  }
  console.log("PlatformInstall browser gate passed");
} finally {
  await browser.close();
}

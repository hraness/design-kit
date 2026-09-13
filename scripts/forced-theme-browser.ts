import assert from "node:assert/strict";
import type { Browser, ElementHandle, Page } from "playwright-core";

import { builtDesignKit } from "./built-root.js";
import { themeColorSyncActiveAttribute } from "../src/react/theme-color-sync.js";

const storageKey = "hraness-design-theme-v1";
type ConcreteTheme = "light" | "dark";
type SavedTheme = ConcreteTheme | "system";
const scenarios: readonly { saved: SavedTheme; forced: ConcreteTheme; os: ConcreteTheme }[] = [
  { saved: "light", forced: "dark", os: "dark" },
  { saved: "dark", forced: "light", os: "light" },
  { saved: "system", forced: "dark", os: "light" },
  { saved: "system", forced: "light", os: "dark" },
  { saved: "system", forced: "dark", os: "dark" },
  { saved: "system", forced: "light", os: "light" },
];

function rgb(hex: string): string {
  assert.match(hex, /^#[\da-f]{6}$/iu);
  return `rgb(${[1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).join(", ")})`;
}

async function requireAppearance(page: Page, saved: SavedTheme, effective: ConcreteTheme,
  forced: ConcreteTheme | "none", nested: ConcreteTheme, os: ConcreteTheme,
  retainedProbe: ElementHandle<HTMLElement | SVGElement>): Promise<void> {
  const expected = builtDesignKit.colors[effective];
  await page.waitForFunction(({ effective, forced, expected, activeAttribute }) => {
    const html = document.documentElement;
    return html.dataset.theme === effective
      && document.querySelector("[data-forced-preference]")?.getAttribute("data-forced-preference") === forced
      && document.querySelector('[data-forced-theme-portal="root"]')?.getAttribute("data-theme") === effective
      && document.querySelector(`meta[${activeAttribute}]`)?.getAttribute("content") === expected;
  }, { effective, forced, expected: expected.background, activeAttribute: themeColorSyncActiveAttribute });
  const state = await page.evaluate(({ key, activeAttribute }) => {
    const portal = document.querySelector('[data-forced-theme-portal="root"]');
    const nested = document.querySelector('[data-forced-theme-portal="nested"]');
    const probe = document.querySelector("[data-forced-preference]");
    if (!portal || !nested || !probe) throw new Error("Missing forced-theme fixture surface.");
    return {
      stored: localStorage.getItem(key), saved: probe.getAttribute("data-saved-preference"),
      resolved: probe.getAttribute("data-resolved-preference"),
      portalAtBody: portal.parentElement === document.body,
      nestedAtBody: nested.parentElement === document.body,
      rootBackground: getComputedStyle(document.body).backgroundColor,
      portalBackground: getComputedStyle(portal).backgroundColor,
      nestedBackground: getComputedStyle(nested).backgroundColor,
      nestedTheme: nested.getAttribute("data-theme"), nestedClass: nested.className,
      activeMetaCount: document.querySelectorAll(`meta[${activeAttribute}]`).length,
      liveMetaCount: document.querySelectorAll('meta[name="theme-color"]:not([media])').length,
      legacyHosts: document.querySelectorAll("jelly-card, .hraness-design-jelly-surface").length,
      legacyRuntime: customElements.get("jelly-card") !== undefined,
      systemDark: matchMedia("(prefers-color-scheme: dark)").matches,
      literalSystemObserved: Reflect.get(window, "__forcedThemeLiteralSystem") as boolean,
    };
  }, { key: storageKey, activeAttribute: themeColorSyncActiveAttribute });
  assert.equal(state.stored, saved, "forcing must not rewrite saved storage");
  assert.equal(state.saved, saved, "forcing must not rewrite the next-themes preference");
  assert.equal(state.resolved, saved === "system" ? os : saved, "saved System resolves to the actual emulated OS without replacing storage");
  assert.equal(state.systemDark, os === "dark", "the fixture uses the specified native OS scheme");
  assert.equal(state.literalSystemObserved, false, "even transient document themes remain concrete");
  assert.equal(await retainedProbe.evaluate((element) => element.isConnected
    && element === document.querySelector("[data-forced-preference]")), true, "forcing and unforcing retain the mounted provider subtree");
  assert.equal(state.portalAtBody, true, "the inherited surface must use a real body portal");
  assert.equal(state.nestedAtBody, true, "the explicit surface must use a real body portal");
  assert.equal(state.rootBackground, rgb(expected.background));
  assert.equal(state.portalBackground, rgb(expected.background));
  assert.equal(state.nestedTheme, nested, "the nearest explicit portal remains authoritative");
  assert.equal(state.nestedClass, "forced-theme-explicit-portal");
  assert.equal(state.nestedBackground, rgb(builtDesignKit.colors[nested].background));
  assert.equal(state.activeMetaCount, 1);
  assert.equal(state.liveMetaCount, 1);
  assert.equal(state.legacyHosts, 0, "Theme changes must use native shared surfaces");
  assert.equal(state.legacyRuntime, false, "ThemeProvider must not register removed Jelly elements");
}

export async function verifyForcedThemeContract(browser: Browser, origin: string): Promise<void> {
  for (const { saved, forced, os } of scenarios) {
    const context = await browser.newContext({ colorScheme: os, serviceWorkers: "block" });
    try {
      const errors: string[] = [];
      await context.route("**/*", (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin === origin && ["GET", "HEAD"].includes(request.method())) return route.continue();
        errors.push(`${request.method()} ${url.origin}${url.pathname}`);
        return route.abort();
      });
      await context.addInitScript(({ key, saved }) => {
        localStorage.setItem(key, saved);
        Reflect.set(window, "__forcedThemeLiteralSystem", false);
        new MutationObserver((records) => {
          if (records.some((record) => record.target === document.documentElement
            && (record.oldValue === "system" || document.documentElement.dataset.theme === "system"))) {
            Reflect.set(window, "__forcedThemeLiteralSystem", true);
          }
        }).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-theme"], attributeOldValue: true });

      }, { key: storageKey, saved });
      const page = await context.newPage();
      page.setDefaultTimeout(10_000);
      page.on("pageerror", (error) => errors.push(error.message));
      assert.equal((await page.goto(`${origin}/?forced-theme=${forced}`, { waitUntil: "load" }))?.status(), 200);
      const retainedProbe = await page.locator("[data-forced-preference]").elementHandle();
      assert.ok(retainedProbe, "The compiled provider exposes its mounted preference probe");
      const nested = forced === "dark" ? "light" : "dark";
      const ordinary = saved === "system" ? os : saved;
      await requireAppearance(page, saved, forced, forced, nested, os, retainedProbe);
      await page.getByRole("button", { name: "Use saved appearance", exact: true }).click();
      await requireAppearance(page, saved, ordinary, "none", nested, os, retainedProbe);
      if (saved === "system") {
        const changedOs = os === "dark" ? "light" : "dark";
        await page.emulateMedia({ colorScheme: changedOs });
        await requireAppearance(page, saved, changedOs, "none", nested, changedOs, retainedProbe);
        await page.emulateMedia({ colorScheme: os });
        await requireAppearance(page, saved, os, "none", nested, os, retainedProbe);
      }
      await page.getByRole("button", { name: "Restore forced appearance", exact: true }).click();
      await requireAppearance(page, saved, forced, forced, nested, os, retainedProbe);
      assert.deepEqual(errors, [], "forced-theme verification must stay local and error-free");
      await retainedProbe.dispose();
      console.log(`Forced-theme native checks passed: saved ${saved}, OS ${os}, forced ${forced}, unforced, restored; mounted identity, concrete document theme, portal, explicit island, browser chrome, storage and absence of legacy runtime.`);
    } finally { await context.close(); }
  }
}

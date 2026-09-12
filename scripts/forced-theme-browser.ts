import assert from "node:assert/strict";
import type { Browser, Page } from "playwright-core";

import { builtDesignKit } from "./built-root.js";
import { themeColorSyncActiveAttribute } from "../src/react/theme-color-sync.js";

const storageKey = "hraness-design-theme-v1";

function rgb(hex: string): string {
  assert.match(hex, /^#[\da-f]{6}$/iu);
  return `rgb(${[1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).join(", ")})`;
}

async function requireAppearance(page: Page, saved: "light" | "dark", effective: "light" | "dark",
  forced: "light" | "dark" | "none", nested: "light" | "dark"): Promise<void> {
  const expected = builtDesignKit.colors[effective];
  await page.waitForFunction(({ effective, forced, expected, activeAttribute }) => {
    const html = document.documentElement;
    return html.dataset.theme === effective && html.dataset.jellyMode === effective
      && html.dataset.jellyEventMode === effective
      && document.querySelector("[data-forced-preference]")?.getAttribute("data-forced-preference") === forced
      && document.querySelector('[data-forced-theme-portal="root"]')?.getAttribute("data-theme") === effective
      && document.querySelector(`meta[${activeAttribute}]`)?.getAttribute("content") === expected;
  }, { effective, forced, expected: expected.background, activeAttribute: themeColorSyncActiveAttribute });
  const state = await page.evaluate(({ key, activeAttribute }) => {
    const portal = document.querySelector('[data-forced-theme-portal="root"]');
    const nested = document.querySelector('[data-forced-theme-portal="nested"]');
    const probe = document.querySelector("[data-forced-preference]");
    const jelly = document.querySelector(".hraness-design-jelly-surface");
    if (!portal || !nested || !probe || !jelly) throw new Error("Missing forced-theme fixture surface.");
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
      jellyDefined: customElements.get(jelly.localName) !== undefined,
      jellyCanvas: jelly.shadowRoot?.querySelector("canvas") !== null && jelly.shadowRoot !== null,
      jellyEvents: Number(document.documentElement.dataset.jellyEventCount),
    };
  }, { key: storageKey, activeAttribute: themeColorSyncActiveAttribute });
  assert.equal(state.stored, saved, "forcing must not rewrite saved storage");
  assert.equal(state.saved, saved, "forcing must not rewrite the next-themes preference");
  assert.equal(state.resolved, saved, "the regression must exercise a distinct saved/resolved preference");
  assert.equal(state.portalAtBody, true, "the inherited surface must use a real body portal");
  assert.equal(state.nestedAtBody, true, "the explicit surface must use a real body portal");
  assert.equal(state.rootBackground, rgb(expected.background));
  assert.equal(state.portalBackground, rgb(expected.background));
  assert.equal(state.nestedTheme, nested, "the nearest explicit portal remains authoritative");
  assert.equal(state.nestedClass, "forced-theme-explicit-portal");
  assert.equal(state.nestedBackground, rgb(builtDesignKit.colors[nested].background));
  assert.equal(state.activeMetaCount, 1);
  assert.equal(state.liveMetaCount, 1);
  assert.equal(state.jellyDefined, true);
  assert.equal(state.jellyCanvas, true, "the real Jelly runtime must upgrade its canvas");
  assert.ok(state.jellyEvents > 0, "the real Jelly theme-change event must reach native surfaces");
}

export async function verifyForcedThemeContract(browser: Browser, origin: string): Promise<void> {
  for (const [saved, forced] of [["light", "dark"], ["dark", "light"]] as const) {
    const context = await browser.newContext({ colorScheme: forced, serviceWorkers: "block" });
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
        window.addEventListener("jelly-theme-change", () => {
          const html = document.documentElement;
          html.dataset.jellyEventMode = html.dataset.jellyMode;
          html.dataset.jellyEventCount = String(Number(html.dataset.jellyEventCount ?? "0") + 1);
        });
      }, { key: storageKey, saved });
      const page = await context.newPage();
      page.setDefaultTimeout(10_000);
      page.on("pageerror", (error) => errors.push(error.message));
      assert.equal((await page.goto(`${origin}/?forced-theme=${forced}`, { waitUntil: "load" }))?.status(), 200);
      await requireAppearance(page, saved, forced, forced, saved);
      await page.getByRole("button", { name: "Use saved appearance", exact: true }).click();
      await requireAppearance(page, saved, saved, "none", saved);
      await page.getByRole("button", { name: "Restore forced appearance", exact: true }).click();
      await requireAppearance(page, saved, forced, forced, saved);
      assert.deepEqual(errors, [], "forced-theme verification must stay local and error-free");
      console.log(`Forced-theme native checks passed: saved ${saved}, forced ${forced}, unforced, restored; portal, explicit island, browser chrome, storage and Jelly.`);
    } finally { await context.close(); }
  }
}

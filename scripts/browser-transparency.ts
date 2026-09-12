import assert from "node:assert/strict";
import type { Page } from "playwright-core";

/** Override only this fixture's transparency preference, then restore its media and scroll state. */
export async function withTransparencyPreference<T>(
  page: Page,
  value: "reduce" | "no-preference",
  inspect: (select: (value: "reduce" | "no-preference") => Promise<void>) => Promise<T>,
): Promise<T> {
  const initial = await page.evaluate(() => ({
    scrollX, scrollY,
    features: [
      { name: "prefers-color-scheme", value: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" },
      { name: "prefers-reduced-motion", value: matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference" },
      { name: "prefers-reduced-transparency", value: matchMedia("(prefers-reduced-transparency: reduce)").matches ? "reduce" : "no-preference" },
      { name: "forced-colors", value: matchMedia("(forced-colors: active)").matches ? "active" : "none" },
    ],
  }));
  const session = await page.context().newCDPSession(page);
  const select = async (value: "reduce" | "no-preference"): Promise<void> => {
    await session.send("Emulation.setEmulatedMedia", {
      features: initial.features.map((feature) => feature.name === "prefers-reduced-transparency"
        ? { ...feature, value } : feature),
    });
    assert(await page.evaluate((value) =>
      matchMedia(`(prefers-reduced-transparency: ${value})`).matches, value),
    `Transparency emulation did not select ${value}.`);
  };
  try {
    await select(value);
    return await inspect(select);
  } finally {
    try {
      await session.send("Emulation.setEmulatedMedia", { features: initial.features });
    } finally {
      try {
        await page.evaluate(({ scrollX, scrollY }) =>
          scrollTo({ left: scrollX, top: scrollY, behavior: "instant" }), initial);
      } finally { await session.detach(); }
    }
  }
}

/** Inspect rendered paint without injecting styles into a strict-CSP fixture. */
export async function requireHeaderPaint(
  page: Page,
  headers: readonly { selector: string; background?: string }[],
  backdrop: string,
): Promise<void> {
  for (const { selector, background } of headers) {
    assert.equal(await page.locator(selector).count(), 1, `Missing unique header ${selector}.`);
    await page.locator(selector).scrollIntoViewIfNeeded({ timeout: 5_000 });
    await page.waitForFunction(({ selector, background, backdrop }) => {
      const header = document.querySelector(selector);
      if (!(header instanceof HTMLElement)) return false;
      const style = getComputedStyle(header);
      return style.backdropFilter === backdrop
        && style.position === "sticky"
        && (background === undefined || style.backgroundColor === background);
    }, { selector, background, backdrop }, { timeout: 5_000, polling: "raf" });
  }
}

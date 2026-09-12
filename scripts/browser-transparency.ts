import assert from "node:assert/strict";
import type { Page } from "playwright-core";

type FixtureMediaOverrides = Readonly<{
  colorScheme?: "light" | "dark";
  forcedColors?: "none" | "active";
}>;

/** Override only this fixture's transparency preference, then restore its media and scroll state. */
export async function withTransparencyPreference<T>(
  page: Page,
  value: "reduce" | "no-preference",
  inspect: (select: (value: "reduce" | "no-preference", overrides?: FixtureMediaOverrides) => Promise<void>) => Promise<T>,
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
  const select = async (value: "reduce" | "no-preference", overrides: FixtureMediaOverrides = {}): Promise<void> => {
    const features = initial.features.map((feature) => {
      if (feature.name === "prefers-reduced-transparency") return { ...feature, value };
      if (feature.name === "forced-colors" && overrides.forcedColors !== undefined) return { ...feature, value: overrides.forcedColors };
      if (feature.name === "prefers-color-scheme" && overrides.colorScheme !== undefined) return { ...feature, value: overrides.colorScheme };
      return feature;
    });
    await session.send("Emulation.setEmulatedMedia", { features });
    assert(await page.evaluate((features) => features.every(({ name, value }) =>
      matchMedia(`(${name}: ${value})`).matches), features),
    `Fixture media emulation did not apply ${JSON.stringify(features)}.`);
  };
  const failures: unknown[] = [];
  let result: { value: T } | undefined;
  try {
    await select(value);
    result = { value: await inspect(select) };
  } catch (error) {
    failures.push(error);
  } finally {
    try {
      await session.send("Emulation.setEmulatedMedia", { features: initial.features });
    } catch (error) { failures.push(error); }
    try {
      await page.evaluate(({ scrollX, scrollY }) =>
        scrollTo({ left: scrollX, top: scrollY, behavior: "instant" }), initial);
    } catch (error) { failures.push(error); }
    try { await session.detach(); } catch (error) { failures.push(error); }
  }
  if (failures.length === 1) throw failures[0];
  if (failures.length > 1) throw new AggregateError(failures, "Fixture media inspection and cleanup failed.");
  assert(result !== undefined, "Fixture media inspection did not return a result.");
  return result.value;
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

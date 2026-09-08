import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { chromium, type Browser, type Page } from "playwright-core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type * as ProductMarketing from "../src/react/product-marketing.js";
import { readStylexPackageManifest, serializeStylexRuleUnionV1 } from "@hraness/ui/stylex-build";
import { ProductMarketingFixture, productMarketingConsumerCoverage, productMarketingCoverage } from "../gallery/product-marketing-fixture.js";
import { ProductMarketingCspFixture, productMarketingCspGrids } from "../gallery/product-marketing-csp-fixture.js";
import {
  browserStylesheetHasComponentPriorityRules,
  bundleBrowserStylesheet,
  nativeBrowserStylesheetAssets,
  projectedNativeBrowserStylesheetAssets,
} from "./browser-stylesheet.js";
import {
  browserCssColors, cssColorTokens, equalCssColors, normalizeBackgroundPosition, observeCssColors,
  browserCompilerColorProjections, colorProjectionCompilerIdentity, projectCompilerColor, proveCssColorParity,
  CSS_COLOR_ALPHA_EPSILON, CSS_COLOR_XYZ_EPSILON,
  type BrowserColorRequest, type CssColorObservation, type NativeColorProjection,
} from "./browser-css-parity.js";

const repository = resolve(import.meta.dir, "..");
// Compiler reference rules belong to a native-only blank page. Never inject a
// reference stylesheet into the application or relax its style-src policy.
let compilerProjectionPage: Page | undefined;
const modes = ["static", "projected-static", "standalone", "compiler"] as const;
const deliveryModes = ["standalone", "compiler"] as const;
const strictMarketingCsp = "default-src 'none'; style-src 'self'; style-src-attr 'none'; font-src 'self'; img-src 'self' data:; base-uri 'none'; object-src 'none'";
type Mode = typeof modes[number];
const interactionCases = [
  ["paper primary", '.hraness-marketing-hero[data-tone="paper"] .hraness-marketing-action[data-emphasis="primary"]', 0],
  ["paper secondary", '.hraness-marketing-hero[data-tone="paper"] .hraness-marketing-action[data-emphasis="secondary"]', 0],
  ["header primary", '.hraness-marketing-header .hraness-marketing-action[data-emphasis="primary"]', 0],
  ["header secondary", '.hraness-marketing-header .hraness-marketing-action[data-emphasis="secondary"]', 0],
  ["plan primary", '.hraness-marketing-plan .hraness-marketing-action[data-emphasis="primary"]', 0],
  ["plan secondary", '.hraness-marketing-plan .hraness-marketing-action[data-emphasis="secondary"]', 0],
  ["hero accent primary", '.hraness-marketing-hero[data-tone="accent"] .hraness-marketing-action[data-emphasis="primary"]', 0],
  ["hero accent secondary", '.hraness-marketing-hero[data-tone="accent"] .hraness-marketing-action[data-emphasis="secondary"]', 0],
  ["CTA accent primary", '.hraness-marketing-cta[data-tone="accent"] .hraness-marketing-action[data-emphasis="primary"]', 0],
  ["CTA accent secondary", '.hraness-marketing-cta[data-tone="accent"] .hraness-marketing-action[data-emphasis="secondary"]', 0],
  ["CTA paper primary", '.hraness-marketing-cta[data-tone="paper"] .hraness-marketing-action[data-emphasis="primary"]', 0],
  ["CTA paper secondary", '.hraness-marketing-cta[data-tone="paper"] .hraness-marketing-action[data-emphasis="secondary"]', 0],
  ["current navigation", ".hraness-marketing-header__nav a", 0],
  ["ordinary navigation", ".hraness-marketing-header__nav a", 1],
  ["attribution link", ".hraness-marketing-quote__link", 0],
] as const;
const properties = [
  "display", "position", "color", "background-color", "background-image", "background-position",
  "background-size", "background-repeat", "background-origin", "background-clip", "background-attachment",
  "border-block-start-width", "border-block-end-width", "border-inline-start-width", "border-inline-end-width",
  "border-block-start-style", "border-block-end-style", "border-inline-start-style", "border-inline-end-style",
  "border-block-start-color", "border-block-end-color", "border-inline-start-color", "border-inline-end-color",
  "border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius",
  "border-image-source", "border-image-slice", "border-image-width", "border-image-outset", "border-image-repeat",
  "padding-block-start", "padding-block-end", "padding-inline-start", "padding-inline-end",
  "margin-block-start", "margin-block-end", "margin-inline-start", "margin-inline-end",
  "font-family", "font-size", "font-style", "font-weight", "font-palette", "font-language-override", "-webkit-font-smoothing",
  "line-height", "letter-spacing", "text-align", "text-transform", "text-decoration-line",
  "white-space", "text-wrap-mode", "text-wrap-style", "list-style-type", "overflow-x", "overflow-y",
  "gap", "row-gap", "column-gap", "flex-direction", "flex-wrap", "align-items", "justify-content",
  "grid-template-columns", "order", "min-inline-size", "max-inline-size", "min-block-size", "box-shadow",
  "inline-size", "block-size", "max-block-size", "inset-block-start", "inset-block-end", "inset-inline-start", "inset-inline-end",
  "z-index", "justify-items", "align-content", "justify-self", "align-self", "text-overflow", "clip-path", "clip",
  "opacity", "visibility", "tab-size", "object-fit", "backdrop-filter", "-webkit-backdrop-filter",
  "grid-row", "grid-column", "scroll-margin-block-start", "font-variant-numeric", "flex-basis", "flex-grow", "flex-shrink",
  "overflow-wrap", "text-decoration-style", "text-decoration-color", "text-decoration-thickness", "text-underline-offset",
  "cursor", "list-style-image", "list-style-position",
  "outline-color", "outline-style", "outline-width", "outline-offset", "content", "transform",
] as const;

interface Observation {
  readonly hook: string;
  readonly values: readonly string[];
  readonly colorValues: readonly (CssColorObservation | null)[];
}
interface RawObservation {
  readonly hook: string;
  readonly values: readonly string[];
  readonly currentColor: string;
  readonly colorScheme: string;
}
function required<T>(value: T | undefined, label: string): T {
  assert(value !== undefined, `Missing ${label}`);
  return value;
}
async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined)));
    await new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done())));
  });
}

async function strictGridSnapshot(page: Page) {
  return page.locator(productMarketingCspGrids.map(({ selector }) => selector).join(", ")).evaluateAll((elements) =>
    elements.map((element) => {
      const container = element.closest(".hraness-marketing-hero, .hraness-marketing-pillars, .hraness-marketing-stats");
      if (container === null) throw new Error("The strict grid lost its public layout container.");
      // Read layout before dependent computed grid tracks, including after the
      // delivery sheet's application flag changes. Do not sample stale tracks.
      const containerRect = container.getBoundingClientRect();
      const gridRect = element.getBoundingClientRect();
      const containerStyle = getComputedStyle(container);
      const style = getComputedStyle(element);
      return { display: style.display, columns: style.gridTemplateColumns, items: element.children.length,
        columnValue: style.getPropertyValue(element.matches(".hraness-marketing-pillars")
          ? "--hraness-marketing-pillar-columns" : "--hraness-marketing-fact-columns").trim(),
        geometry: { containerWidth: containerRect.width, gridWidth: gridRect.width,
          boxSizing: containerStyle.boxSizing, inlineSize: containerStyle.inlineSize,
          paddingStart: containerStyle.paddingInlineStart, paddingEnd: containerStyle.paddingInlineEnd } };
    }));
}

async function verifyStrictMarketingCsp(browser: Browser, origin: string,
  stylesheetHashes: Readonly<Record<typeof deliveryModes[number], string>>) {
  const receipts: { label: string; grids: Awaited<ReturnType<typeof strictGridSnapshot>>; inlineStyles: number; violations: number; cssSha256: string }[] = [];
  const configurations = [
    { name: "desktop-light", width: 1280, dark: false, rtl: false, forced: false, coarse: false },
    { name: "desktop-two-columns", width: 1280, dark: false, rtl: false, forced: false, coarse: false },
    { name: "phone-dark", width: 390, dark: true, rtl: false, forced: false, coarse: true },
    { name: "rtl", width: 1100, dark: false, rtl: true, forced: false, coarse: false },
    { name: "forced", width: 1100, dark: false, rtl: false, forced: true, coarse: false },
  ] as const;
  for (const configuration of configurations) for (const mode of deliveryModes) {
    const label = `${configuration.name}/${mode}/strict-csp`;
    const page = await browser.newPage({ viewport: { width: configuration.width, height: 900 },
      colorScheme: configuration.dark ? "dark" : "light", hasTouch: configuration.coarse,
      forcedColors: configuration.forced ? "active" : "none", reducedMotion: "reduce" });
    const errors: string[] = [];
    try {
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("requestfailed", (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
      page.on("response", (response) => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
      await page.route("**/*", async (route) => {
        if (new URL(route.request().url()).origin !== origin || !["GET", "HEAD"].includes(route.request().method())) {
          errors.push(`Unexpected strict-CSP request: ${route.request().url()}`);
          await route.abort();
        } else await route.continue();
      });
      await page.addInitScript(() => {
        const state = window as unknown as { marketingCspViolations: string[] };
        state.marketingCspViolations = [];
        document.addEventListener("securitypolicyviolation", (event) => {
          if (state.marketingCspViolations.length < 32) state.marketingCspViolations.push(event.violatedDirective);
        });
      });
      const query = new URLSearchParams({ mode, theme: configuration.dark ? "dark" : "light", direction: configuration.rtl ? "rtl" : "ltr" });
      const columnOverride = configuration.name === "desktop-two-columns" ? 2 : undefined;
      if (columnOverride !== undefined) query.set("columns", String(columnOverride));
      const response = await page.goto(`${origin}/strict-csp?${query}`, { waitUntil: "networkidle" });
      assert.ok(response !== null, `${label}: missing document response`);
      assert.equal(response.status(), 200, label);
      assert.equal(response.headers()["content-security-policy"], strictMarketingCsp, `${label}: exact strict policy`);
      await settle(page);
      assert.deepEqual(await page.evaluate(() => ({
        narrow: matchMedia("(max-width: 48rem)").matches, coarse: matchMedia("(pointer: coarse)").matches,
        dark: matchMedia("(prefers-color-scheme: dark)").matches, forced: matchMedia("(forced-colors: active)").matches,
        reduced: matchMedia("(prefers-reduced-motion: reduce)").matches, direction: document.documentElement.dir,
      })), { narrow: configuration.width <= 768, coarse: configuration.coarse, dark: configuration.dark,
        forced: configuration.forced, reduced: true, direction: configuration.rtl ? "rtl" : "ltr" }, label);
      assert.equal(await page.locator("[style], style, script").count(), 0, `${label}: no inline style or production script`);
      const grids = await strictGridSnapshot(page);
      assert.equal(grids.length, productMarketingCspGrids.length, label);
      for (const [index, expected] of productMarketingCspGrids.entries()) {
        const actual = required(grids[index], `${label}: grid ${index}`);
        assert.equal(await page.locator(expected.selector).count(), 1, label);
        assert.equal(actual.display, "grid", label);
        assert.equal(actual.geometry.boxSizing, "border-box", `${label}: public container reset`);
        assert.equal(actual.items, expected.items, label);
        assert.equal(actual.columnValue, String(columnOverride ?? expected.desktopColumns), `${label}: explicit compiled column atom`);
        assert.match(actual.columns, /^\d+(?:\.\d+)?px(?: \d+(?:\.\d+)?px)*$/u, `${label}: resolved finite tracks`);
        const tracks = actual.columns.split(" ");
        assert.equal(tracks.length, configuration.width <= 768 ? expected.narrowColumns : columnOverride ?? expected.desktopColumns, label);
        assert.ok(tracks.every((track) => Number.parseFloat(track) > 0), `${label}: nonempty tracks`);
      }
      const sheet = page.locator('link[rel="stylesheet"]');
      assert.equal(await sheet.count(), 1, `${label}: one delivery stylesheet`);
      const href = await sheet.getAttribute("href");
      assert.ok(href !== null, `${label}: missing stylesheet URL`);
      assert.equal(href, `/styles.css?mode=${mode}`);
      const css = await page.request.get(new URL(href, origin).href);
      assert.equal(css.status(), 200, label);
      const cssSha256 = createHash("sha256").update(await css.body()).digest("hex");
      assert.equal(cssSha256, stylesheetHashes[mode], `${label}: graph-bound stylesheet bytes`);
      // Disable the already-loaded CSSOM sheet, not the link resource. Toggling
      // HTMLLinkElement.disabled may reprocess the resource on re-enablement;
      // that is not the delivery-removal boundary this control verifies.
      const loadedSheet = await sheet.evaluateHandle((element) => {
        if (!(element instanceof HTMLLinkElement) || !element.isConnected) throw new Error("Missing ordinary stylesheet link.");
        const stylesheet = element.sheet;
        if (stylesheet === null || stylesheet.ownerNode !== element || stylesheet.disabled
          || stylesheet.href !== element.href || new URL(element.href).origin !== location.origin
          || document.styleSheets.length !== 1 || document.styleSheets[0] !== stylesheet
          || stylesheet.cssRules.length === 0) throw new Error("Missing unique loaded same-origin delivery sheet.");
        const markup = element.outerHTML;
        const href = stylesheet.href;
        const ruleCount = stylesheet.cssRules.length;
        return { setDisabled(disabled: boolean) {
          if (!element.isConnected || element.sheet !== stylesheet || stylesheet.ownerNode !== element
            || element.outerHTML !== markup || stylesheet.href !== href
            || document.styleSheets.length !== 1 || document.styleSheets[0] !== stylesheet
            || stylesheet.cssRules.length !== ruleCount) throw new Error("Delivery stylesheet identity changed.");
          stylesheet.disabled = disabled;
          if (stylesheet.disabled !== disabled) throw new Error("Delivery stylesheet application flag did not change.");
        } };
      });
      try {
        await loadedSheet.evaluate((state) => state.setDisabled(true));
        try {
          await settle(page);
          const removed = await strictGridSnapshot(page);
          assert.equal(removed.length, grids.length, `${label}: removal preserves all public grids`);
          for (const [index, grid] of removed.entries()) {
            assert.equal(grid.display, "block", `${label}: removed grid ${index} uses native block layout`);
            assert.equal(grid.columns, "none", `${label}: removed grid ${index} has no compiled tracks`);
            assert.equal(grid.columnValue, "", `${label}: removed grid ${index} has no compiled column atom`);
            assert.equal(grid.items, required(grids[index], `${label}: baseline grid ${index}`).items, `${label}: removal preserves grid ${index} content`);
          }
          assert.notDeepEqual(removed, grids, `${label}: stylesheet removal must break compiled geometry`);
        } finally { await loadedSheet.evaluate((state) => state.setDisabled(false)); }
        await settle(page);
        assert.deepEqual(await strictGridSnapshot(page), grids, `${label}: restored exact geometry`);
      } finally { await loadedSheet.dispose(); }
      const summary = page.locator("details > summary");
      assert.equal(await summary.count(), 1, label);
      await page.keyboard.press("Shift");
      await summary.focus();
      assert.equal(await summary.evaluate((element) => element.matches(":focus-visible")), true, label);
      await page.keyboard.press("Enter");
      assert.equal(await page.locator("details").getAttribute("open"), "", label);
      await page.keyboard.press("Space");
      assert.equal(await page.locator("details").getAttribute("open"), null, label);
      assert.equal(await page.locator("[style], style, script").count(), 0, label);
      assert.deepEqual(await page.evaluate(() => (window as unknown as { marketingCspViolations: string[] }).marketingCspViolations), [], label);
      assert.deepEqual(errors, [], label);
      receipts.push({ label, grids, inlineStyles: 0, violations: 0, cssSha256 });
    } finally { await page.close(); }
  }
  return receipts;
}

async function snapshot(page: Page, selector = '[class*="hraness-marketing-"], [data-marketing-oracle]', index?: number, original = false): Promise<readonly Observation[]> {
  const matches = page.locator(selector);
  const raw = await (index === undefined ? matches : matches.nth(index)).evaluateAll((elements, names) => elements.flatMap((element) => {
    const oracle = element.getAttribute("data-marketing-oracle");
    const hook = oracle === null ? [...element.classList].find((name) => name.startsWith("hraness-marketing-")) : `consumer:${oracle}`;
    if (!hook) throw new Error("The fixture lost an owned marketing hook.");
    const pseudos = hook === "hraness-marketing-question__summary" ? [null, "::after"]
      : hook === "hraness-marketing-plan__feature" ? [null, "::before"] : [null];
    return pseudos.map((pseudo) => {
      const style = getComputedStyle(element, pseudo);
      return { hook: `${hook}${pseudo ?? ""}`, values: names.map((name) => style.getPropertyValue(name)),
        currentColor: style.color, colorScheme: style.colorScheme };
    });
  }), [...properties]);
  return observeBrowserColors(page, raw, properties, original);
}

async function observeBrowserColors(page: Page, raw: readonly RawObservation[], names: readonly string[], original = false): Promise<readonly Observation[]> {
  const requests: BrowserColorRequest[] = [];
  const slots = raw.map((entry) => entry.values.map((value, index) => {
    const tokens = cssColorTokens(required(names[index], "color property"), value);
    const start = requests.length;
    for (const token of tokens) requests.push({ value: token.value, currentColor: entry.currentColor, colorScheme: entry.colorScheme });
    return { start, tokens };
  }));
  const converted = await page.evaluate(browserCssColors, requests);
  const serialized = await page.evaluate(browserCssColors, requests.map((request) => ({ ...request, serialization: "native" as const })));
  assert.equal(converted.length, requests.length, "Native color observation inventory differs");
  assert.equal(serialized.length, requests.length, "Native color serialization inventory differs");
  const observations = raw.map((entry, entryIndex) => ({
    hook: entry.hook, values: entry.values,
    colorValues: required(slots[entryIndex], "color slots").map(({ start, tokens }, index) => tokens.length === 0 ? null
      : observeCssColors(required(entry.values[index], "color value"), tokens, converted.slice(start, start + tokens.length), serialized.slice(start, start + tokens.length))),
  }));
  if (!original) return observations;
  // Only the independent native oracle supplies projection inputs. No delivery
  // color enters the compiler, even when the native XYZ comparison fails.
  const drafts = new Map<string, NonNullable<ReturnType<typeof projectCompilerColor>>>();
  for (const entry of observations) for (const colors of entry.colorValues) for (const token of colors?.tokens ?? []) {
    if (drafts.has(token)) continue;
    const projected = projectCompilerColor(token);
    if (projected !== null) drafts.set(token, projected);
    assert(drafts.size <= 1024, "Original color projection inventory exceeds its bound");
  }
  const projected = await (compilerProjectionPage ?? page).evaluate(browserCompilerColorProjections,
    [...drafts.values()].map(({ outputCss, projected, fallback }) => ({ outputCss, projected, fallback })));
  assert.equal(projected.length, drafts.size, "Whole compiler rule observation inventory differs");
  const nativeProjections = new Map<string, NativeColorProjection>();
  [...drafts].forEach(([token, compiler], index) => {
    const native = required(projected[index], "whole compiler rule observation");
    const coordinates = (token: string, xyz: string) => {
      const observed = observeCssColors(token, cssColorTokens("color", token), [xyz], [token]);
      assert.equal(observed.colors.length, 1, "Compiler token must remain one native color");
      return required(observed.colors[0], "compiler token XYZ");
    };
    nativeProjections.set(token, { compiler, serialized: native.serialized, xyz: coordinates(native.serialized, native.xyz),
      wholeSerialized: native.wholeSerialized, wholeXyz: coordinates(native.wholeSerialized, native.wholeXyz),
      fallbackSerialized: native.fallbackSerialized, fallbackXyz: coordinates(native.fallbackSerialized, native.fallbackXyz),
      oklch: { expression: native.oklch.expression, serialized: native.oklch.serialized, xyz: coordinates(native.oklch.serialized, native.oklch.xyz) } });
  });
  return observations.map((entry) => ({ ...entry, colorValues: entry.colorValues.map((colors) => colors === null ? null
    : { ...colors, projections: (colors.tokens ?? []).map((token) => nativeProjections.get(token) ?? null) }) }));
}

const rawColorDifferences = new Map<string, {
  examples: string[];
  nativeEquivalent: false;
  projected: CssColorObservation;
  raw: CssColorObservation;
  uses: number;
}>();
const rawColorDifferenceUseHash = createHash("sha256");

function deliveryNonColorMatches(value: string, baseline: string, property: string): boolean {
  const normalize = property === "background-position" ? normalizeBackgroundPosition : (item: string) => item;
  // CSS source transformations can round the final subpixel serialization.
  const pixels = /^(-?\d+(?:\.\d+)?)px$/u.exec(value);
  const referencePixels = /^(-?\d+(?:\.\d+)?)px$/u.exec(baseline);
  return pixels !== null && referencePixels !== null
    ? Math.abs(Number(pixels[1]) - Number(referencePixels[1])) <= 0.025
    : normalize(value) === normalize(baseline);
}

function compareProjectedNonColor(value: string, baseline: string, label: string): void {
  assert.equal(value, baseline, `${label}: color-only source projection changed a non-color value`);
}

function compareProjectedToRaw(actual: readonly Observation[], expected: readonly Observation[], label: string): number {
  assert.equal(actual.length, expected.length, `${label}: owned-slot inventory differs`);
  let assertions = 0;
  actual.forEach((entry, index) => {
    const reference = required(expected[index], "baseline slot");
    assert.equal(entry.hook, reference.hook, `${label}: slot ${index}`);
    assert.equal(entry.values.length, properties.length, `${label}: computed property inventory`);
    assert.equal(reference.values.length, properties.length, `${label}: baseline property inventory`);
    assert.equal(entry.colorValues.length, properties.length, `${label}: color property inventory`);
    assert.equal(reference.colorValues.length, properties.length, `${label}: baseline color inventory`);
    entry.values.forEach((value, propertyIndex) => {
      const property = required(properties[propertyIndex], "computed property");
      const baseline = required(reference.values[propertyIndex], "baseline value");
      const color = required(entry.colorValues[propertyIndex], "native color observation");
      const baselineColor = required(reference.colorValues[propertyIndex], "native baseline color");
      if (color !== null || baselineColor !== null) {
        assert(color !== null && baselineColor !== null,
          `${label}: ${index} ${entry.hook} ${property}: color-token inventory differs`);
        assert.deepEqual(color.parts, baselineColor.parts,
          `${label}: ${index} ${entry.hook} ${property}: projection changed non-color property bytes`);
        assert.equal(color.colors.length, baselineColor.colors.length,
          `${label}: ${index} ${entry.hook} ${property}: projection changed color-token arity`);
        if (!equalCssColors(color, baselineColor)) {
          const identity = createHash("sha256").update(JSON.stringify({ projected: color, raw: baselineColor })).digest("hex");
          const use = `${label}:${index}:${entry.hook}:${property}`;
          const prior = rawColorDifferences.get(identity) ?? {
            examples: [], nativeEquivalent: false as const, projected: color, raw: baselineColor, uses: 0,
          };
          prior.uses += 1;
          if (prior.examples.length < 8) prior.examples.push(use);
          rawColorDifferences.set(identity, prior);
          assert(rawColorDifferences.size <= 1024, "Raw/projected color-difference inventory exceeds its bound");
          rawColorDifferenceUseHash.update(JSON.stringify([identity, use]) + "\n");
        }
      } else compareProjectedNonColor(value, baseline, `${label}: ${index} ${entry.hook} ${property}`);
      assertions += 1;
    });
  });
  return assertions;
}

function compareDeliveryToProjected(actual: readonly Observation[], expected: readonly Observation[], label: string): number {
  assert.equal(actual.length, expected.length, `${label}: owned-slot inventory differs`);
  let assertions = 0;
  actual.forEach((entry, index) => {
    const reference = required(expected[index], "projected baseline slot");
    assert.equal(entry.hook, reference.hook, `${label}: slot ${index}`);
    assert.equal(entry.values.length, properties.length, `${label}: computed property inventory`);
    assert.equal(reference.values.length, properties.length, `${label}: projected property inventory`);
    entry.values.forEach((value, propertyIndex) => {
      const property = required(properties[propertyIndex], "computed property");
      const baseline = required(reference.values[propertyIndex], "projected value");
      const color = required(entry.colorValues[propertyIndex], "delivery color observation");
      const projectedColor = required(reference.colorValues[propertyIndex], "projected baseline color");
      if (color !== null || projectedColor !== null) {
        if (color === null || projectedColor === null || !equalCssColors(color, projectedColor)) {
          recordDeliveryMismatch(label, index, entry.hook, property, value, baseline, color, projectedColor);
        }
      } else if (!deliveryNonColorMatches(value, baseline, property)) {
        recordDeliveryMismatch(label, index, entry.hook, property, value, baseline, null, null);
      }
      assertions += 1;
    });
  });
  return assertions;
}

async function executable(): Promise<string> {
  for (const path of [process.env.CHROMIUM_EXECUTABLE_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", chromium.executablePath(),
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]) {
    if (path === undefined) continue;
    try { await access(path, constants.X_OK); return path; } catch { /* Try the next explicit installed binary. */ }
  }
  throw new Error("Set CHROMIUM_EXECUTABLE_PATH to an installed browser; this gate never downloads one.");
}

async function colorProbe(page: Page) {
  const rootToken = "oklch(0.55 0.21 262)";
  const retainedProjection = projectCompilerColor(rootToken);
  const wideProjection = projectCompilerColor("oklch(0.7 0.4 40)");
  assert(retainedProjection !== null && wideProjection !== null, "Native controls require exact pinned compiler projections");
  const changedCompilerColors = ["oklch(0.56 0.21 262)", "oklch(0.55 0.22 262)", "oklch(0.55 0.21 263)", "oklch(0.55 0.21 262 / 0.5)"]
    .map((token) => {
      const projected = projectCompilerColor(token);
      assert(projected !== null, "Changed color must exercise the same pinned compiler projection path");
      return [`changed compiler token ${token}`, "color", projected.projected, rootToken, false, false] as const;
    });
  const cases = [
    ["retained Lab/OKLCH compiler drift", "color", "lab(45.417 18.6059 -73.635)", "oklch(0.55 0.21 262)", false, true],
    ["retained mixed OKLCH compiler representation", "color", "oklch(0.54999 0.209982 261.996 / 0.1)", "oklch(0.55 0.21 262 / 0.1)", false, true],
    ["native color-mix derives the exact OKLCH representation", "background-color", "color-mix(in oklch, lab(45.417 18.6059 -73.635) 10%, transparent)", "oklch(0.55 0.21 262 / 0.1)", false, true],
    ["opaque OKLCH compiler representation", "color", "oklch(0.54999 0.209982 261.996)", "oklch(0.55 0.21 262)", false, true],
    ["nested mixed OKLCH representation", "box-shadow", "oklch(0.54999 0.209982 261.996 / 0.1) 0px 1px 2px", "oklch(0.55 0.21 262 / 0.1) 0px 1px 2px", false, true],
    ["mixed OKLCH nearby lightness differs", "color", "oklch(0.54998 0.209982 261.996 / 0.1)", "oklch(0.55 0.21 262 / 0.1)", false, false],
    ["mixed OKLCH nearby chroma differs", "color", "oklch(0.54999 0.209972 261.996 / 0.1)", "oklch(0.55 0.21 262 / 0.1)", false, false],
    ["mixed OKLCH nearby hue differs", "color", "oklch(0.54999 0.209982 261.995 / 0.1)", "oklch(0.55 0.21 262 / 0.1)", false, false],
    ["mixed OKLCH alpha differs", "color", "oklch(0.54999 0.209982 261.996 / 0.11)", "oklch(0.55 0.21 262 / 0.1)", false, false],
    ["nested mixed OKLCH geometry differs", "box-shadow", "oklch(0.54999 0.209982 261.996 / 0.1) 0px 2px 2px", "oklch(0.55 0.21 262 / 0.1) 0px 1px 2px", false, false],
    ["hex fractional alpha", "color", "#ff000080", "color(srgb 1 0 0 / 0.5019607843137255)", true, true],
    ["nested gradient colors", "background-image", "linear-gradient(90deg, lab(45.417 18.6059 -73.635) 10%, rgb(255 0 0) 90%)", "linear-gradient(90deg, oklch(0.55 0.21 262) 10%, color(srgb 1 0 0) 90%)", false, true],
    ["nested shadow colors", "box-shadow", "lab(45.417 18.6059 -73.635) 0px 1px 2px, rgb(255 0 0 / .5) 0px 3px 4px", "oklch(0.55 0.21 262) 0px 1px 2px, rgb(255 0 0 / .5) 0px 3px 4px", false, true],
    ["legacy RGB alpha differs from floating alpha", "color", "rgb(255 0 0 / .5)", "color(srgb 1 0 0 / .5)", false, false],
    ["lightness differs", "color", "oklch(0.55 0.21 262)", "oklch(0.56 0.21 262)", false, false],
    ["chroma differs", "color", "oklch(0.55 0.21 262)", "oklch(0.55 0.22 262)", false, false],
    ["hue differs", "color", "oklch(0.55 0.21 262)", "oklch(0.55 0.21 263)", false, false],
    ["alpha differs", "color", "oklch(0.55 0.21 262 / .5)", "oklch(0.55 0.21 262 / .51)", false, false],
    ["extended gamut differs from clamping", "color", "color(xyz-d65 -0.25 1.5 2)", "color(xyz-d65 0 1 1)", false, false],
    ["RGB fallback cannot prove Lab projection", "color", retainedProjection.fallback, rootToken, false, false],
    ["gamut-clamped fallback cannot prove wide Lab projection", "color", wideProjection.fallback, wideProjection.original, false, false],
    ...changedCompilerColors,
    ["shadow geometry differs", "box-shadow", "lab(45.417 18.6059 -73.635) 0px 1px 2px", "oklch(0.55 0.21 262) 0px 2px 2px", false, false],
    ["gradient interpolation differs", "background-image", "linear-gradient(90deg in srgb, red, blue)", "linear-gradient(90deg in oklch, red, blue)", false, false],
  ] as const;
  const receipts = [];
  for (const [label, property, left, right, equivalent, projectedParity] of cases) {
    // Match the real matrix's boundary: it reads a computed property before
    // decomposing its color tokens. Converting an authored color-mix directly
    // to XYZ retains precision that its computed OKLCH serialization omits.
    // Keep that native serialization step in the controls as well.
    const computed = await page.evaluate(({ property, values }) => {
      const element = document.createElement("div");
      element.style.cssText = "all: initial !important; forced-color-adjust: none !important; display: none !important";
      document.documentElement.append(element);
      try {
        return values.map((value) => {
          if (!CSS.supports(property, value)) throw new Error(`Native color control rejected ${property}: ${value}`);
          element.style.setProperty(property, value, "important");
          const observed = getComputedStyle(element).getPropertyValue(property);
          if (observed.length === 0) throw new Error("Native color control lost its computed property");
          return observed;
        });
      } finally { element.remove(); }
    }, { property, values: [left, right] });
    assert.equal(computed.length, 2, "Native color control property inventory differs");
    const raw = (value: string) => ({ hook: label, values: [value], currentColor: "rgb(0, 0, 0)", colorScheme: "normal" });
    const observations = [...await observeBrowserColors(page, [raw(required(computed[0], "left computed control"))], [property]),
      ...await observeBrowserColors(page, [raw(required(computed[1], "right computed control"))], [property], true)];
    const a = required(required(observations[0], "left probe").colorValues[0], "left native color");
    const b = required(required(observations[1], "right probe").colorValues[0], "right native color");
    assert(a !== null && b !== null && a.colors.length > 0 && b.colors.length > 0, `${label}: nonvacuous native colors required`);
    assert.equal(equalCssColors(a, b), equivalent,
      `${label}: native color comparator control ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
    const projectionProof = proveCssColorParity(a, b);
    assert.equal(projectionProof !== null, projectedParity, `${label}: one-way compiler projection ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
    if (!equivalent && projectedParity) assert(projectionProof !== null && projectionProof.length > 0, "Compiler drift must have nonvacuous projection evidence");
    if (label === "extended gamut differs from clamping") assert.deepEqual(a.colors, [[-0.25, 1.5, 2, 1]], "XYZ observation must not clamp extended channels");
    receipts.push({ label, property, authored: [left, right], computed, nativeEquivalent: equivalent, projectedParity, projectionProof, actual: a, original: b });
  }
  const legacySha256 = createHash("sha256").update(await readFile(join(repository, "src/product-marketing.css"))).digest("hex");
  assert.equal(legacySha256, "f2437b977ddb764d9648e5a22fff9d376022b3606a225fe54d38f30a536e57e4");
  return { space: "xyz-d65", coordinateEpsilon: CSS_COLOR_XYZ_EPSILON, alphaEpsilon: CSS_COLOR_ALPHA_EPSILON,
    compiler: colorProjectionCompilerIdentity(), legacySha256, receipts };
}

if (process.argv.includes("--color-probe-only")) {
  const browserPath = await executable();
  const probeBrowser = await chromium.launch({ executablePath: browserPath, headless: true, args: ["--no-sandbox"] });
  try {
    const page = await probeBrowser.newPage();
    try { console.log(JSON.stringify({ browserPath, browserVersion: probeBrowser.version(), colorProbe: await colorProbe(page) }, null, 2)); }
    finally { await page.close(); }
  } finally { await probeBrowser.close(); }
  process.exit(0);
}

const output = await mkdtemp(join(tmpdir(), "hraness-product-marketing-browser-"));
let browser: Browser | undefined;
let server: ReturnType<typeof Bun.serve> | undefined;
const failures: string[] = [];
const receipts: { label: string; slots: number; assertions: number }[] = [];
const environments: { label: string; narrow: boolean; coarse: boolean; forced: boolean; reduced: boolean; dark: boolean; writingMode: string; direction: string }[] = [];
const deliveryMismatchSamples: Readonly<{
  actual: string;
  actualColors: CssColorObservation | null;
  expected: string;
  expectedColors: CssColorObservation | null;
  hook: string;
  index: number;
  label: string;
  property: string;
}>[] = [];
const deliveryMismatchHash = createHash("sha256");
let deliveryMismatchCount = 0;
let colorProbeReceipt: Awaited<ReturnType<typeof colorProbe>> | undefined;

function recordDeliveryMismatch(
  label: string,
  index: number,
  hook: string,
  property: string,
  actual: string,
  expected: string,
  actualColors: CssColorObservation | null,
  expectedColors: CssColorObservation | null,
): void {
  assert.ok(Buffer.byteLength(actual) <= 65_536 && Buffer.byteLength(expected) <= 65_536,
    "Computed mismatch value exceeds its diagnostic bound");
  const mismatch = { actual, actualColors, expected, expectedColors, hook, index, label, property };
  deliveryMismatchCount += 1;
  deliveryMismatchHash.update(JSON.stringify(mismatch) + "\n");
  if (deliveryMismatchSamples.length < 256) deliveryMismatchSamples.push(mismatch);
}
try {
  const legacySha256 = createHash("sha256").update(await readFile(join(repository, "src/product-marketing.css"))).digest("hex");
  assert.equal(legacySha256, "f2437b977ddb764d9648e5a22fff9d376022b3606a225fe54d38f30a536e57e4", "The independent static CSS oracle changed");
  // The fixture renders the shipped server entry, not copied component markup or a mock recipe.
  const api: typeof ProductMarketing = await import(join(repository, "dist/react/server.js"));
  const html = renderToStaticMarkup(createElement(ProductMarketingFixture, { api }));
  const strictHtml = renderToStaticMarkup(createElement(ProductMarketingCspFixture, { api }));
  const strictTwoColumnHtml = renderToStaticMarkup(createElement(ProductMarketingCspFixture, { api, columns: 2 }));
  assert.doesNotMatch(strictHtml, /\sstyle\s*=|<style\b|<script\b/iu, "The strict public composition contains inline styling or script");
  assert.doesNotMatch(strictTwoColumnHtml, /\sstyle\s*=|<style\b|<script\b/iu, "The nondefault strict composition contains inline styling or script");
  await writeFile(join(output, "strict-csp.html"), strictHtml, { flag: "wx" });
  await writeFile(join(output, "strict-csp-two-columns.html"), strictTwoColumnHtml, { flag: "wx" });
  const staticHtml = html.replace(/class="([^"]*)"/gu, (_match, value: string) => {
    const hooks = value.split(/\s+/u).filter((token) => token.startsWith("hraness-marketing-")
      || token.startsWith("fixture-") || token === "marketing-fixture");
    return `class="${hooks.join(" ")}"`;
  });
  assert.notEqual(staticHtml, html, "The shipped marketing components have no compiled atoms");
  const [staticCss, standalone, foundation, designManifest, uiManifest] = await Promise.all([
    bundleBrowserStylesheet(join(repository, "gallery/product-marketing-static.css"), repository),
    bundleBrowserStylesheet(join(repository, "src/styles.css"), repository),
    bundleBrowserStylesheet(join(repository, "src/compiler-foundation.css"), repository),
    readStylexPackageManifest(join(repository, "dist/stylex-manifest.json"), repository),
    readStylexPackageManifest(join(repository, "node_modules/@hraness/ui/dist/stylex-manifest.json"), join(repository, "node_modules/@hraness/ui")),
  ]);
  assert(!staticCss.includes("--hraness-marketing-install-inline-size"), "Raw oracle includes the new foundation bridge");
  assert(!staticCss.includes(".hraness-marketing-primitive__summary"), "Raw oracle includes new owned-slot exclusions");
  assert(!browserStylesheetHasComponentPriorityRules(staticCss, ["hraness-ui", "hraness-design-kit"]),
    "Raw oracle includes compiled atoms");
  assert(!foundation.includes(".hraness-marketing-hero__heading"), "Compiler foundation still contains owned marketing presentation");
  assert(!foundation.includes("components.hraness-design-kit.priority"), "Compiler foundation imported standalone atoms");
  const nativeOracle = await nativeBrowserStylesheetAssets(join(repository, "gallery/product-marketing-static.css"), repository);
  const projectedOracle = await projectedNativeBrowserStylesheetAssets(join(repository, "gallery/product-marketing-static.css"), repository);
  assert(projectedOracle.projections.some(({ projections }) => projections.length > 0),
    "Projected original-source oracle has no pinned compiler color spans");
  const rawPaths = [...nativeOracle.assets.keys()].map((path) => path.replace(/^\/native-oracle\//u, "")).sort();
  const projectedPaths = [...projectedOracle.assets.keys()].map((path) => path.replace(/^\/projected-native-oracle\//u, "")).sort();
  assert.deepEqual(projectedPaths, rawPaths, "Raw and projected original-source asset closures differ");
  for (const [rawUrl, rawAsset] of nativeOracle.assets) {
    if (rawAsset.contentType !== "font/woff2") continue;
    const projectedAsset = projectedOracle.assets.get(rawUrl.replace(/^\/native-oracle\//u, "/projected-native-oracle/"));
    assert(projectedAsset?.contentType === "font/woff2" && projectedAsset.body.equals(rawAsset.body),
      "Original-source projection changed a font asset");
  }
  for (const receipt of projectedOracle.projections) {
    const logical = receipt.url.replace(/^\/projected-native-oracle\//u, "");
    const rawAsset = nativeOracle.assets.get(`/native-oracle/${logical}`);
    const projectedAsset = projectedOracle.assets.get(receipt.url);
    assert(rawAsset?.contentType === "text/css" && projectedAsset?.contentType === "text/css",
      "Projected original-source receipt is not bound to both stylesheet assets");
    assert.equal(createHash("sha256").update(rawAsset.body).digest("hex"), receipt.sourceSha256,
      "Projected original-source receipt changed its raw input");
    assert.equal(createHash("sha256").update(projectedAsset.body).digest("hex"), receipt.projectedSha256,
      "Projected original-source receipt changed its served output");
  }
  // Validate both package profiles and keep all foundations before the final rule union.
  const compiler = foundation + "\n" + serializeStylexRuleUnionV1(
    [...uiManifest.rules, ...designManifest.rules],
    [uiManifest.standaloneSerializer, designManifest.standaloneSerializer],
  );
  const fixtureCss = `
    body { margin: 0; }
    body[data-axis="vertical"] { writing-mode: vertical-rl; }
    .fixture-static-header { position: static; }
    .fixture-caller-last { padding-inline-start: 37px; }
    body[data-tokens="true"] .marketing-fixture { --hraness-site-accent: oklch(.62 .17 38); --hraness-site-accent-ink: #17202b; }
    body[data-tokens="true"] .fixture-role-tokens {
      --hraness-marketing-ink: #203040; --hraness-marketing-muted: #506070; --hraness-marketing-background: #e6f0f5;
      --hraness-marketing-surface: #c8dce6; --hraness-marketing-line: #20304055; --hraness-marketing-line-strong: #203040bb;
      --hraness-marketing-inverse: #242830; --hraness-marketing-inverse-ink: #faf4dc;
      --hraness-marketing-accent: #943b18; --hraness-marketing-accent-ink: #faf5c8; --hraness-marketing-accent-soft: #943b1826;
      --hraness-marketing-text-font: monospace; --hraness-marketing-heading-font: serif; --hraness-marketing-mono-font: monospace;
      --hraness-marketing-measure: 61rem; --hraness-marketing-copy-measure: 31rem; --hraness-marketing-prose-measure: 51ch;
      --hraness-marketing-gutter: 2.125rem; --hraness-marketing-radius: .8125rem; --hraness-marketing-frame-radius: 1.125rem;
      --hraness-marketing-rule: 3px dotted rgb(93, 46, 18); --hraness-marketing-shadow: 2px 4px 8px #0003;
      --hraness-marketing-section-space: 5.125rem; --hraness-marketing-heading-weight: 700;
      --hraness-marketing-heading-tracking: .017em; --hraness-marketing-action-height: 3.375rem;
    }
    @layer base {
      body[data-canary="true"] :where(.hraness-marketing-page, .hraness-marketing-action, .hraness-marketing-plan,
        .hraness-marketing-header, .hraness-marketing-install, .hraness-marketing-proof, .hraness-marketing-proof-frame,
        .hraness-marketing-proof-frame__light, .hraness-marketing-hero[data-tone="accent"], .hraness-marketing-cta[data-tone="accent"],
        .hraness-marketing-hero__eyebrow, .hraness-marketing-hero__name, .hraness-marketing-flow__code,
        .hraness-marketing-primitive, .hraness-marketing-interface, .hraness-marketing-trust-item, .hraness-marketing-quote,
        .hraness-marketing-maker__portrait, .hraness-marketing-facts, .hraness-marketing-stats__list,
        .hraness-marketing-facts > div, .hraness-marketing-stats__list > div, .hraness-marketing-pillars, .hraness-marketing-pillars > div),
      body[data-canary="true"] :where(.hraness-marketing-plan__feature)::before {
        border-image-source: linear-gradient(red, blue); border-image-slice: 7; border-image-width: 2;
        border-inline-start: 7px dashed red; border-block-start: 9px dashed green;
        background-image: linear-gradient(red, blue); background-size: 11px 13px; background-position: 7px 9px;
        background-repeat: no-repeat; background-origin: content-box; background-clip: content-box;
        background-attachment: fixed; font-palette: light; font-language-override: "SRB";
      }
    }
  `;
  server = Bun.serve({ hostname: "127.0.0.1", port: 0, async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });
    if (url.pathname === "/fixture.css") return new Response(fixtureCss, { headers: { "content-type": "text/css" } });
    const nativeAsset = nativeOracle.assets.get(url.pathname);
    if (nativeAsset !== undefined && url.search === "") return new Response(new Uint8Array(nativeAsset.body),
      { headers: { "content-type": nativeAsset.contentType } });
    const projectedAsset = projectedOracle.assets.get(url.pathname);
    if (projectedAsset !== undefined && url.search === "") return new Response(new Uint8Array(projectedAsset.body),
      { headers: { "content-type": projectedAsset.contentType } });
    if (url.pathname === "/styles.css") return new Response(url.searchParams.get("mode") === "compiler" ? compiler : standalone,
      { headers: { "content-type": "text/css" } });
    if (url.pathname.startsWith("/fonts/")) {
      const path = resolve(repository, "src/fonts", decodeURIComponent(url.pathname.slice(7)));
      const within = relative(join(repository, "src/fonts"), path);
      if (within.startsWith("..") || isAbsolute(within) || !within.endsWith(".woff2")) return new Response(null, { status: 404 });
      return new Response(await readFile(path), { headers: { "content-type": "font/woff2" } });
    }
    if (url.pathname === "/strict-csp") {
      const mode = url.searchParams.get("mode");
      if (mode !== "standalone" && mode !== "compiler") return new Response(null, { status: 404 });
      const theme = url.searchParams.get("theme") === "dark" ? "dark" : "light";
      const direction = url.searchParams.get("direction") === "rtl" ? "rtl" : "ltr";
      const columns = url.searchParams.get("columns");
      if (columns !== null && columns !== "2") return new Response(null, { status: 404 });
      return new Response(`<!doctype html><html lang="en" dir="${direction}" data-theme="${theme}" class="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Strict marketing columns</title><link rel="stylesheet" href="/styles.css?mode=${mode}"></head><body>${columns === "2" ? strictTwoColumnHtml : strictHtml}</body></html>`, {
        headers: { "content-type": "text/html", "content-security-policy": strictMarketingCsp },
      });
    }
    const mode = url.pathname.slice(1) as Mode;
    if (!modes.includes(mode)) return new Response(null, { status: 404 });
    const axis = url.searchParams.get("axis") === "vertical" ? "vertical" : "horizontal";
    const direction = url.searchParams.get("direction") === "rtl" ? "rtl" : "ltr";
    const theme = url.searchParams.get("theme") === "dark" ? "dark" : "light";
    const canary = url.searchParams.get("canary") === "true";
    const tokens = url.searchParams.get("tokens") === "true";
    const stylesheetHref = mode === "static" ? nativeOracle.entryHref
      : mode === "projected-static" ? projectedOracle.entryHref : `/styles.css?mode=${mode}`;
    const oracleMarkup = mode === "static" || mode === "projected-static";
    return new Response(`<!doctype html><html lang="en" dir="${direction}" data-theme="${theme}" class="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Marketing delivery fixture</title><link rel="stylesheet" href="${stylesheetHref}"><link rel="stylesheet" href="/fixture.css"></head><body data-axis="${axis}" data-canary="${canary}" data-tokens="${tokens}">${oracleMarkup ? staticHtml : html}</body></html>`, {
      headers: { "content-type": "text/html", "content-security-policy": "default-src 'none'; style-src 'self'; style-src-attr 'unsafe-inline'; font-src 'self'; img-src 'self' data:; base-uri 'none'" },
    });
  } });
  const origin = `http://127.0.0.1:${server.port}`;
  const browserPath = await executable();
  browser = await chromium.launch({ executablePath: browserPath, headless: true, args: ["--no-sandbox"] });
  const strictCsp = await verifyStrictMarketingCsp(browser, origin, {
    standalone: createHash("sha256").update(standalone).digest("hex"),
    compiler: createHash("sha256").update(compiler).digest("hex"),
  });
  compilerProjectionPage = await browser.newPage();
  colorProbeReceipt = await colorProbe(compilerProjectionPage);
  const configurations = [
    { name: "desktop-light", width: 1280, theme: "light" },
    { name: "phone-dark", width: 390, theme: "dark" },
    { name: "rtl", width: 1100, theme: "light", direction: "rtl" },
    { name: "vertical-rtl", width: 1100, theme: "light", direction: "rtl", axis: "vertical" },
    { name: "coarse", width: 390, theme: "light", touch: true },
    { name: "forced", width: 1100, theme: "light", forced: true },
    { name: "shorthand-canary", width: 1100, theme: "light", canary: true },
    { name: "product-tokens", width: 1100, theme: "light", tokens: true },
  ] as const;
  for (const configuration of configurations) {
    const settings = configuration as { name: string; width: number; theme: string; direction?: string; axis?: string; touch?: boolean; forced?: boolean; canary?: boolean; tokens?: boolean };
    const results = new Map<Mode, readonly Observation[]>();
    const interactions = new Map<Mode, readonly Observation[]>();
    for (const mode of modes) {
      const page = await browser.newPage({ viewport: { width: settings.width, height: 900 }, hasTouch: settings.touch ?? false,
        colorScheme: settings.theme === "dark" ? "dark" : "light", forcedColors: settings.forced ? "active" : "none", reducedMotion: "reduce" });
      try {
        page.on("console", (message) => { if (message.type() === "error") failures.push(`${settings.name}/${mode}: console: ${message.text()}`); });
        page.on("pageerror", (error) => failures.push(`${settings.name}/${mode}: page: ${error.message}`));
        page.on("requestfailed", (request) => failures.push(`${settings.name}/${mode}: request: ${request.url()} ${request.failure()?.errorText}`));
        page.on("response", (response) => { if (response.status() >= 400) failures.push(`${settings.name}/${mode}: HTTP ${response.status()} ${response.url()}`); });
        await page.route("**/*", async (route) => {
          if (new URL(route.request().url()).origin !== origin) {
            failures.push(`Unexpected external request: ${route.request().url()}`);
            await route.abort();
          } else await route.continue();
        });
        const query = new URLSearchParams({ theme: settings.theme, direction: settings.direction ?? "ltr", axis: settings.axis ?? "horizontal", canary: String(settings.canary ?? false), tokens: String(settings.tokens ?? false) });
        await page.goto(`${origin}/${mode}?${query}`, { waitUntil: "networkidle" });
        await settle(page);
        const environment = await page.evaluate(() => ({
          narrow: matchMedia("(max-width: 48rem)").matches,
          coarse: matchMedia("(pointer: coarse)").matches,
          forced: matchMedia("(forced-colors: active)").matches,
          reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
          dark: matchMedia("(prefers-color-scheme: dark)").matches,
          writingMode: getComputedStyle(document.body).writingMode,
          direction: getComputedStyle(document.body).direction,
        }));
        assert.deepEqual(environment, {
          narrow: settings.width <= 768, coarse: settings.touch ?? false, forced: settings.forced ?? false,
          reduced: true, dark: settings.theme === "dark", writingMode: settings.axis === "vertical" ? "vertical-rl" : "horizontal-tb",
          direction: settings.direction ?? "ltr",
        }, `${settings.name}/${mode}: requested browser environment did not activate`);
        environments.push({ label: `${settings.name}/${mode}`, ...environment });
        const observations = await snapshot(page);
        for (const [name, selector, count] of productMarketingCoverage) {
          assert.equal(await page.locator(selector).count(), count, `${settings.name}/${mode}: ${name} coverage`);
        }
        assert.equal(await page.locator("[data-marketing-oracle]").count(), productMarketingConsumerCoverage.length);
        for (const name of productMarketingConsumerCoverage) {
          assert.equal(await page.locator(`[data-marketing-oracle="${name}"]`).count(), 1, `${settings.name}/${mode}: consumer ${name} coverage`);
        }
        results.set(mode, observations);
        assert.equal(await page.locator(".fixture-caller-last").evaluate((node) => getComputedStyle(node).paddingInlineStart), "37px");
        if (deliveryModes.includes(mode as typeof deliveryModes[number])) {
          assert.equal(await page.locator(".hraness-marketing-header").first().evaluate((node) => getComputedStyle(node).position), "sticky");
          // The isolated prop check removes only the fixture's legacy static override.
          assert.equal(await page.locator(".fixture-static-header").evaluate((node) => {
            node.classList.remove("fixture-static-header");
            const position = getComputedStyle(node).position;
            node.classList.add("fixture-static-header");
            return position;
          }), "static");
        }
        const summary = page.locator("details > summary").first();
        await page.keyboard.press("Shift");
        await summary.focus();
        assert.equal(await summary.evaluate((node) => node.matches(":focus-visible")), true, "Native summary must be keyboard-focused");
        await page.keyboard.press("Enter");
        await settle(page);
        assert.equal(await page.locator("details").first().getAttribute("open"), "");
        const matrix = await summary.evaluate((node) => getComputedStyle(node, "::after").transform);
        assert.match(matrix, /^matrix\(0\.70710\d*, 0\.70710\d*, -0\.70710\d*, 0\.70710\d*, 0, 0\)$/u);
        const state: Observation[] = [...await snapshot(page, ".hraness-marketing-question__summary, .hraness-marketing-question__answer, .hraness-marketing-question__answer [data-marketing-oracle]")];
        await page.keyboard.press("Space");
        await settle(page);
        assert.equal(await page.locator("details").first().getAttribute("open"), null);
        for (const [name, selector, index] of interactionCases) {
          const action = page.locator(selector).nth(index);
          assert.equal(await action.count(), 1, `Missing ${name} interaction`);
          await page.mouse.move(0, 0);
          await page.keyboard.press("Shift");
          await action.focus();
          await settle(page);
          assert.equal(await action.evaluate((node) => node.matches(":focus-visible")), true, `${name}: keyboard focus was not active`);
          state.push(...await snapshot(page, selector, index));
          await action.hover();
          await settle(page);
          state.push(...await snapshot(page, selector, index));
        }
        interactions.set(mode, state);
        if (settings.name === "desktop-light") await page.screenshot({ path: join(output, `${mode}.png`), fullPage: true });
        assert.deepEqual(failures, [], "Unexpected browser errors");
      } finally { await page.close(); }
    }
    assert.match(settings.name, /^[a-z][a-z-]*$/u, "Browser configuration name is not a safe evidence filename");
    const matrixSnapshot = Buffer.from(JSON.stringify({
      configuration: settings,
      modes: modes.map((mode) => ({
        interactions: required(interactions.get(mode), `${mode} interaction snapshot`),
        mode,
        observations: required(results.get(mode), `${mode} computed snapshot`),
      })),
      properties,
      schemaVersion: 1,
    }, null, 2) + "\n");
    assert.ok(matrixSnapshot.byteLength <= 64 * 1024 * 1024, "Browser matrix snapshot exceeds its byte bound");
    await writeFile(join(output, `matrix-${settings.name}.json`), matrixSnapshot, { flag: "wx" });
    const raw = required(results.get("static"), "raw baseline");
    const projected = required(results.get("projected-static"), "projected baseline");
    const rawInteractions = required(interactions.get("static"), "raw interactions");
    const projectedInteractions = required(interactions.get("projected-static"), "projected interactions");
    receipts.push({ label: `${settings.name}/projected-original`, slots: projected.length,
      assertions: compareProjectedToRaw(projected, raw, `${settings.name}/projected-original`)
        + compareProjectedToRaw(projectedInteractions, rawInteractions, `${settings.name}/projected-original/native-states`) });
    for (const mode of deliveryModes) {
      const label = `${settings.name}/${mode}`;
      const observations = required(results.get(mode), "delivery observations");
      receipts.push({ label, slots: observations.length,
        assertions: compareDeliveryToProjected(observations, projected, label)
          + compareDeliveryToProjected(required(interactions.get(mode), "delivery interactions"), projectedInteractions, `${label}/native-states`) });
    }
  }
  const deliveryMismatchSummary = {
    count: deliveryMismatchCount,
    samples: deliveryMismatchSamples,
    samplesTruncated: deliveryMismatchCount > deliveryMismatchSamples.length,
    schemaVersion: 1,
    sha256: deliveryMismatchHash.digest("hex"),
  };
  const mismatchEvidence = Buffer.from(JSON.stringify({ delivery: deliveryMismatchSummary, failures }, null, 2) + "\n");
  assert.ok(mismatchEvidence.byteLength <= 32 * 1024 * 1024, "Browser mismatch summary exceeds its byte bound");
  const mismatchEvidencePath = join(output, "mismatch-summary.json");
  await writeFile(mismatchEvidencePath, mismatchEvidence, { flag: "wx" });
  assert.deepEqual(failures, [], "Unexpected browser errors after all fixture pages closed");
  assert.equal(deliveryMismatchCount, 0,
    `Delivery differs from the projected original-source oracle; retained snapshots and mismatch summary: ${mismatchEvidencePath}`);
  const stylesheetHashes = { legacySha256,
    native: [...nativeOracle.assets].filter(([, asset]) => asset.contentType === "text/css").map(([url, asset]) => ({ url, sha256: createHash("sha256").update(asset.body).digest("hex") })).sort((a, b) => a.url.localeCompare(b.url)),
    projectedNative: [...projectedOracle.assets].filter(([, asset]) => asset.contentType === "text/css").map(([url, asset]) => ({ url, sha256: createHash("sha256").update(asset.body).digest("hex") })).sort((a, b) => a.url.localeCompare(b.url)),
    standalone: createHash("sha256").update(standalone).digest("hex"), compiler: createHash("sha256").update(compiler).digest("hex") };
  const evidence = { browserPath, browserVersion: browser.version(), legacySha256, stylesheetHashes, modes, coverage: productMarketingCoverage, consumerCoverage: productMarketingConsumerCoverage, interactionCases, environments, colorProbe: colorProbeReceipt, strictCsp,
    colorParityContract: "all non-color computed structure equals the byte-exact raw oracle; delivery colors equal the browser-computed original-source oracle after only exact numeric OKLab/OKLCH spans are projected by the pinned compiler; raw/projected color differences are reported and never asserted as native equivalence",
    originalSourceColorProjections: projectedOracle.projections,
    rawProjectedColorDifferences: [...rawColorDifferences].map(([sha256, difference]) => ({ sha256, ...difference })),
    rawProjectedColorDifferenceUsesSha256: rawColorDifferenceUseHash.digest("hex"), deliveryMismatchSummary, receipts, failures,
    assertions: receipts.reduce((sum, receipt) => sum + receipt.assertions, 0) };
  await writeFile(join(output, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify({ ...evidence, output }, null, 2));
} finally {
  await browser?.close();
  server?.stop(true);
}

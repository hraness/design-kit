import assert from "node:assert/strict";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import type { Browser, Page } from "playwright-core";
import type { ReactElement } from "react";
import { designPalettes, paletteColors } from "../src/palettes.js";
import { withTransparencyPreference } from "./browser-transparency.js";
import { requireHuePreservingOpacity } from "./color-mix-audit.js";

/** Read whole color-mix calls, including the nested custom-property fallbacks. */
function opacityRecipes(css: string) {
  const recipes: { expression: string; color: "surface" | "primary" | "info"; opacity: number }[] = [];
  for (const match of css.matchAll(/color-mix\(/gu)) {
    const start = match.index;
    let depth = 1, end = start + match[0].length;
    while (end < css.length && depth > 0) {
      if (css[end] === "(") depth++;
      if (css[end] === ")") depth--;
      end++;
    }
    assert.equal(depth, 0, "Complete Lantern color-mix expression required");
    const expression = css.slice(start, end);
    if (!/,\s*transparent\)$/u.test(expression)) continue;
    const percent = /\s(\d+)%\s*,\s*transparent\)$/u.exec(expression);
    assert(percent, "Each opacity recipe needs an explicit bounded percentage");
    const color = expression.includes("--surface") ? "surface"
      : expression.includes("--primary") || expression.includes("--hraness-material-warm") ? "primary"
        : expression.includes("--hraness-material-cool") ? "info" : undefined;
    assert(color, `Unadmitted Lantern opacity source: ${expression}`);
    recipes.push({ expression, color, opacity: Number(percent[1]) / 100 });
  }
  assert.equal(recipes.length, 7, "Every Lantern opacity-only recipe is included");
  return recipes;
}

function requireOpacitySpace(css: string) {
  const recipes = opacityRecipes(css);
  for (const { expression } of recipes) assert.match(expression, /^color-mix\(in srgb,/u, "Opacity-only Lantern paint must preserve its source hue");
  return recipes;
}

function channels(hex: string) {
  assert.match(hex, /^#[\da-f]{6}$/iu);
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}
function at<T>(values: readonly T[], index: number): T {
  const value = values[index];
  assert(value !== undefined, "Required paint channel or sample missing");
  return value;
}
function composite(color: string, background: string, opacity: number) {
  const under = channels(background);
  return [...channels(color).map((value, index) => Math.round(value * opacity + at(under, index) * (1 - opacity))), 255];
}
function matches(actual: readonly number[], expected: readonly number[]) {
  return actual.length === 4 && actual.every((value, index) => Math.abs(value - at(expected, index)) <= 2);
}

async function paintedColors(page: Page) {
  return page.evaluate(() => {
    const under = getComputedStyle(document.body).backgroundColor;
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (context === null) throw new Error("Native raster context required");
    return [...document.querySelectorAll<HTMLElement>("[data-opacity-probe]")].map((node) => {
      const style = getComputedStyle(node);
      if (!CSS.supports("color", style.backgroundColor)) throw new Error("Missing observed color");
      // Composite native CSS paint over its actual opaque page surface; opaque
      // pixels avoid low-alpha unpremultiplication noise in getImageData.
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = style.backgroundColor; context.fillRect(0, 0, 1, 1);
      const alpha = context.getImageData(0, 0, 1, 1).data[3];
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = under; context.fillRect(0, 0, 1, 1);
      context.fillStyle = style.backgroundColor; context.fillRect(0, 0, 1, 1);
      return { id: node.id, computed: style.backgroundColor, alpha, pixel: [...context.getImageData(0, 0, 1, 1).data] };
    });
  });
}

/** Native raster proof, shared by the maintained Lantern suite and focused runs. */
export async function verifyLanternOpacity(browser: Browser, material: string, output: string, requireOriginalHueLoss = false) {
  const recipes = requireOpacitySpace(material);
  const original = material.replaceAll("color-mix(in srgb,", "color-mix(in oklch,");
  assert.notEqual(original, material);
  // Reject restoring the old recipe even when a future browser fixes its hue
  // interpolation. The native negative-control pixels remain recorded below.
  assert.throws(() => requireOpacitySpace(original), /preserve its source hue/u);
  const cases: {
    palette: string;
    theme: "light" | "dark";
    actual: Awaited<ReturnType<typeof paintedColors>>;
    expected: number[][];
    negative: Awaited<ReturnType<typeof paintedColors>>;
    originalChromeLosesHue: boolean;
    originalRecipeRejected: true;
  }[] = [];
  for (const family of designPalettes) for (const theme of ["light", "dark"] as const) {
    const palette = paletteColors[family][theme];
    const page = await browser.newPage({ viewport: { width: 640, height: 420 }, colorScheme: theme });
    page.setDefaultTimeout(5_000);
    const markup = (source: string) => `<!doctype html><html lang="en"><head><style>${source}
      body {margin:0;padding:20px;background:${palette.background};color:${palette.foreground};--background:${palette.background};--surface:${palette.surface};--primary:${palette.primary};--info:${palette.info};--foreground:${palette.foreground}}
      [data-opacity-probe]{width:560px;height:32px;margin:8px 0;box-shadow:none;border:0}
      ${opacityRecipes(source).map(({ expression }, index) => `#recipe-${index}{background-color:${expression}}`).join("\n")}
      </style></head><body data-hraness-material="lantern"><div id="chrome" class="hraness-material-chrome" data-opacity-probe>Actual Lantern chrome</div>${recipes.map((_, index) => `<div id="recipe-${index}" data-opacity-probe>Opacity recipe ${index + 1}</div>`).join("")}</body></html>`;
    try {
      await page.setContent(markup(material));
      await withTransparencyPreference(page, "no-preference", async () => {
        const expected = [composite(palette.surface, palette.background, .9), ...recipes.map((recipe) => composite(palette[recipe.color], palette.background, recipe.opacity))];
        const actual = await paintedColors(page);
        assert.equal(actual.length, 8, "Real chrome and all seven source recipes must paint");
        actual.forEach((sample, index) => {
          assert(matches(sample.pixel, at(expected, index)), `${family} ${theme} ${sample.id} changed hue: ${JSON.stringify({ sample, expected: expected[index] })}`);
          const opacity = index === 0 ? .9 : at(recipes, index - 1).opacity;
          assert(sample.alpha !== undefined && Math.abs(sample.alpha - opacity * 255) <= 1, "Opacity must remain exact within native 8-bit quantization");
        });
        await page.screenshot({ path: join(output, `opacity-${family}-${theme}.png`) });
        await page.setContent(markup(original));
        const negative = await paintedColors(page);
        assert.equal(negative.length, actual.length);
        const originalChromeLosesHue = !matches(at(negative, 0).pixel, at(expected, 0));
        if (requireOriginalHueLoss && family === "tokyo-night") assert(originalChromeLosesHue, `Original OKLCH chrome must reproduce the observed ${theme} native hue-loss regression`);
        cases.push({ palette: family, theme, actual, expected, negative, originalChromeLosesHue, originalRecipeRejected: true });
      });
    } finally { await page.close(); }
  }
  return { browser: browser.version(), cases };
}

/** Exercise shipped header/Paper/compiler source rules across all canonical palettes. */
export async function verifySharedHeaderOpacity(browser: Browser, root: string) {
  const fixtures = [
    { file: "product-marketing-preset.css", className: "hraness-marketing-header-surface", paint: "--hraness-marketing-header-background", opacity: .82 },
    { file: "product-marketing-foundation.css", className: "hraness-marketing-header", paint: "--hraness-marketing-header-background", opacity: .82 },
    { file: "product-marketing.css", className: "hraness-marketing-header", paint: "--hraness-marketing-header-background", opacity: .82 },
    { file: "paper-theme.css", className: "hraness-marketing-header", paint: "--hraness-marketing-header-background", opacity: .82 },
    { file: "compiler-components.css", className: "hraness-design-top-bar", paint: "--hraness-design-top-bar-background", opacity: .9 },
  ];
  const sources = await Promise.all(fixtures.map(async (fixture) => {
    const css = await readFile(join(root, "src", fixture.file), "utf8");
    requireHuePreservingOpacity(css, fixture.file);
    return { ...fixture, css };
  }));
  const cases: { file: string; palette: string; theme: string; actual: Awaited<ReturnType<typeof paintedColors>>[number]; expected: number[]; negative: Awaited<ReturnType<typeof paintedColors>>[number]; originalLosesHue: boolean }[] = [];
  for (const family of designPalettes) for (const theme of ["light", "dark"] as const) {
    const palette = paletteColors[family][theme];
    const page = await browser.newPage({ viewport: { width: 640, height: 240 }, colorScheme: theme });
    page.setDefaultTimeout(5_000);
    try {
      await withTransparencyPreference(page, "no-preference", async () => {
        for (const fixture of sources) {
          const markup = (css: string) => `<!doctype html><html lang="en"><head><style>${css}
            body { margin:0; background:${palette.surface}; --background:${palette.background}; --foreground:${palette.foreground}; --surface:${palette.surface}; --hraness-marketing-background:${palette.background}; --hraness-marketing-ink:${palette.foreground}; }
            /* Match the public compiled atom's token seam without rebuilding
             * unrelated component artifacts in this focused source proof. */
            #header {width:560px;height:64px;background-color:var(${fixture.paint})}
            </style></head><body data-hraness-theme="paper" data-hraness-marketing-preset="editorial"><header id="header" class="${fixture.className}" data-surface="glass" data-opacity-probe>Header paint</header></body></html>`;
          await page.setContent(markup(fixture.css));
          const actual = at(await paintedColors(page), 0);
          const expected = composite(palette.background, palette.surface, fixture.opacity);
          assert(matches(actual.pixel, expected), `${fixture.file} ${family} ${theme} hue changed: ${JSON.stringify({ actual, expected })}`);
          assert(actual.alpha !== undefined && Math.abs(actual.alpha - fixture.opacity * 255) <= 1, `${fixture.file} opacity changed`);
          const original = fixture.css.replaceAll("color-mix(in srgb,", "color-mix(in oklch,");
          assert.throws(() => requireHuePreservingOpacity(original, fixture.file), /must use srgb/u);
          await page.setContent(markup(original));
          const negative = at(await paintedColors(page), 0);
          cases.push({ file: fixture.file, palette: family, theme, actual, expected, negative, originalLosesHue: !matches(negative.pixel, expected) });
        }
      });
    } finally { await page.close(); }
  }
  assert.equal(cases.length, 50, "All five header deliveries, palettes and modes must be observed");
  return { cases };
}

/** Validate the palette default through raw HTML and the compiled CTA's public token seam. */
export async function verifyMarketingPaletteActions(browser: Browser, root: string) {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { ProductHero } = await import(join(root, "dist/react/server.js")) as {
    ProductHero: (props: { heading: string; actions: { href: string; label: string }[]; backdrop: false }) => ReactElement;
  };
  const markup = renderToStaticMarkup(createElement(ProductHero, { heading: "Palette action", actions: [{ href: "#reference", label: "Continue" }], backdrop: false }));
  const standalone = await readFile(join(root, "src/product-marketing.css"), "utf8");
  const foundation = await readFile(join(root, "src/product-marketing-foundation.css"), "utf8");
  const atoms = await readFile(join(root, "dist/stylex.css"), "utf8");
  const deliveries = [{ name: "raw", css: standalone }, { name: "compiled", css: foundation + "\n" + atoms }];
  const cases: unknown[] = [];
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  const observe = () => page.locator('.hraness-marketing-action[data-emphasis="primary"]').evaluate((element) => {
    const style = getComputedStyle(element);
    const pixel = (color: string) => {
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d");
      if (context === null) throw new Error("Native color context required");
      context.fillStyle = color; context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data];
    };
    return { background: pixel(style.backgroundColor), foreground: pixel(style.color) };
  });
  try {
    for (const delivery of deliveries) for (const family of designPalettes) for (const theme of ["light", "dark"] as const) {
      const palette = paletteColors[family][theme];
      for (const explicit of [false, true]) {
        const background = explicit ? "#315a40" : palette.primary, foreground = explicit ? "#ffffff" : palette.primaryForeground;
        const source = delivery.css;
        const content = (css: string) => `<style>${css}</style><div style="--background:${palette.background};--foreground:${palette.foreground};--surface:${palette.surface};--primary:${palette.primary};--primary-foreground:${palette.primaryForeground};color-scheme:${theme};${explicit ? "--hraness-site-accent:#315a40;--hraness-site-accent-ink:#ffffff" : ""}">${markup}</div>`;
        await page.setContent(content(source));
        const actual = await observe();
        assert(matches(actual.background, [...channels(background), 255]), `${delivery.name} ${family} ${theme} CTA must use ${explicit ? "explicit product accent" : "palette primary"}`);
        assert(matches(actual.foreground, [...channels(foreground), 255]), `${delivery.name} ${family} ${theme} CTA ink must follow its matching semantic role`);
        if (!explicit) {
          const old = source.replace("var(--hraness-site-accent, var(--primary, oklch(0.55 0.21 262)))", "var(--hraness-site-accent, oklch(0.55 0.21 262))");
          assert.notEqual(old, source, "Default accent negative control must mutate the actual source");
          await page.setContent(content(old));
          assert(!matches((await observe()).background, actual.background), "Original blue default must fail the selected palette assertion");
        }
        cases.push({ delivery: delivery.name, palette: family, theme, explicit, actual, expected: { background, foreground } });
      }
    }
    // Preserve the prior standalone fallback when neither a palette nor a
    // product accent is provided. Use native conversion, not a guessed RGB.
    for (const delivery of deliveries) {
      await page.setContent(`<style>${delivery.css}</style>${markup}<div id="fallback" style="background:oklch(0.55 0.21 262);color:white"></div>`);
      const actual = await observe();
      const fallback = await page.locator("#fallback").evaluate((element) => ({ background: getComputedStyle(element).backgroundColor, foreground: getComputedStyle(element).color }));
      const action = await page.locator('.hraness-marketing-action[data-emphasis="primary"]').evaluate((element) => ({ background: getComputedStyle(element).backgroundColor, foreground: getComputedStyle(element).color }));
      assert.deepEqual(action, fallback, "Unconfigured consumers retain their existing standalone fallback");
      cases.push({ delivery: delivery.name, unconfigured: true, actual });
    }
  } finally { await page.close(); }
  assert.equal(cases.length, 42);
  return { cases };
}

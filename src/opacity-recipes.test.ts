import { expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { paperThemeCss } from "../scripts/generate-paper-theme.js";
import { colorMixExpressions, isOpacityOnlyMix, requireHuePreservingOpacity } from "../scripts/color-mix-audit.js";

function paintFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return paintFiles(path);
    return entry.name.endsWith(".css") || entry.name.endsWith(".stylex.ts") || entry.name.endsWith("-material.ts") ? [path] : [];
  });
}

test("owned CSS, StyleX and authored material opacity recipes preserve hue in every delivery source", () => {
  const scripts = join(import.meta.dir, "../scripts");
  const generators = readdirSync(scripts).filter((file) => /^generate-.*\.ts$/u.test(file)).map((file) => join(scripts, file));
  const files = [...paintFiles(import.meta.dir), ...generators];
  expect(files.length).toBeGreaterThan(20);
  let opacityCount = 0, perceptualCount = 0;
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    opacityCount += requireHuePreservingOpacity(source, file).length;
    perceptualCount += colorMixExpressions(source).filter((mix) => mix.space === "oklch" && !isOpacityOnlyMix(mix)).length;
  }
  expect(opacityCount).toBeGreaterThanOrEqual(140);
  expect(perceptualCount).toBeGreaterThan(0);
});

test("opacity audit rejects nested-fallback regressions without rejecting perceptual blends", () => {
  const colored = "color-mix(in oklch, var(--ink, color-mix(in srgb, #334455 80%, #fff)) 12%, var(--paper, Canvas))";
  expect(requireHuePreservingOpacity(colored, "two-colored reference")).toEqual([]);
  expect(colorMixExpressions(colored)).toHaveLength(2);
  for (const color of ["var(--background, Canvas)", "var(--surface, var(--ui-background, Canvas))", "currentColor", "oklch(.8 .02 263)"]) {
    const original = `color-mix(in oklch, ${color} 82%, transparent)`;
    expect(() => requireHuePreservingOpacity(original, "original negative control")).toThrow("opacity-only color-mix must use srgb");
    expect(requireHuePreservingOpacity(original.replace("in oklch,", "in srgb,"), "repair")).toHaveLength(1);
  }
  expect(() => requireHuePreservingOpacity("color-mix(in oklch, transparent 18%, #445566)", "reversed negative control")).toThrow("must use srgb");
  expect(() => requireHuePreservingOpacity("color-mix(in oklch, #445566, transparent", "truncated")).toThrow("Incomplete");
});

test("canonical Paper generator emits the checked opacity-safe snapshot", () => {
  expect(requireHuePreservingOpacity(paperThemeCss, "generated Paper")).toHaveLength(13);
  expect(readFileSync(join(import.meta.dir, "paper-theme.css"), "utf8")).toBe(paperThemeCss);
});

test("marketing accent defaults follow the palette while explicit product accents win", () => {
  for (const file of ["product-marketing.css", "product-marketing-foundation.css"]) {
    const source = readFileSync(join(import.meta.dir, file), "utf8");
    expect(source).toContain("--hraness-marketing-accent: var(--hraness-site-accent, var(--primary, oklch(0.55 0.21 262)));");
    expect(source).toContain("--hraness-marketing-accent-ink: var(--hraness-site-accent-ink, var(--primary-foreground, white));");
  }
});

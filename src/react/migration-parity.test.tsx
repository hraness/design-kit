import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import * as stylex from "@stylexjs/stylex";
import { createStylexTransformCollector } from "@hraness/ui/stylex-build";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup } from "react-dom/server";

import { appShellStyles } from "./app-shell.stylex.js";
import { chartStyles } from "./charts.stylex.js";
import { effectsStyles } from "./effects.stylex.js";
import { jellySurfaceStyles } from "./jelly-surface.stylex.js";
import { ThemeToggle } from "./theme.js";
import { themeStyles } from "./theme.stylex.js";

async function compileRecipes() {
  const collector = createStylexTransformCollector(process.cwd());
  for (const name of ["app-shell", "charts", "effects", "jelly-surface", "theme"]) {
    const filename = resolve(import.meta.dir, `${name}.stylex.ts`);
    const transformed = await collector.transform(await readFile(filename, "utf8"), filename);
    expect(transformed.code).not.toContain("inject(");
  }
  const rules = collector.seal();
  expect(rules.length).toBeGreaterThan(100);
  return (...recipes: readonly stylex.CompiledStyles[]): readonly string[] => {
    const tokens = new Set(stylex.props(...recipes).className?.split(" ") ?? []);
    expect(tokens.size).toBeGreaterThan(0);
    const owned = rules.filter(([name]) => tokens.has(name)).map(([, rule]) => rule.ltr);
    expect(owned.length).toBeGreaterThan(0);
    return owned;
  };
}

test("all ten former full-border owners retain the five border-image resets at their original media scope", async () => {
  const recipeRules = await compileRecipes();
  // A full border shorthand resets border-image; a logical side shorthand does not.
  const owners = [
    ["theme popover", themeStyles.popover, false],
    ["theme trigger", themeStyles.trigger, false],
    ["chart median", chartStyles.median, false],
    ["chart selectable row", chartStyles.selectableRow, false],
    ["chart tooltip", chartStyles.tooltip, false],
    ["procedural ripple", effectsStyles.proceduralRipple, false],
    ["chart bar", chartStyles.bar, true],
    ["chart range", chartStyles.range, true],
    ["chart track", chartStyles.track, true],
    ["jelly root", jellySurfaceStyles.root, true],
  ] as const;
  expect(owners).toHaveLength(10);
  const resets = [
    ["source", "none"], ["slice", "100%"], ["width", "1"],
    ["outset", "0"], ["repeat", "stretch"],
  ] as const;
  for (const [name, recipe, forcedOnly] of owners) {
    const css = recipeRules(recipe);
    for (const [property, value] of resets) {
      const declaration = new RegExp(`border-image-${property}:\\s*${value}(?:;|\\})`, "u");
      const matching = css.filter((rule) => declaration.test(rule));
      expect(matching.length, `${name}: border-image-${property}`).toBe(1);
      expect(matching[0]?.includes("forced-colors"), name).toBe(forcedOnly);
      if (forcedOnly) expect(matching[0]).toMatch(/@media\s*\(forced-colors:\s*active\)/u);
    }
  }
  for (const recipe of [appShellStyles.rail, appShellStyles.mobileTrigger]) {
    const css = recipeRules(recipe).join("");
    expect(css).toMatch(/border-(?:inline-end|block-end)-width:/u);
    expect(css).not.toContain("border-image-");
  }
});

test("all thirteen chart size declarations retain the physical coordinate contract", async () => {
  const recipeRules = await compileRecipes();
  const declarations = [
    [chartStyles.heading, "min-width", "0"],
    [chartStyles.legend, "min-width", "0"],
    [chartStyles.root, "min-width", "0"],
    [chartStyles.row, "min-width", "0"],
    [chartStyles.tooltipTerm, "min-width", "0"],
    [chartStyles.tooltip, "min-width", "152px"],
    [chartStyles.plot, "width", "100%"],
    [chartStyles.plot, "height", "clamp(250px,30vw,320px)"],
    [chartStyles.plot, "min-height", "250px"],
    [chartStyles.selectableRow, "width", "100%"],
    [chartStyles.selectableRow, "min-height", "var(--interactive-target-min)"],
    [chartStyles.legendRow, "width", "auto"],
    [chartStyles.legendRow, "min-height", "var(--interactive-target-compact)"],
  ] as const;
  expect(declarations).toHaveLength(13);
  for (const [recipe, property, value] of declarations) {
    const css = recipeRules(recipe).map((rule) => rule.replaceAll(/\s+/gu, ""));
    expect(css.filter((rule) => rule.includes(`{${property}:${value};}`) || rule.includes(`{${property}:${value}}`)), property).toHaveLength(1);
    expect(css.join("")).not.toMatch(/(?:min-)?(?:inline|block)-size:/u);
  }
});

test("AppShell retains all four forced-color border edges without creating ordinary side borders", async () => {
  const recipeRules = await compileRecipes();
  const css = recipeRules(appShellStyles.rail);
  for (const side of ["block-start", "block-end", "inline-start", "inline-end"]) {
    const matches = css.filter((rule) => new RegExp(`border-${side}-color:\\s*CanvasText(?:;|\\})`, "u").test(rule));
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatch(/@media\s*\(forced-colors:\s*active\)/u);
    const ordinary = css.filter((rule) => rule.includes(`border-${side}-`) && !rule.includes("forced-colors"));
    expect(ordinary.length).toBe(side === "inline-end" ? 3 : 0);
  }
});

test("chart legend padding preserves the physical shorthand and replaces row padding before serialization", async () => {
  const recipeRules = await compileRecipes();
  for (const selectable of [false, true]) {
    const css = recipeRules(chartStyles.row, ...(selectable ? [chartStyles.selectableRow] : []), chartStyles.legendRow);
    for (const [edge, token] of [["top", 1], ["right", 2], ["bottom", 1], ["left", 2]] as const) {
      const matches = css.filter((rule) => rule.includes(`padding-${edge}:`));
      expect(matches).toHaveLength(1);
      expect(matches[0]).toContain(`var(--space-${String(token)})`);
    }
    expect(css.join("")).not.toMatch(/padding-(?:block|inline)/u);
  }
});

test("the native chart browser oracle is the complete immutable pre-migration stylesheet", async () => {
  const verifier = await readFile(resolve(import.meta.dir, "../../scripts/gallery-browser.ts"), "utf8");
  const raw = verifier.match(/const rawChartParityCss = String\.raw`([^`]*)`;/u)?.[1];
  expect(raw).toBeDefined();
  expect(createHash("sha256").update(raw ?? "").digest("hex"))
    .toBe("406f148b88ae75131ebcf4e4bba63e6b4c4013dc74f863135c2ce9f3384f8c8d");
  expect(raw).not.toMatch(/\.x[\da-z]+\b/u);
  expect(verifier).toContain("@scope ([data-parity-raw])");
  expect(verifier).toContain("await requireMigrationParity(browser,");
});

test("segmented appearance retains its root atoms, readiness, radio semantics and caller-last order", async () => {
  const recipeRules = await compileRecipes();
  expect(recipeRules(themeStyles.root).join("")).toMatch(/display:\s*inline-flex/u);
  expect(recipeRules(themeStyles.root).join("")).toMatch(/min-inline-size:\s*0/u);
  for (const controlled of [false, true]) {
    const html = renderToStaticMarkup(
      controlled
        ? <ThemeToggle className="caller-parity" display="labels" onChange={() => undefined} presentation="segmented" value="light" />
        : <ThemeToggle className="caller-parity" display="labels" presentation="segmented" />,
    );
    const { document } = parseHTML(html);
    const root = document.querySelector(".hraness-design-theme-toggle");
    expect(root).not.toBeNull();
    expect(root?.className.split(" ")).toEqual([
      "hraness-design-theme-toggle",
      ...(stylex.props(themeStyles.root, !controlled && themeStyles.notReady).className?.split(" ") ?? []),
      "caller-parity",
    ]);
    expect(root?.getAttribute("data-ready")).toBe(String(controlled));
    expect(root?.getAttribute("aria-busy")).toBe(controlled ? null : "true");
    const radios = [...document.querySelectorAll('input[type="radio"]')];
    expect(radios).toHaveLength(3);
    for (const radio of radios) expect(radio.hasAttribute("disabled")).toBe(!controlled);
    expect(document.querySelectorAll('input[type="radio"][checked]')).toHaveLength(1);
    expect(html).not.toContain('data-presentation="menu"');
  }
});

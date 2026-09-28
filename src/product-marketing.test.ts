import { expect, test } from "bun:test";
import { foilMaterial } from "./foil-material";

const css = await Bun.file(new URL("./product-marketing.css", import.meta.url)).text();
const styles = await Bun.file(new URL("./styles.css", import.meta.url)).text();

test("the product-marketing entry is product-neutral and independently importable", () => {
  expect(css).toStartWith('@import "./syntax-highlighting.css";');
  expect(css).toContain("@layer components.hraness-design-kit.legacy {");
  expect(styles).not.toContain('@import "./syntax-highlighting.css";');
  expect(styles).toContain('@import "./product-marketing.css";');
  expect(css).toContain(".hraness-marketing-hero");
  expect(css).toContain(".hraness-marketing-flow");
  expect(css).toContain(".hraness-marketing-facts");
  expect(css).toContain(".hraness-marketing-install");
  expect(css).toContain(".hraness-marketing-proof-frame");
  expect(css).toContain(".hraness-marketing-section");
  expect(css).toContain(".hraness-marketing-interface-grid");
  expect(css).toContain(".hraness-marketing-card-row");
  expect(css).toContain(".hraness-marketing-main");
  expect(css).toContain("--hraness-sticky-offset");
  expect(css).toContain(".hraness-marketing-trust-grid");
  expect(css).toContain(".hraness-marketing-question");
  expect(css).toContain(".hraness-marketing-cta");
  expect(css).not.toMatch(/soloterm|atet|slopcamera|ghostget|wrench|message like me|peopleblade|\bhra\b/iu);
  // Surface depth is shared by raw and compiled recipes. Palette colors and
  // material highlights stay behind semantic roles, never product literals.
  expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/giu);
  expect(css).toContain("box-shadow: var(--hraness-marketing-surface-shadow)");
  expect(css).toContain("box-shadow: var(--hraness-marketing-chrome-shadow)");
});

test("automatic flow syntax does not override typography or base color owned by the component", async () => {
  const syntax = await Bun.file(new URL("./syntax-highlighting.css", import.meta.url)).text();
  const codeRule = syntax.match(/\.syntax-code\s*\{([^}]+)\}/u)?.[1];
  expect(codeRule).toBeDefined();
  expect(codeRule).not.toMatch(/(?:^|;)\s*(?:font(?:-[a-z-]+)?|color)\s*:/u);
  expect(css).toContain(".hraness-marketing-flow__code");
});

test("sticky marketing chrome publishes a document offset for siblings and skip targets", () => {
  expect(css).toContain("html:has(:is(.hraness-marketing-header, .hraness-marketing-header-surface):not([data-position=\"static\"]))");
  expect(css).toContain("scroll-padding-block-start: var(--hraness-sticky-offset)");
  expect(css).toContain("scroll-margin-block-start: var(--hraness-sticky-offset)");
  expect(css).toContain('.hraness-marketing-main[data-hraness-clearance="pad"]');
  expect(css).toContain(".hraness-sticky-below-chrome");
  expect(css).toContain("[data-hraness-sticky]");
  expect(css).toContain("inset-block-start: var(--hraness-sticky-offset)");
});

test("marketing card rows stretch to the tallest item and reserve two-line meta", () => {
  expect(css).toMatch(/\.hraness-marketing-card-row\s*\{[^}]*align-items: stretch/u);
  expect(css).toContain(".hraness-marketing-card-row > *");
  expect(css).toMatch(/\.hraness-marketing-card__meta\s*\{[^}]*min-block-size: calc\(var\(--hraness-marketing-card-meta-lines, 2\) \* 1\.45em\)/u);
  expect(css).toMatch(/\.hraness-marketing-card__title\s*\{[^}]*overflow-wrap: anywhere/u);
  expect(css).not.toMatch(/hraness-marketing-card__title[^}]*line-clamp/u);
});

test("marketing card art wells clip overflow and contain background paint", () => {
  expect(css).toMatch(/\.hraness-marketing-card\s*\{[^}]*position: relative/u);
  expect(css).toMatch(/\.hraness-marketing-card\s*\{[^}]*isolation: isolate/u);
  expect(css).toMatch(/\.hraness-marketing-card__art\s*\{[^}]*overflow: hidden/u);
  expect(css).toMatch(/\.hraness-marketing-card__art\s*\{[^}]*contain: paint/u);
  expect(css).toMatch(/\.hraness-marketing-card__art\s*\{[^}]*isolation: isolate/u);
  expect(css).toMatch(/\.hraness-marketing-card__art\s*\{[^}]*background-clip: border-box/u);
  expect(css).toMatch(/\.hraness-marketing-card__art\s*\{[^}]*background-origin: padding-box/u);
  expect(css).toMatch(/\.hraness-marketing-card__art\s*\{[^}]*max-inline-size: 100%/u);
  expect(css).toMatch(/\.hraness-marketing-card__art\s*\{[^}]*min-inline-size: 0/u);
});

test("the marketing grammar keeps compact, coarse-pointer, and forced-color contracts", () => {
  expect(css).toContain("@media (max-width: 48rem)");
  expect(css).toContain("@media (pointer: coarse)");
  expect(css).toContain("@media (forced-colors: active)");
  expect(css).toContain("grid-template-columns: minmax(0, 1fr)");
  expect(css).toContain("min-block-size: 3rem");
  expect(css).toContain("background: Canvas;");
  expect(css).toContain("color: CanvasText;");
  expect(css).not.toContain("transition:");
  expect(css).not.toContain("animation:");
});

test("the hero eyebrow is a plain muted label, not a badge", () => {
  const eyebrow = css.match(/\.hraness-marketing-hero__eyebrow \{([^}]*)\}/u)?.[1] ?? "";
  for (const declaration of ["padding: 0;", "border: 0;", "border-radius: 0;", "background: none;", "color: var(--hraness-marketing-muted);"]) expect(eyebrow).toContain(declaration);
  expect(css.split('.hraness-marketing-hero[data-tone="accent"] .hraness-marketing-hero__eyebrow {')[1]?.split("}")[0]).not.toMatch(/background|border/u);
});

test("the shared foil contract styles brand wordmarks and primary actions", () => {
  expect(css).toMatch(/\.hraness-foil,\s*\.hraness-marketing-action\[data-emphasis="primary"\]/u);
  expect(css).toMatch(/\.hraness-foil-text,\s*\.hraness-marketing-header__brand,\s*\.hraness-marketing-footer__brand\[data-foil\]/u);
  for (const stop of ["--hraness-foil-1", "--hraness-foil-2", "--hraness-foil-3",
    "--hraness-foil-4", "--hraness-foil-5", "--hraness-foil-6"]) {
    expect(css).toContain(`${stop}:`);
  }
  for (const input of ["--hraness-foil-x", "--hraness-foil-y", "--hraness-foil-glow"]) {
    expect(css).toContain(input);
  }
  expect(css).not.toContain("--hraness-foil-angle");
  expect(css).toContain("background-clip: text");
  expect(css).toContain("-webkit-text-fill-color: transparent");
  expect(css).toContain("-webkit-text-fill-color: CanvasText");
  expect(css).toContain("[data-foil]");
});

test("bordered foil surfaces keep a flat fill under one theme-aware monochrome edge", () => {
  const surface = css.match(/\.hraness-foil,\s*\.hraness-marketing-action\[data-emphasis="primary"\]\s*\{([^}]*)\}/u)?.[1] ?? "";
  expect(surface).toContain("border-width: 2px");
  expect(surface).toContain("border-style: solid");
  expect(surface).toContain(`border-color: ${foilMaterial.edge}`);
  expect(surface).toContain(`background-color: ${foilMaterial.surfaceFill}`);
  expect(surface).toContain(`box-shadow: ${foilMaterial.halo}`);
  // The spectrum image stays on wordmarks and marks; surfaces never paint it.
  expect(surface).not.toMatch(/background-image|background-clip|background-origin|gradient\(/u);
  expect(surface).not.toContain("var(--hraness-foil-1");
  const forcedColors = css.match(/@media \(forced-colors: active\)\s*\{([\s\S]*?)\n\}/u)?.[1] ?? "";
  expect(forcedColors).toMatch(/\.hraness-foil,[\s\S]*?border-color: ButtonText/u);
});

test("the darker dark foil palette keeps the pointer sheen visible", () => {
  expect(css).toContain('[data-theme="dark"], .dark');
  expect(css).toContain("@media (prefers-color-scheme: dark)");
  expect(css).toContain("--hraness-foil-1: oklch(0.56 0.16 340)");
  expect(css).toContain("--hraness-foil-6: oklch(0.62 0.16 305)");
  // The emphasis edge flips light/dark with the same two override paths.
  expect(css.match(/--hraness-foil-edge: white/gu)).toHaveLength(2);
});

test("the compiler-adopter foundation and compiled recipes carry the same foil contract", async () => {
  const foundation = await Bun.file(new URL("./product-marketing-foundation.css", import.meta.url)).text();
  const compiled = await Bun.file(new URL("./react/product-marketing.stylex.ts", import.meta.url)).text();
  const foilRecipes = await Bun.file(new URL("./react/foil.stylex.ts", import.meta.url)).text();
  const normalize = (text: string) => text.replace(/\s+/gu, "");
  // Every spectrum token the standalone roots declare is mirrored verbatim.
  for (const declaration of css.matchAll(/--hraness-foil-\d+:\s*[^;]+;/gu)) {
    expect(normalize(foundation)).toContain(normalize(declaration[0]));
  }
  // The compiled routes serialize the authored material verbatim: the fixed
  // direction, both moving-light fields, the spectrum band set, the flat
  // surface fill, the theme-aware monochrome edge, and the restrained halo.
  // Private --_hraness-foil-* stops carry the public override ahead of each
  // scheme default so product overrides and the dark palette survive
  // compilation.
  for (const literal of [
    '"--_hraness-foil-1"',
    '"var(--hraness-foil-1, oklch(0.89 0.065 337))"',
    '"var(--hraness-foil-1, oklch(0.56 0.16 340))"',
    "--hraness-foil-surface",
    "--hraness-foil-glow",
    foilMaterial.stylex.textImage,
    foilMaterial.surfaceFill,
    foilMaterial.edge,
    foilMaterial.edgeDark,
    foilMaterial.edgeColor,
    foilMaterial.halo,
  ]) {
    expect(compiled).toContain(literal);
    expect(foilRecipes).toContain(literal);
  }
  for (const literal of [`"2px solid ${foilMaterial.edgeColor}"`, '"2px solid ButtonText"']) {
    expect(compiled).toContain(literal);
  }
  expect(compiled).not.toContain('"2px solid transparent"');
  for (const literal of ['"border-top-width": "2px"', '"default": foilEdge', '"ButtonText"']) {
    expect(foilRecipes).toContain(literal);
  }
  expect(foilRecipes).not.toContain('"2px solid transparent"');
  expect(foilRecipes).toContain('"hraness-foil"');
  expect(foilRecipes).toContain('"hraness-foil-text"');
});


test("metallic text and marks preserve a restrained spectrum and mask fallback", async () => {
  const recipes = await Bun.file(new URL("./react/foil.stylex.ts", import.meta.url)).text();
  const compiled = await Bun.file(new URL("./react/product-marketing.stylex.ts", import.meta.url)).text();
  const normalize = (text: string) => text.replace(/\s+/gu, "");
  for (const source of [css, recipes, compiled]) {
    expect(source).toContain("--hraness-foil-image");
    expect(source).toContain("--hraness-foil-reflection, 14%");
    expect(source).toContain("linear-gradient(115deg");
    expect(source).not.toContain("--hraness-foil-angle");
    expect(source).not.toContain("conic-gradient(");
    expect(source).not.toContain("drop-shadow(0 0 0.3rem");
  }
  // The handwritten sheet serializes the raw (unprefixed-stop) projection.
  expect(normalize(css)).toContain(normalize(foilMaterial.raw.textImage));
  expect(normalize(css)).toContain(normalize(foilMaterial.edge));
  expect(normalize(css)).toContain(normalize(foilMaterial.surfaceFill));
  expect(css).toContain("mask-mode: alpha");
  expect(css).toContain("--hraness-foil-mask, linear-gradient(transparent, transparent)");
  expect(css).toMatch(/@media \(forced-colors: active\)\s*\{(?:[^{}]|\{[^}]*\})*\.hraness-foil-mark__paint \{ --_hraness-foil-mark-display: none; \}/u);
});


test("retired hero backdrops, light fields, and background textures cannot paint in raw markup", async () => {
  // Hand-authored pages that still ship the old backdrop hooks lose them entirely.
  expect(css).toMatch(/\.hraness-marketing-hero-backdrop \{\s*display: none;\s*\}/u);
  expect(css).not.toContain(".hraness-marketing-hero-backdrop__");
  expect(await Bun.file(new URL("./react/hero-backdrop.stylex.ts", import.meta.url)).exists()).toBe(false);
  for (const source of [css, await Bun.file(new URL("./product-marketing-foundation.css", import.meta.url)).text()]) {
    expect(source).not.toMatch(/--hraness-hero-(?:light|drift)-[xy]|--hraness-hero-proximity|data-hraness-hero-item/u);
    // Blur belongs only to sticky header paint, never to cards or content.
    for (const match of source.matchAll(/([^{}]*)\{[^{}]*backdrop-filter:/gu)) expect(match[1]).toMatch(/\.hraness-marketing-header\s*$/u);
  }
  // The accent band is one flat color: no grid tiling behind its text.
  const accent = css.split('.hraness-marketing-hero[data-tone="accent"] {')[1]?.split("}")[0] ?? "";
  expect(accent).toContain("background: var(--hraness-marketing-accent);");
  expect(accent).not.toContain("gradient(");
});

test("a ruled section directly after a framed component drops its redundant separator", () => {
  expect(css).toMatch(
    /\.hraness-marketing-install,[\s\S]*?\.hraness-marketing-proof-frame[\s\S]*?\+ :is\([\s\S]*?\.hraness-marketing-questions,[\s\S]*?\.hraness-marketing-cta[\s\S]*?\) \{\s*border-block-start: 0;/u,
  );
});

test("a marketing footer directly before the network footer joins one band", () => {
  // The composition keeps two landmarks and two edges while collapsing the
  // double spacing and aligning the network row to the marketing column.
  expect(css).toContain(".hraness-marketing-footer:has(+ .hraness-site-footer)");
  expect(css).toMatch(
    /\.hraness-marketing-footer:has\(\+ \.hraness-site-footer\)\s*\{\s*--hraness-marketing-footer-space:\s*2rem 1\.25rem;/u,
  );
  expect(css).toContain(".hraness-marketing-footer + .hraness-site-footer");
  expect(css).toMatch(
    /\.hraness-marketing-footer \+ \.hraness-site-footer\s*\{\s*--hraness-site-footer-measure:\s*calc\(min\(100%, var\(--hraness-marketing-measure, 72rem\)\) - 2 \* var\(--hraness-marketing-gutter/u,
  );
  // The seam is one shared column, not a second boxed band: the network
  // footer keeps its own hairline and the product row keeps its top rule.
  expect(css).toMatch(/\.hraness-marketing-footer\s*\{[^}]*border-block-start: var\(--hraness-marketing-rule\)/u);
});

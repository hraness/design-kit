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

test("the soft-accent hero eyebrow keeps readable label ink", () => {
  expect(css).toMatch(
    /\.hraness-marketing-hero__eyebrow\s*\{[^}]*background: var\(--hraness-marketing-accent-soft\);[^}]*color: var\(--hraness-marketing-muted\);[^}]*\}/u,
  );
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

test("the darker dark foil palette keeps the pointer sheen visible", () => {
  expect(css).toContain('[data-theme="dark"], .dark');
  expect(css).toContain("@media (prefers-color-scheme: dark)");
  expect(css).toContain("--hraness-foil-1: oklch(0.56 0.16 340)");
  expect(css).toContain("--hraness-foil-6: oklch(0.62 0.16 305)");
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
  // direction, both moving-light fields, the spectrum band set, the four-stop
  // surface clip, and the restrained halo. Private --_hraness-foil-* stops
  // carry the public override ahead of each scheme default so product
  // overrides and the dark palette survive compilation.
  for (const literal of [
    "linear-gradient(115deg, var(--_hraness-foil-1)",
    '"--_hraness-foil-1"',
    '"var(--hraness-foil-1, oklch(0.89 0.065 337))"',
    '"var(--hraness-foil-1, oklch(0.56 0.16 340))"',
    "--hraness-foil-surface",
    "--hraness-foil-glow",
    foilMaterial.stylex.surfaceImage,
    foilMaterial.stylex.textImage,
    foilMaterial.surfaceBackgroundClip,
    foilMaterial.halo,
  ]) {
    expect(compiled).toContain(literal);
    expect(foilRecipes).toContain(literal);
  }
  for (const literal of ['"2px solid transparent"', '"2px solid ButtonText"']) {
    expect(compiled).toContain(literal);
  }
  for (const literal of ['"border-top-width": "2px"', '"default": "transparent"', '"ButtonText"']) {
    expect(foilRecipes).toContain(literal);
  }
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
  expect(normalize(css)).toContain(normalize(foilMaterial.raw.surfaceImage));
  expect(css).toContain("mask-mode: alpha");
  expect(css).toContain("--hraness-foil-mask, linear-gradient(transparent, transparent)");
  expect(css).toMatch(/@media \(forced-colors: active\)\s*\{(?:[^{}]|\{[^}]*\})*\.hraness-foil-mark__paint \{ --_hraness-foil-mark-display: none; \}/u);
});


test("raw hero artwork stays inert and outside grid flow with the compiled recipe's exact light fields", async () => {
  const recipe = await Bun.file(new URL("./react/hero-backdrop.stylex.ts", import.meta.url)).text();
  const backdrop = css.match(/\.hraness-marketing-hero-backdrop\s*\{([^}]+)\}/u)?.[1] ?? "";
  for (const declaration of ["position: absolute", "inset: 0", "z-index: -1", "overflow: clip", "pointer-events: none", "contain: paint", "display: var(--hraness-pattern-decoration, block)"]) expect(backdrop).toContain(declaration);
  expect(backdrop).not.toContain("overflow: hidden");
  for (const match of recipe.matchAll(/backgroundImage: "([^"]+)"/gu)) expect(css).toContain(`background-image: ${match[1]};`);
  for (const [variation, position, size] of [["center", "50% 50%", null], ["east", "100% 25%", "140% 120%"], ["west", "0px 75%", "125% 150%"]] as const) {
    const rule = css.split(`.hraness-marketing-hero-backdrop__atmosphere[data-variation="${variation}"] {`)[1]?.split("}")[0];
    expect(rule).toContain(`background-position: ${position};`);
    if (size) expect(rule).toContain(`background-size: ${size};`);
  }
  expect(css).toContain('@media (forced-colors: active), (prefers-reduced-transparency: reduce) {\n  .hraness-marketing-hero-backdrop { opacity: 0; }');
});

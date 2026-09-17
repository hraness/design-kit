import { expect, test } from "bun:test";

const css = await Bun.file(new URL("./product-marketing.css", import.meta.url)).text();
const styles = await Bun.file(new URL("./styles.css", import.meta.url)).text();

test("the product-marketing entry is product-neutral and independently importable", () => {
  expect(css).toStartWith("@layer components.hraness-design-kit.legacy {");
  expect(styles).toContain('@import "./product-marketing.css";');
  expect(css).toContain(".hraness-marketing-hero");
  expect(css).toContain(".hraness-marketing-flow");
  expect(css).toContain(".hraness-marketing-facts");
  expect(css).toContain(".hraness-marketing-install");
  expect(css).toContain(".hraness-marketing-proof-frame");
  expect(css).toContain(".hraness-marketing-section");
  expect(css).toContain(".hraness-marketing-interface-grid");
  expect(css).toContain(".hraness-marketing-trust-grid");
  expect(css).toContain(".hraness-marketing-question");
  expect(css).toContain(".hraness-marketing-cta");
  expect(css).not.toMatch(/soloterm|atet|slopcamera|ghostget|wrench|message like me|peopleblade|\bhra\b/iu);
  // This neutral highlight uses an exact alpha byte so standalone CSS and the
  // compiler serialize identical paint. Product-specific hex colors stay out.
  expect(css.match(/#[0-9a-f]{3,8}\b/giu)).toEqual(["#ffffff1f"]);
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
  expect(css).toMatch(/\.hraness-foil-text,\s*\.hraness-marketing-header__brand/u);
  for (const stop of ["--hraness-foil-1", "--hraness-foil-2", "--hraness-foil-3",
    "--hraness-foil-4", "--hraness-foil-5", "--hraness-foil-6", "--hraness-foil-halo-alpha"]) {
    expect(css).toContain(`${stop}:`);
  }
  for (const input of ["--hraness-foil-x", "--hraness-foil-y", "--hraness-foil-angle", "--hraness-foil-glow"]) {
    expect(css).toContain(input);
  }
  expect(css).toContain("background-clip: text");
  expect(css).toContain("-webkit-text-fill-color: transparent");
  expect(css).toContain("-webkit-text-fill-color: CanvasText");
  expect(css).toContain("[data-foil]");
});

test("the darker dark foil palette keeps the pointer sheen visible", () => {
  expect(css).toContain('[data-theme="dark"], .dark');
  expect(css).toContain("@media (prefers-color-scheme: dark)");
  expect(css).toContain("--hraness-foil-1: oklch(0.56 0.16 340)");
  expect(css).toContain("--hraness-foil-halo-alpha: 0.45");
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
  expect(normalize(foundation)).toContain(normalize("--hraness-foil-halo-alpha: 0.3;"));
  // The compiled route serializes the same image and token literals. Private
  // --_hraness-foil-* stops carry the public override ahead of each scheme
  // default so product overrides and the dark palette survive compilation.
  for (const literal of [
    "conic-gradient(from var(--hraness-foil-angle, 135deg), var(--_hraness-foil-1)",
    '"--_hraness-foil-1"',
    '"var(--hraness-foil-1, oklch(0.89 0.065 337))"',
    '"var(--hraness-foil-1, oklch(0.56 0.16 340))"',
    "--hraness-foil-surface",
    "--hraness-foil-glow",
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

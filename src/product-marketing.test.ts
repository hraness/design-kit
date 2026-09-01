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
  expect(css).not.toMatch(/soloterm|atet|wrench|message like me|peopleblade|\bhra\b/iu);
  expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/iu);
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

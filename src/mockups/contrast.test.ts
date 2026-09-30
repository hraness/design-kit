import { describe, expect, test } from "bun:test";

import { paletteContrast } from "../palette-color.js";
import { designPalettes, paletteColors } from "../palettes.js";

const css = await Bun.file(new URL("../mockups.css", import.meta.url)).text();

describe("mockup control color pairs", () => {
  test("every text-bearing accent fill consumes its matching foreground", () => {
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/gu)]
      .map((match) => ({ selector: match[1]?.trim() ?? "", declarations: match[2] ?? "" }))
      .filter(({ declarations }) => /background:\s*var\(--hkm-accent\);/u.test(declarations));
    // The running dot carries no text. Every other solid fill has a label or glyph.
    const decorative = ".hkm-root .hkm-agent-turn[data-hkm-tone=\"running\"] .hkm-agent-status";
    const filled = rules.filter(({ selector }) => selector !== decorative);
    expect(filled.length).toBeGreaterThanOrEqual(4);
    for (const { declarations } of filled) {
      expect(declarations).toContain("color: var(--hkm-accent-foreground);");
    }
    expect(css).toContain("--hkm-accent-foreground: var(--hraness-site-accent-ink, var(--primary-foreground, #ffffff));");
    expect(css).toMatch(/\.hkm-popover-item\[data-hkm-selected\] \.hkm-popover-detail\s*\{\s*color: inherit;/u);
    expect(css).toMatch(/\.hkm-popover-item\[data-hkm-selected\] \.hkm-popover-dot\s*\{\s*background: currentColor;/u);
  });

  test("neutral fill and ink inherit the same palette instead of mixing pinned and page colors", () => {
    for (const role of [
      "--hkm-sc-bg: var(--background,",
      "--hkm-sc-field: var(--surface-raised,",
      "--hkm-sc-fg: var(--foreground,",
      "--hkm-sc-muted: var(--muted,",
      "--hkm-sc-line: var(--line,",
    ]) expect(css).toContain(role);
    expect(css).toMatch(/\.hkm-step-button:disabled\s*\{[^}]*background: var\(--hkm-sc-field\);[^}]*color: var\(--hkm-sc-muted\);/u);
    expect(css).not.toMatch(/\.hkm-step-button:disabled\s*\{[^}]*opacity:/u);
    expect(css).toMatch(/\.hkm-segmented button\[aria-pressed="true"\]:focus-visible\s*\{\s*outline-color: var\(--hkm-accent-foreground\);/u);
  });

  for (const palette of designPalettes) {
    for (const mode of ["light", "dark"] as const) {
      test(`${palette} ${mode} pairs accent, inverse, and disabled control colors at 4.5:1 or better`, () => {
        const colors = paletteColors[palette][mode];
        for (const [fill, ink] of [
          [colors.primary, colors.primaryForeground],
          [colors.foreground, colors.background],
          [colors.line, colors.foreground],
          [colors.surfaceRaised, colors.muted],
        ]) {
          if (fill === undefined || ink === undefined) throw new Error("Missing control color.");
          expect(paletteContrast(fill, ink)).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  }

  test("standalone light and dark fallback pairs remain readable", () => {
    for (const [fill, ink] of [
      ["#2f6fed", "#ffffff"],
      ["#fafafa", "#15171a"],
      ["#141518", "#eceef1"],
      ["#e3e5e8", "#15171a"],
      ["#2c2e34", "#eceef1"],
      ["#ffffff", "#5e6570"],
      ["#1e1f23", "#9ba2ac"],
    ]) {
      if (fill === undefined || ink === undefined) throw new Error("Missing fallback color.");
      expect(paletteContrast(fill, ink)).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("accent-filled labels keep system color pairs and visible focus in forced colors", () => {
    const forced = css.slice(css.indexOf("@media (forced-colors: active)"));
    for (const selector of [
      '.hkm-segmented button[aria-pressed="true"],',
      ".hkm-tab[data-hkm-done] .hkm-step-number,",
      ".hkm-popover-item[data-hkm-selected],",
      ".hkm-work-mark",
    ]) expect(forced).toContain(selector);
    expect(forced).toContain("background: Highlight;");
    expect(forced).toContain("color: HighlightText;");
    expect(forced).toMatch(/\.hkm-segmented button\[aria-pressed="true"\]:focus-visible\s*\{\s*outline-color: HighlightText;/u);
    expect(forced).toMatch(/\.hkm-segmented button\[aria-pressed="true"\]:disabled\s*\{\s*background: ButtonFace;\s*color: GrayText;/u);
  });
});

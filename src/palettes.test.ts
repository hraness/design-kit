import { describe, expect, test } from "bun:test";
import fc from "fast-check";
import { designPalettes, isDesignPalette, paletteColors } from "./palettes.js";
import { getDesignPaletteTheme } from "./palette-themes.js";
import { paletteContrast } from "./palette-color.js";

describe("semantic palettes", () => {
  for (const palette of designPalettes) {
    for (const mode of ["light", "dark"] as const) {
      test(`${palette} ${mode} keeps text, controls, and status readable`, () => {
        const colors = paletteColors[palette][mode];
        const surfaces = [colors.background, colors.surface, colors.surfaceRaised, colors.surfaceHover];
        for (const surface of surfaces) {
          expect(paletteContrast(colors.foreground, surface)).toBeGreaterThanOrEqual(7);
          expect(paletteContrast(colors.muted, surface)).toBeGreaterThanOrEqual(4.5);
          expect(paletteContrast(colors.controlBorder, surface)).toBeGreaterThanOrEqual(3);
          expect(paletteContrast(colors.focus, surface)).toBeGreaterThanOrEqual(3);
          for (const role of ["primary", "danger", "warning", "success", "info"] as const) {
            expect(paletteContrast(colors[role], surface)).toBeGreaterThanOrEqual(4.5);
            expect(paletteContrast(colors[role], colors[`${role}Soft`])).toBeGreaterThanOrEqual(4.5);
            expect(paletteContrast(colors[role], colors[`${role}Foreground`])).toBeGreaterThanOrEqual(4.5);
          }
        }
        expect(getDesignPaletteTheme(palette, mode).background).toBe(colors.background);
        expect(getDesignPaletteTheme(palette, mode).className).toStartWith("hraness-palette ");
      });
    }
  }
  test("every mode has a complete recipe and distinct compiled class", () => {
    const keys = Object.keys(paletteColors.catppuccin.dark).sort();
    const themes = designPalettes.flatMap((palette) => ["light", "dark"].map((mode) => {
      expect(Object.keys(paletteColors[palette][mode as "light" | "dark"]).sort()).toEqual(keys);
      return getDesignPaletteTheme(palette, mode as "light" | "dark").className;
    }));
    expect(new Set(themes).size).toBe(8);
  });
  test("foreign palette values never expand the closed set", () => {
    fc.assert(fc.property(fc.anything(), (value) => {
      expect(isDesignPalette(value)).toBe(designPalettes.some((palette) => palette === value));
    }));
  });
  test("contrast is symmetric and bounded for opaque sRGB colors", () => {
    const hex = fc.integer({ min: 0, max: 0xffffff }).map((value) => `#${value.toString(16).padStart(6, "0")}`);
    fc.assert(fc.property(hex, hex, (a, b) => {
      expect(paletteContrast(a, b)).toBe(paletteContrast(b, a));
      expect(paletteContrast(a, b)).toBeGreaterThanOrEqual(1);
      expect(paletteContrast(a, b)).toBeLessThanOrEqual(21);
      expect(paletteContrast(a, a)).toBe(1);
    }));
    expect(paletteContrast("#000000", "#ffffff")).toBe(21);
  });
});

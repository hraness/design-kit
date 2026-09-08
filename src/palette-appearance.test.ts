import { expect, test } from "bun:test";
import fc from "fast-check";
import { designThemes } from "./appearance";
import { defaultDesignPalettePreference, normalizeDesignPalettePreference, parseDesignPalettePreference, resolveDesignPalettePreference } from "./palette-appearance";
import { designPalettes } from "./palettes";

test("palette preferences default to Catppuccin dark and reject incomplete foreign values", () => {
  expect(defaultDesignPalettePreference).toEqual({ palette: "catppuccin", mode: "dark" });
  for (const value of [undefined, null, "dark", "{", [], { palette: "catppuccin" }, { palette: "other", mode: "dark" }, { palette: "gruvbox", mode: "other" }, "x".repeat(257)]) {
    expect(parseDesignPalettePreference(value)).toBeNull();
    expect(normalizeDesignPalettePreference(value)).toEqual(defaultDesignPalettePreference);
  }
});

test("all palette and mode preferences round trip through persisted JSON", () => {
  fc.assert(fc.property(fc.constantFrom(...designPalettes), fc.constantFrom(...designThemes), (palette, mode) => {
    const preference = { palette, mode };
    expect(parseDesignPalettePreference(JSON.stringify(preference))).toEqual(preference);
    expect(normalizeDesignPalettePreference(preference)).toEqual(preference);
    for (const dark of [false, true]) {
      expect(resolveDesignPalettePreference(preference, dark)).toEqual({ palette, mode: mode === "system" ? (dark ? "dark" : "light") : mode });
    }
  }));
});

test("arbitrary JSON never escapes the finite preference contract", () => {
  fc.assert(fc.property(fc.jsonValue(), (value) => {
    const parsed = normalizeDesignPalettePreference(value);
    expect(designPalettes).toContain(parsed.palette);
    expect(designThemes).toContain(parsed.mode);
  }));
});

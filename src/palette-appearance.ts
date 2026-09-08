import { isDesignTheme, resolveDesignTheme, type ConcreteDesignTheme, type DesignTheme } from "./appearance.js";
import { isDesignPalette, type DesignPalette } from "./palettes.js";

export interface DesignPalettePreference {
  readonly palette: DesignPalette;
  readonly mode: DesignTheme;
}

export interface ConcreteDesignPalettePreference extends DesignPalettePreference {
  readonly mode: ConcreteDesignTheme;
}

export const defaultDesignPalettePreference: ConcreteDesignPalettePreference = Object.freeze({
  palette: "catppuccin",
  mode: "dark",
});
export const designPaletteStorageKey = "hraness-design-palette-v1";

/** Parses persisted JSON and application values without accepting partial preferences. */
export function parseDesignPalettePreference(value: unknown): DesignPalettePreference | null {
  if (typeof value === "string") {
    if (value.length > 256) return null;
    try { value = JSON.parse(value) as unknown; } catch { return null; }
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (!isDesignPalette(record.palette) || !isDesignTheme(record.mode)) return null;
  return Object.freeze({ palette: record.palette, mode: record.mode });
}

export function normalizeDesignPalettePreference(
  value: unknown,
  fallback: DesignPalettePreference = defaultDesignPalettePreference,
): DesignPalettePreference {
  return parseDesignPalettePreference(value)
    ?? parseDesignPalettePreference(fallback)
    ?? defaultDesignPalettePreference;
}

export function resolveDesignPalettePreference(
  preference: DesignPalettePreference,
  systemPrefersDark: boolean,
): ConcreteDesignPalettePreference {
  return { palette: preference.palette, mode: resolveDesignTheme(preference.mode, systemPrefersDark) };
}

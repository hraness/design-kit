import type { ConcreteDesignTheme } from "./appearance.js";
import { mixPaletteColor, paletteContrast, readablePaletteColor } from "./palette-color.js";

export const designPalettes = ["catppuccin", "gruvbox", "rose-pine", "tokyo-night"] as const;
export type DesignPalette = (typeof designPalettes)[number];

export const designPaletteLabels: Readonly<Record<DesignPalette, string>> = {
  catppuccin: "Catppuccin",
  gruvbox: "Gruvbox",
  "rose-pine": "Rosé Pine",
  "tokyo-night": "Tokyo Night",
};

export function isDesignPalette(value: unknown): value is DesignPalette {
  return typeof value === "string" && designPalettes.some((palette) => palette === value);
}

interface PaletteSource {
  readonly background: string;
  readonly surface: string;
  readonly raised: string;
  readonly hover: string;
  readonly text: string;
  readonly muted: string;
  readonly border: string;
  readonly primary: string;
  readonly danger: string;
  readonly warning: string;
  readonly success: string;
  readonly info: string;
  readonly violet: string;
  readonly rose: string;
}

/** Official palette seeds; provenance and application adaptations are in PALETTES.md. */
export const designPaletteSources: Readonly<Record<DesignPalette, Readonly<Record<ConcreteDesignTheme, PaletteSource>>>> = {
  catppuccin: {
    dark: {
      background: "#1e1e2e", surface: "#181825", raised: "#313244", hover: "#45475a",
      text: "#cdd6f4", muted: "#a6adc8", border: "#7f849c", primary: "#89b4fa",
      danger: "#f38ba8", warning: "#f9e2af", success: "#a6e3a1", info: "#89dceb",
      violet: "#cba6f7", rose: "#f5c2e7",
    },
    light: {
      background: "#eff1f5", surface: "#e6e9ef", raised: "#dce0e8", hover: "#ccd0da",
      text: "#4c4f69", muted: "#6c6f85", border: "#7c7f93", primary: "#1e66f5",
      danger: "#d20f39", warning: "#df8e1d", success: "#40a02b", info: "#179299",
      violet: "#8839ef", rose: "#ea76cb",
    },
  },
  gruvbox: {
    dark: {
      background: "#282828", surface: "#1d2021", raised: "#3c3836", hover: "#504945",
      text: "#ebdbb2", muted: "#bdae93", border: "#928374", primary: "#83a598",
      danger: "#fb4934", warning: "#fabd2f", success: "#b8bb26", info: "#8ec07c",
      violet: "#d3869b", rose: "#fe8019",
    },
    light: {
      background: "#fbf1c7", surface: "#f9f5d7", raised: "#ebdbb2", hover: "#d5c4a1",
      text: "#3c3836", muted: "#665c54", border: "#7c6f64", primary: "#076678",
      danger: "#9d0006", warning: "#b57614", success: "#79740e", info: "#427b58",
      violet: "#8f3f71", rose: "#af3a03",
    },
  },
  "rose-pine": {
    dark: {
      background: "#191724", surface: "#1f1d2e", raised: "#26233a", hover: "#403d52",
      text: "#e0def4", muted: "#908caa", border: "#908caa", primary: "#c4a7e7",
      danger: "#eb6f92", warning: "#f6c177", success: "#9ccfd8", info: "#ebbcba",
      violet: "#c4a7e7", rose: "#ebbcba",
    },
    light: {
      background: "#faf4ed", surface: "#fffaf3", raised: "#f2e9e1", hover: "#dfdad9",
      text: "#575279", muted: "#797593", border: "#797593", primary: "#907aa9",
      danger: "#b4637a", warning: "#ea9d34", success: "#286983", info: "#56949f",
      violet: "#907aa9", rose: "#d7827e",
    },
  },
  "tokyo-night": {
    dark: {
      background: "#1a1b26", surface: "#16161e", raised: "#24283b", hover: "#292e42",
      text: "#c0caf5", muted: "#a9b1d6", border: "#737aa2", primary: "#7aa2f7",
      danger: "#f7768e", warning: "#e0af68", success: "#9ece6a", info: "#7dcfff",
      violet: "#bb9af7", rose: "#ff9e64",
    },
    light: {
      background: "#e1e2e7", surface: "#d0d5e3", raised: "#c4c8da", hover: "#b7c1e3",
      text: "#3760bf", muted: "#6172b0", border: "#6172b0", primary: "#2e7de9",
      danger: "#f52a65", warning: "#8c6c3e", success: "#587539", info: "#007197",
      violet: "#9854f1", rose: "#b15c00",
    },
  },
};

function createPalette(source: PaletteSource, mode: ConcreteDesignTheme) {
  const surfaces = [source.background, source.surface, source.raised, source.hover];
  const endpoint = mode === "dark" ? "#ffffff" : "#000000";
  const foreground = readablePaletteColor(source.text, endpoint, surfaces, 7);
  const muted = readablePaletteColor(source.muted, endpoint, surfaces, 4.6);
  const status = (seed: string) => {
    const soft = mixPaletteColor(source.background, seed, 0.12);
    const color = readablePaletteColor(seed, endpoint, [...surfaces, soft], 4.6);
    const onColor = paletteContrast(color, source.background) >= 4.5 ? source.background : endpoint === "#ffffff" ? "#000000" : "#ffffff";
    return { color, foreground: onColor, soft };
  };
  const primary = status(source.primary);
  const danger = status(source.danger);
  const warning = status(source.warning);
  const success = status(source.success);
  const info = status(source.info);
  return Object.freeze({
    background: source.background, foreground, muted, faint: muted,
    grid: source.raised, line: source.hover,
    controlBorder: readablePaletteColor(source.border, endpoint, surfaces, 3.1),
    surface: source.surface, surfaceRaised: source.raised, surfaceHover: source.hover,
    card: source.surface, cardForeground: foreground,
    popover: source.raised, popoverForeground: foreground,
    primary: primary.color, primaryForeground: primary.foreground, primarySoft: primary.soft,
    secondary: source.raised, secondaryForeground: foreground,
    accent: primary.soft, accentForeground: foreground,
    focus: primary.color, scrim: mode === "dark" ? "#000000b8" : "#00000070",
    disabled: source.raised, disabledForeground: muted,
    inverse: foreground, inverseForeground: source.background,
    danger: danger.color, dangerForeground: danger.foreground, dangerSoft: danger.soft,
    warning: warning.color, warningForeground: warning.foreground, warningSoft: warning.soft,
    success: success.color, successForeground: success.foreground, successSoft: success.soft,
    info: info.color, infoForeground: info.foreground, infoSoft: info.soft,
    chart1: readablePaletteColor(source.rose, endpoint, surfaces, 4.6),
    chart2: success.color, chart3: info.color, chart4: warning.color,
    chart5: readablePaletteColor(source.violet, endpoint, surfaces, 4.6),
  });
}

export type SemanticPalette = ReturnType<typeof createPalette>;

/** The same opaque values drive compiled StyleX themes, metadata, and contrast tests. */
export const paletteColors: Readonly<Record<DesignPalette, Readonly<Record<ConcreteDesignTheme, SemanticPalette>>>> = Object.freeze({
  catppuccin: Object.freeze({ light: createPalette(designPaletteSources.catppuccin.light, "light"), dark: createPalette(designPaletteSources.catppuccin.dark, "dark") }),
  gruvbox: Object.freeze({ light: createPalette(designPaletteSources.gruvbox.light, "light"), dark: createPalette(designPaletteSources.gruvbox.dark, "dark") }),
  "rose-pine": Object.freeze({ light: createPalette(designPaletteSources["rose-pine"].light, "light"), dark: createPalette(designPaletteSources["rose-pine"].dark, "dark") }),
  "tokyo-night": Object.freeze({ light: createPalette(designPaletteSources["tokyo-night"].light, "light"), dark: createPalette(designPaletteSources["tokyo-night"].dark, "dark") }),
});

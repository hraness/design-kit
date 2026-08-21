// src/appearance.ts
var designThemes = ["light", "dark", "system"];
var defaultDesignTheme = "system";
var designThemeStorageKey = "hraness-design-theme-v1";
function isDesignTheme(value) {
  return typeof value === "string" && designThemes.some((theme) => theme === value);
}
function normalizeDesignTheme(value) {
  return isDesignTheme(value) ? value : defaultDesignTheme;
}
function designThemeLabel(theme, labels) {
  return labels?.[theme] ?? `${theme.charAt(0).toUpperCase()}${theme.slice(1)}`;
}
function resolveDesignTheme(theme, systemPrefersDark) {
  return theme === "system" ? systemPrefersDark ? "dark" : "light" : theme;
}

// src/index.ts
var colors = {
  light: {
    background: "#fbf6f2",
    foreground: "#201b19",
    muted: "#6b625d",
    faint: "#6b625d",
    grid: "#eaded8",
    line: "#bbaaa2",
    controlBorder: "#8f8f8f",
    surface: "#ffffff",
    surfaceRaised: "#f3ece8",
    surfaceHover: "#eaded8",
    card: "#ffffff",
    cardForeground: "#201b19",
    popover: "#ffffff",
    popoverForeground: "#201b19",
    primary: "#201b19",
    primaryForeground: "#fbf6f2",
    secondary: "#f3ece8",
    secondaryForeground: "#201b19",
    accent: "#eaded8",
    accentForeground: "#201b19",
    info: "#0d61ac",
    infoSoft: "#d8eaff",
    focus: "#0d61ac",
    scrim: "rgba(2, 2, 2, 0.44)",
    disabled: "#e8ded9",
    disabledForeground: "#717171",
    inverse: "#201b19",
    inverseForeground: "#fbf6f2",
    success: "#2d6a42",
    successSoft: "rgba(45, 106, 66, 0.12)",
    warning: "#785f28",
    warningSoft: "rgba(120, 95, 40, 0.12)",
    danger: "#9f3631",
    dangerSoft: "rgba(159, 54, 49, 0.12)"
  },
  dark: {
    background: "#000000",
    foreground: "#f2f2ed",
    muted: "#8f938c",
    faint: "#8f938c",
    grid: "#1c1e1b",
    line: "#5f645d",
    controlBorder: "#666666",
    surface: "#0d0e0c",
    surfaceRaised: "#161814",
    surfaceHover: "#1c1e1b",
    card: "#0d0e0c",
    cardForeground: "#f2f2ed",
    popover: "#161814",
    popoverForeground: "#f2f2ed",
    primary: "#f2f2ed",
    primaryForeground: "#0d0e0c",
    secondary: "#252820",
    secondaryForeground: "#f2f2ed",
    accent: "#1c1e1b",
    accentForeground: "#f2f2ed",
    info: "#6aa9ed",
    infoSoft: "#152d46",
    focus: "#6aa9ed",
    scrim: "rgba(0, 0, 0, 0.72)",
    disabled: "#262626",
    disabledForeground: "#777777",
    inverse: "#f2f2ed",
    inverseForeground: "#0d0e0c",
    success: "#76b38e",
    successSoft: "rgba(118, 179, 142, 0.12)",
    warning: "#c9ad74",
    warningSoft: "rgba(201, 173, 116, 0.12)",
    danger: "#e18982",
    dangerSoft: "rgba(225, 137, 130, 0.12)"
  }
};
var auroraColors = {
  light: {
    violet: "oklch(0.82 0.048 312)",
    rose: "oklch(0.85 0.044 12)",
    gold: "oklch(0.92 0.036 96)",
    mint: "oklch(0.9 0.036 172)",
    cyan: "oklch(0.84 0.042 236)"
  },
  dark: {
    violet: "oklch(0.58 0.045 312)",
    rose: "oklch(0.61 0.04 12)",
    gold: "oklch(0.69 0.035 96)",
    mint: "oklch(0.63 0.035 172)",
    cyan: "oklch(0.6 0.04 236)"
  }
};
var chromeColors = {
  light: {
    deep: "rgb(52 52 64)",
    shadow: "rgb(58 58 72)",
    mid: "rgb(92 92 106)",
    high: "rgb(88 88 100)",
    glint: "rgb(100 100 112)"
  },
  dark: {
    deep: "rgb(100 102 122)",
    shadow: "rgb(112 114 136)",
    mid: "rgb(166 168 190)",
    high: "rgb(158 160 182)",
    glint: "rgb(178 180 200)"
  }
};
var chromeGradientStops = {
  light: [
    [0, "rgb(52 52 64)"],
    [10, "rgb(88 88 100)"],
    [20, "rgb(58 58 72)"],
    [32, "rgb(100 100 112)"],
    [42, "rgb(64 64 78)"],
    [52, "rgb(92 92 106)"],
    [62, "rgb(54 54 68)"],
    [72, "rgb(86 86 100)"],
    [82, "rgb(56 56 70)"],
    [91, "rgb(80 80 94)"],
    [100, "rgb(60 60 74)"]
  ],
  dark: [
    [0, "rgb(100 102 122)"],
    [10, "rgb(158 160 182)"],
    [20, "rgb(112 114 136)"],
    [32, "rgb(178 180 200)"],
    [42, "rgb(122 124 148)"],
    [52, "rgb(166 168 190)"],
    [62, "rgb(106 108 132)"],
    [72, "rgb(160 162 186)"],
    [82, "rgb(110 112 136)"],
    [91, "rgb(152 154 178)"],
    [100, "rgb(118 120 142)"]
  ]
};
var spacing = [0, 4, 8, 12, 16, 20, 24, 32, 48, 64];
var radius = { sharp: 0, sm: 4, md: 8, lg: 12, round: 999 };
var controlRadius = 16;
var layout = {
  chromeInset: 8,
  edgeInset: 24
};
var siteThemes = {
  plain: {
    bodyClassName: "plain-site",
    footerClassName: "plain-footer",
    pageClassName: "plain-page"
  }
};
var interaction = {
  compactTarget: 40,
  minimumTarget: 48,
  controlHeight: 52,
  primaryControlHeight: 56,
  transportControlHeight: 64
};
var motion = {
  duration: {
    instant: 0,
    fast: 120,
    standard: 180,
    slow: 280
  },
  distance: {
    railEnter: 14,
    railExit: 10
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.16, 1, 0.3, 1)"
  }
};
var elevation = {
  none: "none",
  low: "0 1px 2px oklch(0 0 0 / 0.08)",
  raised: "0 8px 24px -12px oklch(0 0 0 / 0.22)",
  overlay: "0 18px 48px -18px oklch(0 0 0 / 0.32)"
};
var stacking = {
  chrome: 50,
  modal: 2000,
  tooltip: 3000,
  skipLink: 4000
};
var breakpoints = {
  compact: 480,
  medium: 768,
  wide: 1200,
  canvas: 1440
};
var iconography = {
  size: 20,
  strokeWidth: 1.5
};
var typeScale = {
  caption: 12,
  label: 14,
  body: 16,
  control: 16,
  controlGlyph: 20,
  heading: 24,
  title: 32,
  display: 56
};
var fontWeights = {
  regular: 450,
  medium: 550,
  bold: 700
};
var fontFamilies = {
  heading: "ui-monospace",
  mono: "ui-monospace",
  text: "ui-sans-serif"
};
var fontFallbacks = {
  mono: ["SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
  text: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
};
var webTextStack = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
var webMonoStack = 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace';
var typography = {
  fontText: webTextStack,
  fontHeading: webMonoStack,
  fontMono: webMonoStack,
  fontGeistMono: '"Geist Mono", ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
  fontSans: webTextStack
};
function themeFor(mode) {
  return colors[mode];
}

export { designThemes, defaultDesignTheme, designThemeStorageKey, isDesignTheme, normalizeDesignTheme, designThemeLabel, resolveDesignTheme, colors, auroraColors, chromeColors, chromeGradientStops, spacing, radius, controlRadius, layout, siteThemes, interaction, motion, elevation, stacking, breakpoints, iconography, typeScale, fontWeights, fontFamilies, fontFallbacks, typography, themeFor };

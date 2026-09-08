// src/palette-color.ts
function channels(hex) {
  if (!/^#[0-9a-f]{6}$/iu.test(hex))
    throw new Error("Palette colors must be six-digit hex values.");
  return [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)];
}
function mixPaletteColor(color, toward, amount) {
  const target = channels(toward);
  return `#${channels(color).map((value, index) => Math.round(value * (1 - amount) + (target[index] ?? 0) * amount).toString(16).padStart(2, "0")).join("")}`;
}
function luminance(hex) {
  const linearize = (channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const [red, green, blue] = channels(hex);
  return linearize(red) * 0.2126 + linearize(green) * 0.7152 + linearize(blue) * 0.0722;
}
function paletteContrast(a, b) {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
function readablePaletteColor(color, toward, backgrounds, minimum) {
  for (let step = 0;step <= 100; step += 1) {
    const candidate = mixPaletteColor(color, toward, step / 100);
    if (backgrounds.every((background) => paletteContrast(candidate, background) >= minimum))
      return candidate;
  }
  throw new Error("The authored palette cannot meet its contrast contract.");
}

// src/palettes.ts
var designPalettes = ["catppuccin", "gruvbox", "rose-pine", "tokyo-night"];
var designPaletteLabels = {
  catppuccin: "Catppuccin",
  gruvbox: "Gruvbox",
  "rose-pine": "Rosé Pine",
  "tokyo-night": "Tokyo Night"
};
function isDesignPalette(value) {
  return typeof value === "string" && designPalettes.some((palette) => palette === value);
}
var designPaletteSources = {
  catppuccin: {
    dark: {
      background: "#1e1e2e",
      surface: "#181825",
      raised: "#313244",
      hover: "#45475a",
      text: "#cdd6f4",
      muted: "#a6adc8",
      border: "#7f849c",
      primary: "#89b4fa",
      danger: "#f38ba8",
      warning: "#f9e2af",
      success: "#a6e3a1",
      info: "#89dceb",
      violet: "#cba6f7",
      rose: "#f5c2e7"
    },
    light: {
      background: "#eff1f5",
      surface: "#e6e9ef",
      raised: "#dce0e8",
      hover: "#ccd0da",
      text: "#4c4f69",
      muted: "#6c6f85",
      border: "#7c7f93",
      primary: "#1e66f5",
      danger: "#d20f39",
      warning: "#df8e1d",
      success: "#40a02b",
      info: "#179299",
      violet: "#8839ef",
      rose: "#ea76cb"
    }
  },
  gruvbox: {
    dark: {
      background: "#282828",
      surface: "#1d2021",
      raised: "#3c3836",
      hover: "#504945",
      text: "#ebdbb2",
      muted: "#bdae93",
      border: "#928374",
      primary: "#83a598",
      danger: "#fb4934",
      warning: "#fabd2f",
      success: "#b8bb26",
      info: "#8ec07c",
      violet: "#d3869b",
      rose: "#fe8019"
    },
    light: {
      background: "#fbf1c7",
      surface: "#f9f5d7",
      raised: "#ebdbb2",
      hover: "#d5c4a1",
      text: "#3c3836",
      muted: "#665c54",
      border: "#7c6f64",
      primary: "#076678",
      danger: "#9d0006",
      warning: "#b57614",
      success: "#79740e",
      info: "#427b58",
      violet: "#8f3f71",
      rose: "#af3a03"
    }
  },
  "rose-pine": {
    dark: {
      background: "#191724",
      surface: "#1f1d2e",
      raised: "#26233a",
      hover: "#403d52",
      text: "#e0def4",
      muted: "#908caa",
      border: "#908caa",
      primary: "#c4a7e7",
      danger: "#eb6f92",
      warning: "#f6c177",
      success: "#9ccfd8",
      info: "#ebbcba",
      violet: "#c4a7e7",
      rose: "#ebbcba"
    },
    light: {
      background: "#faf4ed",
      surface: "#fffaf3",
      raised: "#f2e9e1",
      hover: "#dfdad9",
      text: "#575279",
      muted: "#797593",
      border: "#797593",
      primary: "#907aa9",
      danger: "#b4637a",
      warning: "#ea9d34",
      success: "#286983",
      info: "#56949f",
      violet: "#907aa9",
      rose: "#d7827e"
    }
  },
  "tokyo-night": {
    dark: {
      background: "#1a1b26",
      surface: "#16161e",
      raised: "#24283b",
      hover: "#292e42",
      text: "#c0caf5",
      muted: "#a9b1d6",
      border: "#737aa2",
      primary: "#7aa2f7",
      danger: "#f7768e",
      warning: "#e0af68",
      success: "#9ece6a",
      info: "#7dcfff",
      violet: "#bb9af7",
      rose: "#ff9e64"
    },
    light: {
      background: "#e1e2e7",
      surface: "#d0d5e3",
      raised: "#c4c8da",
      hover: "#b7c1e3",
      text: "#3760bf",
      muted: "#6172b0",
      border: "#6172b0",
      primary: "#2e7de9",
      danger: "#f52a65",
      warning: "#8c6c3e",
      success: "#587539",
      info: "#007197",
      violet: "#9854f1",
      rose: "#b15c00"
    }
  }
};
function createPalette(source, mode) {
  const surfaces = [source.background, source.surface, source.raised, source.hover];
  const endpoint = mode === "dark" ? "#ffffff" : "#000000";
  const foreground = readablePaletteColor(source.text, endpoint, surfaces, 7);
  const muted = readablePaletteColor(source.muted, endpoint, surfaces, 4.6);
  const status = (seed) => {
    const soft = mixPaletteColor(source.background, seed, 0.12);
    const color = readablePaletteColor(seed, endpoint, [...surfaces, soft], 4.6);
    const onColor = paletteContrast(color, source.background) >= 4.5 ? source.background : endpoint === "#ffffff" ? "#000000" : "#ffffff";
    return {
      color,
      foreground: onColor,
      soft
    };
  };
  const primary = status(source.primary);
  const danger = status(source.danger);
  const warning = status(source.warning);
  const success = status(source.success);
  const info = status(source.info);
  return Object.freeze({
    background: source.background,
    foreground,
    muted,
    faint: muted,
    grid: source.raised,
    line: source.hover,
    controlBorder: readablePaletteColor(source.border, endpoint, surfaces, 3.1),
    surface: source.surface,
    surfaceRaised: source.raised,
    surfaceHover: source.hover,
    card: source.surface,
    cardForeground: foreground,
    popover: source.raised,
    popoverForeground: foreground,
    primary: primary.color,
    primaryForeground: primary.foreground,
    primarySoft: primary.soft,
    secondary: source.raised,
    secondaryForeground: foreground,
    accent: primary.soft,
    accentForeground: foreground,
    focus: primary.color,
    scrim: mode === "dark" ? "#000000b8" : "#00000070",
    disabled: source.raised,
    disabledForeground: muted,
    inverse: foreground,
    inverseForeground: source.background,
    danger: danger.color,
    dangerForeground: danger.foreground,
    dangerSoft: danger.soft,
    warning: warning.color,
    warningForeground: warning.foreground,
    warningSoft: warning.soft,
    success: success.color,
    successForeground: success.foreground,
    successSoft: success.soft,
    info: info.color,
    infoForeground: info.foreground,
    infoSoft: info.soft,
    chart1: readablePaletteColor(source.rose, endpoint, surfaces, 4.6),
    chart2: success.color,
    chart3: info.color,
    chart4: warning.color,
    chart5: readablePaletteColor(source.violet, endpoint, surfaces, 4.6)
  });
}
var paletteColors = Object.freeze({
  catppuccin: Object.freeze({
    light: createPalette(designPaletteSources.catppuccin.light, "light"),
    dark: createPalette(designPaletteSources.catppuccin.dark, "dark")
  }),
  gruvbox: Object.freeze({
    light: createPalette(designPaletteSources.gruvbox.light, "light"),
    dark: createPalette(designPaletteSources.gruvbox.dark, "dark")
  }),
  "rose-pine": Object.freeze({
    light: createPalette(designPaletteSources["rose-pine"].light, "light"),
    dark: createPalette(designPaletteSources["rose-pine"].dark, "dark")
  }),
  "tokyo-night": Object.freeze({
    light: createPalette(designPaletteSources["tokyo-night"].light, "light"),
    dark: createPalette(designPaletteSources["tokyo-night"].dark, "dark")
  })
});
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

// src/palette-appearance.ts
var defaultDesignPalettePreference = Object.freeze({
  palette: "catppuccin",
  mode: "dark"
});
var designPaletteStorageKey = "hraness-design-palette-v1";
function parseDesignPalettePreference(value) {
  if (typeof value === "string") {
    if (value.length > 256)
      return null;
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return null;
  const record = value;
  if (!isDesignPalette(record.palette) || !isDesignTheme(record.mode))
    return null;
  return Object.freeze({
    palette: record.palette,
    mode: record.mode
  });
}
function normalizeDesignPalettePreference(value, fallback = defaultDesignPalettePreference) {
  return parseDesignPalettePreference(value) ?? parseDesignPalettePreference(fallback) ?? defaultDesignPalettePreference;
}
function resolveDesignPalettePreference(preference, systemPrefersDark) {
  return {
    palette: preference.palette,
    mode: resolveDesignTheme(preference.mode, systemPrefersDark)
  };
}
// src/palette-themes.ts
import * as stylex from "@stylexjs/stylex";

// src/palette-tokens.stylex.ts
var catppuccinLight = {
  x18acsur: "xadus2s x18acsur",
  $$css: true
};
var catppuccinDark = {
  x18acsur: "x18wthyl x18acsur",
  $$css: true
};
var gruvboxLight = {
  x18acsur: "xdktuxt x18acsur",
  $$css: true
};
var gruvboxDark = {
  x18acsur: "x1fsd05x x18acsur",
  $$css: true
};
var rosePineLight = {
  x18acsur: "x131glkb x18acsur",
  $$css: true
};
var rosePineDark = {
  x18acsur: "xivpxii x18acsur",
  $$css: true
};
var tokyoNightLight = {
  x18acsur: "x11phk89 x18acsur",
  $$css: true
};
var tokyoNightDark = {
  x18acsur: "xgp1gpt x18acsur",
  $$css: true
};

// src/palette-themes.ts
var classes = {
  catppuccin: {
    light: stylex.props(catppuccinLight).className,
    dark: stylex.props(catppuccinDark).className
  },
  gruvbox: {
    light: stylex.props(gruvboxLight).className,
    dark: stylex.props(gruvboxDark).className
  },
  "rose-pine": {
    light: stylex.props(rosePineLight).className,
    dark: stylex.props(rosePineDark).className
  },
  "tokyo-night": {
    light: stylex.props(tokyoNightLight).className,
    dark: stylex.props(tokyoNightDark).className
  }
};
function getDesignPaletteTheme(palette, mode) {
  return {
    className: `hraness-palette ${classes[palette][mode]}`,
    background: paletteColors[palette][mode].background
  };
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
  light: [[0, "rgb(52 52 64)"], [10, "rgb(88 88 100)"], [20, "rgb(58 58 72)"], [32, "rgb(100 100 112)"], [42, "rgb(64 64 78)"], [52, "rgb(92 92 106)"], [62, "rgb(54 54 68)"], [72, "rgb(86 86 100)"], [82, "rgb(56 56 70)"], [91, "rgb(80 80 94)"], [100, "rgb(60 60 74)"]],
  dark: [[0, "rgb(100 102 122)"], [10, "rgb(158 160 182)"], [20, "rgb(112 114 136)"], [32, "rgb(178 180 200)"], [42, "rgb(122 124 148)"], [52, "rgb(166 168 190)"], [62, "rgb(106 108 132)"], [72, "rgb(160 162 186)"], [82, "rgb(110 112 136)"], [91, "rgb(152 154 178)"], [100, "rgb(118 120 142)"]]
};
var spacing = [0, 4, 8, 12, 16, 20, 24, 32, 48, 64];
var radius = {
  sharp: 0,
  sm: 4,
  md: 8,
  lg: 12,
  round: 999
};
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
  heading: "Nebula Sans",
  mono: "ui-monospace",
  text: "Nebula Sans"
};
var fontFallbacks = {
  mono: ["SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
  text: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
};
var webTextStack = '"Nebula Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
var webMonoStack = 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace';
var typography = {
  fontText: webTextStack,
  fontHeading: webTextStack,
  fontMono: webMonoStack,
  fontGeistMono: '"Geist Mono", ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
  fontSans: webTextStack
};
function themeFor(mode) {
  return colors[mode];
}

export { designPalettes, designPaletteLabels, isDesignPalette, designPaletteSources, paletteColors, designThemes, defaultDesignTheme, designThemeStorageKey, isDesignTheme, normalizeDesignTheme, designThemeLabel, resolveDesignTheme, defaultDesignPalettePreference, designPaletteStorageKey, parseDesignPalettePreference, normalizeDesignPalettePreference, resolveDesignPalettePreference, getDesignPaletteTheme, colors, auroraColors, chromeColors, chromeGradientStops, spacing, radius, controlRadius, layout, siteThemes, interaction, motion, elevation, stacking, breakpoints, iconography, typeScale, fontWeights, fontFamilies, fontFallbacks, typography, themeFor };

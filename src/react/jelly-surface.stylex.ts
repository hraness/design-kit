import * as stylex from "@stylexjs/stylex";

const forcedColors = "@media (forced-colors: active)";
const reducedMotion = "@media (prefers-reduced-motion: reduce)";
const hovered = ":is([data-hovered])";

export const jellySurfaceStyles = stylex.create({
  root: {
    borderImageSource: { default: null, [forcedColors]: "none" },
    borderImageSlice: { default: null, [forcedColors]: "100%" },
    borderImageWidth: { default: null, [forcedColors]: "1" },
    borderImageOutset: { default: null, [forcedColors]: "0" },
    borderImageRepeat: { default: null, [forcedColors]: "stretch" },
    "--jelly-card-padding-block": "0",
    "--jelly-card-padding-inline": "0",
    "--jelly-card-font-size": "inherit",
    "--jelly-radius": "var(--jelly-radius-card)",
    "--jelly-fill": "var(--surface-raised)",
    "--jelly-label": "var(--foreground)",
    "--jelly-color-border-default": "transparent",
    position: "relative",
    isolation: "isolate",
    display: "block",
    boxSizing: "border-box",
    borderRadius: "var(--jelly-radius)",
    color: { default: "var(--jelly-label)", [forcedColors]: "CanvasText" },
    fontFamily: "inherit",
    fontFeatureSettings: "inherit",
    fontKerning: "inherit",
    fontLanguageOverride: "inherit",
    fontOpticalSizing: "inherit",
    fontSizeAdjust: "inherit",
    fontVariationSettings: "inherit",
    fontSize: "inherit",
    fontStyle: "inherit",
    fontWeight: "inherit",
    fontVariant: "inherit",
    fontStretch: "inherit",
    lineHeight: "inherit",
    backgroundColor: { default: null, [forcedColors]: "Canvas" },
    borderColor: { default: null, [forcedColors]: "CanvasText" },
    borderStyle: { default: null, [forcedColors]: "solid" },
    borderWidth: { default: null, [forcedColors]: 1 },
    boxShadow: { default: null, [forcedColors]: "none" },
    transitionProperty: { default: null, [reducedMotion]: "none" },
  },
  primary: {
    "--jelly-fill": "var(--primary)",
    "--jelly-label": "var(--primary-foreground)",
  },
  quiet: {
    "--jelly-fill": "color-mix(in oklch, var(--surface) 64%, transparent)",
    "--jelly-label": "var(--muted)",
  },
  danger: {
    "--jelly-fill": "var(--danger)",
    "--jelly-label": "var(--background)",
  },
  field: {
    "--jelly-fill": "color-mix(in oklch, var(--surface-raised) 88%, var(--background))",
    "--jelly-radius": "var(--jelly-radius-control)",
  },
  overlay: {
    "--jelly-fill": "var(--popover)",
    "--jelly-label": "var(--popover-foreground)",
    "--jelly-radius": "var(--jelly-radius-overlay)",
  },
  neutralHovered: {
    "--jelly-fill": { default: "var(--surface-raised)", [hovered]: "var(--surface-hover)" },
  },
  primaryHovered: {
    "--jelly-fill": {
      default: "var(--primary)",
      [hovered]: "color-mix(in oklch, var(--primary) 88%, var(--background))",
    },
  },
  disabled: {
    "--jelly-fill": {
      default: "color-mix(in oklch, var(--surface-raised) 86%, var(--background))",
      [hovered]: "color-mix(in oklch, var(--surface-raised) 86%, var(--background))",
    },
    "--jelly-label": "var(--disabled-foreground)",
    cursor: "not-allowed",
  },
  selectableText: { userSelect: "text" },
});

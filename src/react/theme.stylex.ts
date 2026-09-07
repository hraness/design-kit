import * as stylex from "@stylexjs/stylex";

const coarsePointer = "@media (pointer: coarse)";
const forcedColors = "@media (forced-colors: active)";
const reducedMotion = "@media (prefers-reduced-motion: reduce)";
const disabled = ":disabled";
const focusVisible = ":is([data-focus-visible], :focus-visible)";
const hidden = ":is([hidden])";
const hovered = ":is([data-hovered], :hover)";
const itemFocusedOrHovered =
  ":is([data-focused], [data-hovered], :focus-visible, :hover)";
const pressed = ":is([data-pressed], :active)";

export const themeStyles = stylex.create({
  item: {
    alignItems: "center",
    backgroundAttachment: { default: null, [itemFocusedOrHovered]: "scroll" },
    backgroundClip: { default: null, [itemFocusedOrHovered]: "border-box" },
    backgroundImage: { default: null, [itemFocusedOrHovered]: "none" },
    backgroundOrigin: { default: null, [itemFocusedOrHovered]: "padding-box" },
    backgroundPosition: { default: null, [itemFocusedOrHovered]: "0% 0%" },
    backgroundRepeat: { default: null, [itemFocusedOrHovered]: "repeat" },
    backgroundSize: { default: null, [itemFocusedOrHovered]: "auto auto" },
    backgroundColor: {
      default: null,
      [itemFocusedOrHovered]:
        "var(--hraness-appearance-accent, var(--ui-accent, ButtonFace))",
    },
    borderRadius: "var(--radius-md, 0.5rem)",
    color: {
      default:
        "var(--hraness-appearance-popover-foreground, var(--ui-popover-foreground, CanvasText))",
      [itemFocusedOrHovered]:
        "var(--hraness-appearance-accent-foreground, var(--ui-accent-foreground, ButtonText))",
    },
    cursor: "default",
    display: "grid",
    fontSize: "var(--text-label, 0.875rem)",
    gap: "0.75rem",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    lineHeight: 1.25,
    "min-block-size": {
      default: "2.5rem",
      [coarsePointer]: "3rem",
    },
    outlineStyle: "none",
    paddingBlock: "0.5rem",
    paddingInline: "0.75rem",
    userSelect: "none",
  },
  itemSelected: {
    backgroundAttachment: { default: null, [itemFocusedOrHovered]: "scroll", [forcedColors]: "scroll" },
    backgroundClip: { default: null, [itemFocusedOrHovered]: "border-box", [forcedColors]: "border-box" },
    backgroundImage: { default: null, [itemFocusedOrHovered]: "none", [forcedColors]: "none" },
    backgroundOrigin: { default: null, [itemFocusedOrHovered]: "padding-box", [forcedColors]: "padding-box" },
    backgroundPosition: { default: null, [itemFocusedOrHovered]: "0% 0%", [forcedColors]: "0% 0%" },
    backgroundRepeat: { default: null, [itemFocusedOrHovered]: "repeat", [forcedColors]: "repeat" },
    backgroundSize: { default: null, [itemFocusedOrHovered]: "auto auto", [forcedColors]: "auto auto" },
    backgroundColor: {
      default: null,
      [itemFocusedOrHovered]:
        "var(--hraness-appearance-accent, var(--ui-accent, ButtonFace))",
      [forcedColors]: "Highlight",
    },
    color: {
      default:
        "var(--hraness-appearance-popover-foreground, var(--ui-popover-foreground, CanvasText))",
      [itemFocusedOrHovered]:
        "var(--hraness-appearance-accent-foreground, var(--ui-accent-foreground, ButtonText))",
      [forcedColors]: "HighlightText",
    },
    fontWeight: "var(--font-weight-medium, 550)",
  },
  menu: {
    display: "grid",
    "max-block-size": "min(24rem, 70vh)",
    outlineStyle: "none",
    overflow: "auto",
    paddingBlock: "0.25rem",
    paddingInline: "0.25rem",
  },
  menuRoot: {
    "--hraness-appearance-accent": "var(--ui-accent, ButtonFace)",
    "--hraness-appearance-accent-foreground":
      "var(--ui-accent-foreground, ButtonText)",
    "--hraness-appearance-control-background":
      "var(--ui-background, Canvas)",
    "--hraness-appearance-control-border": "var(--ui-input, GrayText)",
    "--hraness-appearance-control-foreground":
      "var(--ui-foreground, CanvasText)",
    "--hraness-appearance-focus": "var(--ui-ring, Highlight)",
    "--hraness-appearance-popover-background":
      "var(--ui-popover, Canvas)",
    "--hraness-appearance-popover-foreground":
      "var(--ui-popover-foreground, CanvasText)",
    color: "var(--hraness-appearance-control-foreground)",
    position: "relative",
  },
  notReady: {
    opacity: 0.64,
  },
  popover: {
    borderImageSource: "none",
    borderImageSlice: "100%",
    borderImageWidth: "1",
    borderImageOutset: "0",
    borderImageRepeat: "stretch",
    backgroundAttachment: "scroll",
    backgroundClip: "border-box",
    backgroundImage: "none",
    backgroundOrigin: "padding-box",
    backgroundPosition: "0% 0%",
    backgroundRepeat: "repeat",
    backgroundSize: "auto auto",
    backgroundColor:
      "var(--hraness-appearance-popover-background, var(--ui-popover, Canvas))",
    borderColor: {
      default:
        "var(--hraness-appearance-control-border, var(--ui-input, GrayText))",
      [forcedColors]: "CanvasText",
    },
    borderRadius: "var(--radius-lg, 0.75rem)",
    borderStyle: "solid",
    borderWidth: 1,
    boxShadow:
      "var(--elevation-overlay, 0 18px 48px -18px rgb(0 0 0 / 32%))",
    color:
      "var(--hraness-appearance-popover-foreground, var(--ui-popover-foreground, CanvasText))",
    display: {
      default: null,
      [hidden]: "none",
    },
    forcedColorAdjust: {
      default: null,
      [forcedColors]: "auto",
    },
    "max-inline-size": "calc(100vw - 2rem)",
    outlineStyle: "none",
    overflow: "hidden",
    "inline-size": "min(12rem, calc(100vw - 2rem))",
    "z-index": "var(--z-tooltip, 3000)",
  },
  root: {
    display: "inline-flex",
    "min-inline-size": 0,
  },
  trigger: {
    borderImageSource: "none",
    borderImageSlice: "100%",
    borderImageWidth: "1",
    borderImageOutset: "0",
    borderImageRepeat: "stretch",
    backgroundAttachment: { default: "scroll", [hovered]: "scroll" },
    backgroundClip: { default: "border-box", [hovered]: "border-box" },
    backgroundImage: { default: "none", [hovered]: "none" },
    backgroundOrigin: { default: "padding-box", [hovered]: "padding-box" },
    backgroundPosition: { default: "0% 0%", [hovered]: "0% 0%" },
    backgroundRepeat: { default: "repeat", [hovered]: "repeat" },
    backgroundSize: { default: "auto auto", [hovered]: "auto auto" },
    backgroundColor: {
      default:
        "var(--hraness-appearance-control-background, var(--ui-background, Canvas))",
      [hovered]:
        "var(--hraness-appearance-accent, var(--ui-accent, ButtonFace))",
    },
    borderColor: {
      default:
        "var(--hraness-appearance-control-border, var(--ui-input, GrayText))",
      [forcedColors]: "CanvasText",
    },
    borderRadius: "var(--radius-md, 0.5rem)",
    borderStyle: "solid",
    borderWidth: 1,
    boxShadow: {
      default: null,
      [focusVisible]:
        "0 0 0 4px color-mix(in oklch, var(--hraness-appearance-focus, var(--ui-ring, Highlight)) 24%, transparent)",
      [forcedColors]: "none",
    },
    color: {
      default:
        "var(--hraness-appearance-control-foreground, var(--ui-foreground, CanvasText))",
      [hovered]:
        "var(--hraness-appearance-accent-foreground, var(--ui-accent-foreground, ButtonText))",
    },
    cursor: {
      default: "pointer",
      [disabled]: "not-allowed",
    },
    display: "inline-grid",
    fontFamily: "inherit",
    fontFeatureSettings: "inherit",
    fontKerning: "inherit",
    fontLanguageOverride: "inherit",
    fontOpticalSizing: "inherit",
    fontSizeAdjust: "inherit",
    fontVariationSettings: "inherit",
    fontSize: "inherit",
    fontStretch: "inherit",
    fontStyle: "inherit",
    fontVariant: "inherit",
    fontWeight: "inherit",
    forcedColorAdjust: {
      default: null,
      [forcedColors]: "auto",
    },
    "inline-size": {
      default: "2rem",
      [coarsePointer]: "3rem",
    },
    lineHeight: "inherit",
    "min-block-size": {
      default: "2rem",
      [coarsePointer]: "3rem",
    },
    "min-inline-size": {
      default: "2rem",
      [coarsePointer]: "3rem",
    },
    opacity: {
      default: null,
      [disabled]: 0.5,
    },
    outlineColor: {
      default: null,
      [focusVisible]:
        "var(--hraness-appearance-focus, var(--ui-ring, Highlight))",
      [forcedColors]: "Highlight",
    },
    outlineOffset: {
      default: null,
      [focusVisible]: 2,
    },
    outlineStyle: {
      default: "none",
      [focusVisible]: "solid",
    },
    outlineWidth: {
      default: null,
      [focusVisible]: 2,
    },
    paddingBlock: 0,
    paddingInline: 0,
    placeItems: "center",
    touchAction: "manipulation",
    transform: {
      default: null,
      [pressed]: "translateY(1px)",
    },
    transitionDelay: "0s, 0s, 0s, 0s",
    transitionDuration: {
      default: "120ms, 120ms, 120ms, 120ms",
      [reducedMotion]: "0.01ms",
    },
    transitionProperty: "background-color, border-color, color, transform",
    transitionTimingFunction:
      "cubic-bezier(0.2, 0, 0, 1), cubic-bezier(0.2, 0, 0, 1), cubic-bezier(0.2, 0, 0, 1), cubic-bezier(0.2, 0, 0, 1)",
  },
});

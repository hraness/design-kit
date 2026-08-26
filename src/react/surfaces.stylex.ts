import * as stylex from "@stylexjs/stylex";

export const ditherSurfaceStyles = stylex.create({
  coarse: {
    "--hraness-design-dither-size": "7px",
  },
  fine: {
    "--hraness-design-dither-size": "3px",
  },
  texture: {
    backgroundImage: {
      default:
        "radial-gradient(color-mix(in oklch, currentColor 18%, transparent) 0.75px, transparent 0.75px)",
      "@media (forced-colors: active)": "none",
    },
    backgroundSize:
      "var(--hraness-design-dither-size, 4px) var(--hraness-design-dither-size, 4px)",
  },
});

const forcedColors = "@media (forced-colors: active)";

export const layoutSurfaceStyles = stylex.create({
  bar: {
    alignItems: "center",
    display: "flex",
    gap: "var(--space-3)",
    "min-inline-size": 0,
  },
  barContent: {
    flex: "1 1 auto",
  },
  barPart: {
    alignItems: "center",
    display: "flex",
    gap: "var(--space-2)",
    "min-inline-size": 0,
  },
  bottomBar: {
    "border-block-start-style": "solid",
    "border-block-start-width": 1,
    "min-block-size": "var(--bottom-bar-height)",
    "padding-block": "var(--layout-chrome-inset)",
    "padding-inline": "var(--layout-chrome-inset)",
  },
  dockedAbsolute: {
    position: "absolute",
  },
  dockedContent: {
    "inline-size": "min(100%, var(--page-canvas-width))",
    "margin-inline": "auto",
  },
  dockedContentCompactInset: {
    "padding-block":
      "var(--space-1) max(var(--space-1), env(safe-area-inset-bottom))",
    "padding-inline":
      "max(var(--layout-edge-inset), env(safe-area-inset-left)) max(var(--layout-edge-inset), env(safe-area-inset-right))",
  },
  dockedContentCompactNoInset: {
    "padding-block":
      "var(--space-1) max(var(--space-1), env(safe-area-inset-bottom))",
    "padding-inline":
      "max(var(--layout-chrome-inset), env(safe-area-inset-left)) max(var(--layout-chrome-inset), env(safe-area-inset-right))",
  },
  dockedContentDefaultInset: {
    "padding-block":
      "var(--layout-chrome-inset) max(var(--layout-chrome-inset), env(safe-area-inset-bottom))",
    "padding-inline":
      "max(var(--layout-edge-inset), env(safe-area-inset-left)) max(var(--layout-edge-inset), env(safe-area-inset-right))",
  },
  dockedContentDefaultNoInset: {
    "padding-block":
      "var(--layout-chrome-inset) max(var(--layout-chrome-inset), env(safe-area-inset-bottom))",
    "padding-inline":
      "max(var(--layout-chrome-inset), env(safe-area-inset-left)) max(var(--layout-chrome-inset), env(safe-area-inset-right))",
  },
  dockedFixed: {
    position: "fixed",
  },
  dockedFooter: {
    "border-block-start-style": "solid",
    "border-block-start-width": 1,
    "inset-block-end": 0,
    "inset-inline": 0,
    zIndex: "var(--z-chrome)",
  },
  dockedSticky: {
    position: "sticky",
  },
  fullSize: {
    "max-inline-size": "none",
  },
  pageCanvas: {
    "inline-size": "min(100%, var(--page-canvas-width))",
    "margin-inline": "auto",
    "min-inline-size": 0,
  },
  pageContentInset: {
    "padding-block": "var(--layout-edge-inset)",
    "padding-inline": "var(--layout-edge-inset)",
  },
  pageNoInset: {
    "padding-block": 0,
    "padding-inline": 0,
  },
  surface: {
    backgroundAttachment: "scroll",
    backgroundClip: "border-box",
    backgroundColor: {
      default: "var(--background)",
      [forcedColors]: "Canvas",
    },
    backgroundImage: "none",
    backgroundOrigin: "padding-box",
    backgroundPosition: "0% 0%",
    backgroundRepeat: "repeat",
    backgroundSize: "auto",
    "border-block-end-color": {
      default: "var(--line)",
      [forcedColors]: "CanvasText",
    },
    "border-block-start-color": {
      default: "var(--line)",
      [forcedColors]: "CanvasText",
    },
    "border-inline-end-color": {
      default: "var(--line)",
      [forcedColors]: "CanvasText",
    },
    "border-inline-start-color": {
      default: "var(--line)",
      [forcedColors]: "CanvasText",
    },
  },
  topBar: {
    "border-block-end-style": "solid",
    "border-block-end-width": 1,
    "min-block-size": "var(--top-bar-height)",
  },
  topBarActions: {
    "margin-inline-start": "auto",
  },
  topBarGlass: {
    backdropFilter: {
      default: "blur(18px) saturate(1.08)",
      [forcedColors]: "none",
    },
    backgroundColor: {
      default: "color-mix(in oklch, var(--background) 90%, transparent)",
      [forcedColors]: "Canvas",
    },
  },
  topBarSticky: {
    "inset-block-start": 0,
    "padding-block":
      "max(var(--layout-chrome-inset), env(safe-area-inset-top)) var(--layout-chrome-inset)",
    "padding-inline":
      "max(var(--layout-chrome-inset), env(safe-area-inset-left)) max(var(--layout-chrome-inset), env(safe-area-inset-right))",
    position: "sticky",
    zIndex: "var(--z-chrome)",
  },
  topBarStatic: {
    "padding-block": "var(--layout-chrome-inset)",
    "padding-inline": "var(--layout-chrome-inset)",
  },
  topBarTitle: {
    fontWeight: "var(--font-weight-bold)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  wideSize: {
    "max-inline-size": "var(--page-canvas-wide)",
  },
});

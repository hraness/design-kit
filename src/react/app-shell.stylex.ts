import * as stylex from "@stylexjs/stylex";

const compactViewport = "@media (max-width: 48rem)";
const forcedColors = "@media (forced-colors: active)";

export const appShellStyles = stylex.create({
  bottom: {
    gridArea: "bottom",
    "min-inline-size": 0,
  },
  drawer: {
    "block-size": "100%",
  },
  mobileTrigger: {
    "border-block-end-color": {
      default: null,
      [compactViewport]: "var(--line)",
    },
    "border-block-end-style": {
      default: null,
      [compactViewport]: "solid",
    },
    "border-block-end-width": {
      default: null,
      [compactViewport]: 1,
    },
    display: {
      default: "none",
      [compactViewport]: "grid",
    },
    gridArea: {
      default: null,
      [compactViewport]: "trigger",
    },
    padding: {
      default: null,
      [compactViewport]: "var(--layout-chrome-inset)",
    },
    placeItems: {
      default: null,
      [compactViewport]: "center",
    },
  },
  page: {
    gridArea: "page",
    "min-block-size": 0,
    "min-inline-size": 0,
    overflow: "auto",
  },
  rail: {
    backgroundAttachment: { default: null, [forcedColors]: "scroll" },
    backgroundClip: { default: null, [forcedColors]: "border-box" },
    backgroundImage: { default: null, [forcedColors]: "none" },
    backgroundOrigin: { default: null, [forcedColors]: "padding-box" },
    backgroundPosition: { default: null, [forcedColors]: "0% 0%" },
    backgroundRepeat: { default: null, [forcedColors]: "repeat" },
    backgroundSize: { default: null, [forcedColors]: "auto auto" },
    backgroundColor: {
      default: null,
      [forcedColors]: "Canvas",
    },
    "border-block-start-color": { default: null, [forcedColors]: "CanvasText" },
    "border-block-end-color": { default: null, [forcedColors]: "CanvasText" },
    "border-inline-start-color": { default: null, [forcedColors]: "CanvasText" },
    "border-inline-end-color": {
      default: "var(--line)",
      [forcedColors]: "CanvasText",
    },
    "border-inline-end-style": "solid",
    "border-inline-end-width": 1,
    display: {
      default: null,
      [compactViewport]: "none",
    },
    gridArea: "rail",
    "min-block-size": 0,
    "min-inline-size": 0,
  },
  root: {
    backgroundAttachment: "scroll",
    backgroundClip: "border-box",
    backgroundImage: "none",
    backgroundOrigin: "padding-box",
    backgroundPosition: "0% 0%",
    backgroundRepeat: "repeat",
    backgroundSize: "auto auto",
    backgroundColor: "var(--background)",
    "block-size": "100%",
    display: "grid",
    gridTemplate: {
      default:
        '"rail top" auto "rail page" minmax(0, 1fr) "rail bottom" auto / var(--navigation-rail-width) minmax(0, 1fr)',
      [compactViewport]:
        '"top trigger" auto "page page" minmax(0, 1fr) "bottom bottom" auto / minmax(0, 1fr) auto',
    },
    "inline-size": "100%",
    "min-block-size": 0,
    "min-inline-size": 0,
  },
  top: {
    gridArea: "top",
    "min-inline-size": 0,
  },
});

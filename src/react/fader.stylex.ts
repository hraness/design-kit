import * as stylex from "@stylexjs/stylex";

export const faderStyles = stylex.create({
  caption: {
    fontSize: "var(--text-caption)",
  },
  compact: {
    "--hraness-design-fader-thumb-block-size": "0.75rem",
    "--hraness-design-fader-thumb-inline-size": "1.5rem",
    "--hraness-design-fader-track-length": "var(--interactive-target-min)",
  },
  fillRail: {
    backgroundColor: "var(--primary)",
    "block-size": "100%",
    "inset-block-end": 0,
  },
  focusVisible: {
    outlineColor: "var(--focus)",
    outlineOffset: 3,
    outlineStyle: "solid",
    outlineWidth: 3,
  },
  horizontalRoot: {
    "min-inline-size": "8rem",
  },
  horizontalTrack: {
    "block-size": "var(--interactive-target-min)",
    "inline-size": "100%",
  },
  labelRow: {
    alignItems: "center",
    display: "flex",
    gap: "var(--space-1)",
  },
  rail: {
    borderRadius: "var(--radius-round)",
    "inline-size": 4,
    "inset-inline": "calc(50% - 2px)",
    position: "absolute",
  },
  root: {
    "--hraness-design-fader-thumb-block-size": "1.125rem",
    "--hraness-design-fader-thumb-inline-size": "1.75rem",
    "--hraness-design-fader-track-length": "6rem",
    display: "grid",
    gap: "var(--space-2)",
    justifyItems: "center",
    "min-inline-size": "var(--interactive-target-min)",
  },
  thumb: {
    backgroundColor: "var(--primary)",
    "block-size": "var(--hraness-design-fader-thumb-block-size)",
    borderColor: "var(--background)",
    borderRadius: "var(--radius-sm)",
    borderStyle: "solid",
    borderWidth: 2,
    boxShadow: "0 0 0 1px var(--line)",
    "inline-size": "var(--hraness-design-fader-thumb-inline-size)",
    left: "50%",
    top: "50%",
  },
  track: {
    "block-size": "var(--hraness-design-fader-track-length)",
    "inline-size": "var(--interactive-target-min)",
    position: "relative",
  },
  trackRail: {
    backgroundColor: "var(--grid)",
    "inset-block": 0,
  },
});

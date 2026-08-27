import * as stylex from "@stylexjs/stylex";

export const playbackTransportStyles = stylex.create({
  glyph: {
    "block-size": "1.5rem",
    "inline-size": "1.5rem",
  },
  root: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--space-2)",
  },
});

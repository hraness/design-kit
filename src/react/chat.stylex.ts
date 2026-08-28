import * as stylex from "@stylexjs/stylex";

const compactViewport = "@media (max-width: 48rem)";

export const chatStyles = stylex.create({
  composer: {
    alignItems: "end",
    display: "grid",
    gap: "var(--space-2)",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) auto",
      [compactViewport]: "1fr",
    },
  },
  message: {
    display: "grid",
    gap: "var(--space-3)",
    gridTemplateColumns: "auto minmax(0, 1fr)",
  },
  messageHeader: {
    color: "var(--muted)",
    fontSize: "var(--text-caption)",
    "margin-block-end": "var(--space-1)",
  },
  messageMinInline: {
    "min-inline-size": 0,
  },
  messageRow: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--space-2)",
  },
});

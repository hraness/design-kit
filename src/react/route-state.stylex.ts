import * as stylex from "@stylexjs/stylex";

export const routeStateStyles = stylex.create({
  content: {
    display: "grid",
    gridRow: 2,
    "min-block-size": 0,
    placeItems: "center",
  },
  header: {
    alignItems: "center",
    display: "flex",
    justifyContent: "flex-end",
    "min-inline-size": 0,
    padding: "var(--layout-chrome-inset)",
  },
  loading: {
    display: "grid",
    gap: "var(--space-4)",
    "inline-size": "min(100%, 36rem)",
  },
  root: {
    display: "grid",
    gridTemplateRows: "auto minmax(0, 1fr)",
    "min-block-size": "100%",
  },
  row: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--space-2)",
  },
  skeletons: {
    display: "grid",
    gap: "var(--space-2)",
  },
});

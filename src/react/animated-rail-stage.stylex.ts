import * as stylex from "@stylexjs/stylex";

export const animatedRailStageStyles = stylex.create({
  root: {
    "min-inline-size": 0,
    transform: {
      default: null,
      "@media (prefers-reduced-motion: reduce)": "none !important",
    },
    transition: {
      default: null,
      "@media (prefers-reduced-motion: reduce)": "none !important",
    },
  },
});

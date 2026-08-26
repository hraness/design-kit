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

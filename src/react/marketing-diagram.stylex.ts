import * as stylex from "@stylexjs/stylex";

export const diagramStyles = stylex.create({
  figure: { "margin": "0", "min-inline-size": "0", "color": "var(--foreground)", "font-family": "var(--font-text)" },
  scroll: { "overflow-x": "auto", "max-inline-size": "100%", "outline": { "default": null, ":focus-visible": "2px solid var(--primary)" }, "outline-offset": { "default": null, ":focus-visible": "3px" } },
  canvas: { "display": "block", "inline-size": "100%", "min-inline-size": "40rem", "block-size": "auto", "font-family": "var(--font-text)", "font-size": "20px", "color": "var(--primary)" },
  caption: { "margin-block-start": "1rem", "max-inline-size": "76ch", "color": "var(--muted)", "font-size": "0.875rem", "line-height": "1.5" },
});

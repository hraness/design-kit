import * as stylex from "@stylexjs/stylex";

export const comparisonStyles = stylex.create({
  figure: { "margin": "0", "min-inline-size": "0", "color": "var(--hraness-marketing-ink, var(--foreground))", "font-family": "var(--font-text)" },
  scroll: { "overflow-x": "auto", "max-inline-size": "100%", "outline": { "default": null, ":focus-visible": "2px solid var(--primary)" }, "outline-offset": { "default": null, ":focus-visible": "3px" } },
  table: { "inline-size": "100%", "border-collapse": "collapse", "text-align": "start", "font-size": "0.9375rem", "line-height": "1.4" },
  caption: { "padding-block-end": "1.25rem", "text-align": "start", "font-size": "1.125rem", "font-weight": "550", "color": "var(--foreground)" },
  corner: { "min-inline-size": "9rem", "border-block-end": "1px solid var(--line)" },
  option: { "padding": "1rem", "min-inline-size": "8.5rem", "border-block-end": "1px solid var(--line)", "vertical-align": "bottom", "font-weight": "600" },
  optionLabel: { "display": "flex", "align-items": "center", "gap": "0.6rem" },
  mark: { "object-fit": "contain", "flex-shrink": "0", "inline-size": "1.5rem", "block-size": "1.5rem" },
  rowLabel: { "padding": "1rem 1rem 1rem 0", "min-inline-size": "9rem", "max-inline-size": "15rem", "border-block-end": "1px solid var(--line)", "vertical-align": "top", "font-weight": "500" },
  cell: { "padding": "1rem", "border-block-end": "1px solid var(--line)", "vertical-align": "top" },
  highlight: { "background-color": { "default": "color-mix(in srgb, var(--primary) 5%, transparent)", "@media (forced-colors: active)": "Canvas" }, "color": "var(--foreground)" },
  value: { "display": "grid", "gap": "0.25rem" },
  label: { "display": "flex", "align-items": "flex-start", "gap": "0.45rem" },
  glyph: { "flex-shrink": "0", "margin-block-start": "0.1rem", "inline-size": "1.125rem", "block-size": "1.125rem" },
  positive: { "color": { "default": "var(--hraness-studio-emerald)", "@media (forced-colors: active)": "CanvasText" } },
  negative: { "color": { "default": "var(--muted)", "@media (forced-colors: active)": "CanvasText" } },
  conditional: { "color": { "default": "var(--hraness-studio-amber)", "@media (forced-colors: active)": "CanvasText" } },
  text: { "font-variant-numeric": "tabular-nums" },
  detail: { "display": "block", "color": "var(--muted)", "font-size": "0.8125rem", "font-weight": "400", "line-height": "1.45", "margin-block-start": "0.2rem", "max-inline-size": "26ch" },
  note: { "color": "var(--muted)", "font-size": "0.875rem", "line-height": "1.5", "margin-block-start": "1rem", "max-inline-size": "76ch" },
});

import * as stylex from "@stylexjs/stylex";

/**
 * ProviderMark: a soft accent-tinted tile carrying either vendor-colored art
 * or a retinted monochrome glyph. `--_mark-accent` is set per mark by the
 * component; every color below derives from it so surfaces stay in the
 * mark's palette without per-brand rules. Color art overlays the
 * currentColor glyph, so in forced colors the art hides and the glyph keeps
 * a system color. Marks with no artwork fall back to their monogram.
 */
export const providerMarkStyles = stylex.create({
  tile: {
    alignItems: "center",
    aspectRatio: "1",
    backgroundColor: {
      default: "color-mix(in srgb, var(--_mark-accent) 14%, var(--surface, Canvas))",
      "@media (forced-colors: active)": "Canvas",
    },
    backgroundImage: {
      default:
        "linear-gradient(180deg, color-mix(in srgb, white 24%, transparent), transparent 48%), linear-gradient(160deg, color-mix(in srgb, var(--_mark-accent) 26%, transparent), color-mix(in srgb, var(--_mark-accent) 6%, transparent) 74%)",
      "@media (forced-colors: active)": "none",
    },
    borderRadius: "calc(var(--_mark-size) * 0.26)",
    boxShadow: {
      default:
        "inset 0 1px 0 color-mix(in srgb, white 55%, transparent), inset 0 -1px 0 color-mix(in srgb, var(--_mark-accent) 18%, transparent), 0 1px 2px color-mix(in srgb, var(--_mark-accent) 30%, transparent)",
      "@media (forced-colors: active)": "none",
    },
    boxSizing: "border-box",
    color: "light-dark(color-mix(in srgb, var(--_mark-accent) 78%, black), color-mix(in srgb, var(--_mark-accent) 55%, white))",
    display: "inline-flex",
    flexShrink: 0,
    inlineSize: "var(--_mark-size)",
    justifyContent: "center",
    outline: {
      default: "1px solid color-mix(in srgb, var(--_mark-accent) 28%, transparent)",
      "@media (forced-colors: active)": "1px solid ButtonBorder",
    },
    outlineOffset: "-1px",
    position: "relative",
    verticalAlign: "middle",
  },
  solid: {
    backgroundColor: {
      default: "var(--_mark-accent)",
      "@media (forced-colors: active)": "Canvas",
    },
    backgroundImage: {
      default:
        "linear-gradient(180deg, color-mix(in srgb, white 22%, transparent), transparent 52%), linear-gradient(160deg, transparent, color-mix(in srgb, var(--_mark-accent) 78%, black))",
      "@media (forced-colors: active)": "none",
    },
    color: "var(--_mark-on-accent, #f7f6f2)",
    outline: {
      default: "1px solid color-mix(in srgb, var(--_mark-accent) 70%, black)",
      "@media (forced-colors: active)": "1px solid ButtonBorder",
    },
  },
  plain: {
    backgroundColor: "transparent",
    backgroundImage: "none",
    boxShadow: "none",
    color: "light-dark(color-mix(in srgb, var(--_mark-accent) 82%, black), color-mix(in srgb, var(--_mark-accent) 58%, white))",
    outline: "none",
  },
  glyph: {
    blockSize: "64%",
    display: "inline-flex",
    inlineSize: "64%",
  },
  art: {
    blockSize: "68%",
    display: {
      default: "inline-flex",
      "@media (forced-colors: active)": "none",
    },
    inlineSize: "68%",
    inset: "0",
    margin: "auto",
    position: "absolute",
  },
  monogram: {
    alignItems: "center",
    color: "inherit",
    display: {
      default: "none",
      "@media (forced-colors: active)": "inline-flex",
    },
    fontSize: "calc(var(--_mark-size) * 0.36)",
    fontWeight: 700,
    inset: "0",
    justifyContent: "center",
    letterSpacing: "0.02em",
    lineHeight: 1,
    position: "absolute",
  },
  monogramOnly: {
    display: "inline-flex",
    position: "static",
  },
  chip: {
    alignItems: "center",
    display: "inline-flex",
    gap: "calc(var(--_mark-size) * 0.4)",
    minInlineSize: 0,
  },
  chipName: {
    color: "var(--foreground, CanvasText)",
    fontSize: "calc(var(--_mark-size) * 0.46)",
    fontWeight: 550,
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
    minInlineSize: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

export function providerMarkClassName(
  part: keyof typeof providerMarkStyles,
  caller?: string,
): string {
  const hook =
    part === "tile"
      ? "hraness-provider-mark"
      : `hraness-provider-mark__${part.replaceAll(/[A-Z]/gu, (c) => `-${c.toLowerCase()}`)}`;
  return [hook, stylex.props(providerMarkStyles[part]).className, caller]
    .filter(Boolean)
    .join(" ");
}

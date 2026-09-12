import * as stylex from "@stylexjs/stylex";

const forcedColors = "@media (forced-colors: active)";
const disabled = ':is(:disabled, [data-disabled], [aria-disabled="true"])';
const disabledField = ':has(input:disabled, textarea:disabled)';

/** Paint adapters for the existing primitive's controlXstyle seam.
 * Keep focus, geometry, error, pending and disabled behavior with @hraness/ui. */
export const lanternControlStyles = stylex.create({
  edge: {
    backgroundImage: {
      default: "linear-gradient(to bottom, var(--hraness-material-edge), transparent 2px)",
      [disabled]: "none",
      [forcedColors]: "none",
    },
  },
  inset: {
    backgroundImage: {
      default: "linear-gradient(to bottom, var(--hraness-material-shade), transparent 4px)",
      [disabledField]: "none",
      [forcedColors]: "none",
    },
  },
  selected: {
    backgroundColor: {
      default: "var(--hraness-material-warm-plane)",
      [forcedColors]: "Highlight",
    },
    backgroundImage: {
      default: "linear-gradient(to top, var(--hraness-material-warm), var(--hraness-material-warm) 2px, transparent 2px)",
      [disabled]: "none",
      [forcedColors]: "none",
    },
    color: {
      default: "var(--hraness-material-ink)",
      [forcedColors]: "HighlightText",
    },
  },
});

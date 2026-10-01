import * as stylex from "@stylexjs/stylex";

const ink = "var(--foreground, CanvasText)";
const surface = "var(--surface, Canvas)";
const background = "var(--background, Canvas)";
const forced = "@media (forced-colors: active)";

export const setupCopyButtonStyles = stylex.create({
  button: {
    alignItems: "center",
    appearance: "none",
    backgroundColor: { default: background, ":hover": surface, [forced]: "ButtonFace" },
    borderColor: { default: `color-mix(in srgb, ${ink} 15%, transparent)`, [forced]: "ButtonText" },
    borderRadius: "0.5rem",
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    color: { default: ink, [forced]: "ButtonText" },
    cursor: "pointer",
    display: { default: "inline-flex", "@media (scripting: none)": "none" },
    flexShrink: 0,
    fontFamily: "var(--font-text, ui-sans-serif, system-ui, sans-serif)",
    fontSize: "0.8125rem",
    fontWeight: 500,
    gap: "0.4rem",
    justifyContent: "center",
    lineHeight: 1,
    margin: 0,
    minBlockSize: "2.75rem",
    outline: { default: "none", ":focus-visible": "2px solid var(--focus, Highlight)" },
    outlineOffset: "2px",
    padding: "0.65rem 0.8rem",
  },
  icon: { blockSize: "1rem", flexShrink: 0, inlineSize: "1rem" },
});

export function setupCopyButtonClassName(part: keyof typeof setupCopyButtonStyles, caller?: string): string {
  return [`hraness-setup-copy__${part}`, stylex.props(setupCopyButtonStyles[part]).className, caller].filter(Boolean).join(" ");
}

import * as stylex from "@stylexjs/stylex";

// These opaque neutral pairs remain readable inside an accent-colored section.
const ink = "var(--foreground, CanvasText)";
const muted = "var(--muted, GrayText)";
const surface = "var(--surface, Canvas)";
const background = "var(--background, Canvas)";
const line = `color-mix(in srgb, ${ink} 15%, transparent)`;
const focus = "var(--focus, Highlight)";
const mono = "var(--font-mono, ui-monospace, monospace)";
const forced = "@media (forced-colors: active)";
const noScript = "@media (scripting: none)";
const wide = "@container hraness-agent-setup (min-width: 42rem)";

export const agentSetupStyles = stylex.create({
  root: {
    color: { default: ink, [forced]: "CanvasText" },
    containerName: "hraness-agent-setup",
    containerType: "inline-size",
    fontFamily: "var(--font-text, ui-sans-serif, system-ui, sans-serif)",
    inlineSize: "100%",
    minInlineSize: 0,
  },
  layout: {
    alignItems: "start",
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "minmax(0, 1fr)",
    minInlineSize: 0,
  },
  withTargets: {
    gridTemplateColumns: "var(--_hraness-agent-setup-columns, minmax(0, 1fr))",
    "--_hraness-agent-setup-columns": { default: null, [wide]: "minmax(0, 1fr) minmax(11rem, 14rem)" },
  },
  frame: {
    backgroundColor: { default: surface, [forced]: "Canvas" },
    borderColor: { default: line, [forced]: "CanvasText" },
    borderRadius: "0.75rem",
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    minInlineSize: 0,
    overflow: "hidden",
    position: "relative",
  },
  preview: {
    maxBlockSize: "11rem",
    minInlineSize: 0,
    overflow: "hidden",
    padding: "1rem 1rem 0",
  },
  previewText: {
    maskImage: { default: "linear-gradient(black 55%, transparent)", [forced]: "none" },
    maxBlockSize: "10rem",
    overflow: "hidden",
  },
  pre: {
    backgroundColor: "transparent",
    borderRadius: 0,
    color: { default: ink, [forced]: "CanvasText" },
    fontFamily: mono,
    fontSize: "0.8125rem",
    lineHeight: 1.65,
    margin: 0,
    maxInlineSize: "100%",
    minInlineSize: 0,
    overflowWrap: "anywhere",
    padding: 0,
    tabSize: 2,
    whiteSpace: "pre-wrap",
    wordBreak: "normal",
  },
  full: {
    padding: "0.5rem 1rem 4rem",
  },
  details: {
    minInlineSize: 0,
  },
  summary: {
    color: { default: muted, [forced]: "CanvasText" },
    cursor: "pointer",
    fontSize: "0.8125rem",
    lineHeight: 1.4,
    listStyle: "none",
    minBlockSize: "3.5rem",
    outline: { default: "none", ":focus-visible": `2px solid ${focus}` },
    outlineOffset: "-3px",
    padding: "1.1rem 7rem 1rem 1rem",
    ":hover": { color: ink },
    "::marker": { content: '""' },
  },
  copyOverlay: {
    insetBlockEnd: "0.5rem",
    insetInlineEnd: "0.5rem",
    position: "absolute",
  },
  targets: { display: "grid", gap: "0.6rem", minInlineSize: 0 },
  targetsLabel: { color: { default: muted, [forced]: "CanvasText" }, fontSize: "0.8125rem", fontWeight: 500, margin: 0 },
  targetList: { display: "grid", gap: "0.45rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 10rem), 1fr))", listStyle: "none", margin: 0, padding: 0 },
  targetGrid: {
    gridTemplateColumns: "repeat(var(--_hraness-agent-target-wide-columns, var(--_hraness-agent-target-columns, 1)), minmax(0, 1fr))",
    "--_hraness-agent-target-columns": { default: null, "@container hraness-agent-setup (min-width: 20rem)": "2" },
    "--_hraness-agent-target-wide-columns": { default: null, "@container hraness-agent-setup (min-width: 34rem)": "3" },
  },
  target: {
    alignItems: "center",
    backgroundColor: { default: surface, ":hover": background, [forced]: "ButtonFace" },
    borderColor: { default: line, [forced]: "ButtonText" },
    borderRadius: "0.5rem",
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    color: { default: ink, [forced]: "ButtonText" },
    display: "flex",
    fontSize: "0.875rem",
    gap: "0.65rem",
    lineHeight: 1.3,
    minBlockSize: "2.75rem",
    minInlineSize: 0,
    outline: { default: "none", ":focus-visible": `2px solid ${focus}` },
    outlineOffset: "2px",
    padding: "0.65rem 0.8rem",
    textDecoration: "none",
  },
  commandRoot: { display: "grid", gap: "0.6rem", minInlineSize: 0 },
  tablist: {
    display: { default: "flex", [noScript]: "none" },
    flexWrap: "wrap",
    gap: "0.3rem",
    minInlineSize: 0,
  },
  tab: {
    alignItems: "center",
    appearance: "none",
    backgroundColor: { default: surface, ":hover": background, [forced]: "ButtonFace" },
    borderColor: { default: "transparent", [forced]: "ButtonText" },
    borderRadius: "0.5rem",
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    color: { default: ink, ":hover": ink, [forced]: "ButtonText" },
    cursor: "pointer",
    display: "inline-flex",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    gap: "0.55rem",
    lineHeight: 1.3,
    margin: 0,
    minBlockSize: "2.75rem",
    minInlineSize: 0,
    outline: { default: "none", ":focus-visible": `2px solid ${focus}` },
    outlineOffset: "2px",
    padding: "0.6rem 0.8rem",
  },
  tabSelected: {
    backgroundColor: { default: ink, ":hover": ink, [forced]: "Highlight" },
    color: { default: background, ":hover": background, [forced]: "HighlightText" },
    forcedColorAdjust: { default: null, [forced]: "none" },
  },
  panel: { display: { default: null, [noScript]: "block" }, minInlineSize: 0 },
  commandBar: { alignItems: "center", display: "flex", justifyContent: "space-between", minInlineSize: 0, padding: "0.4rem 0.4rem 0 1rem" },
  commandLabels: { display: "grid", gap: "0.25rem", minInlineSize: 0 },
  filename: { color: { default: muted, [forced]: "CanvasText" }, fontFamily: mono, fontSize: "0.75rem", overflowWrap: "anywhere" },
  panelLabel: { alignItems: "center", display: { default: "none", [noScript]: "flex" }, fontSize: "0.875rem", gap: "0.5rem", margin: 0 },
  commandText: { padding: "0.5rem 1rem 1rem" },
  code: { backgroundColor: "transparent", color: "inherit", fontFamily: "inherit", fontSize: "inherit", padding: 0 },
  status: { blockSize: "1px", borderWidth: 0, clipPath: "inset(50%)", inlineSize: "1px", margin: "-1px", overflow: "hidden", padding: 0, position: "absolute", whiteSpace: "nowrap" },
});

type Part = keyof typeof agentSetupStyles;

export function agentSetupClassName(parts: readonly (Part | false | undefined)[], caller?: string): string {
  const active = parts.filter((part): part is Part => part !== false && part !== undefined);
  const atoms = stylex.props(...active.map((part) => agentSetupStyles[part])).className;
  return [...active.map((part) => `hraness-agent-setup__${part}`), atoms, caller].filter(Boolean).join(" ");
}

import * as stylex from "@stylexjs/stylex";

/*
 * PlatformInstall, PlatformIcon, and PlatformBadges.
 *
 * Colors read the marketing roles when the component sits inside a marketing
 * page and fall back to the base tokens, then system colors, elsewhere. With
 * scripting disabled the tab row and copy buttons hide and every panel shows
 * under its own platform label, so each command stays reachable without
 * JavaScript. Hidden panels rely on the `hidden` attribute, so panel roots
 * declare no default display.
 */
const ink = "var(--hraness-marketing-ink, var(--foreground, CanvasText))";
const muted = "var(--hraness-marketing-muted, var(--muted, GrayText))";
const surface = "var(--hraness-marketing-surface, var(--surface, Canvas))";
const background = "var(--hraness-marketing-background, var(--background, Canvas))";
const line = `color-mix(in srgb, ${ink} 12%, transparent)`;
const lineStrong = `color-mix(in srgb, ${ink} 22%, transparent)`;
const focusRing = "var(--hraness-marketing-accent, var(--focus, Highlight))";
const monoFont = "var(--hraness-marketing-mono-font, var(--font-mono, ui-monospace, monospace))";
const textFont = "var(--hraness-marketing-text-font, var(--font-text, inherit))";
const noScript = "@media (scripting: none)";
const forced = "@media (forced-colors: active)";
// Phones and narrow columns: the tab row spans the column and its tabs
// tighten so macOS, Linux, and Windows fit side by side at 320px.
const narrow = "@media (max-width: 30rem)";

export const platformInstallStyles = stylex.create({
  root: {
    color: ink,
    display: "grid",
    fontFamily: textFont,
    gap: "0.75rem",
    inlineSize: "100%",
    minInlineSize: 0,
  },
  tablist: {
    alignItems: "stretch",
    backgroundColor: {
      default: `color-mix(in srgb, ${ink} 5%, ${background})`,
      [forced]: "Canvas",
    },
    borderColor: { default: line, [forced]: "CanvasText" },
    borderRadius: "0.75rem",
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    display: { default: "flex", [noScript]: "none" },
    gap: { default: "0.25rem", [narrow]: "0.125rem" },
    justifySelf: { default: "start", [narrow]: "stretch" },
    maxInlineSize: "100%",
    minInlineSize: 0,
    overflowX: "auto",
    padding: { default: "0.25rem", [narrow]: "0.1875rem" },
    scrollbarWidth: "none",
  },
  tab: {
    alignItems: "center",
    appearance: "none",
    backgroundColor: {
      default: "transparent",
      ":hover": `color-mix(in srgb, ${ink} 6%, transparent)`,
    },
    borderColor: "transparent",
    borderRadius: "0.5rem",
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    color: { default: muted, ":hover": ink, [forced]: "ButtonText" },
    cursor: "pointer",
    display: "inline-flex",
    flexBasis: "auto",
    flexGrow: 1,
    flexShrink: 1,
    fontFamily: "inherit",
    fontSize: { default: "0.875rem", [narrow]: "0.8125rem" },
    fontWeight: 500,
    gap: { default: "0.45rem", [narrow]: "0.3rem" },
    justifyContent: "center",
    lineHeight: 1.2,
    margin: 0,
    minBlockSize: { default: "2.25rem", "@media (pointer: coarse)": "2.75rem" },
    minInlineSize: 0,
    outline: { default: "none", ":focus-visible": `2px solid ${focusRing}` },
    outlineOffset: "1px",
    paddingBlock: "0.4rem",
    paddingInline: { default: "0.8rem", [narrow]: "0.45rem" },
    transitionDuration: { default: "120ms", "@media (prefers-reduced-motion: reduce)": "0s" },
    transitionProperty: "background-color, color, border-color",
    whiteSpace: "nowrap",
  },
  tabLabel: {
    minInlineSize: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  tabSelected: {
    // Preserve paired system colors without automatic text backplates on labels.
    forcedColorAdjust: { default: null, [forced]: "none" },
    backgroundColor: {
      default: surface,
      ":hover": surface,
      [forced]: "Highlight",
    },
    borderColor: { default: lineStrong, [forced]: "Highlight" },
    boxShadow: {
      default: `0 1px 2px color-mix(in srgb, ${ink} 10%, transparent)`,
      [forced]: "none",
    },
    color: { default: ink, ":hover": ink, [forced]: "HighlightText" },
  },
  panel: {
    display: { default: null, [noScript]: "block" },
    minInlineSize: 0,
  },
  panelBody: {
    display: "grid",
    gap: "0.6rem",
    minInlineSize: 0,
  },
  panelLabel: {
    alignItems: "center",
    color: ink,
    display: { default: "none", [noScript]: "flex" },
    fontSize: "0.875rem",
    fontWeight: 600,
    gap: "0.45rem",
    margin: 0,
  },
  command: {
    backgroundColor: { default: surface, [forced]: "Canvas" },
    borderColor: { default: line, [forced]: "CanvasText" },
    borderRadius: "0.75rem",
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    display: "grid",
    minInlineSize: 0,
    overflow: "hidden",
  },
  commandBar: {
    alignItems: "center",
    borderBlockEndColor: { default: line, [forced]: "CanvasText" },
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: "1px",
    color: { default: muted, [forced]: "CanvasText" },
    display: "flex",
    fontSize: "0.8125rem",
    gap: "0.75rem",
    justifyContent: "space-between",
    lineHeight: 1.3,
    minBlockSize: "2.5rem",
    minInlineSize: 0,
    paddingBlock: "0.25rem",
    paddingInlineEnd: "0.3rem",
    paddingInlineStart: "0.9rem",
  },
  commandBarEmpty: {
    display: { default: "flex", [noScript]: "none" },
  },
  shell: {
    minInlineSize: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  pre: {
    backgroundColor: "transparent",
    borderRadius: 0,
    boxSizing: "border-box",
    color: { default: ink, [forced]: "CanvasText" },
    fontFamily: monoFont,
    fontSize: "0.875rem",
    lineHeight: 1.6,
    margin: 0,
    maxInlineSize: "100%",
    minInlineSize: 0,
    outline: { default: "none", ":focus-visible": `2px solid ${focusRing}` },
    outlineOffset: "-2px",
    overflowWrap: "normal",
    overflowX: "auto",
    paddingBlock: "0.85rem",
    paddingInline: "0.95rem",
    tabSize: 2,
    whiteSpace: "pre",
    wordBreak: "normal",
  },
  code: {
    backgroundColor: "transparent",
    borderRadius: 0,
    color: "inherit",
    fontFamily: "inherit",
    fontSize: "inherit",
    padding: 0,
  },
  copy: {
    alignItems: "center",
    appearance: "none",
    backgroundColor: {
      default: `color-mix(in srgb, ${ink} 4%, ${surface})`,
      ":hover": `color-mix(in srgb, ${ink} 9%, ${surface})`,
      [forced]: "ButtonFace",
    },
    borderColor: { default: line, [forced]: "ButtonText" },
    borderRadius: "0.5rem",
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    color: { default: ink, [forced]: "ButtonText" },
    cursor: "pointer",
    display: { default: "inline-flex", [noScript]: "none" },
    flexShrink: 0,
    fontFamily: textFont,
    fontSize: "0.8125rem",
    fontWeight: 500,
    gap: "0.35rem",
    lineHeight: 1,
    margin: 0,
    minBlockSize: { default: "2rem", "@media (pointer: coarse)": "2.75rem" },
    outline: { default: "none", ":focus-visible": `2px solid ${focusRing}` },
    outlineOffset: "1px",
    paddingBlock: "0.35rem",
    paddingInline: "0.65rem",
  },
  copyIcon: {
    blockSize: "0.95rem",
    flexShrink: 0,
    inlineSize: "0.95rem",
  },
  alternatives: {
    display: "grid",
    gap: "0.6rem",
    listStyle: "none",
    margin: 0,
    minInlineSize: 0,
    padding: 0,
  },
  note: {
    color: { default: muted, [forced]: "CanvasText" },
    fontSize: "0.875rem",
    lineHeight: 1.5,
    margin: 0,
  },
  unavailable: {
    borderColor: { default: line, [forced]: "CanvasText" },
    borderRadius: "0.75rem",
    borderStyle: "dashed",
    borderWidth: "1px",
    color: ink,
    fontSize: "0.9rem",
    lineHeight: 1.5,
    margin: 0,
    paddingBlock: "0.85rem",
    paddingInline: "0.95rem",
  },
  status: {
    blockSize: "1px",
    borderWidth: 0,
    clipPath: "inset(50%)",
    inlineSize: "1px",
    margin: "-1px",
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
  },
  markSymbols: {
    blockSize: 0,
    inlineSize: 0,
    overflow: "hidden",
    position: "absolute",
  },
  icon: {
    blockSize: "var(--hraness-platform-icon-size, 1em)",
    display: "inline-block",
    fill: "currentColor",
    flexShrink: 0,
    inlineSize: "var(--hraness-platform-icon-size, 1em)",
    verticalAlign: "-0.125em",
  },
  iconSm: { "--hraness-platform-icon-size": "1rem" },
  iconMd: { "--hraness-platform-icon-size": "1.25rem" },
  iconLg: { "--hraness-platform-icon-size": "1.5rem" },
  badges: {
    alignItems: "center",
    color: { default: muted, [forced]: "CanvasText" },
    columnGap: "0.75rem",
    display: "flex",
    flexWrap: "wrap",
    fontFamily: textFont,
    fontSize: "0.875rem",
    lineHeight: 1.4,
    margin: 0,
    rowGap: "0.4rem",
  },
  badgesLabel: {
    color: { default: muted, [forced]: "CanvasText" },
    fontWeight: 500,
  },
  badgesList: {
    alignItems: "center",
    columnGap: "0.9rem",
    display: "flex",
    flexWrap: "wrap",
    listStyle: "none",
    margin: 0,
    padding: 0,
    rowGap: "0.4rem",
  },
  badge: {
    alignItems: "center",
    color: { default: ink, [forced]: "CanvasText" },
    display: "inline-flex",
    gap: "0.4rem",
    whiteSpace: "nowrap",
  },
  badgeNote: {
    color: { default: muted, [forced]: "CanvasText" },
  },
});

type Part = keyof typeof platformInstallStyles;

const hooks: Partial<Record<Part, string>> = {
  alternatives: "hraness-platform-install__alternatives",
  badge: "hraness-platform-badges__item",
  badgeNote: "hraness-platform-badges__note",
  badges: "hraness-platform-badges",
  badgesLabel: "hraness-platform-badges__label",
  badgesList: "hraness-platform-badges__list",
  code: "hraness-platform-install__code",
  command: "hraness-platform-install__command",
  commandBar: "hraness-platform-install__command-bar",
  copy: "hraness-platform-install__copy",
  copyIcon: "hraness-platform-install__copy-icon",
  icon: "hraness-platform-icon",
  markSymbols: "hraness-platform-install__marks",
  note: "hraness-platform-install__note",
  panel: "hraness-platform-install__panel",
  panelBody: "hraness-platform-install__panel-body",
  panelLabel: "hraness-platform-install__panel-label",
  pre: "hraness-platform-install__pre",
  root: "hraness-platform-install",
  shell: "hraness-platform-install__shell",
  status: "hraness-platform-install__status",
  tab: "hraness-platform-install__tab",
  tabLabel: "hraness-platform-install__tab-label",
  tablist: "hraness-platform-install__tabs",
  unavailable: "hraness-platform-install__unavailable",
};

/** Stable hook classes first, then the compiled atoms for every listed part, then the caller's class. */
export function platformInstallClassName(parts: readonly (Part | false | undefined)[], caller?: string): string {
  const active = parts.filter((part): part is Part => part !== false && part !== undefined);
  const hookNames = active.map((part) => hooks[part]).filter((name): name is string => name !== undefined);
  const atoms = stylex.props(...active.map((part) => platformInstallStyles[part])).className;
  return [...hookNames, atoms, caller].filter(Boolean).join(" ");
}

import * as stylex from "@stylexjs/stylex";

const hovered = ":is([data-hovered], :hover)";
const focusVisible = ":is([data-focus-visible], :focus-visible)";

export const navigationRailStyles = stylex.create({
  item: {
    alignItems: "center",
    borderRadius: "var(--control-radius)",
    color: "var(--muted)",
    display: "grid",
    gap: "var(--space-2)",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    "min-block-size": "var(--interactive-target-min)",
    padding: "var(--space-2) var(--space-3)",
    textDecoration: "none",
  },
  itemActive: {
    backgroundAttachment: { default: "scroll", [hovered]: "scroll" },
    backgroundClip: { default: "border-box", [hovered]: "border-box" },
    backgroundImage: { default: "none", [hovered]: "none" },
    backgroundOrigin: { default: "padding-box", [hovered]: "padding-box" },
    backgroundPosition: { default: "0% 0%", [hovered]: "0% 0%" },
    backgroundRepeat: { default: "repeat", [hovered]: "repeat" },
    backgroundSize: { default: "auto auto", [hovered]: "auto auto" },
    backgroundColor: {
      default: "var(--secondary)",
      [hovered]: "var(--secondary)",
    },
    color: {
      default: "var(--secondary-foreground)",
      [hovered]: "var(--secondary-foreground)",
    },
  },
  itemCopy: {
    display: "grid",
    gap: "0.125rem",
    "min-inline-size": 0,
  },
  itemDescription: {
    color: "var(--muted)",
    fontSize: "var(--text-caption)",
    overflowWrap: "anywhere",
  },
  itemIcon: {
    display: "inline-grid",
    placeItems: "center",
  },
  itemLabel: {
    fontWeight: "var(--font-weight-medium)",
    overflowWrap: "anywhere",
  },
  itemNativeInteractionFallbacks: {
    backgroundAttachment: { default: null, [hovered]: "scroll" },
    backgroundClip: { default: null, [hovered]: "border-box" },
    backgroundImage: { default: null, [hovered]: "none" },
    backgroundOrigin: { default: null, [hovered]: "padding-box" },
    backgroundPosition: { default: null, [hovered]: "0% 0%" },
    backgroundRepeat: { default: null, [hovered]: "repeat" },
    backgroundSize: { default: null, [hovered]: "auto auto" },
    backgroundColor: {
      default: null,
      [hovered]: "var(--surface-hover)",
    },
    color: {
      default: null,
      [hovered]: "var(--foreground)",
    },
    outlineColor: {
      default: null,
      [focusVisible]: "var(--focus)",
    },
    outlineOffset: {
      default: null,
      [focusVisible]: 2,
    },
    outlineStyle: {
      default: null,
      [focusVisible]: "solid",
    },
    outlineWidth: {
      default: null,
      [focusVisible]: 3,
    },
  },
  navigation: {
    alignContent: "start",
    display: "grid",
    flex: "1 1 auto",
    gap: "var(--space-4)",
    "min-block-size": 0,
    overflow: "auto",
    padding: "var(--space-3)",
  },
  rail: {
    backgroundAttachment: "scroll",
    backgroundClip: "border-box",
    backgroundImage: "none",
    backgroundOrigin: "padding-box",
    backgroundPosition: "0% 0%",
    backgroundRepeat: "repeat",
    backgroundSize: "auto auto",
    backgroundColor: "var(--surface)",
    "block-size": "100%",
    display: "flex",
    flexDirection: "column",
    "min-block-size": 0,
  },
  railEdge: {
    flex: "0 0 auto",
    padding: "var(--space-4)",
  },
  section: {
    display: "grid",
    gap: "var(--space-2)",
  },
  sectionItems: {
    display: "grid",
    gap: "var(--space-1)",
  },
  sectionTitle: {
    color: "var(--muted)",
    fontSize: "var(--text-caption)",
    fontWeight: "var(--font-weight-medium)",
    letterSpacing: "0.04em",
    margin: 0,
    "padding-inline": "var(--space-2)",
    textTransform: "uppercase",
  },
});

import * as stylex from "@stylexjs/stylex";

export const productionDataPreviewNoticeStyles = stylex.create({
  emphasis: {
    fontWeight: "var(--font-weight-bold, 700)",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  root: {
    alignItems: "center",
    backgroundColor: "#ffcc33",
    borderBlockEndColor: "#5c1906",
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: 2,
    boxShadow: "0 3px 12px rgb(36 20 0 / 0.35)",
    color: "#241400",
    display: "flex",
    flexWrap: "wrap",
    fontFamily: "var(--font-text, system-ui, sans-serif)",
    fontSize: "var(--text-label, 0.875rem)",
    gap: "var(--space-1, 0.25rem) var(--space-3, 0.75rem)",
    insetBlockStart: 0,
    justifyContent: "center",
    lineHeight: 1.35,
    minHeight: "3rem",
    paddingBlock: "max(var(--space-2, 0.5rem), env(safe-area-inset-top))",
    paddingInline: "max(var(--space-4, 1rem), env(safe-area-inset-left)) max(var(--space-4, 1rem), env(safe-area-inset-right))",
    position: "sticky",
    textAlign: "center",
    width: "100%",
    zIndex: "calc(var(--z-tooltip, 3000) + 1)",
  },
});

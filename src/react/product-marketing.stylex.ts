import * as stylex from "@stylexjs/stylex";

export type MarketingColumnCount = 1 | 2 | 3 | 4;

// The public static stylesheet remains unchanged. These owned slot recipes
// preserve its declarations and finite states for compiler-adopter React graphs.
// Compound border tokens stay in native side shorthands; only a full border
// resets border-image. Kebab-case logical properties retain the writing axis.
// Finite variants preserve the static selectors' specificity, including accent
// actions winning over lower-specificity forced-color rules and the compact
// header height winning over the generic coarse-pointer minimum. Physical color
// longhands make finite border-color overrides independent of atom hash order.
export const questionMarker = stylex.defineMarker();

export const marketingStyles = stylex.create({
  factColumns1: { "--hraness-marketing-fact-columns": "1" },
  factColumns2: { "--hraness-marketing-fact-columns": "2" },
  factColumns3: { "--hraness-marketing-fact-columns": "3" },
  factColumns4: { "--hraness-marketing-fact-columns": "4" },
  pillarColumns1: { "--hraness-marketing-pillar-columns": "1" },
  pillarColumns2: { "--hraness-marketing-pillar-columns": "2" },
  pillarColumns3: { "--hraness-marketing-pillar-columns": "3" },
  pillarColumns4: { "--hraness-marketing-pillar-columns": "4" },
  actionFocus: {
    outline: { default: null, ":focus-visible": "2px solid var(--hraness-marketing-accent)" },
    "outline-offset": { default: null, ":focus-visible": "2px" },
  },
  "page": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "background-color": "var(--hraness-marketing-background)",
    "background-image": "none",
    "background-position": "0% 0%",
    "background-size": "auto auto",
    "background-repeat": "repeat",
    "background-origin": "padding-box",
    "background-clip": "border-box",
    "background-attachment": "scroll",
    "font-size": "1rem",
    "line-height": "1.55",
    "overflow-x": "clip",
    "-webkit-font-smoothing": "antialiased"
  },
  "header": {
    "color": {
      "default": "var(--hraness-marketing-ink)",
      "@media (forced-colors: active)": "CanvasText"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "position": "sticky",
    "inset-block-start": "0",
    "z-index": "40",
    "border-block-end": "var(--hraness-marketing-rule)",
    "background-color": {
      "default": "color-mix(in oklch, var(--hraness-marketing-background) 82%, transparent)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "backdrop-filter": "blur(14px) saturate(1.4)",
    "-webkit-backdrop-filter": "blur(14px) saturate(1.4)",
    "border-top": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "@media (forced-colors: active)": "stretch"
    },
    "box-shadow": {
      "@media (forced-colors: active)": "none"
    }
  },
  "headerStatic": {
    "color": {
      "default": "var(--hraness-marketing-ink)",
      "@media (forced-colors: active)": "CanvasText"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "position": "static",
    "inset-block-start": "0",
    "z-index": "40",
    "border-block-end": "var(--hraness-marketing-rule)",
    "background-color": {
      "default": "color-mix(in oklch, var(--hraness-marketing-background) 82%, transparent)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "backdrop-filter": "blur(14px) saturate(1.4)",
    "-webkit-backdrop-filter": "blur(14px) saturate(1.4)",
    "border-top": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "@media (forced-colors: active)": "stretch"
    },
    "box-shadow": {
      "@media (forced-colors: active)": "none"
    }
  },
  "header__inner": {
    "display": "flex",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-block-size": "3.5rem",
    "align-items": "center",
    "gap": "0.75rem 1.5rem",
    "margin-inline": "auto",
    "padding-inline": "var(--hraness-marketing-gutter)",
    "flex-wrap": {
      "@media (max-width: 48rem)": "wrap"
    },
    "padding-block": {
      "@media (max-width: 48rem)": "0.6rem"
    }
  },
  "header__brand": {
    "display": "inline-flex",
    "align-items": "center",
    "gap": "0.5rem",
    "color": "var(--hraness-marketing-ink)",
    "font-size": "1rem",
    "font-weight": "600",
    "letter-spacing": "-0.01em",
    "text-decoration": "none"
  },
  "header__nav": {
    "display": "flex",
    "flex-wrap": "wrap",
    "align-items": "center",
    "gap": {
      "default": "0.15rem 1.35rem",
      "@media (max-width: 48rem)": "0.15rem 1rem"
    },
    "margin-inline-start": "auto",
    "order": {
      "@media (max-width: 48rem)": "3"
    },
    "inline-size": {
      "@media (max-width: 48rem)": "100%"
    }
  },
  "header__link": {
    "color": {
      "default": "var(--hraness-marketing-muted)",
      ":hover": "var(--hraness-marketing-ink)"
    },
    "font-size": "0.92rem",
    "font-weight": "500",
    "text-decoration": "none"
  },
  "header__linkCurrent": {
    "color": "var(--hraness-marketing-ink)",
    "font-size": "0.92rem",
    "font-weight": "500",
    "text-decoration": "none"
  },
  "header__actions": {
    "display": "flex",
    "align-items": "center",
    "gap": "0.5rem"
  },
  "hero": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "display": "grid",
    "gap": "clamp(2rem, 5vw, 3.5rem)",
    "padding-block": "clamp(3.5rem, 9vw, 7rem) clamp(2.5rem, 6vw, 4.5rem)"
  },
  "heroAccent": {
    "color": {
      "default": "var(--hraness-marketing-accent-ink)",
      "@media (forced-colors: active)": "CanvasText"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "display": "grid",
    "gap": "clamp(2rem, 5vw, 3.5rem)",
    "padding-block": "clamp(3.5rem, 9vw, 7rem) clamp(2.5rem, 6vw, 4.5rem)",
    "background-color": {
      "default": "var(--hraness-marketing-accent)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "linear-gradient(color-mix(in oklch, var(--hraness-marketing-accent-ink) 7%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--hraness-marketing-accent-ink) 7%, transparent) 1px, transparent 1px), none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "3.5rem 3.5rem, 3.5rem 3.5rem, auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "box-shadow": {
      "default": "0 0 0 100vmax var(--hraness-marketing-accent)",
      "@media (forced-colors: active)": "none"
    },
    "clip-path": "inset(0 -100vmax)",
    "border-top": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "@media (forced-colors: active)": "stretch"
    }
  },
  "hero__copy": {
    "display": "grid",
    "min-inline-size": "0",
    "justify-items": "center",
    "gap": "1.25rem",
    "text-align": "center"
  },
  "hero__copyStart": {
    "display": "grid",
    "min-inline-size": "0",
    "justify-items": "start",
    "gap": "1.25rem",
    "text-align": "start"
  },
  "hero__eyebrow": {
    "margin": "0",
    "color": {
      "default": "var(--hraness-marketing-muted)",
      "@media (forced-colors: active)": "CanvasText"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none",
    "display": "inline-flex",
    "align-items": "center",
    "gap": "0.45rem",
    "padding": "0.3rem 0.8rem",
    "border-top": {
      "default": "1px solid color-mix(in oklch, var(--hraness-marketing-accent) 32%, transparent)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "1px solid color-mix(in oklch, var(--hraness-marketing-accent) 32%, transparent)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "1px solid color-mix(in oklch, var(--hraness-marketing-accent) 32%, transparent)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "1px solid color-mix(in oklch, var(--hraness-marketing-accent) 32%, transparent)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "999px",
    "background-color": {
      "default": "var(--hraness-marketing-accent-soft)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    }
  },
  "hero__eyebrowAccent": {
    "margin": "0",
    "color": "var(--hraness-marketing-accent-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none",
    "display": "inline-flex",
    "align-items": "center",
    "gap": "0.45rem",
    "padding": "0.3rem 0.8rem",
    "border-top": {
      "default": "1px solid color-mix(in oklch, var(--hraness-marketing-accent) 32%, transparent)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "1px solid color-mix(in oklch, var(--hraness-marketing-accent) 32%, transparent)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "1px solid color-mix(in oklch, var(--hraness-marketing-accent) 32%, transparent)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "1px solid color-mix(in oklch, var(--hraness-marketing-accent) 32%, transparent)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "999px",
    "background-color": "color-mix(in oklch, var(--hraness-marketing-accent-ink) 14%, transparent)",
    "background-image": "none",
    "background-position": "0% 0%",
    "background-size": "auto auto",
    "background-repeat": "repeat",
    "background-origin": "padding-box",
    "background-clip": "border-box",
    "background-attachment": "scroll",
    "border-top-color": "color-mix(in oklch, var(--hraness-marketing-accent-ink) 40%, transparent)",
    "border-right-color": "color-mix(in oklch, var(--hraness-marketing-accent-ink) 40%, transparent)",
    "border-bottom-color": "color-mix(in oklch, var(--hraness-marketing-accent-ink) 40%, transparent)",
    "border-left-color": "color-mix(in oklch, var(--hraness-marketing-accent-ink) 40%, transparent)"
  },
  "hero__name": {
    "margin": "-1px",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none",
    "position": "absolute",
    "inline-size": "1px",
    "block-size": "1px",
    "padding": "0",
    "overflow": "hidden",
    "clip": "rect(0 0 0 0)",
    "clip-path": "inset(50%)",
    "white-space": "nowrap",
    "border-top": "0",
    "border-right": "0",
    "border-bottom": "0",
    "border-left": "0",
    "border-image-source": "none",
    "border-image-slice": "100%",
    "border-image-width": "1",
    "border-image-outset": "0",
    "border-image-repeat": "stretch"
  },
  "hero__heading": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-weight": "var(--hraness-marketing-heading-weight)",
    "letter-spacing": "var(--hraness-marketing-heading-tracking)",
    "line-height": "1.05",
    "text-wrap": "balance",
    "max-inline-size": {
      "default": "18ch",
      "@media (max-width: 48rem)": "14ch"
    },
    "font-size": "clamp(2.5rem, 5vw, 4.25rem)"
  },
  "hero__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "clamp(1.125rem, 1.6vw, 1.3rem)",
    "line-height": "1.45",
    "max-inline-size": "var(--hraness-marketing-copy-measure)"
  },
  "hero__example": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "1.05rem",
    "line-height": "1.5",
    "max-inline-size": "var(--hraness-marketing-copy-measure)",
    "margin-block-start": "-0.35rem"
  },
  "hero__actions": {
    "display": "flex",
    "flex-wrap": "wrap",
    "align-items": "center",
    "gap": "0.65rem",
    "justify-content": "center",
    "margin-block-start": "0.5rem"
  },
  "hero__actionsStart": {
    "display": "flex",
    "flex-wrap": "wrap",
    "align-items": "center",
    "gap": "0.65rem",
    "justify-content": "flex-start",
    "margin-block-start": "0.5rem"
  },
  "hero__boundary": {
    "max-inline-size": "var(--hraness-marketing-copy-measure)",
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.9rem",
    "line-height": "1.5"
  },
  "hero__frame": {
    "min-inline-size": "0"
  },
  "proof": {
    "display": "grid",
    "min-inline-size": "0",
    "gap": "1rem",
    "padding": "clamp(1.25rem, 3vw, 2rem)",
    "border-top": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-frame-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-surface)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "box-shadow": {
      "default": "var(--hraness-marketing-shadow)",
      "@media (forced-colors: active)": "none"
    },
    "color": {
      "@media (forced-colors: active)": "CanvasText"
    }
  },
  "proof__kicker": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none"
  },
  "proof__heading": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-weight": "var(--hraness-marketing-heading-weight)",
    "letter-spacing": "-0.012em",
    "line-height": "1.15",
    "text-wrap": "balance",
    "max-inline-size": "24ch",
    "font-size": "clamp(1.25rem, 2vw, 1.5rem)"
  },
  "flow": {
    "display": "grid",
    "min-inline-size": "0",
    "margin": "0",
    "padding": "0",
    "list-style": "none"
  },
  "flow__step": {
    "display": "grid",
    "min-inline-size": "0",
    "margin": "0",
    "padding-block": "1rem",
    "border-block-start": "var(--hraness-marketing-rule)",
    "gap": "0.85rem",
    "grid-template-columns": "2.25rem minmax(0, 1fr)"
  },
  "flow__stepFirst": {
    "display": "grid",
    "min-inline-size": "0",
    "margin": "0",
    "padding-block": "1rem",
    "border-block-start": "0",
    "gap": "0.85rem",
    "grid-template-columns": "2.25rem minmax(0, 1fr)"
  },
  "flow__number": {
    "padding-block-start": "0.2rem",
    "color": "var(--hraness-marketing-accent)",
    "font-family": "var(--hraness-marketing-mono-font)",
    "font-size": "0.75rem",
    "font-weight": "500"
  },
  "flow__body": {
    "display": "grid",
    "min-inline-size": "0",
    "gap": "0.4rem"
  },
  "flow__label": {
    "display": "block",
    "font-size": "0.95rem",
    "font-weight": "600"
  },
  "flow__code": {
    "display": "block",
    "inline-size": "fit-content",
    "max-inline-size": "100%",
    "padding": "0.35rem 0.6rem",
    "border-radius": "0.4rem",
    "background-color": "color-mix(in oklch, var(--hraness-marketing-ink) 7%, transparent)",
    "background-image": "none",
    "background-position": "0% 0%",
    "background-size": "auto auto",
    "background-repeat": "repeat",
    "background-origin": "padding-box",
    "background-clip": "border-box",
    "background-attachment": "scroll",
    "color": "inherit",
    "font-family": "var(--hraness-marketing-mono-font)",
    "font-size": "0.8rem",
    "overflow-wrap": "anywhere"
  },
  "flow__detail": {
    "display": "block",
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.9rem",
    "line-height": "1.5"
  },
  "facts": {
    "display": "grid",
    "margin": "0",
    "border-block": "var(--hraness-marketing-rule)",
    "grid-template-columns": {
      "default": "repeat(var(--hraness-marketing-fact-columns, 4), minmax(0, 1fr))",
      "@media (max-width: 48rem)": "repeat(2, minmax(0, 1fr))"
    }
  },
  "facts__item": {
    "min-inline-size": "0",
    "padding": "1.25rem clamp(0.8rem, 2vw, 1.5rem)",
    "border-inline-start": {
      "default": null,
      "@media (max-width: 48rem)": "0"
    }
  },
  "facts__itemLater": {
    "min-inline-size": "0",
    "padding": "1.25rem clamp(0.8rem, 2vw, 1.5rem)",
    "border-inline-start": "var(--hraness-marketing-rule)"
  },
  "facts__itemOdd": {
    "min-inline-size": "0",
    "padding": "1.25rem clamp(0.8rem, 2vw, 1.5rem)",
    "border-inline-start": {
      "default": "var(--hraness-marketing-rule)",
      "@media (max-width: 48rem)": "0"
    }
  },
  "facts__itemRow": {
    "min-inline-size": "0",
    "padding": "1.25rem clamp(0.8rem, 2vw, 1.5rem)",
    "border-inline-start": "var(--hraness-marketing-rule)",
    "border-block-start": {
      "@media (max-width: 48rem)": "var(--hraness-marketing-rule)"
    }
  },
  "facts__itemRowOdd": {
    "min-inline-size": "0",
    "padding": "1.25rem clamp(0.8rem, 2vw, 1.5rem)",
    "border-inline-start": {
      "default": "var(--hraness-marketing-rule)",
      "@media (max-width: 48rem)": "0"
    },
    "border-block-start": {
      "@media (max-width: 48rem)": "var(--hraness-marketing-rule)"
    }
  },
  "facts__label": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none",
    "margin-block-end": "0.4rem"
  },
  "facts__body": {
    "margin": "0"
  },
  "facts__value": {
    "display": "block",
    "font-size": "1.05rem",
    "font-weight": "600"
  },
  "facts__detail": {
    "display": "block",
    "margin-block-start": "0.3rem",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.85rem",
    "line-height": "1.45"
  },
  "stats": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "display": "grid",
    "gap": "0.75rem",
    "padding-block": "clamp(1.5rem, 4vw, 3rem)"
  },
  "stats__list": {
    "display": "grid",
    "margin": "0",
    "border-block": "var(--hraness-marketing-rule)",
    "grid-template-columns": {
      "default": "repeat(var(--hraness-marketing-fact-columns, 4), minmax(0, 1fr))",
      "@media (max-width: 48rem)": "repeat(2, minmax(0, 1fr))"
    }
  },
  "stats__source": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.85rem"
  },
  "stats__value": {
    "display": "block",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-size": "clamp(1.75rem, 3vw, 2.25rem)",
    "font-weight": "500",
    "letter-spacing": "-0.02em",
    "line-height": "1.1",
    "font-variant-numeric": "tabular-nums"
  },
  "pillars": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "display": "grid",
    "margin-block": "0",
    "padding-block": "0",
    "border-block": "var(--hraness-marketing-rule)",
    "grid-template-columns": {
      "default": "repeat(var(--hraness-marketing-pillar-columns, 3), minmax(0, 1fr))",
      "@media (max-width: 48rem)": "minmax(0, 1fr)"
    }
  },
  "pillars__item": {
    "display": "grid",
    "min-inline-size": "0",
    "align-content": "start",
    "gap": "0.45rem",
    "padding": "clamp(1.25rem, 3vw, 2rem) clamp(1rem, 2.5vw, 1.75rem)"
  },
  "pillars__itemLater": {
    "display": "grid",
    "min-inline-size": "0",
    "align-content": "start",
    "gap": "0.45rem",
    "padding": "clamp(1.25rem, 3vw, 2rem) clamp(1rem, 2.5vw, 1.75rem)",
    "border-inline-start": {
      "default": "var(--hraness-marketing-rule)",
      "@media (max-width: 48rem)": "0"
    },
    "border-block-start": {
      "@media (max-width: 48rem)": "var(--hraness-marketing-rule)"
    }
  },
  "pillars__label": {
    "font-size": "1.05rem",
    "font-weight": "600",
    "letter-spacing": "-0.01em"
  },
  "pillars__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.95rem",
    "line-height": "1.5"
  },
  "proof_frame": {
    "color": {
      "default": "var(--hraness-marketing-ink)",
      "@media (forced-colors: active)": "CanvasText"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "min-inline-size": "0",
    "margin": "0",
    "overflow": "clip",
    "border-top": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-frame-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-surface)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "box-shadow": {
      "default": "var(--hraness-marketing-shadow)",
      "@media (forced-colors: active)": "none"
    }
  },
  "proof_frame__chrome": {
    "display": "flex",
    "align-items": "center",
    "gap": "0.75rem",
    "padding": "0.6rem 0.9rem",
    "border-block-end": "var(--hraness-marketing-rule)",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.78rem"
  },
  "proof_frame__lights": {
    "display": "inline-flex",
    "gap": "0.35rem"
  },
  "proof_frame__light": {
    "inline-size": "0.6rem",
    "block-size": "0.6rem",
    "border-radius": "999px",
    "background-color": "color-mix(in oklch, var(--hraness-marketing-ink) 18%, transparent)",
    "background-image": "none",
    "background-position": "0% 0%",
    "background-size": "auto auto",
    "background-repeat": "repeat",
    "background-origin": "padding-box",
    "background-clip": "border-box",
    "background-attachment": "scroll"
  },
  "proof_frame__title": {
    "flex": "1 1 auto",
    "overflow": "hidden",
    "text-align": "center",
    "text-overflow": "ellipsis",
    "white-space": "nowrap"
  },
  "proof_frame__content": {
    "min-inline-size": "0",
    "overflow": "auto"
  },
  "proof_frame__caption": {
    "display": "flex",
    "flex-wrap": "wrap",
    "justify-content": "space-between",
    "gap": "0.25rem 1rem",
    "padding": "0.75rem 0.95rem",
    "border-block-start": "var(--hraness-marketing-rule)",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.82rem",
    "line-height": "1.45"
  },
  "proof_frame__credit": {
    "font-size": "0.78rem"
  },
  "install": {
    "color": {
      "default": "var(--hraness-marketing-ink)",
      "@media (forced-colors: active)": "CanvasText"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "var(--hraness-marketing-install-inline-size, min(100%, var(--hraness-marketing-measure)))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "display": "grid",
    "padding": "clamp(1.5rem, 4vw, 2.5rem)",
    "border-top": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-frame-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-surface)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "gap": "clamp(1.25rem, 4vw, 3rem)",
    "grid-template-columns": {
      "default": "minmax(12rem, 0.6fr) minmax(0, 1.4fr)",
      "@media (max-width: 48rem)": "minmax(0, 1fr)"
    },
    "scroll-margin-block-start": "5rem",
    "box-shadow": {
      "@media (forced-colors: active)": "none"
    }
  },
  "install__heading_group": {
    "display": "grid",
    "align-content": "start",
    "gap": "0.5rem"
  },
  "install__eyebrow": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none"
  },
  "install__heading": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-weight": "var(--hraness-marketing-heading-weight)",
    "letter-spacing": "-0.012em",
    "line-height": "1.15",
    "text-wrap": "balance",
    "max-inline-size": {
      "default": "14ch",
      "@media (max-width: 48rem)": "none"
    },
    "font-size": "clamp(1.5rem, 2.6vw, 2rem)"
  },
  "install__commands": {
    "min-inline-size": "0",
    "display": "grid",
    "gap": "0.75rem"
  },
  "section": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "padding-block": "var(--hraness-marketing-section-space)",
    "border-block-start": "var(--hraness-marketing-rule)",
    "scroll-margin-block-start": "4rem",
    "display": "grid",
    "gap": "clamp(1.5rem, 4vw, 3rem)"
  },
  "sectionSplit": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "padding-block": "var(--hraness-marketing-section-space)",
    "border-block-start": "var(--hraness-marketing-rule)",
    "scroll-margin-block-start": "4rem",
    "display": "grid",
    "gap": "clamp(1.5rem, 4vw, 3rem)",
    "align-items": "center",
    "grid-template-columns": {
      "default": "minmax(0, 0.9fr) minmax(0, 1.1fr)",
      "@media (max-width: 48rem)": "minmax(0, 1fr)"
    }
  },
  "section__heading_group": {
    "display": "grid",
    "max-inline-size": "var(--hraness-marketing-copy-measure)",
    "gap": "0.75rem"
  },
  "section__heading_groupSplit": {
    "display": "grid",
    "max-inline-size": "none",
    "gap": "0.75rem"
  },
  "section__heading_groupReverse": {
    "display": "grid",
    "max-inline-size": "none",
    "gap": "0.75rem",
    "order": {
      "default": "2",
      "@media (max-width: 48rem)": "0"
    }
  },
  "section__label": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none"
  },
  "section__heading": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-weight": "var(--hraness-marketing-heading-weight)",
    "letter-spacing": "-0.012em",
    "line-height": "1.15",
    "text-wrap": "balance",
    "font-size": "clamp(1.75rem, 3vw, 2.5rem)"
  },
  "section__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "1.125rem",
    "line-height": "1.5"
  },
  "section__body": {
    "min-inline-size": "0",
    "display": "grid",
    "gap": "1rem"
  },
  "primitives": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "padding-block": "var(--hraness-marketing-section-space)",
    "border-block-start": "var(--hraness-marketing-rule)",
    "scroll-margin-block-start": "4rem",
    "display": "grid",
    "gap": "clamp(1.5rem, 4vw, 3rem)"
  },
  "primitives__header": {
    "display": "grid",
    "max-inline-size": "var(--hraness-marketing-copy-measure)",
    "gap": "0.75rem"
  },
  "primitives__label": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none"
  },
  "primitives__heading": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-weight": "var(--hraness-marketing-heading-weight)",
    "letter-spacing": "-0.012em",
    "line-height": "1.15",
    "text-wrap": "balance",
    "font-size": "clamp(1.75rem, 3vw, 2.5rem)"
  },
  "primitives__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "1.125rem",
    "line-height": "1.5"
  },
  "interfaces": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "padding-block": "var(--hraness-marketing-section-space)",
    "border-block-start": "var(--hraness-marketing-rule)",
    "scroll-margin-block-start": "4rem",
    "display": "grid",
    "gap": "clamp(1.5rem, 4vw, 3rem)"
  },
  "interfaces__header": {
    "display": "grid",
    "max-inline-size": "var(--hraness-marketing-copy-measure)",
    "gap": "0.75rem"
  },
  "interfaces__label": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none"
  },
  "interfaces__heading": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-weight": "var(--hraness-marketing-heading-weight)",
    "letter-spacing": "-0.012em",
    "line-height": "1.15",
    "text-wrap": "balance",
    "font-size": "clamp(1.75rem, 3vw, 2.5rem)"
  },
  "interfaces__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "1.125rem",
    "line-height": "1.5"
  },
  "trust": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "padding-block": "var(--hraness-marketing-section-space)",
    "border-block-start": "var(--hraness-marketing-rule)",
    "scroll-margin-block-start": "4rem",
    "display": "grid",
    "gap": "clamp(1.5rem, 4vw, 3rem)"
  },
  "trust__header": {
    "display": "grid",
    "max-inline-size": "var(--hraness-marketing-copy-measure)",
    "gap": "0.75rem"
  },
  "trust__label": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none"
  },
  "trust__heading": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-weight": "var(--hraness-marketing-heading-weight)",
    "letter-spacing": "-0.012em",
    "line-height": "1.15",
    "text-wrap": "balance",
    "font-size": "clamp(1.75rem, 3vw, 2.5rem)"
  },
  "trust__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "1.125rem",
    "line-height": "1.5"
  },
  "quotes": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "padding-block": "var(--hraness-marketing-section-space)",
    "border-block-start": "var(--hraness-marketing-rule)",
    "scroll-margin-block-start": "4rem",
    "display": "grid",
    "gap": "clamp(1.5rem, 4vw, 3rem)"
  },
  "quotes__header": {
    "display": "grid",
    "max-inline-size": "var(--hraness-marketing-copy-measure)",
    "gap": "0.75rem"
  },
  "quotes__label": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none"
  },
  "quotes__heading": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-weight": "var(--hraness-marketing-heading-weight)",
    "letter-spacing": "-0.012em",
    "line-height": "1.15",
    "text-wrap": "balance",
    "font-size": "clamp(1.75rem, 3vw, 2.5rem)"
  },
  "quotes__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "1.125rem",
    "line-height": "1.5"
  },
  "pricing": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "padding-block": "var(--hraness-marketing-section-space)",
    "border-block-start": "var(--hraness-marketing-rule)",
    "scroll-margin-block-start": "4rem",
    "display": "grid",
    "gap": "clamp(1.5rem, 4vw, 3rem)"
  },
  "pricing__header": {
    "display": "grid",
    "max-inline-size": "var(--hraness-marketing-copy-measure)",
    "gap": "0.75rem"
  },
  "pricing__label": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none"
  },
  "pricing__heading": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-weight": "var(--hraness-marketing-heading-weight)",
    "letter-spacing": "-0.012em",
    "line-height": "1.15",
    "text-wrap": "balance",
    "font-size": "clamp(1.75rem, 3vw, 2.5rem)"
  },
  "pricing__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "1.125rem",
    "line-height": "1.5"
  },
  "questions": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "padding-block": "var(--hraness-marketing-section-space)",
    "border-block-start": "var(--hraness-marketing-rule)",
    "scroll-margin-block-start": "4rem",
    "display": "grid",
    "gap": "clamp(1.5rem, 4vw, 3rem)"
  },
  "questions__header": {
    "display": "grid",
    "max-inline-size": "var(--hraness-marketing-copy-measure)",
    "gap": "0.75rem"
  },
  "questions__label": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none"
  },
  "questions__heading": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-weight": "var(--hraness-marketing-heading-weight)",
    "letter-spacing": "-0.012em",
    "line-height": "1.15",
    "text-wrap": "balance",
    "font-size": "clamp(1.75rem, 3vw, 2.5rem)"
  },
  "questions__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "1.125rem",
    "line-height": "1.5"
  },
  "maker": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "padding-block": "var(--hraness-marketing-section-space)",
    "border-block-start": "var(--hraness-marketing-rule)",
    "scroll-margin-block-start": "4rem",
    "display": "grid",
    "align-items": "start",
    "gap": "clamp(1.5rem, 4vw, 3rem)",
    "grid-template-columns": {
      "default": "minmax(0, 0.8fr) minmax(0, 1.2fr)",
      "@media (max-width: 48rem)": "minmax(0, 1fr)"
    }
  },
  "maker__header": {
    "display": "grid",
    "max-inline-size": "var(--hraness-marketing-copy-measure)",
    "gap": "0.75rem"
  },
  "maker__label": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none"
  },
  "maker__heading": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-weight": "var(--hraness-marketing-heading-weight)",
    "letter-spacing": "-0.012em",
    "line-height": "1.15",
    "text-wrap": "balance",
    "font-size": "clamp(1.75rem, 3vw, 2.5rem)"
  },
  "primitives__list": {
    "display": "grid",
    "margin": "0",
    "padding": "0",
    "list-style": "none",
    "gap": "1rem",
    "grid-template-columns": "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))"
  },
  "primitive": {
    "display": "grid",
    "min-inline-size": "0",
    "align-content": "start",
    "gap": "0.6rem",
    "padding": "clamp(1.25rem, 2.5vw, 1.75rem)",
    "border-top": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-frame-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-surface)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "box-shadow": {
      "@media (forced-colors: active)": "none"
    },
    "color": {
      "@media (forced-colors: active)": "CanvasText"
    }
  },
  "primitive__number": {
    "color": "var(--hraness-marketing-accent)",
    "font-family": "var(--hraness-marketing-mono-font)",
    "font-size": "0.78rem",
    "font-weight": "500"
  },
  "primitive__heading": {
    "margin": "0",
    "font-size": "1.1rem",
    "font-weight": "600",
    "letter-spacing": "-0.01em"
  },
  "primitive__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.95rem",
    "line-height": "1.5"
  },
  "interface_grid": {
    "display": "grid",
    "margin": "0",
    "gap": "1rem",
    "grid-template-columns": "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))"
  },
  "trust_grid": {
    "display": "grid",
    "margin": "0",
    "gap": "1rem",
    "grid-template-columns": "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))"
  },
  "interface": {
    "display": "grid",
    "min-inline-size": "0",
    "align-content": "start",
    "gap": "0.5rem",
    "padding": "clamp(1.25rem, 2.5vw, 1.75rem)",
    "border-top": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-frame-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-surface)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "box-shadow": {
      "@media (forced-colors: active)": "none"
    },
    "color": {
      "@media (forced-colors: active)": "CanvasText"
    }
  },
  "trust_item": {
    "display": "grid",
    "min-inline-size": "0",
    "align-content": "start",
    "gap": "0.5rem",
    "padding": "clamp(1.25rem, 2.5vw, 1.75rem)",
    "border-top": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-frame-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-surface)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "box-shadow": {
      "@media (forced-colors: active)": "none"
    },
    "color": {
      "@media (forced-colors: active)": "CanvasText"
    }
  },
  "interface__heading": {
    "margin": "0",
    "font-size": "1.05rem",
    "font-weight": "600",
    "letter-spacing": "-0.01em"
  },
  "interface__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.95rem",
    "line-height": "1.5"
  },
  "trust_item__label": {
    "margin": "0",
    "font-size": "1.05rem",
    "font-weight": "600",
    "letter-spacing": "-0.01em"
  },
  "trust_item__detail": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.95rem",
    "line-height": "1.5"
  },
  "quote_grid": {
    "display": "grid",
    "margin": "0",
    "padding": "0",
    "list-style": "none",
    "gap": "1rem",
    "grid-template-columns": "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))"
  },
  "quote": {
    "display": "grid",
    "min-inline-size": "0",
    "align-content": "space-between",
    "gap": "1.25rem",
    "margin": "0",
    "padding": "clamp(1.25rem, 2.5vw, 1.75rem)",
    "border-top": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-frame-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-surface)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "box-shadow": {
      "@media (forced-colors: active)": "none"
    },
    "color": {
      "@media (forced-colors: active)": "CanvasText"
    }
  },
  "quote__body": {
    "margin": "0",
    "font-size": "1rem",
    "line-height": "1.55"
  },
  "quote__text": {
    "margin": "0"
  },
  "quote__attribution": {
    "display": "flex",
    "flex-wrap": "wrap",
    "align-items": "baseline",
    "gap": "0.25rem 0.5rem",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.88rem"
  },
  "quote__name": {
    "color": "var(--hraness-marketing-ink)",
    "font-weight": "600"
  },
  "quote__link": {
    "color": "inherit",
    "text-decoration": {
      "default": "none",
      ":hover": "underline"
    }
  },
  "plan_grid": {
    "display": "grid",
    "margin": "0",
    "padding": "0",
    "list-style": "none",
    "gap": "1rem",
    "grid-template-columns": "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))"
  },
  "plan": {
    "display": "grid",
    "min-inline-size": "0",
    "align-content": "start",
    "gap": "1rem",
    "padding": "clamp(1.5rem, 3vw, 2rem)",
    "border-top": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-frame-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-surface)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "box-shadow": {
      "@media (forced-colors: active)": "none"
    },
    "color": {
      "@media (forced-colors: active)": "CanvasText"
    }
  },
  "planPrimary": {
    "display": "grid",
    "min-inline-size": "0",
    "align-content": "start",
    "gap": "1rem",
    "padding": "clamp(1.5rem, 3vw, 2rem)",
    "border-top": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "var(--hraness-marketing-rule)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-frame-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-surface)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "box-shadow": "0 0 0 1px color-mix(in oklch, var(--hraness-marketing-accent) 35%, transparent)",
    "color": {
      "@media (forced-colors: active)": "CanvasText"
    },
    "border-top-color": "color-mix(in oklch, var(--hraness-marketing-accent) 55%, transparent)",
    "border-right-color": "color-mix(in oklch, var(--hraness-marketing-accent) 55%, transparent)",
    "border-bottom-color": "color-mix(in oklch, var(--hraness-marketing-accent) 55%, transparent)",
    "border-left-color": "color-mix(in oklch, var(--hraness-marketing-accent) 55%, transparent)"
  },
  "plan__name": {
    "margin": "0",
    "font-size": "1.1rem",
    "font-weight": "600"
  },
  "plan__price": {
    "display": "flex",
    "align-items": "baseline",
    "gap": "0.35rem",
    "margin": "0"
  },
  "plan__value": {
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-size": "2.25rem",
    "font-weight": "500",
    "letter-spacing": "-0.02em",
    "line-height": "1"
  },
  "plan__period": {
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.95rem"
  },
  "plan__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.95rem"
  },
  "plan__features": {
    "display": "grid",
    "margin": "0",
    "padding": "0",
    "list-style": "none",
    "gap": "0.5rem",
    "font-size": "0.95rem"
  },
  "plan__feature": {
    "display": "grid",
    "gap": "0.6rem",
    "grid-template-columns": "1rem minmax(0, 1fr)",
    "::before": {
      "content": "\"\"",
      "inline-size": "1rem",
      "block-size": "1rem",
      "margin-block-start": "0.2rem",
      "border-radius": "999px",
      "background-color": "var(--hraness-marketing-accent-soft)",
      "background-image": "linear-gradient(var(--hraness-marketing-accent), var(--hraness-marketing-accent)), none",
      "background-position": "center, 0% 0%",
      "background-size": "0.4rem 0.4rem, auto auto",
      "background-repeat": "no-repeat, repeat",
      "background-origin": "padding-box",
      "background-clip": "border-box",
      "background-attachment": "scroll"
    }
  },
  "plan__note": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.85rem"
  },
  "question_list": {
    "display": "grid"
  },
  "question": {
    "border-block-start": "var(--hraness-marketing-rule)"
  },
  "questionLast": {
    "border-block-start": "var(--hraness-marketing-rule)",
    "border-block-end": "var(--hraness-marketing-rule)"
  },
  "question__summary": {
    outline: { default: null, ":focus-visible": "2px solid var(--hraness-marketing-accent)" },
    "outline-offset": { default: null, ":focus-visible": "2px" },
    "border-radius": { default: null, ":focus-visible": "0.25rem" },
    "display": "flex",
    "min-block-size": {
      "default": "3.25rem",
      "@media (pointer: coarse)": "3rem"
    },
    "align-items": "center",
    "justify-content": "space-between",
    "gap": "1rem",
    "padding-block": "1rem",
    "color": "var(--hraness-marketing-ink)",
    "cursor": "pointer",
    "font-size": "1.05rem",
    "font-weight": "500",
    "list-style": "none",
    "::-webkit-details-marker": {
      "display": "none"
    },
    "::after": {
      "content": "\"+\"",
      "flex": "0 0 auto",
      "color": "var(--hraness-marketing-muted)",
      "font-size": "1.25rem",
      "font-weight": "400",
      "line-height": "1",
      "transform": {
        "default": null,
        [stylex.when.ancestor("[open]", questionMarker)]: "rotate(45deg)"
      }
    }
  },
  "question__answer": {
    "max-inline-size": "var(--hraness-marketing-prose-measure)",
    "padding-block": "0 1.5rem",
    "color": "var(--hraness-marketing-muted)",
    "line-height": "1.6"
  },
  "maker__portrait": {
    "inline-size": "4.5rem",
    "block-size": "4.5rem",
    "overflow": "hidden",
    "border-radius": "999px",
    "background-color": "var(--hraness-marketing-accent-soft)",
    "background-image": "none",
    "background-position": "0% 0%",
    "background-size": "auto auto",
    "background-repeat": "repeat",
    "background-origin": "padding-box",
    "background-clip": "border-box",
    "background-attachment": "scroll"
  },
  "maker__body": {
    "display": "grid",
    "min-inline-size": "0",
    "gap": "1rem"
  },
  "maker__links": {
    "display": "flex",
    "flex-wrap": "wrap",
    "gap": "0.5rem 1.25rem",
    "margin": "0",
    "padding": "0",
    "list-style": "none",
    "font-size": "0.95rem",
    "font-weight": "500"
  },
  "cta": {
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "display": "grid",
    "justify-items": "center",
    "gap": "1.25rem",
    "padding-block": "var(--hraness-marketing-section-space)",
    "border-block-start": "var(--hraness-marketing-rule)",
    "text-align": "center"
  },
  "ctaAccent": {
    "color": {
      "default": "var(--hraness-marketing-accent-ink)",
      "@media (forced-colors: active)": "CanvasText"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "inline-size": "min(100%, var(--hraness-marketing-measure))",
    "min-inline-size": "0",
    "margin-inline": "auto",
    "display": "grid",
    "justify-items": "center",
    "gap": "1.25rem",
    "padding-block": "var(--hraness-marketing-section-space)",
    "border-block-start": "0",
    "text-align": "center",
    "background-color": {
      "default": "var(--hraness-marketing-accent)",
      "@media (forced-colors: active)": "Canvas"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll"
    },
    "box-shadow": {
      "default": "0 0 0 100vmax var(--hraness-marketing-accent)",
      "@media (forced-colors: active)": "none"
    },
    "clip-path": "inset(0 -100vmax)",
    "border-top": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "@media (forced-colors: active)": "stretch"
    }
  },
  "cta__eyebrow": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.875rem",
    "font-weight": "500",
    "letter-spacing": "0",
    "line-height": "1.4",
    "text-transform": "none"
  },
  "cta__heading": {
    "margin": "0",
    "color": "var(--hraness-marketing-ink)",
    "font-family": "var(--hraness-marketing-heading-font)",
    "font-weight": "var(--hraness-marketing-heading-weight)",
    "letter-spacing": "var(--hraness-marketing-heading-tracking)",
    "line-height": "1.08",
    "text-wrap": "balance",
    "max-inline-size": "20ch",
    "font-size": "clamp(2rem, 4vw, 3.25rem)"
  },
  "cta__summary": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "1.125rem",
    "line-height": "1.5",
    "max-inline-size": "var(--hraness-marketing-copy-measure)"
  },
  "cta__actions": {
    "display": "flex",
    "flex-wrap": "wrap",
    "align-items": "center",
    "gap": "0.65rem",
    "justify-content": "center",
    "margin-block-start": "0.5rem"
  },
  "cta__footnote": {
    "margin": "0",
    "color": "var(--hraness-marketing-muted)",
    "font-size": "0.9rem"
  },
  "action": {
    "display": "inline-flex",
    "min-block-size": {
      "default": "var(--hraness-marketing-action-height)",
      "@media (pointer: coarse)": "3rem"
    },
    "align-items": "center",
    "justify-content": "center",
    "gap": "0.45rem",
    "padding": "0.6rem 1.1rem",
    "border-top": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-surface)",
      "@media (forced-colors: active)": "Canvas",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-ink) 6%, var(--hraness-marketing-surface))"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none",
      ":hover": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%",
      ":hover": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto",
      ":hover": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat",
      ":hover": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box",
      ":hover": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box",
      ":hover": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll",
      ":hover": "scroll"
    },
    "color": {
      "default": "var(--hraness-marketing-ink)",
      "@media (forced-colors: active)": "CanvasText"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.95rem",
    "font-weight": "500",
    "line-height": "1.2",
    "text-decoration": {
      "default": "none",
      ":hover": "none"
    }
  },
  "actionPrimary": {
    "display": "inline-flex",
    "min-block-size": {
      "default": "var(--hraness-marketing-action-height)",
      "@media (pointer: coarse)": "3rem"
    },
    "align-items": "center",
    "justify-content": "center",
    "gap": "0.45rem",
    "padding": "0.6rem 1.1rem",
    "border-top": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-accent)",
      "@media (forced-colors: active)": "CanvasText",
      ":hover": {
        "default": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)",
        "@media (forced-colors: active)": "Canvas"
      }
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none",
      ":hover": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%",
      ":hover": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto",
      ":hover": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat",
      ":hover": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box",
      ":hover": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box",
      ":hover": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll",
      ":hover": "scroll"
    },
    "color": {
      "default": "var(--hraness-marketing-accent-ink)",
      "@media (forced-colors: active)": "Canvas"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.95rem",
    "font-weight": "500",
    "line-height": "1.2",
    "text-decoration": {
      "default": "none",
      ":hover": "none"
    },
    "border-top-color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)"
    },
    "border-right-color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)"
    },
    "border-bottom-color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)"
    },
    "border-left-color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)"
    }
  },
  "headerAction": {
    "display": "inline-flex",
    "min-block-size": "2.25rem",
    "align-items": "center",
    "justify-content": "center",
    "gap": "0.45rem",
    "padding": "0.6rem 1.1rem",
    "border-top": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-surface)",
      "@media (forced-colors: active)": "Canvas",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-ink) 6%, var(--hraness-marketing-surface))"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none",
      ":hover": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%",
      ":hover": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto",
      ":hover": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat",
      ":hover": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box",
      ":hover": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box",
      ":hover": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll",
      ":hover": "scroll"
    },
    "color": {
      "default": "var(--hraness-marketing-ink)",
      "@media (forced-colors: active)": "CanvasText"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.9rem",
    "font-weight": "500",
    "line-height": "1.2",
    "text-decoration": {
      "default": "none",
      ":hover": "none"
    },
    "padding-block": "0.4rem",
    "padding-inline": "0.9rem"
  },
  "headerActionPrimary": {
    "display": "inline-flex",
    "min-block-size": "2.25rem",
    "align-items": "center",
    "justify-content": "center",
    "gap": "0.45rem",
    "padding": "0.6rem 1.1rem",
    "border-top": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-accent)",
      "@media (forced-colors: active)": "CanvasText",
      ":hover": {
        "default": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)",
        "@media (forced-colors: active)": "Canvas"
      }
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none",
      ":hover": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%",
      ":hover": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto",
      ":hover": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat",
      ":hover": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box",
      ":hover": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box",
      ":hover": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll",
      ":hover": "scroll"
    },
    "color": {
      "default": "var(--hraness-marketing-accent-ink)",
      "@media (forced-colors: active)": "Canvas"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.9rem",
    "font-weight": "500",
    "line-height": "1.2",
    "text-decoration": {
      "default": "none",
      ":hover": "none"
    },
    "padding-block": "0.4rem",
    "padding-inline": "0.9rem",
    "border-top-color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)"
    },
    "border-right-color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)"
    },
    "border-bottom-color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)"
    },
    "border-left-color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)"
    }
  },
  "planAction": {
    "display": "inline-flex",
    "min-block-size": {
      "default": "var(--hraness-marketing-action-height)",
      "@media (pointer: coarse)": "3rem"
    },
    "align-items": "center",
    "justify-content": "center",
    "gap": "0.45rem",
    "padding": "0.6rem 1.1rem",
    "border-top": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-surface)",
      "@media (forced-colors: active)": "Canvas",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-ink) 6%, var(--hraness-marketing-surface))"
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none",
      ":hover": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%",
      ":hover": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto",
      ":hover": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat",
      ":hover": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box",
      ":hover": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box",
      ":hover": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll",
      ":hover": "scroll"
    },
    "color": {
      "default": "var(--hraness-marketing-ink)",
      "@media (forced-colors: active)": "CanvasText"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.95rem",
    "font-weight": "500",
    "line-height": "1.2",
    "text-decoration": {
      "default": "none",
      ":hover": "none"
    },
    "justify-self": "start"
  },
  "planActionPrimary": {
    "display": "inline-flex",
    "min-block-size": {
      "default": "var(--hraness-marketing-action-height)",
      "@media (pointer: coarse)": "3rem"
    },
    "align-items": "center",
    "justify-content": "center",
    "gap": "0.45rem",
    "padding": "0.6rem 1.1rem",
    "border-top": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-accent)",
      "@media (forced-colors: active)": "CanvasText",
      ":hover": {
        "default": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)",
        "@media (forced-colors: active)": "Canvas"
      }
    },
    "background-image": {
      "default": "none",
      "@media (forced-colors: active)": "none",
      ":hover": "none"
    },
    "background-position": {
      "default": "0% 0%",
      "@media (forced-colors: active)": "0% 0%",
      ":hover": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      "@media (forced-colors: active)": "auto auto",
      ":hover": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      "@media (forced-colors: active)": "repeat",
      ":hover": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      "@media (forced-colors: active)": "padding-box",
      ":hover": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      "@media (forced-colors: active)": "border-box",
      ":hover": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      "@media (forced-colors: active)": "scroll",
      ":hover": "scroll"
    },
    "color": {
      "default": "var(--hraness-marketing-accent-ink)",
      "@media (forced-colors: active)": "Canvas"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.95rem",
    "font-weight": "500",
    "line-height": "1.2",
    "text-decoration": {
      "default": "none",
      ":hover": "none"
    },
    "justify-self": "start",
    "border-top-color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)"
    },
    "border-right-color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)"
    },
    "border-bottom-color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)"
    },
    "border-left-color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent) 84%, black)"
    }
  },
  "heroActionPrimary": {
    "display": "inline-flex",
    "min-block-size": {
      "default": "var(--hraness-marketing-action-height)",
      "@media (pointer: coarse)": "3rem"
    },
    "align-items": "center",
    "justify-content": "center",
    "gap": "0.45rem",
    "padding": "0.6rem 1.1rem",
    "border-top": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-accent-ink)",
      ":hover": "color-mix(in oklch, var(--hraness-marketing-accent-ink) 90%, var(--hraness-marketing-accent))"
    },
    "background-image": {
      "default": "none",
      ":hover": "none"
    },
    "background-position": {
      "default": "0% 0%",
      ":hover": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      ":hover": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      ":hover": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      ":hover": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      ":hover": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      ":hover": "scroll"
    },
    "color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "var(--hraness-marketing-accent)"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.95rem",
    "font-weight": "500",
    "line-height": "1.2",
    "text-decoration": {
      "default": "none",
      ":hover": "none"
    },
    "border-top-color": {
      "default": "var(--hraness-marketing-accent-ink)",
      ":hover": "var(--hraness-marketing-accent-ink)"
    },
    "border-right-color": {
      "default": "var(--hraness-marketing-accent-ink)",
      ":hover": "var(--hraness-marketing-accent-ink)"
    },
    "border-bottom-color": {
      "default": "var(--hraness-marketing-accent-ink)",
      ":hover": "var(--hraness-marketing-accent-ink)"
    },
    "border-left-color": {
      "default": "var(--hraness-marketing-accent-ink)",
      ":hover": "var(--hraness-marketing-accent-ink)"
    }
  },
  "heroActionSecondary": {
    "display": "inline-flex",
    "min-block-size": {
      "default": "var(--hraness-marketing-action-height)",
      "@media (pointer: coarse)": "3rem"
    },
    "align-items": "center",
    "justify-content": "center",
    "gap": "0.45rem",
    "padding": "0.6rem 1.1rem",
    "border-top": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-radius)",
    "background-color": {
      "default": "transparent",
      ":hover": "transparent"
    },
    "background-image": {
      "default": "none",
      ":hover": "none"
    },
    "background-position": {
      "default": "0% 0%",
      ":hover": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      ":hover": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      ":hover": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      ":hover": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      ":hover": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      ":hover": "scroll"
    },
    "color": {
      "default": "var(--hraness-marketing-accent-ink)",
      ":hover": "var(--hraness-marketing-accent-ink)"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.95rem",
    "font-weight": "500",
    "line-height": "1.2",
    "text-decoration": {
      "default": "none",
      ":hover": "none"
    },
    "border-top-color": {
      "default": "var(--hraness-marketing-line-strong)",
      ":hover": "var(--hraness-marketing-line-strong)"
    },
    "border-right-color": {
      "default": "var(--hraness-marketing-line-strong)",
      ":hover": "var(--hraness-marketing-line-strong)"
    },
    "border-bottom-color": {
      "default": "var(--hraness-marketing-line-strong)",
      ":hover": "var(--hraness-marketing-line-strong)"
    },
    "border-left-color": {
      "default": "var(--hraness-marketing-line-strong)",
      ":hover": "var(--hraness-marketing-line-strong)"
    }
  },
  "ctaActionPrimary": {
    "display": "inline-flex",
    "min-block-size": {
      "default": "var(--hraness-marketing-action-height)",
      "@media (pointer: coarse)": "3rem"
    },
    "align-items": "center",
    "justify-content": "center",
    "gap": "0.45rem",
    "padding": "0.6rem 1.1rem",
    "border-top": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-radius)",
    "background-color": {
      "default": "var(--hraness-marketing-accent-ink)",
      ":hover": "var(--hraness-marketing-accent-ink)"
    },
    "background-image": {
      "default": "none",
      ":hover": "none"
    },
    "background-position": {
      "default": "0% 0%",
      ":hover": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      ":hover": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      ":hover": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      ":hover": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      ":hover": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      ":hover": "scroll"
    },
    "color": {
      "default": "var(--hraness-marketing-accent)",
      ":hover": "var(--hraness-marketing-accent)"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.95rem",
    "font-weight": "500",
    "line-height": "1.2",
    "text-decoration": {
      "default": "none",
      ":hover": "none"
    },
    "border-top-color": {
      "default": "var(--hraness-marketing-accent-ink)",
      ":hover": "var(--hraness-marketing-accent-ink)"
    },
    "border-right-color": {
      "default": "var(--hraness-marketing-accent-ink)",
      ":hover": "var(--hraness-marketing-accent-ink)"
    },
    "border-bottom-color": {
      "default": "var(--hraness-marketing-accent-ink)",
      ":hover": "var(--hraness-marketing-accent-ink)"
    },
    "border-left-color": {
      "default": "var(--hraness-marketing-accent-ink)",
      ":hover": "var(--hraness-marketing-accent-ink)"
    }
  },
  "ctaActionSecondary": {
    "display": "inline-flex",
    "min-block-size": {
      "default": "var(--hraness-marketing-action-height)",
      "@media (pointer: coarse)": "3rem"
    },
    "align-items": "center",
    "justify-content": "center",
    "gap": "0.45rem",
    "padding": "0.6rem 1.1rem",
    "border-top": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-right": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-bottom": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-left": {
      "default": "1px solid var(--hraness-marketing-line-strong)",
      "@media (forced-colors: active)": "1px solid CanvasText"
    },
    "border-image-source": {
      "default": "none",
      "@media (forced-colors: active)": "none"
    },
    "border-image-slice": {
      "default": "100%",
      "@media (forced-colors: active)": "100%"
    },
    "border-image-width": {
      "default": "1",
      "@media (forced-colors: active)": "1"
    },
    "border-image-outset": {
      "default": "0",
      "@media (forced-colors: active)": "0"
    },
    "border-image-repeat": {
      "default": "stretch",
      "@media (forced-colors: active)": "stretch"
    },
    "border-radius": "var(--hraness-marketing-radius)",
    "background-color": {
      "default": "transparent",
      ":hover": "transparent"
    },
    "background-image": {
      "default": "none",
      ":hover": "none"
    },
    "background-position": {
      "default": "0% 0%",
      ":hover": "0% 0%"
    },
    "background-size": {
      "default": "auto auto",
      ":hover": "auto auto"
    },
    "background-repeat": {
      "default": "repeat",
      ":hover": "repeat"
    },
    "background-origin": {
      "default": "padding-box",
      ":hover": "padding-box"
    },
    "background-clip": {
      "default": "border-box",
      ":hover": "border-box"
    },
    "background-attachment": {
      "default": "scroll",
      ":hover": "scroll"
    },
    "color": {
      "default": "var(--hraness-marketing-accent-ink)",
      ":hover": "var(--hraness-marketing-accent-ink)"
    },
    "font-family": "var(--hraness-marketing-text-font)",
    "font-size": "0.95rem",
    "font-weight": "500",
    "line-height": "1.2",
    "text-decoration": {
      "default": "none",
      ":hover": "none"
    }
  }
});

const recipes = {
  "hraness-marketing-page": { "default": marketingStyles.page },
  "hraness-marketing-header": { "default": marketingStyles.header, "static": marketingStyles.headerStatic },
  "hraness-marketing-header__inner": { "default": marketingStyles.header__inner },
  "hraness-marketing-header__brand": { "default": marketingStyles.header__brand },
  "hraness-marketing-header__nav": { "default": marketingStyles.header__nav },
  "hraness-marketing-header__link": { "default": marketingStyles.header__link, "current": marketingStyles.header__linkCurrent },
  "hraness-marketing-header__actions": { "default": marketingStyles.header__actions },
  "hraness-marketing-hero": { "default": marketingStyles.hero, "accent": marketingStyles.heroAccent },
  "hraness-marketing-hero__copy": { "default": marketingStyles.hero__copy, "start": marketingStyles.hero__copyStart },
  "hraness-marketing-hero__eyebrow": { "default": marketingStyles.hero__eyebrow, "accent": marketingStyles.hero__eyebrowAccent },
  "hraness-marketing-hero__name": { "default": marketingStyles.hero__name },
  "hraness-marketing-hero__heading": { "default": marketingStyles.hero__heading },
  "hraness-marketing-hero__summary": { "default": marketingStyles.hero__summary },
  "hraness-marketing-hero__example": { "default": marketingStyles.hero__example },
  "hraness-marketing-hero__actions": { "default": marketingStyles.hero__actions, "start": marketingStyles.hero__actionsStart },
  "hraness-marketing-hero__boundary": { "default": marketingStyles.hero__boundary },
  "hraness-marketing-hero__frame": { "default": marketingStyles.hero__frame },
  "hraness-marketing-proof": { "default": marketingStyles.proof },
  "hraness-marketing-proof__kicker": { "default": marketingStyles.proof__kicker },
  "hraness-marketing-proof__heading": { "default": marketingStyles.proof__heading },
  "hraness-marketing-flow": { "default": marketingStyles.flow },
  "hraness-marketing-flow__step": { "default": marketingStyles.flow__step, "first": marketingStyles.flow__stepFirst },
  "hraness-marketing-flow__number": { "default": marketingStyles.flow__number },
  "hraness-marketing-flow__body": { "default": marketingStyles.flow__body },
  "hraness-marketing-flow__label": { "default": marketingStyles.flow__label },
  "hraness-marketing-flow__code": { "default": marketingStyles.flow__code },
  "hraness-marketing-flow__detail": { "default": marketingStyles.flow__detail },
  "hraness-marketing-facts": { "default": marketingStyles.facts },
  "hraness-marketing-facts__item": { "default": marketingStyles.facts__item, "later": marketingStyles.facts__itemLater, "odd": marketingStyles.facts__itemOdd, "row": marketingStyles.facts__itemRow, "row-odd": marketingStyles.facts__itemRowOdd },
  "hraness-marketing-facts__label": { "default": marketingStyles.facts__label },
  "hraness-marketing-facts__body": { "default": marketingStyles.facts__body },
  "hraness-marketing-facts__value": { "default": marketingStyles.facts__value },
  "hraness-marketing-facts__detail": { "default": marketingStyles.facts__detail },
  "hraness-marketing-stats": { "default": marketingStyles.stats },
  "hraness-marketing-stats__list": { "default": marketingStyles.stats__list },
  "hraness-marketing-stats__source": { "default": marketingStyles.stats__source },
  "hraness-marketing-stats__value": { "default": marketingStyles.stats__value },
  "hraness-marketing-pillars": { "default": marketingStyles.pillars },
  "hraness-marketing-pillars__item": { "default": marketingStyles.pillars__item, "later": marketingStyles.pillars__itemLater },
  "hraness-marketing-pillars__label": { "default": marketingStyles.pillars__label },
  "hraness-marketing-pillars__summary": { "default": marketingStyles.pillars__summary },
  "hraness-marketing-proof-frame": { "default": marketingStyles.proof_frame },
  "hraness-marketing-proof-frame__chrome": { "default": marketingStyles.proof_frame__chrome },
  "hraness-marketing-proof-frame__lights": { "default": marketingStyles.proof_frame__lights },
  "hraness-marketing-proof-frame__light": { "default": marketingStyles.proof_frame__light },
  "hraness-marketing-proof-frame__title": { "default": marketingStyles.proof_frame__title },
  "hraness-marketing-proof-frame__content": { "default": marketingStyles.proof_frame__content },
  "hraness-marketing-proof-frame__caption": { "default": marketingStyles.proof_frame__caption },
  "hraness-marketing-proof-frame__credit": { "default": marketingStyles.proof_frame__credit },
  "hraness-marketing-install": { "default": marketingStyles.install },
  "hraness-marketing-install__heading-group": { "default": marketingStyles.install__heading_group },
  "hraness-marketing-install__eyebrow": { "default": marketingStyles.install__eyebrow },
  "hraness-marketing-install__heading": { "default": marketingStyles.install__heading },
  "hraness-marketing-install__commands": { "default": marketingStyles.install__commands },
  "hraness-marketing-section": { "default": marketingStyles.section, "split": marketingStyles.sectionSplit },
  "hraness-marketing-section__heading-group": { "default": marketingStyles.section__heading_group, "split": marketingStyles.section__heading_groupSplit, "reverse": marketingStyles.section__heading_groupReverse },
  "hraness-marketing-section__label": { "default": marketingStyles.section__label },
  "hraness-marketing-section__heading": { "default": marketingStyles.section__heading },
  "hraness-marketing-section__summary": { "default": marketingStyles.section__summary },
  "hraness-marketing-section__body": { "default": marketingStyles.section__body },
  "hraness-marketing-primitives": { "default": marketingStyles.primitives },
  "hraness-marketing-primitives__header": { "default": marketingStyles.primitives__header },
  "hraness-marketing-primitives__label": { "default": marketingStyles.primitives__label },
  "hraness-marketing-primitives__heading": { "default": marketingStyles.primitives__heading },
  "hraness-marketing-primitives__summary": { "default": marketingStyles.primitives__summary },
  "hraness-marketing-interfaces": { "default": marketingStyles.interfaces },
  "hraness-marketing-interfaces__header": { "default": marketingStyles.interfaces__header },
  "hraness-marketing-interfaces__label": { "default": marketingStyles.interfaces__label },
  "hraness-marketing-interfaces__heading": { "default": marketingStyles.interfaces__heading },
  "hraness-marketing-interfaces__summary": { "default": marketingStyles.interfaces__summary },
  "hraness-marketing-trust": { "default": marketingStyles.trust },
  "hraness-marketing-trust__header": { "default": marketingStyles.trust__header },
  "hraness-marketing-trust__label": { "default": marketingStyles.trust__label },
  "hraness-marketing-trust__heading": { "default": marketingStyles.trust__heading },
  "hraness-marketing-trust__summary": { "default": marketingStyles.trust__summary },
  "hraness-marketing-quotes": { "default": marketingStyles.quotes },
  "hraness-marketing-quotes__header": { "default": marketingStyles.quotes__header },
  "hraness-marketing-quotes__label": { "default": marketingStyles.quotes__label },
  "hraness-marketing-quotes__heading": { "default": marketingStyles.quotes__heading },
  "hraness-marketing-quotes__summary": { "default": marketingStyles.quotes__summary },
  "hraness-marketing-pricing": { "default": marketingStyles.pricing },
  "hraness-marketing-pricing__header": { "default": marketingStyles.pricing__header },
  "hraness-marketing-pricing__label": { "default": marketingStyles.pricing__label },
  "hraness-marketing-pricing__heading": { "default": marketingStyles.pricing__heading },
  "hraness-marketing-pricing__summary": { "default": marketingStyles.pricing__summary },
  "hraness-marketing-questions": { "default": marketingStyles.questions },
  "hraness-marketing-questions__header": { "default": marketingStyles.questions__header },
  "hraness-marketing-questions__label": { "default": marketingStyles.questions__label },
  "hraness-marketing-questions__heading": { "default": marketingStyles.questions__heading },
  "hraness-marketing-questions__summary": { "default": marketingStyles.questions__summary },
  "hraness-marketing-maker": { "default": marketingStyles.maker },
  "hraness-marketing-maker__header": { "default": marketingStyles.maker__header },
  "hraness-marketing-maker__label": { "default": marketingStyles.maker__label },
  "hraness-marketing-maker__heading": { "default": marketingStyles.maker__heading },
  "hraness-marketing-primitives__list": { "default": marketingStyles.primitives__list },
  "hraness-marketing-primitive": { "default": marketingStyles.primitive },
  "hraness-marketing-primitive__number": { "default": marketingStyles.primitive__number },
  "hraness-marketing-primitive__heading": { "default": marketingStyles.primitive__heading },
  "hraness-marketing-primitive__summary": { "default": marketingStyles.primitive__summary },
  "hraness-marketing-interface-grid": { "default": marketingStyles.interface_grid },
  "hraness-marketing-trust-grid": { "default": marketingStyles.trust_grid },
  "hraness-marketing-interface": { "default": marketingStyles.interface },
  "hraness-marketing-trust-item": { "default": marketingStyles.trust_item },
  "hraness-marketing-interface__heading": { "default": marketingStyles.interface__heading },
  "hraness-marketing-interface__summary": { "default": marketingStyles.interface__summary },
  "hraness-marketing-trust-item__label": { "default": marketingStyles.trust_item__label },
  "hraness-marketing-trust-item__detail": { "default": marketingStyles.trust_item__detail },
  "hraness-marketing-quote-grid": { "default": marketingStyles.quote_grid },
  "hraness-marketing-quote": { "default": marketingStyles.quote },
  "hraness-marketing-quote__body": { "default": marketingStyles.quote__body },
  "hraness-marketing-quote__text": { "default": marketingStyles.quote__text },
  "hraness-marketing-quote__attribution": { "default": marketingStyles.quote__attribution },
  "hraness-marketing-quote__name": { "default": marketingStyles.quote__name },
  "hraness-marketing-quote__link": { "default": marketingStyles.quote__link },
  "hraness-marketing-plan-grid": { "default": marketingStyles.plan_grid },
  "hraness-marketing-plan": { "default": marketingStyles.plan, "primary": marketingStyles.planPrimary },
  "hraness-marketing-plan__name": { "default": marketingStyles.plan__name },
  "hraness-marketing-plan__price": { "default": marketingStyles.plan__price },
  "hraness-marketing-plan__value": { "default": marketingStyles.plan__value },
  "hraness-marketing-plan__period": { "default": marketingStyles.plan__period },
  "hraness-marketing-plan__summary": { "default": marketingStyles.plan__summary },
  "hraness-marketing-plan__features": { "default": marketingStyles.plan__features },
  "hraness-marketing-plan__feature": { "default": marketingStyles.plan__feature },
  "hraness-marketing-plan__note": { "default": marketingStyles.plan__note },
  "hraness-marketing-question-list": { "default": marketingStyles.question_list },
  "hraness-marketing-question": { "default": marketingStyles.question, "last": marketingStyles.questionLast },
  "hraness-marketing-question__summary": { "default": marketingStyles.question__summary },
  "hraness-marketing-question__answer": { "default": marketingStyles.question__answer },
  "hraness-marketing-maker__portrait": { "default": marketingStyles.maker__portrait },
  "hraness-marketing-maker__body": { "default": marketingStyles.maker__body },
  "hraness-marketing-maker__links": { "default": marketingStyles.maker__links },
  "hraness-marketing-cta": { "default": marketingStyles.cta, "accent": marketingStyles.ctaAccent },
  "hraness-marketing-cta__eyebrow": { "default": marketingStyles.cta__eyebrow },
  "hraness-marketing-cta__heading": { "default": marketingStyles.cta__heading },
  "hraness-marketing-cta__summary": { "default": marketingStyles.cta__summary },
  "hraness-marketing-cta__actions": { "default": marketingStyles.cta__actions },
  "hraness-marketing-cta__footnote": { "default": marketingStyles.cta__footnote },
  "hraness-marketing-action": { "default": marketingStyles.action, "primary": marketingStyles.actionPrimary, "header-secondary": marketingStyles.headerAction, "header-primary": marketingStyles.headerActionPrimary, "plan-secondary": marketingStyles.planAction, "plan-primary": marketingStyles.planActionPrimary, "hero-primary": marketingStyles.heroActionPrimary, "hero-secondary": marketingStyles.heroActionSecondary, "cta-primary": marketingStyles.ctaActionPrimary, "cta-secondary": marketingStyles.ctaActionSecondary },
} as const;

export type MarketingSlot = keyof typeof recipes;

const factColumns = {
  1: marketingStyles.factColumns1,
  2: marketingStyles.factColumns2,
  3: marketingStyles.factColumns3,
  4: marketingStyles.factColumns4,
} as const;

const pillarColumns = {
  1: marketingStyles.pillarColumns1,
  2: marketingStyles.pillarColumns2,
  3: marketingStyles.pillarColumns3,
  4: marketingStyles.pillarColumns4,
} as const;

/** Explicit finite columns compose static atoms, including the existing media rules. */
export function marketingColumnClassName(
  hook: "hraness-marketing-facts" | "hraness-marketing-pillars" | "hraness-marketing-stats__list",
  caller: string | undefined,
  columns: MarketingColumnCount | undefined,
): string {
  if (columns !== undefined && columns !== 1 && columns !== 2 && columns !== 3 && columns !== 4) {
    throw new RangeError("Marketing columns must be 1, 2, 3, or 4 when specified.");
  }
  const columnRecipe = columns === undefined ? undefined
    : (hook === "hraness-marketing-pillars" ? pillarColumns : factColumns)[columns];
  return [hook, stylex.props(recipes[hook].default, columnRecipe).className, caller]
    .filter((value) => value !== undefined && value.length > 0).join(" ");
}

/** A finite slot/state lookup keeps caller classes last and never injects CSS. */
export function marketingClassName(
  hook: MarketingSlot,
  caller?: string,
  variant = "default",
): string {
  const variants = recipes[hook];
  if (!Object.hasOwn(variants, variant)) throw new Error(`Unknown marketing variant: ${hook}/${variant}`);
  const selected = variants[variant as keyof typeof variants];
  return [hook, stylex.props(selected,
    hook === "hraness-marketing-action" && marketingStyles.actionFocus,
    hook === "hraness-marketing-question" && questionMarker).className, caller]
    .filter((value) => value !== undefined && value.length > 0).join(" ");
}

/** CSS nth-child boundaries expressed as stable server-rendered list positions. */
export function marketingFactCellVariant(index: number): string {
  return index === 0 ? "default" : index < 2 ? "later" : index % 2 === 0 ? "row-odd" : "row";
}

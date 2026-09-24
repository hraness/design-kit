import * as stylex from "@stylexjs/stylex";

// Shared metallic-chrome contract projected from the authored material in
// ../foil-material.ts, mirrored by the handwritten product-marketing.css
// grammar and by @hraness/site-footer's holographic recipe. attachFoil() from
// @hraness/design-kit/browser eases the two bounded pointer inputs
// --hraness-foil-x and --hraness-foil-y on the outermost [data-foil] lockup;
// shapes never rotate, only the light moves. --hraness-foil-glow stays
// CSS-owned on hover-capable pointers. Each recipe resolves the public
// --hraness-foil-* spectrum into private scheme-conditioned stops so product
// overrides inherit while the darker dark palette keeps the pointer sheen
// visible on standalone surfaces.
const foilStops = {
  "--_hraness-foil-1": {
    "default": "var(--hraness-foil-1, oklch(0.89 0.065 337))",
    "@media (prefers-color-scheme: dark)": "var(--hraness-foil-1, oklch(0.56 0.16 340))",
  },
  "--_hraness-foil-2": {
    "default": "var(--hraness-foil-2, oklch(0.875 0.05 277))",
    "@media (prefers-color-scheme: dark)": "var(--hraness-foil-2, oklch(0.52 0.15 285))",
  },
  "--_hraness-foil-3": {
    "default": "var(--hraness-foil-3, oklch(0.92 0.05 170))",
    "@media (prefers-color-scheme: dark)": "var(--hraness-foil-3, oklch(0.66 0.14 175))",
  },
  "--_hraness-foil-4": {
    "default": "var(--hraness-foil-4, oklch(0.95 0.045 96))",
    "@media (prefers-color-scheme: dark)": "var(--hraness-foil-4, oklch(0.72 0.13 100))",
  },
  "--_hraness-foil-5": {
    "default": "var(--hraness-foil-5, oklch(0.9 0.05 55))",
    "@media (prefers-color-scheme: dark)": "var(--hraness-foil-5, oklch(0.55 0.15 45))",
  },
  "--_hraness-foil-6": {
    "default": "var(--hraness-foil-6, oklch(0.875 0.06 305))",
    "@media (prefers-color-scheme: dark)": "var(--hraness-foil-6, oklch(0.62 0.16 305))",
  },
};

export const foilSurfaceImage = "linear-gradient(var(--hraness-foil-surface, var(--surface, var(--background, Canvas))), var(--hraness-foil-surface, var(--surface, var(--background, Canvas)))), radial-gradient(ellipse 28% 100% at var(--hraness-foil-x, 50%) var(--hraness-foil-y, 50%), color-mix(in srgb, white calc(60% + var(--hraness-foil-glow, 0) * 24%), transparent) 0%, transparent 72%), radial-gradient(ellipse 80% 180% at calc(100% - var(--hraness-foil-x, 50%)) calc(100% - var(--hraness-foil-y, 50%)), color-mix(in srgb, white var(--hraness-foil-sheen-opacity, 28%), transparent) 0%, transparent 78%), linear-gradient(115deg, var(--_hraness-foil-1), var(--_hraness-foil-2), var(--_hraness-foil-3), var(--_hraness-foil-4), var(--_hraness-foil-5), var(--_hraness-foil-6))";

export const foilTextImage = "var(--hraness-foil-image, radial-gradient(ellipse 24% 85% at var(--hraness-foil-x, 50%) var(--hraness-foil-y, 50%), color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 80%, var(--background, Canvas)) 0%, transparent 68%), radial-gradient(ellipse 65% 160% at calc(100% - var(--hraness-foil-x, 50%)) calc(100% - var(--hraness-foil-y, 50%)), color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 98%, var(--background, Canvas)) 0%, transparent 72%), linear-gradient(115deg, color-mix(in srgb, var(--_hraness-foil-1) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-2) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-3) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-4) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-5) var(--hraness-foil-reflection, 14%), transparent), color-mix(in srgb, var(--_hraness-foil-6) var(--hraness-foil-reflection, 14%), transparent)), linear-gradient(115deg, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 90%, var(--background, Canvas)) 0%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 100%, var(--background, Canvas)) 24%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 86%, var(--background, Canvas)) 39%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 100%, var(--background, Canvas)) 56%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 84%, var(--background, Canvas)) 82%, color-mix(in oklch, var(--hraness-foil-text-base, var(--foreground, CanvasText)) 100%, var(--background, Canvas)) 100%))";

export const foilSurfaceBackgroundClip = "padding-box, border-box, border-box, border-box";

export const foilHalo = "0 1px 4px color-mix(in srgb, var(--foreground, CanvasText) 12%, transparent)";

export const foilTextHalo = "none";

export const foilStyles = stylex.create({
  surface: {
    ...foilStops,
    "--hraness-foil-glow": {
      "default": "0",
      "@media (hover: hover)": { ":hover:not(:disabled)": "1" },
    },
    "border-top-width": "2px",
    "border-right-width": "2px",
    "border-bottom-width": "2px",
    "border-left-width": "2px",
    "border-top-style": "solid",
    "border-right-style": "solid",
    "border-bottom-style": "solid",
    "border-left-style": "solid",
    "border-top-color": { "default": "transparent", "@media (forced-colors: active)": "ButtonText" },
    "border-right-color": { "default": "transparent", "@media (forced-colors: active)": "ButtonText" },
    "border-bottom-color": { "default": "transparent", "@media (forced-colors: active)": "ButtonText" },
    "border-left-color": { "default": "transparent", "@media (forced-colors: active)": "ButtonText" },
    "background-color": {
      "default": "var(--hraness-foil-surface, var(--surface, var(--background, Canvas)))",
      "@media (forced-colors: active)": "Canvas",
    },
    "background-image": {
      "default": foilSurfaceImage,
      "@media (forced-colors: active)": "none",
    },
    "background-origin": "border-box",
    "background-clip": foilSurfaceBackgroundClip,
    "box-shadow": { "default": foilHalo, "@media (forced-colors: active)": "none" },
    "color": { "default": null, "@media (forced-colors: active)": "CanvasText" },
  },
  text: {
    ...foilStops,
    "--hraness-foil-glow": {
      "default": "0",
      "@media (hover: hover)": { ":hover": "1" },
    },
    "background-image": {
      "default": foilTextImage,
      "@media (forced-colors: active)": "none",
    },
    "-webkit-background-clip": "text",
    "background-clip": "text",
    "color": { "default": "transparent", "@media (forced-colors: active)": "CanvasText" },
    "-webkit-text-fill-color": { "default": "transparent", "@media (forced-colors: active)": "CanvasText" },
    "filter": "none",
  },
});

const foilHooks = {
  surface: "hraness-foil",
  text: "hraness-foil-text",
} as const;

export type FoilKind = keyof typeof foilHooks;

/** Stable hook plus compiled atoms; caller classes stay last and win conflicts. */
export function foilClassName(kind: FoilKind, caller?: string): string {
  const hook = foilHooks[kind];
  return [hook, stylex.props(foilStyles[kind]).className, caller]
    .filter((value) => value !== undefined && value.length > 0).join(" ");
}


const markStyles = stylex.create({
  root: {
    "display": "inline-flex",
    "position": "relative",
    "flex-shrink": "0",
    "color": "var(--foreground, CanvasText)",
    "line-height": "0",
    "vertical-align": "middle",
    "inline-size": "var(--hraness-foil-size, 1.5rem)",
    "block-size": "var(--hraness-foil-size, 1.5rem)",
  },
  image: {
    "display": "block",
    "inline-size": "100%",
    "block-size": "100%",
    "object-fit": "contain",
  },
  paint: {
    ...foilStops,
    // A generic display:none atom can be repeated by a later package layer and
    // override our supported-mask state. Keep the conditional state mark-owned.
    "display": "var(--_hraness-foil-mark-display)",
    "--_hraness-foil-mark-display": {
      "default": "none",
      "@supports (mask-image: linear-gradient(black, black))": {
        "default": "block",
        "@media (forced-colors: active)": "none",
      },
    },
    "position": "absolute",
    "inset": "0",
    "pointer-events": "none",
    "background-image": foilTextImage,
    "mask-image": "var(--hraness-foil-mask, linear-gradient(transparent, transparent))",
    "mask-mode": "alpha",
    "mask-repeat": "no-repeat",
    "mask-position": "center",
    "mask-size": "contain",
  },
});

export function foilMarkClassName(part: keyof typeof markStyles, caller?: string): string {
  const hook = part === "root" ? "hraness-foil-mark" : `hraness-foil-mark__${part}`;
  return [hook, stylex.props(markStyles[part]).className, caller].filter(Boolean).join(" ");
}

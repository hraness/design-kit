import * as stylex from "@stylexjs/stylex";

// Shared metallic-chrome contract mirrored by the handwritten
// product-marketing.css grammar and by @hraness/site-footer's holographic
// recipe. attachFoil() from @hraness/design-kit/browser eases the three bounded
// pointer inputs --hraness-foil-x, --hraness-foil-y, and --hraness-foil-angle on
// [data-foil] descendants; --hraness-foil-glow stays CSS-owned on hover-capable
// pointers. Each recipe resolves the public --hraness-foil-* spectrum into
// private scheme-conditioned stops so product overrides inherit while the
// darker dark palette keeps the pointer sheen visible on standalone surfaces.
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
  "--_hraness-foil-halo": {
    "default": "var(--hraness-foil-halo-alpha, 0.3)",
    "@media (prefers-color-scheme: dark)": "var(--hraness-foil-halo-alpha, 0.45)",
  },
};

export const foilSurfaceImage = "linear-gradient(var(--hraness-foil-surface, var(--surface, var(--background, Canvas))), var(--hraness-foil-surface, var(--surface, var(--background, Canvas)))), radial-gradient(circle at var(--hraness-foil-x, 50%) var(--hraness-foil-y, 50%), color-mix(in srgb, white calc(64% + var(--hraness-foil-glow, 0) * 28%), transparent) 0%, transparent 46%), conic-gradient(from var(--hraness-foil-angle, 135deg), var(--_hraness-foil-1), var(--_hraness-foil-2), var(--_hraness-foil-3), var(--_hraness-foil-4), var(--_hraness-foil-5), var(--_hraness-foil-6), var(--_hraness-foil-1))";

export const foilTextImage = "radial-gradient(circle at var(--hraness-foil-x, 50%) var(--hraness-foil-y, 50%), color-mix(in srgb, white calc(48% + var(--hraness-foil-glow, 0) * 32%), transparent) 0%, transparent 56%), conic-gradient(from var(--hraness-foil-angle, 135deg), color-mix(in oklch, var(--_hraness-foil-1) 70%, var(--hraness-foil-text-base, var(--foreground, CanvasText))), color-mix(in oklch, var(--_hraness-foil-2) 70%, var(--hraness-foil-text-base, var(--foreground, CanvasText))), color-mix(in oklch, var(--_hraness-foil-3) 70%, var(--hraness-foil-text-base, var(--foreground, CanvasText))), color-mix(in oklch, var(--_hraness-foil-4) 70%, var(--hraness-foil-text-base, var(--foreground, CanvasText))), color-mix(in oklch, var(--_hraness-foil-5) 70%, var(--hraness-foil-text-base, var(--foreground, CanvasText))), color-mix(in oklch, var(--_hraness-foil-6) 70%, var(--hraness-foil-text-base, var(--foreground, CanvasText))), color-mix(in oklch, var(--_hraness-foil-1) 70%, var(--hraness-foil-text-base, var(--foreground, CanvasText))))";

export const foilHalo = "0 0 0.375rem hsl(var(--hraness-foil-angle, 135deg) 55% 75% / var(--_hraness-foil-halo))";

export const foilTextHalo = "drop-shadow(0 0 0.3rem hsl(var(--hraness-foil-angle, 135deg) 55% 75% / var(--_hraness-foil-halo)))";

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
    "background-clip": "padding-box, border-box, border-box",
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
    "filter": { "default": foilTextHalo, "@media (forced-colors: active)": "none" },
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

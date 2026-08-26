import * as stylex from "@stylexjs/stylex";

const reducedOrStaticTransform = {
  default: "none",
  "@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)":
    "perspective(72rem) rotateX(var(--foil-rotate-x, 0deg)) rotateY(var(--foil-rotate-y, 0deg))",
} as const;

const layerDisplay = {
  default: "block",
  "@media (forced-colors: active)": "none",
} as const;

export const foilCardSurfaceStyles = stylex.create({
  base: {
    backgroundColor: {
      default: "var(--card, var(--surface, #111217))",
      "@media (forced-colors: active)": "Canvas",
    },
    borderRadius: "var(--radius-lg, 0.75rem)",
    boxShadow: {
      default:
        "0 1.2rem 3.6rem rgb(4 6 12 / 0.24), inset 0 1px 0 rgb(255 255 255 / 0.28)",
      "@media (forced-colors: active)": "none",
    },
    color: "var(--card-foreground, var(--foreground, currentColor))",
    contain: "paint",
    display: "grid",
    isolation: "isolate",
    outlineColor: "currentColor",
    outlineOffset: -1,
    outlineStyle: "solid",
    outlineWidth: {
      default: 1,
      "@media (prefers-contrast: more)": 2,
    },
    overflow: "hidden",
    transformOrigin: "center",
    transformStyle: "preserve-3d",
  },
  interactive: {
    transform: reducedOrStaticTransform,
    transitionDuration: {
      default: "180ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionProperty: "transform, box-shadow",
    transitionTimingFunction: "cubic-bezier(0.2, 0.75, 0.25, 1)",
    willChange: {
      default: "auto",
      "@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)":
        "transform",
    },
  },
  static: {
    transform: "none",
    transitionDuration: "0ms",
    transitionProperty: "none",
    willChange: "auto",
  },
  content: {
    gridColumnEnd: 2,
    gridColumnStart: 1,
    gridRowEnd: 2,
    gridRowStart: 1,
    zIndex: 2,
  },
  layer: {
    display: layerDisplay,
    gridColumnEnd: 2,
    gridColumnStart: 1,
    gridRowEnd: 2,
    gridRowStart: 1,
    pointerEvents: "none",
  },
  baseLayer: {
    backgroundPosition: "var(--foil-light-x, 50%) var(--foil-light-y, 50%)",
    backgroundSize: "160% 160%",
    filter: "saturate(1.08)",
    zIndex: 0,
  },
  spectrumLayer: {
    backgroundPosition: "var(--foil-light-x, 50%) var(--foil-light-y, 50%)",
    backgroundSize: "180% 180%",
    mixBlendMode: "color-dodge",
    transitionDuration: {
      default: "90ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionProperty: "background-position, opacity",
    transitionTimingFunction: "linear",
    zIndex: 3,
  },
  sheenLayer: {
    backgroundImage:
      "radial-gradient(circle at var(--foil-light-x, 50%) var(--foil-light-y, 50%), rgb(255 255 255 / 0.94) 0, rgb(255 255 255 / 0.36) 10%, transparent 36%)",
    mixBlendMode: "screen",
    transitionDuration: {
      default: "90ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionProperty: "background-image, opacity",
    transitionTimingFunction: "linear",
    zIndex: 4,
  },
  textureLayer: {
    backgroundImage:
      "repeating-linear-gradient(calc(var(--foil-spectrum-angle, 0deg) + 24deg), transparent 0 3px, rgb(255 255 255 / 0.42) 3px 4px, transparent 4px 9px)",
    backgroundSize: "18px 18px",
    mixBlendMode: "soft-light",
    zIndex: 5,
  },

  prismBase: {
    backgroundImage:
      "conic-gradient(from var(--foil-spectrum-angle, 0deg) at 50% 50%, #ff5f8f, #ffd66e, #71f4d1, #6bb7ff, #b987ff, #ff5f8f)",
  },
  prismSpectrum: {
    backgroundImage:
      "linear-gradient(calc(var(--foil-spectrum-angle, 0deg) + 112deg), transparent 8%, rgb(255 82 166 / 0.74) 24%, rgb(255 239 132 / 0.76) 39%, rgb(111 245 219 / 0.78) 54%, rgb(106 175 255 / 0.78) 69%, rgb(207 139 255 / 0.72) 84%, transparent 96%)",
  },
  prismTexture: {
    backgroundSize: "14px 14px",
  },

  auroraBase: {
    backgroundImage:
      "radial-gradient(ellipse at 16% 18%, #9cf7de 0, transparent 42%), radial-gradient(ellipse at 82% 22%, #82b5ff 0, transparent 46%), radial-gradient(ellipse at 54% 88%, #c69bff 0, transparent 48%), linear-gradient(145deg, #152743, #2b1841)",
  },
  auroraSpectrum: {
    backgroundImage:
      "radial-gradient(ellipse at var(--foil-light-x, 50%) var(--foil-light-y, 50%), rgb(167 255 232 / 0.84), rgb(117 169 255 / 0.56) 28%, rgb(208 145 255 / 0.42) 52%, transparent 72%)",
  },
  auroraTexture: {
    backgroundImage:
      "repeating-radial-gradient(ellipse at 50% 120%, transparent 0 11px, rgb(255 255 255 / 0.34) 12px 13px, transparent 14px 23px)",
    backgroundSize: "100% 100%",
  },

  etchedBase: {
    backgroundImage:
      "linear-gradient(142deg, #d8dce7 0, #666d7d 22%, #f4f5f8 43%, #4f5563 67%, #c9ced9 100%)",
  },
  etchedSpectrum: {
    backgroundImage:
      "linear-gradient(calc(var(--foil-spectrum-angle, 0deg) + 96deg), transparent 12%, rgb(144 217 255 / 0.48) 34%, rgb(255 232 164 / 0.52) 48%, rgb(223 175 255 / 0.46) 62%, transparent 86%)",
    mixBlendMode: "overlay",
  },
  etchedTexture: {
    backgroundImage:
      "repeating-linear-gradient(calc(var(--foil-spectrum-angle, 0deg) + 18deg), rgb(20 24 31 / 0.48) 0 1px, transparent 1px 5px, rgb(255 255 255 / 0.34) 5px 6px, transparent 6px 11px)",
    backgroundSize: "12px 12px",
    mixBlendMode: "overlay",
  },

  goldBase: {
    backgroundImage:
      "conic-gradient(from var(--foil-spectrum-angle, 0deg) at 48% 46%, #6f4213, #e0a72c, #fff0a6, #a96512, #f6ca50, #7b4915, #6f4213)",
  },
  goldSpectrum: {
    backgroundImage:
      "radial-gradient(ellipse at var(--foil-light-x, 50%) var(--foil-light-y, 50%), rgb(255 252 211 / 0.96) 0, rgb(255 205 78 / 0.62) 25%, rgb(156 85 15 / 0.38) 52%, transparent 74%)",
  },
  goldTexture: {
    backgroundImage:
      "repeating-linear-gradient(calc(var(--foil-spectrum-angle, 0deg) + 38deg), transparent 0 4px, rgb(255 247 190 / 0.52) 5px 6px, transparent 7px 13px)",
    backgroundSize: "15px 15px",
  },

  fastBase: {
    backgroundImage:
      "linear-gradient(128deg, #061c32 0, #0c6c96 32%, #8cf5e5 47%, #1684ba 62%, #071d38 100%)",
  },
  fastSpectrum: {
    backgroundImage:
      "repeating-linear-gradient(calc(var(--foil-spectrum-angle, 0deg) + 116deg), transparent 0 7%, rgb(178 255 247 / 0.72) 8% 10%, transparent 11% 18%, rgb(135 190 255 / 0.64) 19% 21%, transparent 22% 31%)",
    backgroundSize: "190% 190%",
  },
  fastTexture: {
    backgroundImage:
      "repeating-linear-gradient(116deg, transparent 0 9px, rgb(226 255 255 / 0.52) 10px 11px, transparent 12px 22px)",
    backgroundSize: "24px 24px",
  },

  maxBase: {
    backgroundImage:
      "radial-gradient(circle at 18% 16%, #ffcf70 0, transparent 34%), radial-gradient(circle at 88% 26%, #54d9db 0, transparent 42%), radial-gradient(circle at 56% 92%, #a06dff 0, transparent 48%), linear-gradient(138deg, #261044, #081d35 56%, #25102e)",
  },
  maxSpectrum: {
    backgroundImage:
      "conic-gradient(from var(--foil-spectrum-angle, 0deg) at var(--foil-light-x, 50%) var(--foil-light-y, 50%), transparent 0 8%, rgb(255 201 92 / 0.72) 18%, rgb(106 245 226 / 0.72) 36%, rgb(117 162 255 / 0.68) 52%, rgb(194 116 255 / 0.72) 69%, rgb(255 120 177 / 0.64) 84%, transparent 96%)",
  },
  maxTexture: {
    backgroundImage:
      "repeating-radial-gradient(circle at 50% 50%, transparent 0 5px, rgb(255 255 255 / 0.38) 6px 7px, transparent 8px 15px)",
    backgroundSize: "32px 32px",
  },

  baseSubtle: {
    opacity: {
      default: 0.72,
      "@media (prefers-contrast: more)": 0.14,
    },
  },
  baseStandard: {
    opacity: {
      default: 0.86,
      "@media (prefers-contrast: more)": 0.18,
    },
  },
  baseVivid: {
    opacity: {
      default: 1,
      "@media (prefers-contrast: more)": 0.22,
    },
  },
  spectrumSubtle: {
    opacity: {
      default: 0.26,
      "@media (prefers-contrast: more)": 0.12,
    },
  },
  spectrumStandard: {
    opacity: {
      default: 0.46,
      "@media (prefers-contrast: more)": 0.18,
    },
  },
  spectrumVivid: {
    opacity: {
      default: 0.66,
      "@media (prefers-contrast: more)": 0.24,
    },
  },
  sheenSubtle: {
    opacity: {
      default: 0.22,
      "@media (prefers-contrast: more)": 0.1,
    },
  },
  sheenStandard: {
    opacity: {
      default: 0.38,
      "@media (prefers-contrast: more)": 0.14,
    },
  },
  sheenVivid: {
    opacity: {
      default: 0.56,
      "@media (prefers-contrast: more)": 0.2,
    },
  },
  textureSubtle: {
    opacity: {
      default: 0.1,
      "@media (prefers-contrast: more)": 0.04,
    },
  },
  textureStandard: {
    opacity: {
      default: 0.17,
      "@media (prefers-contrast: more)": 0.05,
    },
  },
  textureVivid: {
    opacity: {
      default: 0.25,
      "@media (prefers-contrast: more)": 0.06,
    },
  },
});

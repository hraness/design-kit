import {
  highlightCode
} from "./chunk-djxa5bgc.js";

// src/react/procedural-recipe.ts
var proceduralBackdropVariants = [
  "atmosphere",
  "grid",
  "ripple",
  "composite"
];
var proceduralRecipeVersion = 1;
var defaultProceduralEffectPalette = {
  highlight: "var(--aurora-gold)",
  key: "var(--aurora-rose)",
  shadow: "var(--aurora-violet)",
  support: "var(--aurora-cyan)"
};
var colorRoles = [
  "key",
  "support",
  "highlight",
  "shadow"
];
function normalizeSeed(seed) {
  const normalized = seed.trim();
  if (normalized.length === 0) {
    throw new RangeError("A procedural effect seed must contain a non-whitespace character.");
  }
  return normalized;
}
function normalizeVariation(variation) {
  const normalized = variation ?? 0;
  if (!Number.isSafeInteger(normalized)) {
    throw new RangeError("A procedural effect variation must be a safe integer.");
  }
  return normalized === 0 ? 0 : normalized;
}
function normalizePalette(palette) {
  const normalized = palette ?? defaultProceduralEffectPalette;
  for (const role of colorRoles) {
    if (normalized[role].trim().length === 0) {
      throw new RangeError(`A procedural effect palette requires a nonblank ${role} color.`);
    }
  }
  return {
    highlight: normalized.highlight.trim(),
    key: normalized.key.trim(),
    shadow: normalized.shadow.trim(),
    support: normalized.support.trim()
  };
}
function seedHash(value) {
  let hash = 2166136261;
  for (let index = 0;index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function seededUnitSequence(seed) {
  let state = seedHash(seed);
  return () => {
    state = state + 1831565813 >>> 0;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}
function rounded(value, places = 3) {
  const scale = 10 ** places;
  const result = Math.round(value * scale) / scale;
  return result === 0 ? 0 : result;
}
function between(next, minimum, maximum) {
  return rounded(minimum + next() * (maximum - minimum));
}
function integerBetween(next, minimum, maximum) {
  return Math.floor(minimum + next() * (maximum - minimum + 1));
}
function negativeIntegerBetween(next, minimum, maximum) {
  const value = integerBetween(next, minimum, maximum);
  return value === 0 ? 0 : -value;
}
function colorRole(next) {
  return colorRoles[integerBetween(next, 0, colorRoles.length - 1)] ?? "key";
}
function proceduralIdentity(input, recipeName) {
  const seed = normalizeSeed(input.seed);
  const variation = normalizeVariation(input.variation);
  return {
    next: seededUnitSequence(`hraness-design-procedural-v${proceduralRecipeVersion}\x00${recipeName}\x00${seed}\x00${variation}`),
    palette: normalizePalette(input.palette),
    seed,
    variation
  };
}
function createProceduralBackdropRecipe(input) {
  const { next, palette, seed, variation } = proceduralIdentity(input, "backdrop");
  const variant = input.variant ?? "composite";
  if (!proceduralBackdropVariants.includes(variant)) {
    throw new RangeError(`Unsupported procedural backdrop variant: ${variant}.`);
  }
  const atmosphere = Array.from({ length: 5 }, () => ({
    blur: between(next, 24, 54),
    color: colorRole(next),
    delay: negativeIntegerBetween(next, 0, 9000),
    driftX: between(next, -18, 18),
    driftY: between(next, -14, 14),
    duration: integerBetween(next, 1e4, 18000),
    height: between(next, 34, 68),
    opacity: between(next, 0.16, 0.34),
    rotation: between(next, -28, 28),
    scale: between(next, 1.02, 1.12),
    width: between(next, 42, 78),
    x: between(next, 8, 92),
    y: between(next, 8, 92)
  }));
  const gridSize = integerBetween(next, 42, 72);
  const grid = {
    offsetX: integerBetween(next, 0, gridSize - 1),
    offsetY: integerBetween(next, 0, gridSize - 1),
    opacity: between(next, 0.045, 0.095),
    rotation: between(next, -2.5, 2.5),
    size: gridSize
  };
  const ripple = {
    aspect: between(next, 0.62, 0.9),
    color: colorRole(next),
    contours: Array.from({ length: 4 }, (_, index) => ({
      delay: negativeIntegerBetween(next, 0, 7000),
      duration: integerBetween(next, 8000, 14000),
      opacity: between(next, 0.08, 0.18),
      size: between(next, 28 + index * 13, 36 + index * 16)
    })),
    rotation: between(next, -18, 18),
    x: between(next, 24, 76),
    y: between(next, 22, 78)
  };
  return {
    atmosphere,
    grid,
    palette,
    ripple,
    seed,
    variation,
    variant,
    version: proceduralRecipeVersion
  };
}
function createParticleHaloRecipe(input) {
  const { next, palette, seed, variation } = proceduralIdentity(input, "halo");
  const particles = Array.from({ length: 24 }, (_, index) => {
    const angle = index / 24 * Math.PI * 2 + between(next, -0.11, 0.11);
    const radiusX = between(next, 35, 49);
    const radiusY = between(next, 34, 48);
    return {
      color: colorRole(next),
      delay: negativeIntegerBetween(next, 0, 7000),
      driftX: between(next, -7, 7),
      driftY: between(next, -7, 7),
      duration: integerBetween(next, 7000, 13000),
      opacity: between(next, 0.26, 0.62),
      size: between(next, 2, 6),
      x: rounded(50 + Math.cos(angle) * radiusX),
      y: rounded(50 + Math.sin(angle) * radiusY)
    };
  });
  return {
    palette,
    particles,
    seed,
    variation,
    version: proceduralRecipeVersion
  };
}

// src/react/procedural-backdrop.tsx
import { cn } from "@hraness/ui";
import { jsx, jsxs } from "react/jsx-runtime";
var colorVariables = {
  highlight: "var(--hraness-design-procedural-highlight)",
  key: "var(--hraness-design-procedural-key)",
  shadow: "var(--hraness-design-procedural-shadow)",
  support: "var(--hraness-design-procedural-support)"
};
var INERT_PROPS = { inert: true };
function ProceduralBackdrop({
  className,
  palette,
  seed,
  style,
  variation,
  variant,
  ...props
}) {
  const recipe = createProceduralBackdropRecipe({
    seed,
    ...palette === undefined ? {} : { palette },
    ...variation === undefined ? {} : { variation },
    ...variant === undefined ? {} : { variant }
  });
  const rootStyle = {
    ...style,
    "--hraness-design-procedural-highlight": recipe.palette.highlight,
    "--hraness-design-procedural-key": recipe.palette.key,
    "--hraness-design-procedural-shadow": recipe.palette.shadow,
    "--hraness-design-procedural-support": recipe.palette.support
  };
  const showAtmosphere = recipe.variant === "atmosphere" || recipe.variant === "composite";
  const showGrid = recipe.variant === "grid" || recipe.variant === "composite";
  const showRipple = recipe.variant === "ripple" || recipe.variant === "composite";
  const gridStyle = {
    "--hraness-design-procedural-grid-offset-x": `${recipe.grid.offsetX}px`,
    "--hraness-design-procedural-grid-offset-y": `${recipe.grid.offsetY}px`,
    "--hraness-design-procedural-grid-opacity": recipe.grid.opacity,
    "--hraness-design-procedural-grid-rotation": `${recipe.grid.rotation}deg`,
    "--hraness-design-procedural-grid-size": `${recipe.grid.size}px`
  };
  const rippleStyle = {
    "--hraness-design-procedural-ripple-aspect": recipe.ripple.aspect,
    "--hraness-design-procedural-ripple-color": colorVariables[recipe.ripple.color],
    "--hraness-design-procedural-ripple-rotation": `${recipe.ripple.rotation}deg`,
    "--hraness-design-procedural-ripple-x": `${recipe.ripple.x}%`,
    "--hraness-design-procedural-ripple-y": `${recipe.ripple.y}%`
  };
  return /* @__PURE__ */ jsxs("div", {
    ...props,
    ...INERT_PROPS,
    "aria-hidden": "true",
    className: cn("hraness-design-procedural-backdrop", className),
    "data-recipe-version": recipe.version,
    "data-variation": recipe.variation,
    "data-variant": recipe.variant,
    role: "presentation",
    style: rootStyle,
    children: [
      showAtmosphere ? /* @__PURE__ */ jsx("span", {
        className: "hraness-design-procedural-backdrop__atmosphere",
        children: recipe.atmosphere.map((layer, index) => {
          const layerStyle = {
            "--hraness-design-procedural-layer-blur": `${layer.blur}px`,
            "--hraness-design-procedural-layer-color": colorVariables[layer.color],
            "--hraness-design-procedural-layer-delay": `${layer.delay}ms`,
            "--hraness-design-procedural-layer-drift-x": `${layer.driftX}px`,
            "--hraness-design-procedural-layer-drift-y": `${layer.driftY}px`,
            "--hraness-design-procedural-layer-duration": `${layer.duration}ms`,
            "--hraness-design-procedural-layer-height": `${layer.height}%`,
            "--hraness-design-procedural-layer-opacity": layer.opacity,
            "--hraness-design-procedural-layer-rotation": `${layer.rotation}deg`,
            "--hraness-design-procedural-layer-scale": layer.scale,
            "--hraness-design-procedural-layer-width": `${layer.width}%`,
            "--hraness-design-procedural-layer-x": `${layer.x}%`,
            "--hraness-design-procedural-layer-y": `${layer.y}%`
          };
          return /* @__PURE__ */ jsx("i", {
            className: "hraness-design-procedural-backdrop__cloud",
            style: layerStyle
          }, index);
        })
      }) : null,
      showGrid ? /* @__PURE__ */ jsx("span", {
        className: "hraness-design-procedural-backdrop__grid",
        style: gridStyle
      }) : null,
      showRipple ? /* @__PURE__ */ jsx("span", {
        className: "hraness-design-procedural-backdrop__ripples",
        style: rippleStyle,
        children: recipe.ripple.contours.map((contour, index) => {
          const contourStyle = {
            "--hraness-design-procedural-ripple-delay": `${contour.delay}ms`,
            "--hraness-design-procedural-ripple-duration": `${contour.duration}ms`,
            "--hraness-design-procedural-ripple-opacity": contour.opacity,
            "--hraness-design-procedural-ripple-size": `${contour.size}%`
          };
          return /* @__PURE__ */ jsx("i", {
            className: "hraness-design-procedural-backdrop__ripple",
            style: contourStyle
          }, index);
        })
      }) : null
    ]
  });
}

// src/react/surfaces.tsx
import { forwardRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { ThemedSurface, cn as cn2 } from "@hraness/ui";

// src/react/surfaces.stylex.ts
var ditherSurfaceStyles = {
  coarse: {
    "--hraness-design-dither-size": "xvx1b6g",
    $$css: true
  },
  fine: {
    "--hraness-design-dither-size": "xgcu659",
    $$css: true
  },
  texture: {
    kKwaWg: "xtuv73v xhobzj1",
    kgSjnq: "x150knr0",
    $$css: true
  }
};
var layoutSurfaceStyles = {
  bar: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x78zum5",
    kOIVth: "x96y02u",
    kdYMnH: "xesnm00",
    $$css: true
  },
  barContent: {
    kUk6DE: "x12lumcd",
    $$css: true
  },
  barPart: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x78zum5",
    kOIVth: "xmgkybt",
    kdYMnH: "xesnm00",
    $$css: true
  },
  bottomBar: {
    kmc9e2: "x3so8kt",
    kT8eP4: "x1b1eqt9",
    kVQ08L: "x1b207tk",
    kF3gjK: "x1dtp59r",
    kJVvJu: "xfmotut",
    $$css: true
  },
  dockedAbsolute: {
    kVAEAm: "x10l6tqk",
    $$css: true
  },
  dockedContent: {
    kULEZF: "xvaqoh0",
    kYk0Dm: "xvueqy4",
    $$css: true
  },
  dockedContentCompactInset: {
    kF3gjK: "x19cf7fd",
    kJVvJu: "x2qnaq3",
    $$css: true
  },
  dockedContentCompactNoInset: {
    kF3gjK: "x19cf7fd",
    kJVvJu: "x10wq4n4",
    $$css: true
  },
  dockedContentDefaultInset: {
    kF3gjK: "x1noa3k7",
    kJVvJu: "x2qnaq3",
    $$css: true
  },
  dockedContentDefaultNoInset: {
    kF3gjK: "x1noa3k7",
    kJVvJu: "x10wq4n4",
    $$css: true
  },
  dockedFixed: {
    kVAEAm: "xixxii4",
    $$css: true
  },
  dockedFooter: {
    kmc9e2: "x3so8kt",
    kT8eP4: "x1b1eqt9",
    kctUWg: "xuufnwz",
    khdm6U: "x17y0mx6",
    kY2c9j: "x1nmkd3v",
    $$css: true
  },
  dockedSticky: {
    kVAEAm: "x7wzq59",
    $$css: true
  },
  fullSize: {
    k2kXS: "x1tec7hu",
    $$css: true
  },
  pageCanvas: {
    kULEZF: "xvaqoh0",
    kYk0Dm: "xvueqy4",
    kdYMnH: "xesnm00",
    $$css: true
  },
  pageContentInset: {
    kF3gjK: "xkdeioa",
    kJVvJu: "x1w88gy1",
    $$css: true
  },
  pageNoInset: {
    kF3gjK: "xt970qd",
    kJVvJu: "xnjsko4",
    $$css: true
  },
  surface: {
    ku1ltF: "x1fdtg7e",
    kHypHr: "x1u7o2vf",
    kWkggS: "x11gw9ax x9yvj25",
    kKwaWg: "x18o3ruo",
    kl9DO0: "x12koezg",
    k1YJky: "x1y4qj14",
    kz484i: "x182nak8",
    kgSjnq: "x1cwfr1t",
    k4V0xq: "xtsjrx0 x14bdpvh",
    kpvK8V: "xjttvrd x108usdd",
    kffDkL: "x1j8yxcv x1x0u81l",
    kEreRy: "xmmcp6y xjslfuv",
    $$css: true
  },
  topBar: {
    krFJ6x: "xn5uptl",
    kP1A0P: "x1ae7zus",
    kVQ08L: "x8k30ic",
    $$css: true
  },
  topBarActions: {
    kImiAN: "xvc5jky",
    $$css: true
  },
  topBarGlass: {
    k6WDB: "xz687w2 x14hm74v",
    kWkggS: "x1g71ool x9yvj25",
    $$css: true
  },
  topBarSticky: {
    kUvb1J: "xlb5a52",
    kF3gjK: "xh0s0sg",
    kJVvJu: "x10wq4n4",
    kVAEAm: "x7wzq59",
    kY2c9j: "x1nmkd3v",
    $$css: true
  },
  topBarStatic: {
    kF3gjK: "x1dtp59r",
    kJVvJu: "xfmotut",
    $$css: true
  },
  topBarTitle: {
    k63SB2: "x1lvx875",
    kVQacm: "xb3r6kr",
    kg5iWk: "xlyipyv",
    khDVqt: "xuxw1ft",
    $$css: true
  },
  wideSize: {
    k2kXS: "x1bdwxy3",
    $$css: true
  }
};

// src/react/surfaces.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var ditherSurfaceDensityStyles = {
  coarse: ditherSurfaceStyles.coarse,
  fine: ditherSurfaceStyles.fine,
  medium: undefined
};
function DitherSurface({
  className,
  density = "medium",
  xstyle,
  ...props2
}) {
  return /* @__PURE__ */ jsx2(ThemedSurface, {
    ...props2,
    className: cn2("hraness-design-dither-surface", className),
    "data-density": density,
    xstyle: [
      ditherSurfaceStyles.texture,
      ditherSurfaceDensityStyles[density],
      xstyle
    ]
  });
}
function TopBar({
  actions,
  children,
  className,
  leading,
  position = "static",
  surface = "solid",
  title,
  ...props2
}) {
  const rootPresentation = stylex.props(layoutSurfaceStyles.surface, layoutSurfaceStyles.bar, layoutSurfaceStyles.topBar, position === "sticky" ? layoutSurfaceStyles.topBarSticky : layoutSurfaceStyles.topBarStatic, surface === "glass" && layoutSurfaceStyles.topBarGlass);
  const leadingPresentation = stylex.props(layoutSurfaceStyles.barPart);
  const titlePresentation = stylex.props(layoutSurfaceStyles.topBarTitle);
  const contentPresentation = stylex.props(layoutSurfaceStyles.barPart, layoutSurfaceStyles.barContent);
  const actionsPresentation = stylex.props(layoutSurfaceStyles.barPart, layoutSurfaceStyles.topBarActions);
  return /* @__PURE__ */ jsxs2("header", {
    ...rootPresentation,
    ...props2,
    className: cn2("hraness-design-top-bar", rootPresentation.className, className),
    "data-position": position,
    "data-surface": surface,
    children: [
      /* @__PURE__ */ jsxs2("div", {
        ...leadingPresentation,
        className: cn2("hraness-design-top-bar__leading", leadingPresentation.className),
        children: [
          leading,
          title === undefined ? null : /* @__PURE__ */ jsx2("div", {
            ...titlePresentation,
            className: cn2("hraness-design-top-bar__title", titlePresentation.className),
            children: title
          })
        ]
      }),
      children === undefined ? null : /* @__PURE__ */ jsx2("div", {
        ...contentPresentation,
        className: cn2("hraness-design-top-bar__content", contentPresentation.className),
        children
      }),
      actions === undefined ? null : /* @__PURE__ */ jsx2("div", {
        ...actionsPresentation,
        className: cn2("hraness-design-top-bar__actions", actionsPresentation.className),
        children: actions
      })
    ]
  });
}
function BottomBar({
  actions,
  children,
  className,
  leading,
  ...props2
}) {
  const rootPresentation = stylex.props(layoutSurfaceStyles.surface, layoutSurfaceStyles.bar, layoutSurfaceStyles.bottomBar);
  const leadingPresentation = stylex.props(layoutSurfaceStyles.barPart);
  const contentPresentation = stylex.props(layoutSurfaceStyles.barPart, layoutSurfaceStyles.barContent);
  const actionsPresentation = stylex.props(layoutSurfaceStyles.barPart);
  return /* @__PURE__ */ jsxs2("footer", {
    ...rootPresentation,
    ...props2,
    className: cn2("hraness-design-bottom-bar", rootPresentation.className, className),
    children: [
      leading === undefined ? null : /* @__PURE__ */ jsx2("div", {
        ...leadingPresentation,
        className: cn2("hraness-design-bottom-bar__leading", leadingPresentation.className),
        children: leading
      }),
      /* @__PURE__ */ jsx2("div", {
        ...contentPresentation,
        className: cn2("hraness-design-bottom-bar__content", contentPresentation.className),
        children
      }),
      actions === undefined ? null : /* @__PURE__ */ jsx2("div", {
        ...actionsPresentation,
        className: cn2("hraness-design-bottom-bar__actions", actionsPresentation.className),
        children: actions
      })
    ]
  });
}
function PageCanvas({
  as = "main",
  className,
  inset = "content",
  size = "default",
  ...props2
}) {
  const Element = as;
  const presentation = stylex.props(layoutSurfaceStyles.pageCanvas, inset === "content" ? layoutSurfaceStyles.pageContentInset : layoutSurfaceStyles.pageNoInset, size === "wide" && layoutSurfaceStyles.wideSize, size === "full" && layoutSurfaceStyles.fullSize);
  return /* @__PURE__ */ jsx2(Element, {
    ...presentation,
    ...props2,
    className: cn2("hraness-design-page-canvas", presentation.className, className),
    "data-inset": inset,
    "data-size": size
  });
}
var DockedFooter = forwardRef(function DockedFooter2({
  children,
  className,
  contentClassName,
  density = "default",
  inset = "content",
  position = "fixed",
  size = "default",
  surface = "solid",
  ...props2
}, ref) {
  const rootPresentation = stylex.props(layoutSurfaceStyles.surface, layoutSurfaceStyles.dockedFooter, position === "absolute" ? layoutSurfaceStyles.dockedAbsolute : position === "sticky" ? layoutSurfaceStyles.dockedSticky : layoutSurfaceStyles.dockedFixed);
  const contentPresentation = stylex.props(layoutSurfaceStyles.dockedContent, density === "compact" ? inset === "content" ? layoutSurfaceStyles.dockedContentCompactInset : layoutSurfaceStyles.dockedContentCompactNoInset : inset === "content" ? layoutSurfaceStyles.dockedContentDefaultInset : layoutSurfaceStyles.dockedContentDefaultNoInset, size === "wide" && layoutSurfaceStyles.wideSize, size === "full" && layoutSurfaceStyles.fullSize);
  return /* @__PURE__ */ jsx2("footer", {
    ...rootPresentation,
    ...props2,
    className: cn2("hraness-design-docked-footer", rootPresentation.className, className),
    "data-position": position,
    "data-surface": surface,
    ref,
    children: /* @__PURE__ */ jsx2("div", {
      ...contentPresentation,
      className: cn2("hraness-design-docked-footer__content", contentPresentation.className, contentClassName),
      "data-density": density,
      "data-inset": inset,
      "data-size": size,
      children
    })
  });
});

// src/react/syntax-code.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
function SyntaxCode({
  className,
  code,
  language
}) {
  const highlighted = highlightCode(code, language);
  const classes = className === undefined ? highlighted.className : `${highlighted.className} ${className}`;
  return /* @__PURE__ */ jsx3("code", {
    className: classes,
    "data-language": highlighted.language,
    dangerouslySetInnerHTML: { __html: highlighted.html }
  });
}

// src/react/particle-halo.tsx
import { cn as cn3 } from "@hraness/ui";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var colorVariables2 = {
  highlight: "var(--hraness-design-procedural-highlight)",
  key: "var(--hraness-design-procedural-key)",
  shadow: "var(--hraness-design-procedural-shadow)",
  support: "var(--hraness-design-procedural-support)"
};
function ParticleHalo({
  children,
  className,
  palette,
  seed,
  style,
  variation,
  ...props2
}) {
  const recipe = createParticleHaloRecipe({
    seed,
    ...palette === undefined ? {} : { palette },
    ...variation === undefined ? {} : { variation }
  });
  const rootStyle = {
    ...style,
    "--hraness-design-procedural-highlight": recipe.palette.highlight,
    "--hraness-design-procedural-key": recipe.palette.key,
    "--hraness-design-procedural-shadow": recipe.palette.shadow,
    "--hraness-design-procedural-support": recipe.palette.support
  };
  return /* @__PURE__ */ jsxs3("div", {
    ...props2,
    className: cn3("hraness-design-particle-halo", className),
    "data-recipe-version": recipe.version,
    "data-variation": recipe.variation,
    style: rootStyle,
    children: [
      /* @__PURE__ */ jsx4("span", {
        "aria-hidden": "true",
        className: "hraness-design-particle-halo__particles",
        role: "presentation",
        children: recipe.particles.map((particle, index) => {
          const particleStyle = {
            "--hraness-design-particle-color": colorVariables2[particle.color],
            "--hraness-design-particle-delay": `${particle.delay}ms`,
            "--hraness-design-particle-drift-x": `${particle.driftX}px`,
            "--hraness-design-particle-drift-y": `${particle.driftY}px`,
            "--hraness-design-particle-duration": `${particle.duration}ms`,
            "--hraness-design-particle-opacity": particle.opacity,
            "--hraness-design-particle-size": `${particle.size}px`,
            "--hraness-design-particle-x": `${particle.x}%`,
            "--hraness-design-particle-y": `${particle.y}%`
          };
          return /* @__PURE__ */ jsx4("i", {
            className: "hraness-design-particle-halo__particle",
            style: particleStyle
          }, index);
        })
      }),
      /* @__PURE__ */ jsx4("div", {
        className: "hraness-design-particle-halo__content",
        children
      })
    ]
  });
}

export { proceduralBackdropVariants, proceduralRecipeVersion, createProceduralBackdropRecipe, createParticleHaloRecipe, ProceduralBackdrop, DitherSurface, TopBar, BottomBar, PageCanvas, DockedFooter, SyntaxCode, ParticleHalo };

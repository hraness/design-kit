import * as stylex from "@stylexjs/stylex";

const proceduralCloudDrift = stylex.keyframes({
  "0%": {
    transform:
      "translate3d(-50%, -50%, 0) rotate(var(--hraness-design-procedural-layer-rotation))",
  },
  "100%": {
    transform:
      "translate3d(calc(-50% + var(--hraness-design-procedural-layer-drift-x)), calc(-50% + var(--hraness-design-procedural-layer-drift-y)), 0) rotate(calc(var(--hraness-design-procedural-layer-rotation) + 3deg)) scale(var(--hraness-design-procedural-layer-scale))",
  },
});

const proceduralGridDrift = stylex.keyframes({
  "0%": {
    backgroundPosition:
      "var(--hraness-design-procedural-grid-offset-x) var(--hraness-design-procedural-grid-offset-y), var(--hraness-design-procedural-grid-offset-x) var(--hraness-design-procedural-grid-offset-y)",
  },
  "100%": {
    backgroundPosition:
      "calc(var(--hraness-design-procedural-grid-offset-x) + var(--hraness-design-procedural-grid-size)) calc(var(--hraness-design-procedural-grid-offset-y) + var(--hraness-design-procedural-grid-size)), calc(var(--hraness-design-procedural-grid-offset-x) + var(--hraness-design-procedural-grid-size)) calc(var(--hraness-design-procedural-grid-offset-y) + var(--hraness-design-procedural-grid-size))",
  },
});

const proceduralRippleBreathe = stylex.keyframes({
  "0%": {
    transform: "translate3d(-50%, -50%, 0) scale(0.98)",
  },
  "100%": {
    transform: "translate3d(-50%, -50%, 0) scale(1.025)",
  },
});

const particleHaloDrift = stylex.keyframes({
  "0%": {
    transform: "translate3d(-50%, -50%, 0)",
  },
  "100%": {
    transform:
      "translate3d(calc(-50% + var(--hraness-design-particle-drift-x)), calc(-50% + var(--hraness-design-particle-drift-y)), 0) scale(1.08)",
  },
});

export const effectsStyles = stylex.create({
  auroraBackground: {
    backgroundAttachment: "scroll",
    backgroundClip: "border-box",
    backgroundColor:
      "color-mix(in oklch, var(--background) var(--hraness-design-aurora-background-mix, 86%), transparent)",
    backgroundImage:
      "radial-gradient(ellipse 54% 40% at 16% 24%, color-mix(in oklch, var(--aurora-cyan) var(--hraness-design-aurora-cyan-mix, 26%), transparent) 0%, transparent 62%), radial-gradient(ellipse 52% 38% at 82% 20%, color-mix(in oklch, var(--aurora-gold) var(--hraness-design-aurora-gold-mix, 24%), transparent) 0%, transparent 60%), radial-gradient(ellipse 58% 42% at 58% 76%, color-mix(in oklch, var(--aurora-violet) var(--hraness-design-aurora-violet-mix, 22%), transparent) 0%, transparent 62%), radial-gradient(ellipse 48% 34% at 24% 78%, color-mix(in oklch, var(--aurora-mint) var(--hraness-design-aurora-mint-mix, 20%), transparent) 0%, transparent 58%), none",
    backgroundOrigin: "padding-box",
    backgroundPosition: "0% 0%",
    backgroundRepeat: "repeat",
    backgroundSize: "auto auto",
    display: {
      default: null,
      "@media (forced-colors: active)": "none",
    },
    filter: "saturate(1.08)",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    position: "fixed",
    zIndex: 0,
    "::before": {
      backgroundAttachment: "scroll",
      backgroundClip: "border-box",
      backgroundColor: "transparent",
      backgroundImage:
        "radial-gradient(ellipse 44% 78% at 10% 54%, oklch(0.92 0.07 22 / 0.2) 0%, transparent 78%), radial-gradient(ellipse 44% 78% at 32% 44%, oklch(0.95 0.06 80 / 0.18) 0%, transparent 78%), radial-gradient(ellipse 44% 78% at 54% 54%, oklch(0.94 0.07 158 / 0.18) 0%, transparent 78%), radial-gradient(ellipse 44% 78% at 74% 44%, oklch(0.92 0.07 230 / 0.18) 0%, transparent 78%), radial-gradient(ellipse 44% 78% at 92% 54%, oklch(0.9 0.07 304 / 0.18) 0%, transparent 78%)",
      backgroundOrigin: "padding-box",
      backgroundPosition: "0% 0%",
      backgroundRepeat: "repeat",
      backgroundSize: "auto auto",
      content: '""',
      filter: "blur(56px) saturate(0.98)",
      inset: "-18%",
      opacity: "var(--hraness-design-aurora-before-opacity, 0.84)",
      position: "absolute",
      transform: "translate3d(0, -4vh, 0)",
    },
    "::after": {
      backgroundAttachment: "scroll",
      backgroundClip: "border-box",
      backgroundColor: "transparent",
      backgroundImage:
        "linear-gradient(136deg, transparent 0%, rgb(255 255 255 / 0.16) 18%, transparent 34%), radial-gradient(ellipse 42% 32% at 76% 26%, color-mix(in oklch, var(--aurora-rose) 16%, transparent) 0%, transparent 62%), radial-gradient(ellipse 46% 32% at 22% 54%, color-mix(in oklch, white 16%, transparent) 0%, transparent 64%)",
      backgroundOrigin: "padding-box",
      backgroundPosition: "0% 0%",
      backgroundRepeat: "repeat",
      backgroundSize: "auto auto",
      content: '""',
      filter: "blur(44px)",
      inset: "-10%",
      mixBlendMode: "soft-light",
      opacity: "var(--hraness-design-aurora-after-opacity, 0.36)",
      position: "absolute",
    },
  },
  auroraDots: {
    "--phaser-dots-static-color": "color-mix(in oklch, var(--phaser-dots-accent, oklch(0.572 0.1561 254.537)) 20%, transparent)",
    "--phaser-dots-static-opacity": "0.3",
    "--phaser-dots-trail-color": "var(--phaser-dots-accent, oklch(0.572 0.1561 254.537))",
    "--phaser-dots-trail-opacity": "1",
    display: {
      default: null,
      "@media (forced-colors: active)": "none",
    },
    inset: 0,
    pointerEvents: "none",
    position: "fixed",
    zIndex: 0,
  },
  phaserSlot: {
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
  },
  phaserRoot: {
    zIndex: 0,
  },
  phaserStatic: {
    backgroundImage: "radial-gradient(currentcolor 1px, transparent 1px)",
    backgroundSize: "6px 6px",
  },
  phaserStaticDefault: {
    color: "var(--phaser-dots-static-color, var(--foreground))",
    opacity: "var(--phaser-dots-static-opacity, 0.025)",
  },
  phaserTrail: {
    height: "100%",
    width: "100%",
  },
  phaserTrailDefault: {
    color: "var(--phaser-dots-trail-color, var(--foreground))",
    opacity: "var(--phaser-dots-trail-opacity, 0.25)",
  },
  proceduralRoot: {
    backgroundAttachment: "scroll",
    backgroundClip: "border-box",
    backgroundColor: "var(--background)",
    backgroundImage: "none",
    backgroundOrigin: "padding-box",
    backgroundPosition: "0% 0%",
    backgroundRepeat: "repeat",
    backgroundSize: "auto auto",
    color: "var(--foreground)",
    inset: 0,
    isolation: "isolate",
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
    userSelect: "none",
    zIndex: 0,
  },
  proceduralSlot: {
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
  },
  proceduralAtmosphere: {
    display: {
      default: null,
      "@media (forced-colors: active)": "none",
    },
    zIndex: 0,
  },
  proceduralCloud: {
    animationDelay: "var(--hraness-design-procedural-layer-delay)",
    animationDirection: "alternate",
    animationDuration: "var(--hraness-design-procedural-layer-duration)",
    animationIterationCount: "infinite",
    animationFillMode: "none",
    animationPlayState: "running",
    animationName: {
      default: proceduralCloudDrift,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    animationTimingFunction: "var(--motion-easing-emphasized)",
    backgroundAttachment: "scroll",
    backgroundClip: "border-box",
    backgroundColor: "transparent",
    backgroundImage:
      "radial-gradient(ellipse at center, color-mix(in oklch, var(--hraness-design-procedural-layer-color) 58%, transparent) 0%, color-mix(in oklch, var(--hraness-design-procedural-layer-color) 24%, transparent) 48%, transparent 74%)",
    backgroundOrigin: "padding-box",
    backgroundPosition: "0% 0%",
    backgroundRepeat: "repeat",
    backgroundSize: "auto auto",
    borderRadius: "46% 54% 52% 48% / 58% 44% 56% 42%",
    filter: "blur(var(--hraness-design-procedural-layer-blur))",
    height: "var(--hraness-design-procedural-layer-height)",
    left: "var(--hraness-design-procedural-layer-x)",
    opacity: "var(--hraness-design-procedural-layer-opacity)",
    position: "absolute",
    top: "var(--hraness-design-procedural-layer-y)",
    transform:
      "translate3d(-50%, -50%, 0) rotate(var(--hraness-design-procedural-layer-rotation))",
    width: "var(--hraness-design-procedural-layer-width)",
  },
  proceduralGrid: {
    animationDuration: "18s",
    animationIterationCount: "infinite",
    animationFillMode: "none",
    animationPlayState: "running",
    animationDelay: "0s",
    animationDirection: "normal",
    animationName: {
      default: proceduralGridDrift,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    animationTimingFunction: "linear",
    backgroundImage:
      "linear-gradient(color-mix(in oklch, var(--hraness-design-procedural-support) 44%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--hraness-design-procedural-shadow) 38%, transparent) 1px, transparent 1px)",
    backgroundPosition:
      "var(--hraness-design-procedural-grid-offset-x) var(--hraness-design-procedural-grid-offset-y), var(--hraness-design-procedural-grid-offset-x) var(--hraness-design-procedural-grid-offset-y)",
    backgroundSize:
      "var(--hraness-design-procedural-grid-size) var(--hraness-design-procedural-grid-size)",
    display: {
      default: null,
      "@media (forced-colors: active)": "none",
    },
    inset: "-8%",
    maskImage: "radial-gradient(ellipse at center, black 8%, transparent 78%)",
    opacity: "var(--hraness-design-procedural-grid-opacity)",
    transform:
      "rotate(var(--hraness-design-procedural-grid-rotation)) scale(1.04)",
    WebkitMaskImage:
      "radial-gradient(ellipse at center, black 8%, transparent 78%)",
    zIndex: 1,
  },
  proceduralRipples: {
    display: {
      default: null,
      "@media (forced-colors: active)": "none",
    },
    transform: "rotate(var(--hraness-design-procedural-ripple-rotation))",
    zIndex: 2,
  },
  proceduralRipple: {
    borderImageSource: "none",
    borderImageSlice: "100%",
    borderImageWidth: "1",
    borderImageOutset: "0",
    borderImageRepeat: "stretch",
    animationDelay: "var(--hraness-design-procedural-ripple-delay)",
    animationDirection: "alternate",
    animationDuration: "var(--hraness-design-procedural-ripple-duration)",
    animationIterationCount: "infinite",
    animationFillMode: "none",
    animationPlayState: "running",
    animationName: {
      default: proceduralRippleBreathe,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    animationTimingFunction: "var(--motion-easing-standard)",
    aspectRatio: "1 / var(--hraness-design-procedural-ripple-aspect)",
    borderColor:
      "color-mix(in oklch, var(--hraness-design-procedural-ripple-color) 46%, transparent)",
    borderRadius: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    boxShadow:
      "inset 0 0 24px color-mix(in oklch, var(--hraness-design-procedural-ripple-color) 8%, transparent), 0 0 28px color-mix(in oklch, var(--hraness-design-procedural-ripple-color) 6%, transparent)",
    left: "var(--hraness-design-procedural-ripple-x)",
    opacity: "var(--hraness-design-procedural-ripple-opacity)",
    position: "absolute",
    top: "var(--hraness-design-procedural-ripple-y)",
    transform: "translate3d(-50%, -50%, 0) scale(0.98)",
    width: "var(--hraness-design-procedural-ripple-size)",
  },
  particleRoot: {
    display: "inline-grid",
    isolation: "isolate",
    placeItems: "center",
    position: "relative",
  },
  particleField: {
    display: {
      default: null,
      "@media (forced-colors: active)": "none",
    },
    inset: "-18%",
    overflow: "visible",
    pointerEvents: "none",
    position: "absolute",
    zIndex: 0,
  },
  particle: {
    animationDelay: "var(--hraness-design-particle-delay)",
    animationDirection: "alternate",
    animationDuration: "var(--hraness-design-particle-duration)",
    animationIterationCount: "infinite",
    animationFillMode: "none",
    animationPlayState: "running",
    animationName: {
      default: particleHaloDrift,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    animationTimingFunction: "var(--motion-easing-emphasized)",
    backgroundAttachment: "scroll",
    backgroundClip: "border-box",
    backgroundColor: "var(--hraness-design-particle-color)",
    backgroundImage: "none",
    backgroundOrigin: "padding-box",
    backgroundPosition: "0% 0%",
    backgroundRepeat: "repeat",
    backgroundSize: "auto auto",
    borderRadius: "var(--radius-round)",
    boxShadow:
      "0 0 calc(var(--hraness-design-particle-size) + var(--hraness-design-particle-size)) color-mix(in oklch, var(--hraness-design-particle-color) 34%, transparent)",
    height: "var(--hraness-design-particle-size)",
    left: "var(--hraness-design-particle-x)",
    opacity: "var(--hraness-design-particle-opacity)",
    position: "absolute",
    top: "var(--hraness-design-particle-y)",
    transform: "translate3d(-50%, -50%, 0)",
    width: "var(--hraness-design-particle-size)",
  },
  particleContent: {
    minWidth: 0,
    position: "relative",
    zIndex: 1,
  },
});

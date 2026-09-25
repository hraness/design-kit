import * as stylex from "@stylexjs/stylex";

const forcedColors = "@media (forced-colors: active)";
const reducedTransparency = "@media (prefers-reduced-transparency: reduce)";

export const heroBackdropStyles = stylex.create({
  root: {
    display: "var(--hraness-pattern-decoration, block)",
    position: "absolute",
    inset: 0,
    zIndex: -1,
    overflow: "clip",
    pointerEvents: "none",
    userSelect: "none",
    contain: "paint",
    // Later standalone packages can repeat generic opacity atoms. Keep this
    // component's accessibility state independent of their cascade layers.
    opacity: "var(--_hraness-hero-backdrop-opacity)",
    "--_hraness-hero-backdrop-opacity": { default: "1", [forcedColors]: "0", [reducedTransparency]: "0" },
    maskImage: "linear-gradient(to bottom, black 65%, transparent)",
  },
  atmosphere: {
    position: "absolute",
    inset: "-2rem",
    opacity: 0.24,
    transform: "translate(var(--hraness-hero-drift-x, 0px), var(--hraness-hero-drift-y, 0px))",
    backgroundImage: "radial-gradient(ellipse at 68% 25%, color-mix(in srgb, var(--hraness-material-cool, var(--focus, CanvasText)) 32%, transparent), transparent 60%), radial-gradient(ellipse at 15% 80%, color-mix(in srgb, var(--hraness-material-warm, var(--accent, CanvasText)) 26%, transparent), transparent 65%)",
  },
  center: { backgroundPosition: "50% 50%" },
  east: { backgroundPosition: "100% 25%", backgroundSize: "140% 120%" },
  west: { backgroundPosition: "0px 75%", backgroundSize: "125% 150%" },
  light: {
    position: "absolute",
    inset: 0,
    // A small warm core eases toward the pointer inside fixed ambient washes,
    // so the field reads as daylight rather than a spotlight chasing the cursor.
    backgroundImage: "radial-gradient(ellipse 30% 44% at var(--hraness-hero-light-x, 68%) var(--hraness-hero-light-y, 32%), color-mix(in srgb, var(--hraness-material-warm, var(--accent, CanvasText)) 10%, transparent), transparent 72%), radial-gradient(ellipse 70% 95% at 62% 18%, color-mix(in srgb, var(--hraness-material-warm, var(--accent, CanvasText)) 6%, transparent), transparent 80%), radial-gradient(ellipse 60% 90% at 8% 15%, color-mix(in srgb, var(--hraness-material-cool, var(--focus, CanvasText)) 9%, transparent), transparent 76%)",
  },
});

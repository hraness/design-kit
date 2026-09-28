/** The single authored material recipe. Generate projections; do not fork their strings. */
const spectrum = [
  ["oklch(0.89 0.065 337)", "oklch(0.56 0.16 340)"],
  ["oklch(0.875 0.05 277)", "oklch(0.52 0.15 285)"],
  ["oklch(0.92 0.05 170)", "oklch(0.66 0.14 175)"],
  ["oklch(0.95 0.045 96)", "oklch(0.72 0.13 100)"],
  ["oklch(0.9 0.05 55)", "oklch(0.55 0.15 45)"],
  ["oklch(0.875 0.06 305)", "oklch(0.62 0.16 305)"],
] as const;
const direction = "115deg";
const x = "var(--hraness-foil-x, 50%)";
const y = "var(--hraness-foil-y, 50%)";
const ink = "var(--hraness-foil-text-base, var(--foreground, CanvasText))";
const paper = "var(--background, Canvas)";
const metal = (amount: number) => `color-mix(in oklch, ${ink} ${amount}%, ${paper})`;
const surface = "var(--hraness-foil-surface, var(--surface, var(--background, Canvas)))";

function textImage(resolve: (index: number) => string) {
  const stops = spectrum.map((_, index) => resolve(index));
  const tint = stops.map((stop) => `color-mix(in srgb, ${stop} var(--hraness-foil-reflection, 14%), transparent)`);
  return `var(--hraness-foil-image, radial-gradient(ellipse 24% 85% at ${x} ${y}, ${metal(80)} 0%, transparent 68%), radial-gradient(ellipse 65% 160% at calc(100% - ${x}) calc(100% - ${y}), ${metal(98)} 0%, transparent 72%), linear-gradient(${direction}, ${tint.join(", ")}), linear-gradient(${direction}, ${metal(90)} 0%, ${metal(100)} 24%, ${metal(86)} 39%, ${metal(100)} 56%, ${metal(84)} 82%, ${metal(100)} 100%))`;
}

const stylexStops = Object.fromEntries(spectrum.map(([light, dark], index) => [
  `--_hraness-foil-${index + 1}`,
  { default: `var(--hraness-foil-${index + 1}, ${light})`, "@media (prefers-color-scheme: dark)": `var(--hraness-foil-${index + 1}, ${dark})` },
]));

export const foilMaterial = {
  schema: 1,
  materialVersion: 3,
  direction,
  controller: { inputs: ["--hraness-foil-x", "--hraness-foil-y"], restingPercent: 50, minimumPercent: 8, maximumPercent: 92, responseMs: 85 },
  spectrum: spectrum.map(([light, dark], index) => ({ property: `--hraness-foil-${index + 1}`, light, dark })),
  /** Bordered foil surfaces keep a flat fill under one theme-aware monochrome edge. */
  surfaceFill: surface,
  edge: "var(--hraness-foil-edge, light-dark(black, white))",
  edgeDark: "var(--hraness-foil-edge, white)",
  edgeColor: "var(--_hraness-foil-edge, light-dark(black, white))",
  stylex: { textImage: textImage((index) => `var(--_hraness-foil-${index + 1})`), stops: stylexStops },
  raw: {
    textImage: textImage((index) => {
      const [light, dark] = spectrum[index] ?? ["oklch(1 0 0)", "oklch(0 0 0)"];
      return `var(--hraness-foil-${index + 1}, light-dark(${light}, ${dark}))`;
    }),
  },
  halo: "0 1px 4px color-mix(in srgb, var(--foreground, CanvasText) 12%, transparent)",
  textHalo: "none",
} as const;

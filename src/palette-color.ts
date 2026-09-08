/** sRGB contrast utilities for the authored, opaque palette recipes. */
function channels(hex: string): readonly [number, number, number] {
  if (!/^#[0-9a-f]{6}$/iu.test(hex)) throw new Error("Palette colors must be six-digit hex values.");
  return [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)];
}

export function mixPaletteColor(color: string, toward: string, amount: number): string {
  const target = channels(toward);
  return `#${channels(color).map((value, index) =>
    Math.round(value * (1 - amount) + (target[index] ?? 0) * amount).toString(16).padStart(2, "0")
  ).join("")}`;
}

function luminance(hex: string): number {
  const linearize = (channel: number): number => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const [red, green, blue] = channels(hex);
  return linearize(red) * 0.2126 + linearize(green) * 0.7152 + linearize(blue) * 0.0722;
}

export function paletteContrast(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/** Retain the upstream hue; move toward readable ink only where contrast needs it. */
export function readablePaletteColor(
  color: string,
  toward: string,
  backgrounds: readonly string[],
  minimum: number,
): string {
  for (let step = 0; step <= 100; step += 1) {
    const candidate = mixPaletteColor(color, toward, step / 100);
    if (backgrounds.every((background) => paletteContrast(candidate, background) >= minimum)) return candidate;
  }
  throw new Error("The authored palette cannot meet its contrast contract.");
}

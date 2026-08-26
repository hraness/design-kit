export interface FoilCardPose {
  /** Horizontal highlight origin, expressed as a percentage from the inline start. */
  readonly highlightX: number;
  /** Vertical highlight origin, expressed as a percentage from the block start. */
  readonly highlightY: number;
  /** Rotation around the horizontal axis, in degrees. */
  readonly rotateX: number;
  /** Rotation around the vertical axis, in degrees. */
  readonly rotateY: number;
}

export interface FoilCardSeedPose extends FoilCardPose {
  /** Stable gradient phase, in degrees. */
  readonly spectrumAngle: number;
}

function normalizedSeed(seed: string): string {
  const normalized = seed.trim();
  if (normalized.length === 0) {
    throw new RangeError("A foil card seed must contain a non-whitespace character.");
  }
  return normalized;
}

function rounded(value: number, places = 3): number {
  const scale = 10 ** places;
  const result = Math.round(value * scale) / scale;
  return result === 0 ? 0 : result;
}

function unitFromHash(hash: number): number {
  return hash / 4_294_967_296;
}

function mixedHash(hash: number, salt: number): number {
  let value = (hash ^ salt) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  return (value ^ (value >>> 15)) >>> 0;
}

/**
 * Produces a stable unsigned 32-bit identity for visual variation. This is a
 * presentation hash, not a cryptographic or privacy boundary.
 */
export function hashFoilCardSeed(seed: string): number {
  const normalized = normalizedSeed(seed);
  let hash = 0x811c9dc5;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Returns deterministic, bounded first-paint geometry for a seeded card. */
export function createFoilCardSeedPose(seed: string): FoilCardSeedPose {
  const hash = hashFoilCardSeed(seed);
  const value = (salt: number): number => unitFromHash(mixedHash(hash, salt));

  return {
    highlightX: rounded(38 + value(0x243f6a88) * 24),
    highlightY: rounded(38 + value(0x85a308d3) * 24),
    rotateX: rounded(-1.2 + value(0x13198a2e) * 2.4),
    rotateY: rounded(-1.4 + value(0x03707344) * 2.8),
    spectrumAngle: rounded(value(0xa4093822) * 360),
  };
}

function finiteUnit(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} must be a finite number.`);
  }
  return Math.min(1, Math.max(0, value));
}

/**
 * Maps normalized pointer coordinates to bounded highlight and tilt values.
 * Values outside the card are clamped so event geometry cannot create an
 * unbounded transform.
 */
export function createFoilCardPointerPose(
  normalizedX: number,
  normalizedY: number,
): FoilCardPose {
  const x = finiteUnit(normalizedX, "Foil card pointer x");
  const y = finiteUnit(normalizedY, "Foil card pointer y");

  return {
    highlightX: rounded(x * 100),
    highlightY: rounded(y * 100),
    rotateX: rounded((0.5 - y) * 10),
    rotateY: rounded((x - 0.5) * 12),
  };
}

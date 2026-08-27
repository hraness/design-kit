import { expect, test } from "bun:test";
import * as fc from "fast-check";

import {
  createFoilCardPointerPose,
  createFoilCardSeedPose,
  hashFoilCardSeed,
} from "./foil-card-math";

const nonblankSeed = fc.string({ minLength: 1, maxLength: 128 })
  .filter((seed) => seed.trim().length > 0);

function expectBetween(value: number, minimum: number, maximum: number): void {
  expect(Number.isFinite(value)).toBeTrue();
  expect(value).toBeGreaterThanOrEqual(minimum);
  expect(value).toBeLessThanOrEqual(maximum);
  expect(Object.is(value, -0)).toBeFalse();
}

test("property: seeded foil poses are deterministic, normalized, and bounded", () => {
  fc.assert(fc.property(nonblankSeed, (seed) => {
    const pose = createFoilCardSeedPose(seed);

    expect(createFoilCardSeedPose(seed)).toEqual(pose);
    expect(createFoilCardSeedPose(` \n${seed}\t `)).toEqual(pose);
    expect(hashFoilCardSeed(seed)).toBe(hashFoilCardSeed(seed));
    expectBetween(hashFoilCardSeed(seed), 0, 0xffff_ffff);
    expectBetween(pose.highlightX, 38, 62);
    expectBetween(pose.highlightY, 38, 62);
    expectBetween(pose.rotateX, -1.2, 1.2);
    expectBetween(pose.rotateY, -1.4, 1.4);
    expectBetween(pose.spectrumAngle, 0, 360);
    expect(JSON.parse(JSON.stringify(pose))).toEqual(pose);
  }));
});

test("property: pointer poses clamp arbitrary finite coordinates", () => {
  fc.assert(fc.property(
    fc.double({ max: 1_000_000, min: -1_000_000, noNaN: true }),
    fc.double({ max: 1_000_000, min: -1_000_000, noNaN: true }),
    (x, y) => {
      const pose = createFoilCardPointerPose(x, y);
      expectBetween(pose.highlightX, 0, 100);
      expectBetween(pose.highlightY, 0, 100);
      expectBetween(pose.rotateX, -5, 5);
      expectBetween(pose.rotateY, -6, 6);
      expectBetween(pose.spectrumAngle ?? Number.NaN, 0, 360);

      const clamped = createFoilCardPointerPose(
        Math.min(1, Math.max(0, x)),
        Math.min(1, Math.max(0, y)),
      );
      expect(pose).toEqual(clamped);
    },
  ));
});

test("directional diffraction follows known pointer quadrants", () => {
  expect(createFoilCardPointerPose(0.75, 0.75).spectrumAngle).toBe(135);
  expect(createFoilCardPointerPose(0.25, 0.25).spectrumAngle).toBe(315);
  expect(createFoilCardPointerPose(0.5, 0.5).spectrumAngle).toBe(90);
});

test("foil math rejects ambiguous seeds and non-finite pointer geometry", async () => {
  expect(() => hashFoilCardSeed(" \n\t ")).toThrow(
    "must contain a non-whitespace character",
  );
  expect(() => createFoilCardPointerPose(Number.NaN, 0.5)).toThrow(
    "pointer x must be a finite number",
  );
  expect(() => createFoilCardPointerPose(0.5, Number.POSITIVE_INFINITY)).toThrow(
    "pointer y must be a finite number",
  );

  const source = await Bun.file(new URL("./foil-card-math.ts", import.meta.url)).text();
  expect(source).not.toContain("Math.random");
});

test("a known public seed pins the visual hash and first-paint pose", () => {
  expect(hashFoilCardSeed("public-gallery-foil")).toBe(2_357_987_444);
  expect(createFoilCardSeedPose("public-gallery-foil")).toEqual({
    highlightX: 55.357,
    highlightY: 54.535,
    rotateX: -0.977,
    rotateY: 0.4,
    spectrumAngle: 302.704,
  });
});

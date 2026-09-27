import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  iconManifest,
  iconsModule,
  measureIconSvg,
  type IconManifest,
} from "../scripts/generate-icons";
import { hranessIconAssets } from "./icons.generated";
import {
  hranessIcon,
  hranessIconDataUri,
  hranessIconMarkup,
  hranessIconPath,
  hranessIcons,
  hranessIconsForSet,
  type HranessIconId,
} from "./icons";

const iconsDirectory = join(import.meta.dir, "icons");
const manifestPath = join(iconsDirectory, "manifest.json");

const manifest = JSON.parse(
  await readFile(manifestPath, "utf8"),
) as IconManifest;

test("manifest, files, and generated module cover exactly the same icons", async () => {
  const manifestIds = manifest.icons.map(icon => icon.id).sort();
  const moduleIds = Object.keys(hranessIconAssets).sort();
  expect(manifestIds).toEqual(moduleIds);
  for (const icon of manifest.icons) {
    const svg = await readFile(join(iconsDirectory, icon.file), "utf8");
    expect(createHash("sha256").update(svg).digest("hex")).toBe(
      icon.svgSha256,
    );
  }
});

test(
  "generated module and manifest stay fresh after measurement",
  async () => {
    const recomputed = await iconManifest();
    expect(recomputed).toEqual(manifest);
    expect(await iconsModule(recomputed)).toBe(
      await readFile(join(import.meta.dir, "icons.generated.ts"), "utf8"),
    );
  },
  300_000,
);

test("every admitted icon measures inside its declared context bounds", () => {
  for (const icon of manifest.icons) {
    expect(icon.metrics.aspectRatio).toBeLessThanOrEqual(1.8);
    expect(icon.metrics.coverageRatio).toBeGreaterThanOrEqual(0.05);
    expect(icon.metrics.coverageRatio).toBeLessThanOrEqual(icon.purpose === "mark" ? 0.72 : 0.65);
    expect(icon.metrics.pathCount).toBeLessThanOrEqual(icon.purpose === "mark" ? 16 : 96);
    expect(icon.bytes).toBeLessThanOrEqual(96_000);
    expect(icon.viewBox).toMatch(/^0 0 \d/u);
    expect(icon.ink).toMatch(/^#[0-9a-f]{6}$/u);
  }
});

test(
  "admitted artwork is self-contained single-ink vector geometry",
  async () => {
    for (const icon of manifest.icons) {
      const svg = await readFile(join(iconsDirectory, icon.file), "utf8");
      expect(svg).not.toMatch(
        /<script|on[a-z]+\s*=|javascript:|href=|url\(|<image|<foreignObject|<iframe|<use/iu,
      );
      const colors = new Set(
        [...svg.matchAll(/(?:fill|stroke)="([^"]+)"/gu)]
          .map(match => (match[1] ?? "").toLowerCase())
          .filter(color => color !== "none"),
      );
      expect([...colors]).toEqual([icon.ink]);
      expect(measureIconSvg(svg).ink).toBe(icon.ink);
    }
  },
  300_000,
);

test("each set reads as one measured family", () => {
  const bySet = new Map<string, number[]>();
  for (const icon of manifest.icons) {
    const list = bySet.get(icon.set) ?? [];
    list.push(icon.metrics.coverageRatio);
    bySet.set(icon.set, list);
  }
  for (const [set, coverages] of bySet) {
    if (coverages.length < 3) continue;
    const sorted = [...coverages].sort((a, b) => a - b);
    const spread = (sorted[sorted.length - 1] ?? 1) / (sorted[0] ?? 1);
    expect(spread, `set "${set}" density spread`).toBeLessThan(2.2);
  }
});

test("registry helpers resolve every admitted icon", () => {
  for (const icon of manifest.icons) {
    const resolved = hranessIcon(icon.id as HranessIconId);
    expect(resolved.subject.length).toBeGreaterThan(0);
    expect(hranessIconMarkup(icon.id as HranessIconId)).toContain("<svg");
    expect(hranessIconMarkup(icon.id as HranessIconId)).toContain(resolved.body);
    expect(hranessIconDataUri(icon.id as HranessIconId)).toMatch(/^data:image\/svg\+xml,/u);
    expect(hranessIconPath(icon.id as HranessIconId)).toBe(`icons/${icon.file}`);
  }
  expect(hranessIcons.map(icon => icon.id)).toEqual(
    [...hranessIcons.map(icon => icon.id)].sort(),
  );
  for (const icon of manifest.icons) {
    const set = hranessIconsForSet(icon.set);
    expect(set.every(member => member.set === icon.set)).toBe(true);
  }
});

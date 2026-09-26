import { hranessIconAssets, type HranessIconAsset } from "./icons.generated.js";

/**
 * Shared vetted Hraness icon library. Every admitted icon is generated as a
 * member of a measured family by slopcamera `image icon --set`, then pinned
 * in `src/icons/manifest.json` by byte hash and per-context/family metric
 * bounds (scripts/generate-icons.ts, enforced by icons.test.ts). Products
 * consume either the raw file (`@hraness/design-kit/icons/<file>`) or this
 * module's typed artwork (`body` + `viewBox`, or `hranessIconMarkup`).
 */

export type HranessIconContext = "card" | "hero" | "inline";
export type HranessIconId = keyof typeof hranessIconAssets;
export type HranessIconPurpose = "illustration" | "mark";
export type HranessIconSet = HranessIconAsset["set"];

export interface HranessIcon extends HranessIconAsset {
  readonly id: HranessIconId;
}

export const hranessIcons: readonly HranessIcon[] = (
  Object.keys(hranessIconAssets) as HranessIconId[]
)
  .sort()
  .map(id => ({ ...(hranessIconAssets[id] as HranessIconAsset), id }));

export function hranessIcon(id: HranessIconId): HranessIcon {
  const asset: HranessIconAsset = hranessIconAssets[id];
  return { ...asset, id };
}

/** All admitted icons in one generated family, sorted by id. */
export function hranessIconsForSet(set: string): readonly HranessIcon[] {
  return hranessIcons.filter(icon => icon.set === set);
}

/** Complete standalone `<svg>` markup for inline rendering. */
export function hranessIconMarkup(id: HranessIconId): string {
  const icon = hranessIcon(id);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}" role="img">${icon.body}</svg>`;
}

/** `data:image/svg+xml` URI for `<img>` sources or CSS `url()` values. */
export function hranessIconDataUri(id: HranessIconId): string {
  return `data:image/svg+xml,${encodeURIComponent(hranessIconMarkup(id))}`;
}

/** Package-relative asset path inside the `./icons/*` export. */
export function hranessIconPath(id: HranessIconId): string {
  return `icons/${hranessIcon(id).file}`;
}

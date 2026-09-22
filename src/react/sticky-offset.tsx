"use client";

import { useEffect } from "react";

import {
  measureStickyOffset,
  publishStickyOffset,
  stickyOffsetCustomProperty,
  stickyOffsetHeaderSelector,
  syncStickyOffset,
} from "../browser/sticky-offset.js";

export type { StickyOffsetSyncOptions } from "../browser/sticky-offset.js";
export {
  measureStickyOffset,
  publishStickyOffset,
  stickyOffsetCustomProperty,
  stickyOffsetHeaderSelector,
  syncStickyOffset,
};

/**
 * Measure sticky marketing chrome and publish --hraness-sticky-offset. Render
 * once beside the site header; the helper does not run on module import.
 */
export function StickyOffsetSync({
  header,
}: Readonly<{
  header?: string;
}> = {}) {
  useEffect(() => syncStickyOffset({ header }), [header]);
  return null;
}

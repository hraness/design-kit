"use client";

import type { ReactNode } from "react";

/** @deprecated Hero backdrops are retired; `HeroBackdrop` renders nothing. */
export interface HeroBackdropProps {
  /** @deprecated Ignored. */
  readonly seed: string;
  /** @deprecated Ignored. Decorative artwork no longer renders; put real product proof in the hero `frame`. */
  readonly children?: ReactNode;
}

/**
 * @deprecated Retired with the Quiet marketing direction. The component stays
 * exported so existing callers compile, but it renders nothing: no light
 * field, drift, blur, or product artwork. Remove it when convenient and show
 * real product proof in `ProductHero`'s `frame` instead.
 */
export function HeroBackdrop(props: HeroBackdropProps): null {
  void props;
  return null;
}

"use client";

import { createElement, useEffect, useRef, version, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { attachHeroLight } from "../browser/hero-light.js";
import { heroBackdropStyles } from "./hero-backdrop.stylex.js";

export interface HeroBackdropProps {
  /** Stable product/route identity. Never use random values during render. */
  readonly seed: string;
  /** Optional product artwork. Decorative only: meaningful proof belongs in the hero frame. */
  readonly children?: ReactNode;
}

/** Consistent light, stacking and motion custody around product-owned artwork.
 * Its containing hero must establish position:relative and isolation:isolate. */
export function HeroBackdrop({ seed, children }: HeroBackdropProps) {
  const variation = [...seed].reduce((value, character) => (Math.imul(value, 31) + character.charCodeAt(0)) >>> 0, 0) % 3;
  const variationName = variation === 1 ? "east" : variation === 2 ? "west" : "center";
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const hero = ref.current?.parentElement;
    if (hero) return attachHeroLight(hero);
    return undefined;
  }, []);
  return createElement("div", {
    className: ["hraness-marketing-hero-backdrop", stylex.props(heroBackdropStyles.root).className].filter(Boolean).join(" "),
    ref,
    "aria-hidden": true,
    // React 18 forwards this as an unknown string attribute; React 19 treats it
    // as a native boolean. Both must emit inert before hydration.
    inert: version.startsWith("18.") ? "" : true,
    "data-hraness-hero-backdrop": "",
  },
  children ?? <div data-variation={variationName} className={["hraness-marketing-hero-backdrop__atmosphere", stylex.props(heroBackdropStyles.atmosphere, variation === 1 ? heroBackdropStyles.east : variation === 2 ? heroBackdropStyles.west : heroBackdropStyles.center).className].filter(Boolean).join(" ")} />,
  <span className={["hraness-marketing-hero-backdrop__light", stylex.props(heroBackdropStyles.light).className].filter(Boolean).join(" ")} />);
}

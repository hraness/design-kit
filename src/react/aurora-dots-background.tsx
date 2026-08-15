"use client";

import { PhaserDots } from "./phaser-dots.js";

/** The shared fixed aurora canvas and interactive 6 px dot grid. */
export function AuroraDotsBackground() {
  return (
    <>
      <div aria-hidden="true" className="hraness-design-aurora-background" />
      <div aria-hidden="true" className="hraness-design-aurora-dots">
        <PhaserDots mouseGlow />
      </div>
    </>
  );
}

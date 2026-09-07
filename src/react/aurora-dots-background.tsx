"use client";

import { cn } from "@hraness/ui";
import * as stylex from "@stylexjs/stylex";

import { effectsStyles } from "./effects.stylex.js";
import { PhaserDots } from "./phaser-dots.js";

/** The shared fixed aurora canvas and interactive 6 px dot grid. */
export function AuroraDotsBackground() {
  const backgroundPresentation = stylex.props(effectsStyles.auroraBackground);
  const dotsPresentation = stylex.props(effectsStyles.auroraDots);

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "hraness-design-aurora-background",
          backgroundPresentation.className,
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "hraness-design-aurora-dots",
          dotsPresentation.className,
        )}
      >
        <PhaserDots mouseGlow />
      </div>
    </>
  );
}

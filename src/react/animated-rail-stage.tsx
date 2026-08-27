"use client";

import { AnimatePresence, motion as Motion, useReducedMotion } from "motion/react";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { motion } from "../index.js";
import { cn } from "@hraness/ui";
import { animatedRailStageStyles } from "./animated-rail-stage.stylex.js";

export interface AnimatedRailStageProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly stageKey: string | number;
}

export function railStageMotion(reduceMotion: boolean) {
  const duration = reduceMotion ? 0 : motion.duration.standard / 1_000;
  return {
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduceMotion ? 0 : -motion.distance.railExit },
    initial: { opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : motion.distance.railEnter },
    transition: { duration, ease: "easeOut" as const },
  } as const;
}

/** Animates only the changing rail stage while the surrounding shell persists. */
export function AnimatedRailStage({ children, className, stageKey }: AnimatedRailStageProps) {
  const reduceMotion = useReducedMotion();
  const stageMotion = railStageMotion(reduceMotion ?? false);
  const presentation = stylex.props(animatedRailStageStyles.root);
  return (
    <AnimatePresence initial={false} mode="wait">
      <Motion.div
        animate={stageMotion.animate}
        className={cn(
          "hraness-design-animated-rail-stage",
          presentation.className,
          className,
        )}
        data-stage-key={String(stageKey)}
        exit={stageMotion.exit}
        initial={stageMotion.initial}
        key={stageKey}
        transition={stageMotion.transition}
      >
        {children}
      </Motion.div>
    </AnimatePresence>
  );
}

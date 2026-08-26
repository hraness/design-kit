"use client";

import * as stylex from "@stylexjs/stylex";
import { cn } from "@hraness/ui";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import {
  createFoilCardPointerPose,
  createFoilCardSeedPose,
  type FoilCardPose,
} from "./foil-card-math.js";
import { foilCardSurfaceStyles as styles } from "./foil-card-surface.stylex.js";

export const foilCardPresets = [
  "prism",
  "aurora",
  "etched",
  "gold",
  "fast",
  "max",
] as const;
export const foilCardIntensities = ["subtle", "standard", "vivid"] as const;
export const foilCardRenderModes = ["interactive", "static"] as const;

export type FoilCardPreset = (typeof foilCardPresets)[number];
export type FoilCardIntensity = (typeof foilCardIntensities)[number];
export type FoilCardRenderMode = (typeof foilCardRenderModes)[number];

export interface FoilCardSurfaceProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly intensity: FoilCardIntensity;
  readonly preset: FoilCardPreset;
  readonly renderMode: FoilCardRenderMode;
  readonly seed: string;
}

type FoilCustomProperties = CSSProperties & Readonly<{
  "--foil-light-x": string;
  "--foil-light-y": string;
  "--foil-rotate-x": string;
  "--foil-rotate-y": string;
  "--foil-spectrum-angle": string;
}>;

const presetStyles = {
  aurora: {
    base: styles.auroraBase,
    spectrum: styles.auroraSpectrum,
    texture: styles.auroraTexture,
  },
  etched: {
    base: styles.etchedBase,
    spectrum: styles.etchedSpectrum,
    texture: styles.etchedTexture,
  },
  fast: {
    base: styles.fastBase,
    spectrum: styles.fastSpectrum,
    texture: styles.fastTexture,
  },
  gold: {
    base: styles.goldBase,
    spectrum: styles.goldSpectrum,
    texture: styles.goldTexture,
  },
  max: {
    base: styles.maxBase,
    spectrum: styles.maxSpectrum,
    texture: styles.maxTexture,
  },
  prism: {
    base: styles.prismBase,
    spectrum: styles.prismSpectrum,
    texture: styles.prismTexture,
  },
} as const;

const intensityStyles = {
  subtle: {
    base: styles.baseSubtle,
    sheen: styles.sheenSubtle,
    spectrum: styles.spectrumSubtle,
    texture: styles.textureSubtle,
  },
  standard: {
    base: styles.baseStandard,
    sheen: styles.sheenStandard,
    spectrum: styles.spectrumStandard,
    texture: styles.textureStandard,
  },
  vivid: {
    base: styles.baseVivid,
    sheen: styles.sheenVivid,
    spectrum: styles.spectrumVivid,
    texture: styles.textureVivid,
  },
} as const;

function poseStyle(seed: string): FoilCustomProperties {
  const pose = createFoilCardSeedPose(seed);
  return {
    "--foil-light-x": `${String(pose.highlightX)}%`,
    "--foil-light-y": `${String(pose.highlightY)}%`,
    "--foil-rotate-x": `${String(pose.rotateX)}deg`,
    "--foil-rotate-y": `${String(pose.rotateY)}deg`,
    "--foil-spectrum-angle": `${String(pose.spectrumAngle)}deg`,
  };
}

function applyPose(element: HTMLElement, pose: FoilCardPose): void {
  element.style.setProperty("--foil-light-x", `${String(pose.highlightX)}%`);
  element.style.setProperty("--foil-light-y", `${String(pose.highlightY)}%`);
  element.style.setProperty("--foil-rotate-x", `${String(pose.rotateX)}deg`);
  element.style.setProperty("--foil-rotate-y", `${String(pose.rotateY)}deg`);
}

function requirePublicValue(
  value: string,
  supported: readonly string[],
  label: string,
): void {
  if (!supported.includes(value)) {
    throw new RangeError(`Unsupported foil card ${label}: ${value}.`);
  }
}

/**
 * Adds deterministic foil paint around ordinary semantic descendants. The
 * component never turns its children into a canvas or interaction surrogate.
 */
export function FoilCardSurface({
  children,
  className,
  intensity,
  preset,
  renderMode,
  seed,
}: FoilCardSurfaceProps) {
  requirePublicValue(intensity, foilCardIntensities, "intensity");
  requirePublicValue(preset, foilCardPresets, "preset");
  requirePublicValue(renderMode, foilCardRenderModes, "render mode");
  const rootRef = useRef<HTMLDivElement>(null);
  const seededStyle = poseStyle(seed);
  const selectedPreset = presetStyles[preset];
  const selectedIntensity = intensityStyles[intensity];
  const rootPresentation = stylex.props(
    styles.base,
    renderMode === "interactive" ? styles.interactive : styles.static,
  );
  const basePresentation = stylex.props(
    styles.layer,
    styles.baseLayer,
    selectedPreset.base,
    selectedIntensity.base,
  );
  const spectrumPresentation = stylex.props(
    styles.layer,
    styles.spectrumLayer,
    selectedPreset.spectrum,
    selectedIntensity.spectrum,
  );
  const sheenPresentation = stylex.props(
    styles.layer,
    styles.sheenLayer,
    selectedIntensity.sheen,
  );
  const texturePresentation = stylex.props(
    styles.layer,
    styles.textureLayer,
    selectedPreset.texture,
    selectedIntensity.texture,
  );
  const contentPresentation = stylex.props(styles.content);

  useEffect(() => {
    if (renderMode !== "interactive") return;
    const root = rootRef.current;
    if (root === null) return;
    if (
      typeof window.matchMedia !== "function"
      || typeof window.requestAnimationFrame !== "function"
      || typeof window.cancelAnimationFrame !== "function"
    ) {
      return;
    }

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    if (!finePointer.matches || reducedMotion.matches || forcedColors.matches) return;

    const seedPose = createFoilCardSeedPose(seed);
    let frame: number | null = null;
    let pendingInteraction:
      | Readonly<{ clientX: number; clientY: number; kind: "pointer" }>
      | Readonly<{ kind: "pose"; pose: FoilCardPose }>
      | null = null;

    const renderPendingInteraction = (): void => {
      frame = null;
      const interaction = pendingInteraction;
      pendingInteraction = null;
      if (interaction === null) return;
      if (interaction.kind === "pose") {
        applyPose(root, interaction.pose);
        return;
      }
      const bounds = root.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      applyPose(root, createFoilCardPointerPose(
        (interaction.clientX - bounds.left) / bounds.width,
        (interaction.clientY - bounds.top) / bounds.height,
      ));
    };
    const scheduleInteraction = (
      interaction: Exclude<typeof pendingInteraction, null>,
    ): void => {
      pendingInteraction = interaction;
      if (frame === null) {
        frame = window.requestAnimationFrame(renderPendingInteraction);
      }
    };
    const handlePointerMove = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      scheduleInteraction({
        clientX: event.clientX,
        clientY: event.clientY,
        kind: "pointer",
      });
    };
    const handlePointerLeave = (event: PointerEvent): void => {
      if (event.pointerType === "mouse") {
        scheduleInteraction({ kind: "pose", pose: seedPose });
      }
    };

    root.addEventListener("pointermove", handlePointerMove, { passive: true });
    root.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [renderMode, seed]);

  return (
    <div
      {...rootPresentation}
      className={cn(
        "hraness-design-foil-card-surface",
        rootPresentation.className,
        className,
      )}
      data-foil-intensity={intensity}
      data-foil-preset={preset}
      data-foil-render-mode={renderMode}
      ref={rootRef}
      style={seededStyle}
    >
      <span {...basePresentation} aria-hidden="true" />
      <div {...contentPresentation}>{children}</div>
      <span {...spectrumPresentation} aria-hidden="true" />
      <span {...sheenPresentation} aria-hidden="true" />
      <span {...texturePresentation} aria-hidden="true" />
    </div>
  );
}

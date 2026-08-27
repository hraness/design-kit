"use client";

import * as stylex from "@stylexjs/stylex";
import { cn } from "@hraness/ui";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

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
export const foilCardOrnaments = [
  "none",
  "corners",
  "rails",
  "circuit",
  "radial",
  "facets",
] as const;

export type FoilCardPreset = (typeof foilCardPresets)[number];
export type FoilCardIntensity = (typeof foilCardIntensities)[number];
export type FoilCardRenderMode = (typeof foilCardRenderModes)[number];
export type FoilCardOrnament = (typeof foilCardOrnaments)[number];

export interface FoilCardSurfaceProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly intensity: FoilCardIntensity;
  /** Product-neutral edge treatment. Defaults to `none`. */
  readonly ornament?: FoilCardOrnament;
  readonly preset: FoilCardPreset;
  readonly renderMode: FoilCardRenderMode;
  readonly seed: string;
}

export interface FoilCardDeckProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  readonly children: ReactNode;
}

type FoilCustomProperties = CSSProperties & Readonly<{
  "--foil-light-x": string;
  "--foil-light-y": string;
  "--foil-rotate-x": string;
  "--foil-rotate-y": string;
  "--foil-spectrum-angle": string;
  "--foil-activity": string;
  "--foil-base-opacity": string;
  "--foil-spectrum-opacity": string;
  "--foil-sheen-opacity": string;
  "--foil-texture-opacity": string;
  "--foil-ornament-opacity": string;
}>;

interface FoilDeckRegistration {
  readonly activeClassName: string | undefined;
  readonly seedPose: FoilCardPose;
}

interface FoilDeckContextValue {
  readonly register: (
    element: HTMLElement,
    registration: FoilDeckRegistration,
  ) => () => void;
}

type PendingDeckInteraction =
  | Readonly<{ clientX: number; clientY: number; element: HTMLElement; kind: "pointer" }>
  | Readonly<{ element: HTMLElement; kind: "reset" }>;

const FoilDeckContext = createContext<FoilDeckContextValue | null>(null);
const delegatedSurfaceSelector =
  ".hraness-design-foil-card-surface[data-foil-controller='deck']";

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
    ornament: styles.ornamentSubtle,
  },
  standard: {
    base: styles.baseStandard,
    sheen: styles.sheenStandard,
    spectrum: styles.spectrumStandard,
    texture: styles.textureStandard,
    ornament: styles.ornamentStandard,
  },
  vivid: {
    base: styles.baseVivid,
    sheen: styles.sheenVivid,
    spectrum: styles.spectrumVivid,
    texture: styles.textureVivid,
    ornament: styles.ornamentVivid,
  },
} as const;

const ornamentStyles = {
  circuit: styles.ornamentCircuit,
  corners: styles.ornamentCorners,
  facets: styles.ornamentFacets,
  none: styles.ornamentNone,
  radial: styles.ornamentRadial,
  rails: styles.ornamentRails,
} as const;

const foilOpacityByIntensity = {
  subtle: {
    active: { base: 0.52, ornament: 0.46, sheen: 0.22, spectrum: 0.28, texture: 0.1 },
    idle: { base: 0.34, ornament: 0.14, sheen: 0.03, spectrum: 0.08, texture: 0.04 },
  },
  standard: {
    active: { base: 0.68, ornament: 0.66, sheen: 0.35, spectrum: 0.42, texture: 0.16 },
    idle: { base: 0.44, ornament: 0.2, sheen: 0.04, spectrum: 0.12, texture: 0.06 },
  },
  vivid: {
    active: { base: 0.84, ornament: 0.88, sheen: 0.52, spectrum: 0.6, texture: 0.24 },
    idle: { base: 0.56, ornament: 0.26, sheen: 0.06, spectrum: 0.18, texture: 0.08 },
  },
} as const;

function poseStyle(
  pose: FoilCardPose,
  intensity: FoilCardIntensity,
): FoilCustomProperties {
  const opacity = foilOpacityByIntensity[intensity].idle;
  return {
    "--foil-activity": "0",
    "--foil-base-opacity": String(opacity.base),
    "--foil-light-x": `${String(pose.highlightX)}%`,
    "--foil-light-y": `${String(pose.highlightY)}%`,
    "--foil-rotate-x": `${String(pose.rotateX)}deg`,
    "--foil-rotate-y": `${String(pose.rotateY)}deg`,
    "--foil-ornament-opacity": String(opacity.ornament),
    "--foil-sheen-opacity": String(opacity.sheen),
    "--foil-spectrum-opacity": String(opacity.spectrum),
    "--foil-spectrum-angle": `${String(pose.spectrumAngle ?? 0)}deg`,
    "--foil-texture-opacity": String(opacity.texture),
  };
}

function applyPose(element: HTMLElement, pose: FoilCardPose): void {
  element.style.setProperty("--foil-light-x", `${String(pose.highlightX)}%`);
  element.style.setProperty("--foil-light-y", `${String(pose.highlightY)}%`);
  element.style.setProperty("--foil-rotate-x", `${String(pose.rotateX)}deg`);
  element.style.setProperty("--foil-rotate-y", `${String(pose.rotateY)}deg`);
  if (pose.spectrumAngle !== undefined) {
    element.style.setProperty(
      "--foil-spectrum-angle",
      `${String(pose.spectrumAngle)}deg`,
    );
  }
}

function focusPose(seedPose: FoilCardPose): FoilCardPose {
  const pose: FoilCardPose = {
    highlightX: seedPose.highlightX,
    highlightY: seedPose.highlightY,
    rotateX: 0,
    rotateY: 0,
  };
  return seedPose.spectrumAngle === undefined
    ? pose
    : { ...pose, spectrumAngle: seedPose.spectrumAngle };
}

function setActive(
  element: HTMLElement,
  activeClassName: string | undefined,
  active: boolean,
): void {
  const intensity = element.getAttribute("data-foil-intensity");
  const selectedIntensity = intensity !== null && intensity in foilOpacityByIntensity
    ? intensity as FoilCardIntensity
    : "standard";
  const opacity = foilOpacityByIntensity[selectedIntensity][active ? "active" : "idle"];
  element.style.setProperty("--foil-activity", active ? "1" : "0");
  element.style.setProperty("--foil-base-opacity", String(opacity.base));
  element.style.setProperty("--foil-spectrum-opacity", String(opacity.spectrum));
  element.style.setProperty("--foil-sheen-opacity", String(opacity.sheen));
  element.style.setProperty("--foil-texture-opacity", String(opacity.texture));
  element.style.setProperty("--foil-ornament-opacity", String(opacity.ornament));
  if (active) element.setAttribute("data-foil-active", "true");
  else element.removeAttribute("data-foil-active");
  if (activeClassName !== undefined) {
    for (const className of activeClassName.split(/\s+/u)) {
      if (className.length > 0) element.classList.toggle(className, active);
    }
  }
}

function motionIsEnabled(
  finePointer: MediaQueryList,
  reducedMotion: MediaQueryList,
  forcedColors: MediaQueryList,
): boolean {
  return finePointer.matches && !reducedMotion.matches && !forcedColors.matches;
}

function addMediaListener(media: MediaQueryList, listener: () => void): () => void {
  if (typeof media.addEventListener !== "function") return () => undefined;
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

/**
 * Delegates pointer-driven foil paint for a card collection to one controller.
 * Descendant surfaces remain ordinary semantic DOM and automatically opt in.
 */
export function FoilCardDeck({
  children,
  className,
  ...props
}: FoilCardDeckProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const registrations = useRef(new Map<HTMLElement, FoilDeckRegistration>());
  const activeElement = useRef<HTMLElement | null>(null);
  const focusedElement = useRef<HTMLElement | null>(null);
  const pointerElement = useRef<HTMLElement | null>(null);
  const activeBounds = useRef<DOMRect | null>(null);
  const pendingInteraction = useRef<PendingDeckInteraction | null>(null);
  const frame = useRef<number | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  const deactivate = useCallback((element: HTMLElement): void => {
    const registration = registrations.current.get(element);
    if (registration !== undefined) {
      applyPose(element, registration.seedPose);
      setActive(element, registration.activeClassName, false);
    }
    if (activeElement.current === element) {
      resizeObserver.current?.unobserve(element);
      activeElement.current = null;
      activeBounds.current = null;
    }
  }, []);

  const register = useCallback((
    element: HTMLElement,
    registration: FoilDeckRegistration,
  ): (() => void) => {
    registrations.current.set(element, registration);
    return () => {
      if (pendingInteraction.current?.element === element) {
        pendingInteraction.current = null;
      }
      if (focusedElement.current === element) focusedElement.current = null;
      if (pointerElement.current === element) pointerElement.current = null;
      deactivate(element);
      registrations.current.delete(element);
    };
  }, [deactivate]);

  const contextValue = useMemo<FoilDeckContextValue>(
    () => ({ register }),
    [register],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (
      root === null
      || typeof window.matchMedia !== "function"
      || typeof window.requestAnimationFrame !== "function"
      || typeof window.cancelAnimationFrame !== "function"
    ) {
      return;
    }

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");

    if (typeof window.ResizeObserver === "function") {
      resizeObserver.current = new window.ResizeObserver(() => {
        activeBounds.current = null;
      });
    }

    const deactivateCurrent = (): void => {
      const current = activeElement.current;
      if (current !== null) deactivate(current);
    };
    const activate = (element: HTMLElement): void => {
      if (activeElement.current !== element) {
        deactivateCurrent();
        activeElement.current = element;
        activeBounds.current = null;
        resizeObserver.current?.observe(element);
      }
      const registration = registrations.current.get(element);
      if (registration !== undefined) {
        setActive(element, registration.activeClassName, true);
      }
    };
    const activateFocus = (element: HTMLElement): void => {
      const registration = registrations.current.get(element);
      if (registration === undefined) return;
      activate(element);
      activeBounds.current = null;
      applyPose(element, focusPose(registration.seedPose));
    };
    const restoreFocus = (): void => {
      const focused = focusedElement.current;
      if (focused !== null && registrations.current.has(focused)) {
        activateFocus(focused);
      }
    };
    const renderPendingInteraction = (): void => {
      frame.current = null;
      const interaction = pendingInteraction.current;
      pendingInteraction.current = null;
      if (interaction === null) return;
      if (interaction.kind === "reset") {
        deactivate(interaction.element);
        restoreFocus();
        return;
      }

      let bounds = activeBounds.current;
      if (bounds === null) {
        bounds = interaction.element.getBoundingClientRect();
        activeBounds.current = bounds;
      }
      if (bounds.width <= 0 || bounds.height <= 0) return;
      applyPose(interaction.element, createFoilCardPointerPose(
        (interaction.clientX - bounds.left) / bounds.width,
        (interaction.clientY - bounds.top) / bounds.height,
      ));
    };
    const schedule = (interaction: PendingDeckInteraction): void => {
      pendingInteraction.current = interaction;
      if (frame.current === null) {
        frame.current = window.requestAnimationFrame(renderPendingInteraction);
      }
    };
    const findRegisteredSurface = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof Element)) return null;
      const surface = target.closest<HTMLElement>(delegatedSurfaceSelector);
      return surface !== null && root.contains(surface) && registrations.current.has(surface)
        ? surface
        : null;
    };
    const findRegisteredFocusSurface = (
      target: EventTarget | null,
    ): HTMLElement | null => {
      const ancestorSurface = findRegisteredSurface(target);
      if (ancestorSurface !== null) return ancestorSurface;
      if (!(target instanceof Element) || !root.contains(target)) return null;
      let match: HTMLElement | null = null;
      for (const candidate of target.querySelectorAll<HTMLElement>(
        delegatedSurfaceSelector,
      )) {
        if (!registrations.current.has(candidate)) continue;
        if (match !== null) return null;
        match = candidate;
      }
      return match;
    };
    const handlePointerMove = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse" || !motionIsEnabled(
        finePointer,
        reducedMotion,
        forcedColors,
      )) return;
      const element = findRegisteredSurface(event.target);
      if (element === null) {
        pointerElement.current = null;
        const current = activeElement.current;
        if (current !== null) schedule({ element: current, kind: "reset" });
        return;
      }
      pointerElement.current = element;
      activate(element);
      schedule({
        clientX: event.clientX,
        clientY: event.clientY,
        element,
        kind: "pointer",
      });
    };
    const handlePointerLeave = (event: PointerEvent): void => {
      if (event.pointerType !== "mouse") return;
      pointerElement.current = null;
      const current = activeElement.current;
      if (current !== null) schedule({ element: current, kind: "reset" });
    };
    const handleFocusIn = (event: FocusEvent): void => {
      if (forcedColors.matches) return;
      const element = findRegisteredFocusSurface(event.target);
      if (element === null) return;
      focusedElement.current = element;
      activateFocus(element);
    };
    const handleFocusOut = (event: FocusEvent): void => {
      const element = findRegisteredFocusSurface(event.target);
      if (element === null || focusedElement.current !== element) return;
      const next = findRegisteredFocusSurface(event.relatedTarget);
      if (next === element) return;
      focusedElement.current = next;
      if (next !== null && !forcedColors.matches) {
        activateFocus(next);
      } else if (
        activeElement.current === element
        && pointerElement.current !== element
      ) {
        deactivate(element);
      }
    };
    const invalidateBounds = (): void => {
      activeBounds.current = null;
    };
    const handleMediaChange = (): void => {
      if (!motionIsEnabled(finePointer, reducedMotion, forcedColors)) {
        pendingInteraction.current = null;
        pointerElement.current = null;
        deactivateCurrent();
        if (!forcedColors.matches) restoreFocus();
      }
    };

    root.addEventListener("pointermove", handlePointerMove, { passive: true });
    root.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    root.addEventListener("focusin", handleFocusIn);
    root.addEventListener("focusout", handleFocusOut);
    window.addEventListener("resize", invalidateBounds, { passive: true });
    window.addEventListener("scroll", invalidateBounds, { capture: true, passive: true });
    const removeMediaListeners = [
      addMediaListener(finePointer, handleMediaChange),
      addMediaListener(reducedMotion, handleMediaChange),
      addMediaListener(forcedColors, handleMediaChange),
    ];

    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      root.removeEventListener("focusin", handleFocusIn);
      root.removeEventListener("focusout", handleFocusOut);
      window.removeEventListener("resize", invalidateBounds);
      window.removeEventListener("scroll", invalidateBounds, true);
      for (const remove of removeMediaListeners) remove();
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
      pendingInteraction.current = null;
      focusedElement.current = null;
      pointerElement.current = null;
      deactivateCurrent();
      resizeObserver.current?.disconnect();
      resizeObserver.current = null;
    };
  }, [deactivate]);

  return (
    <FoilDeckContext.Provider value={contextValue}>
      <div
        {...props}
        className={cn("hraness-design-foil-card-deck", className)}
        data-foil-card-deck=""
        ref={rootRef}
      >
        {children}
      </div>
    </FoilDeckContext.Provider>
  );
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
  ornament = "none",
  preset,
  renderMode,
  seed,
}: FoilCardSurfaceProps) {
  requirePublicValue(intensity, foilCardIntensities, "intensity");
  requirePublicValue(preset, foilCardPresets, "preset");
  requirePublicValue(renderMode, foilCardRenderModes, "render mode");
  requirePublicValue(ornament, foilCardOrnaments, "ornament");
  const deck = useContext(FoilDeckContext);
  const rootRef = useRef<HTMLDivElement>(null);
  const seedPose = useMemo(() => createFoilCardSeedPose(seed), [seed]);
  const seededStyle = poseStyle(seedPose, intensity);
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
  const ornamentPresentation = stylex.props(
    styles.layer,
    styles.ornamentLayer,
    ornamentStyles[ornament],
    selectedIntensity.ornament,
  );
  const contentPresentation = stylex.props(styles.content);
  const activePresentation = stylex.props(styles.active);

  useEffect(() => {
    if (renderMode !== "interactive") return;
    const root = rootRef.current;
    if (root === null) return;
    if (deck !== null) {
      return deck.register(root, {
        activeClassName: activePresentation.className,
        seedPose,
      });
    }
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
    let pointerMotionEnabled = motionIsEnabled(
      finePointer,
      reducedMotion,
      forcedColors,
    );

    let bounds: DOMRect | null = null;
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
        setActive(root, activePresentation.className, false);
        bounds = null;
        return;
      }
      bounds ??= root.getBoundingClientRect();
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
      if (event.pointerType !== "mouse" || !pointerMotionEnabled) return;
      setActive(root, activePresentation.className, true);
      scheduleInteraction({
        clientX: event.clientX,
        clientY: event.clientY,
        kind: "pointer",
      });
    };
    const handlePointerLeave = (event: PointerEvent): void => {
      if (event.pointerType === "mouse" && pointerMotionEnabled) {
        scheduleInteraction({ kind: "pose", pose: seedPose });
      }
    };
    const handleFocusIn = (): void => {
      if (forcedColors.matches) return;
      applyPose(root, focusPose(seedPose));
      setActive(root, activePresentation.className, true);
    };
    const handleFocusOut = (event: FocusEvent): void => {
      if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
      applyPose(root, seedPose);
      setActive(root, activePresentation.className, false);
      bounds = null;
    };
    const handleMediaChange = (): void => {
      const containsFocus = document.activeElement instanceof Node
        && root.contains(document.activeElement);
      pointerMotionEnabled = motionIsEnabled(
        finePointer,
        reducedMotion,
        forcedColors,
      );
      if (pointerMotionEnabled && !forcedColors.matches) return;
      pendingInteraction = null;
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      applyPose(root, seedPose);
      setActive(root, activePresentation.className, false);
      bounds = null;
      if (containsFocus && !forcedColors.matches) {
        applyPose(root, focusPose(seedPose));
        setActive(root, activePresentation.className, true);
      }
    };

    root.addEventListener("pointermove", handlePointerMove, { passive: true });
    root.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    root.addEventListener("focusin", handleFocusIn);
    root.addEventListener("focusout", handleFocusOut);
    const removeMediaListeners = [
      addMediaListener(finePointer, handleMediaChange),
      addMediaListener(reducedMotion, handleMediaChange),
      addMediaListener(forcedColors, handleMediaChange),
    ];
    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      root.removeEventListener("focusin", handleFocusIn);
      root.removeEventListener("focusout", handleFocusOut);
      for (const remove of removeMediaListeners) remove();
      if (frame !== null) window.cancelAnimationFrame(frame);
      setActive(root, activePresentation.className, false);
    };
  }, [activePresentation.className, deck, renderMode, seedPose]);

  return (
    <div
      {...rootPresentation}
      className={cn(
        "hraness-design-foil-card-surface",
        rootPresentation.className,
        className,
      )}
      data-foil-intensity={intensity}
      data-foil-controller={deck === null ? "standalone" : "deck"}
      data-foil-ornament={ornament}
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
      <span {...ornamentPresentation} aria-hidden="true" />
    </div>
  );
}

"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  version,
} from "react";

import { joinMockupClasses, type MockupTheme } from "./core.js";

/*
 * Interactive shells for the code-built mockups. They hold selection state
 * and nothing else: every surface is a render function over plain props, so
 * the same surface renders statically in a film or a server page.
 */

// React warns about useLayoutEffect during server rendering; these shells
// measure only in the browser.
const useIsomorphicLayoutEffect: typeof useLayoutEffect = typeof document === "undefined" ? () => undefined : useLayoutEffect;

// React 18 drops unknown boolean attributes; React 19 recognizes inert as
// boolean. Keep the actual HTML attribute in both supported runtimes. The
// record describes compatibility attributes without claiming React 18's
// HTMLAttributes (or React 19's boolean-only inert prop) accepts both forms.
const inertAttribute: Readonly<Record<string, true | "">> = {
  inert: Number.parseInt(version, 10) >= 19 ? true : "",
};
const noInertAttribute: Readonly<Record<string, true | "">> = {};
function inertAttributes(inactive: boolean): Readonly<Record<string, true | "">> {
  return inactive ? inertAttribute : noInertAttribute;
}

function assertUniqueIds(items: readonly Readonly<{ id: string }>[], what: string): void {
  if (items.length === 0) throw new RangeError(`${what} needs at least one entry.`);
  const seen = new Set<string>();
  for (const item of items) {
    if (typeof item.id !== "string" || !/^[a-z0-9][a-z0-9-]*$/u.test(item.id)) {
      throw new TypeError(`${what} ids must be lowercase letters, digits, and dashes: ${JSON.stringify(item.id)}`);
    }
    if (seen.has(item.id)) throw new RangeError(`${what} ids must be unique: ${item.id}`);
    seen.add(item.id);
  }
}

function itemAt<T>(items: readonly T[], index: number, what: string): T {
  const item = items[index];
  if (item === undefined) throw new RangeError(`${what} has no entry at ${String(index)}.`);
  return item;
}

function optionalText(value: string | undefined, component: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new TypeError(`${component} text must be a string.`);
  return value.trim() || undefined;
}

/** Arrow, Home, and End move between tabs, as in the WAI-ARIA tabs pattern. */
function nextTabIndex(key: string, index: number, count: number): number | undefined {
  if (key === "ArrowRight" || key === "ArrowDown") return (index + 1) % count;
  if (key === "ArrowLeft" || key === "ArrowUp") return (index - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return undefined;
}

/* ------------------------------------------------------------------ */
/* FitToWidth                                                          */
/* ------------------------------------------------------------------ */

/**
 * Lays its child out at no less than `minWidth` pixels and scales it down to
 * fit a narrower container, so a desktop mockup stays whole on a phone
 * instead of reflowing into something no product looks like.
 */
export function FitToWidth({ children, className, minWidth = 400 }: Readonly<{ children: ReactNode; minWidth?: number; className?: string }>) {
  if (!(minWidth > 0)) throw new RangeError("FitToWidth minWidth must be positive.");
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Readonly<{ width: number; scale: number; height: number }> | null>(null);

  useIsomorphicLayoutEffect(() => {
    const stage = outer.current;
    const content = inner.current;
    if (stage === null || content === null || typeof ResizeObserver === "undefined") return undefined;
    const measure = () => {
      const available = stage.clientWidth;
      if (available <= 0) return;
      const width = Math.max(available, minWidth);
      const scale = available / width;
      const height = content.offsetHeight * scale;
      setFit((current) =>
        current !== null && current.width === width && current.scale === scale && current.height === height ? current : { height, scale, width });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(content);
    return () => observer.disconnect();
  }, [minWidth]);

  const scaled = fit !== null && fit.scale < 1;
  return (
    <div className={joinMockupClasses("hkm-fit", className)} data-hkm-min-width={minWidth} ref={outer} style={scaled ? { height: fit.height } : undefined}>
      <div
        className="hkm-fit-inner"
        data-hkm-scaled={scaled ? "" : undefined}
        ref={inner}
        style={scaled ? { transform: `scale(${fit.scale})`, width: fit.width } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ModeShowcase                                                        */
/* ------------------------------------------------------------------ */

/** One choice on a showcase axis. Add a hint only when its label needs context. */
export type ShowcaseChoice<I extends string> = Readonly<{ id: I; label: string; hint?: string }>;

/** What a surface's render function receives. */
export type ShowcaseState<M extends string, O extends string = string> = Readonly<{
  mode: M;
  /** The mode before the last change; equals `mode` until the first change. */
  previousMode: M;
  option: O | undefined;
  /** False on first paint, true after the first user change, so the first paint never animates. */
  animated: boolean;
  theme: MockupTheme | undefined;
}>;

/** One tab in a showcase. `render` returns a mockup from `@hraness/design-kit/mockups` or a product skin. */
export type ShowcaseSurface<S extends string, M extends string, O extends string = string> = Readonly<{
  id: S;
  label: string;
  /** Optional explanation of what this surface illustrates. */
  hint?: string;
  render: (state: ShowcaseState<M, O>) => ReactNode;
}>;

export type ModeShowcaseProps<S extends string, M extends string, O extends string = string> = Readonly<{
  surfaces: readonly ShowcaseSurface<S, M, O>[];
  modes: readonly ShowcaseChoice<M>[];
  /** Label before the mode buttons, such as "Show AI text as". */
  modeLabel?: string;
  /** An optional second axis, such as sensitivity. */
  options?: readonly ShowcaseChoice<O>[];
  optionLabel?: string;
  /** Modes in which the option axis does nothing; its buttons are disabled then. */
  optionInactiveModes?: readonly M[];
  initial?: Readonly<{ surface?: S; mode?: M; option?: O }>;
  /** A live line under the stage that says what the current state shows. */
  status?: (state: Readonly<{ surface: S; mode: M; option: O | undefined }>) => ReactNode;
  /** Optional context that adds to the visual. Omit repeated descriptions or generic disclaimers. */
  caption?: string;
  /** Page-window cap in natural mode; minimum complete stage height in fill mode. */
  height?: number;
  /** Reserve every authored choice at readable size, up to 128 combinations. */
  fit?: "natural" | "fill";
  /** Narrowest layout width before the stage scales down. */
  minWidth?: number;
  theme?: MockupTheme;
  /** Accessible name for the whole figure. Defaults to "Illustration of <surface>". */
  label?: (surface: ShowcaseSurface<S, M, O>) => string;
  className?: string;
}>;

/**
 * An interactive illustration: tabs pick a surface, a segmented control picks
 * a mode, and an optional second control picks an option. Tabs follow the
 * WAI-ARIA tabs pattern with automatic activation; mode and option buttons are
 * toggle buttons in labelled groups.
 */
export function ModeShowcase<S extends string, M extends string, O extends string = string>({
  caption,
  className,
  fit = "natural",
  height = 440,
  initial,
  label,
  minWidth = 400,
  modeLabel = "Mode",
  modes,
  optionInactiveModes = [],
  optionLabel = "Option",
  options,
  status,
  surfaces,
  theme,
}: ModeShowcaseProps<S, M, O>) {
  assertUniqueIds(surfaces, "ModeShowcase surface");
  assertUniqueIds(modes, "ModeShowcase mode");
  if (options !== undefined) assertUniqueIds(options, "ModeShowcase option");
  const captionText = optionalText(caption, "ModeShowcase");
  if (!Number.isFinite(height) || !(height > 0)) throw new RangeError("ModeShowcase height must be finite and positive.");
  if (fit !== "natural" && fit !== "fill") throw new RangeError("ModeShowcase fit must be natural or fill.");
  if (fit === "fill" && surfaces.length * modes.length * (options?.length ?? 1) > 128) throw new RangeError("ModeShowcase fill supports up to 128 surface, mode, and option combinations.");

  const id = useId();
  const firstSurface = surfaces.find((surface) => surface.id === initial?.surface) ?? itemAt(surfaces, 0, "ModeShowcase surfaces");
  const firstMode = modes.find((mode) => mode.id === initial?.mode) ?? itemAt(modes, 0, "ModeShowcase modes");
  const firstOption = options === undefined ? undefined : (options.find((option) => option.id === initial?.option) ?? itemAt(options, 0, "ModeShowcase options"));
  const [surfaceId, setSurfaceId] = useState<S>(firstSurface.id);
  const [mode, setMode] = useState<M>(firstMode.id);
  const [previousMode, setPreviousMode] = useState<M>(firstMode.id);
  const [option, setOption] = useState<O | undefined>(firstOption?.id);
  const [animated, setAnimated] = useState(false);
  const tabs = useRef(new Map<S, HTMLButtonElement>());

  const surface = surfaces.find((entry) => entry.id === surfaceId) ?? itemAt(surfaces, 0, "ModeShowcase surfaces");
  const modeChoice = modes.find((entry) => entry.id === mode) ?? itemAt(modes, 0, "ModeShowcase modes");
  const optionChoice = options?.find((entry) => entry.id === option);
  const optionInactive = optionInactiveModes.includes(mode);

  // Pure, nonanimated authored states reserve one maximum before any choice.
  // They stay hidden and inert; only a detached measurement clone reveals them.
  const measurements = useMemo(() => fit !== "fill" ? null : surfaces.flatMap((entry) => modes.flatMap((choice) => (options ?? [{ id: undefined }]).map((optionChoice) => (
    <div aria-hidden="true" className="hkm-mode-surface" data-hkm-measurement="" hidden {...inertAttributes(true)} key={JSON.stringify([entry.id, choice.id, optionChoice.id])}>
      <div className="hkm-fit"><div className="hkm-fit-inner">
        {entry.render({ animated: false, mode: choice.id, option: optionChoice.id, previousMode: choice.id, theme })}
      </div></div>
    </div>
  )))), [fit, modes, options, surfaces, theme]);
  const stage = useFittedShowcaseStage(fit, measurements, JSON.stringify([mode, option]), height);

  const chooseMode = (next: M) => {
    if (next === mode) return;
    setPreviousMode(mode);
    setMode(next);
    setAnimated(true);
  };
  const chooseOption = (next: O) => {
    if (next === option) return;
    setOption(next);
    setAnimated(true);
  };
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = surfaces.findIndex((entry) => entry.id === surface.id);
    const next = nextTabIndex(event.key, index, surfaces.length);
    if (next === undefined) return;
    event.preventDefault();
    const target = itemAt(surfaces, next, "ModeShowcase surfaces").id;
    setSurfaceId(target);
    tabs.current.get(target)?.focus();
  };

  const statusNode = status?.({ mode, option, surface: surface.id });
  const describeChoice = (surfaceHint: string | undefined, modeHint: string | undefined, optionHint: string | undefined) =>
    [surfaceHint, modeHint, optionHint].map((text) => optionalText(text, "ModeShowcase hint")).filter((text) => text !== undefined).join(" ");
  const hint = describeChoice(surface.hint, modeChoice.hint, optionInactive ? undefined : optionChoice?.hint);
  const hints = [...new Set(surfaces.flatMap((entry) => modes.flatMap((choice) =>
    (optionInactiveModes.includes(choice.id) ? [undefined] : (options ?? [undefined])).map((optionEntry) =>
      describeChoice(entry.hint, choice.hint, optionEntry?.hint)))))].filter((text) => text !== "");
  const hasStatus = statusNode !== undefined && statusNode !== null && statusNode !== false && statusNode !== "";
  return (
    <figure
      aria-label={label?.(surface) ?? `Illustration of ${surface.label.toLowerCase()}`}
      className={joinMockupClasses("hkm-showcase", "hkm-modes", className)}
      data-hkm-fit={fit === "fill" ? fit : undefined}
      data-hkm-theme={theme}
      data-nosnippet=""
    >
      {surfaces.length > 1 ? (
        <div aria-label="Surface" className="hkm-tabs hkm-folder-tabs" role="tablist">
          {surfaces.map((entry) => (
            <button
              aria-controls={`${id}-panel`}
              aria-selected={entry.id === surface.id}
              className="hkm-tab"
              id={`${id}-tab-${entry.id}`}
              key={entry.id}
              onClick={() => setSurfaceId(entry.id)}
              onKeyDown={onTabKey}
              ref={(element) => {
                if (element === null) tabs.current.delete(entry.id);
                else tabs.current.set(entry.id, element);
              }}
              role="tab"
              tabIndex={entry.id === surface.id ? 0 : -1}
              type="button"
            >
              {entry.label}
            </button>
          ))}
        </div>
      ) : null}
      <div
        aria-labelledby={surfaces.length > 1 ? `${id}-tab-${surface.id}` : undefined}
        className="hkm-showcase-stage hkm-mode-panel"
        id={`${id}-panel`}
        role={surfaces.length > 1 ? "tabpanel" : undefined}
        style={{ "--hkm-page-height": `${height}px` } as CSSProperties}
      >
        <div className="hkm-showcase-controls">
          <div className="hkm-showcase-settings">
            <div className="hkm-showcase-row">
              <span className="hkm-showcase-label" id={`${id}-mode`}>{modeLabel}</span>
              <div aria-labelledby={`${id}-mode`} className="hkm-segmented" role="group">
                {modes.map((entry) => (
                  <button aria-pressed={entry.id === mode} key={entry.id} onClick={() => chooseMode(entry.id)} type="button">
                    {entry.label}
                  </button>
                ))}
              </div>
            </div>
            {options === undefined ? null : (
              <div className="hkm-showcase-row">
                <span className="hkm-showcase-label" id={`${id}-option`}>{optionLabel}</span>
                <div aria-labelledby={`${id}-option`} className="hkm-segmented" role="group">
                  {options.map((entry) => (
                    <button aria-pressed={entry.id === option} disabled={optionInactive} key={entry.id} onClick={() => chooseOption(entry.id)} type="button">
                      {entry.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {hints.length === 0 ? null : (
            <div className="hkm-showcase-hints">
              <p className="hkm-showcase-hint">{hint}</p>
              {hints.filter((text) => text !== hint).map((text) => <p aria-hidden="true" className="hkm-showcase-hint" data-hkm-reserving="" {...inertAttributes(true)} key={text}>{text}</p>)}
            </div>
          )}
        </div>
        <div className="hkm-mode-stage" ref={stage}>
          {measurements}
          {surfaces.map((entry) => (
            <div
              aria-hidden={entry.id !== surface.id}
              className="hkm-mode-surface"
              data-hkm-animated={entry.id === surface.id && animated ? "" : undefined}
              data-hkm-from={entry.id === surface.id && animated ? previousMode : undefined}
              {...inertAttributes(entry.id !== surface.id)}
              key={entry.id}
            >
              <FitToWidth minWidth={fit === "fill" ? 1 : minWidth}>
                {entry.render({ animated: entry.id === surface.id && animated, mode, option, previousMode, theme })}
              </FitToWidth>
            </div>
          ))}
        </div>
      </div>
      {!hasStatus && captionText === undefined ? null : (
        <figcaption className="hkm-showcase-caption">
          {hasStatus ? <span aria-live="polite" className="hkm-showcase-status">{statusNode}</span> : null}
          {captionText === undefined ? null : <span>{captionText}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* StepThrough                                                         */
/* ------------------------------------------------------------------ */

/** One step in a step-through. `render` gets whether transitions may run. */
export type ThroughStep = Readonly<{
  id: string;
  label: string;
  /** Optional explanation beside the label, and below the preview on compact screens. */
  hint?: string;
  render: (state: Readonly<{ animated: boolean; theme: MockupTheme | undefined }>) => ReactNode;
}>;

/** Fill owns the outer shell and its top-level frames, never nested width-fit graphics. */
function panelFillFrames(stage: HTMLElement): HTMLElement[][] {
  const panels: HTMLElement[][] = [];
  for (const panel of stage.querySelectorAll<HTMLElement>(":scope > .hkm-step-panel, :scope > .hkm-mode-surface")) {
    const fit = panel.querySelector<HTMLElement>(":scope > .hkm-fit");
    if (fit === null) continue;
    const frames: HTMLElement[] = [];
    for (const root of fit.querySelectorAll<HTMLElement>(".hkm-root")) {
      const enclosingRoot = root.parentElement?.closest(".hkm-root");
      if (root.closest(".hkm-fit") === fit && (enclosingRoot === null || enclosingRoot === undefined || !fit.contains(enclosingRoot))) frames.push(root);
    }
    panels.push(frames);
  }
  return panels;
}

function fillFrames(stage: HTMLElement): HTMLElement[] {
  return panelFillFrames(stage).flat();
}

/**
 * Mark each panel's frame, and the product wrappers between it and the fit,
 * so a frame wrapped in product markup still grows to the full stage instead
 * of leaving an empty band under a shorter slide. A panel with several
 * top-level frames keeps its own arrangement.
 */
function markFillFrames(stage: HTMLElement): void {
  for (const frames of panelFillFrames(stage)) {
    for (const frame of frames) frame.setAttribute("data-hkm-fill-frame", "");
    const [frame] = frames;
    if (frames.length !== 1 || frame === undefined) continue;
    const path: HTMLElement[] = [];
    for (let node = frame.parentElement; node !== null; node = node.parentElement) {
      path.push(node);
      if (node.classList.contains("hkm-fit-inner")) break;
    }
    // Only single-column wrappers become a stack; a side-by-side product
    // layout keeps its own arrangement.
    if (path.every(stacksVertically)) for (const node of path) node.setAttribute("data-hkm-fill-path", "");
  }
}

function stacksVertically(node: HTMLElement): boolean {
  if (node.hasAttribute("data-hkm-fill-path")) return true;
  const style = getComputedStyle(node);
  if (style.display === "block" || style.display === "flow-root") return true;
  if (style.display === "grid") return style.gridTemplateColumns.trim().split(/\s+/u).length === 1;
  if (style.display === "flex") return style.flexDirection.startsWith("column");
  return false;
}

function clearFillFrames(stage: HTMLElement): void {
  for (const node of stage.querySelectorAll("[data-hkm-fill-frame], [data-hkm-fill-path]")) {
    node.removeAttribute("data-hkm-fill-frame");
    node.removeAttribute("data-hkm-fill-path");
  }
}

function presentationBodies(stage: HTMLElement): HTMLElement[] {
  return fillFrames(stage).flatMap((frame) => [...frame.querySelectorAll<HTMLElement>(':scope > .hkm-window > [data-hkm-density="presentation"]')]);
}

/** Detached clones have no ResizeObserver. Recreate explicit graphic fits from the inside out. */
function measureNestedFits(stage: HTMLElement): void {
  const fits = [...stage.querySelectorAll<HTMLElement>("[data-hkm-min-width]")].filter((fit) => fit.parentElement?.classList.contains("hkm-step-panel") !== true && fit.parentElement?.classList.contains("hkm-mode-surface") !== true);
  for (const fit of fits) {
    const inner = fit.querySelector<HTMLElement>(":scope > .hkm-fit-inner");
    if (inner === null) continue;
    fit.style.removeProperty("height");
    inner.style.removeProperty("transform");
    inner.style.width = `${Math.max(fit.clientWidth, Number(fit.dataset.hkmMinWidth))}px`;
  }
  for (const fit of fits.reverse()) {
    const inner = fit.querySelector<HTMLElement>(":scope > .hkm-fit-inner");
    if (inner === null || inner.offsetWidth <= 0) continue;
    const scale = Math.min(1, fit.clientWidth / inner.offsetWidth);
    fit.style.height = `${inner.offsetHeight * scale}px`;
    inner.style.transform = `scale(${scale})`;
  }
}

/** Measure complete mounted slides at a readable baseline, separately from fitted paint. */
function fitShowcaseStage(stage: HTMLDivElement, minimumHeight: number): void {
  const owner = stage.parentElement;
  if (owner === null || stage.clientWidth <= 0) return;
  markFillFrames(stage);
  const probe = stage.cloneNode(true) as HTMLDivElement;
  probe.setAttribute("aria-hidden", "true");
  probe.setAttribute("inert", "");
  probe.setAttribute("data-hkm-measuring", "");
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;inset:0 auto auto 0;inline-size:${stage.getBoundingClientRect().width}px;block-size:auto;`;
  for (const sentinel of probe.querySelectorAll("[data-hkm-font-sentinel]")) sentinel.remove();
  for (const node of probe.querySelectorAll("[id]")) node.removeAttribute("id");
  for (const node of probe.querySelectorAll("[data-hkm-animated]")) node.removeAttribute("data-hkm-animated");
  for (const body of presentationBodies(probe)) body.style.removeProperty("--hkm-terminal-presentation-size");
  for (const fixture of probe.querySelectorAll<HTMLElement>("[data-hkm-measurement]")) fixture.hidden = false;
  // Even a reduced-motion reset can introduce tiny all-property transitions.
  // Synchronous measurements need final styles throughout the owned copy,
  // including after the natural-height phase removes its measuring marker.
  for (const node of [probe, ...probe.querySelectorAll<HTMLElement>("*")]) {
    node.style.setProperty("transition", "none", "important");
    node.style.setProperty("animation", "none", "important");
  }
  owner.append(probe);
  try {
    measureNestedFits(probe);
    const naturalHeight = Math.max(minimumHeight, Math.ceil(probe.getBoundingClientRect().height));
    // The tallest complete slide establishes the floor. Fitted type never feeds
    // back into it, and changing the active tab never requests a measurement.
    stage.style.setProperty("--hkm-showcase-fill-height", `${naturalHeight}px`);
    probe.style.blockSize = `${naturalHeight}px`;
    probe.removeAttribute("data-hkm-measuring");
    const bodies = presentationBodies(stage).filter((body) => body.closest("[data-hkm-measurement]") === null);
    const copies = presentationBodies(probe);
    // Every authored state uses one readable size. A short terminal must not
    // become a different typographic scale when the next tab has more lines.
    let sharedSize = 4;
    for (const copy of copies) {
      const lines = [...copy.querySelectorAll<HTMLElement>(".hkm-terminal-line")];
      const wrappedRows = (line: HTMLElement) => Math.ceil((line.getBoundingClientRect().height - 0.5) / Number.parseFloat(getComputedStyle(line).lineHeight));
      const baselineRows = lines.map(wrappedRows);
      let low = 1;
      let high = 4;
      for (let attempt = 0; attempt < 9; attempt += 1) {
        const candidate = (low + high) / 2;
        copy.style.setProperty("--hkm-terminal-presentation-size", `${candidate}rem`);
        if (copy.scrollHeight <= copy.clientHeight + 1 && copy.scrollWidth <= copy.clientWidth + 1 && lines.every((line, index) => { const baseline = baselineRows[index]; return baseline !== undefined && wrappedRows(line) <= baseline; })) low = candidate;
        else high = candidate;
      }
      sharedSize = Math.min(sharedSize, low);
    }
    for (const body of bodies) body.style.setProperty("--hkm-terminal-presentation-size", `${Math.floor(sharedSize * 1000) / 1000}rem`);
    stage.setAttribute("data-hkm-fitted", "");
  } finally {
    probe.remove();
  }
}

/** Share one measurement lifecycle across surface and walkthrough selectors. */
function useFittedShowcaseStage(fit: "natural" | "fill", source: unknown, variation = "", minimumHeight = 0) {
  const stage = useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    const node = stage.current;
    if (fit !== "fill" || node === null || typeof ResizeObserver === "undefined") return undefined;
    // A rem-sized box changes even when both the document and stage are fixed.
    const fontSentinel = document.createElement("span");
    fontSentinel.setAttribute("data-hkm-font-sentinel", "");
    fontSentinel.setAttribute("aria-hidden", "true");
    fontSentinel.inert = true;
    fontSentinel.style.cssText = "position:absolute;inline-size:1rem;block-size:1rem;visibility:hidden;pointer-events:none;inset:0 auto auto 0;";
    node.append(fontSentinel);
    let previous = "";
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const key = `${node.clientWidth}/${getComputedStyle(document.documentElement).fontSize}`;
      if (key === previous) return;
      previous = key;
      fitShowcaseStage(node, minimumHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observer.observe(document.documentElement);
    observer.observe(fontSentinel);
    void document.fonts.ready.then(() => { previous = ""; measure(); });
    return () => {
      disposed = true;
      observer.disconnect();
      fontSentinel.remove();
      node.style.removeProperty("--hkm-showcase-fill-height");
      node.removeAttribute("data-hkm-fitted");
      for (const body of presentationBodies(node)) body.style.removeProperty("--hkm-terminal-presentation-size");
      clearFillFrames(node);
    };
  }, [fit, source, variation, minimumHeight]);
  return stage;
}

/**
 * A tabbed walkthrough: the steps and the preview share one edge. Compact
 * layouts attach a tab strip to the preview's top edge between Back and Next;
 * at 720px and wider the steps stack on its start edge with their
 * explanations. All render functions stay mounted to reserve the tallest
 * panel; inactive panels are inert and visually hidden. The keyboard model
 * matches `ModeShowcase`.
 */
export function StepThrough({
  caption,
  className,
  initial,
  fit = "natural",
  label = "Steps",
  minWidth = 400,
  steps,
  theme,
}: Readonly<{
  steps: readonly ThroughStep[];
  /** Fill the tallest natural slide and fit presentation terminals at one shared size. */
  fit?: "natural" | "fill";
  caption?: string;
  initial?: string;
  label?: string;
  minWidth?: number;
  theme?: MockupTheme;
  className?: string;
}>) {
  assertUniqueIds(steps, "StepThrough step");
  if (fit !== "natural" && fit !== "fill") throw new RangeError("StepThrough fit must be natural or fill.");
  const stage = useFittedShowcaseStage(fit, steps);
  // Natural walkthroughs fit by width only, but still stretch each slide's
  // frame to the shared stage height. Fill walkthroughs mark frames while fitting.
  useIsomorphicLayoutEffect(() => {
    const node = stage.current;
    if (fit === "fill" || node === null) return undefined;
    markFillFrames(node);
    return () => clearFillFrames(node);
  }, [fit, steps]);
  const captionText = optionalText(caption, "StepThrough");
  const id = useId();
  const [index, setIndex] = useState(() => Math.max(0, steps.findIndex((step) => step.id === initial)));
  const [animated, setAnimated] = useState(false);
  const [vertical, setVertical] = useState(false);
  const layout = useRef<HTMLDivElement>(null);
  const tablist = useRef<HTMLDivElement>(null);
  const tabs = useRef(new Map<number, HTMLButtonElement>());
  const current = Math.min(index, steps.length - 1);
  const hints = steps.map((entry) => optionalText(entry.hint, "StepThrough hint"));
  const currentHint = hints[current];

  useIsomorphicLayoutEffect(() => {
    const node = layout.current;
    if (node === null || typeof ResizeObserver === "undefined") return undefined;
    const measure = () => setVertical(node.clientWidth >= 720);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // A strip that cannot show every label in full keeps only the selected
  // label visible; the rest show their numbers and keep their accessible names.
  useIsomorphicLayoutEffect(() => {
    const list = tablist.current;
    if (list === null || typeof ResizeObserver === "undefined") return undefined;
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      list.removeAttribute("data-hkm-compact");
      if (vertical) return;
      const truncated = [...list.querySelectorAll<HTMLElement>(".hkm-step-label")].some((label) => label.scrollWidth > label.clientWidth + 1);
      if (truncated) list.setAttribute("data-hkm-compact", "");
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    void document.fonts.ready.then(measure);
    return () => {
      disposed = true;
      observer.disconnect();
      list.removeAttribute("data-hkm-compact");
    };
  }, [current, vertical]);

  useIsomorphicLayoutEffect(() => {
    const list = tablist.current;
    const selected = tabs.current.get(current);
    if (vertical || list === null || selected === undefined) return;
    const bounds = list.getBoundingClientRect();
    const active = selected.getBoundingClientRect();
    // Scroll only the owned strip, without moving the surrounding page.
    if (active.left < bounds.left) list.scrollLeft += active.left - bounds.left;
    else if (active.right > bounds.right) list.scrollLeft += active.right - bounds.right;
  }, [current, vertical]);

  const go = (next: number, focus = false) => {
    if (next < 0 || next >= steps.length || next === current) return;
    setIndex(next);
    setAnimated(true);
    if (focus) tabs.current.get(next)?.focus({ preventScroll: true });
  };
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (vertical && (event.key === "ArrowLeft" || event.key === "ArrowRight")) return;
    if (!vertical && (event.key === "ArrowUp" || event.key === "ArrowDown")) return;
    const next = nextTabIndex(event.key, current, steps.length);
    if (next === undefined) return;
    event.preventDefault();
    go(next, true);
  };

  return (
    <figure aria-label={`Illustration: ${label.toLowerCase()}`} className={joinMockupClasses("hkm-showcase", "hkm-steps", className)} data-hkm-fit={fit === "fill" ? fit : undefined} data-hkm-theme={theme} data-nosnippet="">
      <div className="hkm-step-layout" ref={layout}>
        <div className="hkm-showcase-controls hkm-step-controls">
          <div className="hkm-step-nav">
            <button aria-label="Back" className="hkm-step-button" disabled={current === 0} onClick={() => go(current - 1)} type="button">
              <svg aria-hidden="true" focusable="false" height="20" viewBox="0 0 24 24" width="20"><path d="m14.5 5-7 7 7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" /></svg>
            </button>
            <span aria-hidden="true" className="hkm-step-count">{current + 1} / {steps.length}</span>
            <div aria-label={label} aria-orientation={vertical ? "vertical" : "horizontal"} className="hkm-tabs hkm-step-tabs" ref={tablist} role="tablist">
              {steps.map((entry, position) => (
                <button
                  aria-controls={`${id}-panel-${entry.id}`}
                  aria-describedby={hints[position] === undefined ? undefined : `${id}-hint-${entry.id}`}
                  aria-label={entry.label}
                  aria-selected={position === current}
                  className="hkm-tab"
                  data-hkm-done={position < current ? "" : undefined}
                  id={`${id}-tab-${entry.id}`}
                  key={entry.id}
                  onClick={() => go(position)}
                  onKeyDown={onTabKey}
                  ref={(element) => {
                    if (element === null) tabs.current.delete(position);
                    else tabs.current.set(position, element);
                  }}
                  role="tab"
                  tabIndex={position === current ? 0 : -1}
                  type="button"
                >
                  <span aria-hidden="true" className="hkm-step-number">{position + 1}</span>
                  <span className="hkm-step-copy">
                    <span className="hkm-step-label">{entry.label}</span>
                    {hints[position] === undefined ? null : <span className="hkm-step-hint" id={`${id}-hint-${entry.id}`}>{hints[position]}</span>}
                  </span>
                </button>
              ))}
            </div>
            <button aria-label="Next" className="hkm-step-button" disabled={current === steps.length - 1} onClick={() => go(current + 1)} type="button">
              <svg aria-hidden="true" focusable="false" height="20" viewBox="0 0 24 24" width="20"><path d="m9.5 5 7 7-7 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" /></svg>
            </button>
          </div>
        </div>
        <div className="hkm-showcase-stage hkm-step-stage" ref={stage}>
          {steps.map((entry, position) => (
            <div
              aria-hidden={position !== current}
              aria-labelledby={`${id}-tab-${entry.id}`}
              className="hkm-step-panel"
              data-hkm-animated={position === current && animated ? "" : undefined}
              id={`${id}-panel-${entry.id}`}
              {...inertAttributes(position !== current)}
              key={entry.id}
              role="tabpanel"
              tabIndex={position === current ? 0 : -1}
            >
              {fit === "fill"
                ? <div className="hkm-fit"><div className="hkm-fit-inner">{entry.render({ animated: position === current && animated, theme })}</div></div>
                : <FitToWidth minWidth={minWidth}>{entry.render({ animated: position === current && animated, theme })}</FitToWidth>}
            </div>
          ))}
        </div>
        {hints.some((hint) => hint !== undefined) ? (
          <div aria-hidden="true" className="hkm-step-descriptions">
            {steps.map((entry, position) => <p className="hkm-step-description" data-hkm-active={position === current ? "" : undefined} key={entry.id}>{hints[position]}</p>)}
          </div>
        ) : null}
      </div>
      <span aria-live="polite" className="hkm-showcase-status hkm-step-announcement">
        Step {current + 1} of {steps.length}{currentHint === undefined ? "" : `. ${currentHint}`}
      </span>
      {captionText === undefined ? null : (
        <figcaption className="hkm-showcase-caption"><span>{captionText}</span></figcaption>
      )}
    </figure>
  );
}

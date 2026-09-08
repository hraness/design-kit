"use client";

import { AppearanceIcon, cn } from "@hraness/ui";
import * as stylex from "@stylexjs/stylex";
import { createContext, type ReactNode, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { designThemeLabel, designThemes, type DesignTheme } from "../appearance.js";
import { designPaletteSnapshot, initDesignPalette, type DesignPaletteController, type DesignPaletteSnapshot } from "../browser/design-palette.js";
import { defaultDesignPalettePreference, normalizeDesignPalettePreference, type ConcreteDesignPalettePreference, type DesignPalettePreference } from "../palette-appearance.js";
import { designPaletteLabels, designPalettes, type DesignPalette } from "../palettes.js";
import { DesignPortalThemeProvider } from "./design-theme-context.js";
import { paletteMenuStyles } from "./design-palette.stylex.js";
import type { ThemeMenuButtonProps } from "./theme.js";

export interface DesignPaletteContextValue extends DesignPaletteSnapshot {
  readonly ready: boolean;
  readonly setPreference: (preference: DesignPalettePreference) => void;
  readonly setPalette: (palette: DesignPalette) => void;
  readonly setMode: (mode: DesignTheme) => void;
}

const DesignPaletteContext = createContext<DesignPaletteContextValue | null>(null);
const noSubscribe = (): (() => void) => () => undefined;

function isNode(target: EventTarget | null): target is Node {
  return target !== null && "nodeType" in target;
}

export interface DesignPaletteProviderProps {
  readonly children: ReactNode;
  readonly defaultPreference?: DesignPalettePreference;
  readonly forcedPreference?: ConcreteDesignPalettePreference;
  readonly storageKey?: string;
  readonly legacyStorageKey?: string | null;
}

/** Opt-in appearance boundary. A product may call initDesignPalette in an external head script before hydration. */
export function DesignPaletteProvider({
  children,
  defaultPreference = defaultDesignPalettePreference,
  forcedPreference,
  storageKey,
  legacyStorageKey,
}: DesignPaletteProviderProps) {
  const fallback = useMemo(() => normalizeDesignPalettePreference(defaultPreference), [defaultPreference.palette, defaultPreference.mode]);
  const forced = useMemo(() => forcedPreference === undefined ? undefined : { ...forcedPreference }, [forcedPreference?.palette, forcedPreference?.mode]);
  const serverSnapshot = useMemo(() => designPaletteSnapshot(forced ?? fallback, false, forced !== undefined), [fallback, forced]);
  const [controller, setController] = useState<DesignPaletteController | null>(null);
  useEffect(() => {
    const current = initDesignPalette({
      defaultPreference: fallback,
      ...(forced === undefined ? {} : { forcedPreference: forced }),
      ...(storageKey === undefined ? {} : { storageKey }),
      ...(legacyStorageKey === undefined ? {} : { legacyStorageKey }),
    });
    setController(current);
    return () => { current.dispose(); };
  }, [fallback, forced, storageKey, legacyStorageKey]);
  const snapshot = useSyncExternalStore(
    controller?.subscribe ?? noSubscribe,
    controller?.getSnapshot ?? (() => serverSnapshot),
    () => serverSnapshot,
  );
  const value = useMemo<DesignPaletteContextValue>(() => ({
    ...snapshot,
    ready: controller !== null,
    setPreference: (preference) => { controller?.setPreference(preference); },
    setPalette: (palette) => { controller?.setPreference({ ...controller.getSnapshot().preference, palette }); },
    setMode: (mode) => { controller?.setPreference({ ...controller.getSnapshot().preference, mode }); },
  }), [snapshot, controller]);
  return <DesignPaletteContext.Provider value={value}>
    <DesignPortalThemeProvider portalClassName={snapshot.className} theme={snapshot.resolvedMode}>
      {children}
    </DesignPortalThemeProvider>
  </DesignPaletteContext.Provider>;
}

/** Returns null outside the opt-in provider; legacy appearance remains independent. */
export function useDesignPalette(): DesignPaletteContextValue | null {
  return useContext(DesignPaletteContext);
}

export function DesignPaletteMenuButton({
  "aria-label": ariaLabel = "Appearance",
  className,
  labels,
  size = "compact",
  onChange,
  value: controlledMode,
}: ThemeMenuButtonProps) {
  const palette = useDesignPalette();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const groupId = useId();
  useEffect(() => {
    const details = detailsRef.current;
    if (details === null) return;
    const document = details.ownerDocument;
    const outside = (event: PointerEvent): void => {
      if (details.open && isNode(event.target) && !details.contains(event.target)) details.open = false;
    };
    const escape = (event: KeyboardEvent): void => {
      if (event.key !== "Escape" || !details.open) return;
      event.preventDefault();
      details.open = false;
      details.querySelector("summary")?.focus();
    };
    document.addEventListener("pointerdown", outside);
    details.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); details.removeEventListener("keydown", escape); };
  }, []);
  if (palette === null) throw new Error("DesignPaletteMenuButton requires DesignPaletteProvider.");
  const mode = controlledMode ?? palette.preference.mode;
  const ready = palette.ready && !palette.isForced;
  const title = `${ariaLabel}: ${designPaletteLabels[palette.preference.palette]}, ${designThemeLabel(mode, labels)}`;
  return <details
    {...stylex.props(paletteMenuStyles.root)}
    className={cn("hraness-design-theme-toggle", "hraness-design-palette-menu", stylex.props(paletteMenuStyles.root).className, className)}
    data-hraness-appearance-menu=""
    data-presentation="menu"
    data-ready={ready ? "true" : "false"}
    ref={detailsRef}
    onBlur={(event) => {
      if (isNode(event.relatedTarget)
        && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
    }}
  >
    <summary
      {...stylex.props(paletteMenuStyles.trigger, size === "default" && paletteMenuStyles.triggerDefault)}
      aria-disabled={!ready || undefined}
      aria-label={title}
      onClick={(event) => { if (!ready) event.preventDefault(); }}
      tabIndex={ready ? 0 : -1}
      title={title}
    ><AppearanceIcon name={mode} xstyle={paletteMenuStyles.icon} /></summary>
    <div {...stylex.props(paletteMenuStyles.panel)}>
      <fieldset {...stylex.props(paletteMenuStyles.group)} disabled={!ready}>
        <legend {...stylex.props(paletteMenuStyles.legend)}>Theme</legend>
        {designPalettes.map((id) => <label {...stylex.props(paletteMenuStyles.choice)} key={id}>
          <input {...stylex.props(paletteMenuStyles.radio)} checked={palette.preference.palette === id} name={`${groupId}-palette`} onChange={() => palette.setPalette(id)} type="radio" value={id} />
          <span>{designPaletteLabels[id]}</span>
        </label>)}
      </fieldset>
      <fieldset {...stylex.props(paletteMenuStyles.group)} disabled={!ready}>
        <legend {...stylex.props(paletteMenuStyles.legend)}>Appearance</legend>
        {designThemes.map((id) => <label {...stylex.props(paletteMenuStyles.choice)} key={id}>
          <input {...stylex.props(paletteMenuStyles.radio)} checked={mode === id} name={`${groupId}-mode`} onChange={() => {
            if (onChange === undefined) palette.setMode(id);
            else onChange(id);
          }} type="radio" value={id} />
          <span>{designThemeLabel(id, labels)}</span>
        </label>)}
      </fieldset>
    </div>
  </details>;
}
